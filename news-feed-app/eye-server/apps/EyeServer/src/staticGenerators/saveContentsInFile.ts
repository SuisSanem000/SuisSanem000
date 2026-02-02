import * as path from 'path';
import {PoolClient} from "pg";

import * as databaseInteractions from '../databaseInteractions';
import * as crawlHelpers from '../crawlHelpers';
import * as crawlTypes from '../crawlTypes';

let crawlKey: string;
const logs: crawlTypes.LogInterface[] = [];

async function getFullArticlesOfDate(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, date: Date, rawArticles?: boolean): Promise<crawlTypes.SourceArticleInterface[] | undefined> {
    try {
        const tableName = rawArticles ? 'raw_article' : 'article';
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1; // getMonth() returns 0-11
        const day = date.getUTCDate();

        const query = `
            SELECT src.id  AS source_id,
                   src.key AS source_key,
                   src.url AS source_url,
                   art.*
            FROM source AS src
                     JOIN ${tableName} AS art ON src.key = art.source_key
            WHERE (DATE(art.published_date) = $1)
              AND (art.content IS NOT NULL)`;

        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const result = await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, query, [formattedDate]);
        if (result && result.rows && result.rows.length > 0) {
            const sourceArticlesMap: Record<string, crawlTypes.SourceArticleInterface> = {};
            for (const row of result.rows) {
                const sourceKey = row.source_key;
                if (!sourceArticlesMap[sourceKey]) {
                    sourceArticlesMap[sourceKey] = {
                        source: {} as crawlTypes.SourceInterface, // This will be populated below
                        articles: [],
                        day_price: 0
                    };
                }

                if (!sourceArticlesMap[sourceKey].source.id) {
                    // This means the source details haven't been populated yet
                    // @ts-ignore
                    sourceArticlesMap[sourceKey].source = {
                        id: row.source_id,
                        key: row.source_key,
                        url: row.source_url
                    };
                }

                // Remove source fields from the row before adding to articles
                const article: crawlTypes.ArticleInterface = {
                    id: row.id,
                    key: row.key,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    crawl_key: row.crawl_key,
                    source_key: row.source_key,
                    title: row.title,
                    url: row.url,
                    original_url: row.original_url,
                    published_date: new Date(row.published_date),
                    original_published_date: new Date(row.original_published_date),
                    summary: row.summary,
                    original_summary: row.original_summary,
                    image_url: row.image_url,
                    image_path: row.image_path,
                    image_path_2x: row.image_path_2x,
                    image_alt: row.image_alt,
                    content: row.content,
                    industry: (row.industry != null) ? Number(row.industry) : row.industry,
                    type: (row.type != null) ? Number(row.type) : row.type,
                    ai_summary: row.ai_summary,
                    ai_title: row.ai_title,
                    relativity_score: (row.relativity_score != null) ? Number(row.relativity_score) : row.relativity_score,
                    viral_tendency: (row.viral_tendency != null) ? Number(row.viral_tendency) : row.viral_tendency,
                    metadata: row.metadata,
                    next_retry_at: row.next_retry_at,
                    status: row.status
                };
                sourceArticlesMap[sourceKey].articles.push(article);
            }
            return Object.values(sourceArticlesMap);
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getFullArticlesOfDate; date: ${date.toISOString()}; error: ${error}, message: ${error.message}`);
    }
}


async function saveAllArticlesContentsInFile(sharedClient: PoolClient | null, rawArticles?: boolean): Promise<void> {
    try {
        const firstDate = await databaseInteractions.getOldestPublishDate(logs, crawlKey, sharedClient);
        const lastDate = crawlHelpers.getDatePart(crawlHelpers.getCurrentUTCDate());
        if (!firstDate || !lastDate)
            return;
        for (let dt = new Date(firstDate); dt <= new Date(lastDate); dt.setDate(dt.getDate() + 1)) {
            const sourceArticles: crawlTypes.SourceArticleInterface[] | undefined = await getFullArticlesOfDate(logs, crawlKey, sharedClient, dt, rawArticles);
            if (sourceArticles)
                for (let sourceArticle of sourceArticles)
                    for (let article of sourceArticle.articles) {
                        if (article.content) {
                            const sourceName = crawlHelpers.getValidFileAndUrlName(sourceArticle.source.url);
                            const dirPath = path.join(crawlHelpers.getContentPath(), sourceName);
                            crawlHelpers.checkOrMakeDir(dirPath);
                            const hashedFileName = crypto.randomUUID();
                            const filePath = path.join(dirPath, `${hashedFileName}.txt`);
                            if (crawlHelpers.saveStringToFile(filePath, article.content))
                                article.content = filePath;
                            await databaseInteractions.updateArticle(logs, article.crawl_key, sharedClient, article, rawArticles);
                        }
                    }
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, '', '', '', `Error in getAndSaveAffectedArticlesByCrawl; error: ${error}, message: ${error.message}`);
    }
}

//This is used to get previously crawled article's contents in dev server both in article and raw article table then save it in file and save file path instead of content
async function mainContentFilesGenerator(sharedClient: PoolClient | null): Promise<void> {
    const startTime = new Date();
    crawlKey = 'generateContentFiles';
    try {
        await databaseInteractions.initializeDatabase(logs, crawlKey, sharedClient);
        await saveAllArticlesContentsInFile(sharedClient);
        await saveAllArticlesContentsInFile(sharedClient, true);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in mainContentFilesGenerator; error: ${error}, message: ${error.message}, stack: ${error.stack}`, true);
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

mainContentFilesGenerator(null).then(() => {
    const msg = {
        message: `mainContentFilesGenerator finished with crawlKey: ${crawlKey}`,
        timestamp: new Date().toISOString()
    };
    console.log(JSON.stringify(msg));
});