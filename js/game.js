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
	camerControls: null,
	player: null,
	lookAround: false,
	clock: null,
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
		this.renderer.setClearColor(0x000510, 1);

		this.scene = new THREE.Scene();

		// init camera
		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH/ HEIGHT, NEAR, FAR);
	    //this.camera.position.set(0, 20, 250 );
	    this.scene.add(this.camera);

	    this.cameraControls = new THREE.OrbitControls(this.camera);
	    this.cameraControls.userPan = false;

	    this.clock = new THREE.Clock();

	    this.scene.fog = new THREE.FogExp2(0x000510, 0.002);


	    // skybox
	    var textureCube = THREE.ImageUtils.loadTexture('grimmnight_large.jpg', THREE.CubeReflectionMapping);
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
		// add it to the scene
	//	this.scene.add( skyboxMesh );


		//this.scene
		var light = new THREE.AmbientLight( 0x303030 ); // soft white light
		this.scene.add( light );

		window.addEventListener('resize', ld31.onWindowResize, false);
		document.addEventListener('mousedown', ld31.onMouseDown, false);

		this.initSnow();

		this.initWorld();
		this.initPlayer();
		this.initPhysics();




		this.animate();
	},
	onWindowResize: function() {
		ld31.camera.aspect = window.innerWidth / window.innerHeight;
		ld31.camera.updateProjectionMatrix();
		ld31.renderer.setSize(window.innerWidth, window.innerHeight);

	},
	onMouseDown: function(e) {
		e.preventDefault();
		ld31.lookAround = true;
		var aboveCam = new THREE.Vector3().copy(ld31.player.position);
			aboveCam.y += 10;

		ld31.cameraControls.center.copy(aboveCam);
		document.addEventListener('mouseup', ld31.onMouseUp, false);
	},
	onMouseUp: function(e) {
		ld31.lookAround = false;
		document.removeEventListener('mouseup', ld31.onMouseUp);
	},
	kbInputDown: function(e) {
		index = [ld31.keys.SPACE,ld31.keys.UP,ld31.keys.DOWN,ld31.keys.LEFT,ld31.keys.RIGHT,ld31.keys.W,ld31.keys.A,ld31.keys.S,ld31.keys.D].indexOf(e.keyCode);
		if (index >= 0) {
			ld31.pressed[e.keyCode] = true;
			e.preventDefault();
		}


	},
	kbInputUp: function(e) {
		index = [ld31.keys.SPACE,ld31.keys.UP,ld31.keys.DOWN,ld31.keys.LEFT,ld31.keys.RIGHT,ld31.keys.W,ld31.keys.A,ld31.keys.S,ld31.keys.D].indexOf(e.keyCode);
		if (index >= 0) {
			ld31.pressed[e.keyCode] = false;
			e.preventDefault();
		}
	},
	initSnow: function() {
		texture = THREE.ImageUtils.loadTexture( 'snowflake1.png' );
		var particleSystemHeight = 200.0;
		var numParticles = 30000,
			width = 200,
			height = particleSystemHeight,
			depth = 400,
			parameters = {
				color: 0xFFFFFF,
				height: particleSystemHeight,
				radiusX: 2.5,
				radiusZ: 2.5,
				size: 200,
				scale: 4.0,
				opacity: 0.4,
				speedH: 1.0,
				speedV: 1.0
			},
			systemGeometry = new THREE.Geometry(),
			systemMaterial = new THREE.ShaderMaterial({
				uniforms: {
					color:  { type: 'c', value: new THREE.Color( parameters.color ) },
					height: { type: 'f', value: parameters.height },
					elapsedTime: { type: 'f', value: 0 },
					radiusX: { type: 'f', value: parameters.radiusX },
					radiusZ: { type: 'f', value: parameters.radiusZ },
					size: { type: 'f', value: parameters.size },
					scale: { type: 'f', value: parameters.scale },
					opacity: { type: 'f', value: parameters.opacity },
					texture: { type: 't', value: texture },
					speedH: { type: 'f', value: parameters.speedH },
					speedV: { type: 'f', value: parameters.speedV }
				},
				vertexShader: document.getElementById( 'step07_vs' ).textContent,
				fragmentShader: document.getElementById( 'step09_fs' ).textContent,
				blending: THREE.AdditiveBlending,
				transparent: true,
				depthTest: true
			});
	 
		for( var i = 0; i < numParticles; i++ ) {
			var vertex = new THREE.Vector3(
					this.rand( width ),
					Math.random() * height,
					this.rand( depth )
				);

			systemGeometry.vertices.push( vertex );
		}

		this.particleSystem = new THREE.ParticleSystem( systemGeometry, systemMaterial );
		this.particleSystem.position.y = -50; //-height/2;
		this.particleSystem.position.x = -50; //-height/2;
		this.scene.add( this.particleSystem );

	},
	rand: function( v ) {
		return (v * (Math.random() - 0.5));
	},

	initPlayer: function() {
		// get keyboard input 

		window.addEventListener("keydown", ld31.kbInputDown, false);
		window.addEventListener("keyup", ld31.kbInputUp, false);

		var loader = new THREE.JSONLoader();
		loader.load('models/santa.json', function(geometry, materials) {
			geometry.center();
			for (var i = 0; i< materials.length; i++) {
				materials[i].shading = THREE.FlatShading;
			}

			ld31.player = new THREE.Mesh(
				geometry,
				new THREE.MeshLambertMaterial({color: 0x00ff00, shading: THREE.FlatShading})
			);
			//ld31.player.scale.set(2,2,2);
			ld31.player.castShadow = true;
			ld31.player.receiveShadow = true;
			//this.player.add(this.camera);
			ld31.scene.add(ld31.player);


			// reset positionaddLaterne(-100, -34, 100);
			ld31.motion.position.set(-100,-38,100);
			ld31.motion.velocity.multiplyScalar(0);


		});


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
		loader.load('models/laterne.json', function(geometry, materials) {
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

		if (this.player) {

			ld31.movePlayer();

			ld31.applyPhysics();
		//	ld31.camera.lookAt(ld31.player.position);
			ld31.camera.updateMatrix();
			ld31.player.position.copy(ld31.motion.position);
elapsedTime = ld31.clock.getElapsedTime();
	if (ld31.particleSystem) {
		ld31.particleSystem.material.uniforms.elapsedTime.value = elapsedTime * 10;
		
	}
		
			/*this.camera.position.x = ld31.player.position.x + 10;
			this.camera.position.y = ld31.player.position.y + 1;
			this.camera.position.z = ld31.player.position.z + 30;
			`*/	
	//		console.log(ld31.motion.position);

			//ld31.updateCamera();

		}

		this.renderer.render(this.scene, this.camera);
	},
	movePlayer: function() {
		var forward = new THREE.Vector3();
		var delta = ld31.clock.getDelta();
  		var rotateAngle = Math.PI / 2 * delta; 

//		var sideways = new THREE.Vector3();
		// calculate x and y steps for current rotation
		forward.set( Math.sin( ld31.player.rotation.y ), 0, Math.cos( ld31.player.rotation.y ) );
//		sideways.set( forward.z, 0, -forward.x );

		TWEEN.update();
		ld31.cameraControls.update();


		if (ld31.pressed[ld31.keys.UP] || ld31.pressed[ld31.keys.W]) {
			forward.multiplyScalar( -0.3 );
		} 
		else if (ld31.pressed[ld31.keys.DOWN] || ld31.pressed[ld31.keys.S]) {
			forward.multiplyScalar( 0.3 );
		}
		else {
			forward.multiplyScalar( 0 );
		}

		if (ld31.pressed[ld31.keys.SPACE] && !ld31.motion.airborne) {
			ld31.motion.airborne = true;
			forward.y = 0.4;
		}


		var relativeCameraOffset = new THREE.Vector3(0, 20, 30);
		// hard version ;)
//		var relativeCameraOffset = new THREE.Vector3(0, 60, 200);

		var cameraOffset = relativeCameraOffset.applyMatrix4(ld31.player.matrixWorld);
		// Camera TWEEN.
		if (!ld31.lookAround) {
			new TWEEN.Tween( ld31.camera.position ).to( {
			  x: cameraOffset.x,
			  y: cameraOffset.y,
			  z: cameraOffset.z }, 90 )
			.interpolation( TWEEN.Interpolation.Bezier )
			.easing( TWEEN.Easing.Sinusoidal.InOut ).start();

			var aboveCam = new THREE.Vector3().copy(ld31.player.position);
			aboveCam.y += 10;

			ld31.camera.lookAt( aboveCam );
		}

		if (ld31.pressed[ld31.keys.LEFT] || ld31.pressed[ld31.keys.A]) {
        	ld31.player.rotateY(rotateAngle);
		} 
		else if (ld31.pressed[ld31.keys.RIGHT] || ld31.pressed[ld31.keys.D]) {
	       	ld31.player.rotateY(-rotateAngle);
		}





		var combined = forward; //.add( sideways );
		if( Math.abs( combined.x ) >= Math.abs( ld31.motion.velocity.x ) ) ld31.motion.velocity.x = combined.x;
		if( Math.abs( combined.y ) >= Math.abs( ld31.motion.velocity.y ) ) ld31.motion.velocity.y = combined.y;
		if( Math.abs( combined.z ) >= Math.abs( ld31.motion.velocity.z ) ) {
			ld31.motion.velocity.z = combined.z;
		}
	

	},

	initPhysics: function() {
		ld31.raycaster = new THREE.Raycaster();
		ld31.raycaster.ray.direction.set(0,-1,0); // down
		ld31.displacement = new THREE.Vector3();
	},
	applyPhysics: function() {
		if (ld31.world && ld31.snowman) {
			ld31.raycaster.ray.origin.copy(ld31.motion.position);
			ld31.raycaster.ray.origin.y += 15; //birdsEye; // 

			var gravity = 0.02;
			var damping = 0.93;
			var time = 0.3;
			var hits = ld31.raycaster.intersectObject(ld31.world);
			var smhits = ld31.raycaster.intersectObject(ld31.snowman);

			ld31.motion.airborne = true;
			if (smhits.length > 0 && smhits[0].face.normal.y > 0) {
				var actualHeight = smhits[0].distance - 15;
				if ((ld31.motion.velocity.y <=0) && Math.abs(actualHeight) < 1.5)
				{
					ld31.motion.position.y -= actualHeight -1.2 ;
					ld31.motion.velocity.y = 0;
					ld31.motion.airborne = false;
				}

			}
			if (hits.length > 0 && hits[0].face.normal.y > 0) {
				var actualHeight = hits[0].distance - 15;
				if ((ld31.motion.velocity.y <=0) && Math.abs(actualHeight) < 1.5)
				{
					ld31.motion.position.y -= actualHeight -1.2 ;
					ld31.motion.velocity.y = 0;
					ld31.motion.airborne = false;
				}
			}

			


			if (ld31.motion.airborne) {
				ld31.motion.velocity.y -= gravity;
			}

			ld31.displacement.copy(ld31.motion.velocity);
			if (!ld31.motion.airborne) {
				ld31.motion.velocity.multiplyScalar(damping);
			}

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