const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;
const St = imports.gi.St;
const Main = imports.ui.main;
const LookingGlass = imports.ui.lookingGlass;

const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;

let lgLoader, lgLoaderEventId, lgKeyEventId, centerBox;

const lgLoaderButton = new Lang.Class({
    Name: "lgLoaderButton",
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.25);
        this._label = new St.Button({label: "lookingGlass"});
        this.actor.add_actor(this._label);
        this._createLookingGlass();
        this._label.connect('button-press-event', Lang.bind(this, this._buttonEvent));
    },

    _createLookingGlass: function() {
        if (null == Main.lookingGlass) {
            Main.lookingGlass = new LookingGlass.LookingGlass();
        }
        let lookingGlass = Main.lookingGlass;
        let toolbar = lookingGlass.actor.get_first_child();
        let centerArea = toolbar.get_child_at_index(1);
        centerBox = new St.BoxLayout({ style_class: 'labels' });
        let clearBtn = new St.Button({label:"clear"});
        clearBtn.connect("button-press-event", Lang.bind(this, this._clearEvent));
        clearBtn._lookingGlass = lookingGlass;
        centerBox.add_actor(clearBtn, { expand: true });
        centerArea.add_actor(centerBox);
    },

    _buttonEvent: function() {
        Main.lookingGlass.toggle();
        return true;
    },

    _clearEvent: function(actor,event) {
        var lookingGlass = actor._lookingGlass;
        var selectedIndex = lookingGlass._notebook._selectedIndex;
        switch(selectedIndex)
        {
        case 0:
          lookingGlass._resultsArea.destroy_all_children();
          break;
        case 1:
          lookingGlass._windowList.actor.destroy_all_children();
          break;
        case 2:
          lookingGlass._memory.actor.destroy_all_children();
          break;
        case 3:
          lookingGlass._extensions.actor.destroy_all_children();
          break;
        }
    }
});

function debug(text) {
    var test = new St.Label({style_class:'debug-text',text:text.toString()});
    test.set_position(100,200);
    Main.uiGroup.add_actor(test);
}

function _clearEvent(actor,event) {
    var lookingGlass = actor._lookingGlass;
    var selectedIndex = lookingGlass._notebook._selectedIndex;
    switch(selectedIndex)
    {
    case 0:
      lookingGlass._resultsArea.destroy_all_children();
      break;
    case 1:
      lookingGlass._windowList.actor.destroy_all_children();
      break;
    case 2:
      lookingGlass._memory.actor.destroy_all_children();
      break;
    case 3:
      lookingGlass._extensions.actor.destroy_all_children();
      break;
    }
}

function createLookingGlass() {
    if (null == Main.lookingGlass) {
        Main.lookingGlass = new LookingGlass.LookingGlass();
    }
    let lookingGlass = Main.lookingGlass;
    let toolbar = lookingGlass.actor.get_first_child();
    let centerArea = toolbar.get_child_at_index(1);
    centerBox = new St.BoxLayout({ style_class: 'labels' });
    let clearBtn = new St.Button({label:"clear"});
    clearBtn.connect("button-press-event", _clearEvent);
    clearBtn._lookingGlass = lookingGlass;
    centerBox.add_actor(clearBtn, { expand: true });
    centerArea.add_actor(centerBox);
}

function _buttonEvent(actor,event) {
    Main.lookingGlass.toggle();
    return true;
}

function _keyEvent(actor,event) {
    let symbol = event.get_key_symbol();
    if((actor instanceof St.Button) && "lookingGlass" == actor.label) {
        if (Clutter.KEY_Down == symbol || Clutter.KEY_F12 == symbol) {
            Main.lookingGlass.toggle();
        } else {
                if (Clutter.KEY_Left == symbol || Clutter.KEY_Right == symbol) {
                    let group = global.focus_manager.get_group(actor);
                    if(group) {
                        let direction = (Clutter.KEY_Left == symbol) ? Gtk.DirectionType.LEFT : Gtk.DirectionType.RIGHT;
                        group.navigate_focus(actor, direction, false);
                    }
                } else {
                    actor.grab_key_focus();
                }
        }
    } else if(actor instanceof Main.Panel) {
        if (Clutter.KEY_F12 == symbol) {
            Main.lookingGlass.toggle();
        }
    }
    return false;
}

function init() {
}

function enable() {
    createLookingGlass();
    lgLoader = new St.Button({label:"lookingGlass",style_class: 'panel-button',
                                    reactive:true,
                                can_focus:true,
                                track_hover:true});
    lgLoaderEventId = lgLoader.connect('button-press-event', _buttonEvent);
    lgKeyEventId = lgLoader.connect('key-press-event', _keyEvent);
    //Main.panel._centerBox.add_actor(lgLoader);

    let testButton = lgLoaderButton;
    let lgname = "lgLoader";
    let indicator = Main.panel.statusArea[lgname] = new testButton();
    Main.panel._addToPanelBox(lgname,indicator,1,Main.panel._centerBox);
}

function disable() {
    //Main.panel._centerBox.remove_child(lgLoader);
    lgLoader.disconnect(lgLoaderEventId);
    lgLoader.disconnect(lgKeyEventId);
    Main.lookingGlass.actor.get_first_child().get_child_at_index(1).remove_child(centerBox);
}
