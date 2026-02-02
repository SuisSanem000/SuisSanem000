import TextBox from "sparrow/src/components/TextBox.jsx";
import {useEffect, useState, Children, forwardRef} from "react";
import {Button, Caption} from "sparrow/src/components/index.jsx";
import Icon from "sparrow/src/components/Icon.jsx";
import useToggle from "sparrow/src/hooks/useToggle.jsx";
import Text from "sparrow/src/components/Text.jsx";
import clsx from "clsx";
import useOutClick from "sparrow/src/hooks/useOutClick.jsx";
import Slot from "sparrow/src/components/Slot.jsx";


const ColumnsManager = forwardRef(
    function (
        {
            className,
            children,
            isVisible = false,
            outClick = () => undefined
        },
        ref
    ) {
        const invisibleItems = (Children.toArray(children).filter(child => child.props.slot === 2));
        const visibleItems = (Children.toArray(children).filter(child => child.props.slot === 1));

        const parentRef = useOutClick(() => {
            outClick();
        }, ref)

        const classNames = clsx(className, 'columns-manager', {'is-visible': isVisible});
        return (
            <div className={classNames} ref={parentRef}>
                <div className="visible-items">
                    {visibleItems}
                </div>
                {
                    invisibleItems.length !== 0 && (
                        <div className="invisible-items">
                            <Caption><Text slot={Caption.text}>Invisible</Text></Caption>
                            {invisibleItems}
                        </div>
                    )
                }
            </div>
        )
    })

ColumnsManager.Item = EditBox;
ColumnsManager.visible = 1;
ColumnsManager.invisible = 2;

export default ColumnsManager;

function EditBox(
    {
        item,
        value = '',
        onChange = () => undefined,
        isReadOnly = false,
        isFilterDisabled,
        isSortDisabled,
        isVisibilityDisabled,
        isDNDDisabled,
        isVisible = true,
        onVisibilityClick = () => undefined,
        onSortClick = () => undefined,
        onFilterClick = () => undefined,
        // onDragAndDrop = () => undefined
    }
) {
    const [inputValue, setInputValue] = useState(value);

    const handleChange = (event) => {
        onChange(event, item);
        setInputValue(event.target.value)
    }

    useEffect(() => {
        setInputValue(value);
    }, [value])

    // const handleDragAndDrop = (event) => {
    //     event.stopPropagation();
    // }

    const handleSort = (event) => {
        event.stopPropagation();
        onSortClick(event, item);
    }

    const handleFilter = (event) => {
        event.stopPropagation();
        onFilterClick(event, item);
    }

    const handleVisibility = (event, isVisible) => {
        event.stopPropagation();
        onVisibilityClick(isVisible, item);
    }

    return (
        <TextBox
            className='cm-item body-600'
            type="text" value={inputValue}
            onChange={handleChange}
            hasCancel={false}
            isReadOnly={isReadOnly}
        >
            <div slot={TextBox.buttonStart} data-draggable="true">
                <Button slot={TextBox.buttonStart} variant="ghost" className="cm-button drag-handler" isDisabled={isDNDDisabled}>
                    <Icon slot={Button.iconStart} as="drag_indicator" variant="outlined"/>
                </Button>
            </div>

            <div className="cm-button-stack" slot={TextBox.buttonEnd}>
                <Button onClick={handleFilter} className="cm-button" variant="ghost" isDisabled={isFilterDisabled}>
                    <Icon slot={Button.iconStart} as="filter_alt"/>
                </Button>

                <Button onClick={handleSort} className="cm-button" variant="ghost" isDisabled={isSortDisabled}>
                    <Icon slot={Button.iconStart} as="sort"/>
                </Button>

                <VisibilityButton isVisible={isVisible} onClick={handleVisibility} isDisabled={isVisibilityDisabled}/>
            </div>
        </TextBox>
    )
}

function VisibilityButton({isVisible = true, onClick = () => undefined, isDisabled}) {
    const [visible, setVisible] = useToggle(isVisible);

    const handleVisibility = (event) => {
        event.stopPropagation();
        setVisible(null);
        onClick(event, !visible);
    }

    return (
        <Button onClick={handleVisibility} className="cm-button" variant="ghost" isDisabled={isDisabled}>
            {
                visible
                    ? <Icon slot={Button.iconStart} as="visibility_off" variant="round"/>
                    : <Icon slot={Button.iconStart} as="visibility" variant="round"/>
            }
        </Button>
    )
}