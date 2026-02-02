import {useEffect, useState, Children, cloneElement, useId, forwardRef} from "react";
import clsx from "clsx";
import Checkbox from "sparrow/src/components/Checkbox.jsx";
import {Radio} from "sparrow/src/components/Radio.jsx";
import Text from "sparrow/src/components/Text.jsx";
import {Button, Caption, Divider} from "sparrow/src/components/index.jsx";
import Icon from "sparrow/src/components/Icon.jsx";
import TextBox from "sparrow/src/components/TextBox.jsx";
import useToggle from "sparrow/src/hooks/useToggle.jsx";
import useOutClick from "sparrow/src/hooks/useOutClick.jsx";
import ColorPicker from "./ColorPicker.jsx";
import Slot from "sparrow/src/components/Slot.jsx";

const AddPopup = forwardRef(function (
    {
        children,
        isReadOnly = true,
        isVisible = true,
        onSubmit = () => undefined,
        outClick = () => undefined,
        onDoneClick = () => undefined,
        onEditClick = () => undefined,
    }, ref) {
    const [readOnly, setReadOnly] = useState(isReadOnly);
    const [shouldBeAddingItem, setShouldBeAddingItem] = useState(false);
    const [textBoxValue, setTextBoxValue] = useState('');
    const [visible, setVisible] = useState(isVisible);
    // const id = useId();

    const handleEdit = () => {
        onEditClick();
    }
    const handleDone = () => {
        setShouldBeAddingItem(false);
        onDoneClick();
    }
    const handleAddNewItem = () => {
        setShouldBeAddingItem(true)
    }

    const handleTextBoxChange = (event) => {
        setTextBoxValue(event.target.value);
    }
    const handleTextBoxBlur = (event) => {
        if (event.target.value) {
            onSubmit(event);
            setTextBoxValue('');
        } else {
            setShouldBeAddingItem(false);
        }
    }
    const handleTextBoxCancel = () => {
        setTextBoxValue('');
    }

    useEffect(() => {
        setVisible(isVisible);
    }, [isVisible])

    const AddPopupRef = useOutClick((event) => {
        if (!AddPopupRef.current.classList.contains('is-visible')) return;
        outClick();
    }, ref);

    const classNames = clsx('add-popup', {'is-visible': visible})
    const invisibleChildren = (Children.toArray(children).filter(child => child.props.slot === 2));
    const visibleChildren = (Children.toArray(children).filter(child => child.props.slot === 1));

    return (
        <div ref={AddPopupRef} className={classNames}>

            {visibleChildren}

            {!isReadOnly && (
                (Children.count(children) !== 0 && !shouldBeAddingItem) ? (
                    <Button className="add-button" variant="ghost" onClick={handleAddNewItem}>
                        <Icon slot={Button.iconStart} as="add_circle" variant="round"/>
                        <Text slot={Button.text}>Add</Text>
                    </Button>
                ) : (
                    <TextBox
                        type="text"
                        value={textBoxValue}
                        onChange={handleTextBoxChange}
                        onBlur={handleTextBoxBlur}
                        onCancel={handleTextBoxCancel}
                        isFocused={shouldBeAddingItem}
                    />
                )
            )}

            {(invisibleChildren.length !== 0 && !isReadOnly) && (
                <>
                    <Caption className="invisible-caption"><Text slot={Caption.text}>Invisibles</Text></Caption>
                    {invisibleChildren}
                </>
            )}

            <Divider size="large"/>

            {isReadOnly ? (
                <Button className="edit-button" variant="ghost" onClick={handleEdit}>
                    <Icon slot={Button.iconStart} as="more_horiz"/>
                    <Text slot={Button.text}>Edit</Text>
                </Button>
            ) : (
                <Button className="done-button" variant="ghost" onClick={handleDone} isDisabled={Children.count(children) === 0}>
                    <Icon slot={Button.iconStart} as="done"/>
                    <Text slot={Button.text}>Done</Text>
                </Button>
            )}
        </div>
    )
})

AddPopup.Item = AddPopupItem;
AddPopup.visible = 1;
AddPopup.invisible = 2;

export default AddPopup;

