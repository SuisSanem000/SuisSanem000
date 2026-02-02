//This file contains functions for interacting with a PostgresSQL database, including executing queries and managing data related to crawling.
import {Pool, PoolClient} from 'pg';
import * as crawlHelpers from './crawlHelpers';
import * as updatesHelpers from './updatesHelpers';
import * as crawlTypes from './crawlTypes';
import config from '../config.json';

let pool: Pool;

async function insertArticle(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, article: crawlTypes.ArticleInterface, rawArticles?: boolean) {
    try {
        const tableName = rawArticles ? 'raw_article' : 'article'; // Conditional table name based on rawArticles
        const insertQuery = `
            INSERT INTO ${tableName} (crawl_key, source_key, title, url, original_url, summary, original_summary,
                                      published_date, original_published_date, image_url, image_path,
                                      image_path_2x, image_alt, content, industry, type, ai_summary, ai_title,
                                      relativity_score, viral_tendency, metadata, next_retry_at, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
                    $23)
            ON CONFLICT (url) DO NOTHING
            RETURNING key`;


        const placeHolderMetadata: crawlTypes.ArticleMetadataInterface = {
            price: 0,
            reason: null
        };

        article.metadata = article.metadata ?? placeHolderMetadata;
        const now = new Date();
        article.next_retry_at = new Date(now.getTime() + 60 * 60 * 1000);
        const params = [crawlKey, article.source_key, article.title, article.url, article.original_url, article.summary,
            article.original_summary, article.published_date, article.original_published_date, article.image_url, article.image_path, article.image_path_2x, article.image_alt, article.content,
            article.industry, article.type, article.ai_summary, article.ai_title, article.relativity_score, article.viral_tendency, article.metadata, article.next_retry_at, article.status];
        const result = await executeQuery(logs, crawlKey, sharedClient, insertQuery, params);
        if (result && result.rows && result.rows.length > 0)
            return result.rows[0].key;
        else
            return -1;

    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', article.url, '', `Error in insertArticle; error: ${error}, message: ${error.message}`);
    }
}

async function updateArticle(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, article: crawlTypes.ArticleInterface, rawArticles?: boolean) {
    try {
        const tableName = rawArticles ? 'raw_article' : 'article'; // Conditional table name based on rawArticles
        const updateQuery = `
            UPDATE ${tableName}
            SET crawl_key               = $1,
                source_key              = $2,
                title                   = $3,
                url                     = $4,
                original_url            = $5,
                published_date          = $6,
                original_published_date = $7,
                summary                 = $8,
                original_summary        = $9,
                image_url               = $10,
                image_path              = $11,
                image_path_2x           = $12,
                image_alt               = $13,
                content                 = $14,
                industry                = $15,
                type                    = $16,
                ai_summary              = $17,
                ai_title                = $18,
                relativity_score        = $19,
                viral_tendency          = $20,
                metadata                = $21,
                next_retry_at           = $22,
                status                  = $23
            WHERE key = $24
            RETURNING key
        `;

        const imagesPath = crawlHelpers.getImagesPath();

        let imagePath = article.image_path;
        if (imagePath?.startsWith(imagesPath)) {
            imagePath = imagePath.substring(imagesPath.length);
        }

        let imagePath2x = article.image_path_2x;
        if (imagePath2x?.startsWith(imagesPath)) {
            imagePath2x = imagePath2x.substring(imagesPath.length);
        }

        const params = [crawlKey, article.source_key, article.title, article.url, article.original_url, article.published_date, article.original_published_date, article.summary, article.original_summary, article.image_url, imagePath, imagePath2x, article.image_alt, article.content, article.industry, article.type, article.ai_summary, article.ai_title, article.relativity_score, article.viral_tendency, article.metadata, article.next_retry_at, article.status, article.key];
        const result = await executeQuery(logs, crawlKey, sharedClient, updateQuery, params);
        if (result && result.rows && result.rows.length > 0)
            return result.rows[0].key;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', article.url, '', `Error in updateArticle; error: ${error}, message: ${error.message}`);
    }
}

