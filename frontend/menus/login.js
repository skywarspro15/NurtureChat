const menu = {
  title: "NurtureChat - Sign in",
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
      .text("Sign in")
      .appendTo(container)
      .styleJs({
        color: "var(--md-sys-color-inverse-surface)",
        textAlign: "left",
        marginBottom: 0,
      });

    new Html("p")
      .class("md-typescale-headline-medium")
      .text("Log in to this instance to synchronize chat data.")
      .appendTo(container)
      .styleJs({
        color: "var(--md-sys-color-inverse-surface)",
        textAlign: "left",
        marginTop: 0,
      });

    //   <md-filled-text-field label="Username" type="email">
    //   </md-filled-text-field>

    //   <md-filled-text-field label="Password" type="password">
    //   </md-filled-text-field>

    let elmContainer = new Html("div")
      .styleJs({
        height: "75%",
        width: "100%",
        background: "var(--md-sys-color-surface-dim)",
        borderRadius: "30px 30px 0px 0px",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      })
      .appendTo(wrapper);

    let fieldsContainer = new Html("div")
      .styleJs({
        width: "85%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        paddingTop: "35px",
      })
      .appendTo(elmContainer);

    let uNameField = new Html("md-filled-text-field")
      .attr({
        label: "Username",
        type: "email",
        required: true,
      })
      .styleJs({ width: "100%" })
      .appendTo(fieldsContainer);

    new Html("md-icon")
      .attr({ slot: "leading-icon" })
      .text("person")
      .appendTo(uNameField);

    let passField = new Html("md-filled-text-field")
      .attr({
        label: "Password",
        type: "password",
        required: true,
      })
      .styleJs({ width: "100%" })
      .appendTo(fieldsContainer);

    new Html("md-icon")
      .attr({ slot: "leading-icon" })
      .text("key")
      .appendTo(passField);

    new Html("br").appendTo(fieldsContainer);

    let buttonsContainer = new Html("div")
      .styleJs({
        width: "100%",
        display: "flex",
        gap: "8px",
      })
      .appendTo(fieldsContainer);

    new Html("md-outlined-button")
      .text("Create an account")
      .appendTo(buttonsContainer)
      .on("click", () => {
        core.redirect("register");
      });

    new Html("md-filled-button")
      .text("Log in")
      .styleJs({
        justifyContent: "flex-end",
        marginLeft: "auto",
      })
      .appendTo(buttonsContainer)
      .on("click", () => {
        if (uNameField.elm.value.trim() == "") {
          uNameField.elm.reportValidity();
          return;
        }
        if (passField.elm.value.trim() == "") {
          passField.elm.reportValidity();
          return;
        }
        core.login({
          username: uNameField.elm.value,
          password: passField.elm.value,
        });
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
