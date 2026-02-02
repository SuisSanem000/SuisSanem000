import React, {forwardRef, memo, useEffect, useImperativeHandle, useMemo, useState} from "react";
import useForceReRendering from "./hooks/useForceReRendering";
import useScrollAware from "./hooks/useScrollAware";
import useWindowSize from "./hooks/useWindowSize";
// import "../../styles/VirtualGridProvider.scss";

//props schema:
// Events
//     Row
//     FilterRow
//     SummaryRow
//     onColWidth
//     onHeaderResizeMouseDown
//     onHeaderResizeMouseMove
//     onHeaderResizeMouseUp
//     onHeaderResizeDblClick
//     onCellDataEdit
//     onCellContextMenu
//     onClick
//     onAddRow
//Variables
//     headers
//     rowCount
//     cellHeight
//     fixCellWidth
//     fixRows
//     fixColumns
//     isTree

const VirtualGridProvider = forwardRef((props, ref) => {

    //Custom hooks for stateful logic
    const [w, h] = useWindowSize(); //Resize window alert
    const [scrollTop, refScroll] = useScrollAware(); //Detecting scroll top
    const forceReRendering = useForceReRendering(); // Fake state change for forcing ReRendering

    //States
    const [cellResize, setCellResize] = useState(0); //whether cells has been resized
    const [selectedCells, setSelectedCells] = useState([]);

    const [mouseIsDown, setMouseIsDown] = useState(false);
    const [resizeHandleIsDown, setResizeHandleIsDown] = useState(false);
    const [showFilter, setShowFilter] = useState(false); //false is correct, made it true for debug purposes  - dc
    const [showSummary, setShowSummary] = useState(false); //false is correct, made it true for debug purposes  - dc

    const [anchor, setAnchor] = useState(null); //Start selection cell coordinates
    const [pos, setPos] = useState(null); //End selection cell coordinates

    const [cellEditablePos, setCellEditablePos] = useState(null); //Editable cell coordinates: [rowIndexStatic, colIndex, rowIndex]
    const [cellEditableData, setCellEditableData] = useState(null); //Editable cell data

    // Window virtualization
    const startRow = Math.max(0, Math.floor(scrollTop / props.cellHeight)); //First row index
    const visibleRowCount = Math.min(props.onRowCount() - startRow, Math.ceil(h / props.cellHeight));
    const offsetY = startRow * props.cellHeight; //Vertical transform
    const totalHeight = props.onRowCount() * props.cellHeight; //??
    let lastMousePosition = {clientX: 0, clientY: 0};

    const getLocalX = (x) => {
        return (x + refScroll.current.scrollLeft);
    }

    const getLocalY = (y) => {
        let ly = (y - refScroll.current.getBoundingClientRect().top);
        ly = ((showFilter === true) && (props.FilterRow)) ? ly - props.cellHeight : ly;
        return ly;
    }

    //Helpers
    const getColIndex = (AX) => {
        let colIndex = -2, i = 0, sumColWidth = 0, x;
        x = AX;

        // Return -1 if x is less than the first fix column
        if (x <= props.fixCellWidth)
            return -1;

        sumColWidth += props.onColWidth(i);

        for (i = 0; i < props.headers.length; i++) {
            if (x <= sumColWidth) {
                colIndex = i;
                break;
            }
            sumColWidth += props.onColWidth(i);
        }

        //Limit the col index between [0, colCount]
        colIndex = Math.max(0, colIndex);
        colIndex = Math.min(colIndex, props.headers.length - 1);
        return colIndex;
    }

    const getRowIndex = (AY) => {
        let rowIndex, roundRowIndex, offsetTop;
        const h = props.cellHeight;
        //Calculate the rounded row index
        roundRowIndex = Math.floor(AY / h) - 1;

        //Calculate offset top after scrolling, if any
        if (scrollTop > 0) {
            offsetTop = ((startRow + roundRowIndex) * h) - scrollTop;
            offsetTop = offsetTop % h;
            if (offsetTop < (h / 2)) AY += (h);
        }

        //Calculate final row index
        rowIndex = Math.floor(AY / h) - 1;
        rowIndex = Math.max(0, startRow + rowIndex);

        //Limit the row index between [0, rowCount]
        rowIndex = Math.min(Math.max(0, rowIndex), props.onRowCount() - 1);

        if ((props.fixRows.length > 1) && (scrollTop > 0))
            if (rowIndex > props.fixRows.length - 1)
                rowIndex = rowIndex - (props.fixRows.length - 1);

        return rowIndex;
    }

    const getRowIndexStatic = (AY) => {
        let rowIndex;
        //Calculate final row index
        rowIndex = Math.floor(AY / props.cellHeight) - 1;
        rowIndex = Math.max(0, rowIndex);
        //Limit the row index between [0, rowCount]
        rowIndex = Math.min(Math.max(0, rowIndex), props.onRowCount() - 1);
        return rowIndex;
    }

    const getCellCoordinates = (e) => {
        return [getRowIndex(getLocalY(e.clientY)), getColIndex(getLocalX(e.clientX))];
    }

    const selectRegion = (startPos, endPos) => {
        if ((!startPos) || (!endPos)) return;
        setSelectedCells([startPos, endPos]);
    }

    //Apply changes to the editable cell, if cellData = null do not change data, if it is submitting changes
    const applyEditableCell = (cellData = null) => {
        let p, elem, c;
        p = refScroll.current.querySelectorAll('.container .rowBlock');
        if (!p) return;
        elem = p[cellEditablePos[0]];
        if (!elem) return;
        c = elem.querySelectorAll('.cell,.cellSelected,.cellTree,.cellTreeSelected')[((props.isTree === true) ? 0 : cellEditablePos[1] + 1)];
        if (!c) return;
        c.contentEditable = "false";
        //Set text to its original value in case esc pressed or not
        if (cellData !== null)
            c.innerHTML = cellData;

        c.blur(); //Unfocus
        refScroll.current.focus();

        setCellEditablePos(null);

        // call event of data change from outside component
        if (cellData === null)  //Means that the editable data has been submitted
            if (props.onCellDataEdit)
                props.onCellDataEdit(c.innerHTML, cellEditablePos[2], cellEditablePos[1]);
    }

    //Restrict position
    const updateSelection = (arr) => {
        let mi0 = Math.min(Math.max(arr[0], 0), props.onRowCount() - 1); //Row index
        let mi1 = Math.min(Math.max(arr[1], 0), props.headers.length - 1); //Col index
        setPos([mi0, mi1]);
    }

    //Walk through cells by selection
    const updateWalkCell = (arr) => {
        let mi0 = Math.min(Math.max(arr[0], 0), props.onRowCount() - 1); //Row index
        let mi1 = Math.min(Math.max(arr[1], 0), props.headers.length - 1); //Col index
        setAnchor([mi0, mi1]);
        setPos([mi0, mi1]);
        //Apply editable cell
        if (cellEditablePos !== null)
            applyEditableCell();
    }

    //Use stayFocused to skip selecting all the cell text for click on scrollbars
    const manageEditableCell = (e, ro = null, co = null, roStatic = null, stayFocused = false) => {
        if (props.isTree === true)
            return;

        let p, elem, c, range, rowIndex, rowIndexStatic, colIndex;
        rowIndexStatic = getRowIndexStatic(getLocalY(e.clientY));
        colIndex = getColIndex(getLocalX(e.clientX));
        rowIndex = getRowIndex(getLocalY(e.clientY));

        //These are for keydown editable management
        rowIndex = (ro !== null) ? ro : rowIndex;
        colIndex = (co !== null) ? co : colIndex;
        rowIndexStatic = (roStatic !== null) ? roStatic : rowIndexStatic;

        //Do not edit if in fixColumns or fixRows
        if ((colIndex < props.fixColumns.length - 1) || ((rowIndex - startRow) < props.fixRows.length - 1))
            return;

        // Selection
        const sel = window.getSelection();

        p = refScroll.current.querySelectorAll('.container .rowBlock');
        elem = p[rowIndexStatic];
        if (!elem) return;

        c = elem.querySelectorAll('.cell,.cellSelected,.cellTree,.cellTreeSelected')[(props.isTree === true ? colIndex : colIndex + 1)];
        if (!c) return;

        if ((cellEditablePos !== null) && (stayFocused)) {
            c.focus();
            return;
        }

        setCellEditablePos([rowIndexStatic, colIndex, rowIndex]);
        c.contentEditable = "true";
        setCellEditableData(c.innerHTML);

        //Select all the cell text because dbl clicked on an editable cell
        if (cellEditablePos !== null) {
            if (window.getSelection && refScroll.current.createRange) {
                range = refScroll.current.createRange();
                range.selectNodeContents(c);
                sel.removeAllRanges();
                sel.addRange(range);
            }

        }
        //Move caret to the end of text
        else {
            sel.collapse(c.firstChild, c.innerHTML.length);
            c.focus();
        }

    }

    const doScroll = (e, AX = -1, AY = -1, AW = -1, AH = -1) => {

        lastMousePosition.clientX = (AX !== -1) ? AX : e.clientX;
        lastMousePosition.clientY = (AY !== -1) ? AY : e.clientY;

        let x = lastMousePosition.clientX - refScroll.current.offsetLeft;
        let y = lastMousePosition.clientY - refScroll.current.offsetTop;
        let moveX = 0, moveY = 0;

        x = (AW !== -1) ? (x + AW) : x;
        y = (AH !== -1) ? (y + AH) : y;

        if (x < 0)
            moveX = x;
        else if (x > refScroll.current.offsetWidth)
            moveX = x - refScroll.current.offsetWidth;

        if (y < 0)
            moveY = y;
        else if (y > refScroll.current.offsetHeight)
            moveY = y - refScroll.current.offsetHeight;

        if (moveX !== 0 || moveY !== 0) {
            refScroll.current.scrollBy(moveX, moveY);
        }
    }

    // Select col
    const handleHeaderClick = (e) => {
        let colIndex = getColIndex(getLocalX(e.clientX));
        setAnchor([0, colIndex]);
        setPos([props.onRowCount() - 1, colIndex]);
    }

    const handleContextMenu = (e) => {
        const colIndex = getColIndex(getLocalX(e.clientX));
        const rowIndex = getRowIndex(getLocalY(e.clientY));
        if (props.onCellContextMenu)
            props.onCellContextMenu(rowIndex, colIndex);
        e.preventDefault();
        e.stopPropagation();
    }

    const handleInternalClick = (e) => {
        if ((showFilter === true) && (props.FilterRow))
            if ((e.clientY - refScroll.current.getBoundingClientRect().top) < (props.cellHeight * 2))
                return;

        // Calculate position within bounds of element
        const rowIndexStatic = getRowIndexStatic(getLocalY(e.clientY));
        const colIndex = getColIndex(getLocalX(e.clientX));
        const rowIndex = getRowIndex(getLocalY(e.clientY));

        //Pass events
        let ly = (e.clientY - refScroll.current.getBoundingClientRect().top);
        if (ly < props.cellHeight) {
            let lx = (e.clientX - refScroll.current.getBoundingClientRect().left);
            if (lx < props.fixCellWidth) {
                e.stopPropagation();
                e.preventDefault();
                handleClickFixFirstColumn(e);
                return;
            }
            handleHeaderClick(e);
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        //Skip for mouse down on scrollbars
        if (refScroll.current)
            if (((refScroll.current.offsetLeft + refScroll.current.clientWidth) < e.clientX)
                || ((refScroll.current.offsetTop + refScroll.current.clientHeight) < e.clientY))
                return;

        //Skip dbl clicked-editable cell, submit the previously edited cell data
        if ((cellEditablePos !== null) && //if there is an editable cell
            (e.detail !== 2) && //if is not dbl click
            ((cellEditablePos[0] !== rowIndexStatic) || (cellEditablePos[1] !== colIndex))) {//if is another cell than the editing one
            applyEditableCell();
        }

        //If dbl clicked on the cell
        if (e.detail === 2) {
            manageEditableCell(e);
            return;
        }

        if ((selectedCells.length !== 0) && (!(e.shiftKey)))
            return;

        //Select cell by left click
        if ((e.detail === 1) && (rowIndex !== -1) && (colIndex !== -1)) {
            setAnchor([rowIndex, colIndex]);
            setPos([rowIndex, colIndex]);
        }
        //Select the entire row if the selected cell is the first fix default one or if ctrl + click
        else if ((colIndex === -1) || (e.ctrlKey)) {
            setAnchor([rowIndex, 0]);
            setPos([rowIndex, props.headers.length - 1]);
        }
        //Shift + Click + > extends selection square
        else if (e.shiftKey)
            setPos([rowIndex, colIndex]);
    }

    // Select all cells when click on top left corner
    const handleClickFixFirstColumn = (e) => {
        e.stopPropagation();
        setAnchor([0, 0]);
        setPos([props.onRowCount() - 1, props.headers.length - 1]);
    }

    //Start selection
    const handleMouseDown = (e) => {
        //Exit if mouse is down on filter row
        if ((showFilter === true) && (props.FilterRow))
            if ((e.clientY - refScroll.current.getBoundingClientRect().top) < (props.cellHeight * 2))
                return;

        if (cellEditablePos !== null) {
            manageEditableCell(e, cellEditablePos[0], cellEditablePos[1], cellEditablePos[2], true);
            return;
        }

        //Only work in left mouse button, and not in the editing mode,because in editing mode mouse down can change caret pos ...
        if (e.button === 0) {
            if ((e.shiftKey) || (resizeHandleIsDown))
                return;

            lastMousePosition.clientX = e.clientX;
            lastMousePosition.clientY = e.clientY;
            refScroll.current.setPointerCapture(e.pointerId); //For scroll out of component

            //Skip for mouse down on scrollbars
            if (refScroll.current)
                if (((refScroll.current.offsetLeft + refScroll.current.clientWidth) < e.clientX)
                    || ((refScroll.current.offsetTop + refScroll.current.clientHeight) < e.clientY))
                    return;

            e.stopPropagation();
            // e.preventDefault(); //??

            setSelectedCells([]);
            setMouseIsDown(true);

            setAnchor(getCellCoordinates(e)); //Selected cell coordinates
        }
    }

    //Extend selection
    const handleMouseMove = (e) => {
        //Exit if mouse is on filter row
        if ((showFilter === true) && (props.FilterRow))
            if ((e.clientY - refScroll.current.getBoundingClientRect().top) < (props.cellHeight * 2))
                return;
        if ((mouseIsDown === false) || (cellEditablePos !== null))
            return;
        doScroll(e);
        e.stopPropagation();
        e.preventDefault();
        setPos(getCellCoordinates(e)); //Selected cell coordinates
    }

    //End selection in case no editing cell is active
    const handleMouseUp = (e) => {
        //Exit if mouse is up on filter row
        if ((showFilter === true) && (props.FilterRow))
            if ((e.clientY - refScroll.current.getBoundingClientRect().top) < (props.cellHeight * 2))
                return;
        if (e.button === 0) {
            lastMousePosition.clientX = e.clientX;
            lastMousePosition.clientY = e.clientY;
            refScroll.current.releasePointerCapture(e.pointerId);
            if (cellEditablePos !== null)
                return;
            e.stopPropagation();
            e.preventDefault();
            setMouseIsDown(false);
        }
    }

    const handleKeyDown = (e) => {

        //Add a new row to the grid
        if (e.code === "Enter" || e.code === "Tab") {
            if (e.shiftKey) {
                if (props.onAddRow)
                    props.onAddRow(e);
                return;
            }
        }

        //Delete a row from the grid
        if (e.code === "Delete") {
            if (props.onDelete)
                props.onDelete(e);
            return;
        }


        //Exit if filter row
        if ((showFilter === true) && (props.FilterRow))
            if ((e.clientY - refScroll.current.getBoundingClientRect().top) < (props.cellHeight * 2))
                return;

        //Press ctrl + alt + f to show/hide filter row, Press ctrl + alt + s to show/hide summary row
        if ((e.ctrlKey) && (e.altKey)) {
            if (props.FilterRow || props.SummaryRow) {
                switch (e.code) {
                    case "KeyF":
                        if (props.FilterRow)
                            setShowFilter(!showFilter);
                        break;
                    case "KeyS":
                        if (props.SummaryRow)
                            setShowSummary(!showSummary);
                        break;
                    default:
                        break;
                }
            }
            return;
        }

        //Skip dbl clicked and editable cell
        if ((e.code === "Escape") && (cellEditablePos !== null)) {
            applyEditableCell(cellEditableData);
            updateWalkCell([cellEditablePos[2], cellEditablePos[1]]);
            return;
        }

        //Submit edited cell
        if ((e.code === "Enter") && (cellEditablePos !== null)) {
            applyEditableCell();
            updateWalkCell([cellEditablePos[2], cellEditablePos[1]]);
            return;
        }

        //Exist if in corner cells
        if ((['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.code)) &&
            ((selectedCells.length !== 0) || (cellEditablePos !== null))) {
            switch (e.code) {
                case "ArrowDown":
                    if (pos[0] === props.onRowCount() - 1)
                        return;
                    break;
                case "ArrowUp":
                    if (pos[0] === 0)
                        return;
                    break;
                case "ArrowLeft":
                    if (pos[1] === 0)
                        return;
                    break;
                case "ArrowRight":
                    if (pos[1] === props.headers.length - 1)
                        return;
                    break;
                default:
                    break;
            }
        }

        //Expand selection if shift is in states
        if (e.shiftKey) {
            switch (e.code) {
                case "ArrowDown":
                    updateSelection([pos[0] + 1, pos[1]]);
                    break;
                case "ArrowUp":
                    updateSelection([pos[0] - 1, pos[1]]);
                    break;
                case "ArrowLeft":
                    updateSelection([pos[0], pos[1] - 1]);
                    break;
                case "ArrowRight":
                    updateSelection([pos[0], pos[1] + 1]);
                    break;
                default:
                    break;
            }
        } else {
            //Walk through cells in left and right direction if no selected cell exist but an editable cell is active
            if (cellEditablePos !== null) {
                setSelectedCells([]);
                switch (e.code) {
                    case "ArrowDown":
                        updateWalkCell([cellEditablePos[2] + 1, cellEditablePos[1]]);
                        break;
                    case "ArrowUp":
                        updateWalkCell([cellEditablePos[2] - 1, cellEditablePos[1]]);
                        break;
                    default:
                        break;
                }
            } else if (selectedCells.length !== 0) {

                //Walk through cells in all directions if selected cell exist but no editable cell is active
                switch (e.code) {
                    case "ArrowDown":
                        updateWalkCell([pos[0] + 1, pos[1]]);
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    case "ArrowUp":
                        updateWalkCell([pos[0] - 1, pos[1]]);
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    case "ArrowLeft":
                        updateWalkCell([pos[0], pos[1] - 1]);
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    case "ArrowRight":
                        updateWalkCell([pos[0], pos[1] + 1]);
                        e.preventDefault();
                        e.stopPropagation();
                        break;
                    default:
                        break;
                }

                //Do scroll
                if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
                    const elem = refScroll.current.querySelectorAll('.container .rowBlock')[pos[0] - startRow];
                    if (!elem) return;
                    const c = elem.querySelectorAll('.cell,.cellSelected,.cellTree,.cellTreeSelected')[((props.isTree === true) ? 0 : pos[1] + 1)];
                    if (!c) return;
                    const bounding = c.getBoundingClientRect();
                    let w = -1, h = -1;
                    switch (e.code) {
                        case "ArrowDown":
                            h = props.cellHeight * 2;
                            break;
                        case "ArrowUp":
                            h = -props.cellHeight * 2;
                            break;
                        case "ArrowLeft":
                            w = -bounding.width;
                            break;
                        case "ArrowRight":
                            w = bounding.width * 2;
                            break;
                        default:
                            break;
                    }
                    doScroll(e, bounding.left, bounding.top, w, h);
                }
            }

            if ((selectedCells.length !== 0) || (cellEditablePos !== null)) {
                //Type: select cell + keydown chars should start editing content
                if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
                    let roStatic;
                    roStatic = Math.max(0, anchor[0]);
                    roStatic = Math.min(Math.max(0, roStatic), props.onRowCount() - 1);
                    roStatic = (cellEditablePos !== null) ? cellEditablePos[2] : roStatic;
                    const p = (selectedCells.length !== 0) ? pos : cellEditablePos;
                    manageEditableCell(e, p[0], p[1], roStatic, true);
                }
            }
        }
    }

    const handlePointerDown = (e, col) => {
        e.stopPropagation();
        e.preventDefault();
        setResizeHandleIsDown(true);
        if (props.onHeaderResizeMouseDown)
            props.onHeaderResizeMouseDown(e, col);
    }

    const handlePointerMove = (e, col) => {
        e.stopPropagation();
        e.preventDefault();
        if (props.onHeaderResizeMouseMove)
            props.onHeaderResizeMouseMove(e, col);
    }

    const handlePointerUp = (e, col) => {
        e.stopPropagation();
        e.preventDefault();
        setResizeHandleIsDown(false);
        if (props.onHeaderResizeMouseUp)
            props.onHeaderResizeMouseUp(e, col);
    }

    const handlePointerClick = (e, col) => {
        e.stopPropagation();
        e.preventDefault();
        if (props.onHeaderResizeDblClick)
            props.onHeaderResizeDblClick(e, col + 1, startRow, visibleRowCount);
    }

    //focus for getting key events
    useEffect(() => {
        if (refScroll.current) {
            refScroll.current.focus();
        }
    }, [refScroll]);

    //update selection based in anchor or pos change
    useEffect(() => {
        if ((!anchor) || (!pos))
            return;
        selectRegion(anchor, pos);
    }, [pos]);

    //Expose functions to outside
    useImperativeHandle(ref, () => ({

        //update based on cellResize state
        updateResize() {
            setCellResize(cellResize => cellResize + 1);//Rerender in case of resize
        },

        //update rendering from outside the component
        update() {
            forceReRendering();
        },

        updateAfterAddRow(offset) {
            if (pos) {
                let mi0 = Math.min(Math.max(pos[0] + offset, 0), props.onRowCount() - 1); //Row index
                let mi1 = Math.min(Math.max(pos[1], 0), props.headers.length - 1); //Col index
                setAnchor([mi0, mi1]);
                setPos([mi0, mi1]);
            }
        },

        deselectAll() {
            setAnchor([]);
            setPos([]);
        },

        focusTree() {
            refScroll.current.focus();
        },

        // Extend selection or select row or
        handleClick(e) {
            handleInternalClick(e);
        },

        calcRowIndex(e) {
            return getRowIndex(getLocalY(e.clientY));
        },

        getHasSelection() {
            return selectedCells.length > 0;
        }
    }));

    const normalVisibleRows = useMemo(() => {
        let i, normalRows = [];
        for (i = 0; i < visibleRowCount; i++) {
            // If is not in fixRows, add them to normal rows
            if (!(props.fixRows.includes(i + startRow))) {
                normalRows.push(<props.Row
                    key={i + startRow}
                    index={i + startRow}
                    cellResize={cellResize}
                    selectedCells={selectedCells}
                />);
            }
        }
        return normalRows;
    }, [props.onRowCount(), startRow, visibleRowCount, cellResize, selectedCells, w, h, showSummary, showFilter, scrollTop]);

    const fixVisibleRows = useMemo(() => {
        let i, fixedRows = [];
        //Add fixed rows: zero is for the reserved fixed row(header)
        for (i = 1; i < props.fixRows.length; i++)
            fixedRows.push(
                <props.Row
                    key={props.fixRows[i]}
                    index={props.fixRows[i]}
                    cellResize={cellResize}
                    selectedCells={selectedCells}
                />);
        return fixedRows;
    }, [props.onRowCount(), startRow, visibleRowCount, cellResize, selectedCells, w, h, showSummary, showFilter, scrollTop]);

    const fixFilterRow = useMemo(() => {
        return (((showFilter === true) && (props.FilterRow))) ?
            <div className={"filterRowBlock"}>
                <div className="normalCellContainer">
                    {/*(0,0) fix column in top left corner */}
                    <div
                        className={"headerCell body-600"}
                        // style={{width: props.fixCellWidth}}
                        onClick={(e) => handleClickFixFirstColumn(e)}
                    />

                    {props.headers.map((hc, col) => (
                        // style={{width: props.onColWidth(col)}}
                        <div className={"headerCell body-600"}>
                            <props.FilterRow
                                key={col}
                                index={col}
                            />
                            <div className={"resizeHandle"}
                                 onPointerDown={(e) => handlePointerDown(e, col)}
                                 onPointerMove={(e) => handlePointerMove(e, col)}
                                 onPointerUp={(e) => handlePointerUp(e, col)}
                                 onClick={(e) => handlePointerClick(e, col)}>
                                &nbsp;
                            </div>
                        </div>
                    ))}
                </div>
            </div> :
            <></>;
    }, [showFilter, cellResize]);

    const fixSummaryRow = useMemo(() => {
        return ((((showSummary === true) && (props.SummaryRow))) ?
            <>
                <div className="normalCellContainer">
                    {/*(0,0) fix column in top left corner */}
                    <div
                        className={"headerCell body-600"}
                        // style={{width: props.fixCellWidth}}
                        onClick={(e) => handleClickFixFirstColumn(e)}
                    />

                    {props.headers.map((hc, col) => (
                        // style={{width: props.onColWidth(col)}}
                        <div className={"headerCell"}>
                            <props.SummaryRow
                                key={col}
                                index={col}
                            />
                            <div className={"resizeHandle"}
                                 onPointerDown={(e) => handlePointerDown(e, col)}
                                 onPointerMove={(e) => handlePointerMove(e, col)}
                                 onPointerUp={(e) => handlePointerUp(e, col)}
                                 onClick={(e) => handlePointerClick(e, col)}>&nbsp;</div>
                        </div>
                    ))}
                </div>
            </> : <></>);
    }, [showSummary, cellResize]);

    // style={{width: w, height: h}}

    return (<div
        tabIndex={0} className={"container"} ref={refScroll}
        //events
        onClick={(e) => props.onClick && (props.onClick(e))}
        onPointerDown={(e) => handleMouseDown(e)}
        onPointerMove={(e) => handleMouseMove(e)}
        onPointerUp={(e) => handleMouseUp(e)}
        onKeyDown={(e) => handleKeyDown(e)}
        onContextMenu={(e) => handleContextMenu(e)}
    >

        {/*Fixed rows: header, including header block, filter row and fixed rows*/}
        <div className="stickyRowsContainer"
             onContextMenu={(e) => {
                 e.stopPropagation();
                 e.preventDefault();
             }}
        >
            <div className="stickyRowContainer">

                {/*Header block*/}
                <div className={"headerBlock"} onClick={(e) => handleHeaderClick(e)}>

                    {/*stickyCellContainer for fix columns*/}
                    <div className="stickyCellContainer">
                        {/*Headers */}
                        {
                            (props.headers.length === 1) ?
                                // Tree
                                // style={{paddingLeft: 8}}
                                <div className={"headerCellSingle"}>{props.headers[0]}</div>
                                :
                                <>
                                    {/*/!*(0,0) fix column in top left corner *!/*/}
                                    {/*<div className={"headerCell"}*/}
                                    {/*     style={{width: props.fixCellWidth}}*/}
                                    {/*     onClick={(e) => handleClickFixFirstColumn(e)}/>*/}

                                    {props.headers.map((hc, col) => (
                                        (col < props.fixColumns.length - 1) ?
                                            <>
                                                {/*style={{width: props.onColWidth(col)}}*/}
                                                <div className={"headerCell body-600"}>
                                                    {hc}
                                                    <div className={"resizeHandle"}
                                                         onPointerDown={(e) => handlePointerDown(e, col)}
                                                         onPointerMove={(e) => handlePointerMove(e, col)}
                                                         onPointerUp={(e) => handlePointerUp(e, col)}
                                                         onClick={(e) => handlePointerClick(e, col)}>&nbsp;</div>
                                                </div>
                                            </> :
                                            <></>))}</>}
                    </div>

                    {/*normalCellContainer*/}
                    <div className="normalCellContainer">

                        {/*Tree*/}
                        {(props.headers.length === 1) ? <></> :
                            props.headers.map((hc, col) => ((col >= (props.fixColumns.length - 1)) ? <>
                                {/*style={{width: props.onColWidth(col)}}*/}
                                <div className={"headerCell body-600"}>
                                    {hc}
                                    <div className={"resizeHandle"}
                                         onPointerDown={(e) => handlePointerDown(e, col)}
                                         onPointerMove={(e) => handlePointerMove(e, col)}
                                         onPointerUp={(e) => handlePointerUp(e, col)}
                                         onClick={(e) => handlePointerClick(e, col)}>&nbsp;</div>
                                </div>
                            </> : <></>))}
                    </div>
                </div>

                {/*Filter row*/}
                {(props.FilterRow ? <>{fixFilterRow}</> : <></>)}

                {/*Fix rows */}
                {fixVisibleRows}

            </div>
        </div>

        {/*Normal rows: content */}
        {/*, height: totalHeight*/}
        <div className="rowsContainer" style={{willChange: "transform"}}>
            <div style={{willChange: "transform", transform: `translateY(${offsetY}px)`}}>
                <div className="normalRowContainer">{normalVisibleRows}</div>
            </div>
        </div>

        {(props.SummaryRow ?
            // Fixed rows: including summary row
            <>
                <div className="stickyRowsContainerFooter"
                     onContextMenu={(e) => {
                         e.stopPropagation();
                         e.preventDefault();
                     }}
                >
                    <>{fixSummaryRow}</>
                </div>
            </> : <></>)}
    </div>);
});

// memoize functional component
export default memo(VirtualGridProvider);
