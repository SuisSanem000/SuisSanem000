/// <reference types="vite/client" />

declare module '*.svg' {
    import {TSvgSvgElement} from "tiny/tiny-svg";
    const content: TSvgSvgElement
    export default content
}

declare module '*?worker' {
    const workerConstructor: {
        new (): Worker
    }
    export default workerConstructor
}
