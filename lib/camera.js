// ------------ Camera stuff ------------ //
let Camera = {scale:1,x:0,y:0,target:[0,0],speed:0.1, shake: 0, shakeIntensity:50}
function getMousePos(){
	let mouseScreenX = mouse.x;
	let mouseScreenY = mouse.y;

	// Convert mouse position to camera space
	let mouseCameraX = mouseScreenX - (windowW / 2);
	let mouseCameraY = mouseScreenY - (windowH / 2);

	// Convert to world space
	mouseCameraX /= Camera.scale;
	mouseCameraY /= Camera.scale;

	// Adjust for camera position
	mouseCameraX += Camera.x + windowW/2;
	mouseCameraY += Camera.y + windowH/2;

	return [mouseCameraX, mouseCameraY];
}

function getWorldRect(rect){
    let [x, y, w, h] = rect;

    const canvasWidth = windowW;
    const canvasHeight = windowH;

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Translate to the center of the canvas
    x -= centerX;
    y -= centerY;

    // Apply camera transformations
    x -= Camera.x;
    y -= Camera.y;
    x *= Camera.scale;
    y *= Camera.scale;
    w *= Camera.scale;
    h *= Camera.scale;

    // Translate back from the center of the canvas
    x += centerX;
    y += centerY;

	return [x,y,w,h];
}

