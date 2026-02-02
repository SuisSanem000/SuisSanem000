import {VertexAI} from '@google-cloud/vertexai';
import {GenerateContentResult} from "@google-cloud/vertexai/src/types/content";

import * as console from "console";
import industries from '../data/industries.json';
import types from '../data/types.json';
import config from '../config.json';

let project, location, vertex_ai: VertexAI;

async function initAPI() {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = config.vertexai.apiKey;
    project = config.vertexai.project;
    location = config.vertexai.location;
    vertex_ai = new VertexAI({project: project, location: location});
}

async function callVertexAIAPI(prompt: string, model: string): Promise<GenerateContentResult | undefined> {
    try {
        await sleep(15000);
        const getGenerativeModel = (textModel: string) => vertex_ai.getGenerativeModel({model: textModel});
        const request = {
            contents: [{role: 'user', parts: [{text: prompt}]}],
        };
        const generativeModel = getGenerativeModel(model);
        return await generativeModel.generateContent(request);
    } catch (error: any) {
        console.error(`Error in callVertexAIAPI; Error: ${error}; Message: ${error.message}`);
    }
}

async function getVertexAIArticleProps(prompt: string, model: string): Promise<GenerateContentResult | undefined> {
    try {
        return await callVertexAIAPI(prompt, model);
    } catch (error: any) {
        console.error(`Error in getOpenAIArticleProps; Error: ${error}; Message: ${error.message}`);
    }
}

//Inform vertex AI api to consider these industry and types of posts for following queries
async function informVertexAIAboutRules(model: string): Promise<GenerateContentResult | undefined> {
    try {
        let prompt = 'Remember the following "industries" and "types of articles" for categorizing articles I will provide shortly:\n\n';

        // Add industry categories to the prompt
        prompt += 'Industries:\n';
        industries.forEach(industry => {
            prompt += `Name: ${industry.name}\nDescription: ${industry.description}\n\n`;
        });

        // Add article types to the prompt
        prompt += 'Article Types:\n';
        for (const type in types) {
            prompt += `Type: ${type}\nDescription: ${types[type].description}\n\n`;
        }

        prompt += 'After providing an article, I will ask you to categorize it using exactly one "industry" and one "article type" explicitly and strictly from these lists.';

        // Make the OpenAI API call with the constructed prompt
        return await callVertexAIAPI(prompt, model);
    } catch (error: any) {
        console.error(`Error in informOpenAIAboutRules; Error: ${error}; Message: ${error.message}`);
    }
}

function calculateApiCallCostInDollars(input: string, output: string, modelName: string): number | null {
    const model = config.vertexai.models.find(m => m.name === modelName);
    if (!model) {
        console.error("Model not found");
        return null;
    }
    const inputCost = (input.length / 1000) * model.inputCost;
    const outputCost = (output.length / 1000) * model.outputCost;
    return (inputCost + outputCost) * 100;
}

function constructPrompt(title: string, content: string): string {
    const industryNames = industries.map(industry => industry.name).join(', ');
    const typeNames = types.map(type => type.name).join(', ');

    return `Create a title and a summary for the provided article, then categorize it and estimate its viral potential.\n\n` +
        `Title and Content: "${title}" | "${content}"\n` +
        `1. Title: Generate a concise title from the article's title and content.\n` +
        `2. Summary: Write a concise, clear, and engaging summary (500-750 characters, 2-4 bullet points). Ensure it is complete, accurate, and well-structured, and exactly in the format I said.\n` +
        `3. Category: Select an "industry" and a "type" from the provided lists:\n   Industries: ${industryNames}\n   Types: ${typeNames}\n, keeping in mind the details including the description and keywords I said earlier about each of them.` +
        `4. Viral Tendency: Score the article's viral potential from 0-100, considering topic relevance, audience engagement, and current trends.\n` +
        `Time Limit: take your time to create the best response, but keep the time below 30 seconds.\n` +
        `Response in JSON, in this format: {"title": "New Title", "summary": ["Bullet 1", "Bullet 2", ...], "industry": "Selected Industry", "type": "Selected Type", "viralTendencyScore": [Score]}.\n` +
        `Be strict on the response format and the lists selections and all the rules I said.`;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export {
    sleep,
    constructPrompt,
    informVertexAIAboutRules,
    getVertexAIArticleProps,
    callVertexAIAPI,
    initAPI,
    calculateApiCallCostInDollars
}