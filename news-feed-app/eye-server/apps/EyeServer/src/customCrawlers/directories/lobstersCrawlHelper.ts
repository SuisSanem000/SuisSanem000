import {load} from 'cheerio';
import {PoolClient} from "pg";

import * as databaseInteractions from '../../databaseInteractions';
import * as crawlHelpers from '../../crawlHelpers';
import * as crawlTypes from '../../crawlTypes';
import config from "../../../config.json";

const directoryUrl = 'https://lobste.rs/';
const baseURL: string = 'https://lobste.rs/page/';
const pageCount = 5;

async function lobstersCrawler(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, sourceKey: string, sourceUrl: string): Promise<void> {
    let pageUrl: any;
    let postUrl, postTitle, postDate: string;
    let article: crawlTypes.ArticleInterface;
    const selectedTags = ['ai', 'visualization', 'database'];
    let breakOuterLoop = false;
    const todayDate = crawlHelpers.getCurrentUTCDate();
    const startDate = new Date(Date.now() - (config.numberOfDaysForFirstCrawl * 24 * 60 * 60 * 1000));

    for (let page = 1; page <= pageCount; page++) {
        try {
            pageUrl = `${baseURL}${page}`;
            const responseData = await crawlHelpers.fetchWithAxios(logs, crawlKey, sharedClient, pageUrl, 'text', 'crawlLobstersPages');
            if (responseData) {
                const $ = load(responseData);
                const stories = $('.story').toArray();
                for (const element of stories) {
                    postUrl = $(element).find('.link > a').attr('href') ?? '';
                    postDate = $(element).find('.byline > span[title]').attr('title') ?? '';
                    postTitle = $(element).find('.link .u-url').text();
                    const tags = $(element).find('.tags > a').map((_, tag) => $(tag).text().trim()).get().join(', ');
                    const containsSelectedTags = selectedTags.some(item => tags.toLowerCase().includes(item.toLowerCase()));
                    if (containsSelectedTags) {
                        if (postUrl && !crawlHelpers.isAbsoluteUrl(postUrl)) {
                            postUrl = crawlHelpers.toAbsoluteUrl(baseURL, postUrl);
                        }
                        const postDateObj = new Date(postDate);

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
                            url: crawlHelpers.cleanUrl(postUrl),
                            original_url: postUrl,
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

                        if (insertArticleResult == -1) {
                            breakOuterLoop = true;
                            break;
                        }
                    }
                }
                if (breakOuterLoop) {
                    break;
                }
            }
        } catch (error: any) {
            await crawlHelpers.addLog(logs, 'Error', 'Crawl', crawlKey, sharedClient,sourceUrl, undefined,  pageUrl, `Error in crawlLobstersPages; error: ${error}, message: ${error.message}`);
        }
    }
}

export {lobstersCrawler, directoryUrl};