const gravity = 2000;
const airFric = 0.98;
const FIXED_TIMESTEP = 1/60;

class Collider{
	constructor(rect, tag){
		this.rect = rect;
		this.tag = tag;
	}

	checkCollision(otherCollider){
		return AABBCollision(this.rect, otherCollider.rect);
	}
}

class Entity{
	constructor(id, x, y, w, h, collisionTag){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.collider = new Collider(this.rect, collisionTag);
		this.id = id;
	}

	checkCollision(otherEntity){
		if(this.collider.checkCollision(otherEntity.collider)){
			this.onCollision(otherEntity);
			otherEntity.onCollision(this);
			//console.log("collision between "+this.id+" and "+otherEntity.id);
		}
	}

	update(dt){ // to be overriden
		console.log("Update was not overriden! entity_id: " + this.id);
	}
	
	draw(){ // to be overriden
		console.log("Draw was not overriden! entity_id: " + this.id);
	}

	onCollision(otherEntity){ // to be overriden
		console.log("Collided with entity_id:" + otherEntity.id);
	}
	
	get rect(){
		return [this.x,this.y,this.w,this.h];
	}

	get center(){
		return {x:this.x+this.w/2, y:this.y+this.h/2};
	}
}

class RigidBody extends Entity{
	constructor(id, x, y, w, h, collisionTag, invMass=1, coeff_restitution=0.1, grav=gravity, drag=airFric){
		super(id, x, y, w, h, collisionTag);
		this.invMass = invMass; // and other various physics attributes
		this.coeff_restitution = coeff_restitution;
		this.vel = [0, 0];
		this.forces = [0,0];
		this.gravity = grav;
		this.drag = drag
	}

	update(dt){
		// pass this physics step if dt is too large cause im too lazy to do 
		// continuous collision
		let accel = math.multiply(this.invMass, this.forces);
		this.forces = [0, this.gravity/this.invMass];

		this.vel = math.add(this.vel, math.multiply(accel, dt));
		this.vel = math.multiply(this.drag, this.vel);

		this.x += this.vel[0]*dt;
		this.y += this.vel[1]*dt;

		this.collider.rect = this.rect;
	}

    handleCollisionWithStaticBody(otherEntity, mtv) {
        this.x += mtv[0];
        this.y += mtv[1];
        this.collider.rect = this.rect;

        const norm = normalize(mtv);
        const invM1 = this.invMass;
        const invM2 = 0;
        const rel_vel = math.dot(this.vel, norm);
        const et = this.coeff_restitution;
        const Vj = -(1 + et) * rel_vel;
        const J = Vj / (invM1 + invM2);

        this.applyImpulse(math.multiply(norm, J));
    }

    handleCollisionWithRigidBody(otherEntity, mtv) {
        const offset = 0.5;

        this.x += mtv[0] * offset;
        this.y += mtv[1] * offset;
        this.collider.rect = this.rect;

        const e_1 = this.coeff_restitution;
        const e_2 = otherEntity.coeff_restitution;
        const invM1 = this.invMass;
        const invM2 = otherEntity.invMass;
        const norm = normalize(mtv);
        const rel_vel = math.dot(math.subtract(this.vel, otherEntity.vel), norm);
        const et = math.max(e_1, e_2);
        const Vj = -(1 + et) * rel_vel;
        const J = Vj / (invM1 + invM2);

        this.applyImpulse(math.multiply(norm, J));
    }

    onCollision(otherEntity) {
        const mtv = this.collider.checkCollision(otherEntity);
        if (otherEntity instanceof StaticBody) {
            this.handleCollisionWithStaticBody(otherEntity, mtv);
        } else if (otherEntity instanceof RigidBody) {
            this.handleCollisionWithRigidBody(otherEntity, mtv);
        }
	}

	applyImpulse(J){ // J represents the impulse (mag x dir)
		this.vel = math.add(this.vel, math.multiply(this.invMass, J));
	}

	applyForce(forceVec){
		this.forces = math.add(this.forces, forceVec);
	}

	draw(){
		// drawing can be handled by child classes
		drawRect(this.rect, "black");
	}
}

class StaticBody extends Entity{
	constructor(id, x, y, w, h, collisionTag, doParticles=true){
		super(id, x, y, w, h, collisionTag);
		this.invMass = 1; // and other various physics attributes
		this.points = [];
		if(collisionTag == "Wall" && doParticles){
			//bottom
			this.genPoints([this.x,this.y+this.h],[this.x+this.w,this.y+this.h],0.1);
			//top
			this.genPoints([this.x,this.y],[this.x+this.w,this.y],0.1);
			//left
			this.genPoints([this.x,this.y],[this.x,this.y+this.h],0.1);
			//right
			this.genPoints([this.x+this.w,this.y],[this.x+this.w,this.y+this.h],0.1);
		}
	}

