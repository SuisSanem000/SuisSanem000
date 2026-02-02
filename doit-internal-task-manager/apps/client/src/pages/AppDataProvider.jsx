import {useState, createContext, useContext, useMemo, useEffect} from "react";

export const StatusContext = createContext(null);
export const TagContext = createContext(null);

// SidePanel data context
export const DefaultPanelContext = createContext(null);
export const WorkspacePanelContext = createContext(null);
export const PrivatePanelContext = createContext(null);
export const SelectedSidebarItemContext = createContext(null);
export const ContextMenuContext = createContext(null);

export function AppDataProvider({children}) {
    return (
        <SidePanelProvider>
            <StatusDataProvider>
                <TagDataProvider>
                    {children}
                </TagDataProvider>
            </StatusDataProvider>
        </SidePanelProvider>
    )
}

function StatusDataProvider({children}) {
    const [isStatusReadOnly, setStatusReadOnly] = useState(true);
    const [status, setStatus] = useState([
        {
            value: 'No Status',
            label: 'No Status',
            color: {background: 'emphasis-08', icon: 'emphasis-medium'},
            id: 'sn',
            isVisible: true,
            position: 0,
        },
        {
            value: 'Todo',
            label: 'Todo',
            color: {background: 'orange-invert', icon: 'orange'},
            id: 'st',
            isVisible: true,
            position: 1,
        },
        {
            value: 'In Progress',
            label: 'In Progress',
            color: {background: 'blue-invert', icon: 'blue'},
            id: 'si',
            isVisible: true,
            position: 2,
        },
        {
            value: 'Review',
            label: 'Review',
            color: {background: 'purple-invert', icon: 'purple'},
            id: 'sr',
            isVisible: true,
            position: 3,
        },
        {
            value: 'Done',
            label: 'Done',
            color: {background: 'green-invert', icon: 'green'},
            id: 'sd',
            isVisible: true,
            position: 4,
        },
        {
            value: 'Blocked',
            label: 'Blocked',
            color: {background: 'red-invert', icon: 'red'},
            id: 'bb',
            isVisible: false,
            position: 5,
        },
    ])

    useEffect(() => {
        if (status.length === 0) {
            setStatusReadOnly(false)
        } else {
            setStatusReadOnly(true)
        }
    }, [])

    return (
        <StatusContext.Provider value={[status, setStatus, isStatusReadOnly, setStatusReadOnly]}>
            {children}
        </StatusContext.Provider>
    )
}

function TagDataProvider({children}) {
    const [isTagReadOnly, setTagReadOnly] = useState(true);
    const [tag, setTag] = useState([
        {
            value: 'No Tag',
            label: 'No Tag',
            color: {background: 'emphasis-08', icon: 'emphasis-medium'},
            id: 'sn',
            isVisible: true,
            position: 0
        },
        {
            value: 'Bug',
            label: 'Bug',
            color: {background: 'orange-invert', icon: 'orange'},
            id: 'st',
            isVisible: true,
            position: 1
        },
        {
            value: 'Later',
            label: 'Later',
            color: {background: 'blue-invert', icon: 'blue'},
            id: 'si',
            isVisible: true,
            position: 2
        },
        {
            value: 'Next',
            label: 'Next',
            color: {background: 'purple-invert', icon: 'purple'},
            id: 'sr',
            isVisible: true,
            position: 3
        },
    ])

    useEffect(() => {
        if (tag.length === 0) {
            setTagReadOnly(false)
        } else {
            setTagReadOnly(true)
        }
    }, [])

    return (
        <TagContext.Provider value={[tag, setTag, isTagReadOnly, setTagReadOnly]}>
            {children}
        </TagContext.Provider>
    )
}

// SidePanel data provider
function SidePanelProvider({children}) {
    return (
        <DefaultPanelProvider>
            <WorkspacePanelProvider>
                <PrivatePanelProvider>
                    <SelectedSidebarItemProvider>
                        <ContextMenuProvider>
                            {children}
                        </ContextMenuProvider>
                    </SelectedSidebarItemProvider>
                </PrivatePanelProvider>
            </WorkspacePanelProvider>
        </DefaultPanelProvider>
    )
}

function DefaultPanelProvider({children}) {
    const [defaultPanelItems, setDefaultPanelItems] = useState([
        {id: 'ibx', label: 'Inbox', tasksNumber: 5, isReadOnly: false},
        {id: 'tdy', label: 'Today', tasksNumber: 12, isReadOnly: false},
        {id: 'n7d', label: 'Next 7 Days', tasksNumber: 0, isReadOnly: false},
        {id: 'mts', label: 'My Tasks', tasksNumber: 0, isReadOnly: false},
        {id: 'lbk', label: 'Logbook', tasksNumber: 0, isReadOnly: false},
        {id: 'all', label: 'All', tasksNumber: 0, isReadOnly: false},
        {id: 'tsh', label: 'Trash', tasksNumber: 0, isReadOnly: false},
    ])

    return (
        <DefaultPanelContext.Provider value={{defaultPanelItems, setDefaultPanelItems}}>
            {children}
        </DefaultPanelContext.Provider>
    )
}

function WorkspacePanelProvider({children}) {
    const [workspacePanelItems, setWorkspacePanelItems] = useState([
        {id: 'drt', label: 'Dadroit', tasksNumber: 0, isReadOnly: false},
        {id: 'tos', label: 'TheOnes', tasksNumber: 0, isReadOnly: false},
        {id: 'rct', label: 'Recactus', tasksNumber: 0, isReadOnly: false},
        {id: 'tdb', label: 'TheDB', tasksNumber: 0, isReadOnly: false},
        {id: 'tds', label: 'TheDS', tasksNumber: 0, isReadOnly: false},
        {id: 'rce', label: 'Arcane', tasksNumber: 0, isReadOnly: false},
        {id: 'ofe', label: 'Office', tasksNumber: 0, isReadOnly: false},
    ])

    return (
        <WorkspacePanelContext.Provider value={{workspacePanelItems, setWorkspacePanelItems}}>
            {children}
        </WorkspacePanelContext.Provider>
    )
}

function PrivatePanelProvider({children}) {
    const [privatePanelItems, setPrivatePanelItems] = useState([
        {id: 'vu1', label: 'View1', tasksNumber: 0, isReadOnly: false},
        {id: 'pts', label: 'Private tasks', tasksNumber: 0, isReadOnly: false},
        {id: 'ddt', label: 'Dadroit', tasksNumber: 0, isReadOnly: false},
        {id: 'sq1', label: 'Sale Q1', tasksNumber: 0, isReadOnly: false},
        {id: 'ots', label: 'Others', tasksNumber: 0, isReadOnly: false},
    ])

    return (
        <PrivatePanelContext.Provider value={{privatePanelItems, setPrivatePanelItems}}>
            {children}
        </PrivatePanelContext.Provider>
    )
}

function SelectedSidebarItemProvider({children}) {
    const [selectedItem, setSelectedItem] = useState({});
    return (
        <SelectedSidebarItemContext.Provider value={[selectedItem, setSelectedItem]}>
            {children}
        </SelectedSidebarItemContext.Provider>
    )
}

function ContextMenuProvider({children}) {
    const [details, setDetails] = useState({});
    return (
        <ContextMenuContext.Provider value={[details, setDetails]}>
            {children}
        </ContextMenuContext.Provider>
    )
}