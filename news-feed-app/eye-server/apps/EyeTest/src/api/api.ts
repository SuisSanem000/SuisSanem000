import axios from 'axios';
import * as config from '../../config.json';

const serverBaseDomain = config.serverBaseDomain;

interface ApiResponse {
    success: boolean;
    status: number;
    data?: any;
    error?: string;
}

async function getData(url: string, callerFunction: string): Promise<ApiResponse> {
    try {
        const response = await axios.get(url, {
            timeout: 5000,
            responseType: "json"
        });
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
    return getData(url, 'apiGetArticlesOfADate');
}

async function apiGetSources(): Promise<ApiResponse> {
    const url = `${serverBaseDomain}${config.json_path}sources`;
    return getData(url, 'apiGetSources');
}

async function apiGetCrawlDates(): Promise<ApiResponse> {
    const url = `${serverBaseDomain}${config.json_path}crawl-dates`;
    return getData(url, 'apiGetCrawlDates');
}

export {
    apiGetArticlesOfADate, apiGetCrawlDates, apiGetSources,
};