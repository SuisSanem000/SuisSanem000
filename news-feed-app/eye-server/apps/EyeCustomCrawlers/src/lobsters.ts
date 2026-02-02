import axios from 'axios';
import {load} from 'cheerio';
import {open} from 'sqlite';
import sqlite3 from 'sqlite3';
import path from "path";

import * as databaseTools from './database/databaseTools';
import config from '../config.json';

const baseURL: string = 'https://lobste.rs/page/';

interface ArticleData {
    page: number;
    postDate: string; // Date the blog post was published
    link: string; // URL of the post
    domain: string; // Domain of the post
    crawledDate: string; // Date of crawling the data
    upvoteCount: number;
    tags: string;
    shortId: string;
    avatarUrl: string;
    commentCount: number;
}

async function crawlPagesAndSaveToDB(baseURL: string, startPage: number, endPage: number): Promise<void> {

    const db = await open({
        filename: path.join(config.database.dir, config.database.name),
        driver: sqlite3.Database,
    });

    const crawledDate: string = new Date().toISOString();
    const tableName = 'lobsters';

    await db.exec(`
        CREATE TABLE IF NOT EXISTS "${tableName}"
        (
            page          INTEGER,
            post_date     TEXT,
            link          TEXT,
            domain        TEXT,
            crawled_date  TEXT,
            upvote_count  INTEGER,
            tags          TEXT,
            short_id      TEXT,
            avatar_url    TEXT,
            comment_count INTEGER
        )
    `);

    for (let page = startPage; page <= endPage; page++) {
        try {
            const pageURL = `${baseURL}${page}`;
            const {data: html} = await axios.get(pageURL);
            const $ = load(html);

            $('.story').each(async (_, element) => {
                let link = $(element).find('.link > a').attr('href') ?? '';
                let domain = $(element).find('.domain').text().trim() || '';

                // Check if the link is absolute or relative
                if (!link.includes('http://') && !link.includes('https://')) {
                    link = new URL(link, baseURL).href; // Prepend the base domain if it's a relative link
                }

                const postDate = $(element).find('.byline > span[title]').attr('title') ?? '';

                const article: ArticleData = {
                    page,
                    postDate: postDate,
                    link,
                    domain,
                    crawledDate,
                    upvoteCount: parseInt($(element).find('.score').text().trim()) || 0,
                    tags: $(element).find('.tags > a').map((_, tag) => $(tag).text().trim()).get().join(', '),
                    shortId: $(element).attr('id')?.replace('story_', '') ?? '',
                    avatarUrl: $(element).find('.avatar').attr('srcset')?.split(' ')[0] ?? '',
                    commentCount: parseInt($(element).find('.comments_label > a').text().match(/\d+/)?.[0] ?? '0'),
                };

                await db.run(`
                    INSERT INTO "${tableName}" (page, post_date, link, domain, crawled_date, upvote_count, tags,
                                                short_id, avatar_url, comment_count)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    article.page, article.postDate, article.link, article.domain, article.crawledDate, article.upvoteCount, article.tags,
                    article.shortId, article.avatarUrl, article.commentCount
                ]);
            });

            console.log(`Finished crawling and saving articles from page ${page}.`);
        } catch (error) {
            console.error(`Error processing page ${page}:`, error);
        }
    }

    await db.close();
    console.log('Finished crawling and saving articles to the database.');
}

async function lobstersCrawler() {
    await crawlPagesAndSaveToDB(baseURL, 1, 70);
    await databaseTools.initDatabase();
    await databaseTools.finalizeDatabase();
}

lobstersCrawler();