//React
import React, {
    memo,
    useCallback,
    useRef,
    useEffect,
    useState,
    useContext,
    Children,
    cloneElement,
    CSSProperties
} from "react";
import clsx from "clsx";
//API
import * as utils from "./utils";
import * as api from "./../../api/api";
//Components
import VirtualGridProvider from "./VirtualGridProvider";
import Icon from "sparrow/src/components/Icon.jsx";
import Text from "sparrow/src/components/Text.jsx";
import Slot from "sparrow/src/components/Slot.jsx";
import EditBox from "../EditBox.jsx";
import AddPopup from "../AddPopup";
//Utils
import {StatusContext, TagContext} from "../../pages/AppDataProvider.jsx";
import useOutClick from "sparrow/src/hooks/useOutClick.jsx";
import {dateFormatter, setLocalCustomProperty} from "sparrow/src/common/utils.jsx";
import DatePicker from "../DatePicker.jsx";

// const propsList = [
// // Task title #text
// //  Estimation #text
// // Due #text
// // Project #single
// // Status #single
// // Priority #single
// // Tags #multi
// // Members #multi
// // Assignees #multi
// ];

function TreeComponent() {
    const [rows, setRows] = useState([]); //Displayed rows
    const [tasks, setTasks] = useState([]); //Actual tasks from db
    const [showAddedTask, setShowAddedTask] = useState(false); //Set true in case adding a new row shortcut (shift + enter)
    const [initializedApp, setInitializedApp] = useState(false); //Set true when first time syncing of tasks from api has been done

    const virtualTreeViewRef = useRef();
    const focusedTaskIndex = useRef(-1); //Index of the task selected, on dbl click or adding a new row (task or subtask)
    const focusedTaskIndexOffset = useRef(-1); //For jumping over a task's children in adding a new row
    const editingTask = useRef(false); //Set true for editing a task on dbl click
    const tagsSelected = useRef([]); //Cache selected tags values by change in pop up to apply in the end for the tag in api

    const [status, setStatus] = useContext(StatusContext); //Import context of list of statuses
    const [tag, setTag] = useContext(TagContext); //Import context of list of statuses

    // ---------------------------------------------- API functions: task
    const initTasks = async () => {
        const {data, status} = await api.apiGetUserTasks();
        displayAPILog('initTasks', data, status);

        const arr = data.tasks.map((item) => {
            item.expanded = false;
            item.indent = 0;
            return item;
        });
        setTasks(arr);
    }

    //Add a task if the task.id=0, update it otherwise
    const addOrUpdateTask = async (task) => {
        const {data, status} = await api.apiAddOrUpdateTask(task);
        displayAPILog('addOrUpdateTask', data, status);

        if (data.task) {
            let t = data.task;
            t.expanded = task.id === 0 ? false : task.expanded;
            t.indent = task.indent;

            //update rows
            let new_rows = [...rows];
            new_rows[focusedTaskIndex.current] = {...t};
            setRows(new_rows);

            //update tasks
            let new_tasks = [...tasks];
            for (let i = 0; i < new_tasks.length; i++)
                if (new_tasks[i].id === 0 || new_tasks[i].id === task.id)
                    new_tasks[i] = {...t};
            setTasks(new_tasks);
        }
    }

    const deleteTask = async (task) => {
        const {data, status} = await api.apiDeleteTask(task);
        displayAPILog('deleteTask', data, status);

        let deletedTasks = data.deletedTasks; //id of all the deleted tasks
        let parentIdx = -1;

        //update rows and decrease parent child count
        let new_rows = [...rows];
        if (task.parent_id !== 0) {
            for (let i = 0; i < new_rows.length; i++)
                if (new_rows[i].id === task.parent_id)
                    parentIdx = i;
            new_rows[parentIdx].child_count = Number(new_rows[parentIdx].child_count) - 1;
        }
        new_rows = new_rows.filter((item) => !deletedTasks.includes(item.id));
        setRows(new_rows);

        //update tasks and decrease parent child count
        let new_tasks = [...tasks];
        if (task.parent_id !== 0) {
            for (let i = 0; i < new_tasks.length; i++)
                if (new_tasks[i].id === task.parent_id)
                    parentIdx = i;
            new_tasks[parentIdx].child_count = Number(new_tasks[parentIdx].child_count) - 1;
        }
        new_tasks = new_tasks.filter((item) => !deletedTasks.includes(item.id));
        setTasks(new_tasks);
        updateAndFocusTree();
    }

    // ---------------------------------------------- API functions: status
    const initStatus = async () => {
        const {data, status} = await api.apiGetStatus();
        displayAPILog('initStatus', data, status);

        const arr = data.statuses.map((item) => {
            item.value = item.title;
            item.label = item.title;
            item.color = {background: item.background_color, icon: item.icon};
            item.isVisible = item.visibility;
            return item;
        });
        setStatus(arr);
    }

    // Add a status if the s.id=0, update it otherwise
    const addOrUpdateStatus = async (s) => {
        const {data, status_} = await api.apiAddOrUpdateStatus(s);
        displayAPILog('addOrUpdateStatus', data, status_);

        if (s.id !== 0) {
            let item, st;
            let affectedTasks = data.affectedTasks;
            let new_rows = [...rows];
            for (let i = 0; i < affectedTasks.length; i++) {
                item = new_rows.find(item => item.id === affectedTasks[i]);
                st = status.find(item => item.id === s.id);
                item.status = st.title;
                item.title = st.title;
                item.status_color = st.text_color;
                item.status_bg_color = st.background_color;
            }
            setRows(new_rows);

            //update tasks
            let new_tasks = [...tasks];
            for (let i = 0; i < affectedTasks.length; i++) {
                item = new_tasks.find(item => item.id === affectedTasks[i]);
                st = status.find(item => item.id === s.id);
                item.status = st.title;
                item.status_color = st.text_color;
                item.status_bg_color = st.background_color;
            }
            setTasks(new_tasks);
            updateAndFocusTree();
        }

        return data.status_;
    }

    const deleteStatus = async (status_id) => {
        const {data, status_} = await api.apiDeleteStatus(status_id);
        displayAPILog('deleteStatus', data, status_);

        let affectedTasks = data.affectedTasks;
        let item;
        let firstStatus = status.find(item => item.id === 1);
        //update rows
        let new_rows = [...rows];
        for (let i = 0; i < affectedTasks.length; i++) {
            item = new_rows.find(item => item.id === affectedTasks[i]);

            item.status_id = 1;
            item.status = firstStatus.title;
            item.status_color = firstStatus.text_color;
            item.status_bg_color = firstStatus.background_color;
        }
        setRows(new_rows);

        //update tasks
        let new_tasks = [...tasks];
        for (let i = 0; i < affectedTasks.length; i++) {
            item = new_tasks.find(item => item.id === affectedTasks[i]);
            item.status_id = 1;
            item.status = firstStatus.title;
            item.status_color = firstStatus.text_color;
            item.status_bg_color = firstStatus.background_color;
        }
        setTasks(new_tasks);
        updateAndFocusTree();
    }

    // ---------------------------------------------- API functions: tag

    const initTag = async () => {
        const {data, status} = await api.apiGetTags();
        displayAPILog('initTag', data, status);

        const arr = data.tags.map((item) => {
            item.value = item.title;
            item.label = item.title;
            item.color = {background: item.background_color, icon: item.icon};
            item.isVisible = item.visibility;
            return item;
        });
        setTag(arr);
    }

    // Add a status if the tag.id=0, update it otherwise
    const addOrUpdateTag = async (tag) => {
        const {data, status} = await api.apiAddOrUpdateTag(tag);
        displayAPILog('addOrUpdateTag', data, status);

        //Update tag in the affected tasks
        if (tag.id !== 0) {
            let item = {}, tg = {}, idx = -1;
            let affectedTasks = data.affectedTasks; //id of all the deleted tasks
            let new_rows = [...rows];
            for (let i = 0; i < affectedTasks.length; i++) {
                item = new_rows.find(itm => itm.id === affectedTasks[i]);
                tg = item.tags.find(itm => itm.id === tag.id);
                idx = item.tags.indexOf(tg);
                item.tags[idx] = {...tag};
            }
            setRows(new_rows);
            updateAndFocusTree();
        }

        return data.tag;
    }

    const deleteTag = async (tag_id) => {
        const {data, status} = await api.apiDeleteTag(tag_id);
        displayAPILog('deleteTag', data, status);

        //Delete selected tag from the affected tasks
        let item = {}, tg = {};
        let affectedTasks = data.affectedTasks; //id of all the deleted tasks
        let new_rows = [...rows];
        for (let i = 0; i < affectedTasks.length; i++) {
            item = new_rows.find(itm => itm.id === affectedTasks[i]);
            tg = item.tags.find(itm => itm.id === tag_id);
            item.tags.splice(item.tags.indexOf(tg), 1);
        }
        setRows(new_rows);
        updateAndFocusTree();
    }

    // ---------------------------------------------- Helpers
    const handleTagCheckBoxChange = (event, item) => {
        if (itemIsInArray(tagsSelected.current, item))
            tagsSelected.current = tagsSelected.current.filter(t => t.id !== item.id);
        else
            tagsSelected.current = [...tagsSelected.current, item];
    }

    const abortAddingOrEditingCurrentTask = () => {

        // if (focusedTaskIndex.current === -1)
        //     return;

        // focusedTaskIndex.current = focusedTaskIndex.current + 1;
        // console.log('------------ abortAddingOrEditingCurrentTask', focusedTaskIndex.current);
        // displayTitle('rows', rows);
        // displayTitle(('tasks', tasks);

        // let t = {...rows[focusedTaskIndex.current]};
        // if (t) {
        //     editingTask.current = false;
        //     setShowAddedTask(false);
        //     let parentIdx = -1;
        //
        //     //Delete current row from rows
        //     let new_rows = [...rows];
        //     //Decrease parent child count
        //     if (t.parent_id !== 0) {
        //         for (let i = 0; i < new_rows.length; i++)
        //             if (new_rows[i].id === t.parent_id)
        //                 parentIdx = i;
        //         new_rows[parentIdx].child_count = Number(new_rows[parentIdx].child_count) - 1;
        //     }
        //     new_rows.splice(focusedTaskIndex.current, 1);
        //     setRows(new_rows);
        //
        //     //Delete current task from tasks
        //     let new_tasks = [...tasks];
        //     let idx = -1;
        //     for (let i = 0; i < new_tasks.length; i++)
        //         if (new_tasks[i].id === t.id)
        //             idx = i;
        //     //Decrease parent child count
        //     if (t.parent_id !== 0) {
        //         for (let i = 0; i < new_rows.length; i++)
        //             if (new_tasks[i].id === t.parent_id)
        //                 parentIdx = i;
        //         new_tasks[parentIdx].child_count = Number(new_rows[parentIdx].child_count) - 1;
        //     }
        //     new_tasks.splice(idx, 1);
        //     setTasks(new_tasks);
        // }

    }

    // ---------------------------------------------- Tree
    const updateAndFocusTree = () => {
        if (virtualTreeViewRef.current) {
            virtualTreeViewRef.current.focusTree();
            virtualTreeViewRef.current.update();
        }
    }

    const handleColWidth = (col) => {
        // if (col === 0)
        //     return 400
        // else
        //     return 100;
        // // return utils.columnSizes[col];
    }

    //Manage expand and collapses of each row and apply the result on the rows state
    const handleTreeClick = (e) => {
        if (e.detail === 1) {
            if (virtualTreeViewRef.current) {
                const hasSelection = false; //virtualTreeViewRef.current.getHasSelection();
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

                            //Make removed rows collapsed
                            for (let i = rowIndex + 1; i < index - rowIndex; i++)
                                rows[i].expanded = false;

                            rows.splice(rowIndex + 1, index - rowIndex - 1);
                        } else {
                            //If row is expanded, append first level children
                            let nRows = tasks.filter((item) => item.parent_id === row.id).map((item) => {
                                item.indent = row.indent + 1;
                                return item;
                            });
                            rows.splice(rowIndex + 1, 0, ...nRows);
                        }
                        setRows([...rows]);
                    }
                }
            }
        }

        e.stopPropagation();
        e.preventDefault();

        //Need it for select a task by clicking on the title, do not uncomment
        //     if (virtualTreeViewRef.current)
        //         virtualTreeViewRef.current.handleClick(e);
    }

    //Handle update a task title on change of text box
    const handleSubmitTitle = (e) => {
        if (focusedTaskIndex.current === -1)
            return;
        let t = {...rows[editingTask.current ? focusedTaskIndex.current : focusedTaskIndex.current + focusedTaskIndexOffset.current]};
        if (t) {
            setShowAddedTask(false);
            t.title = e.target.value;
            addOrUpdateTask(t);
            if (virtualTreeViewRef.current && t.id === 0 && !editingTask.current) {
                virtualTreeViewRef.current.updateAfterAddRow(focusedTaskIndexOffset.current);
            }
        }
    }

    //Handle edit an estimation
    const handleChangeEstimation = (e) => {
        let t = tasks[focusedTaskIndex.current];
        if (t && (focusedTaskIndex.current !== -1)) {
            t.estimation = Number(e.target.value);
            addOrUpdateTask(t);
            setShowAddedTask(false);
        }
    }

    //Helper to manage rows, tasks and focusedTaskIndex after receiving shortcut to add a new task(shift-enter)
    const addNewEmptySubTask = () => {
        let t = {...rows[focusedTaskIndex.current]};

        if (t) {
            setShowAddedTask(true);
            editingTask.current = false;
            focusedTaskIndexOffset.current = Number(t.child_count) + 1;
            t.position = Number(t.child_count) === 0 ? -1 : t.position;
            t.expanded = false;
            t.title = '';
            t.parent_id = t.id;
            t.id = 0;
            t.indent = t.indent + 1;
            t.has_child = false;
            t.child_count = 0;

            let new_rows = [...rows];
            new_rows[focusedTaskIndex.current].child_count = Number(new_rows[focusedTaskIndex.current].child_count) + 1;
            new_rows.splice(focusedTaskIndex.current + focusedTaskIndexOffset.current, 0, t);
            setRows(new_rows);

            let new_tasks = [...tasks];
            let idx = -1;
            for (let i = 0; i < new_tasks.length; i++)
                if (new_tasks[i].id === new_rows[focusedTaskIndex.current].id)
                    idx = i;
            new_tasks[idx].child_count = Number(new_tasks[idx].child_count) + 1;
            new_tasks.splice(idx + focusedTaskIndexOffset.current, 0, t);
            setTasks(new_tasks);
            focusedTaskIndex.current = focusedTaskIndex.current + focusedTaskIndexOffset.current;
        }
    }

    //Helper to manage rows, tasks and focusedTaskIndex after receiving shortcut to add a new subtask(shift-tab)
    const addNewEmptyTask = () => {
        let t = {...rows[focusedTaskIndex.current]};
        if (t) {
            focusedTaskIndexOffset.current = Number(t.child_count) + 1;
            setShowAddedTask(true);
            editingTask.current = false;
            t.id = 0;
            t.expanded = false;
            t.title = '';
            t.has_child = false;
            let parentIdx = -1;

            let new_rows = [...rows];
            new_rows.splice(focusedTaskIndex.current + focusedTaskIndexOffset.current, 0, t);
            //Increase parent child count
            if (t.parent_id !== 0) {
                for (let i = 0; i < new_rows.length; i++)
                    if (new_rows[i].id === t.parent_id)
                        parentIdx = i;
                new_rows[parentIdx].child_count = Number(new_rows[parentIdx].child_count) + 1;
            }
            setRows(new_rows);

            let new_tasks = [...tasks];
            let idx = -1;
            for (let i = 0; i < new_tasks.length; i++)
                if (new_tasks[i].id === new_rows[focusedTaskIndex.current].id)
                    idx = i;
            //Increase parent child count
            if (t.parent_id !== 0) {
                for (let i = 0; i < new_rows.length; i++)
                    if (new_tasks[i].id === t.parent_id)
                        parentIdx = i;
                new_tasks[parentIdx].child_count = Number(new_rows[parentIdx].child_count) + 1;
            }
            new_tasks.splice(idx + focusedTaskIndexOffset.current, 0, t);
            setTasks(new_tasks);

            focusedTaskIndex.current = focusedTaskIndex.current + focusedTaskIndexOffset.current;
        }
    }

    //Called when shortcut for adding a task (shift-enter) or a subtask(shift-tab) has been received in tree
    const handleAddRow = (e) => {
        if (focusedTaskIndex.current === -1)
            return;
        if (e.shiftKey) {
            if (e.code === "Enter")
                addNewEmptyTask();
            if (e.code === "Tab")
                addNewEmptySubTask();
        }
    }

    //Called when shortcut for deleting a task has been received in tree
    const handleOnDelete = (e) => {
        if (focusedTaskIndex.current === -1)
            return;
        let t = {...rows[focusedTaskIndex.current]};
        if (t)
            deleteTask(t);
    }

    const handleOnRowCount = (e) => {
        return rows.length;
    }

    //Get tasks and props data from API
    async function initApp() {
        await initTasks();
        await initStatus();
        await initTag();
        // await initPriorities();
        // await initProjects();
        // await initTags();
        // await initUsers();
    }

    useEffect(() => {
        async function fetchMyAPI() {
            await initApp();
        }

        fetchMyAPI();
        updateAndFocusTree();
    }, [])

    useEffect(() => {
        if (!initializedApp && tasks.length > 0) {
            setRows(tasks.filter((item) => item.parent_id === 0));
            setInitializedApp(true);
        }
    }, [tasks])

    useEffect(() => {
        focusedTaskIndex.current = -1;
        if (virtualTreeViewRef.current)
            virtualTreeViewRef.current.updateResize();
        updateAndFocusTree();
    }, [rows])

    const Cell = (
        {
            e,
            className,
            indent,
            isSelected = false,
            backgroundColor = 'transparent',
            textColor = 'var(--color-emphasis-high)',
            isReadOnly = true,
            onClick = () => undefined,
            onDoubleClick = () => undefined,
            children
        }) => {

        const [readOnly, setReadOnly] = useState(isReadOnly);

        const handleClick = (event) => {
            event.stopPropagation(); //Need it for select a task by clicking on the title, do not uncomment
            onClick(event);
        }

        const handleDoubleClick = (event) => {
            event.stopPropagation();
            onDoubleClick(event);
            setReadOnly(false);
            focusedTaskIndex.current = e.index;
            editingTask.current = true;
        }

        useEffect(() => {
            setReadOnly(isReadOnly);
            setLocalCustomProperty(cellRef, '--cell-background-color', `var(--color-${backgroundColor})`)
            setLocalCustomProperty(cellRef, '--cell-text-color', `${textColor}`)
            setLocalCustomProperty(cellRef, '--cell-indent-count', indent)
        }, [isReadOnly, backgroundColor, textColor])

        const cellRef = useOutClick(() => {
            if (!cellRef.current.classList.contains('is-focused'))
                return;
            setReadOnly(true);
        })

        const handleEscapePress = (event) => {
            if (event.key === 'Escape' && cellRef.current.classList.contains('is-focused')) {
                setReadOnly(true);
                // abortAddingOrEditingCurrentTask();
            }
        }

        useEffect(() => {
            document.addEventListener('keydown', handleEscapePress);
            return () => {
                document.removeEventListener('keydown', handleEscapePress);
            }
        }, [])

        const classNames = clsx(className, 'cell', 'body-500', {'is-focused': !readOnly}, {'is-selected': isSelected}, {'has-indent': indent});

        return (
            <div ref={cellRef} className={classNames} onClick={handleClick} onDoubleClick={handleDoubleClick}>
                <div className="cell-wrapper">
                    <Slot id={Cell.icon} content={children}/>
                    {Children.map(children, child => {
                        if (child.props.slot === 2) {
                            return (cloneElement(child, {
                                className: readOnly && 'is-visible'
                            }))
                        }
                        if (child.props.slot === 3) {
                            return (cloneElement(child, {
                                isVisible: !readOnly
                            }))
                        }
                    })}
                </div>
            </div>
        )
    }

    Cell.icon = 1;
    Cell.text = 2;
    Cell.editBox = 3;

    //Todo: check callback for triggering resize handle
    const Row = (e) => {
        //Internal context imports for row
        const [status, setStatus, isStatusReadOnly, setStatusReadOnly] = useContext(StatusContext);
        const [tag, setTag, isTagReadOnly, setTagReadOnly] = useContext(TagContext);

        const [cellIndex, setCellIndex] = useState(''); //Cell index to specify readonly of each cell to show pop up or text box
        const rowInfo = rows[e.index]; //Current row data
        const dateOption = {month: 'short', day: '2-digit', year: 'numeric'} //Just a pattern to use in date format function to display the date in the cell

        //If the current row is the focused one
        const isFocusRow = (focusedTaskIndex.current !== -1) && (e.index === focusedTaskIndex.current + focusedTaskIndexOffset.current) && (showAddedTask);
        const isSelected = utils.isInSelectedSquare(e.selectedCells, [e.index, 0]);
        //Set selected cell index from tree selected row
        if (isSelected)
            focusedTaskIndex.current = e.index;

        //Set cell index to specify what cell has been chosen
        const handleDoubleClick = (value) => {
            setCellIndex(value);
        }

        //----------------------------------------------------------------------------- Status
        const handleStatusDoneClick = (event) => {
            setStatusReadOnly(true);
        }

        const handleStatusEditClick = (event) => {
            setStatusReadOnly(false);
        }

        const handleSubmitStatusItem = (event) => {
            const item = {
                id: `id:em${status.length}`,
                value: event.target.value,
                label: event.target.value,
                isVisible: true,

                title: event.target.value,
                background_color: 'emphasis-08',
                text_color: 'emphasis-08',
                icon: 'emphasis-medium'
            }
            let itm = {...item}
            itm.id = 0;
            addOrUpdateStatus(itm).then(x => {
                item.id = x.id;
                setStatus(prevState => [...prevState, item]);
            });
        }

        const handleDeleteStatusItem = (item) => {
            const newStatus = status.filter(statusItem => item.id !== statusItem.id);
            setStatus(newStatus);
            deleteStatus(item.id);
        }

        const handleStatusTextBoxBlur = (event, item) => {
            let newStatus = [...status];
            const index = newStatus.indexOf(item);
            newStatus[index].value = event.target.value;
            newStatus[index].label = event.target.value;
            newStatus[index].isChecked = event.target.checked;
            newStatus[index].title = event.target.value;
            setStatus(newStatus);
            addOrUpdateStatus(item);
        }

        const handleStatusVisibilityChange = (visibility, item) => {
            let newStatus = [...status];
            const index = newStatus.indexOf(item);
            newStatus[index].isVisible = visibility;
            newStatus[index].visibility = newStatus[index].isVisible;
            setStatus(newStatus);
            addOrUpdateStatus(item);
        }

        const handleStatusColorChange = (event, item) => {
            let newStatus = [...status];
            const index = newStatus.indexOf(item);
            newStatus[index].color = {background: event.target.value + '-invert', icon: event.target.value};
            newStatus[index].background_color = newStatus[index].color.background;
            newStatus[index].icon = newStatus[index].color.icon;
            setStatus(newStatus);
            addOrUpdateStatus(item);
        }

        const handleStatusCheckBoxChange = (event, item) => {
            if (focusedTaskIndex.current === -1)
                return;

            //Make status list check the chosen one
            let newStatus = [...status];
            const index = newStatus.indexOf(item);
            newStatus.forEach((item) => item.isChecked = false);
            newStatus[index].isChecked = event.target.checked;
            setStatus(newStatus);

            //Apply change of status for the current task in server
            let t = {...tasks[focusedTaskIndex.current]};
            if (t) {
                t.status_id = item.id;
                addOrUpdateTask(t);
            }
        }

        //----------------------------------------------------------------------------- Tag
        const handleTagDoneClick = (event) => {
            setTagReadOnly(true);
        }

        const handleTagEditClick = (event) => {
            setTagReadOnly(false);
        }

        const handleSubmitTagItem = (event) => {
            const item = {
                id: `id:em${status.length}`,
                value: event.target.value,
                label: event.target.value,
                isVisible: true,

                title: event.target.value,
                background_color: 'emphasis-08',
                text_color: 'emphasis-08',
                icon: 'emphasis-medium'
            }
            let itm = {...item}
            itm.id = 0;
            addOrUpdateTag(itm).then(x => {
                item.id = x.id;
                setTag(prevState => [...prevState, item]);
            });
        }

        const handleDeleteTagItem = (item) => {
            const newTag = tag.filter(tagItem => item.id !== tagItem.id);
            setTag(newTag);
            deleteTag(item.id);
        }

        const handleTagTextBoxBlur = (event, item) => {
            let newTag = [...tag];
            const index = newTag.indexOf(item);
            newTag[index].value = event.target.value;
            newTag[index].label = event.target.value;
            newTag[index].isChecked = event.target.checked;
            newTag[index].title = event.target.value;
            setTag(newTag);
            addOrUpdateTag(item);
        }

        const handleTagVisibilityChange = (visibility, item) => {
            let newTag = [...tag];
            const index = newTag.indexOf(item);
            newTag[index].isVisible = visibility;
            newTag[index].visibility = newTag[index].isVisible;
            setTag(newTag);
            addOrUpdateTag(item);
        }

        const handleTagColorChange = (event, item) => {
            let newTag = [...tag];
            const index = newTag.indexOf(item);
            newTag[index].color = {background: event.target.value + '-invert', icon: event.target.value};
            newTag[index].background_color = newTag[index].color.background;
            newTag[index].icon = newTag[index].color.icon;
            setTag(newTag);
            addOrUpdateTag(item);
        }

        //Apply selected tags for the task
        const handleTagOutClick = (event) => {
            if (focusedTaskIndex.current === -1)
                return;
            let i, j;
            let t = {...tasks[focusedTaskIndex.current]};
            if (t) {
                t.tags = [];
                for (i = 0; i < tagsSelected.current.length; i++)
                    t.tags.push({...tagsSelected.current[i]});
                addOrUpdateTask(t);
            }
        }

        //----------------------------------------------------------------------------- Due date
        const handleDueDateChange = (date) => {
            if (focusedTaskIndex.current === -1)
                return;
            let t = {...rows[focusedTaskIndex.current]};
            if (t) {
                t.due_date = date;
                setShowAddedTask(false);
                addOrUpdateTask(t);
            }
        }

        const handleResetDueDate = (date) => {
            if (focusedTaskIndex.current === -1)
                return;

            let t = {...tasks[focusedTaskIndex.current]};
            if (t) {
                t.due_date = null;
                addOrUpdateTask(t);
                setShowAddedTask(false);
            }
        }

        const calcIndent = (rowInfo.has_child || rowInfo.parent_id === 0) ? rowInfo.indent : rowInfo.indent + 1;

        return (<div className="rowBlock">

            {/* Title */}
            <Cell e={e} isSelected={isSelected} indent={calcIndent} isReadOnly={!isFocusRow}>
                <ExpandButton slot={Cell.icon} rowInfo={rowInfo} onClick={handleTreeClick}/>
                <Text slot={Cell.text} isTruncated>{rowInfo.title}</Text>
                <EditBox slot={Cell.editBox} value={rowInfo.title} onBlur={handleSubmitTitle}/>
            </Cell>

            {/* Priority */}
            <Cell e={e}>
                <Text slot={Cell.text} isTruncated>{rowInfo.priority}</Text>
            </Cell>

            {/* Status */}
            <Cell
                onDoubleClick={() => handleDoubleClick('status')}
                className='cell-status'
                e={e}
                isReadOnly={cellIndex !== 'status'}
                backgroundColor={rowInfo.status_bg_color}
            >
                <Text slot={Cell.text} isTruncated>{rowInfo.status}</Text>
                <AddPopup
                    isReadOnly={isStatusReadOnly}
                    slot={Cell.editBox}
                    onSubmit={handleSubmitStatusItem}
                    onDoneClick={handleStatusDoneClick}
                    onEditClick={handleStatusEditClick}
                >
                    {status.map(item => {
                        return (<AddPopup.Item
                            key={item.id}
                            slot={item.isVisible ? AddPopup.visible : AddPopup.invisible}
                            item={item}
                            color={item.color}
                            value={item.value}
                            isVisible={item.isVisible}
                            isChecked={item.value === rowInfo.status}
                            isReadOnly={isStatusReadOnly}
                            onCheckBoxChange={handleStatusCheckBoxChange}
                            onTextBoxBlur={handleStatusTextBoxBlur}
                            onDelete={handleDeleteStatusItem}
                            onVisibilityChange={handleStatusVisibilityChange}
                            onColorChange={handleStatusColorChange}
                        >
                            {item.label}
                        </AddPopup.Item>)
                    })}
                </AddPopup>
            </Cell>

            {/* Project */}
            <Cell e={e}>
                <Text slot={Cell.text} isTruncated>{rowInfo.project}</Text>
            </Cell>

            {/* Tag */}
            <Cell
                onDoubleClick={() => {
                    tagsSelected.current = rowInfo.tags;
                    handleDoubleClick('tag');
                }}
                className='cell-status'
                e={e}
                isReadOnly={cellIndex !== 'tag'}
            >
                <Text slot={Cell.text} isTruncated>
                    <MultiSelectedResult>
                        {rowInfo.tags.map(tag => (
                            <MultiSelectedResult.Item>{tag.title}</MultiSelectedResult.Item>
                        ))}
                    </MultiSelectedResult>
                </Text>
                <AddPopup
                    isReadOnly={isTagReadOnly}
                    slot={Cell.editBox}
                    onSubmit={handleSubmitTagItem}
                    outClick={handleTagOutClick}
                    onDoneClick={handleTagDoneClick}
                    onEditClick={handleTagEditClick}
                >
                    {tag.map(item => {
                        return (
                            <AddPopup.Item
                                key={item.id}
                                slot={item.isVisible ? AddPopup.visible : AddPopup.invisible}
                                item={item}
                                color={item.color}
                                value={item.value}
                                isVisible={item.isVisible}
                                isChecked={itemIsInArray(rowInfo.tags, item)}
                                isReadOnly={isTagReadOnly}
                                onCheckBoxChange={handleTagCheckBoxChange}
                                onTextBoxBlur={handleTagTextBoxBlur}
                                onDelete={handleDeleteTagItem}
                                onVisibilityChange={handleTagVisibilityChange}
                                onColorChange={handleTagColorChange}
                                isMultiSelected
                            >
                                {item.label}
                            </AddPopup.Item>
                        )
                    })}
                </AddPopup>
            </Cell>

            {/* Estimation */}
            <Cell e={e} value={rowInfo.estimation} indent={0} isReadOnly={!(isFocusRow && isSelected)}>
                <Text slot={Cell.text} isTruncated>{(isFocusRow && isSelected) ? '' : rowInfo.estimation}</Text>
                <EditBox slot={Cell.editBox} value={(isFocusRow && isSelected) ? '' : rowInfo.estimation} onBlur={handleChangeEstimation}/>
            </Cell>

            {/* Due Date */}
            <Cell e={e}>
                <Text slot={Cell.text} isTruncated>
                    {rowInfo.due_date ? dateFormatter(rowInfo.due_date, dateOption) : ''}
                </Text>
                <DatePicker defaultDate={rowInfo.due_date} slot={Cell.editBox} onChange={handleDueDateChange} onReset={handleResetDueDate}/>
            </Cell>
        </div>)
    }

    return (<VirtualGridProvider
        ref={virtualTreeViewRef}
        // Events:
        Row={Row}
        onColWidth={handleColWidth}
        onClick={handleTreeClick}
        onAddRow={handleAddRow}
        onRowCount={handleOnRowCount}
        onDelete={handleOnDelete}
        //Variables:
        headers={['title', 'priority', 'status', 'project', 'tag', 'estimation', 'due date']}
        cellHeight={utils.cellHeight}
        fixCellWidth={utils.fixCellWidth}
        fixRows={utils.fixRows}
        fixColumns={utils.fixColumns}
        isTree={true}
    />);
}

