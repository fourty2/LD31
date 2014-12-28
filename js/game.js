/**
 todos:
 	day2:

 	* finish player character

	* refine mouse view / third person camera 

 	* road/ way to head of snowman part 2
	* fog
 	
 	* enemies (little snowmen?) // pathes?
 	* name/ title
 	* assets and animations (e.a.moving arms/ heads of snowman)
	* particle/ special effects

 	* music / sounds
 	* intro screen
 */

var ld31 = {
	gamecanvas: null,
	renderer: null,
	scene: null,
	camera: null,
	cameraControls: null,
	player: null,
	lookAround: false,
	clock: null,
	inputState: {
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
		} ,
		pressed: {}
	},
	init: function() {
		var WIDTH = window.innerWidth;
		var HEIGHT = window.innerHeight;
		var NEAR = 0.1;
		var FAR = 1000;
		var FOV = 45; // maybe stick with non-perspective mode

		this.gamecanvas = document.getElementById('gamecanvas');
		this.renderer = new THREE.WebGLRenderer({canvas: gamecanvas});

		this.renderer.setSize( 800, 600 );
    	this.renderer.setSize(WIDTH, HEIGHT);
		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapSoft = true;		
		this.renderer.setClearColor(0x000510, 1);

		this.loader = new THREE.JSONLoader();
	    this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();
	    this.scene.fog = new THREE.FogExp2(0x000510, 0.002);

		// init camera
		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH/ HEIGHT, NEAR, FAR);
	    //this.camera.position.set(0, 20, 250 );
	    this.scene.add(this.camera);

	    // @TODO skybox
	   /* var textureCube = THREE.ImageUtils.loadTexture('grimmnight_large.jpg', THREE.CubeReflectionMapping);
	    var shader = THREE.ShaderLib["cube"];
		var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
		uniforms['tCube'].value = textureCube;   // textureCube has been init before
		uniforms['tFlip'].value = 1;
		var material = new THREE.ShaderMaterial({
		    fragmentShader    : shader.fragmentShader,
		    vertexShader  : shader.vertexShader,
		    uniforms  : uniforms
		});
		material = new THREE.MeshBasicMaterial({map: textureCube, side: THREE.BackSide});
		skyboxMesh    = new THREE.Mesh( new THREE.BoxGeometry( 700, 700, 700, 1, 1, 1, null, true ), material );
		*/
		// add it to the scene
	//	this.scene.add( skyboxMesh );


		var light = new THREE.AmbientLight( 0x303030 ); // soft white light
		this.scene.add( light );


		this.snow = new Snow(ld31);
		this.snow.init();
		this.cameraControls = new ThirdPersonCamera(this.camera);

		this.player = new Player(ld31,this.cameraControls);
		this.player.init(new THREE.Vector3(-100,-38,100));
		// distanceAway, distanceUp
		this.cameraControls.init(50,50);

		this.initWorld();
		this.initPhysics();
		this.animate();


		// register listeners
		window.addEventListener('resize', ld31.onWindowResize, false);
		window.addEventListener("keydown", ld31.kbInputDown, false);
		window.addEventListener("keyup", ld31.kbInputUp, false);
		document.addEventListener('mousedown', ld31.onMouseDown, false);
	},
	onWindowResize: function() {
		ld31.camera.aspect = window.innerWidth / window.innerHeight;
		ld31.camera.updateProjectionMatrix();
		ld31.renderer.setSize(window.innerWidth, window.innerHeight);
	},
	onMouseDown: function(e) {
		e.preventDefault();


		document.addEventListener('mouseup', ld31.onMouseUp, false);
	},
	onMouseUp: function(e) {

		document.removeEventListener('mouseup', ld31.onMouseUp);
	},
	kbInputDown: function(e) {
		index = [ld31.inputState.keys.SPACE,ld31.inputState.keys.UP,ld31.inputState.keys.DOWN,ld31.inputState.keys.LEFT,ld31.inputState.keys.RIGHT,ld31.inputState.keys.W,ld31.inputState.keys.A,ld31.inputState.keys.S,ld31.inputState.keys.D].indexOf(e.keyCode);
		if (index >= 0) {
			ld31.inputState.pressed[e.keyCode] = true;
			e.preventDefault();
		}
	},
	kbInputUp: function(e) {
		index = [ld31.inputState.keys.SPACE,ld31.inputState.keys.UP,ld31.inputState.keys.DOWN,ld31.inputState.keys.LEFT,ld31.inputState.keys.RIGHT,ld31.inputState.keys.W,ld31.inputState.keys.A,ld31.inputState.keys.S,ld31.inputState.keys.D].indexOf(e.keyCode);
		if (index >= 0) {
			ld31.inputState.pressed[e.keyCode] = false;
			e.preventDefault();
		}
	},
	initWorld: function() {
		// ground
		ld31.loader.load('models/world.json', function(geometry, materials) {
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

		// @TODO: make entity
		ld31.loader.load('models/snowman.json', function(geometry, materials) {
			geometry.center();
			for (var i = 0; i< materials.length; i++) {
				materials[i].shading = THREE.FlatShading;
				//materials[i].side = THREE.DoubleSide;
			}

			ld31.snowman = new THREE.Mesh(geometry,
						new THREE.MeshFaceMaterial(materials)
				);
			ld31.snowman.receiveShadow = true;
			ld31.snowman.castShadow = true;
			ld31.snowman.rotation.y = -Math.PI/2;
			ld31.snowman.position.set(-100,45,-60);
			ld31.snowman.scale.set(35,35,35);
			ld31.scene.add(ld31.snowman);

		});


 		var light = new THREE.DirectionalLight( 0xFFA030 );
 		light.intensity = 0.3;
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
       //light.shadowCameraVisible = true;
		this.scene.add(light);

		// laternen in die szene setzen
		ld31.loader.load('models/laterne.json', function(geometry, materials) {
			geometry.center();
			for (var i = 0; i< materials.length; i++) {
				materials[i].shading = THREE.FlatShading;
				//materials[i].side = THREE.DoubleSide;
			}


			var addLaterne = function(x,y,z) {
				var laterne = new THREE.Mesh(geometry,
							new THREE.MeshFaceMaterial(materials)
					);
				laterne.receiveShadow = true;
				laterne.castShadow = true;
				laterne.rotation.y = -Math.PI/2;
				laterne.position.set(x,y,z);
				laterne.scale.set(2,2,2);
				
				// mal nochn licht setzen
				var spotLight = new THREE.SpotLight( 0xffffff, 2.0);
				spotLight.position.set( 0,2,-0.5);
				spotLight.target.position.set(laterne.position.x + 1, laterne.position.y, laterne.position.z ); // = new THREE.Object3D( -80, -40, 80);
				spotLight.target.updateMatrixWorld();
				spotLight.castShadow = true;

				spotLight.shadowMapWidth = 1024;
				spotLight.shadowMapHeight = 1024;

				spotLight.shadowCameraNear = 1;
				spotLight.shadowCameraFar = 100;
				spotLight.shadowCameraFov = 60;
				laterne.add( spotLight );
				ld31.scene.add(laterne);				
				return {'laterne': laterne, 'spotlight': spotLight};
			}

			addLaterne(-104, -34, 100);
			addLaterne(-100, -34, 70);
			addLaterne(-114, -34, 40);
			var lat2 = addLaterne(-112, -34, 10);
			lat2.laterne.rotation.y = Math.PI/2;
			lat2.spotlight.target.position.set(lat2.laterne.position.x - 1, lat2.laterne.position.y, lat2.laterne.position.z );
			lat2.spotlight.target.updateMatrixWorld();
			addLaterne(-110, -34, -10);
			addLaterne(-100, -34, -30);
			var lat = addLaterne(-70, -34, -30);
			lat.laterne.rotation.y = Math.PI/2;
		});
		
	},
	// render stuff
	render: function() {
		
		//this.camera.rotation.x += 0.2;
		if (ld31.snowman) {
			//this.camera.lookAt(ld31.snowman.position);
		}

		if (ld31.player.player) {
			ld31.player.moveWithInput(ld31.inputState);
			ld31.applyPhysics();

			ld31.cameraControls.update();
			//ld31.player.position.copy(ld31.motion.position);

			elapsedTime = ld31.clock.getElapsedTime();
			if (ld31.particleSystem) {
				ld31.particleSystem.material.uniforms.elapsedTime.value = elapsedTime * 10;
		
			}
		}

		this.renderer.render(this.scene, this.camera);
	},
	initPhysics: function() {
		ld31.raycaster = new THREE.Raycaster();
		ld31.raycaster.ray.direction.set(0,-1,0); // down
		ld31.displacement = new THREE.Vector3();
	},
	applyPhysics: function() {
		if (ld31.world && ld31.snowman && ld31.player) {
			ld31.raycaster.ray.origin.copy(ld31.player.player.position);
			ld31.raycaster.ray.origin.y += 15; //birdsEye; // 

			var gravity = 0.02;
			var damping = 0.93;
			var time = 0.3;
			var hits = ld31.raycaster.intersectObject(ld31.world);
			var smhits = ld31.raycaster.intersectObject(ld31.snowman);

			ld31.player.airborne = true;
			if (smhits.length > 0 && smhits[0].face.normal.y > 0) {
				var actualHeight = smhits[0].distance - 15;
				if ((ld31.player.velocity.y <=0) && Math.abs(actualHeight) < 2.6)
				{
					ld31.player.player.position.y -= actualHeight -2.5 ;
					ld31.player.velocity.y = 0;
					ld31.player.airborne = false;
				}

			}
			if (hits.length > 0 && hits[0].face.normal.y > 0) {
				var actualHeight = hits[0].distance - 15;
				if ((ld31.player.velocity.y <=0) && Math.abs(actualHeight) < 2.6)
				{
					ld31.player.player.position.y -= actualHeight -2.5 ;
					ld31.player.velocity.y = 0;
					ld31.player.airborne = false;
				}
			}

			


			if (ld31.player.airborne) {
				ld31.player.velocity.y -= gravity;
			}

			ld31.displacement.copy(ld31.player.velocity);
			if (!ld31.player.airborne) {
				ld31.player.velocity.multiplyScalar(damping);
			}

			ld31.player.player.position.add(ld31.displacement)

			//ld31.motion.position.y -= 1;
			//console.log(hits);

		}


	},
	// animate cycle
	animate: function() {
		requestAnimationFrame(ld31.animate);
		ld31.render();
	}
}

ld31.init();