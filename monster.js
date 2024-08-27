class Segment {
	constructor(length) {
		this.length = length;
		this.x = 0;
		this.y = 0;
		this.sheet = new spriteSheet("assets/monster_sheet.png", 128, 128, random(2,5), 0, 0, 60, 60);
		this.sheet.addState("main", 1, 4);
	}
	draw(){
		[this.sheet.x, this.sheet.y, this.sheet.draww, this.sheet.drawh] = getWorldRect([this.x-30, this.y-30, 60, 60]);
		this.sheet.draw();
		this.sheet.frameCalc(0);
	}
}
class Line{
	constructor(segs){
		this.segments = segs;
	}
	update(clamped_segments) {
        let iteration = 0;
        const maxIterations = 10; // Number of iterations to ensure constraints are met

        while (iteration < maxIterations) {
            for (let i = 0; i < this.segments.length; i++) {
                let seg = this.segments[i];

                // Apply clamped positions if specified
                if (clamped_segments[i]) {
					let pos = lerpArray([seg.x,seg.y], clamped_segments[i], 0.1);
                    [seg.x, seg.y] = pos;
                }

                // Constrain to previous segment
                if (i > 0) {
                    this.constrainDistance(this.segments[i - 1], seg);
                }

                // Constrain to next segment
                if (i < this.segments.length - 1) {
                    this.constrainDistance(seg, this.segments[i + 1]);
                }
            }
            iteration++;
        }
    }

    // Ensure the distance between two segments is maintained
    constrainDistance(seg1, seg2) {
        let dx = seg2.x - seg1.x;
        let dy = seg2.y - seg1.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        // Desired length (e.g., 100 units)
        let desiredDist = seg1.length;

        if (dist > desiredDist) {
            let excess = dist - desiredDist;
            let adjustX = (dx / dist) * excess * 0.5;
            let adjustY = (dy / dist) * excess * 0.5;

            seg1.x += adjustX;
            seg1.y += adjustY;
            seg2.x -= adjustX;
            seg2.y -= adjustY;
        }
    }
	getDistBetweenSegs(segIndex1, segIndex2){
        let dx = this.segments[segIndex1].x - this.segments[segIndex2].x;
        let dy = this.segments[segIndex1].y - this.segments[segIndex2].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
		return dist;
	}
	draw(){
		let prevSeg = null;
		for(let seg of this.segments){
			seg.draw();
			if(prevSeg){
				for(let i = 0; i < 4; i++){
					let offset = 14;
					let p1 = getWorldRect([seg.x+random(-offset,offset), seg.y+random(-offset,offset), 0,0]);
					let p2 = getWorldRect([prevSeg.x+random(-offset,offset), prevSeg.y+random(-offset,offset), 0,0]);
					drawLine(p1, p2, "black",random(1,4));
				}
			}
			prevSeg = seg;
		}
	}
}

