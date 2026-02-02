import {load} from 'cheerio';
import {URL} from 'url';

const FeedParser = require('feedparser');
import {PoolClient} from 'pg';

import * as databaseInteractions from './databaseInteractions';
import * as crawlHelpers from './crawlHelpers';
import * as updatesHelpers from './updatesHelpers';
import * as crawlTypes from './crawlTypes';
import config from '../config.json';

//Directories with no filter
import * as lobstersCrawlHelper from './customCrawlers/directories/lobstersCrawlHelper';

//Directories with AI filter
import * as hackerNewsCrawlHelper from './customCrawlers/directories/hackerNewsCrawlHelper';

//Custom crawlers
import * as splunkCrawlHelper from './customCrawlers/splunkCrawlHelper';
import * as cassandraCrawlHelper from './customCrawlers/cassandraCrawlHelper';
import * as mongodbCrawlHelper from './customCrawlers/mongodbCrawlHelper';
import * as sqliteCrawlHelper from './customCrawlers/sqliteCrawlHelper';
import * as cockroachCrawlHelper from './customCrawlers/cockroachCrawlHelper';
import * as customCrawlHelpers from "./customCrawlers/customCrawlHelpers";
import * as openAIWorker from "./AI/openAIWorker";

let crawlKey: string = '';
let startDate: Date;
const logs: crawlTypes.LogInterface[] = [];

