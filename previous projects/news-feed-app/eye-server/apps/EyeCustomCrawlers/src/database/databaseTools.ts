import sqlite3 from 'sqlite3';
import {open, Database} from 'sqlite';
import path from "path";
import * as crawlTypes from '../crawlTypes';
import config from '../../config.json';

let db: Database;

async function initDatabase() {
    db = await open({
        filename: path.join(config.database.dir, config.database.name),
        driver: sqlite3.Database
    });

}

async function insertSources(sources: crawlTypes.SourceInterface[]) {
    try {
        console.log('In insertSources');
        if (sources) {
            await db.exec(`
                CREATE TABLE IF NOT EXISTS source
                (
                    id                INTEGER PRIMARY KEY AUTOINCREMENT, 
                    name              TEXT,
                    original_url      TEXT,
                    url               TEXT,
                    origin            TEXT,
                    rss_url           TEXT,
                    status            TEXT,
                    crawl_date        TEXT,
                    rank              TEXT,
                    tags              TEXT,
                    source_code       TEXT,
                    tech_docs         TEXT,
                    twitter           TEXT,
                    developer         TEXT,
                    country_of_origin TEXT,
                    start_year        TEXT,
                    project_type      TEXT,
                    written_in        TEXT,
                    operating_systems TEXT,
                    licenses          TEXT,
                    wikipedia         TEXT
                )
            `);

            await db.run('BEGIN TRANSACTION');
            const statement = await db.prepare(`
                INSERT INTO source (name,
                                    original_url,
                                    url,
                                    origin,
                                    rss_url,
                                    status,
                                    crawl_date,
                                    rank,
                                    tags,
                                    source_code,
                                    tech_docs,
                                    twitter,
                                    developer,
                                    country_of_origin,
                                    start_year,
                                    project_type,
                                    written_in,
                                    operating_systems,
                                    licenses,
                                    wikipedia)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT ( original_url ) DO UPDATE
                    SET name = excluded.name
            `);
            for (const source of sources) {
                try {
                    await statement.run(
                        source.name, source.original_url, source.url, source.origin, source.rss_url, source.status,
                        source.crawl_date, source.rank, source.tags, source.source_code, source.tech_docs, source.twitter, source.developer, source.country_of_origin,
                        source.start_year, source.project_type, source.written_in, source.operating_systems, source.licenses,
                        source.wikipedia
                    );
                } catch (error) {
                    console.error('Error inserting source:', error, source);
                }
            }
            await statement.finalize();
            await db.run('COMMIT');
        }
    } catch (error) {
        console.error('Error inserting sources:', error);
    }
}

async function updateSources(sources: crawlTypes.SourceInterface[] | undefined) {
    try {
        if (sources) {
            console.log('in updateSources; sources length: ', sources.length);
            await db.run('BEGIN TRANSACTION');
            const statement = await db.prepare(`
                UPDATE source
                SET name       = ?,
                    url        = ?,
                    origin     = ?,
                    rss_url    = ?,
                    status     = ?,
                    crawl_date = ?
                WHERE original_url = ?
            `);

            for (const source of sources) {
                console.log('in updateSources; source: ', JSON.stringify(source));
                await statement.run([
                    source.name,
                    source.url,
                    source.origin,
                    source.rss_url,
                    source.status,
                    source.crawl_date,
                    source.original_url
                ]);
            }

            await statement.finalize();
            await db.run('COMMIT');
        }
    } catch (error) {
        console.error('Error updating sources:', error);
    }
}

async function getSourcesWithRSS(): Promise<crawlTypes.SourceInterface[]> {
    try {
        return await db.all<crawlTypes.SourceInterface[]>(`
            SELECT *
            FROM source
            WHERE rss_url IS NOT NULL
        `);
    } catch (error) {
        console.error('Error fetching sources:', error);
        return [];
    }
}

async function getSourcesWithNullRSS(): Promise<crawlTypes.SourceInterface[] | undefined> {
    try {
        return await db.all<crawlTypes.SourceInterface[]>(`
            SELECT *
            FROM source
            WHERE (rss_url IS NULL)
              AND (origin = 'dbEngines')
        `);
    } catch (error) {
        console.error('Error fetching sources:', error);
    }
}

async function finalizeDatabase() {
    try {
        await db.close();
    } catch (error) {
        console.error('Error closing database:', error);
    }
}

export {
    initDatabase,
    insertSources,
    updateSources,
    getSourcesWithNullRSS,
    finalizeDatabase,
    getSourcesWithRSS
}