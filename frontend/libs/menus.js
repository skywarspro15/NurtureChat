import Html from "./html.js";

class Menu {
  constructor(wrapper, functions) {
    this.wrapper = wrapper;
    this.Html = Html;
    this.coreFuncs = functions;
    this.currentPage = null;
  }
  async goto(name, args = {}) {
    if (this.currentPage) {
      this.currentPage.end();
    }
    this.wrapper.clear();
    const menuFuncs = {
      title: (title) => {
        document.title = title;
      },
    };
    const page = await import(`../menus/${name}.js`);
    this.currentPage = page.default;
    document.title = page.default.title;
    page.default.contents(
      this.wrapper,
      this.Html,
      this.coreFuncs,
      menuFuncs,
      args
    );
  }
  async popup(name, args = {}) {
    let popupContainer = new Html("div").id("#popupMenu").styleJs({
      zIndex: "1000",
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      top: "100px",
      left: "0",
      width: "100%",
      height: "100%",
      opacity: "0",
    });
    let popupHeader = new Html("div")
      .styleJs({
        width: "100%",
        height: "10%",
        backgroundColor: "var(--md-sys-color-surface-dim)",
        display: "flex",
        alignItems: "center",
      })
      .appendTo(popupContainer);
    let headerContainer = new Html("div")
      .styleJs({
        display: "flex",
        gap: "8px",
        marginLeft: "10px",
        marginRight: "10px",
        alignItems: "center",
      })
      .appendTo(popupHeader);
    let headerButton = new Html("md-outlined-button")
      .text("Back")
      .append(new Html("md-icon").attr({ slot: "icon" }).html("arrow_back"))
      .appendTo(headerContainer);
    let headerText = new Html("p")
      .class("md-typescale-title-medium")
      .appendTo(headerContainer)
      .styleJs({
        color: "var(--md-sys-color-inverse-surface)",
        textAlign: "left",
      });
    let popupContent = new Html("div")
      .styleJs({
        width: "100%",
        height: "90%",
        background: "var(--md-sys-color-surface)",
      })
      .appendTo(popupContainer);
    popupContainer.appendTo(this.wrapper);
    anime({
      targets: popupContainer.elm,
      top: "0",
      opacity: "1",
      duration: 350,
      easing: "cubicBezier(0.19,1,0.22,1)",
    });
    setTimeout(async () => {
      const page = await import(`../menus/${name}.js`);
      const menuFuncs = {
        title: (title) => {
          headerText.text(title);
        },
        close: () => {
          closePopup();
        },
      };
      let closePopup = () => {
        page.default.end();
        anime({
          targets: popupContainer.elm,
          top: "100px",
          opacity: "0",
          duration: 350,
          easing: "cubicBezier(0.19,1,0.22,1)",
        });
        setTimeout(() => {
          popupContainer.cleanup();
        }, 350);
      };
      headerText.text(page.default.title);
      page.default.contents(
        popupContent,
        this.Html,
        this.coreFuncs,
        menuFuncs,
        args
      );
      headerButton.on("click", () => {
        closePopup();
      });
    }, 150);
  }
}

export default Menu;
