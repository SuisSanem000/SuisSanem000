import React from "react";

const useForceReRendering = () => {
    const [tmp, setTmp] = React.useState(0);
    return () => setTmp(tmp => tmp + 1);
}

export default useForceReRendering;