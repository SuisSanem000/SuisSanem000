import {ChatCompletion} from "openai/src/resources/chat/completions";
import * as AIAPITypes from './AITypes';
import * as AIHelpers from './AIHelpers';
import * as openAIAPIHelpers from './openAIHelpers';
// import articlesJSON from '../data/articles.json';
import articlesJSON from '../data/1weekArticlesLobsters.json';
// import articlesJSON from '../data/1weekArticlesEye.json';
import * as path from 'path';
import config from '../config.json';
import * as console from "console";

const models: any[] = config.openai.models;

async function main() {
    await openAIAPIHelpers.initAPI();
    AIHelpers.deleteFileIfExists(path.join(__dirname, '..', 'openAIApiResponse.json'));

    // @ts-ignore
    const articles: AIAPITypes.ArticleInterface[] = articlesJSON;
    const selectedArticles: AIAPITypes.ArticleInterface[] = [];

    // summary here is the actual content of the article
    articles.forEach(article => {
        if (article.summary) {
            selectedArticles.push({
                ...article,
                summary: AIHelpers.getFirst500Words(article.summary)
            });
            selectedArticles.push({
                ...article,
                summary: AIHelpers.getFirstMiddleLast250Words(article.summary)
            });
            selectedArticles.push({
                ...article,
                summary: AIHelpers.getAllWords(article.summary)
            });
        }
    });

    // console.log('In main; ', JSON.stringify(selectedArticles.map(article => ({
    //     title: article.title,
    //     url: article.url,
    //     original_summary: article.original_summary
    // })), null, 2));

    let apiResponse: ChatCompletion | undefined;
    let responseObject: any, computedData: any, originalData: any, combinedData: any;

    for (const model of models) {
        // Industry and types of articles informing
        apiResponse = await openAIAPIHelpers.informOpenAIAboutRules(model.name);
        if (apiResponse)
            console.log(`In main; apiResponse:  ${JSON.stringify(apiResponse)}; model: ${model.name}`);

        for (const article of selectedArticles) {
            try {
                if (article.title && article.summary) {

                    originalData = {
                        model: model.name,
                        originalTitle: article.title,
                        originalContent: article.summary,
                        url: article.url
                    }

                    const prompt = openAIAPIHelpers.constructPrompt(article.title, article.summary);
                    apiResponse = await openAIAPIHelpers.getOpenAIArticleProps(prompt, model.name);
                    if (apiResponse) {
                        console.log('In main; apiResponse: ', JSON.stringify(apiResponse));
                        if (apiResponse.choices[0].message.content) {
                            responseObject = AIHelpers.extractAndParseJSON(apiResponse.choices[0].message.content);
                            if (responseObject) {
                                const validResponse: boolean = AIHelpers.isValidAIResponse(responseObject);
                                if (validResponse) {
                                    computedData = {
                                        newTitle: responseObject.title,
                                        newSummary: responseObject.summary,
                                        industry: responseObject.industry,
                                        type: responseObject.type,
                                        viralTendencyScore: responseObject.viralTendencyScore,
                                        price: openAIAPIHelpers.calculateApiCallCostInDollars(prompt, apiResponse.choices[0].message.content, model.name)
                                    };
                                } else {
                                    console.error(`In main; Error not valid response: ${model.name}; title: ${article.title}`);
                                    computedData = {...responseObject}
                                }
                                combinedData = {...computedData, ...originalData};
                                // console.log('In main; combinedData: ', JSON.stringify(combinedData, null, 2));
                                AIHelpers.appendToJSONFile(path.join(__dirname, '..', 'openAIApiResponse.json'), combinedData);
                            }
                        } else {
                            console.error(`In main; Error no content message; model: ${model.name}; title: ${article.title}`);
                        }
                    } else {
                        console.error(`In main; Error no api response; model: ${model.name}; title: ${article.title}`);
                    }
                }
            } catch (error: any) {
                console.error(`In main; Error processing article with model: ${model.name}; title: ${article.title}; error: ${error}; message: ${error.message}`);
            }
        }
    }
}

main();