async function fetchSourceData(sharedClient: PoolClient | null, type: crawlTypes.SourceType, sourceUrl: string, rssUrl: string | null, icons: crawlTypes.IconsInterface): Promise<crawlTypes.SourceInterface | undefined> {
    try {
        //Fetches the HTML content of a source, saves it locally, and retrieves source information.
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, sourceUrl, rssUrl ? rssUrl : undefined, undefined, `In fetchSourceData;`);
        const originalUrl = sourceUrl;
        let responseData = await crawlHelpers.fetchWithAxios(logs, crawlKey, sharedClient, sourceUrl, 'text', 'fetchSourceData');
        if (responseData) {
            icons.address_16 = null;
            icons.address_32 = null;
            icons.favicon = crawlHelpers.getFaviconUrl(sourceUrl);
            icons.largest = {size: 0, address: null};

            const name = extractName(responseData, sourceUrl);
            let calcRssURL: string | undefined;
            if (!rssUrl)
                calcRssURL = findFeedUrl(responseData, sourceUrl);
            await findIconsForSource(responseData);

            return {
                id: 0,
                created_at: "",
                updated_at: "",
                icon_16_path: "",
                icon_32_path: "",
                icon_largest_path: "",
                key: "",
                last_build_date: "",
                icon_16_url: null,
                icon_32_url: null,
                icon_largest_url: null,
                crawl_key: crawlKey,
                name: name ? name : null,
                url: crawlHelpers.cleanUrl(sourceUrl),
                original_url: originalUrl,
                rss_url: rssUrl ?? calcRssURL ?? null,
                type: type || "Website",
                status: "Done" //will be filled properly based on the necessities of the entry like image in the parent function
            };
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Network', crawlKey, sharedClient, sourceUrl, '', rssUrl ? rssUrl : undefined, `Error in fetchSourceData; error: ${error}, message: ${error.message}, stack: ${error.stack}`);
    }

    function extractName(responseData: string, sourceUrl: string): string | undefined {
        const delimiters = ['\\|', ':', '–', '—', '·', '•', '«', '»', '\\.', ',', '·', '-'];

        function findShortestOverlap(titleParts: string[], domainParts: string[]): string {
            let shortestOverlap = '';
            let shortestLength = Infinity;
            titleParts.forEach(titlePart => {
                domainParts.forEach(domainPart => {
                    if (titlePart.toLowerCase().includes(domainPart.toLowerCase())) {
                        if (titlePart.length < shortestLength) {
                            shortestOverlap = titlePart;
                            shortestLength = titlePart.length;
                        }
                    }
                });
            });
            return shortestOverlap;
        }

        function capitalizeWords(words: string[]): string {
            return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }

        const $ = load(responseData);
        const title = $('title').text().trim();
        const titleParts = title.split(new RegExp('[' + delimiters.join('') + ']+', 'g')).map(part => part.trim());
        const urlObj = new URL(sourceUrl);
        let domainParts = urlObj.hostname.replace(/^www\./, '').split('.').slice(0, -1);
        let shortestOverlap = findShortestOverlap(titleParts, domainParts);
        let resultName: string | undefined = shortestOverlap ? capitalizeWords([shortestOverlap]) : capitalizeWords(domainParts);

        // Check if sourceUrl exists in nameUrlPairs and set resultName accordingly
        const foundPair = updatesHelpers.nameUrlPairs.find(pair => pair.url === sourceUrl);
        return foundPair ? foundPair.newName : resultName;
    }

    async function findIconsForSource(responseData: string) {
        try {
            processIcons(responseData, sourceUrl);

            // If any icons are found, return them immediately.
            if (icons.address_16 || icons.address_32 || icons.largest.address) {
                return;
            }

            let mainUrl = sourceUrl; // Progressively move up the URL path and then to the main domain if necessary
            let nextUrl = updateUrl(mainUrl); // update the URL to its parent path or main domain if on root
            while (mainUrl !== nextUrl) {
                responseData = await crawlHelpers.fetchWithAxios(logs, crawlKey, sharedClient, nextUrl, 'text', 'fetchSourceData');
                if (responseData) {
                    processIcons(responseData, nextUrl);
                    // If any icons are found, return immediately
                    if (icons.address_32 || icons.address_32 || icons.largest.address)
                        return;
                }
                // Prepare the next URL
                mainUrl = nextUrl;
                nextUrl = updateUrl(mainUrl);
            }
        } catch (error: any) {
            await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, '', '', `Error in findIconsForSource; error: ${error}, message: ${error.message}`);
        }

        function processIcons(responseData: string, mainSourceUrl: string) {
            const $ = load(responseData);

            //First check for icons in link or shortcut
            const iconElements = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').toArray();
            if (iconElements) {
                iconElements.forEach(element => {
                    let href = $(element).attr('href');
                    const sizes = $(element).attr('sizes');
                    if (sizes) {
                        const sizeMatch = sizes.match(/(\d+)x(\d+)/);
                        if (sizeMatch) {
                            const size = parseInt(sizeMatch[1], 10);
                            if (size === 16)
                                icons.address_16 = href || icons.address_16;
                            else if (size === 32)
                                icons.address_32 = href || icons.address_32;
                            if (size > 32 && size > icons.largest.size) {
                                icons.largest = {size, address: href ? href : null};
                            }
                        }
                    } else if (href) {
                        if (!icons.address_16 && !icons.address_32) {
                            icons.largest = {size: 0, address: href};
                        }
                    }
                });

                // Check for og:image as a fallback if no icons were found
                if (!icons.address_16 && !icons.address_32 && !icons.largest.address) {
                    const ogImage = $('meta[property="og:image"]').attr('content');
                    if (ogImage) {
                        icons.largest = {size: -1, address: ogImage}; // Assuming size -1 for meta images as size is unknown
                    }
                }

                // Convert all assigned URLs from relative to absolute
                if (icons) {
                    if (icons.address_16 && !crawlHelpers.isAbsoluteUrl(icons.address_16))
                        icons.address_16 = crawlHelpers.toAbsoluteUrl(mainSourceUrl, icons.address_16);
                    if (icons.address_32 && !crawlHelpers.isAbsoluteUrl(icons.address_32))
                        icons.address_32 = crawlHelpers.toAbsoluteUrl(mainSourceUrl, icons.address_32);
                    if (icons.favicon && !crawlHelpers.isAbsoluteUrl(icons.favicon))
                        icons.favicon = crawlHelpers.toAbsoluteUrl(mainSourceUrl, icons.favicon);
                    if (icons.largest.address && !crawlHelpers.isAbsoluteUrl(icons.largest.address)) {
                        icons.largest.address = crawlHelpers.toAbsoluteUrl(mainSourceUrl, icons.largest.address);
                    }
                }
            }
        }

        function updateUrl(url: string) {
            const parsedUrl = new URL(url);
            // Step up the path hierarchy if not already at the root
            if (parsedUrl.pathname !== '/') {
                parsedUrl.pathname = parsedUrl.pathname.replace(/\/[^\/]+\/?$/, '');
            }
            // If already at the root, step up the subdomain hierarchy, if possible
            else if (parsedUrl.hostname.split('.').length > 2) {
                parsedUrl.hostname = parsedUrl.hostname
                    .split('.')
                    .slice(1) // Remove the first part of the hostname (the subdomain)
                    .join('.');
            }
            return parsedUrl.href;
        }
    }

    function findFeedUrl(responseData: string, sourceUrl: string): string | undefined {
        //Extracts and returns the RSS or Atom feed URL from a webpage's HTML content.
        try {
            crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, sourceUrl, '', '', `In findFeedUrl`);
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
                        return false; // Break each loop
                    }
                });
            }

            // Convert relative RSS URL to absolute URL
            if (rssURL && !crawlHelpers.isAbsoluteUrl(rssURL)) {
                rssURL = crawlHelpers.toAbsoluteUrl(sourceUrl, rssURL);
            }

            return rssURL;
        } catch (error: any) {
            crawlHelpers.addLog(logs, 'Error', 'Parse', crawlKey, sharedClient, sourceUrl, '', '', `Error in findFeedUrl; error: ${error}, message: ${error.message}`);
        }
    }
}

