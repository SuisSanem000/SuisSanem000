import {ChatCompletion} from "openai/resources/chat/completions";
import {PoolClient} from "pg";

import * as AIHelpers from './AIHelpers';
import * as openAIAPIHelpers from './openAIHelpers';
import * as databaseInteractions from '../databaseInteractions';
import config from '../../config.json';
import * as crawlTypes from "../crawlTypes";
import * as crawlHelpers from "../crawlHelpers";
// import industries from './config/industries.json';
// import types from './config/types.json';

const models: any[] = config.openai.models;

function updateMetadataPrice(apiResponse: ChatCompletion | undefined, article: crawlTypes.ArticleInterface, modelName: string) {
    const prompt_tokens = apiResponse?.usage?.prompt_tokens;
    const completion_tokens = apiResponse?.usage?.completion_tokens;
    if (article.metadata)
        if (prompt_tokens && completion_tokens)
            article.metadata.price = article.metadata.price + openAIAPIHelpers.calcPriceByOpenAITokens(prompt_tokens, completion_tokens, modelName);
}

async function calcArticlesRelativityScore(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, articles: crawlTypes.ArticleInterface[], rawArticles?: boolean) {
    const selectedModel = models[0];
    if (!openAIAPIHelpers.checkOrInitOpenAIAPI(logs, crawlKey, sharedClient))
        return;
    if (articles.length == 0)
        return;
    if (config.mode === 'Testing') {
        articles = articles.slice(0, 3);
    }

    // Industry and types of articles informing
    let apiResponse: ChatCompletion | undefined = await openAIAPIHelpers.informOpenAIAboutRules(logs, crawlKey, sharedClient, selectedModel.name);
    updateMetadataPrice(apiResponse, articles[0], selectedModel.name); //Add this call's price to the first article price
    apiResponse = undefined;
    // trimmedArticles = trimmedArticles.slice(0, 3); //TODO: for test
    for (const article of articles) {
        try {
            if (article.content && article.metadata) {
                //Temporarily store the actual content data of the article in its content field then retrieve the filepath value before updating
                const filePathContent = article.content;
                article.content = await crawlHelpers.readFileAsString(article.content);
                article.content =  AIHelpers.getTextSegment(article.content, AIHelpers.categorizeCharCount);
                apiResponse = await openAIAPIHelpers.getOpenAIArticlesRelativityScore(logs, crawlKey, sharedClient, article, selectedModel.name);
                const responseObject: any = AIHelpers.extractAndParseJSON(logs, crawlKey, sharedClient, article.url, apiResponse?.choices[0].message.content);
                if (!AIHelpers.checkAIResponseState(logs, crawlKey, sharedClient, article.url, !!apiResponse, !!apiResponse?.choices[0].message.content, !!responseObject, AIHelpers.isValidAIResponse(responseObject, false), 'calcArticlesRelativityScore'))
                    continue;
                article.relativity_score = responseObject.relativityScore;
                article.metadata.reason = responseObject.reason;
                updateMetadataPrice(apiResponse, article, selectedModel.name);
                article.content = filePathContent;
                await databaseInteractions.updateArticle(logs, crawlKey, sharedClient, article, rawArticles);
            }
        } catch (error: any) {
            await crawlHelpers.addLog(logs, 'Error', 'AI', crawlKey, sharedClient, '', article.url, '', `Error in calcArticlesRelativityScore; model: ${selectedModel.name}; error: ${error}; message: ${error.message}`);
        }
    }
}

async function calcArticlesAIFields(logs: crawlTypes.LogInterface[], crawlKey: string, articles: crawlTypes.ArticleInterface[], sharedClient: PoolClient | null) {
    const selectedModel = models[0];
    await crawlHelpers.addLog(logs, 'Info', 'None', crawlKey, sharedClient, '', '', '', `In calcArticlesAIFields; article.length: ${articles.length}`);
    if (!openAIAPIHelpers.checkOrInitOpenAIAPI(logs, crawlKey, sharedClient))
        return;
    if (articles.length == 0)
        return;

    if (config.mode === 'Testing') {
        articles = articles.slice(0, 3);
    }

    // Industry and types of articles informing
    let apiResponse: ChatCompletion | undefined = await openAIAPIHelpers.informOpenAIAboutRules(logs, crawlKey, sharedClient, selectedModel.name);
    updateMetadataPrice(apiResponse, articles[0], selectedModel.name); //Add this call's price to the first article price
    apiResponse = undefined;
    // trimmedArticles = trimmedArticles.slice(0, 3); //TODO: for test
    for (const article of articles) {
        try {
            if (article.content) {
                //Temporarily store the actual content data of the article in its content field then retrieve the filepath value before updating
                const filePathContent = article.content;
                article.content = await crawlHelpers.readFileAsString(article.content);
                article.content =  AIHelpers.getTextSegment(article.content, AIHelpers.summaryCharCount);
                apiResponse = await openAIAPIHelpers.getOpenAIArticlesProps(logs, crawlKey, sharedClient, article, selectedModel.name);
                const responseObject: any = AIHelpers.extractAndParseJSON(logs, crawlKey, sharedClient, article.url, apiResponse?.choices[0].message.content);

                if (!AIHelpers.checkAIResponseState(logs, crawlKey, sharedClient, article.url, !!apiResponse, !!apiResponse?.choices[0].message.content, !!responseObject, AIHelpers.isValidAIResponse(responseObject, true), 'calcArticlesAIFields'))
                    continue;
                article.ai_title = responseObject.newTitle;
                article.ai_summary = AIHelpers.convertBulletedListToArray(responseObject.summary);
                article.industry = responseObject.industry;
                article.type = responseObject.type;
                article.viral_tendency = responseObject.viralTendency;
                updateMetadataPrice(apiResponse, article, selectedModel.name);
                article.content = filePathContent;
                await databaseInteractions.updateArticle(logs, crawlKey, sharedClient, article);
            }
        } catch (error: any) {
            await crawlHelpers.addLog(logs, 'Error', 'AI', crawlKey, sharedClient, '', article.url, '', `Error in calcArticlesAIFields; model: ${selectedModel.name}; error: ${error}; message: ${error.message}`);
        }
    }
}

export {
    calcArticlesRelativityScore,
    calcArticlesAIFields
};
