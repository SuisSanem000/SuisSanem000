import * as crawlHelpers from "./crawlHelpers";
import * as crawlTypes from "./crawlTypes";
import * as databaseInteractions from "./databaseInteractions";

import * as hackerNewsCrawlHelper from "./customCrawlers/directories/hackerNewsCrawlHelper";

import * as splunkCrawlHelper from "./customCrawlers/splunkCrawlHelper";
import * as cassandraCrawlHelper from "./customCrawlers/cassandraCrawlHelper";
import * as mongodbCrawlHelper from "./customCrawlers/mongodbCrawlHelper";
import * as sqliteCrawlHelper from "./customCrawlers/sqliteCrawlHelper";
import * as cockroachCrawlHelper from "./customCrawlers/cockroachCrawlHelper";

import {PoolClient} from 'pg';

interface NameUrlPair {
    newName: string;
    url: string;
}

const nameUrlPairs: NameUrlPair[] = [
    {newName: 'Oracle Blog', url: 'https://blogs.oracle.com/cloud-infrastructure/'},
    {newName: 'MySql Blog', url: 'https://blogs.oracle.com/mysql/'},
    {newName: 'Data Nexus', url: 'https://mongodb-tools.com/'},
    {newName: 'Tableplus', url: 'https://tableplus.com/blog'},
    {newName: 'Red Gate', url: 'https://www.red-gate.com/'},
    {newName: 'Microsoft Azure Sql Devs', url: 'https://devblogs.microsoft.com/azure-sql/'},
    {newName: 'Microsoft Azure Cosmos Db Blog', url: 'https://devblogs.microsoft.com/cosmosdb/'},
    {newName: 'The Square Planet', url: 'https://thesquareplanet.com/blog/instructors-guide-to-raft/'},
    {newName: 'Cockroach Labs', url: 'https://www.cockroachlabs.com/'},
    {newName: 'Coussej Github', url: 'https://coussej.github.io/'},
    {newName: 'All Things Distributed', url: 'https://www.allthingsdistributed.com/'},
    {newName: 'Robert Haas Blog', url: 'https://rhaas.blogspot.com/'},
    {newName: 'Martin Kleppmann', url: 'https://martin.kleppmann.com/'},
    {newName: 'Arangodb', url: 'https://arangodb.com/'},
    {newName: 'Clickhouse Blog', url: 'https://clickhouse.com/blog'},
    {newName: 'Antirez', url: 'http://antirez.com/latest/0'},
    {newName: 'Holistics Blog', url: 'https://holistics.io/blog'},
    {newName: 'Snowflake Blog', url: 'https://www.snowflake.com/blog/'},
    {newName: 'Postgis', url: 'https://postgis.net/'},
    {newName: 'Highly Scalable Blog', url: 'https://highlyscalable.wordpress.com/'},
    {newName: 'Matthew Rathbone Blog', url: 'https://blog.matthewrathbone.com/'},
    {newName: 'Materialize Engineering Blog', url: 'https://materialize.com/blog/engineering/'},
    {newName: 'Dbt Developer Hub', url: 'https://docs.getdbt.com/'},
    {newName: 'Dbt Developer Hub', url: 'https://docs.getdbt.com/blog'},
    {newName: 'Algolia Blog', url: 'https://www.algolia.com/blog/engineering/'},
    {newName: 'Statistics And Data', url: 'https://statisticsanddata.org/'},
    {newName: 'Duckdb News', url: 'https://duckdb.org/news'},
    {newName: 'Planetscale', url: 'https://planetscale.com/'},
    {newName: 'Kina Knowledge', url: 'https://www.kinaknowledge.com/'},
    {newName: 'Modern Data Stack', url: 'https://letters.moderndatastack.xyz/'},
    {newName: 'Analytics Engineering Roundup', url: 'https://roundup.getdbt.com/'},
    {newName: 'Shopify Engineering Blog', url: 'https://shopify.engineering/topics/data-science-engineering'},
    {newName: 'Data Engineering Weekly', url: 'https://www.dataengineeringweekly.com/'},
    {newName: 'Netlify Blog', url: 'https://www.netlify.com/blog/tags/data/'},
    {newName: 'Start Data Engineering', url: 'https://www.startdataengineering.com/'},
    {newName: 'Seattle Data Guy', url: 'https://www.theseattledataguy.com/data-science-consulting-blog/'},
    {newName: 'Uber Blog', url: 'https://www.uber.com/en-DE/blog/engineering/data/'},
    {newName: 'Microsoft Azure Blog', url: 'https://azure.microsoft.com/en-us/blog/'}
];

