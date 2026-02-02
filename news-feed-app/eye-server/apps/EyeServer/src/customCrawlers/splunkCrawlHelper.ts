import {load} from 'cheerio';
import {PoolClient} from "pg";

import * as databaseInteractions from '../databaseInteractions';
import * as crawlHelpers from '../crawlHelpers';
import * as crawlTypes from '../crawlTypes';
import config from "../../config.json";

const directoryUrl: string = 'https://www.splunk.com/en_us/blog';
const baseURL: string = 'https://www.splunk.com/en_us/blog?p=';
const pageCount = 5;

async function splunkCrawler(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, sourceKey: string, sourceUrl: string): Promise<void> {
    let pageUrl: any;
    let postUrl, postTitle, postDate: string | undefined;
    let postDateObj: Date;
    let article: crawlTypes.ArticleInterface;
    const todayDate: Date = crawlHelpers.getCurrentUTCDate();
    const startDate = new Date(Date.now() - (config.numberOfDaysForFirstCrawl * 24 * 60 * 60 * 1000));

    for (let page = 1; page <= pageCount; page++) {
        try {
            pageUrl = `${baseURL}${page}`;
            const responseData = await crawlHelpers.fetchWithAxios(logs, crawlKey, sharedClient, pageUrl, 'text', 'splunkCrawler');
            if (responseData) {
                const $ = load(responseData);
                const latestArticlesSection = $("h2.splunk2-h2.section-title:contains('Latest Articles')");
                const articlesContainer = latestArticlesSection.nextAll('.latest-blogs-container').first()
                const articles = articlesContainer.find('.card').toArray();
                for (const element of articles) {
                    const card = $(element);
                    if (card) {
                        // @ts-ignore
                        postUrl = card.find('a.headline').attr('href').trim();
                        postTitle = card.find('h3').text().trim();

                        if (postUrl && !crawlHelpers.isAbsoluteUrl(postUrl)) {
                            postUrl = crawlHelpers.toAbsoluteUrl(baseURL, postUrl);
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
                            published_date: todayDate,
                            original_published_date: todayDate,
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

                        //Update the date here, because the date is in the article page itself
                        const postHtmlData = await crawlHelpers.getArticleDetails(logs, crawlKey, sharedClient, article, true, sourceUrl);
                        const $ = load(postHtmlData);
                        postDate = $('.splunkBlogsArticle-header-date').text().trim();
                        postDateObj = new Date(postDate);
                        article.published_date = postDateObj > todayDate ? todayDate : postDateObj;
                        article.original_published_date = postDateObj;

                        //Exit if article's published date is older than 30 days
                        if (postDateObj < startDate)
                            return;

                        const insertArticleResult = await databaseInteractions.insertArticle(logs, crawlKey, sharedClient, article);
                        if (insertArticleResult && insertArticleResult !== -1) {
                            article.key = insertArticleResult;
                            await databaseInteractions.updateArticle(logs, crawlKey, sharedClient, article);
                        }

                    }
                }
            }
        } catch (error: any) {
            await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, undefined, pageUrl, `Error in splunkCrawler; error: ${error}, message: ${error.message}`);
        }
    }
}

export {splunkCrawler, directoryUrl};
