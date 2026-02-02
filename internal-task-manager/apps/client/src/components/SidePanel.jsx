import {useContext, useEffect, useRef, useState} from "react";
import {ContextMenuContext, SelectedSidebarItemContext} from "../pages/AppDataProvider.jsx";
import {PrivatePanelContext, WorkspacePanelContext, DefaultPanelContext} from "../pages/AppDataProvider.jsx";
import {ReactComponent as DOITLogo} from "../assets/doit_logo_20px.svg";
import Text from "sparrow/src/components/Text.jsx";
import {Caption, ContextMenu, Icon, Sidebar} from "sparrow/src/components";

export default SidePanel;

function SidePanel() {
    return (
        <aside className="side-panel">
            <DOITBrand/>
            <DefaultPanel/>
            <WorkspacePanel/>
            <PrivatePanel/>
        </aside>
    )
}

function DOITBrand() {
    return (
        <div className="doit-brand">
            <DOITLogo/>
            <Text className="subtitle-600">DOIT</Text>
        </div>
    )
}

function PrivatePanel() {
    const {privatePanelItems, setPrivatePanelItems} = useContext(PrivatePanelContext);
    const [selectedItem, setSelectedItem] = useContext(SelectedSidebarItemContext);
    const [details, setDetails] = useContext(ContextMenuContext);

    const handleSidebarItemClick = (event, item) => {
        setSelectedItem(item)
    }

    const handleSidebarItemRightClick = (event, item) => {
        setDetails({
            item: item,
            name: 'private',
            position: {x: event.clientX, y: event.clientY},
        })
    }

    const handleContextMenuOutClick = () => {
        setDetails(prevState => ({
            item: {id: '', label: prevState.item.label, tasksNumber: prevState.item.tasksNumber},
            name: '',
            position: prevState.position
        }))
    }

    const onCaptionButtonClick = () => {
        console.log('Caption Button Clicked!');
    }

    const handleRenameSubmit = (event, item) => {
        console.log(item);
        const newPanelItems = privatePanelItems;
        const index = privatePanelItems.indexOf(item);
        newPanelItems[index].label = event.target.value;
        newPanelItems[index].isReadOnly = false;

        setPrivatePanelItems([...newPanelItems]);
    }

    return (
        <Sidebar className="sidebar-group private">
            <Caption className="sidebar-caption">
                <Text slot={Caption.text}>Private</Text>
                <Caption.Button onClick={onCaptionButtonClick}>
                    <Icon as="add" slot={Caption.Button.icon}/>
                </Caption.Button>
            </Caption>

            {privatePanelItems.map(item => (
                <Sidebar.Item
                    key={item.id}
                    value={item}
                    onClick={handleSidebarItemClick}
                    onContextMenu={handleSidebarItemRightClick}
                    isSelected={item.id === selectedItem.id}
                    className={(details.item === item) && 'is-active'}
                >
                    <div slot={Sidebar.text}>
                        {!item.isReadOnly
                            ? <Text className="sidebar-text" isTruncated>{item.label}</Text>
                            : <EditBox item={item} value={item.label} onSubmit={handleRenameSubmit}/>
                        }{"    "}
                        {item.tasksNumber && item.isReadOnly ? <Text className="sidebar-number">{item.tasksNumber}</Text> : undefined}
                    </div>
                </Sidebar.Item>
            ))}

            <PrivateContextMenu
                sidebarItem={details.item}
                position={details.position}
                isVisible={details.name === 'private'}
                outClick={handleContextMenuOutClick}
            />
        </Sidebar>
    )
}

function EditBox({item, value = '', onChange = () => undefined, onSubmit = () => undefined}) {
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState(value)

    const handleChange = (event) => {
        setInputValue(event.target.value);
        onChange(event, item);
    }
    useEffect(() => {
        setInputValue(value);
    }, [value])

    const handleKeydown = (event) => {
        if (event.key === 'Enter') {
            inputRef.current.blur();
        }
    }

    const handleSubmit = (event) => {
        onSubmit(event, item)
    }

    useEffect(() => {
        inputRef.current.focus();
        inputRef.current.select();
        const inputDOM = inputRef.current;

        inputDOM.addEventListener('keydown', handleKeydown);
        return () => {
            inputDOM.removeEventListener('keydown', handleKeydown);
        }
    }, [])

    return (
        <label className="edit-box">
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleSubmit}
            />
        </label>
    )
}

