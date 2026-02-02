import {GenerateContentResult} from "@google-cloud/vertexai/src/types/content";

import path from "path";
import * as AIAPITypes from "./AITypes";
// import articlesJSON from "../data/articles.json";
import articlesJSON from '../data/1weekArticlesLobsters.json';
// import articlesJSON from '../data/1weekArticlesEye.json';
import console from "console";
import * as AIHelpers from './AIHelpers';
import * as vertexAIHelpers from './vertexAIHelpers';
import config from "../config.json";
const models: any[] = config.vertexai.models;

async function main() {
    await vertexAIHelpers.initAPI();
    AIHelpers.deleteFileIfExists(path.join(__dirname, '..', 'vertexAIApiResponse.json'));

    // @ts-ignore
    const articles: AIAPITypes.ArticleInterface[] = articlesJSON;
    const selectedArticles: AIAPITypes.ArticleInterface[] = [];

    // original_summary here is the actual content of the article
    articles.forEach(article => {
        if (article.summary) {
            selectedArticles.push({...article, summary: AIHelpers.getFirst500Words(article.summary)});
            selectedArticles.push({...article,summary: AIHelpers.getFirstMiddleLast250Words(article.summary)});
            selectedArticles.push({...article,summary: AIHelpers.getAllWords(article.summary)});
        }
    });

    // console.log('In main; ', JSON.stringify(selectedArticles.map(article => ({
    //     title: article.title,
    //     url: article.url,
    //     original_summary: article.original_summary
    // })), null, 2));

    let apiResponse: GenerateContentResult | undefined;
    let responseObject: any, computedData: any, originalData: any, combinedData: any;

    for (const model of models) {
        // Industry and types of articles informing
        apiResponse = await vertexAIHelpers.informVertexAIAboutRules(model.name);
        if (apiResponse)
            console.log(`In main; apiResponse:  ${JSON.stringify(apiResponse)}; model: ${model.name}`);
        console.log(`selectedArticles.length: ${selectedArticles.length}`);

        for (const article of selectedArticles) {
            try {
                if (article.title && article.original_summary) {
                    console.log(`article.title: ${article.title}`);

                    originalData = {
                        model: model.name,
                        originalTitle: article.title,
                        originalContent: article.original_summary,
                        url: article.url
                    }

                    const prompt = vertexAIHelpers.constructPrompt(article.title, article.original_summary);
                    apiResponse = await vertexAIHelpers.getVertexAIArticleProps(prompt, model.name);
                    if (apiResponse) {
                        console.log('In main; apiResponse: ', JSON.stringify(apiResponse));
                        if (apiResponse.response) {
                            const responseText = apiResponse.response.candidates.map(candidate => candidate.content.parts.map(part => part.text).join(' ')).join(' ');
                            responseObject = AIHelpers.extractAndParseJSON(responseText);
                            if (responseObject) {
                                const validResponse: boolean = AIHelpers.isValidAIResponse(responseObject);
                                if (validResponse) {
                                    computedData = {
                                        NewTitle: responseObject.title,
                                        newSummary: responseObject.summary,
                                        industry: responseObject.industry,
                                        type: responseObject.type,
                                        viralTendencyScore: responseObject.viralTendencyScore,
                                        price: vertexAIHelpers.calculateApiCallCostInDollars(prompt, responseText, model.name)
                                    };
                                } else {
                                    console.error(`In main; Error not valid response: ${model.name}; title: ${article.title}`);
                                    computedData = {...responseObject}
                                }
                            combinedData = {...computedData, ...originalData};
                            console.log('In main; combinedData: ', JSON.stringify(combinedData, null, 2));
                            AIHelpers.appendToJSONFile(path.join(__dirname, '..', 'vertexAIApiResponse.json'), combinedData);
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



