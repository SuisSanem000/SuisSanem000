import axios, {ResponseType} from "axios";
import * as fs from 'fs';
import * as path from 'path';
import {URL} from "url";
import * as crypto from "crypto";
import ico from 'sharp-ico';
import {PoolClient} from 'pg';
import {Buffer} from 'buffer';
import sharp from 'sharp';
import sanitizeHtml from "sanitize-html";
import he from "he";

import {Readability} from "@mozilla/readability";
import {JSDOM} from "jsdom";

import * as crawlTypes from "./crawlTypes";
import config from '../config.json';
import * as databaseInteractions from './databaseInteractions';
import {load} from "cheerio";

async function fetchWithAxios(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, url: string, responseType: ResponseType = 'text', callerFunction: string): Promise<any> {
// Fetches data from a URL using Axios and returns the response data, handling various response types.
    try {
        await addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', url, `In fetchWithAxios; callerFunction: ${callerFunction}`);
        const headers = {
            'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 Chrome/92.0.4515.159 Safari/537.36',
            // 'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0',

            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            // 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',

            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',

            'Sec-Fetch-Site': 'none',
            // 'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-Fetch-Dest': 'document',

            'Upgrade-Insecure-Requests': '1',
            'Referer': 'https://www.google.com/'

            // Critical headers that might require specific values based on the request context
            // 'Host': 'blogs.oracle.com', // The 'Host' header is typically managed by the HTTP client and matches the domain of the request URL.
            // 'Cookie': 'cookie1=value; cookie2=value; cookie3=value;', // The 'Cookie' header should be set with actual cookie values if required.
        };


        //TODO: ignore SSL certificate errors, THIS IS NOT RECOMMENDED FOR PRODUCTION USE!
        // const httpsAgent = new https.Agent({
        //     rejectUnauthorized: false // This will ignore SSL certificate errors
        // });
        // {httpsAgent}

        const response = await axios.get(url, {
            headers: headers,
            responseType: responseType,
            timeout: 30000
        });

        if (response.status === 200)
            return response.data;
    } catch (error: any) {
        await addLog(logs, 'Error', 'Network', crawlKey, sharedClient, '', '', url, `Error in fetchWithAxios; callerFunction: ${callerFunction} error: ${error}, message: ${error.message}`);
    }
}

async function downloadAndSaveImage(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, sourceUrl: string, articleUrl: string, imageUrl: string): Promise<crawlTypes.ImagesInterface | undefined> {
    try {
        let buffer: Buffer | undefined;
        let fileExtension = '';
        // Downloads and saves an article's image locally.
        if (containsDataUriTemp(imageUrl)) {
            buffer = undefined;
            const data = await readFileAsString(imageUrl);
            let result = decodeDataUriToBuffer(logs, crawlKey, sharedClient, sourceUrl, articleUrl, data);
            if (result) {
                buffer = result.buffer;
                fileExtension = result.fileExtension;
            }
        } else {
            buffer = undefined;
            const responseData = await fetchWithAxios(logs, crawlKey, sharedClient, imageUrl, 'arraybuffer', 'downloadAndSaveImage');
            if (responseData) {
                buffer = Buffer.from(responseData);
                fileExtension = getFileExtensionFromUrl(imageUrl)
            }
        }

        if (buffer) {
            const hashedImageName = crypto.randomUUID();
            const imageNameOriginal = `${hashedImageName}.${fileExtension}`;
            const sourceName = getValidFileAndUrlName(sourceUrl);
            const imageDir = path.join(getImagesPath(), sourceName);
            checkOrMakeDir(imageDir);

            // Save the original image
            let originalImageAddress: string | undefined = path.join(imageDir, imageNameOriginal);
            originalImageAddress = await writeImageFile(logs, crawlKey, sharedClient, buffer, originalImageAddress);

            let imageFileAddress1x: string | undefined;
            let imageFileAddress2x: string | undefined;

            // Do not resize if SVG, just use the same original image address for 1x and 2x
            const resizedData2x = await resizeImage(logs, crawlKey, sharedClient, buffer, 748, fileExtension);
            const imageName2x = `${hashedImageName}-2x.${fileExtension}`;
            imageFileAddress2x = path.join(imageDir, imageName2x);
            imageFileAddress2x = await writeImageFile(logs, crawlKey, sharedClient, resizedData2x, imageFileAddress2x);

            // Resize the 2x image to create a 1x image
            const resizedData1x = await resizeImage(logs, crawlKey, sharedClient, buffer, 374, fileExtension);
            const imageName1x = `${hashedImageName}-1x.${fileExtension}`;
            imageFileAddress1x = path.join(imageDir, imageName1x);
            imageFileAddress1x = await writeImageFile(logs, crawlKey, sharedClient, resizedData1x, imageFileAddress1x);

            return {
                name1x: imageFileAddress1x || null,
                name2x: imageFileAddress2x || null,
                nameOriginal: originalImageAddress || null
            };
        }
    } catch (error: any) {
        await addLog(logs, 'Error', 'IO', crawlKey, sharedClient, sourceUrl, articleUrl, imageUrl, `Error in downloadAndSaveImage; error: ${error}, message: ${error.message}`);
    }

    function containsDataUriTemp(filePath: string): boolean {
        return filePath.includes('data-uri-temp');
    }
}

