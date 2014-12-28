// snow

var Snow = function(gameScope) {
	this.scope = gameScope;
	this.scene = this.scope.scene;
}

Snow.prototype = {
	init: function() {
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
	}

}