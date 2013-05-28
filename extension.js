const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const Lang = imports.lang;

const Main = imports.ui.main;
const LookingGlass = imports.ui.lookingGlass;
const Tweener = imports.ui.tweener;

/*
 * This is likely the best practice to write multi-file extensions, so we can split the extension into multiple .js files.
 * See also: https://live.gnome.org/GnomeShell/Extensions/FAQ/CreatingExtensions
 */
const Extension = Main.ExtensionSystem.ExtensionUtils.getCurrentExtension();
const lgLoader = Extension.imports.lgLoader;

/*
 * define debugobj which can be used to debug the extension.
 */
const debug = Extension.imports.debug;
let debugobj = new debug.Debug();

let injections = {}, statusEvents = {}, panelEvents = new Array(), globalEvents = new Array();

/*
 * triggered when clicking on panel or stage to hide lookingGlass window
 */
function _lgCloseEvent(actor, event) {
    Main.lookingGlass.close();
}

/*
 * triggered when pressing F12 on almost everything except application windows
 */
function _globalCapturedEvent(actor, event) {
    if (event.type() == Clutter.EventType.KEY_PRESS) {
        let symbol = event.get_key_symbol();
        if(symbol == Clutter.KEY_F12) {
            Main.lookingGlass.toggle();
            return true;
        }
    }
    return false;
}

function init() {
}

function enable() {
    injections['open'] = LookingGlass.LookingGlass.prototype.open;
    /*
     * inject open function of LookingGlass
     *
     * remove line: this._notebook.selectIndex(0);
     *   see last opened tab when lookingGlass is reopened
     *
     * add line: global.stage.set_key_focus(this._entry);
     *   set focus to entry when lookingGlass is opened
     */
    LookingGlass.LookingGlass.prototype.open = function() {
        if (this._open)
            return;

        if (!Main.pushModal(this._entry, { keybindingMode: Shell.KeyBindingMode.LOOKING_GLASS }))
            return;

        this.actor.show();
        this._open = true;
        this._history.lastItem();

        Tweener.removeTweens(this.actor);

        Tweener.addTween(this.actor, { time: 0.5 / St.get_slow_down_factor(),
            transition: 'easeOutQuad',
            y: this._targetY
        });

        global.stage.set_key_focus(this._entry);
    };

    /*
     * When one of panel menus is opened, prevent lgLoader Button from being focued.
     * As we don't have a submenu, the button may interrupt open-state transfer among panel buttons.
     */
    let statusArea = Main.panel.statusArea;
    for(name in statusArea) {
        statusEvents[name] = statusArea[name].menu.connect('open-state-changed', function(menu, isOpen) {
            Main.panel.statusArea.lgLoader.actor.can_focus = !isOpen;
        });
    }

    /*
     * add lgLoader button to panel and do some event bindings
     */
    let lgname = "lgLoader";
    let lgLoaderButton = lgLoader.lgLoaderButton;
    let indicator = Main.panel.statusArea[lgname] = new lgLoaderButton();
    Main.panel._addToPanelBox(lgname,indicator,1,Main.panel._centerBox);
    panelEvents.push(Main.panel.actor.connect("button-press-event", _lgCloseEvent));
    globalEvents.push(global.stage.connect("button-press-event", _lgCloseEvent));
    globalEvents.push(global.stage.connect("captured-event", _globalCapturedEvent));
}

function disable() {
    /*
     * disconnect all events
     */
    for(id in panelEvents) {
        Main.panel.actor.disconnect(panelEvents[id]);
    }
    for(id in globalEvents) {
        global.stage.disconnect(globalEvents[id]);
    }
    for(name in statusEvents) {
        Main.panel.statusArea[name].menu.disconnect(statusEvents[name]);
    }

    /*
     * remove lgLoader button an titleBox in lookingGlass
     */
    let lgLoaderobj = Main.panel.statusArea.lgLoader;
    Main.lookingGlass.actor.disconnect(lgLoaderobj.lgEvent);
    Main.lookingGlass.titleBox.destroy();
    lgLoaderobj.destroy();

    /*
     * desinject open function of LookingGlass
     */
    LookingGlass.LookingGlass.prototype.open = injections['open'];
}
