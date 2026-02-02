import * as fs from 'fs';
import * as console from "console";

function isValidAIResponse(obj: any): boolean {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    if (typeof obj.title !== 'string' || typeof obj.industry !== 'string' || typeof obj.type !== 'string' || typeof obj.viralTendencyScore !== 'number') {
        return false;
    }

    return !(!Array.isArray(obj.summary) || !obj.summary.every(function (item: any) {
        return typeof item === 'string';
    }));
}

function getFirst500Words(text: string): string {
    let words = text.split(/\s+/);
    return words.slice(0, 500).join(' ');
}

function getFirstMiddleLast250Words(text: string): string {
    let words = text.split(/\s+/);
    let first = words.slice(0, 250).join(' ');
    let middle = words.slice(Math.max(0, Math.floor(words.length / 2) - 125), Math.min(words.length, Math.floor(words.length / 2) + 125)).join(' ');
    let last = words.slice(Math.max(0, words.length - 250)).join(' ');
    return first + middle + last;
}

function getAllWords(text: string): string {
    let words = text.split(/\s+/);
    return words.join(' ');
}

function extractAndParseJSON(content: string): any {
    console.log(`In extractAndParseJSON; content: ${content}`);
    try {
        // Check if the content is already a valid JSON
        if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
            return JSON.parse(escapeSpecialChars(content));
        }

        const jsonStart = content.indexOf('```json') + 7; // +7 to skip past the marker itself
        const jsonEnd = content.indexOf('```', jsonStart);
        if (jsonStart > 6 && jsonEnd > -1) {
            let jsonString = content.substring(jsonStart, jsonEnd).trim();
            jsonString = escapeSpecialChars(jsonString);
            return JSON.parse(jsonString);
        }
    } catch (error: any) {
        console.error(`Error in extractAndParseJSON; error: ${error}; message: ${error.message}`);
    }

    // Helper function to escape special characters
    function escapeSpecialChars(jsonString: string): string {
        return jsonString
            .replace(/\\n/g, "\\\\n")    // Replace newlines with \\n
            .replace(/\\r/g, "\\\\r")    // Replace carriage returns with \\r
            .replace(/\\t/g, "\\\\t")    // Replace tabs with \\t
            .replace(/\\\\'/g, "\\\\'")   // Escape single quotes
            .replace(/\\\\"/g, '\\\\"');  // Escape double quotes
    }
}

function appendToJSONFile(filePath: string, data: any) {
    console.log('In appendToJSONFile;');
    let existingData: any[] = [];

    // Parse the new data if it's a string
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing data string:', error);
            return;
        }
    }

    // Check if the file exists and read its contents
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
            existingData = JSON.parse(fileContent);
            // Ensure the parsed file content is an array
            if (!Array.isArray(existingData)) {
                console.error('File content is not an array');
                return;
            }
        } catch (error) {
            console.error('Error parsing JSON from file:', error);
            return;
        }
    }

    // Append the new data to the existing data
    existingData.push(data);

    // Write the updated array back to the file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    console.log('Updated array:', JSON.stringify(existingData));
}

function deleteFileIfExists(filePath: string) {
    console.log('In deleteFileIfExists;');

    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`File at ${filePath} deleted successfully.`);
        } catch (error) {
            console.error(`Error in deleteFileIfExists; Error deleting file: ${error}`);
        }
    } else {
        console.log(`File at ${filePath} does not exist, no action taken.`);
    }
}

export {
    isValidAIResponse,
    getFirst500Words,
    getAllWords,
    getFirstMiddleLast250Words,
    extractAndParseJSON,
    appendToJSONFile,
    deleteFileIfExists
}