SELECT SETVAL('public.article_id_seq', COALESCE(MAX(id), 1) ) FROM public.article;
SELECT SETVAL('public.crawl_id_seq', COALESCE(MAX(id), 1) ) FROM public.crawl;
SELECT SETVAL('public.error_id_seq', COALESCE(MAX(id), 1) ) FROM public.error;
SELECT SETVAL('public.log_id_seq', COALESCE(MAX(id), 1) ) FROM public.log;
SELECT SETVAL('public.source_id_seq', COALESCE(MAX(id), 1) ) FROM public.source;