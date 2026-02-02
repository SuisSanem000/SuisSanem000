import {useRef, useState, useEffect, useCallback} from "react";

// Detecting scroll top
const useScrollAware = () => {
    const [scrollTop, setScrollTop] = useState(0);
    const ref = useRef();
    const animationFrame = useRef();

    // Scroll event throttling
    const onScroll = useCallback(e => {

        //Cancel previous animation in case new update arrived
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
        }

        //Perform animation before next repaint
        animationFrame.current = requestAnimationFrame(() => {
            setScrollTop(e.target.scrollTop);
        });

    }, []);

    useEffect(() => {
        const scrollContainer = ref.current;
        setScrollTop(scrollContainer.scrollTop);
        scrollContainer.addEventListener("scroll", onScroll);
        return () => scrollContainer.removeEventListener("scroll", onScroll);
    }, []);

    return [scrollTop, ref];
}

export default useScrollAware;