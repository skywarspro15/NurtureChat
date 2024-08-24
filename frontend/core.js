import "@material/web/all.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
let theme = await import("./libs/theming.js");
theme = theme.default;

import Menu from "./libs/menus.js";
import Html from "./libs/html.js";

theme.setTheme("Nurtura", "light");

// dark mode support
// if (
//   window.matchMedia &&
//   window.matchMedia("(prefers-color-scheme: dark)").matches
// ) {
//   theme.setTheme("Nurtura", "dark");
// } else {
//   theme.setTheme("Nurtura", "light");
// }
// window
//   .matchMedia("(prefers-color-scheme: dark)")
//   .addEventListener("change", (e) => {
//     const newColorScheme = e.matches ? "dark" : "light";
//     theme.setTheme("Nurtura", newColorScheme);
//   });

let wrapper = Html.qs(".wrapper");
wrapper.clear();

let menu;

const coreFunctions = {
  alert: (text) => {
    let dialog = new Html("md-dialog")
      .attr({ open: true })
      .appendMany(
        new Html("div").attr({ slot: "headline" }).text("Alert"),
        new Html("form")
          .attr({
            slot: "content",
            id: "form-id",
            method: "dialog",
          })
          .text(text),
        new Html("div")
          .attr({ slot: "actions" })
          .append(
            new Html("md-text-button").attr({ form: "form-id" }).html("OK")
          )
      )
      .on("close", () => {
        setTimeout(() => {
          dialog.cleanup();
        }, 800);
      })
      .appendTo("body");
  },
  openChat: (id) => {
    menu.popup("chat");
  },
};

// debug
window.coreFunctions = coreFunctions;

menu = new Menu(wrapper, coreFunctions);

menu.goto("main");
