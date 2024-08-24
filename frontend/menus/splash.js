const menu = {
  title: "NurtureChat - Loading....",
  contents: (wrapper, Html, core, menu) => {
    let container = new Html("div")
      .styleJs({
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      })
      .appendTo(wrapper);
    let logo = new Html("img")
      .attr({ src: "assets/logo.svg" })
      .appendTo(container)
      .styleJs({
        opacity: "0",
        transform: "scale(0)",
      });
    logo.on("load", () => {
      anime({
        targets: logo.elm,
        scale: "1.5",
        opacity: "1",
        duration: 1500,
        easing: "easeOutQuad",
      });
      setTimeout(() => {
        anime({
          targets: logo.elm,
          scale: "1.5",
          opacity: "0",
          duration: 350,
          easing: "cubicBezier(0.19,1,0.22,1)",
        });
        setTimeout(() => {
          core.splashFinished();
        }, 250);
      }, 1500);
    });
  },
  end: () => {
    console.log("Splash screen killed");
  },
};

export default menu;
