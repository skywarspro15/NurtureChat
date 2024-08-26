let Core, sendErrCb, msgCb, lastMessage;
const menu = {
  title: "Loading....",
  contents: (wrapper, Html, core, menu, args) => {
    Core = core;
    console.log(args);
    menu.title(args.character.name);
    wrapper.styleJs({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    });

    let chat = new Html("div").appendTo(wrapper).styleJs({
      width: "100%",
      height: "86%",
      marginTop: "4%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflow: "auto",
    });

    function createBubble(text, you = false) {
      let styleSettings = {
        background: "var(--md-sys-color-surface-dim)",
        borderRadius: "50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: "20px",
        paddingRight: "20px",
        maxWidth: "80%",
      };
      if (you) {
        styleSettings.marginLeft = "auto";
      }
      let bubbleContainer = new Html("div").appendTo(chat).styleJs({
        width: "95%",
        display: "flex",
      });
      let bubble = new Html("div")
        .appendTo(bubbleContainer)
        .styleJs(styleSettings);
      new Html("p").text(text).appendTo(bubble).styleJs({
        color: "var(--md-sys-color-inverse-surface)",
      });
      new Html("br").appendTo(chat);
      chat.elm.scrollTop = chat.elm.scrollHeight;
    }

    args.messages.forEach((message) => {
      createBubble(message.content, message.role == "user" ? true : false);
    });

    msgCb = (e) => {
      let message = e.detail;
      createBubble(message);
    };

    sendErrCb = (e) => {
      let message = e.detail;
      console.error("Generation error!", message);
      alert(`An error occured\n${JSON.stringify(message, null, 2)}`);
    };

    document.addEventListener("characterMessage", msgCb);
    document.addEventListener("sendError", sendErrCb);

    let inputContainer = new Html("div").appendTo(wrapper).styleJs({
      width: "100%",
      height: "10%",
      display: "flex",
    });
    let msgField = new Html("md-filled-text-field")
      .attr({
        label: "Message...",
        type: "text",
      })
      .appendTo(inputContainer)
      .styleJs({
        width: "85%",
        height: "100%",
      });
    new Html("md-icon-button")
      .styleJs({ width: "15%", height: "100%", padding: "0", margin: "0" })
      .append(new Html("md-icon").text("send"))
      .appendTo(inputContainer)
      .on("click", () => {
        lastMessage = msgField.elm.value;
        createBubble(msgField.elm.value, true);
        core.sendMessage(msgField.elm.value);
        msgField.elm.value = "";
      });
  },
  end: () => {
    console.log("UI killed me!!!");
    document.removeEventListener("characterMessage", msgCb);
    document.removeEventListener("sendError", sendErrCb);
    Core.endChat();
  },
};

export default menu;
