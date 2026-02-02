import {load} from 'cheerio';
import {PoolClient} from "pg";

import * as databaseInteractions from '../databaseInteractions';
import * as crawlHelpers from '../crawlHelpers';
import * as crawlTypes from '../crawlTypes';
import config from "../../config.json";

const directoryUrl: string = 'https://www.mongodb.com/developer/products/mongodb/';
const baseURL: string = 'https://www.mongodb.com/developer/products/mongodb/?page=';
const pageCount = 5;

async function mongodbCrawler(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, sourceKey: string, sourceUrl: string): Promise<void> {
    let pageUrl: any;
    let postUrl, postTitle, postDate: string | undefined;
    let postDateObj: Date;
    let article: crawlTypes.ArticleInterface;
    const todayDate: Date = crawlHelpers.getCurrentUTCDate();
    const startDate = new Date(Date.now() - (config.numberOfDaysForFirstCrawl * 24 * 60 * 60 * 1000));
    for (let page = 1; page <= pageCount; page++) {
        try {
            pageUrl = `${baseURL}${page}`;
            const responseData = await crawlHelpers.fetchWithAxios(logs, crawlKey, sharedClient, pageUrl, 'text', 'mongodbCrawler');
            if (responseData) {
                const $ = load(responseData);
                const articlesContainer = $("div.css-oebmgh");
                const articleCards = articlesContainer.find("div.css-1aua6ms").toArray();

                for (const element of articleCards) {
                    const card = $(element);
                    postTitle = card.find('h3.css-dqcyg4').text().trim();
                    postUrl = card.find('a.css-1apkjyk').attr('href')?.trim();
                    postDate = card.find('span.css-pyhu12').text().trim();
                    postDateObj = extractLeftDate(postDate);

                    if (postUrl && !crawlHelpers.isAbsoluteUrl(postUrl)) {
                        postUrl = crawlHelpers.toAbsoluteUrl(baseURL, postUrl);
                    }

                    //Exit if article's published date is older than 30 days
                    if (postDateObj < startDate)
                        return;

                    article = {
                        created_at: "",
                        id: 0,
                        key: "",
                        updated_at: "",
                        crawl_key: crawlKey,
                        source_key: sourceKey,
                        title: postTitle,
                        url: postUrl ? crawlHelpers.cleanUrl(postUrl) : '',
                        original_url: postUrl ? postUrl : '',
                        published_date: postDateObj > todayDate ? todayDate : postDateObj,
                        original_published_date: postDateObj,
                        image_path: null,
                        image_path_2x: null,
                        image_url: null,
                        image_alt: null,
                        summary: null,
                        original_summary: null,
                        content: null,
                        industry: null,
                        type: null,
                        ai_summary: null,
                        ai_title: null,
                        relativity_score: null,
                        viral_tendency: null,
                        metadata: null,
                        next_retry_at: null,
                        status: "Pending"
                    };

                    const insertArticleResult = await databaseInteractions.insertArticle(logs, crawlKey, sharedClient, article);
                    if (insertArticleResult && insertArticleResult !== -1) {
                        article.key = insertArticleResult;
                        await crawlHelpers.getArticleDetails(logs, crawlKey, sharedClient, article, true, sourceUrl);
                        await databaseInteractions.updateArticle(logs, crawlKey, sharedClient, article);
                    }
                }
            }
        } catch (error: any) {
            await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, undefined, pageUrl, `Error in mongodbCrawler; error: ${error}, message: ${error.message}`);
        }
    }

    function extractLeftDate(dateRange: string): Date {
        const dates = dateRange.split(" - ");
        if (dates.length === 1) {
            const singleDateString = dates[0].trim();
            return new Date(singleDateString);
        }
        const leftDateString = dates[0].trim();
        return new Date(leftDateString);
    }
}

export {mongodbCrawler, directoryUrl};
