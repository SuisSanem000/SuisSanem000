import {TAccordion, TAccordionGroup} from "sparrow/components/Accordion";
import {Property, TCustomHTMLElement, THtmlLIElement, THtmlSectionElement, THtmlSpanElement} from "tiny";
import {TNewsList} from "./NewsList.ts";
import {TFilter} from "./Filter.ts";
import {TText} from "sparrow/components/Text";
import {TListItem} from "sparrow/components/List";
import {Day, type NewsItem} from "../Types.ts";
import {db} from "../Database.ts";
import {TCommonControl} from "sparrow/components/Common";
import axios from 'axios';
import config from "../../config.json";

export class TNewsSection extends TCommonControl<Day[], THtmlSectionElement> {
    protected timeoutID: number = 0;
    private prices: TText<string | unknown>[] = ([] as TText<string | unknown>[]);
    readonly filter = new TFilter();
    readonly newsGroup: TAccordionGroup<unknown> = new TAccordionGroup();
    itemIndex: number = -1;//check this & usage of it later!!
    activeList: string = '';
    data: Day[] = [];
    filteredNews: TAccordion<Day>[] = [];
    @Property news: TAccordion<Day>[] = [];
    @Property selectedItem?: TListItem<NewsItem, THtmlLIElement>//later!
    @Property listIndex: number = 0;
    @Property viewNews: TAccordion<Day>[] = [];
    @Property filterData: Day[] = [];
    onItemChange?: (item: NewsItem, listIndex: number, itemIndex: number) => void;
    handlePreview?: () => void;
    arrowButtonClick?: (data: Day) => void;

    // onScrollEnd?: () => void;

    onListIndexChange() {
        if (!this.listIndex)
            return
        for (let i = 0; i < this.data[this.listIndex].news.length; i++) {
            axios.get(this.data[this.listIndex].news[i].imageSrc);
        }
    }

    onViewNewsChange() {
        // this.viewNews.forEach((news) => {
        //     // if (news.data && news.accordionBody.children<TNewsList>(0))
        //     //     news.accordionBody.children<TNewsList>(0)!.listItems = news.data.news
        //     console.log("onViewNewsChange", news.data);
        // })
        this.applyFilter();
    }