async function downloadAndSaveIcons(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, sourceUrl: string, input: crawlTypes.IconsInterface, output: crawlTypes.IconsInterface) {
    const sourceDir = path.join(getIconsPath(), getValidFileAndUrlName(sourceUrl));
    try {
        await addLog(logs, 'Info', 'None', crawlKey, sharedClient, sourceUrl, '', '', `in downloadAndSaveIcons;`);
        let gotFavicon: boolean, gotOtherIcoFile: boolean = false, gotOriginalUrls: boolean = false,
            gotResize32Into16: boolean = false, gotLargest: boolean = false;
        checkOrMakeDir(sourceDir);

        gotFavicon = await getFavicon();
        if (!gotFavicon) {
            gotOtherIcoFile = await getOtherIcoFile();
            if (!gotOtherIcoFile) {
                gotOriginalUrls = await getOriginalUrls();
                if (!gotOriginalUrls) {
                    gotLargest = await getLargest();
                    if (!gotLargest)
                        gotResize32Into16 = await resize32Into16();
                }
            }
        }
        return gotFavicon || gotOtherIcoFile || gotOriginalUrls || gotResize32Into16 || gotLargest;
    } catch (error: any) {
        await addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, '', '', `Error in downloadAndSaveIcons; error: ${error}, message: ${error.message}`);
    }

    async function getFavicon(): Promise<boolean> {
        try {
            // if there is a favicon.ico file, extract and search for icon images in that
            return await downloadAndExtractIco(input.favicon);
        } catch (error: any) {
            await addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, input.address_16 ? input.address_16 : undefined, input.address_32 ? input.address_32 : undefined, `Error in getFavicon; error: ${error}, message: ${error.message}`);
            return false;
        }
    }

    async function getOtherIcoFile(): Promise<boolean> {
        try {
            // if there is another .ico file in any other place, extract and search for icon images in that
            let icoUrl: string | undefined = undefined;
            if (input.address_16 && getFileExtensionFromUrl(input.address_16) === 'ico')
                icoUrl = input.address_16
            else if (input.address_32 && getFileExtensionFromUrl(input.address_32) === 'ico')
                icoUrl = input.address_32
            else if (input.largest && input.largest.address && getFileExtensionFromUrl(input.largest.address) === 'ico')
                icoUrl = input.largest.address;
            if (icoUrl)
                return await downloadAndExtractIco(icoUrl);
            else
                return false;
        } catch (error: any) {
            await addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, input.address_16 ? input.address_16 : undefined, input.address_32 ? input.address_32 : undefined, `Error in getOtherIcoFile; error: ${error}, message: ${error.message}`);
            return false;
        }
    }

    async function getOriginalUrls(): Promise<boolean> {
        try {
            //Download 16 and 32 icon images from their original urls
            if (input.address_16) {
                const saveIconResult = await downloadAndSaveIcon(logs, crawlKey, sharedClient, input.address_16, 0, sourceDir);
                if (saveIconResult) {
                    const {iconPath} = saveIconResult;
                    output.address_16 = (iconPath && fileExists(iconPath)) ? iconPath : null;
                }
            }

            if (input.address_32) {
                const saveIconResult = await downloadAndSaveIcon(logs, crawlKey, sharedClient, input.address_32, 1, sourceDir);
                if (saveIconResult) {
                    const {iconPath} = saveIconResult;
                    output.address_32 = (path && fileExists(iconPath)) ? iconPath : null;
                }
            }
            return checkIconsExistence();
        } catch (error: any) {
            await addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, input.address_16 ? input.address_16 : undefined, input.address_32 ? input.address_32 : undefined, `Error in getOriginalUrls; error: ${error}, message: ${error.message}`);
            return false;
        }
    }

    async function getLargest(): Promise<boolean> {
        try {
            let result = false;
            if (input.largest.address) {
                const iconSaveResult = await downloadAndSaveIcon(logs, crawlKey, sharedClient, input.largest.address, 3, sourceDir);
                if (iconSaveResult) {
                    const {iconPath, size} = iconSaveResult;
                    if (iconPath && fileExists(iconPath)) {
                        output.largest.address = iconPath;
                        //When icon largest is being set from metadata, it does not have size, so it was set to -1 for indication, and here is being filled with correct size
                        if (input.largest.size <= 0) {
                            input.largest.size = size;
                        }
                        result = await extractLarge(iconPath, input.largest.size);
                    }
                }
            }
            return result;
        } catch (error: any) {
            await addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, input.address_16 ? input.address_16 : undefined, input.address_32 ? input.address_32 : undefined, `Error in getLargest; error: ${error}, message: ${error.message}`);
            return false;
        }
    }

    async function resize32Into16(): Promise<boolean> {
        // if 32 exists but 16 not exists then resize 32 into 16, and if 16 exists but 32 not exists then do let it be null
        try {
            if (input.address_32) {
                if (output.address_32 && fileExists(output.address_32) && !output.address_16) {
                    const fileExtension = getFileExtensionFromUrl(input.address_32);
                    const buffer = await readFileAsPromise(output.address_32);
                    const resizedBuffer = await resizeImage(logs, crawlKey, sharedClient, buffer, 16, fileExtension);
                    const resizedIconPath = path.join(path.dirname(output.address_32), `icon-16x16.${fileExtension}`);
                    const path16 = await writeImageFile(logs, crawlKey, sharedClient, resizedBuffer, resizedIconPath);
                    output.address_16 = (path16 && fileExists(path16)) ? path16 : null;
                }
            }
            return checkIconsExistence();
        } catch (error: any) {
            await addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, input.address_16 ? input.address_16 : undefined, input.address_32 ? input.address_32 : undefined, `Error in resize32Into16; error: ${error}, message: ${error.message}`);
            return false;
        }
    }

    //Helper functions
    async function extractLarge(iconPath: string, size: number): Promise<boolean> {
        // if file is bigger than 16 and 16path is undefined then resize to 16, if file is bigger than 32 and 32path is undefined then resize to 32
        try {
            if (!fileExists(iconPath))
                return false;

            const buffer = await readFileAsPromise(iconPath);
            if (buffer) {
                const fileExtension = getFileExtensionFromUrl(iconPath);

                if (!output.address_16 && size >= 16) {
                    const resizedBuffer16 = await resizeImage(logs, crawlKey, sharedClient, buffer, 16, fileExtension);
                    const resizedIconPath = path.join(sourceDir, `icon-${16}x${16}.${fileExtension}`);
                    const path16 = await writeImageFile(logs, crawlKey, sharedClient, resizedBuffer16, resizedIconPath);
                    output.address_16 = (path16 && fileExists(path16)) ? path16 : null;
                }

                if (!output.address_32 && size >= 32) {
                    const resizedBuffer32 = await resizeImage(logs, crawlKey, sharedClient, buffer, 32, fileExtension);
                    const resizedIconPath = path.join(sourceDir, `icon-${32}x${32}.${fileExtension}`);
                    const path32 = await writeImageFile(logs, crawlKey, sharedClient, resizedBuffer32, resizedIconPath);
                    output.address_32 = (path32 && fileExists(path32)) ? path32 : null;
                }
            }
            return checkIconsExistence();
        } catch (error: any) {
            await addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, '', iconPath, `Error in extractLarge (iconPath); error: ${error}, message: ${error.message}`);
            return false;
        }
    }

    async function downloadAndExtractIco(icoUrl: string): Promise<boolean> {
        // download the ico file and if downloaded and saved successfully then extract icons, and if the result is false and if a large icon exists extracted files by resizing it
        try {
            let result = false;
            const saveIconResult = await downloadAndSaveIcon(logs, crawlKey, sharedClient, icoUrl, 2, sourceDir);
            if (saveIconResult) {
                const {iconPath} = saveIconResult;
                if (!fileExists(iconPath)) {
                    return result;
                }
                if (iconPath) {
                    const data = await readFileAsPromise(iconPath);
                    const sharpIcons = ico.sharpsFromIco(data);
                    let largestSize = 0;
                    let largestPath = '';

                    for (let i = 0; i < sharpIcons.length; i++) {
                        const sharpInstance = sharpIcons[i];
                        // @ts-ignore
                        const metadata = await sharpInstance.metadata();
                        if (metadata.width && metadata.height) {
                            const size = `${metadata.width}x${metadata.height ? metadata.height : metadata.width}`;
                            const outputPath = path.join(sourceDir, `icon-${size}.png`);
                            // @ts-ignore
                            await sharpInstance.toFile(outputPath);
                            if (metadata.width === 16) {
                                output.address_16 = outputPath;
                            } else if (metadata.width === 32) {
                                output.address_32 = outputPath;
                            } else if (metadata.width > largestSize) {
                                largestSize = metadata.width;
                                largestPath = outputPath;
                            }
                        }
                    }
                    if (output.address_16 && output.address_32)
                        result = true;
                    else
                        result = await extractLarge(largestPath, largestSize);
                }
            }
            return result;
        } catch (error: any) {
            await addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, '', icoUrl, `Error in downloadAndExtractIco; error: ${error}, message: ${error.message}`);
            return false;
        }
    }

    async function downloadAndSaveIcon(logs: any[], crawlKey: string, sharedClient: any, iconUrl: string, index: number, sourceDir: string): Promise<any | undefined> {
        //This only download and saves from a URL
        try {
            let iconSizeAppendix;
            switch (index) {
                case 0:
                    iconSizeAppendix = '16';
                    break;
                case 1:
                    iconSizeAppendix = '32';
                    break;
                case 2:
                    iconSizeAppendix = 'favicon';
                    break;
                case 3:
                    iconSizeAppendix = 'largest';
                    break;
            }

            const iconName = `icon-${iconSizeAppendix}.${getFileExtensionFromUrl(iconUrl)}`;
            const iconPath = path.join(sourceDir, iconName);

            const responseData = await fetchWithAxios(logs, crawlKey, sharedClient, iconUrl, 'arraybuffer', 'downloadAndSaveIcon');
            if (responseData) {
                const buffer = Buffer.from(responseData);
                let size: number | undefined = -1;
                if (index === 3) {
                    // Use sharp to get the image dimensions
                    const image = sharp(buffer);
                    const metadata = await image.metadata();
                    size = metadata.width;
                }
                await writeImageFile(logs, crawlKey, sharedClient, buffer, iconPath);
                return {iconPath, size};
            }
        } catch (error: any) {
            await addLog(logs, 'Error', 'IO', crawlKey, sharedClient, sourceUrl, '', iconUrl, `Error in downloadAndSaveIcon; error: ${error}, message: ${error.message}`);
        }
    }

    function checkIconsExistence(): boolean {
        const address16Exists = !!output.address_16 && fileExists(output.address_16);
        const address32Exists = !!output.address_32 && fileExists(output.address_32);
        return address16Exists && address32Exists;
    }

    function fileExists(filename: string | null | undefined): boolean {
        return !!filename && fs.existsSync(filename);
    }
}