	genPoints(p1,p2,density){
		let threshold = 5000;
		let dv = math.subtract(p1,p2);
		let length = mag(dv);
		let numOfPoints = math.floor(length*density);
		for(let i = 0; i <= numOfPoints;i++){
			let t = i/numOfPoints;
			let p_n = lerpArray(p1, p2, t);
			if(mag(math.subtract(p_n, [windowW/2, windowH/2])) <= threshold){
				this.points.push([p_n[0],p_n[1],random(0,20)]);
			}
		}
	}
	update(dt){
		// static obj doesnt need to update 
	}

	draw(){
		// drawing can be handled by child classes
		let rect = getWorldRect(this.rect);
		drawRect(rect, "black");
		for(let point of this.points){
			let brown = 30;
			let x = lerp(point[0], point[0]+random(-brown,brown),0.1);
			let y  = lerp(point[1], point[1]+random(-brown,brown),0.1);
			point[2] = math.max(5,math.min(lerp(point[2], point[2]*random(0.2,1.8),0.1),20));
			drawCircle(getWorldRect([x,y,0,0]), point[2], "black");
		}
		
	}

	onCollision(otherEntity){}
}

/*
 * so basically, a world contains a bunch of entities all of which have basic
 * functions like draw, update, onCollision, and a collider obj which
 * contains a collisionLayer, every entity on the same layer is checked for collision
 * maybe change later to handle multiple layers that the obj belongs to
 * then layers the obj collides with
 * to create other entities like a player class
 * class Player extends RigidBody{}
 * then just override draw and update but make sure to call super.update() for physics
 * stuff. Also override on collision funciton if needed, on collision just resolves
 * by moving mtv and other physicsy shit
*/

class World{
	constructor(scene){
		this.entities = {};
		this.toRemove = [];
		this.updateCollisionRules({});
		this.accumulator = 0;
		this.scene = scene;
	}

	cleanupEntity(id){
		this.collisionLayers[this.entities[id].collider.tag] = arrayRemove(
			this.collisionLayers[this.entities[id].collider.tag],
			id
		);
		delete this.entities[id];
	}

	update(dt){
		this.accumulator += dt; // fixed timestep to avoid large dt fucking it
		while(this.accumulator >= FIXED_TIMESTEP){
			for(let id in this.entities){
				let entity = this.entities[id];
				entity.update(FIXED_TIMESTEP);
			}
			for(let id of this.toRemove){
				this.cleanupEntity(id);
			}
			this.toRemove = [];
			this.collisions();
			this.accumulator -= FIXED_TIMESTEP;
		}
	}

	draw(){
		for(let id in this.entities){
			this.entities[id].draw();
		}
	}

	updateCollisionRules(newCollisionRules){
		// eg. "player": ["wall", "enemy"]
		// ie. "this entity" collides with ["these entities"]
		this.collisionRules = newCollisionRules;
		// easy to use as any entity can alter its collision rules on the fly:
		// world.collisionRules[this.collider.tag] = [new set of colliders]

		// collision layers based on collision rules: if smth fucks up here its cause u fucked up the collision rules
		this.collisionLayers = {};
		for(let tag of Object.keys(this.collisionRules)){
			this.collisionLayers[tag] = [];
		}
	}

	addEntity(entity){
		this.entities[entity.id] = entity;
		
		// add id to dict of colliders
		this.collisionLayers[entity.collider.tag].push(entity.id);
		this.entities[entity.id].world = this;
		this.entities[entity.id].scene = this.scene;

	}

	deleteEntity(id){
		let test = true;
		for(let _id of this.toRemove){
			if(id == _id){
				test = false;
			}
		}
		if(test){
			this.toRemove.push(id);
		}
	}

	checkCollisions(entity){
		for(let tag of this.collisionRules[entity.collider.tag]){
			// find each tag in collision rules that this entity
			// collides with then loop thru the ids in collision layers
			// to find ids of collideables
			for(let id of this.collisionLayers[tag]){
				if(id == entity.id){
					continue;
				}
				let otherEntity = this.entities[id];
				entity.checkCollision(otherEntity);
			}
		}
	}

	collisions(){
		const num_of_itrs = 3;
		for(let _ = 0; _ < num_of_itrs; _ ++){
			for(let [id, entity] of Object.entries(this.entities)){
				this.checkCollisions(entity);
			}
		}
	}
}

