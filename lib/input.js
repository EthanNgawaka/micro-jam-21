// ------------ Input stuff ------------ //
// Old gamepad stuff, probably still works but could be better
let gamepads = {};
window.addEventListener(
    "gamepadconnected",
    (e) => {
      gamepadHandler(e, true);
    },
    false
  );
  window.addEventListener(
    "gamepaddisconnected",
    (e) => {
      gamepadHandler(e, false);
    },
    false
  );
function gamepadHandler(e,connect){
    gamepad = e.gamepad;
    if(connect){
        gamepads[gamepad.index] = gamepad;
    }else{
        delete gamepads[gamepad.index];
    }
}
// Mouse
var mouse = {x: 0, y: 0, scroll:0,oldx: 0, oldy: 0,
	pressed: {left: false, middle: false, right: false},
	downOld: {left: false, middle: false, right: false},
	down: {left: false, middle: false, right: false}
};

var oldMouseDelta = {x:0,y:0}

this.canvas.addEventListener('wheel',function(event){
    mouse.scroll = event
    event.preventDefault();
}, false);

canvas.addEventListener('mousemove', function(evt) {
    mouse.oldx = mouse.x
    mouse.oldy = mouse.y
    mouse.x = evt.clientX - canvas.getBoundingClientRect().left;
    mouse.y = evt.clientY - canvas.getBoundingClientRect().top;
}, false);

function mouseUpdate(){
	if(mouse.down.right && !mouse.downOld.right){
		mouse.pressed.right = true;
		mouse.downOld.right = true;
	}else{
		mouse.pressed.right = false;
	}
	if(mouse.down.middle && !mouse.downOld.middle){
		mouse.pressed.middle = true;
		mouse.downOld.middle = true;
	}else{
		mouse.pressed.middle = false;
	}
	if(mouse.down.left && !mouse.downOld.left){
		mouse.pressed.left = true;
		mouse.downOld.left = true;
	}else{
		mouse.pressed.left = false;
	}
}
canvas.addEventListener('mousedown', function(event){
    switch (event.button) {
        case 0:
            mouse.down.left = true;
            break;
        case 1:
			mouse.pressed.middle = !(mouse.downOld.middle)
            mouse.down.middle = true;
            break;
        case 2:
			mouse.pressed.right = !(mouse.downOld.right)
            mouse.down.right = true;
            break;
    }
});

canvas.addEventListener('mouseup', function(event){
    switch (event.button) {
        case 0:
			mouse.pressed.left = false;
            mouse.down.left = false;
            mouse.downOld.left = false;
            break;
        case 1:
            mouse.pressed.middle = false;
            mouse.down.middle = false;
            break;
        case 2:
            mouse.pressed.right = false;
            mouse.down.right = false;
            break;
    }
});

// Keyboard
let keys = {};
let oldKeys = {};
let keyCodeConversion = {}
document.addEventListener('keydown', function(event) {
    keys[event.code] = true;
    keyCodeConversion[event.code] = event.key;
});
document.addEventListener('keyup', function(event) {
    keys[event.code] = false;
});

function checkKey(key){
    return key in keys && keys[key];
}
function keyPressed(key){
    if(checkKey(key) && !(key in oldKeys && oldKeys[key])){
        return true;
    }else{
        return false;
    }
}
