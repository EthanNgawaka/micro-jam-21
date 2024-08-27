let sceneManager = new SceneManager();

/*
let sound = new Howl({
	src: ["kill_him.ogg"],
});
*/

let sfx = {
	tick: new Howl({src:["assets/tick.ogg"]}),
	cave: new Howl({
		src:["assets/cave.ogg"],
		autoplay:true,
		loop:true,
		volume:5,
		onend: function(){console.log("DONE")},
		onplay: function(){console.log("PLAY")},
	}),
	hit: new Howl({src:["assets/hit4.ogg"]}),
	seen: new Howl({src:["assets/gameover5.ogg"]}),
	step: [
		// stone step sounds
		new Howl({src:["assets/step1.ogg"]}),
		new Howl({src:["assets/step2.ogg"]}),
		new Howl({src:["assets/step3.ogg"]}),
		new Howl({src:["assets/step4.ogg"]}),
		new Howl({src:["assets/step5.ogg"]}),
		// grass sounds for overlay
		new Howl({src:["assets/step6.ogg"]}),
		new Howl({src:["assets/step7.ogg"]}),
		new Howl({src:["assets/step8.ogg"]}),
		new Howl({src:["assets/step9.ogg"]}),
		new Howl({src:["assets/step10.ogg"]}),
	],
	metal: [
		// metal
		new Howl({src:["assets/metal1.ogg"]}),
		new Howl({src:["assets/metal2.ogg"]}),
		new Howl({src:["assets/metal3.ogg"]}),
		new Howl({src:["assets/metal4.ogg"]}),
		new Howl({src:["assets/metal5.ogg"]}),
	]
};
Howler.volume(0.7);

Camera.scale = 0.4
let currLevel = 0;
let floorImgs=[
];
let weights = {
	0: 4,
	1: 1,
	2: 1,
	3: 2,
	4: 1,
	5: 4,
	6: 2,
	7: 8,
	8: 6,
	9: 8,
	10: 3,
}
for(let i = 0; i < 11; i++){
	let weight = weights[i];
	for(let j = 0; j < weight; j++){
		floorImgs.push(new image("assets/floor"+(i+1)+".png"));
	}
}
let floorIndexes = {};
let dens = 300
let circlePoints = [];
for(let i = 0; i < dens; i++){
	circlePoints.push([0,0,random(0,20)])
}

function drawFloor(){
	let invScl = 0.5 + 1/Camera.scale;
	let w = 50*3.5;
	let h = 50*3.5;
	let x = math.floor((Camera.x-windowW*0.8*invScl)/w)*w;
	let y = math.floor((Camera.y-windowH*0.8*invScl)/h)*h;
	for(let i = 0; i < windowW*2*invScl/w; i++){
		for(let j = 0; j < windowH*2*invScl/h; j++){
			let rect = getWorldRect([x+i*w, y+j*h, w+1, h+1]);
			if([x+i*w, y+j*h] in floorIndexes){
				index = floorIndexes[[x+i*w, y+j*h]];
			}else{
				floorIndexes[[x+i*w, y+j*h]] = random(0,floorImgs.length-1,true);
				index = floorIndexes[[x+i*w, y+j*h]];
			}

			//console.log(index);
			floorImgs[index].drawImg(rect[0],rect[1],rect[2],rect[3],1,0);
		}
	}
}

