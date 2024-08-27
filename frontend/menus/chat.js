let Core, sendErrCb, msgCb, contextCb;
let conversationIndex = 0;
let context = [];
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

    function bindPressHold(item, cb) {
      let timerID;
      let counter = 0;

      let pressHoldEvent = new CustomEvent("pressHold");
      let pressHoldDuration = 50;

      item.addEventListener("mousedown", pressingDown, false);
      item.addEventListener("mouseup", notPressingDown, false);
      item.addEventListener("mouseleave", notPressingDown, false);

      item.addEventListener("touchstart", pressingDown, false);
      item.addEventListener("touchend", notPressingDown, false);

      // Listening for our custom pressHold event
      item.addEventListener("pressHold", cb, false);

      function pressingDown(e) {
        // Start the timer
        requestAnimationFrame(timer);

        e.preventDefault();

        console.log("Pressing!");
      }

      function notPressingDown(e) {
        // Stop the timer
        cancelAnimationFrame(timerID);
        counter = 0;

        console.log("Not pressing!");
      }

      //
      // Runs at 60fps when you are pressing down
      //
      function timer() {
        console.log("Timer tick!");

        if (counter < pressHoldDuration) {
          timerID = requestAnimationFrame(timer);
          counter++;
        } else {
          console.log("Press threshold reached!");
          item.dispatchEvent(pressHoldEvent);
        }
      }
    }

    function createDialog(title) {
      let dialog = new Html("md-dialog")
        .attr({ open: true })
        .appendMany(new Html("div").attr({ slot: "headline" }).text(title))
        .on("close", () => {
          setTimeout(() => {
            dialog.cleanup();
          }, 800);
        })
        .appendTo(wrapper);
      let dialogContents = new Html("form")
        .attr({
          slot: "content",
          id: "form-id",
          method: "dialog",
        })
        .appendTo(dialog);
      let dialogActions = new Html("div")
        .attr({ slot: "actions" })
        .append(new Html("md-text-button").attr({ form: "form-id" }).html("OK"))
        .appendTo(dialog);
      let methods = {
        close: () => {
          dialog.elm.close();
        },
      };
      return {
        contents: dialogContents,
        actions: dialogActions,
        methods: methods,
      };
    }

    function createBubble(text, you = false, cb) {
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
      bindPressHold(bubble.elm, cb);
      new Html("br").appendTo(chat);
      chat.elm.scrollTop = chat.elm.scrollHeight;
    }

    conversationIndex = args.messages.length;
    let msgMenu = (message) => {
      console.log(message);
      navigator.vibrate(50);
      let actionsList = [
        {
          icon: "content_copy",
          text: "Copy text",
          action: (methods, message) => {
            methods.close();
            navigator.clipboard.writeText(message.content);
          },
        },
        {
          icon: "delete",
          text: "Delete message",
          action: (methods, message) => {
            const msgIndex = context.indexOf(message);
            if (msgIndex > -1) {
              context.splice(msgIndex, 1);
              core.updateContext(context);
            } else {
              alert("Delete failed");
            }
            methods.close();
          },
        },
      ];
      let dialog = createDialog("Message actions");
      dialog.actions.clear();
      let list = new Html("md-list").appendTo(dialog.contents).styleJs({
        background: "transparent",
      });
      actionsList.forEach((action) => {
        let listItem = new Html("md-list-item")
          .attr({ type: "button" })
          .text(action.text)
          .appendTo(list)
          .on("click", () => {
            action.action(dialog.methods, message);
          });
        new Html("md-icon")
          .attr({ slot: "start" })
          .text(action.icon)
          .appendTo(listItem);
        new Html("md-divider").appendTo(list);
      });
    };
    context = args.messages;
    function renderContext() {
      chat.clear();
      context.forEach((message) => {
        createBubble(
          message.content,
          message.role == "user" ? true : false,
          () => {
            msgMenu(message);
          }
        );
      });
    }
    renderContext();

    contextCb = (e) => {
      console.log("context!");
      let prevScroll = chat.elm.scrollTop;
      context = e.detail;
      renderContext();
      chat.elm.scrollTop = prevScroll;
    };

    msgCb = (e) => {
      let message = e.detail;
      createBubble(message, false, () => {
        console.log("no cb yet");
      });
    };

    sendErrCb = (e) => {
      let message = e.detail;
      console.error("Generation error!", message);
      alert(`An error occured\n${JSON.stringify(message, null, 2)}`);
    };

    document.addEventListener("characterMessage", msgCb);
    document.addEventListener("sendError", sendErrCb);
    document.addEventListener("context", contextCb);

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
        createBubble(msgField.elm.value, true, () => {
          console.log("no cb yet");
        });
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