async function getPendingArticles(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, rawArticles?: boolean): Promise<crawlTypes.ArticleInterface[] | undefined> {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In getPendingArticles;');
        const tableName = rawArticles ? 'raw_article' : 'article'; // Conditional table name based on rawArticles
        const query = `SELECT *
                       FROM ${tableName}
                       WHERE (status = 'Pending' OR status IS NULL)
                         AND next_retry_at < $1
                       ORDER BY next_retry_at
                       LIMIT 50`;
        const result = await executeQuery(logs, crawlKey, sharedClient, query, [crawlHelpers.getCurrentUTCDate()]);
        if (result && result.rows && result.rows.length > 0)
            return result.rows;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getPendingArticles; error: ${error}, message: ${error.message}`);
    }
}

async function getRawArticlesWithNoRelativityScore(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): Promise<crawlTypes.ArticleInterface[] | undefined> {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In getRawArticlesWithNoRelativityScore;');
        const query = `SELECT *
                       FROM raw_article
                       WHERE (relativity_score IS NULL)
                         AND ("content" IS NOT NULL)
                       Limit 50;`;
        const result = await executeQuery(logs, crawlKey, sharedClient, query, []);
        if (result && result.rows && result.rows.length > 0)
            return result.rows;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getRawArticlesWithNoRelativityScore; error: ${error}, message: ${error.message}`);
    }
}