class Monster extends RigidBody{
	constructor(x,y, patrol_nodes){
		super("monster", x, y, 128, 128, "Monster");
		this.gravity = 0;

		this.nodes = patrol_nodes;
		this.currentNode = 0;
		this.nodeChange = 1;
		this.sheet = new spriteSheet("assets/monster_sheet.png", 128, 128, 3, x, y, this.w, this.h);
		this.sheet.addState("main", 1, 4);

		this.stallTimer = 0;

		this.speed = 100;
		this.drag = 0.8;
		this.maxHuntTime = 2;
		this.huntTime = 0;

		this.state = "patrol";
		this.world = null;
		this.audioPositions = [];
		this.front = 0;
		this.fov = math.pi*0.4;
		let len = 200;
		this.lines = [
		    new Line([new Segment(len), new Segment(len*0.8), new Segment(len)]),
		    new Line([new Segment(len), new Segment(len*0.8), new Segment(len)]),
		    new Line([new Segment(len), new Segment(len*0.8), new Segment(len)]),
		    new Line([new Segment(len), new Segment(len*0.8), new Segment(len)]),
		    new Line([new Segment(len), new Segment(len*0.8), new Segment(len)]),
		    new Line([new Segment(len), new Segment(len*0.8), new Segment(len)]),
		];
		this.footTargets = [
		    [0, 0],
		    [0, 0],
		    [0, 0],
		    [0, 0],
		    [0, 0],
		    [0, 0],
		];
		this.stepDistanceThreshold = 120;
		this.setInitialFootTargets();
		this.footTimer = 0;
	}
	setInitialFootTargets() {
        for (let i = 0; i < this.lines.length; i++) {
            let angle = this.front + (Math.PI / 2) * i; // Adjust angle based on leg index
            let targetPos = [
                this.center.x + Math.cos(angle) * 200,
                this.center.y + Math.sin(angle) * 200
            ];
            this.footTargets[i] = targetPos;
            let clamps = {
                2: [this.center.x, this.center.y],
                0: this.footTargets[i]
            };
			this.lines[i].update(clamps);
        }
    }
	handleLeg(ind) {
        let distInFront = 0;
        let angularOff = Math.PI / 2;
        let maxDist = 300;
		distInFront = -maxDist;
		let distOff = 1;

		let indices1 = [0, 1, 2];
		let indices2 = [3, 4, 5];

        if (ind == indices1[0]) {
			angularOff += math.pi;
			distInFront = 0; // middle
			distOff = 2.5;
        } else if (ind == indices1[1]) {
			angularOff += math.pi;
			distInFront = -maxDist/2;
			distOff = 1.5;
        } else if (ind == indices1[2]) {
			angularOff += math.pi;
			distInFront = -maxDist;
        } else if (ind == indices2[0]) {
			distInFront = -maxDist;
        } else if (ind == indices2[1]) {
			distInFront = -maxDist/2;
			distOff = 1.5;
        } else if (ind == indices2[2]) {
			distInFront = 0; // middle
			distOff = 2.5;
        }

        let angle = this.front + this.fov / 2 + angularOff;
        let targetPos = [
            this.center.x + Math.cos(angle) * 200,
            this.center.y + Math.sin(angle) * 200
        ];

        // Calculate current foot position
        let footPos = [this.lines[ind].segments[0].x, this.lines[ind].segments[0].y];

        // Calculate the distance from the current foot position to the target
		let actualFootTarg = [
			targetPos[0] - distInFront * Math.cos(this.front+this.fov/2),
			targetPos[1] - distInFront * Math.sin(this.front+this.fov/2)
		];
        let distanceToTarget = mag(math.subtract(this.footTargets[ind],actualFootTarg));

		let front_angle = (angle - angularOff);
		let angle_of_last_foot = getAngleBetweenAandB([this.center.x,this.center.y], footPos);
		let testAng = front_angle - angle_of_last_foot;
		let check = math.abs(testAng) >= math.pi/2


        // If the foot is far from the target, set clamped positions
		this.footTimer -= 0.05;
        if (this.footTimer <= 0 && distanceToTarget > this.stepDistanceThreshold*distOff) {
			this.footTargets[ind] = [
				targetPos[0] - distInFront * Math.cos(this.front+this.fov/2),
				targetPos[1] - distInFront * Math.sin(this.front+this.fov/2)
			];
			//sfx.step[random(5,9,true)].play();
			sfx.step[random(0,4,true)].play();
			this.footTimer = 1;
		}
        
		let clamps = {
			2: [this.center.x, this.center.y],
			0: this.footTargets[ind]
		};

        this.lines[ind].update(clamps);
        this.lines[ind].draw();
    }
	drawSegments(){
		for (let i = 0; i < this.lines.length; i++) {
		    this.handleLeg(i);
		}
	}
	draw(){
		//drawRect(getWorldRect(this.rect), "black");
		this.drawSegments();

		let col = "red";
		drawCone(getWorldRect([this.center.x, this.center.y, 0, 0]), this.front, this.front+this.fov, 400,col,col, 1, 0.4);
		[this.sheet.x, this.sheet.y, this.sheet.draww, this.sheet.drawh] = getWorldRect(enlargeRect(this.rect,1.5,1.5));
		this.sheet.draw();
		this.sheet.frameCalc(0);
	}
	update(dt){
		try{
			this.AI(dt);
		}catch(e){
			console.log(e);
		}
		let [oldx, oldy] = [this.x, this.y];
		super.update(dt);
		if(this.stallTimer <= 0){
			this.front = getAngleBetweenAandB([oldx, oldy], [this.x, this.y]) - this.fov/2;
		}
	}
	AI(dt){
		let ply = this.world.entities['p1']; 
		let center = [this.center.x, this.center.y];
		let plyCenter = [ply.center.x, ply.center.y];
		this.state = "patrol";

		for(let audio of ply.footsteps){
			let distance = mag(math.subtract([audio.x, audio.y], center));
			if(audio.r*2 >= distance){
				let test = true;
				for(let i of this.audioPositions){
					if(i.id == audio.id){
						test = false;
					}
				}
				if(test){
					this.audioPositions.push(audio);
				}
			}
		}
		if(this.audioPositions.length > 0){
			this.state = "chase";
			if(this.audioPositions.length > 0 && this.huntTime <= 0){
				this.huntTime = this.maxHuntTime;
			}
		}

		//check cone of vision//
		let player_angle = getAngleBetweenAandB(center, plyCenter);
		let angle = standardizeAngle(player_angle);
		let first = standardizeAngle(this.front+this.fov);
		let second = standardizeAngle(this.front);

		let check = (angle <= first && angle >= second);
		let distance = mag(math.subtract(center, plyCenter));

		if(first < second){
			check = (angle <= first || angle >= second);
		}
		this.spawnTimer -= dt;
		if(check && distance <= 1000 && this.spawnTimer <= 0){
			let los = true;
			for(let id of this.world.collisionLayers["Wall"]){
				let wall = this.world.entities[id];
				let line1 = [[wall.x, wall.y],[wall.x+wall.w,wall.y]]; // top
				let line2 = [[wall.x+wall.w, wall.y],[wall.x+wall.w,wall.y+wall.h]]; // right
				let line3 = [[wall.x, wall.y+wall.h],[wall.x+wall.w,wall.y+wall.h]]; // bottom
				let line4 = [[wall.x, wall.y],[wall.x,wall.y+wall.h]]; // left
				let lines = [line1, line2, line3, line4];
				for(let line of lines){
					let test = lineIntersection(
						line[0][0], line[0][1], line[1][0], line[1][1],
						this.center.x, this.center.y, ply.center.x, ply.center.y
					);
					if(test){
						let dist = mag(math.subtract(center, plyCenter));
						if(mag(math.subtract(center,test)) <= dist){
							los = false;
						}
						break;
					}
				}
			}
			if(los){
				this.state = "seen";
				Camera.shake = 1;
				sfx.seen.volume(0.03);
				sfx.seen.play();
			}
		}
		//--------------------//
		if(this.state == "seen" && this.spawnTimer <= 0){
			let dir = [math.cos(player_angle), math.sin(player_angle)];
			this.applyImpulse(math.multiply(dir, this.speed*3));
		}
		if(this.stallTimer > 0){
			this.stallTimer -= dt;
			if(this.audioPositions.length > 0){
				this.stallTimer = 0;
			}
			return;
		}
		if(this.state == "chase" && this.spawnTimer <= 0){
			let lastInd = this.audioPositions.length -1;
			let target = this.audioPositions[lastInd];

			let [dx, dy] = math.subtract([target.x, target.y], [this.center.x, this.center.y]);
			let theta = math.atan2(dy, dx);
			let dir = [math.cos(theta), math.sin(theta)];
			this.applyImpulse(math.multiply(dir, this.speed*0.8));
			this.huntTime -= dt;
			if(mag([dx,dy]) <= 10 || this.huntTime <= 0){
				this.audioPositions = arrayRemove(this.audioPositions, this.audioPositions[lastInd]);
				if(this.audioPositions.length > 0){
					this.huntTime = this.maxHuntTime;
					this.stallTimer = 1;
				}else{
					this.stallTimer = 3;
				}
			}
		}
		if(this.state == "patrol"){
			let [dx, dy] = math.subtract(this.nodes[this.currentNode], [this.x, this.y]);
			let theta = math.atan2(dy, dx);
			let dir = [math.cos(theta), math.sin(theta)];
			this.applyImpulse(math.multiply(dir, this.speed/4));

			if(mag([dx,dy]) <= 1){
				this.currentNode += this.nodeChange;
				if(this.currentNode >= this.nodes.length - 1){
					this.nodeChange *= -1;
				}
				if(this.currentNode <= 0){
					this.nodeChange *= -1;
				}
			}
		}
	}
}
