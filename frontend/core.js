import "@material/web/all.js";
import "@material/web/card/outlined-card.js";
import "@material/web/navigationbar/navigation-bar.js";
import "@material/web/navigationtab/navigation-tab.js";
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
let conversations = [];
if (localStorage.getItem("existingUser") === null) {
  newUser = true;
}
console.log("Is new user?", newUser);

let tabs = [
  {
    label: "Home",
    icon: "home",
    menu: "main",
  },
  {
    label: "Discover",
    icon: "explore",
    menu: "discover",
  },
];
let tabDiv;

function renderTabs() {
  wrapper.styleJs({
    height: "92%",
  });
  let body = Html.qs("body");
  tabDiv = new Html("div")
    .class("compact")
    .styleJs({
      position: "fixed",
      bottom: "0",
      left: "0",
      width: "100%",
      height: "8%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    })
    .appendTo(body);
  let navBar = new Html("md-navigation-bar")
    .attr({ "active-index": "0" })
    .styleJs({
      minHeight: "100%",
      minWidth: "100%",
      margin: "0",
      padding: "0",
    })
    .appendTo(tabDiv);
  tabs.forEach((tab, index) => {
    new Html("md-navigation-tab")
      .attr({ label: tab.label })
      .appendMany(
        new Html("md-icon").attr({ slot: "active-icon" }).text(tab.icon),
        new Html("md-icon").attr({ slot: "inactive-icon" }).text(tab.icon)
      )
      .appendTo(navBar)
      .on("click", () => {
        menu.goto(tab.menu);
      });
  });
}

function hideTabs() {
  tabDiv.styleJs({
    display: "none",
  });
  wrapper.styleJs({
    height: "100%",
  });
}

function showTabs() {
  tabDiv.styleJs({
    display: "flex",
  });
  wrapper.styleJs({
    height: "92%",
  });
}

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
    hideTabs();
    menu.popup("newChat");
  },
  openChat: (id) => {
    socket.emit("joinConversation", id);
  },
  createChat: (charId) => {
    socket.emit("createConversation", charId);
  },
  endChat: () => {
    showTabs();
    console.log("ending conversation");
    socket.emit("endConvo");
  },
  sendMessage: (message) => {
    socket.emit("send", message);
  },
  updateContext: (context) => {
    return new Promise((resolve, reject) => {
      socket.emit("updateContext", context);
      document.addEventListener("context", (e) => {
        resolve(e.detail);
      });
    });
  },
  redirect: (page) => {
    menu.goto(page);
    if (page == "main") {
      renderTabs();
    }
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
    renderTabs();
  },
  showBottomBar: () => {
    showTabs();
  },
  startSocket: () => {
    if (!socket) {
      socket = io({ auth: { token: sessionStorage.getItem("sessionToken") } });

      socket.on("characters", (data) => {
        characters = data;
      });
      socket.on("conversations", (convData) => {
        document.dispatchEvent(
          new CustomEvent("conversations", { detail: convData })
        );
        conversations = convData;
      });
      socket.on("msg", (message) => {
        document.dispatchEvent(
          new CustomEvent("characterMessage", { detail: message })
        );
      });
      socket.on("sendError", (message) => {
        document.dispatchEvent(
          new CustomEvent("sendError", { detail: message })
        );
      });
      socket.on("creationError", (msg) => {
        alert(msg);
      });
      socket.on("creationSuccess", (convId) => {
        console.log(convId);
        socket.emit("joinConversation", convId);
      });
      socket.on("conversationData", (convData) => {
        hideTabs();
        menu.popup("chat", convData);
      });
      socket.on("contextUpdate", (context) => {
        document.dispatchEvent(new CustomEvent("context", { detail: context }));
      });
    }
  },
  getCharacters: () => {
    return characters;
  },
  getConversations: () => {
    return conversations;
  },
};

// debug
window.coreFunctions = coreFunctions;

menu = new Menu(wrapper, coreFunctions);

menu.goto("splash");
