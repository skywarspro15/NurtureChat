import Html from "./html.js";

class Menu {
  constructor(wrapper, functions) {
    this.wrapper = wrapper;
    this.Html = Html;
    this.coreFuncs = functions;
  }
  async goto(name) {
    const page = await import(`../menus/${name}.js`);
    page.default.contents(this.wrapper, this.Html, this.coreFuncs);
    document.title = page.default.title;
  }
}

export default Menu;
