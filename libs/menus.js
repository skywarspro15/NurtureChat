import Html from "./html.js";

class Menu {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.Html = Html;
  }
  async open(name) {
    const page = await import(`../menus/${name}.js`);
    page.default.contents(this.wrapper, this.Html);
    document.title = page.default.title;
  }
}

export default Menu;
