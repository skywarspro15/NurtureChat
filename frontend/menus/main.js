let conversationsCb;
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
      .text("Nurture.ai")
      .appendTo(container)
      .styleJs({
        color: "var(--md-sys-color-inverse-surface)",
        textAlign: "left",
        marginBottom: 0,
      });

    new Html("p")
      .class("md-typescale-headline-medium")
      .text("Nurturing stories, nurturing personalities.")
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

    conversationsCb = (e) => {
      let conversations = e.detail;
      list.clear();
      conversations.forEach((item) => {
        new Html("md-list-item")
          .attr({ type: "button" })
          .appendMany(
            new Html("div").attr({ slot: "headline" }).text(item.name),
            new Html("div")
              .attr({ slot: "supporting-text" })
              .text(item.lastMessage)
          )
          .appendTo(list)
          .on("click", () => {
            core.openChat(item.conversationId);
          });
        new Html("md-divider").appendTo(list);
      });
      if (conversations.length == 0) {
        new Html("md-list-item")
          .attr({ type: "button" })
          .html(`No conversations yet`)
          .appendTo(list)
          .on("click", () => {
            core.startChat();
          });
      }
    };

    let conversations = core.getConversations();
    conversationsCb({ detail: conversations });
    document.addEventListener("conversations", conversationsCb);

    new Html("md-fab")
      .attr({ label: "New chat" })
      .append(new Html("md-icon").attr({ slot: "icon" }).html("chat"))
      .appendTo(wrapper)
      .styleJs({
        color: "var(--md-sys-color-on-primary)",
        position: "fixed",
        bottom: "calc(8% + 1.5rem)",
        right: "1.5rem",
      })
      .on("click", () => {
        core.startChat();
      });
    setTimeout(() => {
      anime({
        targets: wrapper.elm,
        opacity: "1",
        duration: 500,
        easing: "cubicBezier(0.19,1,0.22,1)",
      });
    }, 100);
    core.startSocket();
  },
  end: () => {
    console.log("UI killed me!!!");
    document.removeEventListener("conversations", conversationsCb);
  },
};

export default menu;
