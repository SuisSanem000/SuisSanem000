import {TComponent, THtmlDivElement, THtmlImgElement} from "tiny";
import {TCommonControl} from "sparrow/components/Common";
import '../styles/recactus-landing.scss';
import {TText} from "sparrow/components/Text";

function generateFakeGrid(): TComponent[] {
    return Array(20).fill(undefined).map((item, index: number): TComponent => {
        const column: THtmlDivElement = new THtmlDivElement();
        column.className = 'grid-column';
        return column;
    })
}

export class ReCactusLanding extends TCommonControl<unknown, THtmlDivElement> {
    constructor() {
        super(new THtmlDivElement());
        this.classNames.push('recactus-landing');

        const hero: THtmlDivElement = new THtmlDivElement();
        hero.className = "hero";

        const logoBlack: THtmlImgElement = new THtmlImgElement();
        logoBlack.src = "/assets/images/recactus-logo-black.png";
        logoBlack.srcSet = "/assets/images/recactus-logo-black.png, /assets/images/recactus-logo-black-2x.png 2x";
        logoBlack.alt = "reCactus black logo";
        logoBlack.className = "hero-logo black";

        const logoWhite: THtmlImgElement = new THtmlImgElement();
        logoWhite.src = "/assets/images/recactus-logo-white.png";
        logoWhite.srcSet = "/assets/images/recactus-logo-white.png, /assets/images/recactus-logo-white-2x.png 2x";
        logoWhite.alt = "reCactus white logo";
        logoWhite.className = "hero-logo white";

        const text: TText<unknown> = new TText('We are what we repeatedly do. Excellence, then, is not an act, but a habit.');
        text.className = 'hero-text';

        hero.push(text, logoBlack, logoWhite);

        this.push(...generateFakeGrid());

        if (this.childrenCount > 0)
            this.children(1)!.push(hero)
    }
}