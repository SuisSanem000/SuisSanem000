import React from "react";
import * as fs from "fs";

//Implemented in landing, buy licence, blog pages for now
export const getSchema = (file) => {
    let source = "";
    if (typeof window === "undefined") {
        source = fs.readFileSync(`public/schema/${file}.json`, {encoding: "utf8"});
    }
    return (<script type="application/ld+json" dangerouslySetInnerHTML={{__html: source}}/>);
}

function extractFrontMatterData(markdownData) {
    // Extract images from the content
    const imageRegEx = /!\[([^[]*?)\]\(([^)]+?)\)/g;
    let match;
    const images = [];
    while ((match = imageRegEx.exec(markdownData)) !== null) {
        // Remove redundant escape sequences
        const description = match[1].replace(/\\\"/g, '"');

        let imageUrl = match[2];
        if (!imageUrl.startsWith("/")) {
            imageUrl = "/" + imageUrl;
        }

        images.push({
            "@context": "https://schema.org/",
            "@type": "ImageObject",
            "url": "https://jsonviewer.tools" + imageUrl,
            "contentUrl": "https://jsonviewer.tools" + imageUrl,
            "description": description,
            "license": "https://jsonviewer.tools/legal/",
            "creditText": "JSON Viewer",
            "author": {
                "@type": "Organization",
                "name": "JSON Viewer"
            },
            "creator": {
                "@type": "Organization",
                "name": "JSON Viewer",
                "url": "https://jsonviewer.tools/"
            },
            "acquireLicensePage": "https://jsonviewer.tools/legal/",
            "copyrightNotice": "Copyright © 2025 JSON Viewer. All rights reserved."
        });
    }
    return images;
}

export const generateArticleSchema = (markdownFileName, markdownData, markdownContent) => {
    let outputFileName = `blog/${markdownFileName}.json`;
    const images = extractFrontMatterData(markdownContent);

    // Base schema structure without images
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://jsonviewer.tools/blog/${markdownFileName}/`
        },
        "url": `https://jsonviewer.tools/blog/${markdownFileName}/`,
        "headline": markdownData.title,
        "datePublished": markdownData.date + "+00:00",
        "dateModified": markdownData.modified_date + "+00:00",
        "author": {
            "@type": "Organization",
            "name": "JSON Viewer",
            "url": "https://jsonviewer.tools/"
        },
        "publisher": {
            "@type": "Organization",
            "name": "JSON Viewer",
            "logo": {
                "@type": "ImageObject",
                "url": "https://jsonviewer.tools/logo.png"
            }
        },
        "description": markdownData.description
    };

    // Conditionally add the "image" field if the images array has content
    if (images.length > 0) {
        schema.image = images;
    }

    fs.writeFileSync(`public/schema/${outputFileName}`, JSON.stringify(schema, null, 2));
}