function WorkspacePanel() {
    const {workspacePanelItems, setWorkspacePanelItems} = useContext(WorkspacePanelContext);
    const [selectedItem, setSelectedItem] = useContext(SelectedSidebarItemContext);
    const [details, setDetails] = useContext(ContextMenuContext);

    const handleSidebarItemClick = (event, item) => {
        setSelectedItem(item)
    }

    const handleSidebarItemRightClick = (event, item) => {
        setDetails({
            item: item,
            name: 'default',
            position: {x: event.clientX, y: event.clientY}
        })
    }

    const handleContextMenuOutClick = () => {
        setDetails(prevState => ({
            item: {id: '', label: prevState.item.label, tasksNumber: prevState.item.tasksNumber},
            name: '',
            position: prevState.position
        }))
    }

    return (
        <Sidebar className="sidebar-group workspace">
            <Caption className="sidebar-caption"><Text slot={Caption.text}>Workspace</Text></Caption>
            {workspacePanelItems.map(item => (
                <Sidebar.Item
                    key={item.id}
                    value={item}
                    onClick={handleSidebarItemClick}
                    onContextMenu={handleSidebarItemRightClick}
                    isSelected={item.id === selectedItem.id}
                    className={(details.item === item) && 'is-active'}
                >
                    <div slot={Sidebar.text}>
                        <Text className="sidebar-text">{item.label}</Text>{"    "}
                        {item.tasksNumber ? <Text className="sidebar-number">{item.tasksNumber}</Text> : undefined}
                    </div>
                </Sidebar.Item>
            ))}

            <DefaultContextMenu
                sidebarItem={details.item}
                position={details.position}
                isVisible={details.name === 'default'}
                outClick={handleContextMenuOutClick}
            />
        </Sidebar>
    )
}

function DefaultPanel() {
    const {defaultPanelItems, setDefaultPanelItems} = useContext(DefaultPanelContext);
    const [selectedItem, setSelectedItem] = useContext(SelectedSidebarItemContext);
    const [details, setDetails] = useContext(ContextMenuContext);

    const handleSidebarItemClick = (event, item) => {
        setSelectedItem(item)
    }

    useEffect(() => {
        setSelectedItem(defaultPanelItems[0]);
    }, [])

    const handleSidebarItemRightClick = (event, item) => {
        setDetails({
            item: item,
            name: 'default',
            position: {x: event.clientX, y: event.clientY}
        })
    }

    const handleContextMenuOutClick = () => {
        setDetails(prevState => ({
            item: {id: '', label: prevState.item.label, tasksNumber: prevState.item.tasksNumber},
            name: '',
            position: prevState.position
        }))
    }

    return (
        <Sidebar className="sidebar-group">
            {defaultPanelItems.map(item => (
                <Sidebar.Item
                    key={item.id}
                    value={item}
                    onClick={handleSidebarItemClick}
                    onContextMenu={handleSidebarItemRightClick}
                    isSelected={item.id === selectedItem.id}
                    className={(details.item === item) && 'is-active'}
                >
                    <div slot={Sidebar.text}>
                        <Text className="sidebar-text">{item.label}</Text>{"    "}
                        {item.tasksNumber ? <Text className="sidebar-number">{item.tasksNumber}</Text> : undefined}
                    </div>
                </Sidebar.Item>
            ))}

            <DefaultContextMenu
                sidebarItem={details.item}
                position={details.position}
                isVisible={details.name === 'default'}
                outClick={handleContextMenuOutClick}
            />
        </Sidebar>
    )
}

