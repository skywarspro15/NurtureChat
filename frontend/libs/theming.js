const theme = {
  setTheme: (themeName, colorScheme) => {
    let cssId = "theme";
    let element = document.getElementById(cssId);
    if (element) {
      element.remove();
    }
    let head = document.getElementsByTagName("head")[0];
    let link = document.createElement("link");
    link.id = cssId;
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = `../styles/themes/${themeName}/${colorScheme}.css`;
    link.media = "all";
    head.appendChild(link);
  },
};

export default theme;
