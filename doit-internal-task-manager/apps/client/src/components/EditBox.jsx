import {useEffect, useRef, useState} from "react";
import clsx from "clsx";

export default EditBox;

function EditBox(
    {
        value = "",
        placeholder = "",
        onChange = () => undefined,
        onBlur = () => undefined,
        onFocus = () => undefined,
        isVisible = true,
        className,
    }) {

    const textBoxRef = useRef(null);
    const [inputValue, setInputValue] = useState(value);

    const handleChange = (event) => {
        onChange(event)
        setInputValue(event.target.value);
    }

    const handleFocus = (event) => {
        event.preventDefault();
        onFocus(event);
    }

    const handleBlur = (event) => {
        onBlur(event);
        setInputValue(event.target.value)
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            textBoxRef.current.blur();
        }
    }

    useEffect(() => {
        setInputValue(value);

        window.addEventListener('keypress', handleKeyPress)
        return () => {
            window.removeEventListener('keypress', handleKeyPress)
        }
    }, [value])

    useEffect(() => {
        let timer = null;
        const element = textBoxRef.current;
        timer = setTimeout(() => {
            element.focus();
        }, 1)

        return () => {
            clearTimeout(timer);
        }
    }, [isVisible])

    const classNames = clsx(className, 'edit-box', 'body-500', {'is-visible': isVisible})

    return (
        <input
            ref={textBoxRef}
            className={classNames}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
        />
    )
}