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
    summary: string | null;
    original_summary: string | null;
    image_url: string | null;
    image_path: string | null;
    image_alt: string | null;
    status: status;
}

type status = 'Pending' | 'Done';

export type {ArticleInterface}
