export function sum(n1: number, n2: number) {
    let sum: number;
    sum = n1 + n2;
    return sum
}

import * as api from "./api/api.ts";
import {NewsItem} from "./Types.ts";
import config from "../config.json";
import defaultIcon from "/favicon/article-favicon-place-holder.png";
import defaultIcon2X from "/favicon/article-favicon-place-holder-2x.png";
import previewDefaultImg from "/favicon/article-img-place-holder.png";
import previewDefaultImg2x from "/favicon/article-img-place-holder-2x.png";

interface PostData {
    data?: any
    downloadQueue: string[]
}

const downloadQueue: string[] = [];//!!!

async function loadArticlesOfADate(day: string) {
    let newsData: { news: NewsItem[] | undefined, date: string };
    try {
        if (!day)
            return
        downloadQueue.push(day);
        const date = day;
        const articles = await api.apiGetArticlesOfADate(date);
        if (articles.success) {
            // return {news: sortArticlesByDate(articles.data), date};
            newsData = {news: sortArticlesByDate(articles.data), date};
        } else {
            // return {news: undefined, date};
            newsData = {news: undefined, date};
        }
        console.log("loadArticlesOfADate :", newsData)
        return newsData
    } catch (error: unknown) {
        console.log(`Error in loadArticlesOfADateButton: ${error}`)
    }
}

function sortArticlesByDate(articlesData: any[]) {
    console.log("sortArticlesByDate: ", articlesData);
    let articlesOfDay: NewsItem[] = [];
    if (typeof articlesData != "object")//??
        return
    articlesData.forEach((item: any) => {
            let icon: string = config.serverBaseDomain + config.icons_path + item.icon_16_path;
            let iconSrcSet: string = ""
            if (item.icon_32_path != null) {
                iconSrcSet = `${icon} 1x, ${config.serverBaseDomain + config.icons_path + item.icon_32_path} 2x`;
            }
            if (!item.icon_16_path && item.icon_32_path != null) {
                icon = config.serverBaseDomain + config.icons_path + item.icon_32_path;
                iconSrcSet = ``;
            } else if (!item.icon_16_path && !item.icon_32_path) {
                icon = defaultIcon;
                iconSrcSet = `${icon} 1x, ${defaultIcon2X} 2x`;
            }

            for (let i = 0; i < item.articles.length; i++) {
                let src: string;
                if (item.articles[i].image_path != null)
                    src = config.serverBaseDomain + config.images_path + item.articles[i].image_path;
                else
                    src = previewDefaultImg;

                let srcSet: string;
                if (item.articles[i].image_path_2x != null)
                    srcSet = `${config.serverBaseDomain}${config.images_path}${item.articles[i].image_path_2x} 2x`;
                else
                    srcSet = `${previewDefaultImg} 1x, ${previewDefaultImg2x} 2x`;

                articlesOfDay.push({
                    key: item.articles[i].key,
                    sourceName: item.name,
                    publishedDate: item.articles[i].published_date,
                    icon: icon,
                    iconSrcSet: iconSrcSet,
                    imageSrc: src,
                    imageSrcSet: srcSet,
                    imageAlt: item.articles[i].image_alt,
                    title: item.articles[i].title,
                    description: item.articles[i].summary,
                    url: item.articles[i].url,
                    isRead: false,

                    industry: item.articles[i].industry,
                    type: item.articles[i].type,
                    aiSummary: item.articles[i].ai_summary,
                    aiTitle: item.articles[i].ai_title,
                    relativityScore: item.articles[i].relativity_score,
                    viralTendency: item.articles[i].viral_tendency,
                    reason: (item.articles[i]["metadata"] ? item.articles[i]["metadata"]["reason"] : undefined),
                    price: item.day_price,
                });
            }
        }
    )
    articlesOfDay.sort((a, b) => a.publishedDate.localeCompare(b.publishedDate));
    return articlesOfDay
}


self.onmessage = (e) => {
    setTimeout(() => {
        if (downloadQueue.indexOf(e.data) == -1)
            loadArticlesOfADate(e.data).then((newsData) => {
                self.postMessage(newsData);
            })
    })
    // const result = `result: ${sum(e.data[0], e.data[1])}`;
    // postMessage(newsData)
}