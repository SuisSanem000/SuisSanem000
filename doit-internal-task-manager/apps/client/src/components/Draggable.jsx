import clsx from "clsx";
import {useEffect, useRef, useState} from "react";

export default Draggable;

function Draggable(
    {
        index,
        item,
        className,
        children,
        onPosition = () => undefined,
        onDragStart = () => undefined,
        onDragMove = () => undefined,
        onDragEnd = () => undefined,
    }) {

    /**
     * @type {React.MutableRefObject<HTMLDivElement>}
     */
    const draggable = useRef(null);
    const _isDragging = useRef(false);
    const [isDragging, setDragging] = useState(false);
    const [startPosition, setStartPosition] = useState({x: 0, y: 0});
    const [position, setPosition] = useState({x: 0, y: 0});

    const handleMouseDown = (event) => {
        let element = document.elementFromPoint(event.clientX, event.clientY);
        let found = false;
        while (element) {
            if (element.getAttribute("data-draggable") === "true") {
                found = true;
                break;
            }
            element = element.parentElement;
        }
        if (!found)
            return;

        event.target.setPointerCapture(event.pointerId);
        let bound = draggable.current.parentElement.getBoundingClientRect();
        setStartPosition({x: bound.left, y: bound.top});
        _isDragging.current = true;
        setDragging(true);
        onDragStart(event, item);
        setPosition(onPosition({x: event.clientX - bound.left, y: event.clientY - bound.top}));
    }

    const handleMouseUp = (event) => {
        event.target.releasePointerCapture(event.pointerId);
        _isDragging.current = false;
        setDragging(false);
        onDragEnd(event, item);
    }

    const handleMouseMove = (event) => {
        if (_isDragging.current) {
            // console.log(event);
            onDragMove(event, item);
            setPosition(onPosition({x: event.clientX - startPosition.x, y: event.clientY - startPosition.y}));
        }
    }

    useEffect(() => {
        let d = draggable.current;
        d.addEventListener('pointerdown', handleMouseDown);
        d.addEventListener('pointerup', handleMouseUp);
        d.addEventListener('pointermove', handleMouseMove);
        return () => {
            d.removeEventListener('pointerdown', handleMouseDown);
            d.removeEventListener('pointerup', handleMouseUp);
            d.removeEventListener('pointermove', handleMouseMove);
        }
    })

    const classNames = clsx(className, 'draggable', {'is-dragging': isDragging});
    return (
        <div style={{left: position.x, top: position.y}} className={classNames} ref={draggable} data-index={index}>
            {children}
        </div>
    )
}