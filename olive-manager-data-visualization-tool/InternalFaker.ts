import {faker} from '@faker-js/faker';
import {ESort, IColumn, IProgressStep} from './Types.ts';
import {defaultCellWidth} from './Constants.ts';
import {errorCatch, generateGUID} from './Utils.ts';

export const HEADERS: string[] = ['productId', 'name', 'category', 'description', 'price', 'discount', 'stockQuantity', 'supplierName', 'supplierEmail', 'manufactureDate', 'expiryDate', 'rating', 'reviewsCount', 'weight', 'dimensions'];

function generateRowData(): string[] {
    return [
        faker.string.uuid(),
        faker.commerce.productName(),
        faker.commerce.department(),
        faker.commerce.productDescription(),
        faker.commerce.price(),
        faker.number.int({min: 0, max: 50}).toString(), // Discount percentage
        faker.number.int({min: 0, max: 1000}).toString(), // Stock quantity
        faker.company.name(),
        faker.internet.email(),
        faker.date.past().toISOString().split('T')[0], // Manufacture date
        faker.date.future().toISOString().split('T')[0], // Expiry date
        faker.number.float({min: 1, max: 5, multipleOf: 0.1}).toFixed(1), // Rating
        faker.number.int({min: 0, max: 5000}).toString(), // Reviews count
        `${faker.number.float({min: 1, max: 5, multipleOf: 0.1}).toFixed(1)} kg`, // Weight
        `${faker.number.int({min: 10, max: 50})}x${faker.number.int({
            min: 10,
            max: 50
        })}x${faker.number.int({
            min: 10,
            max: 50
        })} cm` // Dimensions
    ];
}

export function populateProductCSVData(rowCount: number, targetArray: string[][]): void {
    for (let i = 0; i < rowCount; i++)
        targetArray.push(generateRowData());
}

// Function to generate columns dynamically based on headers
export function generateColumnsFromHeaders(): IColumn[] {
    return HEADERS.map((header, index) => ({
        key: generateGUID(),
        index,
        title: header.charAt(0).toUpperCase() + header.slice(1), // Capitalized header as title
        width: defaultCellWidth,
        sort: ESort.None,
        visible: true
    }));
}

export function generateRandomFilePath(fileName: string = ''): string {
    return errorCatch((fileName: string = ''): string => {
        const driveLetter = faker.string.fromCharacters('CDEFGH'); // Random drive letter
        const numberOfFolders = faker.number.int({min: 1, max: 5}); // Random number of folders in the path
        const folderNames = Array.from({length: numberOfFolders}, () =>
            faker.system.directoryPath().split('\\').pop() // Generate random folder names
        );
        let generatedFileName = fileName;
        if (generatedFileName === '')
            generatedFileName = faker.system.fileName(); // Generate a random file name with extension
        return `${driveLetter}:\\${folderNames.join('\\')}\\${generatedFileName}`;
    }, 'generateRandomFilePath', ...arguments);
}

// Dynamically create realistic progress steps while maintaining a total row count of totalRows.
export function generateDynamicProgressSteps(totalRows: number, stepCount: number): IProgressStep[] {
    const steps: IProgressStep[] = [];
    let generatedRows = 0;

    for (let i = 0; i < stepCount; i++) {
        const isLastStep = i === stepCount - 1;
        const remainingRows = totalRows - generatedRows;
        const rowsToGenerate = isLastStep
            ? remainingRows
            : faker.number.int({
                min: Math.ceil(remainingRows / (stepCount - i)),
                max: Math.ceil(remainingRows / 2)
            });

        const timeTaken: number = faker.number.float({min: 100, max: 250, multipleOf: 1});
        const stepProgress: number = isLastStep ? 100 : Math.round(((i + 1) / stepCount) * 100);

        steps.push({progress: stepProgress, rowsToGenerate, timeTaken});
        generatedRows += rowsToGenerate;
        if (generatedRows >= totalRows)
            break;
    }

    return steps;
}