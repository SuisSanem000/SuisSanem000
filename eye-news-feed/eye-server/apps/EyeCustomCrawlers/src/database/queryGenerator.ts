import * as fs from 'fs';
import * as databaseTools from './databaseTools';
import * as crawlTypes from '../crawlTypes';

const inputFilePath = 'src/database/sources/links.txt';
const outputSqlFilePath = 'src/database/queries/insertQueries.sql';
const outputPostgresSqlFilePath = 'src/database/queries/postgresInsertQueries.sql';

// Reads a text file containing URLs line by line and then generates SQLite insert queries for each URL.
async function transformLinksToSqliteQueries(inputFilePath: string, outputSqlFilePath: string) {
    try {
        const lines = fs.readFileSync(inputFilePath, 'utf-8').split('\n');
        const sqlQueries: string[] = [];
        for (const line of lines) {
            if (line.trim() !== '') {
                const url = line.trim();
                const sqlQuery = `INSERT INTO source (url, original_url, origin, status) VALUES ('${url}', '${url}', 'manual', 'Pending');`;
                sqlQueries.push(sqlQuery);
            }
        }
        fs.writeFileSync(outputSqlFilePath, sqlQueries.join('\n'));
        console.log('Transformation complete. SQL and JSON files saved.');
    } catch (error) {
        console.error('Error in transformLinksToSqliteQueries:', error);
    }
}

// Fetches sources with RSS from the database using `databaseTools`.
async function generatePostgresQueries() {
    try {
        const sources: crawlTypes.SourceInterface[] = await databaseTools.getSourcesWithRSS();
        const sqlQueries: string[] = [];
        for (const source of sources) {
            if (source.url) {
                const sqlQuery = `INSERT INTO "public"."source" ("url", "status") VALUES ('${source.url}', 'Pending') ON CONFLICT (url) DO NOTHING RETURNING *;`;
                sqlQueries.push(sqlQuery);
            }
        }
        fs.writeFileSync(outputPostgresSqlFilePath, sqlQueries.join('\n'));
        console.log('Postgres SQL file saved.');
    } catch (error) {
        console.error('Error in generatePostgresQueries:', error);
    }
}

async function mainQueryGenerator(): Promise<void> {
    try {
        await databaseTools.initDatabase();
        transformLinksToSqliteQueries(inputFilePath, outputSqlFilePath);
        generatePostgresQueries();
    } catch (error) {
        console.error(`Error in mainQueryGenerator: ${error}`);
    } finally {
        await databaseTools.finalizeDatabase();
    }
}

mainQueryGenerator();