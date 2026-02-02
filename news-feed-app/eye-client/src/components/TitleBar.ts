import {THtmlImgElement, THtmlSectionElement} from "tiny";
import {TCaption} from "sparrow/components/Caption";
import {TText} from "sparrow/components/Text";

export class TTitleBar extends THtmlSectionElement {
    constructor() {
        super();
        this.className = "title-bar";
        const reCactusBrand = new THtmlImgElement();
        reCactusBrand.src = "/assets/icons/recactus-brand.svg";

        const eye: TText<unknown> = new TText("eye ");
        eye.className = "font-weight-700";
        const title: TText<unknown> = new TText(" · news feed for database and analytics industry");
        title.className = "body font-weight-500 title";//override the component padding??

        this.push(
            reCactusBrand,
            title.splice(0, 0, eye)
        )
    }
}