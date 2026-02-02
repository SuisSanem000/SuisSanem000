import {PoolClient} from "pg";
import OpenAI from "openai";
import {ChatCompletion} from "openai/resources/chat/completions";

import industries from './config/industries.json';
import types from './config/types.json';
import jobTitles from './config/jobTitles.json';
import config from '../../config.json';
import * as crawlHelpers from "../crawlHelpers";
import * as crawlTypes from "../crawlTypes";

let openai: OpenAI | undefined = undefined;

function checkOrInitOpenAIAPI(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null): boolean {
    if (!openai) {
        const apiKey = config.openai.apiKey;
        if (!apiKey) {
            crawlHelpers.addLog(logs, 'Error', 'AI', crawlKey, sharedClient, '', '', '', `Error in checkOrInitOpenAIAPI; no api key`);
            return false;
        }
        openai = new OpenAI({apiKey});
        if (!openai) {
            crawlHelpers.addLog(logs, 'Error', 'AI', crawlKey, sharedClient, '', '', '', `Error in checkOrInitOpenAIAPI; no openai object`);
        }
    }
    return !!openai;
}

async function callOpenAIAPI(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, prompt: string, model: string): Promise<ChatCompletion | undefined> {
    try {
        if (!openai) {
            await crawlHelpers.addLog(logs, 'Error', 'AI', crawlKey, sharedClient, '', '', '', `Error in callOpenAIAPI; openai is undefined`);
            return undefined;
        }

        return openai?.chat.completions.create({
            model: model,
            messages: [
                {role: "system", content: "You are a helpful assistant."},
                {role: "user", content: prompt}
            ],
            // @ts-ignore
            // response_format: {"type": "json_object"},
            "max_tokens": 2000,
            "temperature": 0.1
        });

    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'AI', crawlKey, sharedClient, '', '', '', `Error in callOpenAIAPI; error: ${error}; Message: ${error.message}`);
    }
}

async function getOpenAIArticlesProps(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, article: crawlTypes.ArticleInterface, model: string): Promise<ChatCompletion | undefined> {
    try {
        const industryNames = industries.map((industry, index) => `${index}: ${industry.name}`).join(', ');
        const typeNames = types.map((type, index) => `${index}: ${type.name}`).join(', ');

        //around 500 token
        const prompt = `Analyze the provided article to generate a new title and a summary. Ensure the title is concise, on-point, and accurately reflects the article's content, keeping it under 70 characters. Summarize the article by highlighting key points in standard, professional English within 2-4 bullet points, ensuring a total length of 500-750 characters at most.
        
        Identify the content type from the ${typeNames} list and the most relevant industry from the ${industryNames} list, selecting indices for "industry" and "type" strictly from the provided lists. Ensure that your selections align with the detailed descriptions in the InformingCallForCategorization call and reflect the article's content accurately. Select the most related industry and type based on confidence in what best fits the article's content, and choose -1 if no relevant fit is found.
        
        Estimate the article’s viral tendency score from 0-100 by assessing its relevance to current trends in the data and AI industry, its potential to engage and captivate readers interested in data and AI, and its overall ability to spark discussions or shares within communities. Consider how well the article aligns with current trends, its likelihood of resonating with and maintaining the interest of data and AI enthusiasts, and its broader appeal and potential for virality.
        
        Content details to be evaluated:
        Title: ${article.title}
        Content: ${article.content}
        
        Response Format:
        Strictly choose from the previously provided industry and type lists, ensuring the article's content aligns deeply with the described categories, and return only one JSON in the specified format, with all values as numerical indices except for the "newTitle" and "summary" fields.
        \`\`\`json
        {
            "newTitle":"New Title", 
            "summary": "• Summary item 1 • Summary item 2 • Summary item 3 • Summary item 4",
            "industry":Index(0 to industries.length - 1, -1if not relevant),
            "type": Index(0 to types.length - 1, -1 if not relevant),
            "viralTendency": (0 to 100)
        }
        \`\`\`
        
        Timing: Complete the task thoroughly within 30 seconds at most, using time efficiently.`;

        return await callOpenAIAPI(logs, crawlKey, sharedClient, prompt, model);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'AI', crawlKey, sharedClient, '', article.url, '', `Error in getOpenAIArticleProps; error: ${error}; Message: ${error.message}`);
    }
}