async function getArticlesWithNoAIFields(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): Promise<crawlTypes.ArticleInterface[] | undefined> {
    try {
        const startDate = new Date(Date.now() - (config.numberOfDaysForFirstCrawlAI * 24 * 60 * 60 * 1000));

        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In getArticlesWithNoAIFields;');
        const query = `SELECT *
                       FROM "article"
                       WHERE (
                               (industry IS NULL)
                               OR ("type" IS NULL)
                               OR (ai_summary IS NULL)
                               OR (ai_title IS NULL)
                               OR (viral_tendency IS NULL)
                           )
                         AND ("content" IS NOT NULL)
                         AND (published_date > $1)
                       limit 50`;
        const result = await executeQuery(logs, crawlKey, sharedClient, query, [startDate]);
        if (result && result.rows && result.rows.length > 0)
            return result.rows;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getArticlesWithNoAIFields; error: ${error}, message: ${error.message}`);
    }
}

async function getDayPrice(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, date: Date): Promise<number | undefined> {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In getDayPrice: ${date.toISOString()}`);

        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1; // getMonth() returns 0-11
        const day = date.getUTCDate();
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const priceQuery = `SELECT SUM
                                       (total_price) AS grand_total_price
                            FROM (SELECT SUM
                                             ((metadata ->> 'price') :: NUMERIC) AS total_price
                                  FROM article
                                  WHERE metadata IS NOT NULL
                                    AND published_date :: DATE = $1
                                  UNION ALL
                                  SELECT SUM
                                             ((metadata ->> 'price') :: NUMERIC) AS total_price
                                  FROM raw_article
                                  WHERE metadata IS NOT NULL
                                    AND published_date :: DATE = $2) AS combined_totals;`;
        const dayPriceResult = await executeQuery(logs, crawlKey, sharedClient, priceQuery, [formattedDate, formattedDate]);
        let dayPrice = 0;
        if (dayPriceResult && dayPriceResult.rows && dayPriceResult.rows.length > 0) {
            const totalPrice = parseFloat(dayPriceResult.rows[0].grand_total_price) || 0;
            dayPrice = Number(totalPrice.toFixed(2));
        }
        return dayPrice;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getDayPrice; date: ${date.toISOString()}; error: ${error}, message: ${error.message}`);
    }
}

async function getArticlesOfDate(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, date: Date): Promise<crawlTypes.SourceArticleInterface[] | undefined> {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In getArticlesOfDate: ${date.toISOString()}`);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1; // getMonth() returns 0-11
        const day = date.getUTCDate();

        const query = `
            SELECT src.id                AS source_id,
                   src.key               AS source_key,
                   src.created_at        AS source_created_at,
                   src.updated_at        AS source_updated_at,
                   src.last_build_date   AS source_last_build_date,
                   src.crawl_key         AS source_crawl_key,
                   src.name              AS source_name,
                   src.url               AS source_url,
                   src.original_url      AS source_original_url,
                   src.rss_url           AS source_rss_url,
                   src.icon_16_url       AS source_icon_16_url,
                   src.icon_32_url       AS source_icon_32_url,
                   src.icon_largest_url  AS source_icon_largest_url,
                   src.icon_16_path      AS source_icon_16_path,
                   src.icon_32_path      AS source_icon_32_path,
                   src.icon_largest_path AS source_icon_largest_path,
                   src.status            AS source_status,
                   src.type              AS source_type,
                   art.*
            FROM source AS src
                     JOIN article AS art ON src.key = art.source_key
            WHERE (DATE(art.published_date) = $1)
              AND (art.content IS NOT NULL)
              AND (art.industry IS NOT NULL)
              AND (art.type IS NOT NULL)
              AND (art.ai_title IS NOT NULL)
              AND (art.ai_summary IS NOT NULL)
              AND (art.viral_tendency IS NOT NULL)
              AND (art.metadata IS NOT NULL)
            ORDER BY src.name, art.published_date DESC
        `;

        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const result = await executeQuery(logs, crawlKey, sharedClient, query, [formattedDate]);
        if (result && result.rows && result.rows.length > 0) {
            const dayPrice = await getDayPrice(logs, crawlKey, sharedClient, date);

            const sourceArticlesMap: Record<string, crawlTypes.SourceArticleInterface> = {};
            for (const row of result.rows) {
                const sourceKey = row.source_key;
                if (!sourceArticlesMap[sourceKey]) {
                    sourceArticlesMap[sourceKey] = {
                        source: {} as crawlTypes.SourceInterface, // This will be populated below
                        articles: [],
                        day_price: dayPrice ?? 0
                    };
                }

                if (!sourceArticlesMap[sourceKey].source.id) {
                    // This means the source details haven't been populated yet
                    sourceArticlesMap[sourceKey].source = {
                        id: row.source_id,
                        key: row.source_key,
                        created_at: row.source_created_at,
                        updated_at: row.source_updated_at,
                        last_build_date: row.source_last_build_date,
                        crawl_key: row.source_crawl_key,
                        name: row.source_name,
                        url: row.source_url,
                        original_url: row.source_original_url,
                        rss_url: row.source_rss_url,
                        icon_16_url: row.source_icon_16_url,
                        icon_32_url: row.source_icon_32_url,
                        icon_largest_url: row.source_icon_largest_url,
                        icon_16_path: row.source_icon_16_path,
                        icon_32_path: row.source_icon_32_path,
                        icon_largest_path: row.source_icon_largest_path,
                        status: row.source_status,
                        type: row.source_type
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

            // Convert the map to an array
            return Object.values(sourceArticlesMap);
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getArticlesOfDate; date: ${date.toISOString()}; error: ${error}, message: ${error.message}`);
    }
}

async function getAllArticlesWithImage(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): Promise<crawlTypes.ArticleInterface[] | undefined> {
    try {
        //This function is only used in static generator when its is saving again all the images
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In getAllArticlesWithImage;');
        const query = `SELECT article.*
                       FROM article
                       WHERE image_url IS NOT NULL`;
        const result = await executeQuery(logs, crawlKey, sharedClient, query, []);
        if (result && result.rows && result.rows.length > 0)
            return result.rows;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getAllArticlesWithImage; error: ${error}, message: ${error.message}`);
    }
}

async function updateSource(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, source: crawlTypes.SourceInterface) {
    //Updates a source entry in the database and returns its key.
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, source.url, '', '', 'In updateSource;');
        const currentDate = crawlHelpers.getCurrentUTCDate();
        const formattedDate = currentDate.toISOString();
        // Constructing the query to update the specified fields
        const updateQuery = `
            UPDATE source
            SET last_build_date   = $1,
                crawl_key         = $2,
                name              = $3,
                url               = $4,
                original_url      = $5,
                rss_url           = $6,
                icon_16_url       = $7,
                icon_32_url       = $8,
                icon_largest_url  = $9,
                icon_16_path      = $10,
                icon_32_path      = $11,
                icon_largest_path = $12,
                status            = $13
            WHERE key = $14
            RETURNING key
        `;

        const icon_16_path = getIconPathWithoutConfigDir(source.icon_16_path);
        const icon_32_path = getIconPathWithoutConfigDir(source.icon_32_path);
        const icon_largest_path = getIconPathWithoutConfigDir(source.icon_largest_path);
        const params = [formattedDate, crawlKey, source.name, source.url, source.original_url, source.rss_url, source.icon_16_url, source.icon_32_url, source.icon_largest_url, icon_16_path, icon_32_path, icon_largest_path, source.status, source.key];
        const result = await executeQuery(logs, crawlKey, sharedClient, updateQuery, params);
        if (result && result.rows && result.rows.length > 0)
            return result.rows[0].key;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, source.url, '', '', `Error in updateSource; error: ${error}, message: ${error.message}`);
    }


    function getIconPathWithoutConfigDir(iconPath: string | null): string | null {
        if (!iconPath) {
            return null;
        }
        const iconsPath = crawlHelpers.getIconsPath();
        return iconPath.startsWith(iconsPath) ? iconPath.substring(iconsPath.length) : iconPath;
    }

}