async function writeImageFile(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, buffer: Buffer, imageFileAddress: string): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve, reject) => {
        fs.writeFile(imageFileAddress, buffer, (error) => {
            if (error) {
                addLog(logs, 'Error', 'IO', crawlKey, sharedClient, '', '', '', `In writeImageFile; error: ${error}, message: ${error.message}`);
                reject(error);
            } else {
                addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In writeImageFile; Image successfully written to ${imageFileAddress}`);
                resolve(imageFileAddress);
            }
        });
    });
}

async function resizeImage(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, buffer: Buffer, maxSize: number, fileExtension: string): Promise<Buffer> {
    await addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In resizeImage');

    return new Promise((resolve, reject) => {
        if (fileExtension === 'svg' || fileExtension === 'ico') {
            addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In resizeImage; ${fileExtension} file, no resizing needed`);
            resolve(buffer);
        } else {
            sharp(buffer)
                .resize({
                    width: maxSize,
                    height: maxSize,
                    fit: sharp.fit.inside,
                    withoutEnlargement: true
                })
                .png({
                    quality: 100,
                    compressionLevel: 0
                })
                .toBuffer((error, resizedBuffer) => {
                    if (error) {
                        addLog(logs, 'Error', 'IO', crawlKey, sharedClient, '', '', '', `Error in resizeImage; error: ${error}, message: ${error.message}`);
                        reject(error);
                    } else {
                        addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In resizeImage; Image successfully resized');
                        resolve(resizedBuffer);
                    }
                });
        }
    });
}