function AddPopupItem(
    {
        item,
        children,
        color = {},
        value = '',
        name = '',
        isMultiSelected = false,
        isChecked = false,
        isReadOnly = true,
        isVisible = true,
        onVisibilityChange = () => undefined,
        onCheckBoxChange = () => undefined,
        onTextBoxChange = () => undefined,
        onTextBoxBlur = () => undefined,
        onColorChange = () => undefined,
        onDelete = () => undefined,
    }) {

    const handleCheckBoxChange = (event) => {
        onCheckBoxChange(event, item);
    }

    const handleTextBoxChange = (event) => {
        onTextBoxChange(event, item);
    }

    const handleTextBoxBlur = (event) => {
        onTextBoxBlur(event, item);
    }

    const handleVisibilityChange = (event) => {
        onVisibilityChange(event, item);
    }

    const handleColorChange = (event) => {
        onColorChange(event, item);
    }

    const handleDelete = () => {
        onDelete(item)
    }

    const style = {
        '--add-color-background': `var(--color-${color.background || 'transparent'})`,
        '--add-color-text': `var(--color-${color.text || 'emphasis-high'})`
    }

    return (
        <>
            {
                isReadOnly ? (
                    <div style={style} className="add-item body-600">
                        {
                            !isMultiSelected ? (
                                <Radio name={name} value={value} onChange={handleCheckBoxChange} isChecked={isChecked}>
                                    <Text slot={Radio.label} isTruncated>{children}</Text>
                                </Radio>
                            ) : (
                                <Checkbox value={value} onChange={handleCheckBoxChange} isChecked={isChecked}>
                                    <Text slot={Checkbox.label} isTruncated>{children}</Text>
                                </Checkbox>
                            )
                        }
                    </div>
                ) : (
                    <EditBox
                        color={color}
                        value={children}
                        onChange={handleTextBoxChange}
                        onBlur={handleTextBoxBlur}
                        onVisibilityChange={handleVisibilityChange}
                        onColorChange={handleColorChange}
                        onDelete={handleDelete}
                        isVisible={isVisible}
                    />
                )
            }
        </>
    )
}

function EditBox(
    {
        value = '',
        color = {},
        isVisible = true,
        onChange = () => undefined,
        onBlur = () => undefined,
        onColorChange = () => undefined,
        onVisibilityChange = () => undefined,
        onDelete = () => undefined,
    }) {
    const [inputValue, setInputValue] = useState(value);

    const handleChange = (event) => {
        onChange(event);
        setInputValue(event.target.value)
    }

    const handleBlur = (event) => {
        onBlur(event);
    }

    useEffect(() => {
        setInputValue(value);
    }, [value])

    const handleVisibility = (isVisible) => {
        onVisibilityChange(isVisible);
    }

    const handleDelete = () => {
        onDelete();
    }

    const handleColorChange = (event) => {
        onColorChange(event);
    }

    const style = {
        '--edit-color-background': `var(--color-${color.background || 'emphasis-04'})`,
        '--edit-color-text': `var(--color-${color.text || 'emphasis-high'})`,
        '--edit-color-icon': `var(--color-${color.icon || 'emphasis-medium'})`,
    }

    return (
        <TextBox
            type="text"
            className='edit-item body-600'
            style={style}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            hasCancel={false}
            isFilled={false}
        >
            <div data-draggable="true" slot={TextBox.buttonStart}>
                <Button className="edit-button" variant="ghost">
                    <Icon slot={Button.iconStart} as="drag_indicator" variant="outlined"/>
                </Button>
            </div>
            <div className="edit-button-stack" slot={TextBox.buttonEnd}>
                <ColorButton color={color.icon} onChange={handleColorChange}/>

                <VisibilityButton isVisible={isVisible} onClick={handleVisibility}/>

                <Button onClick={handleDelete} className="edit-button" variant="ghost">
                    <Icon slot={Button.iconStart} as="delete_forever"/>
                </Button>
            </div>
        </TextBox>
    )
}

function ColorButton({color = 'emphasis-medium', isVisible = true, onChange = () => undefined}) {
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

    const [visible, setVisibility] = useToggle(false);

    const handleClick = (event) => {
        setVisibility(true);
    }

    const handleChangeColor = (event, item) => {
        onChange(event);
        setVisibility(false);
    }

    const handleColorPickerOutClick = () => {
        if (!isVisible) return;
        setVisibility(false);
    }

    const style = {'--edit-color-icon': `var(--color-${color})`}

    return (
        <div className="edit-button" style={style}>
            <Button onClick={handleClick} className="color-button" variant="ghost">
                <Icon slot={Button.iconStart} as="circle" variant="round"/>
            </Button>

            <ColorPicker isVisible={visible} outClick={handleColorPickerOutClick}>
                {colors.map((item) => (
                    <ColorPicker.Item
                        item={item}
                        key={item.id}
                        value={item.value}
                        onChange={handleChangeColor}
                        isActive={item.value === color}
                    />
                ))}
            </ColorPicker>
        </div>
    )
}

function VisibilityButton({isVisible = true, onClick}) {
    const [visibility, setVisibility] = useToggle(isVisible);

    const handleVisibility = () => {
        setVisibility();
        onClick(!visibility);
    }
    return (
        <Button onClick={handleVisibility} className="edit-button" variant="ghost">
            {
                visibility
                    ? <Icon slot={Button.iconStart} as="visibility_off" variant="round"/>
                    : <Icon slot={Button.iconStart} as="visibility" variant="round"/>
            }
        </Button>
    )
}