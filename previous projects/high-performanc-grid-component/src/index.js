import React from 'react';
import ReactDOM from 'react-dom';
import VirtualGridComponent from "./components/VirtualGridComponent";
import VirtualTreeViewComponent from "./components/VirtualTreeViewComponent";
import VirtualTreeViewMultiColumnComponent from "./components/VirtualTreeViewMultiColumnComponent";
import VirtualGridComponentDraggable from "./components/VirtualGridComponentDraggable";

ReactDOM.render(
    <React.StrictMode>
        {/*<VirtualGridComponent/>*/}
        {/*<VirtualTreeViewComponent/>*/}
        {/*<VirtualTreeViewMultiColumnComponent/>*/}
        <VirtualGridComponentDraggable/>
    </React.StrictMode>
    , document.getElementById('root')
);
