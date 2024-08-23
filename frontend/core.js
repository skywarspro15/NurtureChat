import "@material/web/all.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
let theming = await import("./libs/theming.js");
theming = theming.default;

import Menu from "./libs/menus.js";
import Html from "./libs/html.js";

theming.setTheme("Nurtura", "dark");

let wrapper = Html.qs(".wrapper");
wrapper.clear();

let menu = new Menu(wrapper);

menu.open("main");
console.log(theming);
