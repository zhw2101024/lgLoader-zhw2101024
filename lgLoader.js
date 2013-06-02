const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Lang = imports.lang;

const Main = imports.ui.main;
const LookingGlass = imports.ui.lookingGlass;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

/*
 * This is likely the best practice to write multi-file extensions, so we can split the extension into multiple .js files.
 * See also: https://live.gnome.org/GnomeShell/Extensions/FAQ/CreatingExtensions
 */
const Extension = Main.ExtensionSystem.ExtensionUtils.getCurrentExtension();
const debug = Extension.imports.debug;

/*
 * define debugobj which can be used to debug the extension.
 */
let debugobj = new debug.Debug();

/*
 * We need a button on top panel which looks and act like the date button, so PanelMenu.Button is extended here.
 */
const lgLoaderButton = new Lang.Class({
    Name: "lgLoaderButton",
      Extends: PanelMenu.Button,

      _init: function() {
          this.parent();
          /*
           * create button itself
           */
          this._label = new St.Button({name: "lookingGlass", label: "lookingGlass"});
          this.actor.add_actor(this._label);
          /*
           * initialize lookingGlass and make some event binding
           */
          this._createLookingGlass();
          this._label.connect("button-press-event", Lang.bind(this, this._buttonPressEvent));
          this.actor.connect("captured-event", Lang.bind(this, this._buttonCapturedEvent));
          this.lgEvent = Main.lookingGlass.actor.connect("button-press-event", Lang.bind(this, this._lgPreventCloseEvent));
      },

      /*
       * initial lookingGlass object and add some custom components
       */
      _createLookingGlass: function() {
          /*
           * Create lookingGlass only when there's no one, so we won't break other extensions.
           */
          if (null == Main.lookingGlass) {
              Main.lookingGlass = new LookingGlass.LookingGlass();
          }
          let lookingGlass = Main.lookingGlass;
          let toolbar = lookingGlass.actor.get_first_child();
          let centerArea = toolbar.get_child_at_index(1);
          /*
           * For same reason as above, we check if lookingGlass if modified before.
           */
          if(0 == centerArea.get_children().length) {
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

      /*
       * triggered when clicking on lgLoader button
       * right-click to restart then gnome session
       */
      _buttonPressEvent: function(actor, event) {
          if(3 == event.get_button()) {
            global.reexec_self();
            return true;
          }
          /*
           * in case lookingGlass is accidently destroyed
           */
          if(null == Main.lookingGlass) {
            this._createLookingGlass();
          }
          Main.lookingGlass.toggle();
          return true;
      },

      /*
       * triggered when pressing keys on lgLoader button
       */
      _buttonCapturedEvent: function(actor, event) {
          if(Clutter.EventType.KEY_PRESS == event.type()) {
              if(null == Main.lookingGlass) {
                this._createLookingGlass();
              }
              let symbol = event.get_key_symbol();
              if((Clutter.KEY_space == symbol) || (Clutter.KEY_Return == symbol)) {
                  Main.lookingGlass.toggle();
              } else if(Clutter.KEY_Down == symbol) {
                  Main.lookingGlass.open();
              }
          }
          return false;
      },

      /*
       * triggered when window of lookingGlass is clicked
       */
      _lgPreventCloseEvent: function(actor, event) {
          if(Clutter.EventType.BUTTON_PRESS == event.type()) {
              return true;
          }
      },

      /*
       * triggered when clear button is clicked
       */
      _clearEvent: function(actor, event) {
          let lookingGlass = actor._lookingGlass;
          let notebook = lookingGlass._notebook;
          let selectedIndex = notebook._selectedIndex;
          switch(notebook._tabs[selectedIndex].label.label)
          {
              case 'Evaluator':
                  lookingGlass._resultsArea.destroy_all_children();
                  break;
              case 'Windows':
                  lookingGlass._windowList.actor.destroy_all_children();
                  break;
              case 'Memory':
                  lookingGlass._memory.actor.destroy_all_children();
                  break;
              case 'Extensions':
                  lookingGlass._extensions.actor.destroy_all_children();
                  break;
          }
      }
});
