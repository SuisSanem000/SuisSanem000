import * as crawlTypes from "../crawlTypes";
import {PoolClient} from "pg";
import * as crawlHelpers from "../crawlHelpers";

const categorizeCharCount = 2000;
const summaryCharCount = 40000;

function isValidAIResponse(obj: any, allFields: boolean): boolean {
    if (!obj)
        return false;

    if (allFields)
        return obj.newTitle != null && obj.summary != null && obj.industry != null && obj.type != null && obj.viralTendency != null;
    else
        return obj.relativityScore != null && obj.reason != null;
}

function extractAndParseJSON(logs: crawlTypes.LogInterface[], crawlKey: string, sharedClient: PoolClient | null, articleUrl: string | undefined, content: string | null | undefined): any {
    try {
        if (!content)
            return undefined;

        // Replace newlines inside JSON string values
        let cleanedString = content.trim();
        cleanedString = cleanedString.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
            return match.replace(/(?:\r\n|\r|\n)/g, ' ');
        });

        if (content.trim().startsWith('{') && content.trim().endsWith('}'))
            return JSON.parse(cleanedString);

        const jsonStart = content.indexOf('```json') + 7; // +7 to skip past the marker itself
        const jsonEnd = content.indexOf('```', jsonStart);
        if (jsonStart > 6 && jsonEnd > -1) {
            cleanedString = content.substring(jsonStart, jsonEnd);
            cleanedString = cleanedString.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
                return match.replace(/(?:\r\n|\r|\n)/g, ' ');
            });
            return JSON.parse(cleanedString);
        }

    } catch (error: any) {
        crawlHelpers.addLog(logs, 'Error', 'AI', crawlKey, sharedClient, undefined, articleUrl, undefined, `Error in extractAndParseJSON; error: ${error}; message: ${error.message}`);
    }
}

function getTextSegment(text: string, cutoff: number): string {
    const punctuationMarks = ['.', '!', '?', ';', ':', '...'];
    if (text.length <= cutoff)
        return text;
    let end = text.length; // Default to the end of the text if no punctuation is found
    for (let i = cutoff; i < text.length; i++)
        if (punctuationMarks.includes(text[i]) || (text.substring(i, i + 3) === '...')) {
            end = i;
            break;
        }
    cutoff = end + 1 >= cutoff ? end + 1 : cutoff;
    return text.substring(0, cutoff);
}

function checkAIResponseState(logs: crawlTypes.LogInterface[],
                              crawlKey: string,
                              sharedClient: PoolClient | null,
                              articleUrl: string | undefined,
                              gotAPIResponse: boolean,
                              gotMessageContent: boolean,
                              gotResponseObject: boolean,
                              isValidAIResponse: boolean,
                              callerFunctionName: string): boolean {

    const state = {
        gotAPIResponse,
        gotMessageContent,
        gotResponseObject,
        isValidAIResponse
    };

    const allTrue = Object.values(state).every(value => value);

    if (!allTrue) {
        const errorMessage = `Error in getAndReportAIState; callerFunctionName: ${callerFunctionName}; ${Object.entries(state).map(([key, value]) => `${key}: ${value}`).join(', ')}`;
        crawlHelpers.addLog(logs, 'Error', 'AI', crawlKey, sharedClient, undefined, articleUrl, undefined, errorMessage);
    }

    return allTrue;
}

function convertBulletedListToArray(bulletedList: string | undefined): string[] | null {
    if (!bulletedList) return null;
    return bulletedList
        .split(/(?:\r\n|\r|\n|•)/)  // Split by new lines or the bullet character
        .map(line => line.trim())   // Trim each line
        .filter(line => line.length > 0);  // Filter out any empty lines
}

export {
    isValidAIResponse,
    extractAndParseJSON,
    checkAIResponseState,
    convertBulletedListToArray,
    getTextSegment, summaryCharCount, categorizeCharCount
}