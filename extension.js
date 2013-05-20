const Main = imports.ui.main;

const Extension = Main.ExtensionSystem.ExtensionUtils.getCurrentExtension();
const lgLoader = Extension.imports.lgLoader;

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
    lgLoaderobj.centerBox.destroy();
    lgLoaderobj.destroy();
}
