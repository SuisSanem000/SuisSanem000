import {PoolClient} from "pg";

import * as crawlHelpers from "../crawlHelpers";
import * as crawlTypes from "../crawlTypes";
import * as databaseInteractions from "../databaseInteractions";

async function insertValidRawArticles(logs: crawlTypes.LogInterface[], crawlKey: string, minRelativityScore: number): Promise<void> {
    // Queries raw_article by crawlKey, sourceUrl, and relativityScore, then inserts articles exceeding the score threshold into the article table, using the sourceKey obtained from the sourceUrl
    const sharedClient: PoolClient | null = await databaseInteractions.pool.connect();
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In insertValidRawArticles;');
        await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, 'BEGIN TRANSACTION;', []);
        const queryToRetrieveArticles = `SELECT *
                                         FROM raw_article
                                         WHERE relativity_score > $1`;
        const articlesToInsert = await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, queryToRetrieveArticles, [minRelativityScore]);
        if (articlesToInsert && articlesToInsert.rows && articlesToInsert.rows.length > 0){
            await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, null, undefined, '', '', `In insertValidRawArticles; articlesToInsert count: ${articlesToInsert.rows.length}`);
            for (const article of articlesToInsert.rows) {
                const placeHolderMetadata: crawlTypes.ArticleMetadataInterface = {
                    price: 0,
                    reason: null
                };
                article.metadata = article.metadata ?? placeHolderMetadata;
                article.metadata.price = 0;
                const articleInterface: crawlTypes.ArticleInterface = {
                    id: article.id,
                    key: article.key,
                    created_at: article.created_at,
                    updated_at: article.updated_at,
                    crawl_key: article.crawl_key,
                    source_key: article.source_key,
                    title: article.title,
                    url: article.url,
                    original_url: article.original_url,
                    published_date: new Date(article.published_date),
                    original_published_date: new Date(article.original_published_date),
                    summary: article.summary,
                    original_summary: article.original_summary,
                    image_url: article.image_url,
                    image_path: article.image_path,
                    image_path_2x: article.image_path_2x,
                    image_alt: article.image_alt,
                    content: article.content,
                    industry: article.industry,
                    type: article.type,
                    ai_summary: article.ai_summary,
                    ai_title: article.ai_title,
                    relativity_score: article.relativity_score,
                    viral_tendency: article.viral_tendency,
                    metadata: article.metadata,
                    next_retry_at: null,
                    status: "Pending"
                }
                await databaseInteractions.insertArticle(logs, crawlKey, sharedClient, articleInterface);
            }
        }
        await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, 'COMMIT TRANSACTION;', []);
    } catch (error: any) {
        await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, 'ROLLBACK;', []);
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, null, undefined, '', '', `Error In insertValidRawArticles; error: ${error}, message: ${error.message}`);
    } finally {
        sharedClient?.release();
    }
}

export {insertValidRawArticles};