import {useEffect, useState, Children, cloneElement, useId} from "react";
import {Button, Caption, Divider} from "sparrow/src/components/index.jsx";
import Icon from "sparrow/src/components/Icon.jsx";
import Text from "sparrow/src/components/Text.jsx";
import SegmentControl from "sparrow/src/components/SegmentControl.jsx";
import {Radio} from "sparrow/src/components/Radio.jsx";
import Checkbox from "sparrow/src/components/Checkbox.jsx";
import TextBox from "sparrow/src/components/TextBox.jsx";
import Slot from "sparrow/src/components/Slot.jsx";
import clsx from "clsx";
import useOutClick from "sparrow/src/hooks/useOutClick.jsx";

export default FilterPopup;

function FilterPopup(
    {
        children,
        value = '',
        isVisible = true,
        isFiltered = false,
        onSubmit = () => undefined,
        onClearClick = () => undefined,
        outClick = () => undefined,
    }) {
    const [filtered, setFiltered] = useState(isFiltered);
    const [isEmpty, setEmpty] = useState(true);
    const [inputValue, setInputValue] = useState(value);
    const [visible, setVisible] = useState(isVisible);
    const id = useId();

    const handleClearClick = () => {
        onClearClick();
    }

    useEffect(() => {
        let counter = 0;
        Children.forEach(children, child => {
            if (child.type.name === 'FilterPopupItem') counter++;
        })
        setEmpty(counter === 0);
    }, [children])

    useEffect(() => {
        setFiltered(isFiltered)
        setInputValue(value);
        setVisible(isVisible);
    }, [isFiltered, value, isVisible])

    const handleTextBoxChange = (event) => {
        setInputValue(event.target.value);
    }

    const handleTextBoxBlur = (event) => {
        onSubmit(event);
    }

    const filterPopupRef = useOutClick(() => {
        if (!isVisible) return;
        outClick();
    });

    const classNames = clsx('filter-popup', {'is-visible': visible})
    const noSlotChildren = (Children.toArray(children).filter(child => !child.props.slot))

    return (
        <div ref={filterPopupRef} className={classNames}>
            <Slot id={FilterPopup.header} content={children}/>
            {isEmpty ? (
                <TextBox
                    className="filter-textbox"
                    value={inputValue}
                    onChange={handleTextBoxChange}
                    onBlur={handleTextBoxBlur}
                    hasCancel={false}
                    isReadOnly={isFiltered}
                />
            ) : (
                noSlotChildren.map(child => (
                    cloneElement(child, {
                        name: id,
                    })
                ))
            )}

            {filtered && (
                <>
                    <Divider size="large"/>

                    <Button variant="ghost" onClick={handleClearClick}>
                        <Icon slot={Button.iconStart} as="close" variant="outlined"/>
                        <Text slot={Button.text}>Clear</Text>
                    </Button>
                </>
            )}
        </div>
    )
}

FilterPopup.Item = FilterPopupItem;
FilterPopup.Header = FilterPopupHeader;
FilterPopup.Button = FilterPopupButton;
FilterPopup.header = 1;

function FilterPopupHeader({children}) {
    return (
        <div className="filter-header">
            <Caption>
                <Text slot={Caption.text} className="caption1-500">Filter by</Text>
            </Caption>
            <SegmentControl>
                {children}
            </SegmentControl>
        </div>
    )
}

function FilterPopupButton({children, value, isActive, name, onClick = () => undefined}) {
    const handleClick = (event) => {
        onClick(event)
    }
    return (
        <SegmentControl.Button onChange={handleClick} name={name || 'operator button'} value={value} isActive={isActive}>
            <Text slot={SegmentControl.Button.text}>{children}</Text>
        </SegmentControl.Button>
    )
}

function FilterPopupItem(
    {
        children,
        name = '',
        color = {},
        value = '',
        isMultiSelected = false,
        isChecked = false,
        onChange = () => undefined,
    }) {
    const handleChange = (event) => {
        onChange(event);
    }

    const style = {
        '--filter-color-background': `var(--color-${color.background || 'transparent'})`,
        '--filter-color-text': `var(--color-${color.text || 'emphasis-high'})`
    }

    return (
        <div style={style} className="filter-item body-600">
            {
                !isMultiSelected ? (
                    <Radio name={name} value={value} onChange={handleChange} isChecked={isChecked}>
                        <Text slot={Radio.label} isTruncated>{children}</Text>
                    </Radio>
                ) : (
                    <Checkbox value={value} onChange={handleChange} isChecked={isChecked}>
                        <Text slot={Checkbox.label} isTruncated>{children}</Text>
                    </Checkbox>
                )
            }
        </div>
    )
}