const theOneFutureArticleURL = "https://duckdb.org/2024/08/15/duckcon5.html";

async function addUniqueConstraintToSource(logs: any, crawlKey: any, sharedClient: PoolClient | null) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `in addUniqueConstraintToSource`);
        const qr = `ALTER TABLE source
            ADD CONSTRAINT rss_url_unique UNIQUE (rss_url);`;
        await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, qr, []);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, undefined, undefined, undefined, `Error in addUniqueConstraintToSource; error: ${error}, message: ${error.message}`);
    }
}

interface UrlUpdate {
    oldUrl: string;
    newUrl: string;
}

const urlUpdatePairs: UrlUpdate[] = [
    {oldUrl: 'https://redis.io/', newUrl: 'https://redis.com/blog/'},
    {oldUrl: 'https://www.databricks.com/', newUrl: 'https://www.databricks.com/blog'},
    {oldUrl: 'https://docs.getdbt.com/', newUrl: 'https://docs.getdbt.com/blog'}
];

async function removeDuplicateSources(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, undefined, '', '', 'In removeDuplicateSources;');
    const deleteQuery = `DELETE
                         FROM source
                         WHERE url = $1;`;
    for (const urlUpdate of urlUpdatePairs) {
        try {
            await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, deleteQuery, [urlUpdate.oldUrl]);
        } catch (error: any) {
            await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, undefined, '', urlUpdate.oldUrl, `Error in removeDuplicateSources; error: ${error}, message: ${error.message}`);
        }
    }
}

async function removeSourceWithArticles(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, sourceUrl: string) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, undefined, '', '', 'In removeSourceWithArticles;');

        const deleteSourceQuery = `DELETE
                                   FROM SOURCE
                                   WHERE url LIKE $1`;


        const deleteArticlesQuery = `DELETE
                                     FROM article
                                     WHERE source_key IN (SELECT article.source_key
                                                          FROM article
                                                                   LEFT JOIN source ON article.source_key = source.key
                                                          WHERE source.key IS NULL);`;

        await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, deleteSourceQuery, [`%${sourceUrl}%`]);
        await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, deleteArticlesQuery, []);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, sourceUrl, undefined, undefined, `Error in removeSourceWithArticles; error: ${error}, message: ${error.message}`);
    }
}

async function removeMongoBlogAndArticles(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    const url = 'mongodb.com/blog'
    try {
        await removeSourceWithArticles(logs, crawlKey, sharedClient, url);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, url, undefined, undefined, `Error in removeMongoBlogAndArticles; error: ${error}, message: ${error.message}`);
    }
}

async function removeSlashbaseWithArticles(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    const sourceUrl = 'blog.slashbase.com'
    try {
        await removeSourceWithArticles(logs, crawlKey, sharedClient, sourceUrl);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, sourceUrl, undefined, undefined, `Error in removeSlashbaseArticles; error: ${error}, message: ${error.message}`);
    }
}

async function removeHexTechWithArticles(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    const sourceUrl = 'hex.tech'
    try {
        await removeSourceWithArticles(logs, crawlKey, sharedClient, sourceUrl);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, sourceUrl, undefined, undefined, `Error in removeSlashbaseArticles; error: ${error}, message: ${error.message}`);
    }
}

async function updateArticlesOfDuplicateSources(logs: any, crawlKey: any, sharedClient: PoolClient | null) {
    await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `in updateArticlesOfDuplicateSources`);
    for (const urlUpdate of urlUpdatePairs) {
        try {
            const updateArticleQuery = `UPDATE article
                                        SET source_key = (SELECT key
                                                          FROM source
                                                          WHERE url = $1)
                                          , crawl_key  = $2
                                        WHERE source_key = (SELECT key FROM source WHERE url = $3);`;
            await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, updateArticleQuery, [urlUpdate.newUrl, crawlKey, urlUpdate.oldUrl]);
        } catch (error: any) {
            await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, undefined, undefined, undefined, `Error in updateArticlesOfDuplicateSources; error: ${error}, message: ${error.message}`);
        }
    }
}

async function updateDatabaseVersion(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, newVersion: number) {
    try {
        const updateVersionQuery = `CREATE OR REPLACE VIEW database_info AS SELECT ${newVersion} AS version;`;
        await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, updateVersionQuery, []);
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `in updateDatabaseVersion; newVersion: ${newVersion}`);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, undefined, undefined, undefined, `Error in updateDatabaseVersion; error: ${error}, message: ${error.message}`);
    }
}

