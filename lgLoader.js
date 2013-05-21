const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const LookingGlass = imports.ui.lookingGlass;
const PanelMenu = imports.ui.panelMenu;

const lgLoaderButton = new Lang.Class({
    Name: "lgLoaderButton",
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent();
        this._label = new St.Button({name: "testButton", label: "lookingGlass"});
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
        if(centerArea.get_children().length == 0) {
            lookingGlass.titleBox = new St.BoxLayout({ name:"titleBox" });

            let clearBtn = new St.Button({label:"clear", style_class: "cmdButton"});
            clearBtn.connect("button-press-event", Lang.bind(this, this._clearEvent));
            clearBtn._lookingGlass = lookingGlass;
            lookingGlass.titleBox.add(clearBtn, { x_align: St.Align.START, expand: false });

	    let spacing = new St.DrawingArea();
            lookingGlass.titleBox.add(spacing, { x_align: St.Align.MIDDLE, expand: true });

            let restartBtn = new St.Button({label:"restart", style_class: "cmdButton"});
            restartBtn.connect("button-press-event", Lang.bind(this, function() {
                global.reexec_self();
            }));
            lookingGlass.titleBox.add(restartBtn, { x_align: St.Align.END, expand: false });

            centerArea.x_fill = true;
            centerArea.add_actor(lookingGlass.titleBox);
        }
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