function readFileAsPromise(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

async function readFileAsString(filePath: string): Promise<string> {
    return await fs.readFileSync(filePath, 'utf-8');
}

function cleanUrl(url: string): string {
// Cleans a URL by removing search parameters and fragments, returning the cleaned URL.
    const trimmedUrl = url.trim(); // Trim any whitespace
    const urlObj = new URL(trimmedUrl);
    return urlObj.origin + urlObj.pathname;
}

function getValidFileAndUrlName(input: string): string {
    let result = input;
    if (isUrl(result)) {
        result = cleanUrl(result).replace(/https?:\/\/|www\.|\.com\b/g, "");
    }
    return result.toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function isUrl(input: string): boolean {
// Checks if a given input is a valid URL.
    try {
        new URL(input);
    } catch {
        return false;
    }
    return true;
}

function toAbsoluteUrl(baseUrl: string, relativeUrl: string): string {
    // Check if the relative URL is actually protocol-relative.
    if (relativeUrl.startsWith('//')) {
        const protocol = new URL(baseUrl).protocol; // Extract the protocol from the base URL
        return `${protocol}${relativeUrl}`; // Return the full URL with the protocol and the protocol-relative part
    }

    // For other cases, convert the relative URL to an absolute URL using the base URL.
    return new URL(relativeUrl, baseUrl).toString();
}

function isAbsoluteUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') && urlObj.hostname !== ''; // Check if the protocol is 'http:' or 'https:' and if the hostname is non-empty
    } catch (e) {
        return false; // The URL constructor will have a TypeError if the URL is invalid or incomplete
    }
}

