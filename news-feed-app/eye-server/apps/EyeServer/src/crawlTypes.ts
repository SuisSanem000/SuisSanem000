// This file defines various TypeScript interfaces used throughout the project, such as `RssItemInterface` and `SourceInterface`.
interface RssItemInterface {
    title: string;
    link: string;
    description: string;
    pubdate: Date;
}

interface SourceInterface {
    id: number;
    key: string;
    created_at: string;
    updated_at: string;
    last_build_date: string;
    crawl_key: string;
    name: string | null;
    url: string;
    original_url: string;
    rss_url: string | null;
    icon_16_url: string | null;
    icon_32_url: string | null;
    icon_largest_url: string | null;
    icon_16_path: string | null;
    icon_32_path: string | null;
    icon_largest_path: string | null;
    type: SourceType;
    status: Status;
}

interface SourceArticleInterface {
    source: SourceInterface;
    day_price: number;
    articles: ArticleInterface[];
}

interface ArticleInterface {
    id: number;
    key: string;
    created_at: string;
    updated_at: string;
    crawl_key: string;
    source_key: string;
    title: string;
    url: string;
    original_url: string;
    published_date: Date;
    original_published_date: Date;
    summary: string | null;
    original_summary: string | null;
    image_url: string | null;
    image_path: string | null;
    image_path_2x: string | null;
    image_alt: string | null;

    //AI related fields
    content: string | null;
    industry: number | null;
    type: number | null;
    ai_summary: string[] | null;
    ai_title: string | null;
    relativity_score: number | null;
    viral_tendency: number | null;
    metadata: HackerNewsMetadataInterface | ArticleMetadataInterface | null;
    next_retry_at: Date | null,
    status: Status;
}

interface LogInterface {
    id: number;
    key: string;
    created_at: string;
    updated_at: string;
    crawl_key: string;
    url: string | null | undefined;
    source_url: string | null | undefined;
    article_url: string | null | undefined;
    log_type: LogType;
    error_type: ErrorType;
    message: string;
    timestamp: string;
}

interface IconsInterface {
    address_16: string | null;
    address_32: string | null;
    favicon: string;
    largest: { size: number; address: string | null };
}

interface ImagesInterface {
    name1x: string | null;
    name2x: string | null;
    nameOriginal: string | null;
}

interface HackerNewsMetadataInterface {
    id: string | null;
    points: number | null;
    reason: string | null;
    price: number;
}

interface ArticleMetadataInterface {
    reason: string | null;
    price: number;
}

// Define the types for error categories
type SourceType = 'Website' | 'Directory';
type Status = 'Pending' | 'Done';
type LogType = 'Error' | 'Info';
type ErrorType = 'Crawl' | 'AI' | 'Database' | 'Network' | 'Parse' | 'IO' | 'Unknown' | 'None';

export type {
    SourceType,
    Status,
    IconsInterface,
    ImagesInterface,
    LogType,
    ErrorType,
    SourceInterface,
    ArticleInterface,
    LogInterface,
    RssItemInterface,
    SourceArticleInterface,
    HackerNewsMetadataInterface,
    ArticleMetadataInterface
};