async function parseRssAndInsertArticles(sharedClient: PoolClient | null, sourceKey: string, rssUrl: string, sourceUrl: string) {
    try {
        // Parses an RSS feed, extracts article data, and fetches article images.
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, sourceUrl, '', rssUrl, `In parseRssAndInsertArticles`);
        const responseData = await crawlHelpers.fetchWithAxios(logs, crawlKey, sharedClient, rssUrl, 'stream', 'parseRssAndInsertArticles');
        if (responseData)
            return await processRssFeed(responseData, sourceKey);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Parse', crawlKey, sharedClient, sourceUrl, '', rssUrl, `Error in parseRssAndInsertArticles; error: ${error}, message: ${error.message}`);
    }

    async function processRssFeed(responseData: any, sourceKey: string): Promise<crawlTypes.ArticleInterface[]> {
        //Processes an RSS feed stream, creating promises for each article to extract article information.
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, sourceUrl, '', '', `In processRssFeed`);
        const feedParser = new FeedParser();
        responseData.pipe(feedParser);
        const articlesWithImagePromises: Promise<crawlTypes.ArticleInterface>[] = [];
        return new Promise((resolve, reject) => {
            try {
                feedParser.on('readable', () => {
                    let article;
                    while ((article = feedParser.read())) {
                        const pubDate = new Date(article.pubdate);
                        // Check if the article's publish date is within the desired range
                        if (pubDate && pubDate >= startDate)
                            processArticle(article, sourceKey, articlesWithImagePromises);
                    }
                });

                feedParser.on('end', async () => {
                    try {
                        const articles = await Promise.all(articlesWithImagePromises);
                        resolve(articles);
                    } catch (error: any) {
                        await crawlHelpers.addLog(logs, 'Error', 'Parse', crawlKey, sharedClient, sourceUrl, '', '', `Error processing articles; error: ${error}, message: ${error.message}`);
                        reject();
                    }
                });
                feedParser.on('error', reject);
            } catch (error: any) {
                crawlHelpers.addLog(logs, 'Error', 'Parse', crawlKey, sharedClient, sourceUrl, '', '', `Error in processRssFeed; error: ${error}, message: ${error.message}`);
                reject();
            }
        });
    }

    async function processArticle(article: crawlTypes.RssItemInterface, sourceKey: string, articlesWithImagePromises: Promise<crawlTypes.ArticleInterface>[]): Promise<void> {
        //Processes a single article from an RSS feed, adding it to a list of promises for further processing.
        try {
            await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, sourceUrl, '', article.link, `in processArticle; article: ${article.pubdate}`);
            articlesWithImagePromises.push(createArticleFromRssArticle(article, sourceKey));
        } catch (error: any) {
            await crawlHelpers.addLog(logs, 'Error', 'Parse', crawlKey, sharedClient, sourceUrl, article.link, '', `Error processArticle; error: ${error}, message: ${error.message}`);
        }
    }

    async function createArticleFromRssArticle(article: crawlTypes.RssItemInterface, sourceKey: string): Promise<crawlTypes.ArticleInterface> {
        const todayDate = crawlHelpers.getCurrentUTCDate();
        let finalTrimmedSummary = article.description ? (await crawlHelpers.htmlToPlainText(logs, crawlKey, sharedClient, article.description) ?? article.description) : undefined;
        let images: crawlTypes.ImagesInterface | undefined = undefined;

        let currentArticle: crawlTypes.ArticleInterface = {
            created_at: "", id: 0, key: "", updated_at: "",
            crawl_key: crawlKey,
            source_key: sourceKey,
            title: article.title,
            url: crawlHelpers.cleanUrl(article.link),
            original_url: article.link,
            original_published_date: article.pubdate,
            published_date: article.pubdate > todayDate ? todayDate : article.pubdate,
            summary: finalTrimmedSummary ?? null,
            original_summary: article.description ?? null,
            image_url: null,
            image_path: null,
            image_path_2x: null,
            image_alt: null,
            content: null,
            industry: null,
            type: null,
            ai_summary: null,
            ai_title: null,
            relativity_score: null,
            viral_tendency: null,
            metadata: null,
            next_retry_at: null,
            status: "Pending"
        };

        const htmlData = await crawlHelpers.extractArticleHtmlDetails(logs, crawlKey, sharedClient, currentArticle, sourceUrl);

        currentArticle.image_alt = currentArticle.image_url ? (currentArticle.image_alt ? currentArticle.image_alt : currentArticle.title) : null;
        currentArticle.content = currentArticle.content ?? null;
        currentArticle.image_url = currentArticle.image_url ?? null;

        const resultKey = await databaseInteractions.insertArticle(logs, crawlKey, sharedClient, currentArticle);
        if (resultKey && resultKey !== -1) {
            currentArticle.key = resultKey;

            //Update article with image path
            if (currentArticle.image_url) {
                images = await crawlHelpers.downloadAndSaveImage(logs, crawlKey, sharedClient, sourceUrl, article.link, currentArticle.image_url);
            }
            currentArticle.image_path = images?.name1x ?? null;
            currentArticle.image_path_2x = images?.name2x ?? null;
            currentArticle.status = htmlData ? (currentArticle.image_url ? ((images?.name1x && images?.name2x && images?.nameOriginal) ? "Done" : "Pending") : "Done") : "Pending";
            await databaseInteractions.updateArticle(logs, crawlKey, sharedClient, currentArticle);
        }
        return currentArticle;
    }
}

