interface SourceInterface {
    id: string | null;
    name: string | null;
    original_url: string | null;
    url: string | null; // Website URL
    origin: string | null;
    rss_url: string | null;
    status: string | null;
    crawl_date: string | null;
    rank: string | null;
    tags: string | null;
    source_code: string | null;
    tech_docs: string | null;
    twitter: string | null;
    developer: string | null;
    country_of_origin: string | null;
    start_year: string | null;
    project_type: string | null;
    written_in: string | null;
    operating_systems: string | null;
    licenses: string | null;
    wikipedia: string | null;
}

export type {
    SourceInterface,
};