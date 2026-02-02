import {load} from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import * as crawlHelpers from './crawlHelpers';
import * as crawlTypes from './crawlTypes';
import * as databaseTools from './database/databaseTools';
import {URL} from "url";

const mainDomain = 'https://db-engines.com/en/ranking';
const limitCount = 200;

interface itemInterface {
    url: string;
    rank: string;
    name: string;
}

async function crawlSources(): Promise<crawlTypes.SourceInterface[] | undefined> {
    try {
        console.log('In crawlSources.');
        let items: itemInterface [] = [];
        let sources: crawlTypes.SourceInterface [] = [];
        const responseData = await crawlHelpers.fetchWithAxios(mainDomain, 'text');
        if (responseData) {
            //Save html
            const sourceName = crawlHelpers.getValidFileAndUrlName(mainDomain);
            const htmlDir = crawlHelpers.getSourceLogPathHtml(sourceName);
            const htmlFileName = `${crawlHelpers.getValidFileAndUrlName(mainDomain)}.html`;
            const htmlPath = path.join(htmlDir, htmlFileName);
            fs.writeFileSync(htmlPath, responseData);
            console.log(`In crawlSources; responseData saved as ${htmlPath}`);
            const $ = load(responseData);

            // Part 1: Iterate over the ranking rows and extract rank and url
            const tableSelector = 'body > table:nth-of-type(3) > tbody > tr > td:nth-of-type(2) > div > div:nth-of-type(1) > table:nth-of-type(1)';
            const rows = $(`${tableSelector} > tbody > tr`);
            rows.each((index, element) => {
                if (index > 0) {
                    let rankRaw = $(element).find('td').first().text().trim();
                    let rankNumber = parseInt(rankRaw.replace('.', ''), 10);
                    if (rankNumber > limitCount) {
                        return false;
                    }

                    let rank = rankNumber.toString();
                    const url = $(element).find('th a').attr('href');
                    const name = $(element).find('th a').text().trim();

                    if (url) {
                        const urlEngineRanking = new URL(url, mainDomain).href;
                        items.push({url: urlEngineRanking, rank: rank, name: name});
                    }
                }
            });

            // Part 2: Fetch the website's page for each database system and extract the website URL
            for (const item of items) {
                try {
                    const dbResponseData = await crawlHelpers.fetchWithAxios(item.url, 'text');
                    if (dbResponseData) {
                        const $ = load(dbResponseData);
                        const websiteLinkSelector = 'td.attribute:contains("Website") + td.value > a';
                        const websiteUrl = $(websiteLinkSelector).attr('href');
                        console.log('WebsiteUrl: ', websiteUrl);

                        if (websiteUrl) {
                            sources.push({
                                id: null,
                                name: item.name,
                                original_url: websiteUrl,
                                url: websiteUrl,
                                origin: 'dbEngines',
                                rss_url: null,
                                status: 'Pending',
                                crawl_date: new Date().toISOString(),
                                rank: item.rank,
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
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error in crawlSources for fetching database system page: ${error}`);
                }
            }
            return sources;
        }
    } catch (error) {
        console.error(`Error in crawlSources: ${error}`);
    }
}

async function dbEnginesCrawler(): Promise<void> {
    const startTime = new Date();
    let sources: crawlTypes.SourceInterface [] | undefined;
    try {
        await databaseTools.initDatabase();
        sources = await crawlSources();
        if (sources && sources.length > 0) {
            await databaseTools.insertSources(sources);
        }
        console.log('In dbEnginesCrawler; finish; sources: ', JSON.stringify(sources));
    } catch (error) {
        console.error(`Error in dbEnginesCrawler: ${error}`);
    } finally {
        const endTime: Date = new Date();
        const msg = `Total time taken for dbEnginesCrawler: ${(endTime.getTime() - startTime.getTime()) / 1000} seconds`;
        console.log(msg);
        await databaseTools.finalizeDatabase();
    }
}

dbEnginesCrawler();