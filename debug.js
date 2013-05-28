/*
 * simply use debug function to show some message.
 * note that the message area cannot be clear until you restart the shell.
 */
const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;

const Debug = new Lang.Class({
    Name: "Debug",

    _init: function() {
        let test = new St.Label({ style_class:'debug-text' });
        this.label = test;
        test.set_position(100,200);
        test.hide();
        Main.uiGroup.add_actor(test);
    },
    
    show: function(text) {
      this.label.text = this.label.text + text.toString() + "\n";
      this.label.show();
    }
});
