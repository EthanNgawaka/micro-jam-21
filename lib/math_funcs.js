// ------------ Math stuff ------------ //
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}
const identityTransform = [1,0,0,1,0,0];

function arrayRemove(arr, value) { 
    return arr.filter(function(ele){
        return ele != value;
    });
}

function blendCols(col1, col2, per){
    var R = col1[0] + (col2[0] - col1[0])*per;
    var G = col1[1] + (col2[1] - col1[1])*per;
    var B = col1[2] + (col2[2] - col1[2])*per;
    return [R, G, B];
}


function midPoint(point1, point2, per){
    var x = point1[0] + (point2[0] - point1[0])*per;
    var y = point1[1] + (point2[1] - point1[1])*per;
    return [x, y];
}

function onScreen(X, Y, size){
    return X+size > 0 && X-size < canvas.width && Y+size > 0 && Y-size < canvas.height;
}

function dist(X1, Y1, X2, Y2){
    return Math.hypot(X1-X2, Y1-Y2);
}

function RNG(seed) {
  // LCG using GCC's constants
  this.m = 0x80000000; // 2**31;
  this.a = 1103515245;
  this.c = 12345;

  this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}
RNG.prototype.nextInt = function() {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
}
RNG.prototype.nextFloat = function() {
  // returns in range [0,1]
  return this.nextInt() / (this.m - 1);
}
RNG.prototype.nextRange = function(start, end) {
  // returns in range [start, end): including start, excluding end
  // can't modulu nextInt because of weak randomness in lower bits
  var rangeSize = end - start;
  var randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
}
RNG.prototype.choice = function(array) {
  return array[this.nextRange(0, array.length)];
}
function getAngleBetweenAandB(vec1, vec2){
	let [dx, dy] = math.subtract([vec2[0], vec2[1]], [vec1[0], vec1[1]]);
	let theta = math.atan2(dy, dx);
	return theta;
}

function standardizeAngle(angle){
	return (angle + math.pi) % (math.pi*2);
}

function lnFunc(a, b, t){
	let diff = b-a;
	let func = math.max(0,1-(Math.log(4*(t+0.00001))/4 + 0.64));
	func = math.min(1,func);
	if(!func){
		func = 1;
	}
	console.log(func);
	return a+func*diff;
}

function random(min, max, round = false){
	if(round === false){
		return Math.random()*(max-min)+min;
	}else{
		return math.round(Math.random()*(max-min)+min);
	}
}

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}
function lerpArray(arr, targetArr, t){
    let targetPos = [arr[0]*(1-t)+targetArr[0]*t, arr[1]*(1-t)+targetArr[1]*t];
    return targetPos;
}
function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4){ //returns [x,y] of intersection, if there is no intersection then return false
	var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	if(den == 0){return false}
	var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
	var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
	if(t > 0 && t < 1 && u > 0){
		x = x1 + t * (x2 - x1);
		y = y1 + t * (y2 - y1);
		return [x,y];
	}else{
		return false;
	}
}

function mag(vec){
	return math.sqrt(vec[0]**2 + vec[1] ** 2);
}

function AABBCollision(rect1, rect2){
	let checks = [
        (rect1[0]+rect1[2] >= rect2[0]), (rect1[0] <= rect2[0]+rect2[2]),
        (rect1[1]+rect1[3] >= rect2[1]), (rect1[1] <= rect2[1]+rect2[3]),
	];
	for(i in checks){
		if(!checks[i]){
			return false;
		}
	}

	// just getting the min trans(trans!?!?!)lation vec
    ytv21 = rect2[1] - (rect1[1]+rect1[3]);
    ytv12 = (rect2[1]+rect2[3]) - rect1[1];

    xtv21 = rect2[0] - (rect1[0]+rect1[2]);
    xtv12 = (rect2[0]+rect2[2]) - rect1[0];
    
    ytv = math.abs(ytv21) < math.abs(ytv12) ? ytv21 : ytv12;
    xtv = math.abs(xtv21) < math.abs(xtv12) ? xtv21 : xtv12;
    
    mtv = math.abs(xtv) < math.abs(ytv) ? [xtv, 0] : [0,ytv];
    return mtv

}
// convert degrees to radians
function degreesToRadians(degrees) {
	return degrees * (math.pi / 180);
}

function enlargeRect(inputRect, a,b, preserveBottomVerticesY=false){
    let rect = inputRect;
    let transVec;
    if(preserveBottomVerticesY){
        transVec = [-(rect[0]+rect[2]/2),-(rect[1]+rect[3])]
    }else{
        transVec = [-(rect[0]+rect[2]/2),-(rect[1]+rect[3]/2)]
    }
    let vertices = [[rect[0],rect[1]],[rect[0]+rect[2],rect[1]],[rect[0]+rect[2],rect[1]+rect[3]],[rect[0], rect[1]+rect[3]]]
    for(let i in vertices){
        vertices[i] = math.add(vertices[i], transVec);
    }
    let L = [[a,0],[0,b]];

    for(let i in vertices){
        vertices[i] = math.multiply(L,vertices[i]);
    }
    
    for(let i in vertices){
        vertices[i] = math.subtract(vertices[i], transVec);
    }
    rect = [vertices[0][0],vertices[0][1],vertices[1][0]-vertices[0][0],vertices[2][1]-vertices[0][1]];
    return rect;
}

function scalMultiply(scalar, vec){
	return [scalar*vec[0], scalar*vec[1]];
}
function add(vec1, vec2){
	return [vec1[0]+vec2[0],vec1[1]+vec2[1]];
}
function normalize(vec){
	let r = Math.sqrt(vec[0]**2 + vec[1]**2);
	if(r == 0){
		r = 1;
	}
    return math.divide(vec, r);
}