async function initializeDatabase(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In initializeDatabase;', true);
        const dbConfig = config.database;
        pool = new Pool({
            user: dbConfig.user,
            host: dbConfig.host,
            database: dbConfig.database,
            password: dbConfig.password,
            port: dbConfig.port,
        });
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in initializeDatabase; error: ${error}, message: ${error.message}, stack: ${error.stack}`, true);
        throw error;
    }
}

async function getDatabaseVersion(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): Promise<number | undefined> {
    try {
        // Fetches all pending article entries from the database
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In getDatabaseVersion;');
        const query = `SELECT version as version
                       from database_info;`;
        const versionResult = await executeQuery(logs, crawlKey, sharedClient, query, []);
        if (versionResult && versionResult.rows && versionResult.rows.length > 0) {
            const versionNumber = Number(versionResult.rows[0].version);
            if (!isNaN(versionNumber)) {
                return versionNumber;
            }
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getDatabaseVersion; error: ${error}, message: ${error.message}`);
    }
}

async function finalizeDatabase(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        //Closes the database connection and exits the process.
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In finalizeDatabase;');
        await pool.end();
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in finalizeDatabase; error: ${error}, message: ${error.message}`, true);
    }
}

async function insertLog(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, log: crawlTypes.LogInterface) {
    // Inserts a single log entry into the database.
    const insertQuery = `INSERT INTO log (crawl_key, url, source_url, article_url, log_type, error_type, message,
                                          timestamp)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                         RETURNING id`;

    const params = [log.crawl_key, log.url, log.source_url, log.article_url, log.log_type,
        log.error_type, log.message, log.timestamp];

    const result = await executeQuery(logs, crawlKey, sharedClient, insertQuery, params);
    if (result && result.rows && result.rows.length > 0)
        return result.rows[0].key;
}

async function hasMatchingCrawlKeyInSource(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        //Checks if there's at least one row in the 'source' table with a matching 'crawlKey'
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In hasMatchingCrawlKeyInSource;');
        const query = `
            SELECT COUNT(*)
            FROM source
            WHERE crawl_key = $1
        `;
        const result = await executeQuery(logs, crawlKey, sharedClient, query, [crawlKey]);
        if (result && result.rows && result.rows.length > 0)
            return parseInt(result.rows[0].count, 10) >= 1;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in hasMatchingCrawlKeyInSource; error: ${error}, message: ${error.message}`);
    }
}

