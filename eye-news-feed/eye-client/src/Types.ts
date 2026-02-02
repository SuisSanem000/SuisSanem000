export interface NewsItem {
    key: string,
    sourceName: string,
    publishedDate: string,
    icon: string,
    iconSrcSet: string,
    imageSrc: string,
    imageSrcSet?: string,
    imageAlt: string,
    title: string,
    description?: string,
    url: string,
    isRead: boolean,

    industry?: number,
    type?: number,
    aiSummary?: string[],
    aiTitle?: string,
    relativityScore?: number,
    viralTendency?: number,

    reason?: string;
    price?: number;
}

export interface Day {
    key: string,
    date: string,
    isExpanded: boolean,
    news: NewsItem[],
    price?: number;
}

export interface Domain {
    name: string;
    icon_16?: string;
    icon_32?: string;
    checked: boolean;
}