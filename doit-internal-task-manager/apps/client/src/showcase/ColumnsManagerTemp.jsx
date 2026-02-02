import ColumnsManager from "../components/ColumnsManager.jsx";
import {useRef, useState} from "react";
import Draggable from "../components/Draggable.jsx";
import Template from "sparrow/src/components/Template.jsx";

export default ColumnsManagerTemp

function ColumnsManagerTemp() {
    const parentRef = useRef(null);
    const [columnsManager, setColumnsManager] = useState([
        {id: 'tit', value: 'Title', isFilterDisabled: true, isSortDisabled: true, isVisible: true, position: 0},
        {id: 'sta', value: 'Status', isFilterDisabled: false, isSortDisabled: true, isVisible: true, position: 1},
        {id: 'due', value: 'Due Date', isFilterDisabled: true, isSortDisabled: false, isVisible: true, position: 2},
        {id: 'pro', value: 'Project', isFilterDisabled: false, isSortDisabled: true, isVisible: true, position: 3},
        {id: 'ass', value: 'Assignee', isFilterDisabled: true, isSortDisabled: true, isVisible: true, position: 4},
        {id: 'est', value: 'Estimation', isFilterDisabled: true, isSortDisabled: true, isVisible: false, position: 5},
        {id: 'lab', value: 'Label', isFilterDisabled: true, isSortDisabled: true, isVisible: false, position: 6},
        {id: 'dis', value: 'Discipline', isFilterDisabled: true, isSortDisabled: true, isVisible: false, position: 7},
        {id: 'des', value: 'Description', isFilterDisabled: true, isSortDisabled: true, isVisible: false, position: 8},
        {id: 'dat', value: 'Status date', isFilterDisabled: true, isSortDisabled: true, isVisible: false, position: 9},
        {id: 'cre', value: 'Created date', isFilterDisabled: true, isSortDisabled: true, isVisible: false, position: 10},
        {id: 'upd', value: 'Update date', isFilterDisabled: true, isSortDisabled: false, isVisible: false, position: 11},
        {id: 'cby', value: 'Created by', isFilterDisabled: true, isSortDisabled: true, isVisible: false, position: 12},
        {id: 'uby', value: 'Updated by', isFilterDisabled: true, isSortDisabled: true, isVisible: false, position: 13},
        {id: 'per', value: 'Permission', isFilterDisabled: true, isSortDisabled: true, isVisible: false, position: 14},
        {id: 'acc', value: 'Accept', isFilterDisabled: true, isSortDisabled: true, isVisible: false, position: 15},
    ])

    const [currentDragItem, setCurrentDragItem] = useState(null);
    const [currentDragItemIndex, setCurrentDragItemIndex] = useState(0);
    const [currentDragItemRealIndex, setCurrentDragItemRealIndex] = useState(0);

    const handleFilterClick = () => {
        console.log('Filter click')
    }
    const handleSortClick = () => {
        console.log('Sort click')
    }
    const handleVisibilityClick = (isVisible, item) => {
        let newColumnsManager = [...columnsManager];
        const index = newColumnsManager.indexOf(item);
        newColumnsManager[index].isVisible = isVisible;
        setColumnsManager(newColumnsManager);
    }

    const handleDragStart = (event, item) => {
        setCurrentDragItem(item);
        setCurrentDragItemIndex(columnsManager.indexOf(item) + 1);
        setCurrentDragItemRealIndex(columnsManager.indexOf(item));
    }

    const visibleItems = columnsManager.filter(item => item.isVisible);

    const handleDragEnd = (event, item) => {
        let newColumnsSort = columnsManager;
        const index = newColumnsSort.indexOf(currentDragItem);
        currentDragItem.isVisible = visibleItems.length > currentDragItemRealIndex;
        newColumnsSort.splice(index, 1);
        if (index >= currentDragItemIndex) {
            newColumnsSort.splice(currentDragItemIndex, 0, currentDragItem);
        } else {
            newColumnsSort.splice(currentDragItemIndex - 1, 0, currentDragItem);
        }
        newColumnsSort.forEach((item, index) => item.position = index);
        setColumnsManager([...newColumnsSort]);
        setCurrentDragItem(null);
    }

    const handleDragMove = (event) => {
        const elements = document.elementsFromPoint(event.clientX, event.clientY);
        for (const element of elements) {
            if (element.className === "draggable") {
                const index = parseInt(element.getAttribute("data-index"));
                const bound = element.getBoundingClientRect();
                if (bound.height / 2 > event.clientY - bound.top) {
                    setCurrentDragItemIndex(index);
                    setCurrentDragItemRealIndex(index);
                } else {
                    setCurrentDragItemIndex(index + 1);
                    setCurrentDragItemRealIndex(index);
                }
                return;
            }
        }
    }

    const handlePosition = (position) => {
        return {x: 0, y: position.y};
    }

    return (
        <ColumnsManager ref={parentRef} isVisible>

            {columnsManager.map((item, index) => (
                <Template key={item.id} slot={item.isVisible ? ColumnsManager.visible : ColumnsManager.invisible}>
                    {currentDragItem !== null && index === currentDragItemIndex && index === currentDragItemRealIndex && <div className="draggable-shadow"/>}
                    <Draggable index={index} item={item} onPosition={handlePosition} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragMove={handleDragMove}>
                        <ColumnsManager.Item
                            isReadOnly
                            item={item}
                            value={item.value}
                            isVisible={item.isVisible}
                            isFilterDisabled={item.isFilterDisabled}
                            isSortDisabled={item.isSortDisabled}
                            isVisibilityDisabled={item.isVisibilityDisabled}
                            onFilterClick={handleFilterClick}
                            onSortClick={handleSortClick}
                            onVisibilityClick={handleVisibilityClick}
                        />
                    </Draggable>
                    {currentDragItem !== null && index + 1 === currentDragItemIndex && index === currentDragItemRealIndex && <div className="draggable-shadow"/>}
                </Template>
            ))}

        </ColumnsManager>
    )
}