async function getAllSources(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): Promise<crawlTypes.SourceInterface[] | undefined> {
    try {
        //Fetches all source entries from the database.
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In getAllSources;');
        const query = `
            SELECT "source"."id",
                   "source"."key",
                   "source".last_build_date,
                   "source".crawl_key,
                   "source"."name",
                   "source".url,
                   "source".original_url,
                   "source".rss_url,
                   "source".icon_16_url,
                   "source".icon_16_path,
                   "source".icon_32_url,
                   "source".icon_32_path,
                   "source".icon_largest_url,
                   "source".icon_largest_path,
                   "source".status,
                   "source".type
            FROM source`;
        const result = await executeQuery(logs, crawlKey, sharedClient, query, []);
        if (result && result.rows && result.rows.length > 0)
            return result.rows;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getAllSources; error: ${error}, message: ${error.message}`);
    }
}

async function executeQuery(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, query: string, params: any[]): Promise<any> {
    const client = sharedClient || await pool.connect();
    try {
        return await client.query(query, params);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, client, '', '', '', `Error in executeQuery; query: ${query}; error: ${error}, message: ${error.message}`, true);
    } finally {
        if (!sharedClient)
            client.release();
    }
}

async function insertCrawl(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null) {
    try {
        //Inserts a new crawl entry into the database and returns its key.
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In insertCrawl');
        const query = `INSERT INTO crawl DEFAULT
                       VALUES
                       RETURNING key;`
        const result = await executeQuery(logs, crawlKey, sharedClient, query, []);
        if (result && result.rows && result.rows.length > 0)
            return result.rows[0].key;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in insertCrawl; error: ${error}, message: ${error.message}`);
    }
}

async function getValidSources(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): Promise<crawlTypes.SourceInterface[] | undefined> {
    //Fetches all source entries from the database.
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In getAllSources;');
        const query = `SELECT "source"."id",
                              "source"."key",
                              "source".last_build_date,
                              "source".crawl_key,
                              "source"."name",
                              "source".url,
                              "source".original_url,
                              "source".rss_url,
                              "source".icon_16_url,
                              "source".icon_16_path,
                              "source".icon_32_url,
                              "source".icon_32_path,
                              "source".icon_largest_url,
                              "source".icon_largest_path,
                              "source".status,
                              "source".type
                       FROM source
                       WHERE "source"."name" IS NOT NULL
                         AND (CASE
                                  WHEN "source".type = 'Directory' THEN TRUE
                                  WHEN "source".type = 'Website' THEN "source".rss_url IS NOT NULL
                                  ELSE FALSE
                           END)`;
        const result = await executeQuery(logs, crawlKey, sharedClient, query, []);
        if (result && result.rows && result.rows.length > 0)
            return result.rows;
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getAllSources; error: ${error}, message: ${error.message}`);
    }
}

async function getAffectedPublishDatesByCrawl(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): Promise<Date[] | undefined> {
    try {
        // Retrieves an array of unique publish dates (by date, not datetime) for articles associated with a specific crawl key.
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In getAffectedPublishDatesByCrawlKey;');
        const uniqueDates: Set<string> = new Set<string>();
        const query = `
            SELECT a.published_date
            FROM article a
            WHERE a.crawl_key = $1
              AND a.published_date IS NOT NULL
        `;
        const result = await executeQuery(logs, crawlKey, sharedClient, query, [crawlKey]);
        if (result && result.rows && result.rows.length > 0) {
            result.rows.forEach((row: any) => {
                uniqueDates.add(crawlHelpers.getDatePart(row.published_date));
            });
            return Array.from(uniqueDates).map((dateStr: string) => new Date(dateStr));
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getAffectedPublishDatesByCrawlKey; error: ${error}, message: ${error.message}`);
    }
}

