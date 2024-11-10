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

    let list = new Html("div")
      .class("flex")
      .class("g12")
      .styleJs({
        maxWidth: "100%",
        background: "transparent",
        flexWrap: "wrap",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      })
      .appendTo(listContainer);
    new Html("br").appendTo(list);
    let characters = core.getCharacters();
    characters.forEach((item) => {
      let card = new Html("md-outlined-card")
        .appendTo(list)
        .styleJs({ width: "90%" });
      let cardContents = new Html("div")
        .class("flex")
        .class("col")
        .class("g12")
        .class("p16")
        .appendTo(card);
      new Html("div")
        .class("card-title")
        .text(item.name)
        .styleJs({
          color: "var(--md-sys-color-inverse-surface)",
        })
        .appendTo(cardContents);
      new Html("div")
        .text(item.description ? item.description : "No description provided.")
        .styleJs({
          color: "var(--md-sys-color-inverse-surface)",
        })
        .appendTo(cardContents);
      new Html("div")
        .class("flex")
        .class("g8")
        .class("jcr")
        .class("mt12")
        .appendMany(
          new Html("md-filled-button").text("Start chat").on("click", () => {
            core.createChat(item.id);
          })
        )
        .appendTo(cardContents);
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