    isInViewport(element: any, viewElement = this.newsGroup.accordionBody) {
        let rect = element.getBoundingClientRect;
        const diff = window.innerHeight - viewElement.clientHeight
        return (
            rect.top - diff >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight - 24 || viewElement.clientHeight - 24) &&
            rect.right <= (window.innerWidth - 24 || viewElement.clientWidth - 24)
        );
    }

    elementInViewport(element: any, viewElement = this.newsGroup.accordionBody) {
        let rect = element.getBoundingClientRect();
        const diff = window.innerHeight - viewElement.clientHeight
        return (
            rect.top - viewElement.clientTop >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || viewElement.clientHeight) &&
            rect.right <= (window.innerWidth || viewElement.clientWidth)
        );
    }

    protected getViewNews() {
        // const newsViewBox = this.newsGroup.accordionBody.getBoundingClientRect();
        // console.log("view box:", newsViewBox);
        this.viewNews.splice(0, this.viewNews.length);
        for (let i = 0; i < this.news.length; i++) {
            if (this.elementInViewport(this.news[i].accordionHeader))
                // this.viewNews.splice(i, this.viewNews.length, this.news[i]);
                this.viewNews.push(this.news[i]);
        }
        this.onViewNewsChange();
        // if (this.onScrollEnd)
        //     this.onScrollEnd()
    }

    // protected attach(index: number, parentNode?: Node, continueWithThisParentNode?: Node): number {
    //     this.newsGroup.accordionBody.addEventListener('scrollend', this.handelScrollEnd.bind(this));
    //     return super.attach(index, parentNode, continueWithThisParentNode);
    // }
    //
    // protected detach(): void {
    //     this.newsGroup.accordionBody.removeEventListener('scrollend', this.handelScrollEnd.bind(this));
    //     super.detach();
    // }

    private applyFilter() {
        // this.filterData = this.data.map((item) => {
        //     return {
        //         ...item, news: item.news.filter((n) => this.filter.selectedItemTitle.some((title) => n.sourceName.toLowerCase().includes(title.toLowerCase()))).sort((a, b) => {
        //             const compare = a.publishedDate.localeCompare(b.publishedDate);
        //             if (compare == 0) {
        //                 return a.key.localeCompare(b.key);
        //             }
        //             return compare;
        //         })
        //     };
        // }).sort((a, b) => b.date.localeCompare(a.date));

        // if (!this.viewNews || this.viewNews.length == 0)
        //     this.filterData = this.data//!!
        // else {
        //     let viewDataFiltered: Day[] = this.viewNews.map((item) => {
        //         let filterData: Day
        //         filterData = {
        //             ...item.data!, news: item.data!.news.filter((n) => this.filter.selectedItemTitle.some((title) => n.sourceName.toLowerCase().includes(title.toLowerCase()))).sort((a, b) => {
        //                 const compare = a.publishedDate.localeCompare(b.publishedDate);
        //                 if (compare == 0) {
        //                     return a.key.localeCompare(b.key);
        //                 }
        //                 return compare;
        //             })
        //         };
        //         if (item.data && item.accordionBody.children<TNewsList>(0)) {
        //             item.accordionBody.children<TNewsList>(0)!.listItems = filterData.news
        //         }
        //         return filterData
        //     }).sort((a, b) => b.date.localeCompare(a.date));
        // }

        if (!this.viewNews || this.viewNews.length == 0)
            this.filterData = this.data//!!
        else
            this.viewNews.map((item) => {
                if (this.filteredNews.indexOf(item) > -1) {
                    return
                } else {
                    let filterData: Day
                    filterData = {
                        ...item.data!,
                        news: item.data!.news.filter(
                            (n) => this.filter.selectedItemTitle.some(
                                (title) => n.sourceName.toLowerCase().includes(title.toLowerCase()))
                        )
                        ////Sort?
                        // .sort((a, b) => {
                        //     const compare = a.publishedDate.localeCompare(b.publishedDate);
                        //     if (compare == 0) {
                        //         return a.key.localeCompare(b.key);
                        //     }
                        //     return compare;
                        // })
                    };
                    if (item.data && item.accordionBody.children<TNewsList>(0))
                        item.accordionBody.children<TNewsList>(0)!.listItems = filterData.news
                    // console.log("apply filter:", filterData);
                    this.filteredNews.push(item);
                }
                console.log(item.data, "index: ", this.filteredNews.indexOf(item));
            });
    }

    private onBeforeSelectedItemChange(item: TListItem<unknown, THtmlLIElement>): TListItem<unknown, THtmlLIElement> {
        if (this.selectedItem) {
            this.selectedItem.isSelected = false;
            if (this.selectedItem.data && this.selectedItem.data.isRead) {
                this.selectedItem.isDisable = true;
            }
        }
        return item
    }

    private onSelectedItemChange() {
        if (!this.selectedItem) {
            clearTimeout(this.timeoutID);
            if (this.handlePreview)
                this.handlePreview()
            return
        }
        this.selectedItem!.isSelected = true;
        this.selectedItem.isDisable = false;
        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(() => {
            // this.data[this.listIndex].news[this.itemIndex].isRead = true;
            if (this.selectedItem && this.selectedItem.data) {
                this.selectedItem.data.isRead = true;
                db.saveNews([this.selectedItem.data]);
            }
            // this.data[this.listIndex].news[this.itemIndex!].icon.replace(".svg", "-is-read.svg");
            //------------> property isRead vaghti change mishe onDataChange ro seda nemizane (use @each and onPropertyChange??)

            // db.saveNews(this.data).then(() => {
            //     return this.data;
            // }).catch((error) => {
            //     console.error(error);
            // });

        }, 500);
        if (this.onItemChange)
            this.onItemChange(this.selectedItem.data!, this.listIndex, this.itemIndex);
    };

    onDataChange() {
        this.applyFilter();
    }

    onFilterDataChange() {
        this.filterData.map((item, index) => {
            const today: string = new Date().toISOString().substring(0, 10);
            if (item.date === today)
                item.date = "Today";
            if (this.news.length > index) {
                this.news[index].data = item;
                this.news[index].slotComponent(this.news[index].headerContentGroupSlot).children<TText<unknown>>(0)!.text = item.date;
                const list = this.news[index].accordionBody.children<TNewsList>(0)!;
                list.listItems = item.news;
                list.listIndex = index;
                if (this.prices && this.prices.length > 0)
                    this.prices[index].text = `${item.price ? item.price + "$" : "00"}`
            } else {
                const accordion: TAccordion<Day> = new TAccordion();
                accordion.data = item;
                const accordionTitle = new TText(accordion.data.date);
                accordionTitle.className = "body font-weight-600";
                accordion.slotPush(accordion.headerContentGroupSlot, accordionTitle);
                accordion.onExpand = (event) => {
                    if (this.arrowButtonClick && event.detail.data)
                        this.arrowButtonClick(event.detail.data);
                }

                if (config.mode === "development") {
                    const articlesPrice = new TText(`${accordion.data.price ? accordion.data.price + "$" : "00"}`, new THtmlSpanElement());
                    this.prices.push(articlesPrice)
                    accordion.slotPush(accordion.headerContentGroupSlot, articlesPrice);
                }

                const newsList = new TNewsList(accordion.data.news);
                newsList.listIndex = index;
                newsList.onClick = (event) => {
                    this.itemIndex = newsList.itemIndex;
                    if (this.listIndex != newsList.listIndex)
                        this.listIndex = newsList.listIndex;
                    this.activeList = accordion.data!.date;
                    this.selectedItem = newsList.itemCmp;
                }
                //!!
                // newsList.onListItemsFilter = () => {
                //     if (!this.viewNews || this.viewNews.length == 0)
                //         return
                //
                //     for (let i = 0; i < this.news.length; i++) {
                //         if (this.elementInViewport(this.news[i].accordionHeader) && this.viewNews.indexOf(this.news[i]) == -1) {
                //             // this.viewNews.splice(i, this.viewNews.length, this.news[i]);
                //             this.viewNews.push(this.news[i]);
                //             console.log(this.viewNews[i].data)
                //         }
                //     }
                //     // this.applyFilter();
                // }

                accordion.slotPush(accordion.bodyGroupSlot, newsList);

                newsList.onOutSideClick = (event: Event): void => {
                    if (!this.selectedItem) return;
                    const newsPreviewEl = document.querySelector(".news-preview");
                    if (newsPreviewEl && (newsPreviewEl == event.target || newsPreviewEl.contains(event.target as TCustomHTMLElement)))
                        return;
                    this.handleListOutSideClick(accordion.data!.date);
                };

                accordion.onClick = (event: MouseEvent): void => {
                    if (accordion.data && this.activeList != accordion.data.date) {
                        event.stopPropagation();
                    }
                }
                this.news.push(accordion);
                this.newsGroup.slotPush(this.newsGroup.bodyGroupSlot, accordion);
            }
        });
        this.newsGroup.prepare();
    }

    readonly handleScroll = () => {
        if (this.newsGroup.accordionBody.scrollTop !== 0)
            this.newsGroup.accordionHeader.style = "border-bottom: 1px solid var(--color-background-3);"
        else
            this.newsGroup.accordionHeader.style = "border-bottom: none";
        // if (this.newsGroup.accordionBody.scrollTop + this.newsGroup.accordionBody.offsetHeight >= this.newsGroup.accordionBody.scrollHeight) {
        //
        // }
    }

    private handleListOutSideClick(listName: string): void {
        if (this.selectedItem && listName == this.activeList) {
            this.selectedItem = undefined;
        }
    }

    constructor() {
        super(new THtmlSectionElement());
        this.className = "news";
        const newsTitle: TText<unknown> = new TText("News");
        newsTitle.className = "subtitle font-weight-600 news-title";
        this.newsGroup.slotPush(this.newsGroup.headerContentGroupSlot, newsTitle);
        this.newsGroup.slotPush(this.newsGroup.headerEndGroupSlot, this.filter);
        this.newsGroup.onCollapseAll = () => {
            this.selectedItem = undefined;
            for (let i = 0; i < 4 && i < this.newsGroup.slotComponent(this.newsGroup.bodyGroupSlot).childrenCount; i++) {
                this.newsGroup.slotComponent(this.newsGroup.bodyGroupSlot).children<TAccordion<any>>(i)!.collapse()
            }
        }
        this.filter.onFilterDataChange = () => {
            this.filteredNews = []
            this.applyFilter();
            // if, if, if!? :/
            if (!this.filter.domainCheckState.isIndeterminate) {
                if (!this.filter.domainCheckState.isChecked)
                    for (let i = 0; i < this.news.length; i++) {
                        this.news[i].isDisable = true;
                        this.news[i].arrowButton.isDisable = true
                    }
                else for (let i = 0; i < this.news.length; i++) {
                    this.news[i].isDisable = false;
                    this.news[i].arrowButton.isDisable = false
                }
            } else
                for (let i = 0; i < this.news.length; i++) {
                    this.news[i].isDisable = false;
                    this.news[i].arrowButton.isDisable = false;
                }

            for (let i = 0; i < this.news.length; i++) {
                if (this.news[i].accordionBody.children(0)!.childrenCount !== 0) {
                    this.news[i].isDisable = false;
                    this.news[i].arrowButton.isDisable = false;
                } else {
                    this.news[i].isDisable = true;
                    this.news[i].arrowButton.isDisable = true;
                }
                if (this.filter.domainCheckState.isChecked) {
                    this.news[i].isDisable = false;
                    this.news[i].arrowButton.isDisable = false;
                }
            }
        }
        this.push(this.newsGroup);
        this.newsGroup.prepare();
        this.filter.onFilterDataChange();
        this.newsGroup.accordionBody.onScroll = () => {
            this.handleScroll();
            this.getViewNews();
        }
        // const observer = new IntersectionObserver((entries) => {
        //     entries.forEach((entry) => {
        //         console.log("entries: ", entry)
        //     })
        // }, {root: null, threshold: [0, 0.25, 0.5, 0.75, 1.0]})
        // observer.observe(this.newsGroup.accordionBody.element);
    }
}
