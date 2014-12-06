var ld31 = {
	gamecanvas: null,
	renderer: null,
	scene: null,
	camera: null,


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
	    this.camera.position.set( 0, 0, 200 );
//this.camera = new THREE.OrthographicCamera( WIDTH / - 8, WIDTH / 8, HEIGHT / 8, HEIGHT / - 8, 1, 1000 );
// this.camera.position.set( 0, 100, 200 );
//this.camera.position.set( 0, 20, 1000 );
 
//scene.add( this.camera );

		//this.scene
var light = new THREE.AmbientLight( 0x606060 ); // soft white light
this.scene.add( light );

		this.initWorld();



		this.animate();
	},
	initWorld: function() {
		/**
		todos:
			- physics
			- create ground world
			- create snowcolossus
			- create lighting


		*/

	/*	var plane = new THREE.PlaneGeometry(150,150,1,1);
		var planeMesh = new THREE.Mesh(
					plane,
					new THREE.MeshLambertMaterial({color: 0x00ff00})
				);
		planeMesh.rotation.x = -Math.PI/2;
		planeMesh.receiveShadow = true;

		this.scene.add (planeMesh);

*/


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

 		var light = new THREE.DirectionalLight( 0xFFA030 );
        light.position.set( 20, 0, 20 );
        light.castShadow = true;
        light.shadowDarkness = 0.6;
        light.shadowMapWidth = 4048;
        light.shadowMapHeight = 4048;
		this.scene.add(light);


	},
	// render stuff
	render: function() {
		//this.camera.rotation.x += 0.2;
		if (ld31.world) {
			ld31.world.rotation.y+= Math.PI * 0.005;			
		}
		this.renderer.render(this.scene, this.camera);
	},
	// animate cycle
	animate: function() {
		requestAnimationFrame(ld31.animate);
		ld31.render();
	},
	// event listeners
	onKeyUp: function(event) {

	},
	onKeyDown: function(event) {

	},
	onMouseMove: function(event) {

	}


}

ld31.init();