function getFaviconUrl(url: string): string {
    // Construct a new URL for the favicon using the origin of the input URL
    const urlObj = new URL(url);
    return `${urlObj.origin}/favicon.ico`;
}

async function htmlToPlainText(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, html: string): Promise<string | undefined> {
    try {
        //Converts HTML content to plain text by removing HTML tags and decoding HTML entities, to clean up summary text of rss feed items for each blog article
        const textOnly = sanitizeHtml(html, {
            allowedTags: [], // No tags allowed, remove all
            allowedAttributes: {}, // No attributes allowed
        });
        return he.decode(textOnly); //decode HTML entities
    } catch (error: any) {
        await addLog(logs, 'Error', 'Parse', crawlKey, sharedClient, '', '', '', `Error in htmlToPlainText: ${html.slice(0, 25)}, error: ${error.message}`);
    }
}

function getCurrentUTCDate(): Date {
    //Returns the current date and time in UTC as a JavaScript Date object.
    return new Date();
}

function checkOrMakeDir(dir: string) {
    //Make dir if not exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
}

async function addLog(logs: crawlTypes.LogInterface[], logType: crawlTypes.LogType, errorType: crawlTypes.ErrorType, crawlKey: string, sharedClient: PoolClient | null, sourceUrl: string | undefined, articleUrl: string | undefined, url: string | undefined, message: string, skipDBInsert?: boolean) {

    const log: crawlTypes.LogInterface = {
        id: 0, key: '', created_at: '', updated_at: '',
        crawl_key: crawlKey,
        url: url,
        source_url: sourceUrl,
        article_url: articleUrl,
        log_type: logType,
        error_type: errorType,
        message: message,
        timestamp: new Date().toISOString(),
    };

    const {id, key, created_at, updated_at, ...rest} = log;
    console.log(JSON.stringify(rest));

    if ((config.logLevel === 'Error' && logType !== 'Error') || (config.logLevel === 'Info' && logType !== 'Info'))
        return;

    logs.push(log);

    if (skipDBInsert)
        return;

    await databaseInteractions.insertLog(logs, crawlKey, sharedClient, log);
}

function getLogPath(): string {
    const dir = path.join(config.log_path);
    checkOrMakeDir(dir);
    return dir;
}

function getSourceLogPathHtml(sourceName: string): string {
    const dir = path.join(config.source_log_path, sourceName, 'html');
    checkOrMakeDir(dir);
    return dir;
}

function getSourceLogPathRss(sourceName: string): string {
    const dir = path.join(config.source_log_path, sourceName, 'rss');
    checkOrMakeDir(dir);
    return dir;
}

function getImagesPath(): string {
    const dir = path.join(config.images_path);
    checkOrMakeDir(dir);
    return dir;
}

function getTempDataPath(): string {
    const dir = path.join(config.temp_data_path);
    checkOrMakeDir(dir);
    return dir;
}

function getContentPath(): string {
    const dir = path.join(config.content_path);
    checkOrMakeDir(dir);
    return dir;
}

function getIconsPath(): string {
    const dir = path.join(config.icons_path);
    checkOrMakeDir(dir);
    return dir;
}

function getJsonPath(): string {
    const dir = path.join(config.json_path);
    checkOrMakeDir(dir);
    return dir;
}

