import * as databaseInteractions from '../databaseInteractions';
import * as crawlHelpers from '../crawlHelpers';
import * as crawlTypes from '../crawlTypes';
import {PoolClient} from "pg";

let crawlKey: string;
const logs: crawlTypes.LogInterface[] = [];
let sources: crawlTypes.SourceInterface[] | undefined;

async function downloadAndSaveAllSourcesIcons(sharedClient: PoolClient | null) {
    let inputIcons, outputIcons: crawlTypes.IconsInterface;
    sources = await databaseInteractions.getAllSources(logs, crawlKey, sharedClient);
    if (sources && sources.length > 0) {
        for (const source of sources) {
            try {
                inputIcons = {
                    address_16: source.icon_16_url,
                    address_32: source.icon_32_url,
                    favicon: crawlHelpers.getFaviconUrl(source.url),
                    largest: {size: 0, address: source.icon_largest_url}
                };
                outputIcons = {
                    address_16: null,
                    address_32: null,
                    favicon: "",
                    largest: {size: 0, address: null}
                };

                // Save new icons and update source data, if there's a problem during the download or saving of the icon files, the result being set to an empty string for icons 16, 32, or largest
                await crawlHelpers.downloadAndSaveIcons(logs, crawlKey, sharedClient, source.url, inputIcons, outputIcons);
                source.icon_16_path = outputIcons.address_16;
                source.icon_32_path = outputIcons.address_32;
                source.icon_largest_path = outputIcons.largest.address;
                await databaseInteractions.updateSource(logs, source.crawl_key, sharedClient, source);
            } catch (error: any) {
                await crawlHelpers.addLog(logs, 'Error', 'IO', crawlKey, sharedClient, source.url, '', '', `Error in downloadAndSaveAllSourcesIcons; error: ${error}, message: ${error.message}`);
            }
        }
    }
}

async function getAndSaveAllArticlesImages(sharedClient: PoolClient | null) {
    let articles: crawlTypes.ArticleInterface[] | undefined = await databaseInteractions.getAllArticlesWithImage(logs, crawlKey, sharedClient);
    let images: crawlTypes.ImagesInterface | undefined;
    let sourceUrl: string | undefined = '';
    if (articles && articles.length > 0) {
        for (const article of articles) {
            try {
                sourceUrl = getUrlByKey(article.source_key);
                if (article.image_url && sourceUrl) {
                    images = await crawlHelpers.downloadAndSaveImage(logs, article.crawl_key, sharedClient, sourceUrl, article.url, article.image_url);
                    article.image_path = images?.name1x ?? null;
                    article.image_path_2x = images?.name2x ?? null;
                    await databaseInteractions.updateArticle(logs, article.crawl_key, sharedClient, article);
                }
            } catch (error: any) {
                await crawlHelpers.addLog(logs, 'Error', 'IO', crawlKey, sharedClient, '', article.url, '', `Error in getAndSaveAllArticlesImages; error: ${error}, message: ${error.message}`);
            }
        }
    }

    function getUrlByKey(key: string): string | undefined {
        if (!sources) {
            return undefined;
        }
        const source = sources.find(source => source.key === key);
        return source ? source.url : undefined;
    }
}

async function mainImageGenerator(sharedClient: PoolClient | null): Promise<void> {
    const startTime = new Date();
    crawlKey = 'generateImageFiles';
    try {
        await databaseInteractions.initializeDatabase(logs, crawlKey, sharedClient);
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In mainImageGenerator; start`);
        await downloadAndSaveAllSourcesIcons(sharedClient);
        await getAndSaveAllArticlesImages(sharedClient);
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In mainImageGenerator; finish`);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in mainCrawler; error: ${error}, message: ${error.message}, stack: ${error.stack}`, true);
    } finally {
        try {
            const endTime: Date = new Date();
            const msg = `Total time taken for mainImageGenerator: ${(endTime.getTime() - startTime.getTime()) / 1000} seconds.`;
            await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', msg);
        } catch (error: any) {
        }
        await databaseInteractions.finalizeDatabase(logs, crawlKey, sharedClient);
    }
}

mainImageGenerator(null).then(() => {
    const msg = {
        message: `mainImageGenerator finished with crawlKey: ${crawlKey}`,
        timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(msg));
});