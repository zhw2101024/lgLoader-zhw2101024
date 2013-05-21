const Main = imports.ui.main;

const Extension = Main.ExtensionSystem.ExtensionUtils.getCurrentExtension();
const lgLoader = Extension.imports.lgLoader;
const debug = Extension.imports.debug;
let debugobj = new debug.Debug();

function init() {
}

function enable() {
    let testButton = lgLoader.lgLoaderButton;
    let lgname = "lgLoader";
    let indicator = Main.panel.statusArea[lgname] = new testButton();
    Main.panel._addToPanelBox(lgname,indicator,1,Main.panel._centerBox);
}

function disable() {
    let lgLoaderobj = Main.panel.statusArea.lgLoader;
    if(titleBox = Main.lookingGlass.titleBox.destroy()) {
      titleBox.destroy();
    }
    lgLoaderobj.destroy();
}
