import React, {useEffect, useLayoutEffect} from "react";
import readingTime from 'reading-time/lib/reading-time';
import {navigate} from "vite-plugin-ssr/client/router";

import {LayoutLanding} from "@/components/LayoutLanding";

// Self custom module and plugin
import {handleLightBox} from "../../common/LightboxHandler";
import {handleTableClassName, handleTablesScroll} from "../../common/TableScrollHandler";
import rehypeHeadingLink from "../../common/HeadingLinkPlugin";
import rehypeReferral from "../../common/ReferralPlugin";
import rehypeTLDR from "../../common/TLDRPlugin";
import {fixBaseURL, fixLinkURL} from "../../common/utile";
import {dateFormatter} from "@/common/utile";

// Remark and rehype plugins
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeExternalLinks from "rehype-external-links";
import rehypePrism from 'rehype-prism-plus';
import remarkCaptions from "remark-captions";
import {getSchema} from "@/common/schemaHelper";
import rehypeRaw from "rehype-raw";
import rehypeToc from "@microflash/rehype-toc";
import {h} from "hastscript";
import {useTocHandler} from "../../common/useTocHandler";

export {Page}
export {LayoutLanding as Layout}

function Page({blogPostData}) {
    const option = {month: 'short', day: 'numeric', year: 'numeric'};
    useEffect(() => {
        if (!blogPostData) {
            navigate("/blog/");
        }
        handleLightBox();
        handleTableClassName();
        handleTablesScroll();

        window.addEventListener('resize', handleTablesScroll);
        return () => window.removeEventListener('resize', handleTablesScroll);
    }, []);

    const state = readingTime(blogPostData.content);
    const blogPost = {
        date: blogPostData.data.date,
        title: blogPostData.data.title,
        content: blogPostData.content,
        readingTime: Math.round(state.minutes)
    }

    // Customize the toc builder method.
    const rehypeTocOptions = {
        toc(headings) {
            return (
                h('aside.toc', [
                    h('ul.toc-list.is-visible', [h('div.toc-selection'), ...headings.map(heading => {
                        if (heading.depth !== 2)
                            return;
                        return h('li.toc-item', [
                            h('a', {href: `#${heading.id}`}, heading.title),
                        ]);
                    })]),
                ])
            )
        }
    }

    useTocHandler();

    return (
        <>
            <article className="blog-post">
                <section className="blog-post-detail">
                    <div className="date">{dateFormatter(blogPost.date, option)}</div>
                    <div className="reading-time">{`${blogPost.readingTime} minute read`}</div>
                </section>
                <ReactMarkdown
                    children={blogPost.content}
                    transformImageUri={uri => fixBaseURL(uri)}
                    transformLinkUri={uri => fixLinkURL(uri)}
                    remarkRehypeOptions={{allowDangerousHtml: true}}
                    remarkPlugins={[remarkGfm, remarkCaptions]}
                    rehypePlugins={[
                        rehypeTLDR,
                        rehypeSlug,
                        rehypeReferral,
                        rehypeHeadingLink,
                        [rehypePrism, {showLineNumbers: true}],
                        [rehypeExternalLinks, {target: '_blank', rel: 'noopener noreferrer'}],
                        rehypeRaw,
                        [rehypeToc, rehypeTocOptions],
                    ]}
                />
            </article>

            {getSchema('blog/' + blogPostData.fileName)}
        </>
    );
}