async function addOriginalPublishedDateField(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'in addOriginalPublishedDateField;');

        const alterTableQuery = `ALTER TABLE article
            ADD COLUMN IF NOT EXISTS original_published_date TIMESTAMP;`;

        await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, alterTableQuery, []);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in addOriginalPublishedDateField; error: ${error}, message: ${error.message}`);
    }
}

async function addMultipleFields(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        //Add AI needed fields to the database
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'in addMultipleFields;');
        const alterTableQuery = `
            ALTER TABLE article
                ADD COLUMN IF NOT EXISTS content          TEXT,
                ADD COLUMN IF NOT EXISTS industry         INT2,
                ADD COLUMN IF NOT EXISTS type             INT2,
                ADD COLUMN IF NOT EXISTS ai_summary       TEXT[],
                ADD COLUMN IF NOT EXISTS ai_title         TEXT,
                ADD COLUMN IF NOT EXISTS relativity_score INT2,
                ADD COLUMN IF NOT EXISTS viral_tendency   INT2,
                ADD COLUMN IF NOT EXISTS metadata         JSONB,
                ADD COLUMN IF NOT EXISTS next_retry_at    TIMESTAMP;
        `;
        await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, alterTableQuery, []);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in addMultipleFields; error: ${error}, message: ${error.message}`);
    }
}

async function getArticleByUrl(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, articleUrl: string): Promise<crawlTypes.ArticleInterface | undefined> {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, articleUrl, '', '', 'In getArticleByUrl;');
        const query = `SELECT *
                       FROM article
                       WHERE url = $1;`;
        const articleResult = await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, query, [articleUrl]);
        if (articleResult && articleResult.rows && articleResult.rows.length > 0)
            return articleResult.rows[0] as crawlTypes.ArticleInterface;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, articleUrl, '', '', `Error in getArticleByUrl; error: ${error}, message: ${error.message}`);
    }
}

async function updateOneFutureArticle(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, undefined, '', '', 'In updateOneFutureArticle;');
        const article = await getArticleByUrl(logs, crawlKey, sharedClient, theOneFutureArticleURL);
        if (article) {
            const originalPublishedDate = article.published_date;
            const publishedDate = article.created_at;
            const updateQuery = `UPDATE article
                                 SET original_published_date = $1,
                                     published_date          = $2
                                 WHERE url = $3
                                 RETURNING key`;
            const params = [originalPublishedDate, publishedDate, theOneFutureArticleURL];
            const result = await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, updateQuery, params);
            if (result && result.rows && result.rows.length > 0) {
                return result.rows[0].key;
            }
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', '', sharedClient, '', '', '', `Error in updateOneFutureArticle; error: ${error}, message: ${error.message}`);
    }
}

async function updateAllArticlesOriginalPublishedDates(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In updateAllArticlesOriginalPublishedDates;`);
        const updateQuery = `
            UPDATE article
            SET original_published_date = published_date
            WHERE url != $1`;
        const result = await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, updateQuery, [theOneFutureArticleURL]);
        if (result && result.rowCount && result.rowCount > 0) {
            return result.rowCount;
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in updateAllArticlesDates; error: ${error}, message: ${error.message}`);
    }
}

async function createRawArticleTable(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In createRawArticleTable;');
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS raw_article
            (
                id                      INT4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
                key                     VARCHAR(36),
                created_at              TIMESTAMP,
                updated_at              TIMESTAMP,
                crawl_key               VARCHAR(36),
                source_key              VARCHAR(36),
                title                   VARCHAR(1024),
                url                     VARCHAR(1024),
                original_url            VARCHAR(1024),
                summary                 TEXT,
                original_summary        TEXT,
                published_date          TIMESTAMP,
                original_published_date TIMESTAMP,
                image_url               VARCHAR(1024),
                image_path              TEXT,
                image_path_2x           TEXT,
                image_alt               TEXT,
                content                 TEXT,
                industry                INT2,
                type                    INT2,
                ai_summary              TEXT[],
                ai_title                TEXT,
                relativity_score        INT2,
                viral_tendency          INT2,
                metadata                JSONB,
                next_retry_at           TIMESTAMP,
                status                  VARCHAR(1024),
                PRIMARY KEY (id),
                CONSTRAINT raw_article_key UNIQUE (key),
                CONSTRAINT raw_article_url UNIQUE (url)
            );
        `;
        await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, createTableQuery, []);
        await applyTriggersToTables(logs, crawlKey, sharedClient);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in createRawArticleTable; error: ${error}, message: ${error.message}`);
    }
}

