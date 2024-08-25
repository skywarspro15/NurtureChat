const menu = {
  title: "NurtureChat - Nurturing Stories",
  contents: (wrapper, Html, core) => {
    core.startSocket();
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

    let characters = [
      {
        image:
          "https://characterai.io/i/200/static/avatars/uploaded/2023/2/13/0amp4OyvCn45BEOGFF-SeVv_6k2bwUQM0pFH5unIy4Q.webp?webp=true&anim=0",
        name: "Alice the Bully",
      },
      // helper because why tf not
      {
        image:
          "https://ai.nxw.pw/Cupertino.mp4/assets/avatars/builtin/helper.svg",
        name: "Helper",
      },
      {
        image:
          "https://ai.nxw.pw/Cupertino.mp4/assets/avatars/community/milo.jpeg",
        name: "Milo the Cat",
      },
      {
        image:
          "https://characterai.io/i/200/static/avatars/uploaded/2023/2/13/0amp4OyvCn45BEOGFF-SeVv_6k2bwUQM0pFH5unIy4Q.webp?webp=true&anim=0",
        name: "Alice the Bully",
      },
      // helper because why tf not
      {
        image:
          "https://ai.nxw.pw/Cupertino.mp4/assets/avatars/builtin/helper.svg",
        name: "Helper",
      },
      {
        image:
          "https://ai.nxw.pw/Cupertino.mp4/assets/avatars/community/milo.jpeg",
        name: "Milo the Cat",
      },
      {
        image:
          "https://characterai.io/i/200/static/avatars/uploaded/2023/2/13/0amp4OyvCn45BEOGFF-SeVv_6k2bwUQM0pFH5unIy4Q.webp?webp=true&anim=0",
        name: "Alice the Bully",
      },
      // helper because why tf not
      {
        image:
          "https://ai.nxw.pw/Cupertino.mp4/assets/avatars/builtin/helper.svg",
        name: "Helper",
      },
      {
        image:
          "https://ai.nxw.pw/Cupertino.mp4/assets/avatars/community/milo.jpeg",
        name: "Milo the Cat",
      },
      {
        image:
          "https://characterai.io/i/200/static/avatars/uploaded/2023/2/13/0amp4OyvCn45BEOGFF-SeVv_6k2bwUQM0pFH5unIy4Q.webp?webp=true&anim=0",
        name: "Alice the Bully",
      },
      // helper because why tf not
      {
        image:
          "https://ai.nxw.pw/Cupertino.mp4/assets/avatars/builtin/helper.svg",
        name: "Helper",
      },
      {
        image:
          "https://ai.nxw.pw/Cupertino.mp4/assets/avatars/community/milo.jpeg",
        name: "Milo the Cat",
      },
      {
        image:
          "https://characterai.io/i/200/static/avatars/uploaded/2023/2/13/0amp4OyvCn45BEOGFF-SeVv_6k2bwUQM0pFH5unIy4Q.webp?webp=true&anim=0",
        name: "Alice the Bully",
      },
      // helper because why tf not
      {
        image:
          "https://ai.nxw.pw/Cupertino.mp4/assets/avatars/builtin/helper.svg",
        name: "Helper",
      },
      {
        image:
          "https://ai.nxw.pw/Cupertino.mp4/assets/avatars/community/milo.jpeg",
        name: "Milo the Cat",
      },
    ];

    //oog eht ni gnitnemmoc ekil si siht
    //  ????????????????????????
    //  man is speaking enchantment table
    // ∴⍑ᔑℸ ̣ ╎ᓭ ʖ∷𝙹 s!¡ᒷaꖌiリ⊣

    //     <md-list style="max-width: 300px;">
    //   <md-list-item>
    //     Cat
    //     <img slot="start" style="width: 56px" src="https://placekitten.com/112/112">
    //   </md-list-item>
    //   <md-divider></md-divider>
    //   <md-list-item>
    //     Kitty Cat
    //     <img slot="start" style="width: 56px" src="https://placekitten.com/114/114">
    //   </md-list-item>
    //   <md-divider></md-divider>
    //   <md-list-item>
    //     Cate
    //     <img slot="start" style="width: 56px" src="https://placekitten.com/116/116">
    //   </md-list-item>
    // </md-list>

    let list = new Html("md-list")
      .styleJs({
        maxWidth: "100%",
        background: "transparent",
      })
      .appendTo(listContainer);

    characters.forEach((item) => {
      let listItem = new Html("md-list-item")
        .attr({ type: "button" })
        .html(`${item.name}`)
        .appendTo(list)
        .on("click", () => {
          core.openChat();
        });
      new Html("img")
        .attr({ slot: "start", src: item.image })
        .styleJs({ width: "56px", borderRadius: "50%" })
        .appendTo(listItem);
      new Html("md-divider").appendTo(list);
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
  },
  end: () => {
    console.log("UI killed me!!!");
  },
};

export default menu;
