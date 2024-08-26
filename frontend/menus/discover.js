const menu = {
  title: "NurtureChat - Nurturing Stories",
  contents: (wrapper, Html, core) => {
    wrapper.styleJs({
      display: "flex",
      flexDirection: "column",
      opacity: "0",
    });
    let container = new Html("div")
      .styleJs({
        padding: "20px",
        height: "25%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      })
      .appendTo(wrapper);

    new Html("h1")
      .class("md-typescale-display-large")
      .text("Discover")
      .appendTo(container)
      .styleJs({
        color: "var(--md-sys-color-inverse-surface)",
        textAlign: "left",
        marginBottom: 0,
      });

    new Html("p")
      .class("md-typescale-headline-medium")
      .text("Find characters to chat with")
      .appendTo(container)
      .styleJs({
        color: "var(--md-sys-color-inverse-surface)",
        textAlign: "left",
        marginTop: 0,
      });

    let listContainer = new Html("div")
      .styleJs({
        height: "75%",
        width: "100%",
        background: "var(--md-sys-color-surface-dim)",
        borderRadius: "30px 30px 0px 0px",
        overflow: "auto",
      })
      .appendTo(wrapper);

    let list = new Html("md-list")
      .styleJs({
        maxWidth: "100%",
        background: "transparent",
      })
      .appendTo(listContainer);

    let characters = core.getCharacters();
    characters.forEach((item) => {
      new Html("md-list-item")
        .attr({ type: "button" })
        .html(`${item.name}`)
        .appendTo(list);
      new Html("md-divider").appendTo(list);
    });
    setTimeout(() => {
      anime({
        targets: wrapper.elm,
        opacity: "1",
        duration: 500,
        easing: "cubicBezier(0.19,1,0.22,1)",
      });
    }, 100);
  },
  end: () => {
    console.log("UI killed me!!!");
  },
};

export default menu;