async function applyTriggersToTables(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'in applyTriggersToTables;');
        const applyTriggersQuery = `
            CALL public.create_trigger_for_tables();
        `;
        await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, applyTriggersQuery, []);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in applyTriggersToTables; error: ${error}, message: ${error.message}`);
    }
}

async function addDirectoryToDb(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, sourceUrl: string) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, sourceUrl, '', '', 'In addDirectoryToDb;');
        const insertQuery =
            `INSERT INTO "public"."source" ("url", "status", "type")
             VALUES ($1, 'Pending', 'Directory')
             ON CONFLICT (url) DO NOTHING
             RETURNING *;`;
        const result = await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, insertQuery, [sourceUrl]);
        if (result && result.rows && result.rows.length > 0)
            return result.rows[0].key;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, sourceUrl, '', '', `Error in addDirectoryToDb; error: ${error}, message: ${error.message}`);
    }
}

async function addHackerNewsToDb(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    await addDirectoryToDb(logs, crawlKey, sharedClient, hackerNewsCrawlHelper.directoryUrl);
}

async function addSplunkToDb(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    await addDirectoryToDb(logs, crawlKey, sharedClient, splunkCrawlHelper.directoryUrl);
}

async function addCassandraToDb(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    await addDirectoryToDb(logs, crawlKey, sharedClient, cassandraCrawlHelper.directoryUrl);
}

async function addMongodbToDb(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    await addDirectoryToDb(logs, crawlKey, sharedClient, mongodbCrawlHelper.directoryUrl);
}

async function addSqliteToDb(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    await addDirectoryToDb(logs, crawlKey, sharedClient, sqliteCrawlHelper.directoryUrl);
}

async function updateCockroachInDb(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        //Make it into a directory to have a custom crawler, and update the URL, since the rss has been removed
        const sourceUrl = 'cockroachlabs.com';
        const insertQuery = `UPDATE SOURCE
                             SET url          = $1,
                                 original_url = $2,
                                 "type"       = $3
                             WHERE url LIKE $4`;
        const result = await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, insertQuery, [cockroachCrawlHelper.directoryUrl, cockroachCrawlHelper.directoryUrl, 'Directory', `%${sourceUrl}%`]);
        if (result && result.rows && result.rows.length > 0)
            return result.rows[0].key;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, cockroachCrawlHelper.directoryUrl, undefined, undefined, `Error in updateCockroachInDb; error: ${error}, message: ${error.message}`);
    }
}

async function UpdateSourceFeed(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, newFeedUrl: string, sourceUrl: string) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, sourceUrl, '', '', 'In UpdateSourceFeed;');
        const insertQuery = `UPDATE source
                             SET "rss_url" = $1
                             WHERE url like $2`;
        const result = await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, insertQuery, [newFeedUrl, `%${sourceUrl}%`]);
        if (result && result.rows && result.rows.length > 0)
            return result.rows[0].key;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, sourceUrl, undefined, undefined, `Error in UpdateSourceFeed; error: ${error}, message: ${error.message}`);
    }
}

async function UpdateYugabyteFeed(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    const sourceUrl = 'yugabyte.com/success-stories/';
    try {
        await UpdateSourceFeed(logs, crawlKey, sharedClient, 'https://www.yugabyte.com/blog/feed/', sourceUrl);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, sourceUrl, undefined, undefined, `Error in UpdateYugabyteFeed; error: ${error}, message: ${error.message}`);
    }
}

async function updateOldArticlesNextRetryAt(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In updateAllArticlesNextRetryAt;`);
        const updateQuery = `UPDATE article
                             SET next_retry_at = NOW()
                             WHERE status = 'Pending'
                               AND next_retry_at IS NULL
                             RETURNING KEY;`;
        const result = await databaseInteractions.executeQuery(logs, crawlKey, sharedClient, updateQuery, []);
        if (result && result.rowCount && result.rowCount > 0)
            return result.rowCount;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in updateAllArticlesNextRetryAt; error: ${error}, message: ${error.message}`);
    }
}

export {
    nameUrlPairs,
    updateDatabaseVersion,
    updateArticlesOfDuplicateSources,
    removeDuplicateSources,
    addUniqueConstraintToSource,
    updateOneFutureArticle,
    addOriginalPublishedDateField,
    updateAllArticlesOriginalPublishedDates,
    addMultipleFields,
    createRawArticleTable,
    removeMongoBlogAndArticles,
    removeSlashbaseWithArticles,
    removeHexTechWithArticles,
    addHackerNewsToDb,
    addSplunkToDb,
    addCassandraToDb,
    addMongodbToDb,
    addSqliteToDb,
    UpdateYugabyteFeed,
    updateCockroachInDb,
    updateOldArticlesNextRetryAt
}
