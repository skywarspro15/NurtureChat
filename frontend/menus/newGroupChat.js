let Core;
const menu = {
  title: "New group conversation",
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
    new Html("p")
      .text("Added characters will be shown here...")
      .appendTo(chipSet)
      .styleJs({
        padding: "0",
        margin: "0",
      });
    let characters = core.getCharacters();
    let fuseOptions = {
      keys: ["name"],
    };
    let chatMembers = [];
    let fab;
    function renderFab() {
      if (chatMembers.length > 1) {
        if (fab) {
          fab.cleanup();
        }
        fab = new Html("md-fab")
          .attr({ label: "Start chat" })
          .append(
            new Html("md-icon").attr({ slot: "icon" }).html("arrow_forward")
          )
          .appendTo(wrapper)
          .styleJs({
            color: "var(--md-sys-color-on-primary)",
            position: "fixed",
            bottom: "8%",
            right: "1.5rem",
          })
          .on("click", () => {
            menu.close();
            core.createGroupChat(chatMembers);
          });
      } else {
        if (fab) {
          fab.cleanup();
        }
      }
    }
    function renderAddedMembers() {
      chipSet.clear();
      chatMembers.forEach((id) => {
        new Html("md-input-chip")
          .attr({ label: characters[id].name })
          .appendTo(chipSet)
          .on("remove", () => {
            const index = chatMembers.indexOf(id);
            if (index > -1) {
              chatMembers.splice(index, 1);
            }
            renderFab();
          });
      });
      renderFab();
    }
    function addMember(id) {
      if (!chatMembers.includes(id)) {
        chatMembers.push(id);
        renderAddedMembers();
      }
    }
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
            addMember(item.id);
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
            addMember(result.item.id);
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
