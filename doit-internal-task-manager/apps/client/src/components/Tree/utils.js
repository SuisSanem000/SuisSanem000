let records, headers, colCount, rowCount, columnSizes, cellHeight, fixCellWidth, cellWidth,
    //The -1 is for first reserved column and row
    fixRows = [-1], fixColumns = [-1];

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
    records = ['Create custom hook or use reducer for form validation',
        'Fix images variables name',
        'Add clsx to all components',
        'Find a way to parse the PO file|string in SSG way',
        'Add MDX support (find a better way)',
    ];

    columnSizes = [800, 100, 100]
    rowCount = records.length;
    cellHeight = 25;
    cellWidth = 150;
    fixCellWidth = 16;
}

init();

export {
    //Helper Functions
    isIn2DArray, isInSelectedSquare, columnSizes,
    //Variables
    colCount, rowCount, cellHeight, fixCellWidth, cellWidth,
    headers, records, fixRows, fixColumns
};