import {getBlogPostsData} from "@/common/utile";
import {generateArticleSchema} from "@/common/schemaHelper";

export {onBeforeRender}

const blogListData = getBlogPostsData();

function onBeforeRender(pageContext) {
    const postRouteParams = pageContext.routeParams.post;
    const blogPostData = blogListData.filter(post => post.fileName === postRouteParams)[0];
    generateArticleSchema(blogPostData.fileName, blogPostData.data, blogPostData.content);

    return {
        pageContext: {
            pageProps: {
                blogPostData
            },
            meta: {
                title: `${blogPostData.data.title}`,
                description: blogPostData.data.description,
                og: blogPostData.data.og
            },
            standardPrice: 98,
            advancedPrice: 198,
            standardDiscount: 0,
            advancedDiscount: 0,
            standardPriceId: "price_1NBFdfEYyGFZC1N35jUzrLNr",
            advancedPriceId: "price_1NBFauEYyGFZC1N3d0dtuJnr",
        }
    }
}