function getFileExtensionFromUrl(url: string): string {
    const extensionMatch = url.match(/\.(gif|jpeg|jpg|png|webp|bmp|eps|pdf|psd|tiff|svg|ai|heif|indd|jpeg2000|xcf|ico|apng|exif|bpg|hdr|tga|dib|pict|cdr|wmf|emf|raw|cr2|nef|orf|sr2|raf|dng|arw|ptx|pef|dxf|cgm)(?=[?#]|$)/i);
    const result = extensionMatch ? extensionMatch[0].substring(1) : 'png';
    return result.toLowerCase();
}


async function saveAllSources(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, jsonPath: string, sources: crawlTypes.SourceInterface[]): Promise<void> {
    // Fetches all sources from the database and saves them to a JSON file.
    try {
        await addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In saveAllSources`);
        const filePath = path.join(jsonPath, 'sources.json');

        // Map through sources and remove specific attributes
        const sourcesWithoutSpecificAttributes = sources.map(({
                                                                  id,
                                                                  last_build_date,
                                                                  crawl_key,
                                                                  original_url,
                                                                  rss_url,
                                                                  icon_16_url,
                                                                  icon_32_url,
                                                                  icon_largest_url,
                                                                  status,
                                                                  ...rest
                                                              }) => rest);

        fs.writeFileSync(filePath, JSON.stringify(sourcesWithoutSpecificAttributes, null, 2), {flag: 'w'});
    } catch (error: any) {
        await addLog(logs, 'Error', 'IO', crawlKey, sharedClient, '', '', '', `Error in saveAllSources; error: ${error}, message: ${error.message}`);
    }
}

async function saveArticlesOfDate(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, jsonPath: string, articles: crawlTypes.SourceArticleInterface[]): Promise<string | undefined> {
    try {
        const published_date: string = getDatePart(articles[0].articles[0].published_date);
        const filePath = path.join(jsonPath, `${published_date}.json`);
        const transformedData = articles.map(sourceArticle => {
            // Destructure to exclude properties from the source root object
            const {
                id,
                last_build_date,
                crawl_key,
                url,
                original_url,
                rss_url,
                icon_16_url,
                icon_32_url,
                icon_largest_url,
                icon_largest_path,
                status,
                ...sourceWithoutExcludedProps
            } = sourceArticle.source;


            return {
                ...sourceWithoutExcludedProps,
                day_price: sourceArticle.day_price,
                articles: sourceArticle.articles.map(article => {
                    // Destructure to exclude properties from each article
                    const {
                        updated_at,
                        crawl_key,
                        source_key,
                        original_url,
                        image_url,
                        content,
                        next_retry_at,
                        ...articleWithoutExcludedProps
                    } = article;

                    return {
                        ...articleWithoutExcludedProps,
                        published_date: article.published_date.toISOString()
                    };
                })
            };
        });

        fs.writeFileSync(filePath, JSON.stringify(transformedData, null, 2), {flag: 'w'});
        return filePath;
    } catch (error: any) {
        await addLog(logs, 'Error', 'IO', crawlKey, sharedClient, '', '', '', `Error in saveArticlesOfDate; error: ${error}, message: ${error.message}`);
    }
}

function getDatePart(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

async function saveCrawlDates(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, articlesPublishDates: string[], jsonPath: string): Promise<string | undefined> {
    try {
        const filePath = path.join(jsonPath, 'crawl-dates.json');
        fs.writeFileSync(filePath, JSON.stringify(articlesPublishDates, null, 2), {flag: 'w'});
        await addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In saveFirstCrawlDate;  saveFirstCrawlDate.json have been saved to ${filePath}`);
        return filePath;
    } catch (error: any) {
        await addLog(logs, 'Error', 'IO', crawlKey, sharedClient, '', '', '', `Error in saveFirstCrawlDate; error: ${error}, message: ${error.message}`);
    }
}

async function getArticleContent(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, htmlData: string, articleUrl: string,): Promise<string | undefined> {
    try {
        await addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', articleUrl, '', `In getArticleContent`);

        // Sanitize HTML to remove problematic content
        const sanitizedHtml = sanitizeHtml(htmlData, {
            allowedTags: sanitizeHtml.defaults.allowedTags,
            allowedAttributes: false,
            allowedSchemes: sanitizeHtml.defaults.allowedSchemes
        });

        const dom = new JSDOM(sanitizedHtml, {url: articleUrl});
        const reader = new Readability(dom.window.document);

        //Other article properties: byLine, dir, excerpt, lang, publishedTime, publishedTime, siteName, textContent, title
        const article = reader.parse();
        if (article)
            return article.textContent ?? undefined;
    } catch (error: any) {
        await addLog(logs, 'Error', 'IO', crawlKey, sharedClient, '', '', '', `Error in getArticleContent; error: ${error}, message: ${error.message}`);
    }
}

async function getAndSaveAffectedArticlesByCrawl(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, publishedDates: Date[]): Promise<void> {
    try {
        //Gets and saves articles for each unique published date associated with a specific crawl key
        await addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In getAndSaveAffectedArticlesByCrawl; publishedDates: ${publishedDates}`);
        for (const publishedDate of publishedDates) {
            const articles: crawlTypes.SourceArticleInterface[] | undefined = await databaseInteractions.getArticlesOfDate(logs, crawlKey, sharedClient, publishedDate);
            await addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In getAndSaveAffectedArticlesByCrawl; articles.length: ${articles?.length}`);
            if (articles) {
                await saveArticlesOfDate(logs, crawlKey, sharedClient, getJsonPath(), articles);
            }
        }
    } catch (error: any) {
        await addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, '', '', '', `Error in getAndSaveAffectedArticlesByCrawl; error: ${error}, message: ${error.message}`);
    }
}

