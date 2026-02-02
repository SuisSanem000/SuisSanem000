import * as databaseInteractions from '../databaseInteractions';
import * as crawlHelpers from '../crawlHelpers';
import * as crawlTypes from '../crawlTypes';

import {PoolClient} from "pg";

let crawlKey: string;
const logs: crawlTypes.LogInterface[] = [];

async function getAndSaveAllArticles(sharedClient: PoolClient | null): Promise<void> {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In getAndSaveAffectedArticlesByCrawl`);
        const firstDate = await databaseInteractions.getOldestPublishDate(logs, crawlKey, sharedClient);
        const lastDate = crawlHelpers.getDatePart(crawlHelpers.getCurrentUTCDate());
        if (firstDate && lastDate) {
            for (let dt = new Date(firstDate); dt <= new Date(lastDate); dt.setDate(dt.getDate() + 1)) {
                const articles: crawlTypes.SourceArticleInterface[] | undefined = await databaseInteractions.getArticlesOfDate(logs, crawlKey, sharedClient, dt);
                if (articles) {
                    await crawlHelpers.saveArticlesOfDate(logs, crawlKey, sharedClient, crawlHelpers.getJsonPath(), articles);
                }
            }
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, '', '', '', `Error in getAndSaveAffectedArticlesByCrawl; error: ${error}, message: ${error.message}`);
    }
}

async function mainJSONGenerator(sharedClient: PoolClient | null): Promise<void> {
    const startTime = new Date();
    crawlKey = 'generateJSONFiles';
    try {
        await databaseInteractions.initializeDatabase(logs, crawlKey, sharedClient);
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In mainJSONGenerator; start`);
        await crawlHelpers.getAndSaveValidSources(logs, crawlKey, sharedClient);
        await getAndSaveAllArticles(sharedClient);
        await crawlHelpers.getAndSaveCrawlDates(logs, crawlKey, sharedClient);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in mainJSONGenerator; error: ${error}, message: ${error.message}, stack: ${error.stack}`, true);
    } finally {
        try {
            const endTime: Date = new Date();
            const msg = `Total time taken for mainJSONGenerator: ${(endTime.getTime() - startTime.getTime()) / 1000} seconds.`;
            await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', msg);
        } catch (error: any) {
        }
        await databaseInteractions.finalizeDatabase(logs, crawlKey, sharedClient);
    }
}

mainJSONGenerator(null).then(() => {
    const msg = {
        message: `mainJSONGenerator finished with crawlKey: ${crawlKey}`,
        timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(msg));
});