// This is used to crawl for feed, or rss, within the page, and if not found then search for blog or news url in the main domain and crawl that page for the rss
import {load} from 'cheerio';
// import * as fs from 'fs';
// import * as path from 'path';
import * as crawlHelpers from './crawlHelpers';
import * as crawlTypes from './crawlTypes';
import * as databaseTools from './database/databaseTools';
import {URL} from "url";

function findFeedUrl(responseData: string, sourceUrl: string): string | undefined {
    // Extracts and returns the RSS or Atom feed URL from a webpage's HTML content.
    try {
        console.log(`In findFeedUrl: ${sourceUrl}`);
        const $ = load(responseData);
        const mainSource = new URL(sourceUrl).origin;

        // Function to check if a URL matches the feed criteria
        function isFeedUrl(href: any) {
            return href && (
                href.includes('/rss') ||
                href.includes('/feed') ||
                href.endsWith('.rss') ||
                href.endsWith('.feed') ||
                href.endsWith('rss.xml') ||
                href.endsWith('feed.xml')
            ) && (
                href.startsWith(mainSource) ||
                href.startsWith('/') ||
                href.startsWith('.')
            );
        }

        // Check for standard feed types first
        let rssURL = $('link[type="application/rss+xml"]').attr('href') || $('link[type="application/atom+xml"]').attr('href');

        // If not found, check all <a> and <link> tags
        if (!rssURL) {
            $('a[href], link[href]').each((_, element) => {
                const href = $(element).attr('href');
                if (isFeedUrl(href)) {
                    rssURL = href;
                    return false; // Break the loop
                }
            });
        }

        // Convert relative RSS URL to absolute URL
        if (rssURL && !rssURL.startsWith('http://') && !rssURL.startsWith('https://')) {
            rssURL = crawlHelpers.toAbsoluteUrl(sourceUrl, rssURL);
        }
        return rssURL;
    } catch (error) {
        console.log(`Error in findFeedUrl: ${error}`);
    }
}

function extractName(sourceUrl: string): string | undefined {
    try {
        const urlObj = new URL(sourceUrl);
        let domainName = urlObj.hostname.toLowerCase();
        domainName = domainName.replace(/^www\./, '');
        const domainParts = domainName.split('.');
        return domainParts.length > 2 ? domainParts[domainParts.length - 2] : domainParts[0];
    } catch (error) {
        console.log(`Error in extractName: ${error}`);
    }
}

async function fetchSourceData(source: crawlTypes.SourceInterface, sourceUrl: string, originalUrl: string): Promise<crawlTypes.SourceInterface | undefined> {
//Fetches the HTML content of a website, saves it locally, and retrieves source information.
    try {
        console.log(`In fetchSourceData: sourceUrl: ${sourceUrl}`);
        const responseData = await crawlHelpers.fetchWithAxios(sourceUrl, 'text');
        if (responseData) {
            // const sourceName = crawlHelpers.getValidFileAndUrlName(sourceUrl);
            // const htmlDir = crawlHelpers.getSourceLogPathHtml(sourceName);
            // const htmlFileName = `${crawlHelpers.getValidFileAndUrlName(sourceUrl)}.html`;
            // const htmlPath = path.join(htmlDir, htmlFileName);
            // fs.writeFileSync(htmlPath, responseData);
            // console.log(`In fetchSourceData; Response data saved as ${htmlPath}`);

            let name = extractName(originalUrl);
            if (source.origin == 'dbEngines') {
                name = source.name ? source.name : name;
            }
            const rssURL = findFeedUrl(responseData, sourceUrl);
            return {
                id: null,
                name: name ? name : null,
                original_url: originalUrl,
                url: sourceUrl,
                rss_url: rssURL ? rssURL : null,
                origin: source.origin,
                status: 'Done',
                crawl_date: new Date().toISOString(),
                rank: null,
                tags: null,
                source_code: null,
                tech_docs: null,
                twitter: null,
                developer: null,
                country_of_origin: null,
                start_year: null,
                project_type: null,
                written_in: null,
                operating_systems: null,
                licenses: null,
                wikipedia: null
            };
        }
    } catch (error) {
        console.error(`Error in fetch source data: ${error}`);
    }
}

