class SceneManager{
    constructor(){
        this.currentScene = null;
        this.scenes = {};
		this.transitionTimer = 0;
		this.transitionTimerMax = 1;
		this.switchingTo = null;
		this.pause=0;
    }

    addScene(scene){
        this.scenes[scene.name] = scene;
    }

	actuallySwitch(name){
		if (this.scenes[this.currentScene]){
			this.scenes[this.currentScene].exit(); // exit current scene
		}
		this.currentScene = name;
		if(this.scenes[this.currentScene]){
			if (this.scenes[this.currentScene].world){
				this.scenes[this.currentScene].enter(); // start new scene
			}else{
				this.scenes[this.currentScene].init();
			}
		}else{
			this.scenes[this.currentScene].init();
		}
		this.switchingTo = null;
	}

    switchTo(name){
		this.transitionTimer = this.transitionTimerMax;
		this.switchingTo = name;
    }

    update(dt){
		if(this.transitionTimer <= this.transitionTimerMax*0.5){
			if(this.transitionTimer > 0 && this.switchingTo){
				this.pause = 0.3;
				Howler.volume(0);
			}
			if(this.switchingTo){
				this.actuallySwitch(this.switchingTo);
			}
			const scene = this.scenes[this.currentScene];
			if (scene) {
				scene.update(dt);
			}
		}
		if(this.pause <= 0){
			this.transitionTimer -= dt;
			Howler.volume(0.7);
		}else{
			this.pause -= dt;
		}
    }

    draw(){
		// draw transition here
		const scene = this.scenes[this.currentScene];
		if (scene) {
			scene.draw();
		}
	}
}

class Scene{
	constructor(name){
		this.world = null;
		this.name = name;
	}

	init(){
		console.log("new scene initialized: " + this.name);
	}

	update(dt){
		this.world.update(dt);
	}

	draw(){
		this.world.draw();
	}

	enter(){
		console.log("Entering scene: " + this.name);
	}

	exit(){
		console.log("Exiting scene: " + this.name);
	}
}
