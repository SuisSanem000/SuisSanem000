import * as api from './api/api';

const appDiv = document.querySelector<HTMLDivElement>('#app')!;
appDiv.insertAdjacentHTML('beforeend', `<button id="loadSources" type="button" style="display: block; margin-bottom: 20px;">Load Sources</button>`);
appDiv.insertAdjacentHTML('beforeend', `<button id="loadArticles" type="button" style="display: block; margin-bottom: 20px;">Load Articles</button>`);
appDiv.insertAdjacentHTML('beforeend', `<button id="loadArticlesOfADate" type="button" style="display: block; margin-bottom: 20px;">Load Articles of 2024-01-14</button>`);

const loadArticlesButton = document.querySelector<HTMLButtonElement>('#loadArticles');
const loadSourcesButton = document.querySelector<HTMLButtonElement>('#loadSources');
const loadArticlesOfADateButton = document.querySelector<HTMLButtonElement>('#loadArticlesOfADate');

async function fetchArticlesOfCrawlDatesRange(firstDate: Date, lastDate: Date) {
    console.log('In fetchArticlesOfCrawlDatesRange()')
    let currentDate = lastDate;
    while (currentDate >= firstDate) {
        const formattedDate = currentDate.toISOString().split('T')[0];
        try {
            const articles = await api.apiGetArticlesOfADate(formattedDate);
            if (articles.success) {
                console.log(`Articles for date ${formattedDate}:`, articles.data);
            } else {
                console.error(`No articles for date ${formattedDate}:`, articles.error);
            }
        } catch (error) {
            console.error(`Error fetching articles for date ${formattedDate}:`, error);
        }
        currentDate.setDate(currentDate.getDate() - 1);
    }
}

loadSourcesButton?.addEventListener('click', async () => {
    console.log('In loadSourcesButtonClick()')
    try {
        const sources = await api.apiGetSources();
        if (sources.success) {
            console.log('Sources', sources.data);
        } else {
            console.error(`No success found: ${sources.error}`);
        }
    } catch (error: unknown) {
        console.log(`Error in loadSourcesButtonClick: ${error}`)
    }
});

loadArticlesButton?.addEventListener('click', async () => {
    console.log('In loadArticlesButton()')
    try {
        const crawlDateResponseData = await api.apiGetCrawlDates();
        if (crawlDateResponseData) {
            const firstDate = new Date(crawlDateResponseData.data.firstDate);
            const lastDate = new Date(crawlDateResponseData.data.lastDate);
            await fetchArticlesOfCrawlDatesRange(firstDate, lastDate);
        }
    } catch (error: unknown) {
        console.log(`Error in loadArticlesButtonClick: ${error}`)
    }
});

loadArticlesOfADateButton?.addEventListener('click', async () => {
    console.log('In loadArticlesOfADateButton()')
    try {
        const date = '2024-01-14';
        const articles = await api.apiGetArticlesOfADate(date);
        if (articles.success) {
            console.log(`Articles for date: ${date}: `, articles.data);
        } else {
            console.error(`No articles found for date ${date}; Error: ${articles.error}`);
        }
    } catch (error: unknown) {
        console.log(`Error in loadArticlesOfADateButton: ${error}`)
    }
});

