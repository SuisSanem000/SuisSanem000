import {useEffect, useRef, useState} from "react";
import Icon from "sparrow/src/components/Icon.jsx";
import clsx from "clsx";

export default DatePicker;

function DatePicker(
    {
        className,
        defaultDate,
        min = null,
        max = null,
        onChange = () => undefined,
        onReset = () => undefined,
        isDisabled = false,
        isVisible = true
    }) {
    const dataPickerRef = useRef(null);
    const previousDate = useRef(null);
    const options = [{year: 'numeric'}, {month: '2-digit'}, {day: '2-digit'}]

    const [date, setDate] = useState(() => {
        return dateFormatter(defaultDate, options, '-');
    });

    useEffect(() => {
        setDate(() => dateFormatter(defaultDate, options, '-'))
    }, [defaultDate])

    const handleChange = (event) => {
        const dateObject = new Date(event.target.value);
        const milliseconds = dateObject.getTime();
        onChange(milliseconds);
        setDate(event.target.value);
    }

    const handleResetDate = () => {
        // Manually call onChane event by reset date
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(dataPickerRef.current, '');

        const event = new Event('input', {bubbles: true});
        dataPickerRef.current.dispatchEvent(event);
        onReset();
    }

    const style = {border: 'none', outline: 'none', maxWidth: 114}
    const classNames = clsx(className, 'date-picker', 'body-500', {'is-visible': isVisible})

    return (
        <label className={classNames}>
            <input
                ref={dataPickerRef}
                style={style}
                type="date"
                name="date"
                value={date}
                onChange={handleChange}
                min={min}
                max={max}
                disabled={isDisabled}
            />
            {date && (
                <button className="date-picker-reset" onClick={handleResetDate}>
                    <Icon as="close" variant="outlined"/>
                </button>
            )}
        </label>
    )
}

function dateFormatter(date, options = [], separator = '-') {
    if (!date) return ''
    const internalDate = new Date(date);
    const format = (option) => {
        const f = new Intl.DateTimeFormat('en-US', option);
        return f.format(internalDate)
    }
    return options.map(option => format(option)).join(separator);
}