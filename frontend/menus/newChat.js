const menu = {
  title: "New conversation",
  contents: (wrapper, Html, core, menu) => {
    wrapper.styleJs({
      display: "flex",
      flexDirection: "column",
    });
    new Html("md-filled-text-field")
      .attr({
        label: "Search for characters...",
        type: "text",
        width: "100%",
        height: "10%",
      })
      .styleJs({ width: "100%" })
      .appendTo(wrapper);
    let characters = core.getCharacters();
    let listContainer = new Html("div")
      .styleJs({
        width: "100%",
        height: "90%",
      })
      .appendTo(wrapper);
    let list = new Html("md-list")
      .styleJs({
        maxWidth: "100%",
        background: "transparent",
      })
      .appendTo(listContainer);
    characters.forEach((item, index) => {
      new Html("md-list-item")
        .attr({ type: "button" })
        .html(`${item.name}`)
        .appendTo(list)
        .on("click", () => {
          menu.close();
          core.createChat(index);
        });
      new Html("md-divider").appendTo(list);
    });
  },
  end: () => {
    console.log("UI killed me!!!");
  },
};

export default menu;
