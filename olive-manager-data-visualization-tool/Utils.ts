import {Buffer} from 'buffer';
import {IErrorLog} from './Types.ts';
import {units} from './Constants.ts';
import {isValidURL} from './Helpers.ts';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Creates a globally unique identifier.
export function generateGUID(): string {
        return crypto.randomUUID();
}

// Saves key-value pairs to local storage.
export function saveToLocalStorage(dataName: string, data: any) {
    localStorage.setItem(dataName, JSON.stringify(data));
}

// Loads data from local storage based on a key.
export function loadFromLocalStorage(dataName: string, parse: boolean = true): any {
    const data: string | null = localStorage.getItem(dataName);
    return data ? (parse ? JSON.parse(data) : data) : null;
}

export function openMailApp(email: string): void {
    window.location.href = `mailto:${email}`;
}

export function insertIntoArray<T>(array: T[], item: T, position: 'top' | 'bottom' | number): T[] {
    if (position === 'top')
        array.unshift(item);
    else if (position === 'bottom')
        array.push(item);
    else if (position >= 0 && position <= array.length)
        array.splice(position, 0, item);
    return array;
}

export async function copyToClipboard(text: string): Promise<void> {
    return await navigator.clipboard.writeText(text);
}

export async function getFromClipboard(): Promise<string> {
    return await navigator.clipboard.readText();
}

// Generate Hardware ID Using crypto.getRandomValues
export function generateHardwareId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const buffer: Buffer = Buffer.from(array);
    return buffer.toString('hex');
}

export function extractDomain(url: string): string {
    return errorCatch((url: string): string => {
        if (isValidURL(url)) {
            const {origin} = new URL(url);
            return origin;
        } else {
            return '';
        }
    }, 'extractDomain', ...arguments);
}

export function getRandomNumberInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function updateOrAddItemWithKey<T>(array: T[], newItem: Partial<T>, keyField: keyof T): T[] {
    // Throw if the key value does not exist on newItem, because key is a mandatory field
    if (newItem[keyField] === undefined)
        throw new Error(`Error in updateOrAddItemWithKey; Missing keyField '${String(keyField)}' in newItem; cannot update or add item without a key.`);
    const existingIndex: number = array.findIndex(item => item[keyField] === newItem[keyField]);
    const updatedArray: T[] = [...array];
    if (existingIndex !== -1)
        updatedArray[existingIndex] = {...updatedArray[existingIndex], ...newItem} as T;
    else
        updatedArray.push(newItem as T);
    return updatedArray;
}

//Error management
//This utility function in used to list params by their name and value and trim param values bigger than 100 characters
export function formatParams(params: Record<string, any>): string {
    return Object.entries(params)
        .map(([key, value]) => {
            const stringValue = typeof value === 'string' ? value.substring(0, 100) : JSON.stringify(value);
            return `${key}: ${stringValue}`;
        })
        .join('; ');
}

export function logError(context: string, params: string, error: Error): void {
    const errorDetails: IErrorLog = {
        timestamp: new Date().toISOString(),
        context: context,
        message: error.message,
        params: params,
        stack: error.stack
    };
    console.error(errorDetails);
}

export function errorCatch(callback: any, context: string, ...args: any) {
    try {
        return callback(...args);
    } catch (e: any) {
        logError(context, formatParams(Array.from(args)), e);
        throw e;
    }
}

export async function errorCatchAsync(callback: any, context: string, ...args: any) {
    try {
        return await callback(...args);
    } catch (e: any) {
        logError(context, formatParams(Array.from(args)), e);
        throw e;
    }
}

// file size conversions from bytes to human-readable formats
export function formatFileSize(fileSizeInBytes: number): string {
    let unitIndex = 0;
    let fileSize = fileSizeInBytes;

    // Determine the appropriate unit
    while (fileSize >= 1000 && unitIndex < units.length - 1) {
        fileSize /= 1000;
        unitIndex++;
    }

    // Format the file size with commas and up to 1 decimal point
    const formattedSize = fileSize.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 1,});
    return `${formattedSize} ${units[unitIndex]}`;
}

export function valueToLocaleString(value: number) {
    return value.toLocaleString(undefined);
}

export function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Takes a timestamp (in milliseconds) and returns it, formatted as a string (e.g., '12 May 2024')
export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}