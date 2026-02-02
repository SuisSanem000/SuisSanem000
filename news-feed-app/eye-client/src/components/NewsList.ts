import {TList, TListItem} from "sparrow/components/List";
import {Property, THtmlAElement, THtmlDivElement, THtmlImgElement, THtmlLIElement, THtmlTextElement, THtmlULElement,} from "tiny";
import {TText} from "sparrow/components/Text";
import {NewsItem} from "../Types.ts";
import {TTooltip} from "sparrow/components/Tooltip";
import {TOutsideClickComponent} from "sparrow/components/Common";
import config from "../../config.json";
import types from "../api/ai-configs/types.json";
import industries from "../api/ai-configs/industries.json";

export class TNewsList extends TList<unknown, THtmlULElement> {
    protected listItemsEl: THtmlDivElement = new THtmlDivElement();
    @Property listItems: NewsItem[] = [];
    itemCmp?: TListItem<NewsItem, THtmlLIElement>
    itemIndex: number = 0;
    listIndex: number = 0;
    onOutSideClick?: (event: Event, data?: NewsItem[]) => void;
    onListItemsFilter?: () => void;

    onListItemsChange() {
        if (!this.listItems) {
            return
        }
        if (this.listItems.length < this.listItemsEl.childrenCount) {
            this.listItems.forEach((item, index) => {
                let listItem = this.listItemsEl.children<ListItem>(index)!;
                listItem.data = item;
            })
            this.listItemsEl.splice(this.listItems.length, this.listItemsEl.childrenCount - this.listItems.length);
        } else if (this.listItems.length > this.listItemsEl.childrenCount) {
            this.listItems.forEach((item, index) => {
                if (index < this.listItemsEl.childrenCount) {
                    //change data
                    let listItem = this.listItemsEl.children<ListItem>(index)!;
                    listItem.data = item;
                } else {
                    // add
                    const listItem = new ListItem();
                    listItem.data = item;
                    listItem.tabIndex = -1;
                    listItem.onClick = (): void => {
                        this.itemCmp = listItem;
                        this.itemIndex = index;
                    }
                    listItem.onDoubleClick = (e) => {
                        if (listItem.data)
                            window.open(listItem.data.url, '_blank');
                    }
                    // if (this.listItemsEl.childrenCount > 0)
                    //     this.listItemsEl.splice(index, this.listItemsEl.childrenCount, listItem);
                    // else
                    this.listItemsEl.push(listItem);
                }
            });
        }
        if (this.onListItemsFilter)
            this.onListItemsFilter();
    }

    constructor(items?: NewsItem[]) {
        super(new THtmlULElement());
        this.classNames.push("news-list");
        if (items)
            this.listItems = items;

        const listOutsideClick: TOutsideClickComponent = new TOutsideClickComponent(this);
        listOutsideClick.onOutsideClick = (customEvent: CustomEvent): void => {
            const event = customEvent.detail;
            if (this.onOutSideClick)
                this.onOutSideClick(event);
        };

        this.push(listOutsideClick);
        this.push(this.listItemsEl)
    }
}

class ListItem extends TListItem<NewsItem, THtmlLIElement> {
    icon: THtmlImgElement = new THtmlImgElement();
    anchor: THtmlAElement = new THtmlAElement();
    faviconTooltip = new TTooltip();
    text = new TText();
    @Property
    mode: string | "development" | "production" = "development";

    getShortName(index: number, array: any[], shortName: boolean = true): string | undefined {
        if (index >= 0 && index < array.length) {
            return shortName ? array[index].short_name : array[index].name;
        } else return undefined;
    }

    onModeChange() {
        if (!this.data)
            return
        let type: string | undefined;
        let industry: string | undefined;

        if (this.mode == "development") {
            if (this.data.type != undefined || this.data.type != null)
                type = this.getShortName(this.data.type, types);
            if (this.data.industry != undefined || this.data.industry != null)
                industry = this.getShortName(this.data.industry, industries)

            const RS = new THtmlDivElement().push(new THtmlTextElement(`${this.data.relativityScore ?? "00"}`));
            const VT = new THtmlDivElement().push(new THtmlTextElement(`${this.data.viralTendency ?? "00"}`));
            const Industry = new THtmlDivElement().push(new THtmlTextElement(industry ?? "- -"));
            const Type = new THtmlDivElement().push(new THtmlTextElement(type ?? "- -"));

            const infoContainer = new THtmlDivElement();
            infoContainer.className = "info-container";
            infoContainer.push(RS, VT, Industry, Type);
            this.text.text = this.data.aiTitle ?? this.data.title;
            this.slotSplice(this.contentGroupSlot, 0, 0, infoContainer);
        } else
            this.slotSplice(this.contentGroupSlot, 0, 1);

    }

    onDataChange() {
        if (!this.data)
            return
        this.isDisable = this.data.isRead;
        this.faviconTooltip.title = this.data.sourceName;
        this.icon.src = this.data.icon;
        this.icon.srcSet = this.data.iconSrcSet;
        this.text.text = this.data.aiTitle ?? this.data.title;
    }

    constructor() {
        super(new THtmlLIElement());
        this.faviconTooltip.delay = 300;
        this.faviconTooltip.className = "favicon-tooltip";
        this.icon.className = "icon-read";
        this.anchor.target = "_blank";
        this.text.truncate = 1;
        this.slotPush(this.contentGroupSlot, this.anchor.push(this.faviconTooltip.push(this.icon), this.text));
    }
}