function DefaultContextMenu({sidebarItem, position, isVisible = false, outClick = () => undefined}) {
    const contextMenuRef = useRef(null);
    const {privatePanelItems, setPrivatePanelItems} = useContext(PrivatePanelContext);

    const handleOutClick = () => {
        if (contextMenuRef.current.classList.contains('is-visible')) {
            outClick();
        }
    }

    const handleDuplicate = () => {
        let label = `${sidebarItem.label} - Copy`;
        let counter = 0;
        while (true) {
            if (counter === 0) {
                if (privatePanelItems.findIndex((item) => item.label === label) === -1)
                    break;
            } else {
                if (privatePanelItems.findIndex((item) => item.label === `${label} (${counter})`) === -1) {
                    label = `${label} (${counter})`;
                    break;
                }
            }
            counter++;
        }

        const duplicatedItem = {
            id: 'dup' + privatePanelItems.length,
            label: label,
            tasksNumber: 0,
        }
        setPrivatePanelItems(prevState => [...prevState, duplicatedItem])
    }

    return (
        <ContextMenu ref={contextMenuRef} position={position} isVisible={isVisible} outClick={handleOutClick}>
            <ContextMenu.Item onClick={handleDuplicate}>
                <Icon slot={ContextMenu.icon} as="content_copy"/>
                <Text slot={ContextMenu.text}>Duplicate</Text>
            </ContextMenu.Item>
        </ContextMenu>
    )
}

function PrivateContextMenu({sidebarItem, position, isVisible = false, outClick = () => undefined}) {
    const contextMenuRef = useRef(null);
    const {privatePanelItems, setPrivatePanelItems} = useContext(PrivatePanelContext);

    const handleOutClick = () => {
        if (contextMenuRef.current.classList.contains('is-visible')) {
            outClick();
        }
    }

    const handleDuplicate = () => {
        let label = `${sidebarItem.label} - Copy`;
        let counter = 0;
        while (true) {
            if (counter === 0) {
                if (privatePanelItems.findIndex((item) => item.label === label) === -1)
                    break;
            } else {
                if (privatePanelItems.findIndex((item) => item.label === `${label} (${counter})`) === -1) {
                    label = `${label} (${counter})`;
                    break;
                }
            }
            counter++;
        }

        const duplicatedItem = {
            id: 'dup' + privatePanelItems.length,
            label: label,
            tasksNumber: sidebarItem.tasksNumber,
            isReadOnly: false,
        }
        const newPanelItems = privatePanelItems;
        const index = privatePanelItems.findLastIndex(item => item.label.includes(sidebarItem.label));
        newPanelItems.splice(index + 1, 0, duplicatedItem);

        setPrivatePanelItems([...newPanelItems]);
        handleOutClick();
    }

    const handleRename = () => {
        const newPanelItems = privatePanelItems;
        const index = privatePanelItems.findIndex(item => item.label === sidebarItem.label);
        newPanelItems[index].isReadOnly = true;
        setPrivatePanelItems([...newPanelItems]);
        handleOutClick()
    }

    const handleDelete = () => {
        const filteredPanelItems = privatePanelItems.filter(item => item !== sidebarItem)
        setPrivatePanelItems([...filteredPanelItems])
        handleOutClick();
    }

    return (
        <ContextMenu ref={contextMenuRef} position={position} isVisible={isVisible} outClick={handleOutClick}>
            <ContextMenu.Item onClick={handleRename}>
                <Icon slot={ContextMenu.icon} as="edit"/>
                <Text slot={ContextMenu.text}>Rename</Text>
            </ContextMenu.Item>
            <ContextMenu.Item onClick={handleDuplicate}>
                <Icon slot={ContextMenu.icon} as="content_copy"/>
                <Text slot={ContextMenu.text}>Duplicate</Text>
            </ContextMenu.Item>
            <ContextMenu.Item onClick={handleDelete}>
                <Icon slot={ContextMenu.icon} as="delete" vaiant="outlined"/>
                <Text slot={ContextMenu.text}>Delete</Text>
            </ContextMenu.Item>
        </ContextMenu>
    )
}

