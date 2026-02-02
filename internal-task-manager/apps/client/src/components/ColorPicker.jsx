import {forwardRef, useEffect, useState} from "react";
import clsx from "clsx";
import SegmentControl from "sparrow/src/components/SegmentControl.jsx";
import Icon from "sparrow/src/components/Icon.jsx";
import useOutClick from "sparrow/src/hooks/useOutClick.jsx";


const ColorPicker = forwardRef(
    function ColorPicker({className, children, isVisible = false, outClick = () => undefined}, ref) {
        const [visible, setVisible] = useState(isVisible);

        useEffect(() => {
            setVisible(isVisible);
        }, [isVisible])

        const colorPickerRef = useOutClick(() => {
            outClick();
        }, ref)

        const classNames = clsx(className, 'color-picker', {'is-visible': visible});
        return (
            <div ref={colorPickerRef} className={classNames}>
                <SegmentControl>
                    {children}
                </SegmentControl>
            </div>
        )
    }
)

function ColorPickerItem({item, isActive = false, value = '', name = '', onChange = () => undefined}) {
    const handleChange = (event) => {
        onChange(event, item);
    }
    const style = {'--color-picker-color': `var(--color-${value})`}

    return (
        <SegmentControl.Button
            className="color-item"
            value={value}
            name={name}
            onChange={handleChange}
            isActive={isActive}
        >
            <Icon style={style} slot={SegmentControl.Button.icon} as="circle" variant="round"/>
        </SegmentControl.Button>
    )
}

ColorPicker.Item = ColorPickerItem;

export default ColorPicker;