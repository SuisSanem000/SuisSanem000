import {load} from 'cheerio';
import {PoolClient} from "pg";

import * as databaseInteractions from '../databaseInteractions';
import * as crawlHelpers from '../crawlHelpers';
import * as crawlTypes from '../crawlTypes';
import config from "../../config.json";

const directoryUrl: string = 'https://www.cockroachlabs.com/blog/';
const baseURL: string = 'https://www.cockroachlabs.com/blog/?page=';
const pageCount = 5;

async function cockroachCrawler(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, sourceKey: string, sourceUrl: string): Promise<void> {
    let pageUrl: any;
    let postUrl, postTitle, postDate, postSummary: string | undefined;
    let postDateObj: Date;
    let article: crawlTypes.ArticleInterface;
    const todayDate: Date = crawlHelpers.getCurrentUTCDate();
    const startDate = new Date(Date.now() - (config.numberOfDaysForFirstCrawl * 24 * 60 * 60 * 1000));
    for (let page = 1; page <= pageCount; page++) {
        try {
            pageUrl = `${baseURL}${page}`;
            const responseData = await crawlHelpers.fetchWithAxios(logs, crawlKey, sharedClient, pageUrl, 'text', 'cockroachCrawler');
            if (responseData) {
                const $ = load(responseData);
                const articlesContainer = $("div[class*='mx-3'][class*='grid']");
                const articleCards = articlesContainer.find('div.mb-12.px-3').toArray();
                for (const element of articleCards) {
                    const card = $(element);
                    const mainDiv = card.find('div').eq(1);
                    const anchorElement = mainDiv.find('a');
                    postUrl = anchorElement.attr('href')?.trim();
                    postTitle = anchorElement.find('p').text().trim();
                    postSummary = anchorElement.next('p').text().trim();
                    postDate = card.find('div.flex.items-center p').eq(1).text().trim();
                    postDateObj = new Date(postDate);
                    if (postUrl && !crawlHelpers.isAbsoluteUrl(postUrl))
                        postUrl = crawlHelpers.toAbsoluteUrl(baseURL, postUrl);

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
                        summary: postSummary ? (await crawlHelpers.htmlToPlainText(logs, crawlKey, sharedClient, postSummary) ?? postSummary) : null,
                        original_summary: postSummary ?? null,
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
            await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, undefined, pageUrl, `Error in cockroachCrawler; error: ${error}, message: ${error.message}`);
        }
    }
}

export {cockroachCrawler, directoryUrl};
