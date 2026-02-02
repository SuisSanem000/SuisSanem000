import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import {JSDOM} from 'jsdom';
import {Readability} from '@mozilla/readability';
// import weekArticlesLobsters from '../data/1weekArticlesLobsters.json' assert { type: 'json' };
import weekArticlesEye from '../data/1weekArticlesEye.json' assert {type: 'json'};

// Function to get readable content and title from a URL
async function getReadableContentAndTitle(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return {content: '', title: ''};
        }
        const html = await response.text();
        const dom = new JSDOM(html);
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        console.log(JSON.stringify(article));
        return {content: article.textContent, title: article.title};
    } catch (error) {
        console.error(`Error fetching URL ${url}: ${error}`);
        return {content: '', title: ''};
    }
}

// Function to update articles with summaries and titles
async function updateArticlesWithSummariesAndTitles(articles) {
    // let counter = 0;
    console.log(`In updateArticlesWithSummaries;`);

    const article = articles[0];
    // for (const article of articles) {
        const {content, title} = await getReadableContentAndTitle(article.url);
        article.summary = content;
        // article.title = title;
        // console.log(`counter: ${counter}: article:${article.title}`);
        // counter++;
    // }
    return articles;
}

// Sample usage with an array of article objects
(async () => {
    const updatedArticlesLobsters = await updateArticlesWithSummariesAndTitles(weekArticlesEye);
    // const dirPath = path.join('data');
    // const filePath = path.join(dirPath, '1weekArticlesEye_updated.json');
    // if (!fs.existsSync(dirPath)) {
    //     fs.mkdirSync(dirPath, {recursive: true});
    // }
    // fs.writeFileSync(filePath, JSON.stringify(updatedArticlesLobsters, null, 2));
})();
