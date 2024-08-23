const menu = {
  title: "NurtureChat - Nurturing Stories",
  contents: (wrapper, Html) => {
    let container = new Html("div")
      .styleJs({
        padding: "20px",
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
      .text("Nurturing stories.")
      .appendTo(container)
      .styleJs({
        color: "var(--md-sys-color-inverse-surface)",
        textAlign: "left",
        marginTop: 0,
      });

    new Html("md-fab")
      .attr({ label: "New chat" })
      .append(new Html("md-icon").attr({ slot: "icon" }).html("chat"))
      .appendTo(wrapper)
      .styleJs({
        color: "var(--md-sys-color-on-primary)",
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
      });
  },
};

export default menu;
