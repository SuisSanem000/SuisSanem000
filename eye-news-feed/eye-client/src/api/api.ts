import axios from 'axios';
import * as config from '../../config.json';

const serverBaseDomain = config.serverBaseDomain;

interface ApiResponse {
    success: boolean;
    status: number;
    data?: any;
    error?: string;
}

type ConfigMode = "development" | string

async function getData(url: string, callerFunction: string): Promise<ApiResponse> {
    const mode: ConfigMode = config.mode
    try {
        let response;
        if (mode === "development") {
            response = await axios.get(url, {
                    timeout: 5000,
                    responseType: "json",
                    headers: {'Authorization': "Basic ZGV2OjlbRD5CX01STjNGOWcrYFctL1Em"}
                },
            );
        } else {//??
            response = await axios.get(url, {
                    timeout: 5000,
                    responseType: "json",
                },
            );
        }

        if (response.status === 200) {
            return {success: true, data: response.data, status: response.status};
        } else {
            return {
                success: false,
                error: `Request failed with status code: ${response.status}`,
                status: response.status
            };
        }
    } catch (error) {
        return {success: false, error: `Error in ${callerFunction}: ${error}`, status: -1};
    }
}

async function apiGetArticlesOfADate(date: string): Promise<ApiResponse> {
    const url = `${serverBaseDomain}${config.json_path}${date}`;
    return await getData(url, 'apiGetArticlesOfADate');
}

async function apiGetSources(): Promise<ApiResponse> {
    const url = `${serverBaseDomain}${config.json_path}sources`;
    return await getData(url, 'apiGetSources');
}

async function apiGetCrawlDates(): Promise<ApiResponse> {
    const url = `${serverBaseDomain}${config.json_path}crawl-dates`;
    return await getData(url, 'apiGetCrawlDates');
}

export {
    apiGetArticlesOfADate, apiGetCrawlDates, apiGetSources,
};