import {load} from 'cheerio';
import {PoolClient} from "pg";

import * as databaseInteractions from '../../databaseInteractions';
import * as crawlHelpers from '../../crawlHelpers';
import * as crawlTypes from '../../crawlTypes';

const directoryUrl: string = 'https://news.ycombinator.com/news';
// const itemUrl: string = 'https://news.ycombinator.com/item?id='; //TODO: for comparing viral tendency
const baseURL: string = 'https://news.ycombinator.com/news?p=';
const pageCount = 3;

async function hackerNewsCrawler(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, sourceKey: string, sourceUrl: string): Promise<void> {
    let pageUrl: any;
    let postUrl, postTitle, postDate: string | undefined;
    let postDateObj: Date;
    let article: crawlTypes.ArticleInterface;
    const todayDate = crawlHelpers.getCurrentUTCDate();
    const startDate = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000));
    for (let page = 1; page <= pageCount; page++) {
        try {
            pageUrl = `${baseURL}${page}`;
            let responseData = await crawlHelpers.fetchWithAxios(logs, crawlKey, sharedClient, pageUrl, 'text', 'hackerNewsCrawler');
            if (responseData) {
                const $ = load(responseData);
                const stories = $('.athing').toArray();
                for (const element of stories) {
                    postTitle = $(element).find('.titleline a').first().text().trim();
                    postUrl = $(element).find('.titleline a').attr('href');
                    postDate = $(element).next('.subtext').find('.age').attr('title');
                    const id = $(element).next().find('a[href*="item?id="]').attr('href')?.split('=')[1];
                    const points = $(element).next().find('.score').text().trim().split(' ')[0];

                    const metadata: crawlTypes.HackerNewsMetadataInterface = {
                        id: id ? id : null,
                        points: points ? parseInt(points, 10) : null,
                        price: 0,
                        reason: null
                    };

                    if (postUrl && !crawlHelpers.isAbsoluteUrl(postUrl)) {
                        postUrl = crawlHelpers.toAbsoluteUrl(baseURL, postUrl);
                    }
                    postDateObj = postDate ? postDateObj = new Date(postDate) : crawlHelpers.getCurrentUTCDate();
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
                        summary: null,
                        image_url: null,
                        image_alt: null,
                        image_path: null,
                        image_path_2x: null,
                        original_summary: null,
                        content: null,
                        industry: null,
                        type: null,
                        ai_summary: null,
                        ai_title: null,
                        relativity_score: null,
                        viral_tendency: null,
                        metadata: metadata,
                        next_retry_at: null,
                        status: "Pending"
                    };
                    const insertArticleResult = await databaseInteractions.insertArticle(logs, crawlKey, sharedClient, article, true);

                    //Update article with image and summary from meta
                    if (insertArticleResult && insertArticleResult !== -1) {
                        article.key = insertArticleResult;
                        await crawlHelpers.getArticleDetails(logs, crawlKey, sharedClient, article, false, sourceUrl);
                        await databaseInteractions.updateArticle(logs, crawlKey, sharedClient, article, true);
                    }
                }
            }
        } catch (error: any) {
            await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient, sourceUrl, postUrl, pageUrl, `Error in hackerNewsCrawler; error: ${error}, message: ${error.message}`);
        }
    }
}

export {hackerNewsCrawler, directoryUrl};