async function crawlSource(source: crawlTypes.SourceInterface): Promise<crawlTypes.SourceInterface> {
    console.log('In crawlSource: ', JSON.stringify(source));
    let sourceData: crawlTypes.SourceInterface = source;
    const keywords = ['blog', 'news', 'updates', 'articles', 'stories', 'journal'];

    try {
        if (sourceData && sourceData.url && sourceData.original_url) {
            const fetchData = await fetchSourceData(sourceData, sourceData.url, sourceData.original_url);
            if (fetchData) {
                sourceData = fetchData;
                if (sourceData && sourceData.url && !sourceData.rss_url) {
                    console.log('In crawlSource to find rss from other links in the page');
                    // Parse the HTML content for additional links
                    const responseData = await crawlHelpers.fetchWithAxios(sourceData.url, 'text');
                    const $ = load(responseData);
                    const mainUrl = new URL(sourceData.url).origin;
                    let links = $('a').map((_, a) => $(a).attr('href')).get();
                    links = links.map(link => {
                        return link.startsWith('http://') || link.startsWith('https://') ? link : crawlHelpers.toAbsoluteUrl(mainUrl, link);
                    });
                    links = getFilteredLinks(links);

                    // Process the filtered links
                    if (sourceData.original_url) {
                        for (let link of links) {
                            const fetchedData = await fetchSourceData(source, link, sourceData.original_url);
                            if (fetchedData && fetchedData.rss_url) {
                                console.log(`rss found for original url: ${sourceData.url} in url: ${link}, rss: ${fetchedData.rss_url}`);
                                sourceData = fetchedData;
                                return sourceData;
                            }
                        }
                    }
                }
            }
            return sourceData;
        }
    } catch (error) {
        console.error(`Error in crawlSource: ${error}`);
        return sourceData;
    }

    function getFilteredLinks(links: string[]): string[] {
        let baseBlogUrl: string = "";
        for (let link of links) {
            if (!link) continue;
            const linkUrl = new URL(link);
            const subdomain = linkUrl.hostname.split('.')[0];
            const isSubdomainKeyword = keywords.includes(subdomain) && linkUrl.hostname.indexOf('.') !== linkUrl.hostname.lastIndexOf('.');
            const pathParts = linkUrl.pathname.split('/').filter(Boolean); // Filter out empty strings
            const isPathKeyword = pathParts.length === 1 && keywords.includes(pathParts[0]) && linkUrl.pathname.endsWith('/');
            if ((isSubdomainKeyword && linkUrl.pathname === '/') || isPathKeyword) {
                baseBlogUrl = linkUrl.origin + (isPathKeyword ? '/' + pathParts[0] + '/' : '');
                break;
            }
        }
        return baseBlogUrl ? [baseBlogUrl] : [];
    }

    return sourceData;
}

async function crawlSources(sources: crawlTypes.SourceInterface[]) {
    let updatedSources: crawlTypes.SourceInterface[] = [];
    try {
        let maxConcurrentCrawls = 8;
        let index = 0;
        let synchronizer = Promise.resolve();

        // Function to process each source and resolve when done
        const processSource = async (source: crawlTypes.SourceInterface): Promise<crawlTypes.SourceInterface> => {
            return await crawlSource(source);
        };

        let threads = [];

        // Job to synchronize crawling of sources
        const job = (resolve: () => void) => {
            synchronizer = synchronizer.then(() => {
                const currentIndex = index++;
                if (currentIndex < sources.length) {
                    return processSource(sources[currentIndex]).then(updatedSource => {
                        console.log(`source ${currentIndex} crawled;  updatedSource: ${updatedSource}`);
                        updatedSources.push(updatedSource);
                        job(resolve);
                    });
                } else {
                    resolve();
                }
            });
        };


        // Create a thread for each concurrent crawl
        threads = [...Array(maxConcurrentCrawls).keys()].map(() =>
            new Promise<void>(resolve => {
                job(resolve);
            })
        );
        // Wait for all threads to finish
        await Promise.all(threads);
        return updatedSources;

    } catch (error) {
        console.log(`Error in crawlSources: ${error}`);
    }
}

async function manualCrawler(): Promise<void> {
    const startTime = new Date();
    let sources: crawlTypes.SourceInterface [] | undefined;
    try {
        console.log('In mainCrawler; start');
        await databaseTools.initDatabase();
        sources = await databaseTools.getSourcesWithNullRSS();
        if (sources && sources.length > 0) {
            sources = await crawlSources(sources);
            await databaseTools.updateSources(sources);
        }
        console.log('In mainCrawler; finish');
    } catch (error) {
        console.error(`Error in mainCrawler: ${error}`);
    } finally {
        const endTime: Date = new Date();
        const msg = `Total time taken for mainCrawler: ${(endTime.getTime() - startTime.getTime()) / 1000} seconds`;
        console.log(msg);
        await databaseTools.finalizeDatabase();
    }
}

//For getting rss of sites now available in the source table
manualCrawler();
