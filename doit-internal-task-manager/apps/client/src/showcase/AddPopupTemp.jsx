import AddPopup from "../components/AddPopup.jsx";
import {Children, useContext, useEffect, useRef, useState} from "react";
import {StatusContext} from "../pages/AppDataProvider.jsx";
import Template from "sparrow/src/components/Template.jsx";
import Draggable from "../components/Draggable.jsx";

export default AddPopupTemp;

function AddPopupTemp() {
    const [status, setStatus, isStatusReadOnly, setStatusReadOnly] = useContext(StatusContext);
    const [multiSelected, setMultiSelected] = useState([]);
    const [singleSelected, setSingleSelected] = useState('');
    // Drag and Drop states
    const statusPopupRef = useRef(null);
    const [currentDragItem, setCurrentDragItem] = useState(null);
    const [currentDragItemIndex, setCurrentDragItemIndex] = useState(0);
    const [currentDragItemRealIndex, setCurrentDragItemRealIndex] = useState(0);

    const handleMultiSelectedChange = (event) => {
        if (multiSelected.indexOf(event.target.value) === -1) {
            setMultiSelected(prevState => [...prevState, event.target.value])
        } else {
            setMultiSelected(prevState => prevState.filter(item => item !== event.target.value))
        }
    }

    const handleSingleSelectedChange = (event) => {
        setSingleSelected(event.target.value);
    }

    const [isEmptyReadOnly, setEmptyReadOnly] = useState(true);
    const [empty, setEmpty] = useState([]);

    useEffect(() => {
        if (empty.length === 0) {
            setEmptyReadOnly(false)
        } else {
            setEmptyReadOnly(true)
        }
    }, [])

    const [isAssignReadOnly, setAssignReadOnly] = useState(true);
    const [assign, setAssign] = useState([
        {
            id: 'ab',
            value: 'B',
            label: 'B',
            color: {text: 'blue', icon: 'blue'},
            isVisible: true,
        },
        {
            id: 'am',
            value: 'M',
            label: 'M',
            color: {text: 'pink', icon: 'pink'},
            isVisible: true,
        },
        {
            id: 'at',
            value: 'T',
            label: 'T',
            color: {text: 'red', icon: 'red'},
            isVisible: true,
        },
        {
            id: 'fs',
            value: 'F',
            label: 'F',
            color: {text: 'orange', icon: 'orange'},
            isVisible: true,
        },
        {
            id: 'as',
            value: 'S',
            label: 'S',
            color: {text: 'green', icon: 'green'},
            isVisible: true,
        },
        {
            id: 'aba',
            value: 'BA',
            label: 'BA',
            color: {text: 'bermuda', icon: 'bermuda'},
            isVisible: false,
        },
        {
            id: 'ana',
            value: 'NA',
            label: 'NA',
            color: {text: 'purple', icon: 'purple'},
            isVisible: false,
        },
    ])
    useEffect(() => {
        if (assign.length === 0) {
            setAssignReadOnly(false)
        } else {
            setAssignReadOnly(true)
        }
    }, [])

    const [isProjectsReadOnly, setProjectsReadOnly] = useState(true);
    const [projects, setProjects] = useState([
        {
            id: 'drt',
            value: 'Dadroit',
            label: 'Dadroit',
            isVisible: true,
            color: {},
        },
        {
            id: 'rct',
            value: 'Recactus',
            label: 'Recactus',
            isVisible: true,
            color: {}
        },
        {
            id: 'tdb',
            value: 'TheDB',
            label: 'TheDB',
            isVisible: true,
            color: {}
        },
        {
            id: 'tds',
            value: 'TheDS',
            label: 'TheDS',
            isVisible: true,
            color: {}
        },
    ]);
    useEffect(() => {
        if (projects.length === 0) {
            setProjectsReadOnly(false)
        } else {
            setProjectsReadOnly(true)
        }
    }, [])

    // Projects AddPopup
    const handleSubmitProjectItem = (event) => {
        const item = {
            id: `id:pr${projects.length}`,
            value: event.target.value,
            label: event.target.value,
            isVisible: true
        }
        setProjects(prevState => [...prevState, item]);
    }

    const handleProjectsDoneClick = () => {
        setProjectsReadOnly(true)
    }

    const handleProjectsEditClick = () => {
        setProjectsReadOnly(false)
    }

    const handleDeleteProjectItem = (item) => {
        const newProjects = projects.filter(projectItem => item.id !== projectItem.id);
        setProjects(newProjects);
    }

    const handleProjectsVisibilityChange = (visibility, item) => {
        let newProjects = [...projects];
        const index = newProjects.indexOf(item);
        newProjects[index].isVisible = visibility;
        setProjects(newProjects);
    }

    const handleProjectsColorChange = (event, item) => {
        let newProjects = [...projects];
        const index = newProjects.indexOf(item);
        newProjects[index].color = {background: `${event.target.value}-invert`, icon: event.target.value};
        setProjects(newProjects);
    }

    const handleProjectsInputChange = (event, item) => {
        let newProjects = [...projects];
        const index = newProjects.indexOf(item);
        newProjects.forEach((item) => item.isChecked = false);
        newProjects[index].value = event.target.value;
        newProjects[index].label = event.target.value;
        newProjects[index].isChecked = event.target.checked;
        setProjects(newProjects);
        handleSingleSelectedChange(event);
    }

    //Empty AddPopup
    const handleSubmitEmptyItem = (event) => {
        const item = {
            id: `id:em${empty.length}`,
            value: event.target.value,
            label: event.target.value,
            isVisible: true,
        }
        setEmpty(prevState => [...prevState, item]);
    }

    const handleEmptyDoneClick = () => {
        setEmptyReadOnly(true)
    }

    const handleEmptyEditClick = () => {
        setEmptyReadOnly(false)
    }

    const handleEmptyInputChange = (event, item) => {
        let newEmpty = [...empty];
        const index = newEmpty.indexOf(item);
        newEmpty[index].value = event.target.value;
        newEmpty[index].label = event.target.value;
        newEmpty[index].isChecked = event.target.checked;
        setEmpty(newEmpty);
    }

    const handleDeleteEmptyItem = (item) => {
        const newEmpty = empty.filter(emptyItem => item.id !== emptyItem.id);
        setEmpty(newEmpty);
    }

    const handleEmptyVisibilityChange = (visibility, item) => {
        let newEmpty = [...empty];
        const index = newEmpty.indexOf(item);
        newEmpty[index].isVisible = visibility;
        setProjects(newEmpty);
    }

    const handleEmptyColorChange = (event, item) => {
        let newEmpty = [...empty];
        const index = newEmpty.indexOf(item);
        newEmpty[index].color = {background: event.target.value + '-invert', icon: event.target.value};
        setEmpty(newEmpty);
    }

    // Assign AddPopup
    const handleSubmitAssignItem = (event) => {
        const item = {
            id: `id:em${assign.length}`,
            value: event.target.value,
            label: event.target.value,
            isVisible: true,
        }
        setAssign(prevState => [...prevState, item]);
    }

    const handleAssignDoneClick = () => {
        setAssignReadOnly(true)
    }

    const handleAssignEditClick = () => {
        setAssignReadOnly(false)
    }

    const handleAssignInputChange = (event, item) => {
        let newAssign = [...assign];
        const index = newAssign.indexOf(item);
        newAssign[index].value = event.target.value;
        newAssign[index].label = event.target.value;
        newAssign[index].isChecked = event.target.checked;
        setAssign(newAssign);
    }

    const handleDeleteAssignItem = (item) => {
        const newAssign = assign.filter(assignItem => item.id !== assignItem.id);
        setAssign(newAssign);
    }

    const handleAssignVisibilityChange = (visibility, item) => {
        let newAssign = [...assign];
        const index = newAssign.indexOf(item);
        newAssign[index].isVisible = visibility;
        setAssign(newAssign);
    }

    const handleAssignColorChange = (event, item) => {
        let newAssign = [...assign];
        const index = newAssign.indexOf(item);
        newAssign[index].color = {text: event.target.value, icon: event.target.value};
        setAssign(newAssign);
    }

    // Status AddPopup
    const handleSubmitStatusItem = (event) => {
        const item = {
            id: `id:em${status.length}`,
            value: event.target.value,
            label: event.target.value,
            isVisible: true,
        }
        setStatus(prevState => [...prevState, item]);
    }

    const handleStatusCheckBoxChange = (event, item) => {
        handleSingleSelectedChange(event);
        let newStatus = [...status];
        const index = newStatus.indexOf(item);
        newStatus.forEach((item) => item.isChecked = false);
        newStatus[index].isChecked = event.target.checked;
        setStatus(newStatus);
    }

    const handleStatusTextBoxChange = (event, item) => {
        console.log(event.target.value);
    }

    const handleStatusTextBoxBlur = (event, item) => {
        let newStatus = [...status];
        const index = newStatus.indexOf(item);
        newStatus[index].value = event.target.value;
        newStatus[index].label = event.target.value;
        newStatus[index].isChecked = event.target.checked;
        setStatus(newStatus);
    }

    const handleDeleteStatusItem = (item) => {
        const newStatus = status.filter(statusItem => item.id !== statusItem.id);
        setStatus(newStatus);
    }

    const handleStatusVisibilityChange = (visibility, item) => {
        let newStatus = [...status];
        const index = newStatus.indexOf(item);
        newStatus[index].isVisible = visibility;
        setStatus(newStatus);
    }

    const handleStatusColorChange = (event, item) => {
        let newStatus = [...status];
        const index = newStatus.indexOf(item);
        newStatus[index].color = {background: event.target.value + '-invert', icon: event.target.value};
        setStatus(newStatus);
    }

    const handleStatusDoneClick = () => {
        setStatusReadOnly(true);
    }

    const handleStatusEditClick = () => {
        setStatusReadOnly(false)
    }

    const handleStatusDragStart = (event, item) => {
        setCurrentDragItem(item);
        setCurrentDragItemIndex(status.indexOf(item) + 1);
        setCurrentDragItemRealIndex(status.indexOf(item));
    }

    const handleStatusDragEnd = (event, item) => {
        const newStatusSort = status;
        const index = status.indexOf(currentDragItem);
        const visibleItems = status.filter(item => item.isVisible);
        currentDragItem.isVisible = currentDragItemRealIndex < visibleItems.length;
        newStatusSort.splice(index, 1);
        if (index > currentDragItemIndex) {
            newStatusSort.splice(currentDragItemIndex, 0, currentDragItem);
        } else {
            newStatusSort.splice(currentDragItemIndex - 1, 0, currentDragItem);
        }
        newStatusSort.forEach((item, index) => item.position = index);
        setStatus([...newStatusSort]);
        setCurrentDragItem(null);
    }

    const handleStatusDragMove = (event, item) => {
        const elements = document.elementsFromPoint(event.clientX, event.clientY);
        for (const element of elements) {
            if (element.className === 'draggable') {
                const elementIndex = parseInt(element.getAttribute('data-index'))
                const elementBounding = element.getBoundingClientRect();
                if (elementBounding.height / 2 > event.clientY - elementBounding.y) {
                    setCurrentDragItemIndex(elementIndex);
                    setCurrentDragItemRealIndex(elementIndex)
                } else {
                    setCurrentDragItemIndex(elementIndex + 1);
                    setCurrentDragItemRealIndex(elementIndex)
                }
                return;
            }
        }
    }

    const handleStatusPosition = (position) => {
        return {x: 6, y: position.y};
    }

    return (
        <>
            {/* Projects AddPopup */}
            <AddPopup isReadOnly={isProjectsReadOnly} onSubmit={handleSubmitProjectItem} onDoneClick={handleProjectsDoneClick} onEditClick={handleProjectsEditClick}>
                {projects.map(item => (
                    <AddPopup.Item
                        item={item}
                        key={item.id}
                        slot={item.isVisible ? AddPopup.visible : AddPopup.invisible}
                        color={item.color}
                        value={item.value}
                        isChecked={item.isChecked}
                        isVisible={item.isVisible}
                        isReadOnly={isProjectsReadOnly}
                        onCheckBoxChange={handleProjectsInputChange}
                        onTextBoxChange={handleProjectsInputChange}
                        onDelete={handleDeleteProjectItem}
                        onVisibilityChange={handleProjectsVisibilityChange}
                        onColorChange={handleProjectsColorChange}
                    >
                        {item.label}
                    </AddPopup.Item>
                ))}
            </AddPopup>

            {/* Assign AddPopup + MultiSelectItem + Color */}
            <AddPopup isReadOnly={isAssignReadOnly}
                      onSubmit={handleSubmitAssignItem}
                      onDoneClick={handleAssignDoneClick}
                      onEditClick={handleAssignEditClick}>
                {assign.map(item => {
                    return (
                        <AddPopup.Item
                            key={item.id}
                            slot={item.isVisible ? AddPopup.visible : AddPopup.invisible}
                            item={item}
                            color={item.color}
                            value={item.value}
                            isVisible={item.isVisible}
                            isChecked={item.isChecked}
                            isReadOnly={isAssignReadOnly}
                            onCheckBoxChange={handleAssignInputChange}
                            onTextBoxChange={handleAssignInputChange}
                            onDelete={handleDeleteAssignItem}
                            onVisibilityChange={handleAssignVisibilityChange}
                            onColorChange={handleAssignColorChange}
                            isMultiSelected
                        >
                            {item.label}
                        </AddPopup.Item>
                    )
                })}
            </AddPopup>

            {/*Status AddPopup + SingleSelectedItem + BackgroundColor */}
            <AddPopup ref={statusPopupRef} isReadOnly={isStatusReadOnly} onSubmit={handleSubmitStatusItem} onDoneClick={handleStatusDoneClick} onEditClick={handleStatusEditClick}>
                {status.map((item, index) => {
                    return (
                        <Template key={item.id} slot={item.isVisible ? AddPopup.visible : AddPopup.invisible}>
                            {(currentDragItem !== null && index === currentDragItemIndex && index === currentDragItemRealIndex) &&
                                <div className="draggable-shadow"/>}
                            <Draggable
                                index={index}
                                item={item}
                                key={item.id}
                                onDragStart={handleStatusDragStart}
                                onDragEnd={handleStatusDragEnd}
                                onDragMove={handleStatusDragMove}
                                onPosition={handleStatusPosition}
                            >
                                <AddPopup.Item
                                    item={item}
                                    color={item.color}
                                    value={item.value}
                                    isReadOnly={isStatusReadOnly}
                                    isVisible={item.isVisible}
                                    isChecked={item.isChecked}
                                    onCheckBoxChange={handleStatusCheckBoxChange}
                                    onTextBoxChange={handleStatusTextBoxChange}
                                    onTextBoxBlur={handleStatusTextBoxBlur}
                                    onDelete={handleDeleteStatusItem}
                                    onVisibilityChange={handleStatusVisibilityChange}
                                    onColorChange={handleStatusColorChange}
                                >
                                    {item.label}
                                </AddPopup.Item>
                            </Draggable>
                            {(currentDragItem !== null && index + 1 === currentDragItemIndex && index === currentDragItemRealIndex) &&
                                <div className="draggable-shadow"/>}
                        </Template>
                    )
                })}
            </AddPopup>

            {/* Empty AddPopup */}
            <AddPopup onSubmit={handleSubmitEmptyItem} isReadOnly={isEmptyReadOnly} onDoneClick={handleEmptyDoneClick} onEditClick={handleEmptyEditClick}>
                {empty.map(item => (
                    <AddPopup.Item
                        key={item.id}
                        slot={item.isVisible ? AddPopup.visible : AddPopup.invisible}
                        item={item}
                        color={item.color}
                        value={item.value}
                        isVisible={item.isVisible}
                        isChecked={item.isChecked}
                        isReadOnly={isEmptyReadOnly}
                        onCheckBoxChange={handleEmptyInputChange}
                        onTextBoxChange={handleEmptyInputChange}
                        onDelete={handleDeleteEmptyItem}
                        onVisibilityChange={handleEmptyVisibilityChange}
                        onColorChange={handleEmptyColorChange}
                    >
                        {item.label}
                    </AddPopup.Item>
                ))}
            </AddPopup>
        </>
    )
}