class Level extends Scene{
	constructor(name, reset=false, entities){
		super(name);
		this.doReset = reset;
		this.initEntities = entities;
		this.world = null;
		this.particleManager = null;
	}
	enter(){
		if(this.doReset){
			this.init();
		}else{
			console.log("this scene will not reset");
		}
	}
	exit(){
		this.world = null;
	}
	reset(){
		sceneManager.switchTo(this.name);
	}
	init(){
		this.world = new World(this);
		this.particleManager = new ParticleManager(this.world);
		let newCollisionRules = {
			"Player": ["Monster", "Flag", "Wall"],
			"Monster": ["Player", "Wall"],
			"Flag": ["Player"],
			"Wall": ["Player", "Monster"],
			"Particle":[],
		};
		Howler.stop();
		sfx.cave.play();
		this.world.updateCollisionRules(newCollisionRules);

		for(let entity of this.initEntities){
			let clone = Object.assign(Object.create(Object.getPrototypeOf(entity)), entity);
			this.world.addEntity(clone);
		}
		// js sucks at cloning instances
		try{
			this.world.entities['p1'].loot = [];
			this.world.entities['p1'].footsteps = [];
			this.world.entities['monster'].audioPositions = [];
			this.world.entities['monster'].state = "patrol";
			this.world.entities['monster'].huntTime = 0;
			this.world.entities['monster'].spawnTimer = 1;
		}
		catch(e){
		}
	}
	update(dt){
		super.update(dt);
		if(this.world.entities["p1"]){
			if(this.world.entities["p1"].nextLvl){
				currLevel += 1;
				nextLevel();
			}
		}else{
			this.reset();
		}
		this.particleManager.update(dt);
	}
}
class Flag extends StaticBody{
	constructor(x, y, w, h){
		super("flag", x,y,w,h,"Flag");
	}
	draw(){
		drawRect(getWorldRect(this.rect), "yellow", 1, "yellow", 0.2);
	}
}
function addBounds(boundingBox){
	return [
		new StaticBody("bound1", zero, zero, boundingBox[0]-zero, -zero, "Wall",false),
		new StaticBody("bound2", zero, 0, 100-zero, boundingBox[1], "Wall",false),
		new StaticBody("bound3", zero, boundingBox[1], boundingBox[0]-zero, -zero, "Wall",false),
		new StaticBody("bound4", boundingBox[0], zero, 100-zero, boundingBox[1]-zero*2, "Wall",false),
		new StaticBody("balls1", 0, 0, boundingBox[0], 0, "Wall",true),
		new StaticBody("balls2", 0, 0, 100, boundingBox[1], "Wall",true),
		new StaticBody("balls3", 0, boundingBox[1], boundingBox[0], 100, "Wall",true),
		new StaticBody("balls4", boundingBox[0], 0, 100, boundingBox[1], "Wall",true),
	];
}
let boundingBox = [windowW*5.6,windowH*2];
let zero = -windowW*4;

let tut_entities = [
	new Player(164,windowH),
	// make flag class
	new Flag(boundingBox[0] - 100, 0, 100, windowH*2),
];
addBounds(boundingBox).forEach((el) => tut_entities.push(el));
let tut = new Level("tut", true, tut_entities);
sceneManager.addScene(tut);
// ----------- //

// levels
// LVL 1
let patrol_nodes =[
	[200, windowH],
	[windowW*4 - 200, windowH]
];
boundingBox = [windowW*4, windowH*2];
let lvl_entities = [
	new Player(750,164),
	new Monster(windowW*2, windowH, patrol_nodes),
	// make flag class
	new Flag(windowW*4 - 100, 0, 100, windowH*2),
	new StaticBody("wall5", 500, 250, 500, 200, "Wall"),
	new StaticBody("wall6", windowW*2, windowH*2 - 400, 500, 200, "Wall"),
];
addBounds(boundingBox).forEach((el) => lvl_entities.push(el));
let lvl = new Level("lvl1", true, lvl_entities);
sceneManager.addScene(lvl);
// ----------- //
// LVL 2

