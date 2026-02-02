import axios, {ResponseType} from "axios";
import * as fs from 'fs';
import config from '../config.json';
import {URL} from "url";
import path from "path";

async function fetchWithAxios(url: string, responseType: ResponseType = 'text'): Promise<any> {
// Fetches data from a URL using Axios and returns the response data, handling various response types.
    try {
        console.log(`In fetchWithAxios(); url: ${url}`);
        const headers = {
            'User-Agent': 'MyRSSReaderBot',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
            'Pragma': 'no-cache',
            'Accept-Encoding': 'gzip, deflate, br',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-Fetch-Dest': 'document'
            //TODO: for downloading blog images maybe needed
            // Referrer Policy: The `Referrer` header indicates the URL of the webpage that linked to the resource being requested. Some websites may check the referrer for security reasons.
        };

        const response = await axios.get(url, {
            headers: headers,
            timeout: 5000,
            responseType: responseType
        });

        if (response.status === 200) {
            return response.data;
        } else {
            console.log(`Error in fetchWithAxios(); Request failed with status code ${response.status}`)
        }
    } catch (error) {
        console.log(`Error in fetchWithAxios();  Error: ${error}`);
    }
}

function cleanUrl(url: string): string {
// Cleans a URL by removing search parameters and fragments, returning the cleaned URL.
    const urlObj = new URL(url);
    return urlObj.origin + urlObj.pathname;
}

function getValidFileAndUrlName(input: string): string {
    let result = input;
    if (isUrl(result)) {
        result = cleanUrl(result);
        result = result.replace(/https?:\/\//i, ""); // Remove protocols without removing 'www.'
    }
    let fileName = result.toLowerCase(); // Convert to lowercase
    fileName = fileName.replace(/\./g, "-"); // Replace periods with hyphens
    fileName = fileName.replace(/[^a-z0-9]/g, "-"); // Replace all non-alphanumeric characters with hyphens
    fileName = fileName.replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
    fileName = fileName.replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
    return fileName;
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
// Converts a relative URL to an absolute URL using a base URL.
    return new URL(relativeUrl, baseUrl).toString();
}

function checkOrMakeDir(dir: string) {
//Make dir if not exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }
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

export {
    fetchWithAxios,
    cleanUrl,
    isUrl,
    getValidFileAndUrlName,
    toAbsoluteUrl,
    checkOrMakeDir,
    getLogPath,
    getSourceLogPathHtml,
    getSourceLogPathRss
};