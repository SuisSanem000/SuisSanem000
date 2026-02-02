import {getBlogPostsData} from "@/common/utile";

export {onBeforeRender}
export {prerender}
// export const passToClient = ['blogListData'];

const blogPostData = sortBlogListByData();
const blogListData = blogPostData.map(post => {
    return {
        title: post.data.title,
        date: post.data.date,
        fileName: post.fileName
    }
})

function onBeforeRender() {
    return {
        pageContext: {
            pageProps: {
                blogListData,
            },
            meta: {
                title: 'Dadroit Blog',
                description: 'Learn more about Dadroit JSON Viewer and importance of unstructured data.'
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

function prerender() {
    return [
        {
            url: '/blog',
            pageContext: {
                pageProps: {
                    blogListData,
                },
                meta: {
                    title: 'Dadroit Blog',
                    description: 'Learn more about Dadroit JSON Viewer and importance of unstructured data.'
                },
                standardPrice: 98,
                advancedPrice: 198,
                standardDiscount: 0,
                advancedDiscount: 0,
                standardPriceId: "price_1NBFdfEYyGFZC1N35jUzrLNr",
                advancedPriceId: "price_1NBFauEYyGFZC1N3d0dtuJnr",
            },
        },
        ...blogListData.map(post => '/blog/' + post.fileName)
    ]
}

function sortBlogListByData() {
    const blogListData = getBlogPostsData();
    // Elapsed time in milliseconds
    const getTime = (date) => new Date(date).getTime();
    return (
        blogListData.sort((a, b) => getTime(b.data.date) - getTime(a.data.date))
    )
}