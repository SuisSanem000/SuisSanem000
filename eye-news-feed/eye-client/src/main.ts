import 'sparrow/styles/main.scss';
import './styles/main.scss';

import {build, router, TComponent, THtmlScriptElement} from "tiny";
import {db} from "./Database.ts";
import {Eye} from "./components/Eye.ts";
import {ReCactusLanding} from "./components/ReCactusLanding.ts";

class App extends TComponent {
    constructor() {
        super();
        router.registerRoute("eye", "/eye", false);
        router.registerRoute("/", "/", false);
        router.addEventListener("route", () => {
            if (router.route == "404")
                return;
            if (router.route === "eye")
                this.splice(0, this.childrenCount, new Eye())
            else if (router.route === "/")
                this.splice(0, this.childrenCount, new ReCactusLanding());
        });
        setTimeout(() => {
            const ga = new THtmlScriptElement();
            ga.src = "https://www.googletagmanager.com/gtag/js?id=G-GHF87TJ5HR";
            ga.async = true;
            ga.onLoad = () => {
                //@ts-ignore
                window.dataLayer = window.dataLayer || [];

                function gtag(...args: any[]) {
                    //@ts-ignore
                    window.dataLayer.push(arguments);
                }

                gtag('js', new Date());
                gtag('config', 'G-GHF87TJ5HR');
            }
            this.push(ga);
        }, 5000);
    }
}

db.initializeDB().then(() => {
    build(document.getElementById('app')!, new App());
});
