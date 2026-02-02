import DatePicker from "../components/DatePicker.jsx";
import ColorPicker from "../components/ColorPicker.jsx";
import AddPopup from "../components/AddPopup.jsx";
import {useState} from "react";
import FilterPopupTemp from "../showcase/FilterPopupTemp.jsx";
import AddPopupTemp from "../showcase/AddPopupTemp.jsx";
import ColumnsManagerTemp from "../showcase/ColumnsManagerTemp.jsx";

export default Showcase;

function Showcase() {
    const handleDatePickerChange = (date) => {
        console.log('Date in millisecond:', date);
        console.log('isNaN:', isNaN(date));
    }

    const handleResetDate = () => {
        console.log('Reset Date');
    }

    const [color, setColor] = useState({
        icon: 'emphasis-medium',
    });

    const handleColorChange = (event) => {
        const backgroundColor = !event.target.value.includes('emphasis') ? event.target.value + '-invert' : 'emphasis-08'
        setColor({icon: event.target.value, background: backgroundColor});
    }

    const [colors, setColors] = useState([
        {id: 'cp:1', value: 'emphasis-medium', isActive: true},
        {id: 'cp:2', value: 'blue', isActive: false},
        {id: 'cp:3', value: 'bermuda', isActive: false},
        {id: 'cp:4', value: 'green', isActive: false},
        {id: 'cp:5', value: 'orange', isActive: false},
        {id: 'cp:6', value: 'red', isActive: false},
        {id: 'cp:7', value: 'pink', isActive: false},
        {id: 'cp:8', value: 'purple', isActive: false}
    ])

    const handleColorPickerChange = (event, item) => {
        const newColors = [...colors];
        const index = newColors.indexOf(item);
        newColors.forEach((item) => item.isActive = false);
        newColors[index].isActive = event.target.checked;
        console.log(newColors);
        setColors(newColors);
    }

    return (
        <div className="showcase">
            <h1 className="h1-600">Showcase!</h1>
            <main>
                <div className="group">
                    <ColorPicker isVisible>
                        {colors.map(item => (
                            <ColorPicker.Item
                                item={item}
                                key={item.id}
                                value={item.value}
                                onChange={handleColorPickerChange}
                                isActive={item.isActive}
                            />
                        ))}
                    </ColorPicker>

                    <AddPopup.Item value="Dadroit" color={color} onColorChange={handleColorChange} isReadOnly={false}>Dadroit</AddPopup.Item>
                    <AddPopup.Item value="Dadroit" isChecked>Dadroit</AddPopup.Item>
                    <AddPopup.Item value="Dadroit" isMultiSelected isChecked>Dadroit</AddPopup.Item>

                    <DatePicker defaultDate={null} onChange={handleDatePickerChange} onReset={handleResetDate}/>
                </div>

                <AddPopupTemp/>

                <FilterPopupTemp/>

                <ColumnsManagerTemp/>
            </main>
        </div>
    )
}