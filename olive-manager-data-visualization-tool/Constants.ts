import {EFileFormat} from './Types.ts';

export const jsonDataMetricNames = ['Size', 'Element', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Null'];

export const csvDataMetricNames = ['Size', 'Rows', 'Columns', 'Fields'];

export const updateIntervalInMS = 12 * 60 * 60 * 1000;
export const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'RB', 'QB'];

export const defaultCellWidth: number = 200;

export const sampleFileRowCount = 5000;

export const freeLicenseFileSizeLimit: number = 50 * 1000 * 1000; // 50 MB

export const recentFilesCount: number = 10; // 50 MB

export const currentFileFormat: EFileFormat = EFileFormat.CSV;

export const redactChar = '█';

//License stuff
// Array of file size limits based on levels (in bytes)
export const SIZE_LIMITS = [
    512 * 1000 * 1000,          // Level 0: 512 MB
    32 * 1000 * 1000 * 1000,    // Level 1: 32 GB
    64 * 1000 * 1000 * 1000,    // Level 2: 64 GB
    128 * 1000 * 1000 * 1000,   // Level 3: 128 GB
    256 * 1000 * 1000 * 1000,   // Level 4: 256 GB
    512 * 1000 * 1000 * 1000    // Level 5: 512 GB
];

export const sampleFileName = '2023-09-01_100-Percent-Chiropractic-Atlanta-Five-LLC_index.csv';

export const sampleFilePath = 'C:/Users/example/this/is/nested/path/';
export const sampleURLPath = 'https://github.com/DadroitOrganization/Generator/releases/download/Release_Sample_Data/asdasdasd/DadroitOrganization/Generator/releasdases/doaawnload/Release_Sample_Data/';

export const testPaths = [
    'C:\\Folder\\SubFolder\\FileA.txt',
    'C:\\Folder\\SubFolder\\abc\\def\\FileA.txt',
    'C:\\Folder\\AnotherSubFolder\\abc\\def\\FileA.txt',
    '/bin/FileA.txt',
    '/usr/local/bin/FileA.txt',
    '/usr/local2/bin/FileA.txt',
    '/usr/local/share/bin/script.sh',
    '/home/user/projects/myapp/src/index.js',
    'https://domain.com/a/c/files/abc/fileB.json',
    'https://domain.com/d/c/files/abc/fileB.json',
    'https://otherdomain.com/files/abc/fileB.json'
];