patrol_nodes =[
	[windowW, windowH*3.5],
	[windowW, windowH*0.3]
];
boundingBox = [windowW*2, windowH*4];
lvl_entities = [
	new Player(32,32),
	new Monster(windowW, windowH*3.5, patrol_nodes),
	// make flag class
	new Flag(0, windowH*4 - 100, windowW*2, 100),
	new StaticBody("wall5", 0, windowH*2.5, windowW/1.2, 100, "Wall"),
	new StaticBody("wall6", windowW*2 - windowW/1.2, windowH*2.5, windowW/1.2, 100, "Wall"),
	new StaticBody("wall7", 0, windowH*0.5, windowW/1.2, 100, "Wall"),
];
addBounds(boundingBox).forEach((el) => lvl_entities.push(el));
lvl = new Level("lvl2", true, lvl_entities);
sceneManager.addScene(lvl);
// ----------- //
// LVL 3
patrol_nodes =[
	[windowW + 150, windowH*1.7],
	[windowW + 150, windowH*0.3]
];
boundingBox = [windowW*2, windowH*2];
lvl_entities = [
	new Player(200,164),
	new Monster(windowW + 150, windowH*1.7, patrol_nodes),
	// make flag class
	new Flag(windowW*2 - 100, 0, 100, windowH*2),
	new StaticBody("wall5", windowW, 300, 100, windowH*2 - 500, "Wall"),
	//new StaticBody("wall6", windowW*2, windowH*2 - 400, 500, 200, "Wall"),
];
addBounds(boundingBox).forEach((el) => lvl_entities.push(el));
lvl = new Level("lvl3", true, lvl_entities);
sceneManager.addScene(lvl);
// ----------- //
// LVL 4
patrol_nodes =[
	[windowW-32, windowH*2.7],
	[windowW-32, windowH*0.3]
];
boundingBox = [windowW*2, windowH*3];
lvl_entities = [
	new Player(200,windowH*1.5),
	new Monster(windowW, windowH*1.7, patrol_nodes),
	// make flag class
	new Flag(windowW*2 - 100, 0, 100, windowH*3),
	new StaticBody("wall5", 0, 0, windowW*0.8, windowH*1.2, "Wall"),
	new StaticBody("wall6", 0, windowH*1.8, windowW*0.8, windowH*1.2, "Wall"),
	new StaticBody("wall7", windowW*1.2, 0, windowW*0.8, windowH*1.2, "Wall"),
	new StaticBody("wall8", windowW*1.2, windowH*1.8, windowW*0.8, windowH*1.2, "Wall"),
	//new StaticBody("wall6", windowW*2, windowH*2 - 400, 500, 200, "Wall"),
];
addBounds(boundingBox).forEach((el) => lvl_entities.push(el));
lvl = new Level("lvl4", true, lvl_entities);
sceneManager.addScene(lvl);
// ----------- //
boundingBox = [0,0,windowW*3, windowH*3];
// LVL 5
patrol_nodes =[
	[boundingBox[2] - 300, 200],
	[boundingBox[2] - 300, boundingBox[3] - 200],
	[300, boundingBox[3] - 200],
	[300, 200],
];
let innerBox = enlargeRect(boundingBox, 0.6, 0.6);
lvl_entities = [
	new Player(boundingBox[2]*0.6,windowH*0.3),
	new Monster(boundingBox[2] - 300, 200, patrol_nodes),
	// make flag class
	new Flag(boundingBox[2]*0.5-150, 100, 100, 350),
	// bounding box
	new StaticBody("wall1", zero, zero, boundingBox[2]-zero*2, 100-zero, "Wall"),
	//new StaticBody("wall2", 0, 0, 100, boundingBox[3], "Wall"),
	new StaticBody("wall2", zero, 0, 100-zero, boundingBox[3]*0.3, "Wall"),
	new StaticBody("wall3", zero, boundingBox[3]*0.7, 100-zero, boundingBox[3]*0.3+100, "Wall"),
	//new StaticBody("wall2", 0, 0, 100, boundingBox[3], "Wall"),
	new StaticBody("wall4", zero, boundingBox[3]+100, boundingBox[2]+100-zero, 100-zero, "Wall"),
	new StaticBody("wall5", boundingBox[2], 0, 100-zero, boundingBox[3]+100-zero, "Wall"),
	//
	new StaticBody("wall6", boundingBox[2]/2-50, 0, 100, boundingBox[3]/2, "Wall"),
	new StaticBody("wall7", innerBox[0], innerBox[1], innerBox[2], innerBox[3],"Wall"),
	new StaticBody("wall8", zero-windowW, boundingBox[3]*0.3-100-zero, windowW, 100, "Wall"),
	new StaticBody("wall9", zero-windowW, boundingBox[3]*0.7, windowW-zero, 100, "Wall"),
	new StaticBody("wall10", zero-windowW, boundingBox[3]*0.3, 100-zero, boundingBox[3]*0.4, "Wall"),
];
lvl = new Level("lvl5", true, lvl_entities);
sceneManager.addScene(lvl);
// ----------- //
// LVL 6
patrol_nodes =[
	[windowW*1.5, windowH*0.3],
	[windowW*1.5, windowH*1.7]
];
boundingBox = [windowW*3, windowH*2];
lvl_entities = [
	new Player(200,windowH*1),
	new Monster(windowW*1.5, windowH*1, patrol_nodes),
	// make flag class
	new Flag(windowW*3 - 100, 0, 100, windowH*3),
	//new StaticBody("wall6", windowW*2, windowH*2 - 400, 500, 200, "Wall"),
];
addBounds(boundingBox).forEach((el) => lvl_entities.push(el));
lvl = new Level("lvl6", true, lvl_entities);
sceneManager.addScene(lvl);
// ----------- //
// LVL 7
patrol_nodes =[
	[windowW*1.5, windowH*0.3],
	[windowW*1.5, windowH*4.7],
	[windowW*0.4, windowH*4.7],
];
boundingBox = [windowW*2, windowH*5];
lvl_entities = [
	new Player(200,windowH*1),
	new Monster(windowW*1.5, windowH*1, patrol_nodes),
	// make flag class
	new Flag(100, boundingBox[1]*0.8, 100, windowH*3),
	new StaticBody("wall6", 0, boundingBox[1]*0.2, boundingBox[0]/2, boundingBox[1]*0.6, "Wall"),
	new StaticBody("wall7", 0, boundingBox[1]*0.2, boundingBox[0]*0.7, 100, "Wall"),
	new StaticBody("wall8", boundingBox[0]*0.45, boundingBox[1]*0.8+200, boundingBox[0]*0.2, 100, "Wall"),
	new StaticBody("wall9", boundingBox[0]*0.45, boundingBox[1]*0.8, 100, 200, "Wall"),
	new StaticBody("wall10", boundingBox[0]*0.6, boundingBox[1]*0.8+100, 100, 200, "Wall"),
];
addBounds(boundingBox).forEach((el) => lvl_entities.push(el));
lvl = new Level("lvl7", true, lvl_entities);
sceneManager.addScene(lvl);
// ----------- //
// LVL 8
patrol_nodes =[
	[windowW*0.3, windowH*2.9],
	[windowW*4.7, windowH*2.9],
];
boundingBox = [windowW*5, windowH*4];
lvl_entities = [
	new Player(200,windowH*1),
	new Monster(windowW*0.5, windowH*2.6, patrol_nodes),
	// make flag class
	new Flag(boundingBox[0]*0.8, 0, boundingBox[0]*0.2, 100),
	new StaticBody("wall6", boundingBox[0]*0.2, 0, boundingBox[0]*0.6, boundingBox[1]*0.5, "Wall"),
];
addBounds(boundingBox).forEach((el) => lvl_entities.push(el));
lvl = new Level("lvl8", true, lvl_entities);
sceneManager.addScene(lvl);
// ----------- //

