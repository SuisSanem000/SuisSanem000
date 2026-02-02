import {load} from 'cheerio';
import * as crawlHelpers from './crawlHelpers';
import * as crawlTypes from './crawlTypes';
import * as databaseTools from './database/databaseTools';

const baseUrl = 'https://dbdb.io/browse';
const limitCount = 1000;

interface itemInterface {
    name: string;
    value: string;
}

async function fetchSourceData(sourceUrl: string): Promise<crawlTypes.SourceInterface | undefined> {
    const itemsToMatch: itemInterface[] = [
        {name: 'Website', value: ''},
        {name: 'Source Code', value: ''},
        {name: 'Tech Docs', value: ''},
        {name: 'Twitter', value: ''},
        {name: 'Developer', value: ''},
        {name: 'Country of Origin', value: ''},
        {name: 'Start Year', value: ''},
        {name: 'Project Type', value: ''},
        {name: 'Written in', value: ''},
        {name: 'Operating Systems', value: ''},
        {name: 'Licenses', value: ''},
        {name: 'Wikipedia', value: ''}
    ];

    try {
        console.log('In fetchSourceData(); url: ', sourceUrl);
        const responseData = await crawlHelpers.fetchWithAxios(sourceUrl, 'text');
        if (responseData) {
            const $ = load(responseData);
            const tagsText = getTagsText($, '.jumbotron .system-content .col-md-7 .card.has-citations .card-body');
            populateValues($);
            const websiteItem = itemsToMatch.find(item => item.name === 'Website');
            const websiteUrl = websiteItem ? websiteItem.value : null;
            if (websiteUrl) {
                return {
                    id: null,
                    name: null,
                    rss_url: null,
                    origin: 'dbdb',
                    crawl_date: new Date().toISOString(),
                    status: 'Pending',
                    original_url: websiteUrl,
                    rank: null,
                    url: websiteUrl,
                    tags: tagsText,
                    source_code: itemsToMatch.find(item => item.name === 'Source Code')?.value || null,
                    tech_docs: itemsToMatch.find(item => item.name === 'Tech Docs')?.value || null,
                    twitter: itemsToMatch.find(item => item.name === 'Twitter')?.value || null,
                    developer: itemsToMatch.find(item => item.name === 'Developer')?.value || null,
                    country_of_origin: itemsToMatch.find(item => item.name === 'Country of Origin')?.value || null,
                    start_year: itemsToMatch.find(item => item.name === 'Start Year')?.value || null,
                    project_type: itemsToMatch.find(item => item.name === 'Project Type')?.value || null,
                    written_in: itemsToMatch.find(item => item.name === 'Written in')?.value || null,
                    operating_systems: itemsToMatch.find(item => item.name === 'Operating Systems')?.value || null,
                    licenses: itemsToMatch.find(item => item.name === 'Licenses')?.value || null,
                    wikipedia: itemsToMatch.find(item => item.name === 'Wikipedia')?.value || null,
                };
            } else {
                console.log('No website URL found for:', sourceUrl);
            }
        } else {
            console.log('No response data for URL:', sourceUrl);
        }
    } catch (error) {
        console.error(`Error in fetch source data: ${error}`);
    }

    function getTagsText($: any, baseSelector: string) {
        const cardTitle = $(`${baseSelector} .card-title`).next();
        const cardText = $(`${baseSelector} .card-text`).prev();
        let texts = [];
        let currentElement = cardTitle;
        while (currentElement.length > 0 && currentElement.get(0) !== cardText.get(0)) {
            if (currentElement.is('a')) {
                const textLines = currentElement.text().split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
                texts.push(...textLines);
            }
            currentElement = currentElement.next();
        }
        return texts.join(', ');
    };

    function populateValues($: any) {
        const parentElement = $('body > div.jumbotron > div > div.col-sm-12.col-md-3.order-1.order-md-2 > div.card.has-citations > div');
        itemsToMatch.forEach(item => {
            const h6Element = parentElement.find(`h6.card-title:contains("${item.name}")`);
            if (h6Element.length > 0) {
                const pElement = h6Element.next('p.card-text');
                if (pElement.length > 0) {
                    item.value = pElement.text();
                }
            }
        });
    }
}

async function crawlSources(): Promise<crawlTypes.SourceInterface[] | undefined> {
    try {
        const responseData = await crawlHelpers.fetchWithAxios(baseUrl, 'text');
        if (responseData) {
            const $ = load(responseData);
            const elements = $('div.card-columns').find('a.card-title').toArray();
            const sources: crawlTypes.SourceInterface[] = [];
            let maxConcurrentCrawls = 4;
            let activeCrawls = 0;
            let currentIndex = 0;

            const crawlNext = async (): Promise<void> => {
                if (sources.length < limitCount && currentIndex < elements.length && activeCrawls < maxConcurrentCrawls) {
                    activeCrawls++;
                    const relativePath = $(elements[currentIndex++]).attr('href');
                    if (relativePath) {
                        const absolutePath = new URL(relativePath, baseUrl).href;
                        try {
                            const fetchData = await fetchSourceData(absolutePath);
                            if (fetchData) {
                                sources.push(fetchData);
                                console.log(`sources.length: ${sources.length}, limitCount: ${limitCount}`)
                                if (sources.length === limitCount) {
                                    console.log('Break loop;')
                                    return;
                                }
                            }
                        } catch (error) {
                            console.error(`Error fetching source data: ${error}`);
                        }
                    }
                    activeCrawls--;
                    await crawlNext();
                }
            }
            const threads = Array(maxConcurrentCrawls).fill(null).map(() => crawlNext());
            await Promise.all(threads);
            return sources;
        }
    } catch (error) {
        console.error(`Error in crawlSources: ${error}`);
    }
}

async function dbdbCrawler(): Promise<void> {
    const startTime = new Date();
    let sources: crawlTypes.SourceInterface[] | undefined;
    try {
        console.log('In dbdbCrawler; start');
        await databaseTools.initDatabase();
        const sources = await crawlSources();
        if (sources && sources.length > 0)
            await databaseTools.insertSources(sources);
        console.log('In dbdbCrawler; finish');
    } catch (error) {
        console.error(`Error in dbdbCrawler: ${error}`);
    } finally {
        const endTime: Date = new Date();
        const msg = `Total time taken for dbdbCrawler: ${(endTime.getTime() - startTime.getTime()) / 1000} seconds; Sources processed: ${sources ? sources.length : -1}`;
        console.log(msg);
        await databaseTools.finalizeDatabase();
    }
}

dbdbCrawler();
