import OpenAI from "openai";
import {ChatCompletion} from "openai/src/resources/chat/completions";
import * as console from "console";
import industries from '../data/industries.json';
import types from '../data/types.json';
import {encoding_for_model, TiktokenModel} from "@dqbd/tiktoken";
import config from '../config.json';

let openai: OpenAI;

async function initAPI() {
    const apiKey = config.openai.apiKey;
    // const apiKey: string | undefined = process.env.OPENAI_API_KEY;
    // console.log(`In main; apiKey: ${apiKey}`);

    if (!apiKey) {
        throw new Error("The OPENAI_API_KEY environment variable is missing.");
    }
    openai = new OpenAI({apiKey});
}


async function callOpenAIAPI(prompt: string, model: string): Promise<ChatCompletion | undefined> {
    try {
        return openai.chat.completions.create({
            model: model,
            messages: [
                {role: "system", content: "You are a helpful assistant."},
                {role: "user", content: prompt}
            ],
            // // @ts-ignore
            // response_format: {"type": "json_object"}
        });
    } catch (error: any) {
        console.error(`Error in callOpenAIAPI; Error: ${error}; Message: ${error.message}`);
    }
}

async function getOpenAIArticleProps(prompt: string, model: string): Promise<ChatCompletion | undefined> {
    try {
        return await callOpenAIAPI(prompt, model);
    } catch (error: any) {
        console.error(`Error in getOpenAIArticleProps; Error: ${error}; Message: ${error.message}`);
    }
}

//Inform open AI api to consider these industry and types of posts for following queries
async function informOpenAIAboutRules(model: string): Promise<ChatCompletion | undefined> {
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
        return await callOpenAIAPI(prompt, model);
    } catch (error: any) {
        console.error(`Error in informOpenAIAboutRules; Error: ${error}; Message: ${error.message}`);
    }
}

function tokenCount(message: string, modelName: TiktokenModel): number {
    const encoder = encoding_for_model(modelName);
    const tokens = encoder.encode(message);
    encoder.free();
    return tokens.length;
}

function calculateApiCallCostInDollars(input: string, output: string, modelName: TiktokenModel): number | null {
    const inputTokenCount = tokenCount(input, modelName);
    const outputTokenCount = tokenCount(output, modelName);
    const model = config.openai.models.find(m => m.name === modelName);
    if (!model) {
        console.error("Model not found");
        return null;
    }
    const inputCost = (inputTokenCount / 1000) * model.inputCost;
    const outputCost = (outputTokenCount / 1000) * model.outputCost;
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

export {
    initAPI,
    getOpenAIArticleProps,
    informOpenAIAboutRules,
    calculateApiCallCostInDollars,
    constructPrompt
}