async function retryPendingArticles(sharedClient: PoolClient | null, sources: crawlTypes.SourceInterface[], rawArticles?: boolean) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In retryPendingArticles`);
        let sourceUrl: string | undefined;
        let pendingArticles = await databaseInteractions.getPendingArticles(logs, crawlKey, sharedClient, rawArticles);

        if (pendingArticles && pendingArticles.length > 0) {
            for (let article of pendingArticles) {
                try {
                    sourceUrl = getUrlBySourceKey(article.source_key);
                    await crawlHelpers.getArticleDetails(logs, crawlKey, sharedClient, article, !rawArticles, sourceUrl);
                    await databaseInteractions.updateArticleNextRetryAt(logs, crawlKey, sharedClient, article);
                    await databaseInteractions.updateArticle(logs, crawlKey, sharedClient, article);
                } catch (error: any) {
                    await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, '', '', '', `Error in retryPendingArticles; error: ${error}, message: ${error.message}`);
                }
            }
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Network', crawlKey, sharedClient, undefined, '', '', `Error in retryPendingArticles; error: ${error}, message: ${error.message}`);
    }

    function getUrlBySourceKey(sourceKey: string): string | undefined {
        const source = sources.find(source => source.key === sourceKey);
        return source ? source.url : undefined;
    }

}

async function filterRawArticles(sharedClient: PoolClient | null) {
    try {
        //Transfer valid selected articles from raw article table into the main article table, by pending status
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In filterRawArticles`);
        let articles = await databaseInteractions.getRawArticlesWithNoRelativityScore(logs, crawlKey, sharedClient);
        if (articles && articles.length > 0) {
            await openAIWorker.calcArticlesRelativityScore(logs, crawlKey, sharedClient, articles, true);
            await customCrawlHelpers.insertValidRawArticles(logs, crawlKey, 70);
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Network', crawlKey, sharedClient, undefined, '', '', `Error in filterRawArticles; error: ${error}, message: ${error.message}`);
    }
}

