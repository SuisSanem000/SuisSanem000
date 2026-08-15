import React, {memo, useCallback, useRef, useEffect, useState} from "react";
import VirtualGridProvider from "./VirtualGridProvider";
import * as utils from "./../utils/utils";
import "./VirtualGridProvider.scss";

function VirtualTreeViewComponent() {
    const virtualTreeViewRef = useRef();

    const [rows, setRows] = useState([{data: utils.twitterData, name: "ROOT: ", expanded: false, indent: 0}]);

    const [internalRowCount, setInternalRowCount] = useState(1);

    useEffect(() => {
        if (virtualTreeViewRef.current)
            virtualTreeViewRef.current.Update();
    }, [internalRowCount, rows]);

    const handleColWidth = (col) => {
        return utils.columnSizes[col];
    }

    // Change data here for example
    const handleCellDataEdit = (data, row, col) => {
        // utils.records[row][col] = data;
    }

    const handleClick = (e) => {
        if (e.detail === 1) {
            if (virtualTreeViewRef.current) {
                const hasSelection = virtualTreeViewRef.current.getHasSelection();
                if (hasSelection !== true) {
                    const rowIndex = (virtualTreeViewRef.current) ? virtualTreeViewRef.current.calcRowIndex(e) : -1;
                    if (rowIndex !== -1) {
                        let row = rows[rowIndex];
                        rows[rowIndex].expanded = !rows[rowIndex].expanded;
                        //If row is collapsed, remove nodes
                        if (!rows[rowIndex].expanded) {
                            //Remove expanded children as well
                            let indent = rows[rowIndex].indent;
                            let index = rowIndex + 1;
                            for (; index < rows.length; index++)
                                if (rows[index].indent <= indent)
                                    break;
                            rows.splice(rowIndex + 1, index - rowIndex - 1);
                        } else {
                            //If row is expanded, append first level children
                            let nRows = [];
                            if (Array.isArray(row.data)) {
                                for (const d of row.data)
                                    nRows.push({
                                        data: d,
                                        name: `[${nRows.length}] : `,
                                        expanded: false,
                                        indent: row.indent + 1
                                    });
                                rows.splice(rowIndex + 1, 0, ...nRows);
                            } else if (typeof row.data === "object") {
                                for (const key of Object.keys(row.data))
                                    nRows.push({
                                        data: row.data[key],
                                        name: `${key} : `,
                                        expanded: false,
                                        indent: row.indent + 1
                                    });
                                rows.splice(rowIndex + 1, 0, ...nRows);
                            }
                        }
                        if ((Array.isArray(row.data)) || (typeof row.data === "object"))
                            setInternalRowCount(rows.length);
                    }
                }
            }
        }
        //Dbl clicked
        else if (e.detail === 2) {
            if (virtualTreeViewRef.current)
                virtualTreeViewRef.current.handleClick(e);
        }
    }

    const Row = (e) => {
        let node = {};
        let rInfo = rows[e.index];

        const rInfoName = (rInfo.name) ? rInfo.name : 'null name';
        const rInfoData = (rInfo.data) ? rInfo.data : 'null data';
        const rInfoExpanded = (rInfo.expanded) ? rInfo.expanded : false;
        const rInfoIndent = (rInfo.indent) ? rInfo.indent : 0;

        if (Array.isArray(rInfoData))
            node = {name: rInfoName, value: 'Array', isExpanded: rInfoExpanded};
        else if (typeof rInfoData === "object")
            node = {name: rInfoName, value: 'Object', isExpanded: rInfoExpanded};
        else node = {name: rInfoName, value: rInfoData, isExpanded: false};

        let cellClassName = 'cellTree';

        if (e.selectedCells)
            if (utils.isInSelectedSquare(e.selectedCells, [e.index, 0]) === true)
                cellClassName = 'cellTreeSelected';

        const RowCallback = useCallback((e) => {
            return (
                <div className={'rowBlock'}>
                    <div className={cellClassName}
                         style={{paddingLeft: rInfoIndent * 20 + 8}}>
                        {(node.value === 'Object' || node.value === 'Array') ? (node.isExpanded) ?
                            <div className={'cellTreeCheckBox'}><i className="fa-solid fa-circle-minus"/></div> :
                            <div className={'cellTreeCheckBox'}><i className="fa-solid fa-circle-plus"/></div> : <></>}
                        {node.name + ' ' + node.value}
                    </div>
                </div>
            );
        }, [cellClassName]);

        return (<RowCallback e={e}/>); //For having a dependency to trigger callback
    }

    return (
        <VirtualGridProvider
            ref={virtualTreeViewRef}
            // Events:
            Row={Row}
            onColWidth={handleColWidth}
            onCellDataEdit={handleCellDataEdit}
            onClick={(e) => handleClick(e)}
            //Variables:
            headers={['Tree columns']}
            rowCount={internalRowCount}
            cellHeight={utils.cellHeight}
            fixCellWidth={utils.fixCellWidth}
            fixRows={utils.fixRows}
            fixColumns={utils.fixColumns}
            isTree={true}
        />
    );
}

export default memo(VirtualTreeViewComponent);
