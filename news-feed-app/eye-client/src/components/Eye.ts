import {THtmlDivElement, THtmlLIElement,} from "tiny";
import {TTitleBar} from "./TitleBar.ts";
import {TNewsSection} from "./NewsSection.ts";
import {TNewsPreview} from "./NewsPreview.ts";
import {Day, Domain, NewsItem} from "../Types.ts";
import {TListItem} from "sparrow/components/List";
import * as api from "../api/api.ts";
import {db} from "../Database.ts";
import defaultIcon from "/favicon/article-favicon-place-holder.png";
import defaultIcon2X from "/favicon/article-favicon-place-holder-2x.png";
import previewDefaultImg from "/favicon/article-img-place-holder.png";
import previewDefaultImg2x from "/favicon/article-img-place-holder-2x.png";
import config from "../../config.json";
import {TAccordion} from "sparrow/components/Accordion";

interface PromiseResults {
    status: "fulfilled" | "rejected",
    value?: { news: NewsItem[] | undefined, date: string },
    reason?: {}
}

export class Eye extends THtmlDivElement {
    private newsSection = new TNewsSection() //add filter to in this parent
    private newsPreview = new TNewsPreview();
    private dates: string[] = [];

    // private downloadQueue: string[] = [];

    protected handleKeyDown(event: KeyboardEvent): void {
        this.handelSelection(event.key)
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                break;
            case "ArrowUp":
                event.preventDefault();
                break;
            case "Escape":
                this.newsSection.selectedItem = undefined;
                this.newsSection.handlePreview!();
                break;
        }
    }

    protected handelSelection(event: WheelEvent | string) {

        let listChildrenCount = this.newsSection.news[this.newsSection.listIndex].accordionBody.children(0)!.childrenCount
        if ((event as WheelEvent).deltaY > 0 || event === "ArrowDown") {
            if (this.newsSection.itemIndex === listChildrenCount - 2) {
                while (true) {
                    if (this.newsSection.listIndex + 1 < this.newsSection.news.length) {
                        this.newsSection.listIndex = this.newsSection.listIndex + 1;//??
                        this.newsSection.itemIndex = 0;
                    } else return;
                    if (this.newsSection.news[this.newsSection.listIndex].accordionBody.children(0)!.childrenCount != 0)
                        break;
                }
            } else if (this.newsSection.itemIndex < listChildrenCount) {
                this.newsSection.itemIndex = this.newsSection.itemIndex + 1;
            } else return;
        } else if ((event as WheelEvent).deltaY < 0 || event === "ArrowUp") {
            if (this.newsSection.itemIndex === 0) {
                while (true) {
                    if (this.newsSection.listIndex != 0) {
                        this.newsSection.listIndex = this.newsSection.listIndex - 1
                        this.newsSection.itemIndex = this.newsSection.news[this.newsSection.listIndex].accordionBody.children(0)!.childrenCount - 2;
                    } else return;
                    if (this.newsSection.news[this.newsSection.listIndex].accordionBody.children(0)!.childrenCount != 0)
                        break;
                }
            } else {
                this.newsSection.itemIndex = this.newsSection.itemIndex - 1;
            }
        }

        let nextSelectItem: TListItem<NewsItem, THtmlLIElement> | undefined
        nextSelectItem = this.newsSection.news[this.newsSection.listIndex].accordionBody.children(0)!
            .children<TListItem<NewsItem, THtmlLIElement>>(this.newsSection.itemIndex);
        if (this.newsSection.selectedItem != nextSelectItem)
            this.newsSection.selectedItem = nextSelectItem;

        this.newsSection.news[this.newsSection.listIndex].expand();
        const selectedItemIsInView = this.newsSection.isInViewport(this.newsSection.selectedItem);
        if (this.newsSection.selectedItem && !selectedItemIsInView)
            if ((event as WheelEvent).deltaY > 0 || event === "ArrowDown")
                this.newsSection.selectedItem.scrollIntoView({block: 'end'});
            else if ((event as WheelEvent).deltaY < 0 || event === "ArrowUp") {
                this.newsSection.selectedItem.scrollIntoView({block: "nearest"});
            }
        if (this.newsSection.listIndex == 0 && this.newsSection.itemIndex == 0)
            this.newsSection.newsGroup.accordionBody.scrollTop = 0
        // const scrollTop = this.newsSection.newsGroup.accordionBody.scrollTop;
        // const selectedItemTop = this.newsSection.selectedItem.getBoundingClientRect.top;
        //     this.newsSection.newsGroup.accordionBody.scrollTo({
        //         top: 24 + scrollTop,
        //         behavior: 'smooth'
        //     });
        // console.log("body", scrollTop, "item: ", selectedItemTop);
        // console.log("Selected Item Is In View:", selectedItemIsInView)
        // }
    }

    protected async getSources() {
        try {
            const sources = await api.apiGetSources();
            let sourcesItem: Domain
            if (sources.success) {
                return sources.data.filter((item: any) => item.name).map((item: any) => {
                    sourcesItem = {
                        name: item.name,
                        icon_16: item.icon_16_path,
                        icon_32: item.icon_32_path,
                        checked: true
                    };
                    return sourcesItem
                })
            }
        } catch (error: unknown) {
            console.log(`Error in loadSourcesButtonClick: ${error}`)
        }
    }

    // protected async loadArticlesOfADate(day: string) {
    //     try {
    //         if (!day)
    //             return
    //         this.downloadQueue.push(day);
    //         const date = day;
    //         const articles = await api.apiGetArticlesOfADate(date);
    //         if (articles.success)
    //             return {news: this.sortArticlesByDate(articles.data), date};
    //         else
    //             return {news: undefined, date};
    //     } catch (error: unknown) {
    //         console.log(`Error in loadArticlesOfADateButton: ${error}`)
    //     }
    // }

    // sortArticlesByDate(articlesData: any[]) {
    //     let articlesOfDay: NewsItem[] = [];
    //     if (typeof articlesData != "object")//??
    //         return
    //     articlesData.forEach((item: any) => {
    //             let icon: string = config.serverBaseDomain + config.icons_path + item.icon_16_path;
    //             let iconSrcSet: string = ""
    //             if (item.icon_32_path != null) {
    //                 iconSrcSet = `${icon} 1x, ${config.serverBaseDomain + config.icons_path + item.icon_32_path} 2x`;
    //             }
    //             if (!item.icon_16_path && item.icon_32_path != null) {
    //                 icon = config.serverBaseDomain + config.icons_path + item.icon_32_path;
    //                 iconSrcSet = ``;
    //             } else if (!item.icon_16_path && !item.icon_32_path) {
    //                 icon = defaultIcon;
    //                 iconSrcSet = `${icon} 1x, ${defaultIcon2X} 2x`;
    //             }
    //
    //             for (let i = 0; i < item.articles.length; i++) {
    //                 let src: string;
    //                 if (item.articles[i].image_path != null)
    //                     src = config.serverBaseDomain + config.images_path + item.articles[i].image_path;
    //                 else
    //                     src = previewDefaultImg;
    //
    //                 let srcSet: string;
    //                 if (item.articles[i].image_path_2x != null)
    //                     srcSet = `${config.serverBaseDomain}${config.images_path}${item.articles[i].image_path_2x} 2x`;
    //                 else
    //                     srcSet = `${previewDefaultImg} 1x, ${previewDefaultImg2x} 2x`;
    //
    //                 articlesOfDay.push({
    //                     key: item.articles[i].key,
    //                     sourceName: item.name,
    //                     publishedDate: item.articles[i].published_date,
    //                     icon: icon,
    //                     iconSrcSet: iconSrcSet,
    //                     imageSrc: src,
    //                     imageSrcSet: srcSet,
    //                     imageAlt: item.articles[i].image_alt,
    //                     title: item.articles[i].title,
    //                     description: item.articles[i].summary,
    //                     url: item.articles[i].url,
    //                     isRead: false,
    //
    //                     industry: item.articles[i].industry,
    //                     type: item.articles[i].type,
    //                     aiSummary: item.articles[i].ai_summary,
    //                     aiTitle: item.articles[i].ai_title,
    //                     relativityScore: item.articles[i].relativity_score,
    //                     viralTendency: item.articles[i].viral_tendency,
    //                     reason: (item.articles[i]["metadata"] ? item.articles[i]["metadata"]["reason"] : undefined),
    //                     price: item.day_price,
    //                 });
    //             }
    //         }
    //     )
    //     articlesOfDay.sort((a, b) => a.publishedDate.localeCompare(b.publishedDate));
    //     return articlesOfDay
    // }

    // handleNewDaysArticles(results: PromiseResults[]): any {
    //     for (let i = 0; i < results.length; i++) {
    //         if (results[i].status == "fulfilled") {//if rejected??
    //             if (results[i].value) {
    //                 if (results[i].value!.news) {
    //                     const index = this.newsSection.data.findIndex((item) => item.date == results[i].value!.date);
    //                     const news = index == -1 ? results[i].value!.news! : results[i].value!.news!.map((item) => {
    //                         const old = this.newsSection.data[index].news.find((oldItem) => oldItem.key == item.key)
    //                         if (old)
    //                             return old;
    //                         return item;
    //                     })
    //                     db.saveNews(news);
    //                     if (index == -1) {
    //                         this.newsSection.data = [...this.newsSection.data, {
    //                             news: results[i].value!.news!,
    //                             date: results[i].value!.date,
    //                             key: "",
    //                             isExpanded: false,
    //                             price: news[0].price
    //                         }];
    //                     } else {
    //                         this.newsSection.data.splice(index, 1, {
    //                             news: news!,//??
    //                             date: results[i].value!.date,
    //                             key: "",
    //                             isExpanded: this.newsSection.data[index].isExpanded,
    //                             price: news[0].price
    //                         });
    //                         this.newsSection.onDataChange();
    //                     }
    //                 }
    //                 const index = this.downloadQueue.indexOf(results[i].value!.date);
    //                 if (index > -1)
    //                     this.downloadQueue.splice(index, 1);
    //             }
    //         }
    //     }
    //     return results
    // }

    handleNewDayArticles(result: { news: NewsItem[] | undefined, date: string } | undefined): any {
        if (!result) return
        const index = this.newsSection.data.findIndex((item) => item.date == result.date);
        if (result.news) {
            const news = index == -1 ? result.news : result.news.map((item) => {
                const old = this.newsSection.data[index].news.find((oldItem) => oldItem.key == item.key)
                if (old)
                    return old;
                return item;
            })
            db.saveNews(news);
            if (index == -1) {
                this.newsSection.data = [...this.newsSection.data, {
                    news: result.news,
                    date: result.date,
                    key: "",
                    isExpanded: false,
                    price: news[0].price
                }];
            } else {
                this.newsSection.data.splice(index, 1, {
                    news: news!,//??
                    date: result.date,
                    key: "",
                    isExpanded: this.newsSection.data[index].isExpanded,
                    price: news[0].price
                });
                this.newsSection.onDataChange();
            }
        }
    }

    constructor() {
        super();
        this.tabIndex = -1;
        this.focus();
        let appWorker: Worker | undefined
        if (window.Worker) {
            appWorker = new Worker(new URL("../Worker.ts", import.meta.url), {type: 'module'});
            appWorker.onmessage = (e) => {
                // console.log("Receive message from worker", e.data)
                setTimeout(() => {
                    this.handleNewDayArticles(e.data)
                }, 0)
            };
        }

        document.title = 'recactus eye · news feed for database and analytics industry';
        const eyeAppContainer = new THtmlDivElement();
        eyeAppContainer.className = "eye-app-container";

        const newsContainer = new THtmlDivElement();
        newsContainer.className = "news-container";

        const titleBar = new TTitleBar();

        this.newsSection.onItemChange = (item, listIndex, itemIndex) => {
            this.newsPreview.newsItem = item;
        }
        this.newsSection.handlePreview = () => {
            this.newsPreview.newsItem = undefined;
        }
        this.newsSection.arrowButtonClick = (item) => {
            // Promise.allSettled([this.loadArticlesOfADate(item.date)]).then(this.handleNewDaysArticles.bind(this));
            let dateArr: string[] = [];
            if (item.date == "Today")
                return
            let date = new Date(item.date);
            date.setDate(date.getDate() - 3);
            for (let i = 0; i < 7; i++) {
                const dateStr = date.toISOString().substring(0, 10);
                date.setDate(date.getDate() + 1);
                dateArr.push(dateStr)
            }
            // Promise.allSettled(dateArr
            //     .filter((date) => {
            //         if (this.dates.indexOf(date) == -1) return false;
            //         const dayIndex = this.newsSection.data.findIndex((item) => item.date == date);
            //         // return dayIndex == -1 && this.downloadQueue.indexOf(date) == -1
            //         if (dayIndex == -1)
            //             return true;
            //         else
            //             return (!this.newsSection.data[dayIndex].news || this.newsSection.data[dayIndex].news.length == 0) && this.downloadQueue.indexOf(date) == -1;
            //     })
            //     .map(date => {
            //         return this.loadArticlesOfADate(date)
            //     })).then(this.handleNewDaysArticles.bind(this));

            dateArr.filter((date) => {
                if (this.dates.indexOf(date) == -1) return false;
                const dayIndex = this.newsSection.data.findIndex((item) => item.date == date);
                if (dayIndex == -1)
                    return true;
                else
                    return (!this.newsSection.data[dayIndex].news || this.newsSection.data[dayIndex].news.length == 0);
            }).forEach(date => {
                if (appWorker)
                    appWorker.postMessage(date)
            })

            // appWorker.postMessage([2, 2])
            // this.handleKeyDown.bind(this)
        }
        this.push(
            eyeAppContainer.push(
                titleBar,
                newsContainer.push(
                    this.newsSection,
                    this.newsPreview
                )
            ),
        )
        this.onWheel = (event) => {
            if (!this.newsPreview.inPreview)
                return
            this.handelSelection(event);
        }
        this.onKeyDown = this.handleKeyDown.bind(this);
        // window.onkeydown = this.handleKeyDown.bind(this);

        this.getSources().then((items) => this.newsSection.filter.domainNames = items);

        db.loadNews().then((items: NewsItem[]) => {
            const days: Day[] = [];
            while (items.length > 0) {
                const date = items[0].publishedDate.substring(0, 10);
                const day: Day = {
                    key: "",
                    isExpanded: false,
                    date: items[0].publishedDate.substring(0, 10),
                    news: items.filter((item) => item.publishedDate.substring(0, 10) == date),
                    price: items[0].price
                };
                days.push(day);
                items = items.filter((item) => item.publishedDate.substring(0, 10) != date);
            }
            days.sort((a, b) => b.date.localeCompare(a.date));
            this.newsSection.data = days;

            return api.apiGetCrawlDates().then((response) => {
                if (response.success) {
                    this.dates = response.data;
                    let lastVisitDate = this.dates[0];

                    let dateArr: string[] = this.dates.slice(0, 7);

                    // Promise.allSettled(dateArr.filter((date) => {
                    //     const dayIndex = this.newsSection.data.findIndex((item) => item.date == date);
                    //     return (dayIndex == -1 && this.downloadQueue.indexOf(date) == -1) || date == this.dates[0];
                    // }).map((date) => {
                    //     return this.loadArticlesOfADate(date);
                    // })).then(
                    //     this.handleNewDaysArticles.bind(this)
                    // )

                    const filterDates = dateArr.filter((date) => {
                        const dayIndex = this.newsSection.data.findIndex((item) => item.date == date);
                        return dayIndex == -1 || date == this.dates[0];
                    });

                    filterDates.forEach((date) => {
                        if (appWorker)
                            appWorker.postMessage(date)
                    })

                    for (let i = 0; i < 4 && i < this.newsSection.newsGroup.slotComponent(this.newsSection.newsGroup.bodyGroupSlot).childrenCount; i++) {
                        this.newsSection.newsGroup.slotComponent(this.newsSection.newsGroup.bodyGroupSlot).children<TAccordion<any>>(i)!.expand()
                    }
                }
            })
                .then(() => {
                    const date = new Date(this.dates[0]);
                    date.setDate(date.getDate() - 8);
                    let lastVisitDate = date.toISOString().substring(0, 10);
                    const newDays: Day[] = [];
                    while (lastVisitDate >= this.dates[this.dates.length - 1]) {
                        const index = days.findIndex((item) => item.date == lastVisitDate);
                        if (index == -1) {
                            const day: Day = {
                                key: "",
                                isExpanded: false,
                                date: lastVisitDate,
                                news: [],
                                price: undefined
                            };
                            newDays.push(day);
                        }
                        date.setDate(date.getDate() - 1);
                        lastVisitDate = date.toISOString().substring(0, 10);
                    }
                    this.newsSection.data = [...this.newsSection.data, ...newDays];
                });
        });
    }
}
