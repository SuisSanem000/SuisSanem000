import FilterPopup from "../components/FilterPopup.jsx";
import {useContext, useState} from "react";
import {StatusContext} from "../pages/AppDataProvider.jsx";

export default FilterPopupTemp

function FilterPopupTemp() {
    const [status, setStatus] = useContext(StatusContext);
    const [assign, setAssign] = useState([
        {
            id: 'ab',
            value: 'B',
            color: {text: 'blue', icon: 'blue'},
            isVisible: true,
        },
        {
            id: 'am',
            value: 'M',
            color: {text: 'pink', icon: 'pink'},
            isVisible: true,
        },
        {
            id: 'at',
            value: 'T',
            color: {text: 'red', icon: 'red'},
            isVisible: true,
        },
        {
            id: 'fs',
            value: 'F',
            color: {text: 'orange', icon: 'orange'},
            isVisible: true,
        },
        {
            id: 'as',
            value: 'S',
            color: {text: 'green', icon: 'green'},
            isVisible: true,
        },
        {
            id: 'aba',
            value: 'BA',
            color: {text: 'bermuda', icon: 'bermuda'},
            isVisible: false,
        },
        {
            id: 'ana',
            value: 'NA',
            color: {text: 'purple', icon: 'purple'},
            isVisible: false,
        },
    ])
    // const [status, setStatus] = useState([
    //     {
    //         value: 'No Status',
    //         color: {background: 'emphasis-08', icon: 'emphasis-medium'},
    //         id: 'sn',
    //         isVisible: true,
    //     },
    //     {
    //         value: 'Todo',
    //         color: {background: 'orange-invert', icon: 'orange'},
    //         id: 'st',
    //         isVisible: true,
    //     },
    //     {
    //         value: 'In Progress',
    //         color: {background: 'blue-invert', icon: 'blue'},
    //         id: 'si',
    //         isVisible: true,
    //     },
    //     {
    //         value: 'Review',
    //         color: {background: 'purple-invert', icon: 'purple'},
    //         id: 'sr',
    //         isVisible: true,
    //     },
    //     {
    //         value: 'Done',
    //         color: {background: 'green-invert', icon: 'green'},
    //         id: 'sd',
    //         isVisible: true,
    //     },
    //     {
    //         value: 'Blocked',
    //         color: {background: 'red-invert', icon: 'red'},
    //         id: 'bb',
    //         isVisible: false,
    //     },
    // ])

    const [stringValue, setStringValue] = useState('');
    const [numericValue, setNumericValue] = useState('');
    const [assignSelected, setAssignSelected] = useState([]);
    const [statusSelected, setStatusSelected] = useState([]);
    const [singleSelected, setSingleSelected] = useState('');

    const handleClearString = () => {
        setStringValue('');
    }
    const handleClearNumber = () => {
        setNumericValue('');
    }
    const handleClearAssign = () => {
        setAssignSelected([]);
    }
    const handleClearStatus = () => {
        setStatusSelected([])
    }
    const handleClearSingle = () => {
        setSingleSelected('');
    }

    const handleStringSubmit = (event) => {
        setStringValue(event.target.value);
    }
    const handleNumericSubmit = (event) => {
        setNumericValue(event.target.value);
    }

    const handleAssignMultiSelectedChange = (event) => {
        if (assignSelected.indexOf(event.target.value) === -1) {
            setAssignSelected(prevState => [...prevState, event.target.value])
        } else {
            setAssignSelected(assignSelected.filter(item => item !== event.target.value))
        }
    }

    const handleStatusMultiSelectedChange = (event) => {
        if (statusSelected.indexOf(event.target.value) === -1) {
            setStatusSelected(prevState => [...prevState, event.target.value])
        } else {
            setStatusSelected(statusSelected.filter(item => item !== event.target.value))
        }
    }

    const handleSingleSelect = (event) => {
        setSingleSelected(event.target.value);
    }

    const handleFilterButtonClick = (event) => {
        console.log(event.target.value);
    }

    return (
        <>
            {/*  Filter/Empty: String */}
            <FilterPopup
                value={stringValue}
                onSubmit={handleStringSubmit}
                onClearClick={handleClearString}
                isFiltered={stringValue}
            >
                <FilterPopup.Header slot={FilterPopup.header}>
                    <FilterPopup.Button value="Not Equals" onClick={handleFilterButtonClick} isActive>{"≠"}</FilterPopup.Button>
                    <FilterPopup.Button value="Equals" onClick={handleFilterButtonClick}>{"="}</FilterPopup.Button>
                </FilterPopup.Header>
            </FilterPopup>

              {/*Filter/Empty: Single Select*/}
            <FilterPopup onClearClick={handleClearSingle} isFiltered={singleSelected !== ''}>
                <FilterPopup.Header slot={FilterPopup.header}/>
                <FilterPopup.Item onChange={handleSingleSelect} value="true" isChecked={singleSelected === 'true'}>True</FilterPopup.Item>
                <FilterPopup.Item onChange={handleSingleSelect} value="false" isChecked={singleSelected === 'false'}>False</FilterPopup.Item>
            </FilterPopup>

            {/*  Filter/Empty: Multi Select */}
            <FilterPopup onClearClick={handleClearAssign} isFiltered={assignSelected.length !== 0}>
                <FilterPopup.Header slot={FilterPopup.header}>
                    <FilterPopup.Button value="Not Equals" isActive>{"≠"}</FilterPopup.Button>
                    <FilterPopup.Button value="Equals">{"="}</FilterPopup.Button>
                </FilterPopup.Header>

                {assign.map(item => (
                        <FilterPopup.Item
                            key={item.id}
                            color={item.color}
                            value={item.value}
                            onChange={handleAssignMultiSelectedChange}
                            isMultiSelected
                            isChecked={assignSelected.indexOf(item.value) !== -1}
                        >
                            {item.value}
                        </FilterPopup.Item>
                    )
                )}
            </FilterPopup>

            {/*  Filter/Empty: Multi Select */}
            <FilterPopup onClearClick={handleClearStatus} isFiltered={statusSelected.length !== 0}>
                <FilterPopup.Header slot={FilterPopup.header}>
                    <FilterPopup.Button value="Not Equals" isActive>{"≠"}</FilterPopup.Button>
                    <FilterPopup.Button value="Equals">{"="}</FilterPopup.Button>
                </FilterPopup.Header>

                {status.map(item => {
                    return (
                        <FilterPopup.Item
                            key={item.id}
                            color={item.color}
                            value={item.value}
                            onChange={handleStatusMultiSelectedChange}
                            isMultiSelected
                            isChecked={statusSelected.indexOf(item.value) !== -1}
                        >
                            {item.value}
                        </FilterPopup.Item>
                    )
                })}
            </FilterPopup>

            {/*  Filter/Empty: Number */}
            <FilterPopup value={numericValue} onSubmit={handleNumericSubmit} onClearClick={handleClearNumber} isFiltered={numericValue}>
                <FilterPopup.Header slot={FilterPopup.header}>
                    <FilterPopup.Button value="Less than" isActive>{"<"}</FilterPopup.Button>
                    <FilterPopup.Button value="Equals">{"="}</FilterPopup.Button>
                    <FilterPopup.Button value="Greater than">{">"}</FilterPopup.Button>
                </FilterPopup.Header>
            </FilterPopup>
        </>
    )
}