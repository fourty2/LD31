var ThirdPersonCamera = function(camera) {
	this.camera = camera;
}

ThirdPersonCamera.prototype = {
	setTarget: function(target) {
		this.target = target;
	},
	init: function(distanceAway, distanceUp) {
		this.distanceUp = distanceUp;
		this.distanceAway = distanceAway;
	},
	update: function() {

		var cameraPosition = new THREE.Vector3().copy(this.target.position);

		//cameraPosition.applyQuaternion(this.target.quaternion);
		//cameraPosition.copy(this.target.position);
		cameraPosition.add( new THREE.Vector3(0, this.distanceUp, 0));

		console.log(cameraPosition);
	//	cameraPosition.translateZ(-30);

//		cameraPosition = target.position + 
//		V3(Vector3.up * distanceUp) -
//		V3(target.forward * distanceAway)
		//console.log(this.target.forward);
		this.camera.position.copy(cameraPosition);
		this.camera.rotation.copy(this.target.rotation);
		this.camera.translateZ(-20);
		this.camera.lookAt(this.target.position);
		this.camera.updateMatrix();


	}
}