async function getOpenAIArticlesRelativityScore(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, article: crawlTypes.ArticleInterface, model: string): Promise<ChatCompletion | undefined> {
    try {
        const industryNames = industries.map((industry, index) => `${index}: ${industry.name}`).join(', ');
        const typeNames = types.map((type, index) => `${index}: ${type.name}`).join(', ');
        const jobTitlesNames = jobTitles.map((jobTitle, index) => `${index}: ${jobTitle.name}`).join(', ');

        const prompt = `Evaluate the relevance of the provided content for individuals holding any of the specified job roles in ${jobTitlesNames}. Identify the content type from the ${typeNames} list and the most relevant industry from the ${industryNames} list, selecting indices for "industry" and "type" strictly from these lists. Ensure that your selections align with the detailed descriptions in the InformingCallForCategorization call and reflect the article's content accurately. Rate the relatedness of the content from -100 (completely irrelevant) to +100 (highly relevant) based on how informative or useful the content is for their specific job responsibilities.
        
        Content details to be evaluated:
        Title: ${article.title}
        Body: ${article.content}
        
        Response Format:
        Strictly choose from the previously provided industry and type lists, ensuring the article's content aligns deeply with the described categories, and return only one JSON in the specified format, with all values as numerical indices except for the "reason" field.
        \`\`\`json
        {
            "industry": Selected Industry index (0 to industries.length-1, and -1 if not relevant),
            "type": Selected Type index (0 to types.length-1, and -1 if not relevant),
            "relativityScore": (-100 to 100),
            "reason": "Brief sentence explaining the relevance of the content"
         }
         \`\`\`
         Timing: Take time completing this task but keep it below 30 seconds.`;

        return await callOpenAIAPI(logs, crawlKey, sharedClient, prompt, model);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'AI', crawlKey, sharedClient, '', article.url, '', `Error in getOpenAIArticleProps; error: ${error}; Message: ${error.message}`);
    }
}

async function informOpenAIAboutRules(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, model: string): Promise<ChatCompletion | undefined> {
    try {
        const industryNames = industries.map((industry, index) => `${index}: ${industry.name}`).join(', ');
        const typeNames = types.map((type, index) => `${index}: ${type.name}`).join(', ');
        const jobTitlesNames = jobTitles.map((jobTitle, index) => `${index}: ${jobTitle.name}`).join(', ');

        //Inform open AI api to consider these industry and types of posts for following queries
        let prompt = `InformingCallForCategorization: remember the following "Industries", "Job Titles," and "Types" with their respective descriptions for categorizing articles I will provide in the following questions: 
        
        Industries: ${industryNames}
        
        Types: ${typeNames}
        
        Job Titles: ${jobTitlesNames}
        
        After providing an article, I will ask you to categorize it using exactly one "Industry" and one "Type" explicitly and strictly from these lists by their index.`;

        return await callOpenAIAPI(logs, crawlKey, sharedClient, prompt, model);
    } catch (error: any) {
        await crawlHelpers.addLog(logs, 'Error', 'AI', crawlKey, sharedClient, '', '', '', `Error in informOpenAIAboutRules; error: ${error}; Message: ${error.message}`);
    }
}

function calcPriceByOpenAITokens(prompt_tokens: number, completion_tokens: number, modelName: string): number {
    const model = config.openai.models.find(m => m.name === modelName);
    if (!model) {
        return -1;
    }
    const inputCost = (prompt_tokens / model.priceCriteria) * model.inputCost;
    const outputCost = (completion_tokens / model.priceCriteria) * model.outputCost;
    return inputCost + outputCost;
}

export {
    checkOrInitOpenAIAPI,
    getOpenAIArticlesProps,
    getOpenAIArticlesRelativityScore,
    informOpenAIAboutRules,
    calcPriceByOpenAITokens
}