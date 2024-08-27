class ParticleManager{
	constructor(worldRef){
		this.particles = [];
		this.toRemove = [];
		this.world = worldRef;
	}

	deleteParticle(id){
		this.toRemove.push(id);
		this.world.deleteEntity(id);
	}

	update(dt){
		this.particles = this.particles.filter(x => !this.toRemove.includes(x));
		this.toRemove = [];
	}

	addParticle(type, id, x, y, w, h, col, lifetime=1, vel=[0,0], grav=0,rot=0){
		this.particles.push(id);
		this.world.addEntity(new Particle(this, type, id, x, y, w, h, col, lifetime, vel, grav,rot));
	}
	spawnLootPart(type,x,y,w,h,rot,vel){
		let id = "particle"+this.particles.length+math.random(0,1000);
		let r = w;
		let lifetime = 10*math.random(0.2,1.8);
		this.addParticle(type, id, x, y, r, r,"black" ,lifetime, vel,0,rot);
	}

	lootTrail(x,y){
		let id = "particle"+this.particles.length+math.random(0,1000);
		let r = 2*random(0.5,2);
		let lifetime = 0.5*math.random(0.2,1.8);
		let col = [250+random(-20,20), 250+random(-20,20), 60+random(-20,20)];
		this.addParticle("lootTrail", id, x, y, r, r, "RGB("+col[0]+","+col[1]+","+col[2]+")", lifetime, [0,0],500);
	}

	bloodSplatter(x,y,num,angle){
		let speed = 800;
		let type = "blood";
		for(let i = 0; i < num; i ++){
			let w = 5*math.random(0.5,1.5);
			let h = w;
			let col = "red";
			let lifetime = 2*math.random(0.2,1.8);
			let id = "particle"+this.particles.length+math.random(0,1000);
			let theta = angle+math.pi+random(-math.pi/8, math.pi/8);
			let dir = [math.cos(theta), math.sin(theta)];
			let vel = math.multiply(dir, speed*math.random(0.2,1.8));
			this.addParticle(type, id, x, y, w, h, col, lifetime, vel, 1000);
		}
	}
}

class Particle extends RigidBody{
	constructor(manager, type, id, x,y,w,h,col,lifetime,vel,grav,rot=0){
		super(id, x,y,w,h, "Particle");

		this.maxLifetime = lifetime;
		this.lifetime = this.maxLifetime;
		this.col = col;
		this.vel = vel;
		this.gravity = grav;
		this.manager = manager;
		this.type = type;
		this.angle = math.random(0, math.pi);
		this.drag = 0.9;
		this.lootImgs = [
			new image("assets/goblet.png"),
			new image("assets/coin.png"),
			new image("assets/ring.png"),
			new image("assets/ruby.png"),
		];
		this.rot = rot;
		console.log(this.rot);
	}

	draw(){
		let rect = getWorldRect(this.rect);
		//drawRect(this.rect, this.col, 1, this.col, this.lifetime/this.maxLifetime);
		//this.sprite.drawImg(rect[0],rect[1],rect[2],rect[3],this.lifetime/this.maxLifetime);
		if(this.type == "ring"){
			this.lootImgs[2].drawRotatedImg(rect[0],rect[1],rect[2],rect[3],this.lifetime/this.maxLifetime, this.rot, rect[2]/2, rect[3]/3);
		}else if(this.type == "goblet"){
			this.lootImgs[0].drawRotatedImg(rect[0],rect[1],rect[2],rect[3],this.lifetime/this.maxLifetime, this.rot, rect[2]/2, rect[3]/3);
		}else if(this.type == "ruby"){
			this.lootImgs[3].drawRotatedImg(rect[0],rect[1],rect[2],rect[3],this.lifetime/this.maxLifetime, this.rot, rect[2]/2, rect[3]/3);
		}else if(this.type == "coin"){
			this.lootImgs[1].drawRotatedImg(rect[0],rect[1],rect[2],rect[3],this.lifetime/this.maxLifetime, this.rot, rect[2]/2, rect[3]/3);
		}else{
			drawCircle(rect, this.w, this.col, 1, this.col, this.lifetime/this.maxLifetime);
		}
	}
	update(dt){
		this.lifetime -= dt;
		super.update(dt);
		if(this.lifetime <= 0){
			this.manager.deleteParticle(this.id);
		}
	}

}
