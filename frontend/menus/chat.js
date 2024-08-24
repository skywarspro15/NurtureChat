const menu = {
  title: "Loading....",
  contents: (wrapper, Html, core, menu) => {
    menu.title("Chatting with user");
  },
  end: () => {
    console.log("UI killed me!!!");
  },
};

export default menu;
