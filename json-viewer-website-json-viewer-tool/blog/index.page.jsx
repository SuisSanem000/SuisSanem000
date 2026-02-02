import React, {useEffect} from "react";
import {dateFormatter} from "@/common/utile";
import {LayoutLanding} from "@/components/LayoutLanding";
import {Link} from "@/components/Link";
import {navigate} from "vite-plugin-ssr/client/router";
import {getSchema} from "@/common/schemaHelper";

export {Page}
export {LayoutLanding as Layout}

// You can override the default open graph as shown
// Don't forget that if you override open graph object, you should set all keys of it.
// The url must be set the same as the main url of the page and there is no need to set the base url (https://dadroit.com/)

export const meta = {
    description: 'Discover our definitive guide to everything JSON, from expert insights on handling large JSON files to cutting-edge JSON technologies.'
    // og: {
    //     url: 'blog',
    //     title: 'Dadroit Blog',
    //     description: 'Stay updated with our conclusive guide to everything JSON, from expert insights on handling large JSON files to cutting-edge JSON-related technologies. Explore our expert insights!',
    //     image: 'images/i_og_landing_jsonviewer_rect.png'
    // }
}

function Page({blogListData}) {
    return (
        <section className="blog-list-page">
            <h1 className="title h3">Dadroit Blog</h1>
            <p className="subtitle sub1">Insights and solutions for conquering large JSON challenges and
                streamlining data management.</p>
            <BlogListItems blogListData={blogListData}/>
        </section>
    )
}

const BlogListItems = ({blogListData}) => {
    const option = {month: 'short', day: 'numeric', year: 'numeric'};

    useEffect(() => {
        if (!blogListData || blogListData.length === 0) {
            // window.location.href = "/";
            navigate("/");
        }
    }, [])

    return (
        <ul className="blog-list">
            {blogListData.map((post, index) => (
                <li key={index} className="blog-list-item">
                    <div className="blog-list-date sub3">{dateFormatter(post.date, option)}</div>

                    <Link href={"/blog/" + post.fileName}>
                        <div className="blog-list-label h6">{post.title}</div>
                    </Link>
                </li>
            ))}
        </ul>
    )
};
