import {useLayoutEffect, useState} from "react";

//Notify window frame size change
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState([0, 0]);

    const updateWindowSize = () => {
        setWindowSize([window.innerWidth, window.innerHeight]);
    }

    //Synchronously update before dom repaint
    useLayoutEffect(() => {
        window.addEventListener('resize', updateWindowSize);
        updateWindowSize();
        return () => window.removeEventListener('resize', updateWindowSize);
    }, [])
    return [windowSize[0], windowSize[1]]
}

export default useWindowSize;