let Core;
const menu = {
  title: "New conversation",
  contents: (wrapper, Html, core, menu) => {
    Core = core;
    wrapper.styleJs({
      display: "flex",
      flexDirection: "column",
    });
    let searchField = new Html("md-filled-text-field")
      .attr({
        label: "Search for characters...",
        type: "text",
        width: "100%",
        height: "10%",
      })
      .styleJs({ width: "100%" })
      .appendTo(wrapper);
    let chipSet = new Html("md-chip-set")
      .styleJs({ width: "100%", padding: "20px" })
      .appendTo(wrapper);
    new Html("md-filled-button")
      .text("New group conversation")
      .append(new Html("md-icon").attr({ slot: "icon" }).html("group_add"))
      .appendTo(chipSet)
      .on("click", () => {
        menu.close();
        core.startGroupChat();
      });
    let characters = core.getCharacters();
    let fuseOptions = {
      keys: ["name"],
    };
    const fuse = new Fuse(characters, fuseOptions);
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
    function renderAll() {
      list.clear();
      characters.forEach((item, index) => {
        new Html("md-list-item")
          .attr({ type: "button" })
          .html(`${item.name}`)
          .appendTo(list)
          .on("click", () => {
            menu.close();
            core.createChat(item.id);
          });
        new Html("md-divider").appendTo(list);
      });
    }
    renderAll();
    searchField.elm.focus();
    searchField.on("keyup", () => {
      let searchPattern = searchField.elm.value;
      let searchResults = fuse.search(searchPattern);
      list.clear();
      if (searchPattern.trim() == "") {
        renderAll();
        return;
      }
      searchResults.forEach((result) => {
        new Html("md-list-item")
          .attr({ type: "button" })
          .html(`${result.item.name}`)
          .appendTo(list)
          .on("click", () => {
            menu.close();
            core.createChat(result.item.id);
          });
        new Html("md-divider").appendTo(list);
      });
    });
  },
  end: () => {
    console.log("UI killed me!!!");
    Core.showBottomBar();
  },
};

export default menu;
