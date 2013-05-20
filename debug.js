/*
 * simply use debug function to show some message.
 * note that the message area cannot be clear until you restart the shell.
 */
const St = imports.gi.St;
const Main = imports.ui.main;

var test = new St.Button({style_class:'debug-text',can_focus: true});
test.set_position(100,200);
test.hide();
test.connect("button-press-event", _test);
Main.uiGroup.add_actor(test);

function _test() {
  test.hide();
}

function debug(text) {
  test.label = text;
  test.show();
}
