import "@material/web/all.js";
import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";
import { io } from "./libs/socket.io.esm.min.js";

document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
let theme = await import("./libs/theming.js");
theme = theme.default;

import Menu from "./libs/menus.js";
import Html from "./libs/html.js";
let Auth = await import("./libs/auth.js");
Auth = Auth.default;

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

(function () {
  window.alert = function () {
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
          .text(arguments[0]),
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
  };
})(window.alert);

async function attemptAuth(fData) {
  let result = await Auth.login(fData.username, fData.password);
  if (!result.error) {
    sessionStorage.setItem("sessionToken", result.token);
    localStorage.setItem("existingUser", "true");
  }
  return result;
}

let newUser = false;
let socket;
let characters = [];
if (localStorage.getItem("existingUser") === null) {
  newUser = true;
}

console.log("Is new user?", newUser);

const coreFunctions = {
  alert: (text) => {
    alert(text);
  },
  login: async (fData) => {
    return await attemptAuth(fData);
  },
  signup: async (fData) => {
    let result = await Auth.signup(fData.username, fData.password);
    if (!result.error) {
      await attemptAuth(fData);
    }
    return result;
  },
  startChat: () => {
    menu.popup("newChat");
  },
  openChat: (id) => {
    menu.popup("chat");
  },
  redirect: (page) => {
    menu.goto(page);
  },
  splashFinished: async () => {
    if (newUser) {
      menu.goto("register");
      return;
    }
    let tokenValid = await Auth.validate(
      sessionStorage.getItem("sessionToken")
    );
    if (!tokenValid) {
      menu.goto("login");
      return;
    }
    menu.goto("main");
  },
  startSocket: () => {
    socket = io({ auth: { token: sessionStorage.getItem("sessionToken") } });
    socket.on("characters", (data) => {
      characters = data;
    });
  },
  getCharacters: () => {
    return characters;
  },
};

// debug
window.coreFunctions = coreFunctions;

menu = new Menu(wrapper, coreFunctions);

menu.goto("splash");
