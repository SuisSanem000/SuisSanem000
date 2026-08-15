import recordsData from "./../assets/test-data/data.json";
import twitterData from "./../assets/test-data/twitter.json";

let records, headers, colCount, rowCount, columnSizes, cellHeight, fixCellWidth, cellWidth, context, canvas,
    //The -1 is for first reserved column and row
    // fixRows = [-1, 0, 1], fixColumns = [-1, 0, 1]
    fixRows = [-1], fixColumns = [-1]
;

//Check if the dst 1d array is in any cells of the src 2d array
const isIn2DArray = (src, dst) => src.some(a => {
    return (a.length > dst.length ? a : dst).every((item, i) => a[i] === dst[i]);
});

//Checks if the dst coordinates is in the square defined by src array [topLeftCorner, bottomDownCorner]
const isInSelectedSquare = (src, dst) => {
    if (src.length === 0) return;
    const minX = Math.min(src[0][0], src[1][0]);
    const minY = Math.min(src[0][1], src[1][1]);
    const maxX = Math.max(src[0][0], src[1][0]);
    const maxY = Math.max(src[0][1], src[1][1]);
    return ((dst[0] >= minX) && (dst[0] <= maxX)) && ((dst[1] >= minY) && (dst[1] <= maxY));
}

function init() {
    // let combinedOne;

    records = recordsData.RECORDS;

    //Only for making 100k rows
    // combinedOne = [...records, ...records, ...records, ...records, ...records, ...records,...records, ...records, ...records, ...records, ...records, ...records, ...records,...records, ...records, ...records, ...records, ...records, ...records, ...records];
    // records = combinedOne;

    headers = Object.keys(records[0]);
    colCount = headers.length;
    rowCount = records.length;
    columnSizes = headers.map(() => 150);
    cellHeight = 32;
    cellWidth = 150;
    fixCellWidth = 16;
    canvas = document.createElement("canvas");
    context = canvas.getContext("2d");
    context.font = '14px Arial Serif';
}

const getTextWidth = (cell) => {
    return context.measureText(cell.innerHTML).width + 16; //For left and right padding
}

const getCell = (row, col) => {
    const p = document.querySelectorAll('.container .rowBlock');
    const elem = p[row];
    return elem.querySelectorAll('.cell,.cellSelected')[col];
}

init();

export {
    //Helper Functions
    isIn2DArray, isInSelectedSquare, getTextWidth, getCell,
    //Variables
    colCount, rowCount, cellHeight, fixCellWidth, cellWidth,
    headers, records, columnSizes, fixRows, fixColumns, twitterData
};