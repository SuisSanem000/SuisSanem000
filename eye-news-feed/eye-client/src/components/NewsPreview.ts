import {Property, style, THtmlAElement, THtmlDivElement, THtmlImgElement, THtmlLIElement, THtmlTextElement, THtmlUElement, THtmlULElement} from "tiny";
import {TText} from "sparrow/components/Text";
import {TButton} from "sparrow/components/Button";
import {type NewsItem} from "../Types.ts";
import {TTooltip} from "sparrow/components/Tooltip";
import {TAccordion} from "sparrow/components/Accordion";
import config from '../../config.json';

export class TNewsPreview extends THtmlDivElement {
    private previewContainer = new THtmlDivElement();
    private newsImg = new THtmlImgElement();
    private newsIcon = new THtmlImgElement();
    private titleText = new TText();
    private descriptionText = new TText();
    private titleSection = new THtmlAElement();
    private shareBtnLinksGroup = new THtmlDivElement();
    private tooltip = new TTooltip();
    readonly aiSummary = new TAccordion();
    private aiSummaryList = new THtmlDivElement();
    readonly reason = new TAccordion();
    private reasonText = new TText()
    inPreview: boolean = false;
    @Property newsItem?: NewsItem;
    @Property isVisible?: boolean = true;
    onMouseWheel?: (event: WheelEvent, inPreview?: boolean) => void;

    private onNewsItemChange() {
        if (!this.newsItem) {
            this.isVisible = false
            return
        }
        this.newsImg.src = this.newsItem.imageSrc;
        this.newsImg.srcSet = this.newsItem.imageSrcSet;
        this.newsImg.alt = this.newsItem.imageAlt

        this.newsIcon.src = this.newsItem.icon
        this.newsIcon.srcSet = this.newsItem.iconSrcSet;

        this.titleText.text = this.newsItem.title;
        if (this.newsItem.description) {
            if (config.mode === "development") {
                this.descriptionText.text = this.newsItem.description.split(' ').slice(0, 50).join(' ') + "...";
                if (this.newsItem.description.split(/\s+/).length < 50)
                    this.descriptionText.text = this.newsItem.description;
            } else {
                this.descriptionText.text = this.newsItem.description.split(' ').slice(0, 150).join(' ') + "...";
                if (this.newsItem.description.split(/\s+/).length < 150)
                    this.descriptionText.text = this.newsItem.description;
            }
        } else this.descriptionText.text = '';
        this.titleSection.href = this.newsItem.url;
        this.isVisible = true;
        this.tooltip.title = this.newsItem!.sourceName;
        this.tooltip.delay = 300;

        this.shareBtnLinksGroup.splice(0, this.shareBtnLinksGroup.childrenCount,
            this.createBtnLink(`https://www.linkedin.com/sharing/share-offsite/?url=${this.newsItem.url}`, "/assets/icons/linkedin-icon.svg"),
            this.createBtnLink(`http://twitter.com/share?text=${this.newsItem.title}&url=${this.newsItem.url}`, "/assets/icons/twitter-icon.svg")
        );

        if (this.newsItem.aiSummary) {
            const accordionContent = this.newsItem.aiSummary.map((item) => {
                const li = new THtmlLIElement();
                li.push(new TText(item))
                return li
            });
            this.aiSummaryList.splice(0, this.aiSummaryList.childrenCount, ...accordionContent);
            this.aiSummary.arrowButton.isDisable = false;
            this.aiSummary.isDisable = false;
            this.aiSummary.recalculate();
            this.aiSummary.expand();
        } else {
            this.aiSummary.arrowButton.isDisable = true;
            this.aiSummary.isDisable = true;
            this.aiSummary.recalculate();
            this.aiSummary.collapse();
        }

        if (this.newsItem.reason) {
            this.reasonText.text = this.newsItem.reason;
            this.reason.arrowButton.isDisable = false;
            this.reason.isDisable = false;
            this.reason.recalculate();
            this.reason.expand();
        } else {
            this.reasonText.text = "null";
            this.reason.arrowButton.isDisable = true;
            this.reason.isDisable = true;
            this.reason.recalculate();
            this.reason.collapse();
        }
    }

    private onIsVisibleChange() {
        if (this.isVisible) {
            this.shareBtnLinksGroup.className = "preview-share-btn is-visible";
            this.previewContainer.style = style({visibility: "visible"});
        } else {
            this.shareBtnLinksGroup.className = "preview-share-btn";
            this.previewContainer.style = style({visibility: "hidden"});
        }
    }

    private createBtnLink(url: string, iconPath: string) {
        const link = new THtmlAElement();
        const linkBtn = new TButton();
        const linkBtnImg = new THtmlImgElement();
        link.href = url;
        link.target = "_blank";
        linkBtnImg.src = iconPath;

        linkBtn.push(linkBtnImg);
        link.push(linkBtn);

        return link
    }

    onMouseEnter = (event: MouseEvent) => {
        this.inPreview = true;
    }
    onMouseLeave = (event: MouseEvent) => {
        this.inPreview = false;
    }
    onWheel = (event: WheelEvent) => {
        if (!this.inPreview) return
        if (this.onMouseWheel)
            this.onMouseWheel(event)
    }

    constructor() {
        super();
        this.className = "news-preview";
        this.previewContainer.className = "preview-container"
        this.titleSection.target = "_blank";
        this.previewContainer.style = style({visibility: "hidden"});

        const imageContainer = new THtmlDivElement();
        imageContainer.className = 'img-container';
        const descriptionSection = new THtmlDivElement();
        imageContainer.push(this.newsImg);
        this.titleSection.push(this.tooltip.push(this.newsIcon), this.titleText);

        descriptionSection.push(this.descriptionText);

        this.titleSection.className = "subtitle font-weight-600 preview-title";
        descriptionSection.className = "body font-weight-500 preview-description";
        this.shareBtnLinksGroup.className = "preview-share-btn";

        const aiSummaryTitle = new TText("AI Summary");
        aiSummaryTitle.className = "body font-weight-600";
        this.aiSummaryList.className = "body font-weight-500 ai-summary";
        this.aiSummary.slotPush(this.aiSummary.headerContentGroupSlot, aiSummaryTitle);
        this.aiSummary.slotPush(this.aiSummary.bodyGroupSlot, this.aiSummaryList);

        const reason = new TText("Reason");
        reason.className = "body font-weight-600";
        this.reasonText.className = "body font-weight-500";
        const reasonContent = new THtmlDivElement();
        reasonContent.className = "reason";
        reasonContent.push(this.reasonText)
        this.reason.slotPush(this.reason.headerContentGroupSlot, reason);
        this.reason.slotPush(this.reason.bodyGroupSlot, reasonContent);

        this.push(
            this.previewContainer.push(
                imageContainer,
                this.titleSection,
                descriptionSection,
                this.shareBtnLinksGroup
            )
        )
        if (config.mode === "development") {
            this.previewContainer.splice(3, 0, this.aiSummary, this.reason);
        }
    }
}