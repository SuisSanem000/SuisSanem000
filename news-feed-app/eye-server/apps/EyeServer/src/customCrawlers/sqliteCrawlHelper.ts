import {load} from 'cheerio';
import {PoolClient} from "pg";

import * as databaseInteractions from '../databaseInteractions';
import * as crawlHelpers from '../crawlHelpers';
import * as crawlTypes from '../crawlTypes';
import config from "../../config.json";

const directoryUrl: string = 'https://www.sqlite.org/news.html';

async function sqliteCrawler(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, sourceKey: string, sourceUrl: string): Promise<void> {
    try {
        let postUrl, postTitle, postDate: string | undefined;
        let articleSummary: string | undefined;
        let postDateObj: Date;
        let article: crawlTypes.ArticleInterface;
        let count = 0;
        const maxArticles = 5;

        const todayDate: Date = crawlHelpers.getCurrentUTCDate();
        const startDate = new Date(Date.now() - (config.numberOfDaysForFirstCrawl * 24 * 60 * 60 * 1000));
        const responseData = await crawlHelpers.fetchWithAxios(logs, crawlKey, sharedClient, directoryUrl, 'text', 'sqliteCrawler');
        if (responseData) {
            const $ = load(responseData);
            const articles = $('h3').toArray();
            for (const element of articles) {
                if (count >= maxArticles)
                    break;
                const card = $(element);

                // Extract the date and the link information
                const dateAndLinkText = card.text().trim().split(" - ");
                const linkElement = card.find('a');
                const linkText = linkElement.text().trim();

                postDate = dateAndLinkText[0]?.trim();
                articleSummary = card.next('blockquote').text().trim();
                postTitle = `${postDate} - ${linkText}`;
                postUrl = linkElement.attr('href')?.trim();
                postDateObj = new Date(postDate);

                if (postUrl && !crawlHelpers.isAbsoluteUrl(postUrl)) {
                    postUrl = crawlHelpers.toAbsoluteUrl(directoryUrl, postUrl);
                }

                if (postDateObj < startDate) {
                    return;
                }

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
                    summary: articleSummary,
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
                    await crawlHelpers.getArticleDetails(logs, crawlKey, sharedClient, article,true, sourceUrl);
                    await databaseInteractions.updateArticle(logs, crawlKey, sharedClient, article);
                }
                count++;
            }
        }
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, undefined, directoryUrl, `Error in sqliteCrawler; error: ${error}, message: ${error.message}`);
    }
}

export {sqliteCrawler, directoryUrl};
