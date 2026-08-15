import React, {memo, useCallback, useRef, useEffect, useState} from "react";
import VirtualGridProvider from "./VirtualGridProvider";
import * as utils from "./../utils/utils";
import "./VirtualGridProvider.scss";

function VirtualGridComponent() {

    let resizeMouseIsDown = false, resizeMouseLocation = {left: 0, top: 0}, resizeLastColumnSize = 0;
    const virtualGridRef = useRef();
    const [recordsData, setRecordsData] = useState(utils.records); //Used in filtering

    useEffect(() => {
        if (virtualGridRef.current)
            virtualGridRef.current.Update();
    }, [recordsData]);

    const handleColWidth = (col) => {
        return utils.columnSizes[col];
    }

    const handleHeaderResizeMouseDown = (e, col) => {
        if (e.button === 0) {
            e.target.setPointerCapture(e.pointerId);
            resizeMouseLocation.left = e.clientX;
            resizeMouseLocation.top = e.clientY;
            resizeMouseIsDown = true;
            resizeLastColumnSize = utils.columnSizes[col];
        }
    }

    const handleHeaderResizeMouseMove = (e, col) => {
        if (resizeMouseIsDown) {
            utils.columnSizes[col] = Math.max(resizeLastColumnSize + (e.clientX - resizeMouseLocation.left), 10);
            if (virtualGridRef.current)
                virtualGridRef.current.UpdateResize();
        }
    }

    const handleHeaderResizeMouseUp = (e, col) => {
        if (e.button === 0) {
            e.target.releasePointerCapture(e.pointerId);
            resizeMouseIsDown = false;
            utils.columnSizes[col] = Math.max(resizeLastColumnSize + (e.clientX - resizeMouseLocation.left), 10);
            if (virtualGridRef.current)
                virtualGridRef.current.UpdateResize();
        }
    }

    //Set column size to the biggest column withing window range
    const handleHeaderResizeDblClick = (e, col, startRow, visibleRowCount) => {
        let c, w = 0, tw = 0;
        //Left button and dbl clicked
        if ((e.button === 0) && (e.detail === 2)) {
            resizeMouseIsDown = false;
            for (let i = 0; i < visibleRowCount; i++) {
                c = utils.getCell(i, col);
                tw = utils.getTextWidth(c);
                w = (tw > w) ? tw : w;
            }
            utils.columnSizes[col - 1] = w + 8;
            if (virtualGridRef.current)
                virtualGridRef.current.UpdateResize();
        }
    }

    // Change data here for example
    const handleCellDataEdit = (data, row, col) => {
        // utils.records[row][col] = data;
    }

    const handleCellContextMenu = (row, col) => {
        const v = recordsData[row][utils.headers[col]];
        const m = '[' + row + ', ' + col + ']: ' + v;
        alert(m);
    }

    const handleClick = (e) => {
        if (virtualGridRef.current)
            virtualGridRef.current.handleClick(e);
    }

    const Cell = (e) => {
        const CellCallback = useCallback((e) => {
            let cellClassName = 'cell';
            if ((e.e.isSelected) && (e.e.index !== -1))
                cellClassName = 'cellSelected';
            let value = (e.e.value) ? e.e.value : 'NULL';
            value = (e.e.index === -1) ? '' : (value);
            return (<div key={e.e.index} className={cellClassName} style={{width: e.e.cellWidth}}>
                {/*Test adding a component as a cell*/}
                {e.e.index === 14 ? <input type={"checkbox"} defaultChecked={e.e.value === 1}/> : value}
            </div>);
        }, []);

        return (<CellCallback e={e}/>);
    }

    const Row = (e) => {

        //Return memorized version of the callback based on input
        const RowCallback = useCallback((e) => {
            let normalColumns = [], fixColumns = [], i;

            //First static fix column as a placeholder
            fixColumns.push(<Cell index={-1} cellWidth={utils.fixCellWidth} isSelected={false} e={e}/>);

            if (utils.fixColumns.length > 1) {
                for (i = 1; i < utils.fixColumns.length; i++)
                    fixColumns.push(<Cell
                        index={i - 1}
                        cellWidth={handleColWidth(i - 1)}
                        value={recordsData[e.e.index][utils.headers[i - 1]]}
                        isSelected={utils.isInSelectedSquare(e.e.selectedCells, [e.e.index, i - 1])}
                        e={e}
                    />);
            }

            for (i = utils.fixColumns.length - 1; i < utils.headers.length; i++)
                normalColumns.push(<Cell
                    index={i}
                    cellWidth={handleColWidth(i)}
                    value={recordsData[e.e.index][utils.headers[i]]}
                    isSelected={utils.isInSelectedSquare(e.e.selectedCells, [e.e.index, i])}
                    e={e}
                />);

            return (<div key={e.e.index} className={"rowBlock"}>
                <div style={{background: e.e.index % 2 === 0 ? "#f8f8f8" : "#ffffff"}} className="stickyCellContainer"
                     onContextMenu={(e) => {
                         e.stopPropagation();
                         e.preventDefault();
                     }}
                >
                    {fixColumns}
                </div>
                <div style={{background: e.e.index % 2 === 0 ? "#f8f8f8" : "#ffffff"}} className="normalCellContainer">
                    {normalColumns}
                </div>
            </div>);
        }, [e.cellResize]);
        return (<RowCallback e={e}/>); //For having a dependency to trigger callback
    }

    const FilterRow = (e) => {

        const [searchPhrase, setSearchPhrase] = useState('Load');

        useEffect(() => {
            let newRecords = recordsData.filter((item) => {
                return ((searchPhrase === 'null') ? item.TaskKind === null : item.TaskKind === searchPhrase);
            });
            setRecordsData(newRecords);
        }, [searchPhrase]);

        const FilterRowCallback = useCallback((e) => {

            const testInputChange = (e) => {
                setSearchPhrase(e.target.value);
            }

            return (
                <div key={e.e.index} className={"headerCell"} style={{width: handleColWidth(e.e.index)}}>

                    {/* Adding a component as a cell for test*/}
                    {e.e.index === 15 ?

                        <select style={{marginTop: 4}}
                                name="tasks" id="tasks" onChange={(e) => testInputChange(e)}>
                            <option value="Load">Load</option>
                            <option value="Active">Active</option>
                            <option value="null">null</option>
                        </select>

                        : 'Filter [' + e.e.index + ']'}

                </div>);
        }, []);

        return (<FilterRowCallback e={e}/>);

    }

    const SummaryRow = (e) => {

        const SummaryRowCallback = useCallback((e) => {
            return (
                <div key={e.e.index} className={'headerCell'} style={{width: handleColWidth(e.e.index)}}>
                    {'Summary [' + e.e.index + ']'}
                </div>);
        }, []);

        return (<SummaryRowCallback e={e}/>);
    }

    return (<VirtualGridProvider
        ref={virtualGridRef}
        // Events
        Row={Row}
        FilterRow={FilterRow}
        SummaryRow={SummaryRow}
        onColWidth={handleColWidth}
        onHeaderResizeMouseDown={handleHeaderResizeMouseDown}
        onHeaderResizeMouseMove={handleHeaderResizeMouseMove}
        onHeaderResizeMouseUp={handleHeaderResizeMouseUp}
        onHeaderResizeDblClick={handleHeaderResizeDblClick}
        onCellDataEdit={handleCellDataEdit}
        onCellContextMenu={handleCellContextMenu}
        onClick={handleClick}
        //Variables
        headers={utils.headers}
        rowCount={recordsData.length}
        cellHeight={utils.cellHeight}
        fixCellWidth={utils.fixCellWidth}
        fixRows={utils.fixRows}
        fixColumns={utils.fixColumns}
        isTree={false}
    />);
}

export default memo(VirtualGridComponent);