let levels = ["tut", "lvl1", "lvl2", "lvl3","lvl6", "lvl7", "lvl8","lvl4",];
currLevel = 0;
nextLevel();

function nextLevel(){
	sceneManager.switchTo(levels[currLevel]);
}

function updateCamera(dt){
	let lerpPos = lerpArray([Camera.x, Camera.y], Camera.target, 0.3);
	if(Camera.shake > 0){
		Camera.shake -= dt;
		lerpPos[0] += math.random(-Camera.shakeIntensity, Camera.shakeIntensity);
		lerpPos[1] += math.random(-Camera.shakeIntensity, Camera.shakeIntensity);
	}else{
		Camera.shakeIntensity = 50;
	}

	[Camera.x, Camera.y] = lerpPos;
}

let off = [0,0];
let strings = [
	"Ugh... My head... What is this place?.....",
	"I need to find a way out.....",
	"Well I might as well bring the loot we found, it's not like anyone else will be needing it......",
];
let speech = new image('assets/speech.png');
let textRect = [windowW*0.1, windowH*0.65, windowW*0.8, windowH*0.3]
let textBox = new TextBox(
	"",
	textRect,
	40,
	"black", 
	off,
);

tut_text_timer = 0;
curr_strdex = 0;
curr_slice = 0;
done_with_intro = false;
let instructions = new image('assets/instructions.png');

let lightR = 400;