async function getArticlesPublishDates(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): Promise<string[] | undefined> {
    try {
        // Retrieves an array of all the dates where an article is published
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In getArticlesPublishDates;');
        const uniqueDates: string[] = [];
        const query = `SELECT DISTINCT DATE(published_date) AS published_date
                       FROM article
                       WHERE published_date IS NOT NULL
                       ORDER BY DATE(published_date) DESC;`;
        const result = await executeQuery(logs, crawlKey, sharedClient, query, []);
        if (result && result.rows && result.rows.length > 0) {
            result.rows.forEach((row: any) => {
                uniqueDates.push(crawlHelpers.getDatePart(row.published_date));
            });
            return uniqueDates;
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in getArticlesPublishDates; error: ${error}, message: ${error.message}`);
    }
}

async function getOldestPublishDate(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): Promise<string | undefined> {
    try {
        // Retrieves the oldest publishing date from all articles in the database.
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', 'In getOldestPublishDate;');
        const query = `
            SELECT published_date
            FROM article
            WHERE published_date IS NOT NULL
            ORDER BY published_date
            LIMIT 1;
        `;
        const result = await executeQuery(logs, '', sharedClient, query, []);
        if (result && result.rows && result.rows.length > 0) {
            return crawlHelpers.getDatePart(result.rows[0].published_date);
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', '', sharedClient, '', '', '', `Error in getOldestPublishDate; error: ${error}, message: ${error.message}`);
    }
}

async function checkAndApplyUpdates(logs: crawlTypes.LogInterface[], crawlKey: string) {
    let currentVersion = await getDatabaseVersion(logs, crawlKey, null);
    const sharedClient: PoolClient | null = await pool.connect();
    try {
        await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, null, '', '', '', `in checkAndApplyUpdates; currentVersion: ${currentVersion}`);

        if (sharedClient) {
            async function beginUpdate() {
                await executeQuery(logs, crawlKey, sharedClient, 'BEGIN TRANSACTION;', []);
                await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `in beginUpdate; from version ${currentVersion} to ${(currentVersion || currentVersion == 0) ? currentVersion + 1 : -1}`);
            }

            async function endUpdate(ck: string) {
                if (currentVersion || currentVersion === 0)
                    await updatesHelpers.updateDatabaseVersion(logs, ck, sharedClient, currentVersion + 1);
                currentVersion = await getDatabaseVersion(logs, crawlKey, sharedClient);
                await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In endUpdate; new currentVersion: ${currentVersion}`);
                await executeQuery(logs, crawlKey, sharedClient, 'COMMIT TRANSACTION;', []);
            }

            //Changes in version 1: make all the sources have Pending status to update their icon and names
            if (currentVersion === 0) {
                await beginUpdate();
                await executeQuery(logs, crawlKey, sharedClient, 'UPDATE source SET status = \'Pending\';', []);
                await endUpdate(crawlKey);
            }

            // Changes in version 2:
            if (currentVersion === 1) {
                await beginUpdate();
                // 1- remove duplicate sources and update their respective articles.
                const ck = await insertCrawl(logs, crawlKey, sharedClient);
                await updatesHelpers.updateArticlesOfDuplicateSources(logs, ck, sharedClient);
                await updatesHelpers.removeDuplicateSources(logs, ck, sharedClient);
                await updatesHelpers.addUniqueConstraintToSource(logs, ck, sharedClient);

                // 2- add original date field and set articles of future to today and save their real date in the added field
                await updatesHelpers.addOriginalPublishedDateField(logs, ck, sharedClient);
                await updatesHelpers.updateOneFutureArticle(logs, ck, sharedClient);
                await updatesHelpers.updateAllArticlesOriginalPublishedDates(logs, ck, sharedClient);

                const affectedPublishDatesByCrawl = await getAffectedPublishDatesByCrawl(logs, ck, sharedClient);
                if (affectedPublishDatesByCrawl && affectedPublishDatesByCrawl.length > 0)
                    await crawlHelpers.getAndSaveAffectedArticlesByCrawl(logs, ck, sharedClient, affectedPublishDatesByCrawl);

                // make all the sources have Pending status to update their icon sizes
                await executeQuery(logs, crawlKey, sharedClient, 'UPDATE source SET status = \'Pending\';', []);
                await executeQuery(logs, crawlKey, sharedClient, 'DELETE FROM log WHERE created_at < \'2024-04-21\';', []);
                await endUpdate(crawlKey);
            }

            // Changes in version 3:
            if (currentVersion === 2) {
                await beginUpdate();

                // The approved sources that do not have rss and should be crawled using a custom crawler
                await updatesHelpers.addSplunkToDb(logs, crawlKey, sharedClient);
                await updatesHelpers.addCassandraToDb(logs, crawlKey, sharedClient);
                await updatesHelpers.addMongodbToDb(logs, crawlKey, sharedClient);
                await updatesHelpers.addSqliteToDb(logs, crawlKey, sharedClient);
                await updatesHelpers.updateCockroachInDb(logs, crawlKey, sharedClient);

                //for AI integration and content categorization task
                await updatesHelpers.addMultipleFields(logs, crawlKey, sharedClient);

                //Add hacker news directory
                await updatesHelpers.addHackerNewsToDb(logs, crawlKey, sharedClient);
                await updatesHelpers.createRawArticleTable(logs, crawlKey, sharedClient);

                await executeQuery(logs, crawlKey, sharedClient, 'UPDATE source SET status = \'Pending\';', []); //For icons

                //Remove some non-valid sources
                const ck = await insertCrawl(logs, crawlKey, sharedClient);
                await updatesHelpers.removeMongoBlogAndArticles(logs, crawlKey, sharedClient);
                await updatesHelpers.removeSlashbaseWithArticles(logs, crawlKey, sharedClient);
                await updatesHelpers.removeHexTechWithArticles(logs, crawlKey, sharedClient);
                await updatesHelpers.UpdateYugabyteFeed(logs, crawlKey, sharedClient);
                const affectedPublishDatesByCrawl = await getAffectedPublishDatesByCrawl(logs, ck, sharedClient);
                if (affectedPublishDatesByCrawl && affectedPublishDatesByCrawl.length > 0)
                    await crawlHelpers.getAndSaveAffectedArticlesByCrawl(logs, ck, sharedClient, affectedPublishDatesByCrawl);
                await executeQuery(logs, crawlKey, sharedClient, 'DELETE FROM log WHERE created_at < \'2024-06-16\';', []);

                await updatesHelpers.updateOldArticlesNextRetryAt(logs, crawlKey, sharedClient);

                await endUpdate(crawlKey);
            }
            return true;
        } else {
            return false;
        }
    } catch (error: any) {
        await executeQuery(logs, crawlKey, sharedClient, 'ROLLBACK;', []);
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, null, '', '', '', `Error in checkAndApplyUpdates; error: ${error}, message: ${error.message}`);
        return false;
    } finally {
        sharedClient?.release();
    }
}

async function updateArticleNextRetryAt(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, article: crawlTypes.ArticleInterface): Promise<any> {
    try {
        const now = new Date();
        const createdAt = new Date(article.created_at);
        const timeDifference = now.getTime() - createdAt.getTime();
        article.next_retry_at = new Date(createdAt.getTime() + (timeDifference * 2))
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Database', crawlKey, sharedClient, '', '', '', `Error in updateArticleNextRetryAt; error: ${error}, message: ${error.message}`);
    }
}

export {
    insertArticle,
    updateArticle,
    getPendingArticles,
    getRawArticlesWithNoRelativityScore,
    getArticlesOfDate,
    getAllArticlesWithImage,
    updateSource,
    hasMatchingCrawlKeyInSource,
    getAllSources,
    getValidSources,
    executeQuery,
    insertCrawl,
    getAffectedPublishDatesByCrawl,
    getOldestPublishDate,
    insertLog,
    initializeDatabase,
    finalizeDatabase,
    getDatabaseVersion,
    checkAndApplyUpdates,
    getArticlesPublishDates,
    pool,
    getArticlesWithNoAIFields,
    updateArticleNextRetryAt
};