async function calcAIFieldsForAllArticles(sharedClient: PoolClient | null) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In calcAIFieldsForAllArticles;`);
        let articles = await databaseInteractions.getArticlesWithNoAIFields(logs, crawlKey, sharedClient);
        if (articles && articles.length > 0)
            await openAIWorker.calcArticlesAIFields(logs, crawlKey, articles, sharedClient);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Network', crawlKey, sharedClient, undefined, '', '', `Error in calcAIFieldsForAllArticles; error: ${error}, message: ${error.message}`);
    }
}

async function crawlSource(sharedClient: PoolClient | null, source: crawlTypes.SourceInterface): Promise<void> {
    try {
        // Crawls a specific source, updates its data, and processes its RSS feed for articles.
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, source.url, '', '', `In crawlSource`);
        source.crawl_key = crawlKey;
        const sourceUrl: string = source.url;
        let sourceData: crawlTypes.SourceInterface | undefined = source;
        const sourceKey = sourceData.key
        startDate = new Date(Date.now() - (config.numberOfDaysForFirstCrawl * 24 * 60 * 60 * 1000));

        // If rss url is not set or last_build_date is older than 10 days, crawl and update sourceData again
        const doUpdate = await sourceNeedsUpdate(sourceData.type, sourceData.status, sourceData.rss_url, sourceData.last_build_date);

        if (doUpdate) {
            const inputIcons: crawlTypes.IconsInterface = {
                address_16: null,
                address_32: null,
                favicon: "",
                largest: {size: 0, address: null}
            };

            const outputIcons: crawlTypes.IconsInterface = {
                address_16: null,
                address_32: null,
                favicon: '',
                largest: {size: 0, address: null}
            };

            sourceData = await fetchSourceData(sharedClient, sourceData.type, sourceData.url, sourceData.rss_url, inputIcons);
            if (sourceData) {
                sourceData.icon_16_url = inputIcons.address_16;
                sourceData.icon_32_url = inputIcons.address_32;
                sourceData.icon_largest_url = inputIcons.largest.address;
                await crawlHelpers.downloadAndSaveIcons(logs, crawlKey, sharedClient, sourceUrl, inputIcons, outputIcons);
                sourceData.icon_16_path = outputIcons.address_16;
                sourceData.icon_32_path = outputIcons.address_32;
                sourceData.icon_largest_path = outputIcons.largest.address;
                sourceData.status = (outputIcons.address_16 || outputIcons.address_32) ? "Done" : "Pending";
                sourceData.key = source.key;
            } else {
                sourceData = source;
                sourceData.status = "Pending";
            }
            if ((sourceData && !sourceData.rss_url) && (!sourceData.type || (sourceData.type.toLowerCase() === "website"))) {
                await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, source.url, '', '', 'Error in crawlSource: no rss url found for source');
            }
        }

        await databaseInteractions.updateSource(logs, crawlKey, sharedClient, sourceData);

        //Now crawl source based on if it is website or directory
        if (sourceData && sourceData.type.toLowerCase() === 'website' && sourceData.rss_url)
            await parseRssAndInsertArticles(sharedClient, sourceKey, sourceData.rss_url, sourceUrl);
        else if (sourceData && sourceData.type.toLowerCase() === 'directory') {
            if (sourceData.url === lobstersCrawlHelper.directoryUrl)
                await lobstersCrawlHelper.lobstersCrawler(logs, crawlKey, sharedClient, sourceData.key, sourceData.url);
            else if (sourceData.url === hackerNewsCrawlHelper.directoryUrl)
                await hackerNewsCrawlHelper.hackerNewsCrawler(logs, crawlKey, sharedClient, sourceData.key, sourceData.url);
            else if (sourceData.url === splunkCrawlHelper.directoryUrl)
                await splunkCrawlHelper.splunkCrawler(logs, crawlKey, sharedClient, sourceData.key, sourceData.url);
            else if (sourceData.url === cassandraCrawlHelper.directoryUrl)
                await cassandraCrawlHelper.cassandraCrawler(logs, crawlKey, sharedClient, sourceData.key, sourceData.url);
            else if (sourceData.url === mongodbCrawlHelper.directoryUrl)
                await mongodbCrawlHelper.mongodbCrawler(logs, crawlKey, sharedClient, sourceData.key, sourceData.url);
            else if (sourceData.url === sqliteCrawlHelper.directoryUrl)
                await sqliteCrawlHelper.sqliteCrawler(logs, crawlKey, sharedClient, sourceData.key, sourceData.url)
            else if (sourceData.url === cockroachCrawlHelper.directoryUrl)
                await cockroachCrawlHelper.cockroachCrawler(logs, crawlKey, sharedClient, sourceData.key, sourceData.url);
        }

    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, source.url, '', '', `Error in crawlSource; error: ${error}, message: ${error.message}`);
    }

    function sourceNeedsUpdate(sourceType: crawlTypes.SourceType, sourceStatus: crawlTypes.Status, rssUrl: string | null, lastBuildDate: string): boolean | undefined {
        //Determines if a source needs an update based on its last build date, true if the last build date is earlier than 10 days ago
        if ((sourceStatus.toLowerCase() === "pending") || !(sourceStatus)) {
            return true;
        } else if (!lastBuildDate) {
            return true;
        } else if ((!rssUrl) && (!sourceType || (sourceType.toLowerCase() === "website"))) {
            return true;
        } else {
            const daysAgo = new Date(Date.now() - (config.numberOfDaysForSourceUpdate * 24 * 60 * 60 * 1000));
            return !lastBuildDate || new Date(lastBuildDate) < daysAgo;
        }
    }
}

async function crawlSources(sharedClient: PoolClient | null, sources: crawlTypes.SourceInterface[]) {
    try {
        // Asynchronously crawls a list of sources with a concurrency limit, processing sources in parallel while maintaining counters and handling errors.
        let maxConcurrentCrawls = config.maxConcurrentCrawls;
        let index = 0;
        let synchronizer = Promise.resolve();
        const threads = [];
        const job = (resolve: () => void) => {
            synchronizer = synchronizer.then(() => index++).then(index => {
                if (index < sources.length) {
                    crawlSource(sharedClient, sources[index]).then(() => {
                        job(resolve);
                    });
                } else
                    resolve();
            });
        }
        for (let i = 0; i < maxConcurrentCrawls; i++) {
            threads.push(new Promise<void>(resolve => {
                job(resolve);
            }));
        }
        await Promise.all(threads);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, '', '', '', `Error in crawlSources; error: ${error}, message: ${error.message}`);
    }
}

async function mainCrawler(sharedClient: PoolClient | null): Promise<void> {
    crawlHelpers.handleUncoughtExceptions(logs);
    const startTime = new Date();
    let sources: crawlTypes.SourceInterface[] | undefined;
    try {
        await databaseInteractions.initializeDatabase(logs, crawlKey, sharedClient);
        const updated = await databaseInteractions.checkAndApplyUpdates(logs, crawlKey);
        if (updated) {
            crawlKey = await databaseInteractions.insertCrawl(logs, crawlKey, sharedClient);
            await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In mainCrawler; start`);
            if (crawlKey) {
                sources = await databaseInteractions.getAllSources(logs, crawlKey, sharedClient); //Get sources from database
                if (sources && sources.length > 0) {
                    await retryPendingArticles(sharedClient, sources);
                    await retryPendingArticles(sharedClient, sources, true);
                    await filterRawArticles(sharedClient);
                    await calcAIFieldsForAllArticles(sharedClient);
                    await crawlSources(sharedClient, sources);

                    //Check if there is a source affected by current crawl, then save all sources file again
                    const updateSources = await databaseInteractions.hasMatchingCrawlKeyInSource(logs, crawlKey, sharedClient);
                    if (updateSources)
                        await crawlHelpers.getAndSaveValidSources(logs, crawlKey, sharedClient);

                    // Get the unique published dates of affected articles for the given crawl key
                    const affectedPublishDatesByCrawl = await databaseInteractions.getAffectedPublishDatesByCrawl(logs, crawlKey, sharedClient);
                    if (affectedPublishDatesByCrawl && affectedPublishDatesByCrawl.length > 0) {
                        await crawlHelpers.getAndSaveAffectedArticlesByCrawl(logs, crawlKey, sharedClient, affectedPublishDatesByCrawl);
                    }
                }
            }
            await crawlHelpers.getAndSaveCrawlDates(logs, crawlKey, sharedClient);
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in mainCrawler; error: ${error}, message: ${error.message}, stack: ${error.stack}`, true);
    } finally {
        try {
            const endTime: Date = new Date();
            const timeMsg = `Total time taken for mainCrawler: ${(endTime.getTime() - startTime.getTime()) / 1000} seconds; Sources processed: ${sources ? sources.length : -1}`;
            await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', timeMsg);
        } catch (error: any) {
        }
        await databaseInteractions.finalizeDatabase(logs, crawlKey, sharedClient);
    }
}

mainCrawler(null).then(() => {
    const msg = {
        message: `mainCrawler finished with crawlKey: ${crawlKey}`,
        timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(msg));
});