function draw(){
	c.save();
	drawRect([0,0,windowW,windowH],"black");
	let [x, y, r] = [windowW/2, windowH/2, lightR];
	lightR = lerp(lightR, lightR+random(-10,10), 0.1);
	const grad = c.createRadialGradient(x,y,0,x,y,r);
	grad.addColorStop(0, 'rgba(255, 255, 255, 1)'); // White color at the center
	grad.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Transparent at the edge
	c.beginPath();
	if(sceneManager.transitionTimer > 0){
		let u = sceneManager.transitionTimer;
		let t = math.exp(-20*((u-0.5)**2));
		r*=1-t;
		r = math.max(0, r-1);
	}
	c.arc(x, y, r, 0, 2 * Math.PI);
	c.fillStyle = grad;
	c.fill();
	c.closePath();
	c.clip();
	drawFloor();
	if(currLevel == 0&&sceneManager.transitionTimer <= 0.5){
		let inst = getWorldRect([400,windowH/2,1536*3.5,192*3.5]);
		instructions.drawImg(inst[0],inst[1],inst[2],inst[3], 1);
	}
	sceneManager.draw();
	c.restore();
	for(let i = 0; i < dens; i++){
		let brown = 20;
		let point = [windowW/2,windowH/2,10];
		let theta = math.pi*2*i/dens;
		point[0] += lightR*math.cos(theta);
		point[1] += lightR*math.sin(theta);
		circlePoints[i] = [
			lerp(circlePoints[i][0], circlePoints[i][0]+random(-brown, brown), 0.05),
			lerp(circlePoints[i][1], circlePoints[i][1]+random(-brown, brown), 0.05),
			math.max(5,math.min(4,lerp(circlePoints[i][2], circlePoints[i][2]*random(0.2, 1.8), 0.1))),
		];

		let pos = [circlePoints[i][0]+point[0], circlePoints[i][1]+point[1]];
		if(mag([circlePoints[i][0],circlePoints[i][1]]) > 20){
			circlePoints[i] = [
				lerp(circlePoints[i][0], 0, 0.65),
				lerp(circlePoints[i][1], 0, 0.65),
				circlePoints[i][2]
			];
		}
		drawCircle(pos, circlePoints[i][2]*point[2], "black");
	}
	if(currLevel == 0 && sceneManager.transitionTimer <= 0.25 && !done_with_intro){ // if tut
		let temp_rect = enlargeRect(textRect, 1.1, 1.2);
		speech.drawImg(temp_rect[0]-20, temp_rect[1]-15, temp_rect[2]+40, temp_rect[3], 1);
		textBox.draw();
		if(tut_text_timer <= 0){
			textBox.string += strings[curr_strdex][curr_slice];
			if(strings[curr_strdex][curr_slice] == "."){
				tut_text_timer = 15;
			}else{
				tut_text_timer = 1;
			}
			curr_slice+=1;
			sfx.tick.play();
			if(curr_slice >= strings[curr_strdex].length){
				if(curr_strdex < strings.length -1){
					curr_strdex += 1;
					textBox.string = "";
					curr_slice = 0;
				}else{
					done_with_intro = true;
					curr_slice-=1;
				}
			}
		}else{
			tut_text_timer -= 0.3;
		}
	}
}

function update(dt){
	sceneManager.update(dt);
	updateCamera(dt);

}

let mainMenu = true;
let previousTime = 0
let menuTmr = 0;
let slice = 0;
let menuStr = "You can't quite remember what happened...                                                You were with your party, exploring the crypt you had been tipped off about...                                                                           You had found it! Just like that old wizard had said, untold riches for all of you to partake.                                                       A shame it ended up like this, the cave must have collapsed or something... You can't see anyone else around... I wonder what happened to them...                           You can't worry about that now, you must survive. THE ABYSS.....";
menuText = new TextBox("", [windowW*0.2, windowH*0.1, windowW*0.6, windowH*0.8], 30, "white", [0,0]);
done = false;

function main(currentTime){ // requestAnimationFrame passes in a timestamp
	if(previousTime < 150){previousTime=currentTime;} // prevents skipping at startup
	const dt = (currentTime-previousTime)/1000; // in seconds
	previousTime = currentTime;

	if(!done){
		if(mainMenu){
			drawRect([0,0,windowW,windowH], "black");
			menuText.draw();
			if(menuTmr <= 0){
				menuText.string += menuStr[slice];
				if(menuStr[slice] == "."){
					menuTmr = 0.9;
					sfx.tick.play();
				}else if(menuStr[slice] != " "){
					menuTmr = 0.08;
					sfx.tick.play();
				}
				slice += 1;
				if(slice >= menuStr.length){
					mainMenu = false;
				}
			}else{
				menuTmr -= dt;
			}

		}else{
			update(dt);
			draw();
		}
	}else{
		drawRect([0,0,windowW,windowH], 'black');
		let x = windowW*0.5;
		let y = windowH*0.1;
		let off = 60;
		let size = 30;
		showText("Congratulations! you beat THE ABYSS.",x,y,size,"white");
		y+=off;
		showText("Created by Willow in 48Hrs for 'Micro Jame 21'",x,y,size,"white");
		y+=off;
		showText("The theme was 'underground' and 'starting with loot'",x,y,size,"white");
		y+=off;
		showText("Thanks for playing and I hope you enjoyed uwu",x,y,size,"white");
		y+=off;
		showText("If you see this, comment: ",x,y,size,"white");
		y+=off;
		showText("She THE on my ABYSS till I get trapped underground", x, y, size, "white");
		y+=off;
		showText("with no way to contact the outside world", x, y, size, "white");
		y+=off;
		showText("Have a lovely day <3",x,y,size,"white");

	}
	if(currLevel > levels.length){
		done = true;
	}

	oldKeys = {...keys};
	mouseUpdate();

	// recursive loop
	requestAnimationFrame(main);
}

requestAnimationFrame(main);
