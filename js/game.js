/**
 todos:
 	* keyboard input
 	* mouse view
 	* road/ way to head of snowman
 	* 
 */

var ld31 = {
	gamecanvas: null,
	renderer: null,
	scene: null,
	camera: null,
	player: null,
	motion: {
		position: new THREE.Vector3(),
		velocity: new THREE.Vector3(),
		rotation: new THREE.Vector2(), // maybe not needed
		spinning: new THREE.Vector2(), // maybe not needed
		airborne: false
	},
	keys: {
		UP: 38,
		W: 87,
		LEFT: 37,
		A: 65,
		DOWN: 40,
		S: 83,
		RIGHT: 39,
		D: 68,
		SPACE: 32
	},
	pressed: {},
	init: function() {
		var WIDTH = window.innerWidth;
		var HEIGHT = window.innerHeight;
		var NEAR = 0.1;
		var FAR = 1000;
		var FOV = 45; // maybe stick with non-perspective mode

		this.gamecanvas = document.getElementById('gamecanvas');
		this.renderer = new THREE.WebGLRenderer({canvas: gamecanvas});
 			this.renderer.setSize( 800, 600 );
        //document.body.appendChild( this.renderer.domElement );
		this.renderer.setSize(WIDTH, HEIGHT);
		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapSoft = true;		

		this.scene = new THREE.Scene();

		// init camera
		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH/ HEIGHT, NEAR, FAR);
	    this.camera.position.set(-50, 150, 300 );

		//this.scene
		var light = new THREE.AmbientLight( 0x606060 ); // soft white light
		this.scene.add( light );


		this.initWorld();
		this.initPlayer();
		this.initPhysics();




		this.animate();
	},
	kbInputDown: function(e) {
		index = [ld31.keys.UP,ld31.keys.DOWN,ld31.keys.LEFT,ld31.keys.RIGHT,ld31.keys.W,ld31.keys.A,ld31.keys.S,ld31.keys.D].indexOf(e.keyCode);
		if (index >= 0) {
			ld31.pressed[e.keyCode] = true;
			e.preventDefault();
		}


	},
	kbInputUp: function(e) {
		index = [ld31.keys.UP,ld31.keys.DOWN,ld31.keys.LEFT,ld31.keys.RIGHT,ld31.keys.W,ld31.keys.A,ld31.keys.S,ld31.keys.D].indexOf(e.keyCode);
		if (index >= 0) {
			ld31.pressed[e.keyCode] = false;
			e.preventDefault();
		}
	},
	initPlayer: function() {
			// get keyboard input 

			window.addEventListener("keydown", ld31.kbInputDown, false);
			window.addEventListener("keyup", ld31.kbInputUp, false);


			this.player = new THREE.Mesh(
				new THREE.SphereGeometry(3,5,5),
				new THREE.MeshLambertMaterial({color: 0x00ff00, shading: THREE.FlatShading})
				);

			this.player.castShadow = true;
			this.player.receiveShadow = true;
			this.scene.add(this.player);

			// reset position
			this.motion.position.set(20,100,0);
			this.motion.velocity.multiplyScalar(0);


	},
	initWorld: function() {


		var loader = new THREE.JSONLoader();
		loader.load('models/world.json', function(geometry, materials) {
			geometry.center();
			for (var i = 0; i< materials.length; i++) {
				materials[i].shading = THREE.FlatShading;
			}

			ld31.world = new THREE.Mesh(geometry, 	
				new THREE.MeshFaceMaterial(materials)
				);
			ld31.world.rotation.y = Math.PI;
			ld31.world.scale.set(20,20,20);
			ld31.world.position.set(0,0	,0);
			ld31.world.receiveShadow = true;
			ld31.world.castShadow = true;

			ld31.scene.add(ld31.world);

			//ld31.camera.lookAt(newMesh.position);

		});

		loader.load('models/snowman.json', function(geometry, materials) {
			geometry.center();
			for (var i = 0; i< materials.length; i++) {
				materials[i].shading = THREE.FlatShading;
			}

			ld31.snowman = new THREE.Mesh(geometry,
					new THREE.MeshLambertMaterial({color: 0xffffff, shading: THREE.FlatShading})
				);
			ld31.snowman.receiveShadow = true;
			ld31.snowman.castShadow = true;
			ld31.snowman.rotation.y = Math.PI/2;
			ld31.snowman.position.set(-50,10,-70);
			ld31.snowman.scale.set(35,35,35);
			ld31.scene.add(ld31.snowman);

		});


 		var light = new THREE.DirectionalLight( 0xFFA030 );
        light.position.set( 160, 20, 50 );
        light.castShadow = true;
        light.shadowCameraNear = 1;
        light.shadowCameraFar = 350;
        
        light.shadowCameraTop = 150;
        light.shadowCameraLeft = -150;
        light.shadowCameraRight = 150;
        light.shadowCameraBottom = -150;
        
        light.shadowDarkness = 0.6;
        light.shadowMapWidth = 4048;
        light.shadowMapHeight = 4048;
      //  light.shadowCameraVisible = true;
		this.scene.add(light);


	},
	// render stuff
	render: function() {
		//this.camera.rotation.x += 0.2;
		if (ld31.snowman) {
			//this.camera.lookAt(ld31.snowman.position);
		}

		if (this.player) {

			ld31.movePlayer();

			ld31.applyPhysics();
			ld31.player.position.copy(ld31.motion.position);

			this.camera.position.x = ld31.player.position.x + 10;
			this.camera.position.y = ld31.player.position.y + 1;
			this.camera.position.z = ld31.player.position.z + 30;

			this.camera.lookAt(ld31.snowman.position);
	//		console.log(ld31.motion.position);

			//ld31.updateCamera();

		}

		this.renderer.render(this.scene, this.camera);
	},
	movePlayer: function() {
		var forward = new THREE.Vector3();
		var sideways = new THREE.Vector3();
		// calculate x and y steps for current rotation
		forward.set( Math.sin( ld31.motion.rotation.y ), 0, Math.cos( ld31.motion.rotation.y ) );
		sideways.set( forward.z, 0, -forward.x );

		if (ld31.pressed[ld31.keys.UP] || ld31.pressed[ld31.keys.W]) {
			forward.multiplyScalar( -0.1 );
		} 
		else if (ld31.pressed[ld31.keys.DOWN] || ld31.pressed[ld31.keys.S]) {
			forward.multiplyScalar( 0.1 );
		}
		else {
	
			forward.multiplyScalar( 0 );
		}

		if (ld31.pressed[ld31.keys.LEFT] || ld31.pressed[ld31.keys.A]) {
			sideways.multiplyScalar( -0.1 );
		} 
		else if (ld31.pressed[ld31.keys.RIGHT] || ld31.pressed[ld31.keys.D]) {
			sideways.multiplyScalar( 0.1 );
		}
		else {
			
			sideways.multiplyScalar( 0 );
		}



		var combined = forward.add( sideways );
		if( Math.abs( combined.x ) >= Math.abs( ld31.motion.velocity.x ) ) ld31.motion.velocity.x = combined.x;
		if( Math.abs( combined.y ) >= Math.abs( ld31.motion.velocity.y ) ) ld31.motion.velocity.y = combined.y;
		if( Math.abs( combined.z ) >= Math.abs( ld31.motion.velocity.z ) ) ld31.motion.velocity.z = combined.z;


	},

	initPhysics: function() {
		ld31.raycaster = new THREE.Raycaster();
		ld31.raycaster.ray.direction.set(0,-1,0); // down
		ld31.displacement = new THREE.Vector3();
	},
	applyPhysics: function() {
		if (ld31.world) {
			ld31.raycaster.ray.origin.copy(ld31.motion.position);
			ld31.raycaster.ray.origin.y += 100; //birdsEye; // 

			var gravity = 0.01;
			var hits = ld31.raycaster.intersectObject(this.world);
			ld31.motion.airborne = true;

			if (hits.length > 0 && hits[0].face.normal.y > 0) {
				var actualHeight = hits[0].distance - 100;
				if ((ld31.motion.velocity.y <=0) && Math.abs(actualHeight) < 3)
				{
					ld31.motion.position.y -= actualHeight -3 ;
					ld31.motion.velocity.y = 0;
					ld31.motion.airborne = false;
				}
			}
			if (ld31.motion.airborne) {
				ld31.motion.velocity.y -= gravity;
			}

			ld31.displacement.copy(ld31.motion.velocity);

			ld31.motion.position.add(ld31.displacement)

			//ld31.motion.position.y -= 1;
			//console.log(hits);

		}


	},
	// animate cycle
	animate: function() {
		requestAnimationFrame(ld31.animate);
		ld31.render();
	},
	
	onMouseMove: function(event) {

	}


}

ld31.init();