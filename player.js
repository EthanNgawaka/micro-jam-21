class Player extends RigidBody{
	constructor(x,y){
		super("p1", x,y,64,64, "Player");
		this.gravity = 0;
		this.drag = 0.9;
		this.bag = {
			x:this.x,
			y:this.y,
			w:32,
			h:32,
			vel:[0,0],
			img: new image("assets/bag.png")
		};

		this.speed = 0;
		this.maxSpeed = 35;
		this.sneakSpeed = 10;

		this.loot_imgs = [
			new image("assets/goblet.png"),
			new image("assets/coin.png"),
			new image("assets/ring.png"),
			new image("assets/ruby.png"),
		];
		this.lookup = ["goblet", "coin", "ring", "ruby"];

		this.img = new image("assets/ruby.png");

		this.footStepTimerMax = 0.6;
		this.footStepTimer = this.footStepTimerMax;
		this.footsteps = [];
		this.stepGrowthRate = 500;
		this.loudFootstepRadius = 600;
		this.quietFootstepRadius = 250;

		this.dt = 0;

		this.sheet = new spriteSheet("assets/player_sheet.png", 64, 64, 5, this.x, this.y, this.w, this.h);
		this.sheet.addState("stationary", 1, 1);
		this.sheet.addState("right", 2, 3);
		this.sheet.addState("left", 3, 3);

		this.winding = 0;
		this.power = 0;
		this.loot = [];
		this.maxLootSpeed = 15;
		this.lootGrav = 1;
		this.world = null;
		this.scene = null;
		this.nextLvl = false;
		this.debug = false;
		if(this.debug){
			this.maxSpeed = 1000;
		}
	}

	onCollision(otherEntity){
		super.onCollision(otherEntity);
		if(otherEntity instanceof Monster){
			if(!this.debug){
				this.world.deleteEntity(this.id);
			}
		}
		if(otherEntity.id == "flag"){
			this.nextLvl = true;
		}
	}

	drawBag(){
		let plyCent = [this.center.x, this.center.y];
		let bagCent = [this.bag.x , this.bag.y];
		let threshold = 80;
		let dv = math.subtract(plyCent, bagCent);
		if(mag(dv) >= threshold){
			this.bag.vel = math.add(this.bag.vel, math.multiply(dv,0.01))// in the dir of plyr
		}

		this.bag.x += this.bag.vel[0];
		this.bag.y += this.bag.vel[1];

		this.bag.vel = math.multiply(this.bag.vel, 0.9);

		let [x,y,w,h] = getWorldRect(enlargeRect([this.bag.x, this.bag.y,this.bag.w, this.bag.h], 2.5, 2.5));
		let rot = getAngleBetweenAandB([this.bag.x,this.bag.y], [this.center.x+this.w/2, this.center.y+this.h/2]);
		c.save();
		c.translate(x, y);
		c.rotate(rot+math.pi/2);
		c.drawImage(this.bag.img.img,-w/2, -h/2, w, h);
		c.restore();
	}
	draw(){
		//drawRect(getWorldRect(this.rect), "blue");
		if(this.bag.y + this.bag.h/4 <= this.center.y){
			this.drawBag();
		}
		this.drawFootsteps();
		[this.sheet.x, this.sheet.y, this.sheet.draww, this.sheet.drawh] = getWorldRect(enlargeRect(this.rect, 2, 2));
		this.sheet.draw();
		this.sheet.frameCalc(0, this.speed/this.maxSpeed);
		if(this.bag.y + this.bag.h/4 > this.center.y){
			this.drawBag();
		}
		this.drawLoot();

		if(this.winding > 0){
			let [x,y,w,h] = getWorldRect([this.center.x, this.center.y - 100,0,0]);
			drawArc(x, y, 10, 360*this.power, "rgb(85, 255, 69)");
		}
	}

	update(dt){
		this.dt = dt;
		this.input(dt);
		super.update(dt);

		Camera.target = [this.center.x-windowW/2, this.center.y-windowH/2];
	}
	input(dt){
		this.speed = this.maxSpeed;
		let movementVec = [0,0];
		if(checkKey("ShiftLeft")){
			this.speed = this.sneakSpeed;
		}
		if(checkKey("KeyW")){
			movementVec[1] -= 1;
		}
		if(checkKey("KeyA")){
			movementVec[0] -= 1;
		}
		if(checkKey("KeyS")){
			movementVec[1] += 1;
		}
		if(checkKey("KeyD")){
			movementVec[0] += 1;
		}

		movementVec = normalize(movementVec);
		if(mag(movementVec) > 0){
			this.sheet.setState("right");
			if(movementVec[0] < 0){
				this.sheet.setState("left");
			}
			this.applyImpulse(math.multiply(movementVec, this.speed));
		}else{
			this.sheet.setState("stationary");
		}

		this.handleFootsteps(dt, movementVec);

		this.handleThrowing(dt);
	}
	drawLoot(){
		let toRm = [];
		for(let obj of this.loot){
			let t = obj.lifetime;
			//let changeVec = math.multiply(obj.dir, (1-t)*mag(obj.changeVec)*obj.power);
			let x = lerp(obj.target[0], obj.x, t)
			let h = 1000;
			let y = lerp(obj.target[1], obj.y, t) - h*(-t*(t-1));
			
			if(obj.lifetime <= 0){
				console.log(obj.rot)
				let dir = math.multiply(-obj.power*1000,normalize(math.subtract([obj.x,obj.y],obj.target)));
				let type = this.lookup[obj.index];
				this.scene.particleManager.spawnLootPart(type,x,y,100,100,obj.rot,dir);
				Camera.shake = 0.1;
				Camera.shakeIntensity = 10;
			}
			if(math.floor(obj.lifetime*10)%2 == 0){
				this.scene.particleManager.lootTrail(x,y);
			}

			//drawCircle(getWorldRect([x, y, 0, 0]), 10, "black",0,"yellow",1,3);
			[x,y,w,h] = getWorldRect([x,y,100,100]);
			//this.img.drawRotatedImg(x,y,w,h,1,obj.rot,-w/2,-h/2);
			//this.img.drawImg(10,10,30,30,1);
			//c.drawImage(this.img.img, x,y,w,h);
			c.save();
			c.translate(x, y);
			c.rotate(obj.rot);
			c.drawImage(obj.img.img,-w/2, -h/2, w, h);
			c.restore();
			obj.rot += obj.lifetime*math.pi/9;

			if(obj.lifetime <= 0){
				toRm.push(obj);
			}
			obj.lifetime -= this.dt;
		}
		for(let obj of toRm){
			console.log(obj);
			this.makeFootstep(this.loudFootstepRadius, obj.target[0], obj.target[1]);
			this.loot = arrayRemove(this.loot, obj);
			for(let i = 0; i < 3; i++){
				sfx.metal[random(0,4,true)].volume(0.2);
				sfx.metal[random(0,4,true)].play();
			}
		}
	}

	handleThrowing(dt){
		if(mouse.down.left){
			this.winding += dt;
			this.power = math.min(1, this.winding * 1.5)
		}else{
			if(this.winding > 0){
				this.power = math.min(1, this.winding * 1.5);
				this.winding = 0;

				let [mouseX, mouseY] = getMousePos();
				let [dx, dy] = [mouseX - this.center.x,mouseY - this.center.y];

				let target = [this.center.x+dx*this.power, this.center.y+dy*this.power];
				let ind = random(0,3,true);
				sfx.hit.play();
				Camera.shake = 0.1;
				Camera.shakeIntensity = 10;
				this.loot.push({
					x: this.center.x,
					y: this.center.y,
					target: target,
					lifetime: 1,
					power: this.power,
					img: this.loot_imgs[ind],
					rot:0,
					index: ind
				});
			}
		}
	}

	makeFootstep(maxRadius, x=this.center.x, y=this.center.y){
		this.footsteps.push({
			x: x,
			y: y,
			maxR: maxRadius,
			r: 0,
			id: random(0, 1000000),
		});
	}

	handleFootsteps(dt, movementVec){
		if(this.footStepTimer <= 0){
			if(mag(movementVec) > 0){
				this.footStepTimer = this.footStepTimerMax/math.min(2,this.speed/this.sneakSpeed);
				this.makeFootstep((this.speed == this.sneakSpeed) ? this.quietFootstepRadius : this.loudFootstepRadius);

				let layers = 2;
				for(let i = 0; i < layers; i++){
					let index = random(0, 4, true);
					//let index2 = random(5, 9, true);
					if(this.speed == this.sneakSpeed){
						sfx.step[index].volume(random(0.5, 1)*0.3);
						//sfx.step[index2].volume(0.3);
					}else{
						sfx.step[index].volume(random(0.5, 1));
						//sfx.step[index2].volume(1);
					}
					sfx.step[index].play();
					//sfx.step[index2].play();
				}
			}
		}else{
			this.footStepTimer -= dt;
		}
	}

	drawFootsteps(){
		let footstepsToDel = [];
		for(let step of this.footsteps){
			let [x, y, w, h] = getWorldRect([step.x, step.y, 0, 0]);
			let pos = [x, y];
			let ratio = 1 - step.r/step.maxR;
			drawCircle(pos, step.r, "black", 0, "black", ratio, 10*ratio);
			step.r += this.dt*this.stepGrowthRate;
			if(step.r > step.maxR){
				footstepsToDel.push(step);
			}
		}

		for(let stepToRm of footstepsToDel){
			this.footsteps = arrayRemove(this.footsteps, stepToRm);
		}
	}
}
