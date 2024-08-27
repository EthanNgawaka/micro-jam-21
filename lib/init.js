/*
A small, simple javascript library for game making, currently dosent support sound.
has drawing functions for most shapes and input handing
*/

var canvas = document.getElementById("main");
canvas.setAttribute('draggable', false);

var c = canvas.getContext("2d");
document.addEventListener('contextmenu', event => event.preventDefault());

const windowW = canvas.width;
const windowH = canvas.height;

// seperated everything into their own files idk how that will go lets see