export default memo(TreeComponent);

function ExpandButton({onClick, rowInfo}) {

    const handleExpandClick = (event) => {
        onClick(event);
    }
    const handleDoubleClick = (event) => {
        event.stopPropagation();
    }

    return (
        rowInfo.has_child ?
            <div className="cell-icon" onClick={handleExpandClick} onDoubleClick={handleDoubleClick}>
                {!rowInfo.expanded ? <Icon as="arrow_right" variant="outlined"/> :
                    <Icon as="arrow_drop_down" variant="outlined"/>}
            </div> : ''
    )
}

function MultiSelectedResult({children, separator = ", "}) {
    const allChildren = Children.toArray(children);
    return (
        allChildren.map((child, index) => [(index > 0 && separator), child])
    )
}

MultiSelectedResult.Item = MultiSelectedResultItem;

function MultiSelectedResultItem({children, color = {text: '', background: ''}}) {
    const style = {
        '--multi-select-item-color-background': `var(--color-${color.background || 'transparent'})`,
        '--multi-select-item-color-text': `var(--color-${color.text || 'emphasis-high'})`
    }
    return (
        <span style={style} className="multi-selected-result-item">{children}</span>
    )
}

// ---------------------------------------------- Helpers
//Check if a value exist in an array of multi select object like tags
const itemIsInArray = (arr, item) => {
    const resultArray = arr.filter((elem) => {
        return [item].some((ele) => {
            return ele.id === elem.id;
        });
    });
    return resultArray.length > 0;
}

const displayTitle = (caption, arr) => {
    console.log(caption, arr.map((item) => item.title));
}

const displayAPILog = (caption, data, status) => {
    console.log('API ', caption, data, status);
}