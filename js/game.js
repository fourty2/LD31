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

		this.scene = new THREE.Scene();

		// init camera
		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH/ HEIGHT, NEAR, FAR);
	    this.camera.position.set( -15, 20, 100 );
	    this.camera.rotation.z = 180 * Math.PI/3;
		//this.scene
		this.initWorld();



		this.animate();
	},
	initWorld: function() {



		var sphere = new THREE.SphereGeometry(10, 32, 32);
		//var plane = new THREE.PlaneGeometry(25, 25, 1,1);
		var loader = new THREE.JSONLoader();

		loader.load('models/sphere.json', function(geometry, materials) {

			var newMesh = new THREE.Mesh(geometry, 	new THREE.MeshLambertMaterial({color: 0xff0000, shading: THREE.FlatShading}));
			newMesh.scale.set(10,10,10);
			ld31.scene.add(newMesh);
			ld31.camera.lookAt(newMesh.position);

		});

	//	var mesh =  new THREE.Mesh(sphere,
	//					new THREE.MeshLambertMaterial({color: 0xff0000})
	//					);
	//	this.scene.add(mesh);





 		var light = new THREE.PointLight( 0xFFFF00 );
        light.position.set( 20, 20, 60 );
		this.scene.add(light);

	
		

	},
	// render stuff
	render: function() {
		//this.camera.rotation.x += 0.2;

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