async function getAndSaveCrawlDates(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): Promise<string | undefined> {
//Gets and saves first date article exists
    try {
        await addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In getAndSaveFirstCrawlDate`);
        const articlesPublishDates = await databaseInteractions.getArticlesPublishDates(logs, crawlKey, sharedClient);
        if (articlesPublishDates)
            return await saveCrawlDates(logs, crawlKey, sharedClient, articlesPublishDates, getJsonPath());
    } catch (error: any) {
        await addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, '', '', '', `Error in getAndSaveFirstCrawlDate; error: ${error}, message: ${error.message}`);
    }
}

async function getAndSaveValidSources(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): Promise<void> {
    try {
        await addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `in getAndSaveValidSources`);
        const sources = await databaseInteractions.getValidSources(logs, crawlKey, sharedClient);
        if (sources) {
            await saveAllSources(logs, crawlKey, sharedClient, getJsonPath(), sources);
        }
    } catch (error: any) {
        await addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, '', '', '', `Error in getAndSaveValidSources; error: ${error}, message: ${error.message}`);
    }
}

async function extractArticleHtmlDetails(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, article: crawlTypes.ArticleInterface, sourceUrl: string | undefined): Promise<string | undefined> {

    //Extracts the URL and alt text of an image from a blog article
    await addLog(logs, 'Info', 'None', crawlKey, sharedClient, sourceUrl, article.url, '', `In extractArticleHtmlDetails`);

    const extractImageUrl = ($: cheerio.Root) => $('meta[property="og:image"]').attr('content') || undefined;

    const extractImageAlt = ($: cheerio.Root) => $('meta[property="og:image:alt"]').attr('content') || undefined;

    const extractSummary = ($: cheerio.Root) => {
        return $('meta[property="og:description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            undefined;
    };

    try {
        if (article.content && article.image_url && article.image_alt && article.summary)
            return article.content;

        if (!article.content) {
            const responseData = await fetchWithAxios(logs, crawlKey, sharedClient, article.url, 'text', 'extractArticleHtmlDetails');
            if (responseData && sourceUrl) {
                const $ = load(responseData);

                // Save article content in a file and save the address in the field
                article.content = await getArticleContent(logs, crawlKey, sharedClient, responseData, article.url) ?? null;
                if (article.content) {
                    const sourceName = getValidFileAndUrlName(sourceUrl);
                    const dirPath = path.join(getContentPath(), sourceName);
                    checkOrMakeDir(dirPath);
                    const hashedFileName = crypto.randomUUID();
                    const filePath = path.join(dirPath, `${hashedFileName}.txt`);
                    if (saveStringToFile(filePath, article.content))
                        article.content = filePath
                    else
                        article.content = null;
                }

                //If imageUrl is a data-uri, save it in a file and save the address in the field
                article.image_url = extractImageUrl($) ?? null;
                if (article.image_url) {
                    if (isDataUri(article.image_url)) {
                        let dirPath = path.join(getTempDataPath(), 'data-uri-temp');
                        const sourceName = getValidFileAndUrlName(sourceUrl);
                        dirPath = path.join(dirPath, sourceName);
                        checkOrMakeDir(dirPath);
                        const hashedFileName = crypto.randomUUID();
                        const filePath = path.join(dirPath, `${hashedFileName}.txt`);
                        if (saveStringToFile(filePath, article.image_url))
                            article.image_url = filePath
                        else
                            article.image_url = null;
                    } else if (article.image_url && !isAbsoluteUrl(article.image_url))
                        article.image_url = toAbsoluteUrl(sourceUrl, article.image_url);
                    article.image_alt = extractImageAlt($) ?? null;
                }
                article.summary = article.summary ?? (extractSummary($) ?? null);
            }
            return responseData;
        }

    } catch (error: any) {
        await addLog(logs, 'Error', 'Parse', crawlKey, sharedClient, sourceUrl, article.url, '', `Error in extractArticleHtmlDetails; error: ${error}, message: ${error.message}`);
    }
}

function handleUncoughtExceptions(logs: crawlTypes.LogInterface[]) {

    process.on('uncaughtException', (error: any) => {
        addLog(logs, 'Error', 'Crawl', '', null, '', '', '', `Error in handleUncoughtExceptions; error: ${error}, message: ${error.message}`, true);
    });

    process.on('unhandledRejection', (reason: any) => {
        addLog(logs, 'Error', 'Crawl', '', null, '', '', '', `Error in unhandledRejection; reason: ${reason}`, true);
    });

}

async function getArticleDetails(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, article: crawlTypes.ArticleInterface, downloadImage: boolean, sourceUrl: string | undefined): Promise<any | undefined> {
    try {
        await addLog(logs, 'Info', 'None', crawlKey, sharedClient, sourceUrl, article.url, '', `in getArticleDetails;`);

        if (article.content && article.image_url && article.image_alt && article.summary)
            return article.content;

        const htmlData = await extractArticleHtmlDetails(logs, crawlKey, sharedClient, article, sourceUrl);
        article.original_summary = article.original_summary ?? article.summary;
        article.summary = article.summary ? (await htmlToPlainText(logs, crawlKey, sharedClient, article.summary) ?? article.summary) : null;

        if (article.image_url && !article.image_path) {
            let images: crawlTypes.ImagesInterface | undefined = (sourceUrl && article.image_url && downloadImage) ? await downloadAndSaveImage(logs, crawlKey, sharedClient, sourceUrl, article.url, article.image_url) : undefined;
            article.image_path = images?.name1x ?? null;
            article.image_path_2x = images?.name2x ?? null;
        }
        article.status = htmlData ? (article.image_url ? ((article.image_path && article.image_path_2x) ? "Done" : "Pending") : "Done") : "Pending";
        return htmlData;
    } catch (error: any) {
        await addLog(logs, 'Error', 'IO', crawlKey, sharedClient, sourceUrl, article.url, '', `Error in getArticleDetails; error: ${error}, message: ${error.message}`);
    }
}

function isDataUri(imageUrl: string): boolean {
    const dataUriPattern = /^data:/i;  // Data URIs start with "data:"
    return dataUriPattern.test(imageUrl);
}

function decodeDataUriToBuffer(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, sourceUrl: string, articleUrl: string, dataUri: string): {
    buffer: Buffer,
    mediaType: string,
    fileExtension: string
} | undefined {
    try {
        const matches: RegExpMatchArray | null = dataUri.match(/^data:(image\/[^;]+)(;base64)?,(.*)$/i);
        if (!matches)
            return undefined;
        const mediaType: string = matches[1];
        const isBase64: boolean = matches[2] !== undefined;
        const data: string = matches[3];
        let fileExtension: string = mediaType.split('/')[1];
        fileExtension = fileExtension === 'svg+xml' ? 'svg' : fileExtension;
        let buffer: Buffer;
        if (isBase64)
            buffer = Buffer.from(data, 'base64');
        else
            buffer = Buffer.from(decodeURIComponent(data), 'utf-8');
        return {buffer, mediaType, fileExtension};
    } catch (error: any) {
        addLog(logs, 'Error', 'IO', crawlKey, sharedClient, sourceUrl, articleUrl, undefined, `Error in decodeDataUriToBuffer; error: ${error}, message: ${error.message}`);
    }
}

function saveStringToFile(filePath: string, data: string): boolean {
    try {
        fs.writeFileSync(filePath, data, 'utf8');
        return true;
    } catch (error) {
        return false;
    }
}

export {
    fetchWithAxios,
    downloadAndSaveIcons,
    downloadAndSaveImage,
    cleanUrl,
    isUrl,
    getValidFileAndUrlName,
    toAbsoluteUrl,
    isAbsoluteUrl,
    getFaviconUrl,
    htmlToPlainText,
    getCurrentUTCDate,
    saveAllSources,
    saveArticlesOfDate,
    addLog,
    checkOrMakeDir,
    getLogPath,
    getDatePart,
    getSourceLogPathHtml,
    getSourceLogPathRss,
    getImagesPath,
    getIconsPath,
    getJsonPath,
    getFileExtensionFromUrl,
    saveCrawlDates,
    getArticleContent,
    getAndSaveAffectedArticlesByCrawl,
    getAndSaveCrawlDates,
    getAndSaveValidSources,
    extractArticleHtmlDetails,
    handleUncoughtExceptions,
    getArticleDetails,
    getContentPath,
    saveStringToFile,
    readFileAsString
};