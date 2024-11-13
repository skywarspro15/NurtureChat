let changeCb, pfpCb;

const menu = {
  title: "NurtureChat - Nurturing Stories",
  contents: async (wrapper, Html, core) => {
    wrapper.styleJs({
      display: "flex",
      flexDirection: "column",
      //   opacity: "0",
    });
    // let container = new Html("div")
    //   .styleJs({
    //     padding: "20px",
    //     height: "25%",
    //     display: "flex",
    //     flexDirection: "column",
    //     justifyContent: "center",
    //   })
    //   .appendTo(wrapper);

    let profileContainer = new Html("div")
      .styleJs({
        color: "var(--md-sys-color-inverse-surface)",
        backgroundColor: "var(--md-sys-color-surface-dim)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        borderRadius: "0px 0px 30px 30px",
      })
      .appendTo(wrapper);

    new Html("p")
      .text("Your profile")
      .styleJs({ fontWeight: "bold" })
      .appendTo(profileContainer);

    let pfp = new Html("img")
      .attr({
        src: "./assets/default.png",
      })
      .styleJs({
        width: "50%",
        padding: "25px",
        aspectRatio: "1 / 1",
        borderRadius: "50%",
        objectFit: "cover",
      })
      .appendTo(profileContainer);

    let displayName = new Html("p")
      .class("md-typescale-headline-medium")
      .text("Loading...")
      .styleJs({
        marginBottom: 0,
        padding: 0,
      })
      .appendTo(profileContainer);

    let userName = new Html("p")
      .class("md-typescale-headline-small")
      .text("Loading...")
      .appendTo(profileContainer);

    let buttons = new Html("div")
      .styleJs({
        maxWidth: "80%",
        gap: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      })
      .appendTo(profileContainer);

    new Html("md-filled-button")
      .text("Edit display name")
      .appendTo(buttons)
      .on("click", () => {
        core.updateDisplayName();
      });

    new Html("md-filled-button")
      .text("Add profile picture")
      .appendTo(buttons)
      .on("click", () => {
        core.addProfilePic();
      });

    new Html("br").appendTo(profileContainer);

    let info = await core.getUserInfo();
    console.log(info);

    userName.text(`@${info.username}`);
    displayName.text(info.display_name);
    pfp.attr({
      src: info.profile_picture ? info.profile_picture : "./assets/default.png",
    });

    changeCb = (e) => {
      displayName.text(e.detail);
    };

    pfpCb = async (e) => {
      info = await core.getUserInfo();
      pfp.attr({
        src: info.profile_picture
          ? info.profile_picture + "?" + new Date().getTime()
          : "./assets/default.png",
      });
    };

    document.addEventListener("displayNameChange", changeCb);
    document.addEventListener("profilePicChange", pfpCb);
    // setTimeout(() => {
    //   anime({
    //     targets: wrapper.elm,
    //     opacity: "1",
    //     duration: 500,
    //     easing: "cubicBezier(0.19,1,0.22,1)",
    //   });
    // }, 100);
  },
  end: () => {
    document.removeEventListener("displayNameChange", changeCb);
    document.removeEventListener("profilePicChange", pfpCb);
    console.log("UI killed me!!!");
  },
};

export default menu;
