var ThirdPersonCamera = function(camera) {
	this.camera = camera;
}

ThirdPersonCamera.prototype = {
	setTarget: function(target) {
		this.target = target;
	/*	var targetMatrix = new THREE.Matrix4();
		targetMatrix.extractRotation(this.target.matrix);
		var targetDirection = new THREE.Vector3(0,0, this.distanceAway);
		targetDirection = targetDirection.applyMatrix4(targetMatrix); //targetMatrix.multiplyVector3(targetDirection);
		var cameraPosition = new THREE.Vector3().copy(this.target.position);

	
		cameraPosition.add( new THREE.Vector3(0, this.distanceUp, 0));
		cameraPosition.sub( targetDirection );
	
		this.camera.position.copy(cameraPosition);
		this.camera.lookAt(this.target.position);
		this.camera.updateMatrix();
		*/
	},
	init: function(distanceAway, distanceUp) {
		this.distanceUp = distanceUp;
		this.distanceAway = distanceAway;

		
	},
	update: function() {
		var characterOffset = this.target.position.clone().add(new THREE.Vector3(0,2.0,0));
		var lookDirection = new THREE.Vector3().subVectors(characterOffset, this.camera.position);
		lookDirection.y = 0.0;
		lookDirection.normalize();
//		console.log(lookDirection);

		cameraPosition = new THREE.Vector3().addVectors(characterOffset, new THREE.Vector3(0, this.distanceUp, 0));
		cameraPosition.sub( new THREE.Vector3().multiplyVectors(lookDirection, new THREE.Vector3(this.distanceAway, this.distanceAway, this.distanceAway)));



	/*	var targetMatrix = new THREE.Matrix4();
		targetMatrix.extractRotation(this.target.matrix);
		var targetDirection = new THREE.Vector3(0,0, this.distanceAway);
		targetDirection = targetDirection.applyMatrix4(targetMatrix); //targetMatrix.multiplyVector3(targetDirection);
		var cameraPosition = new THREE.Vector3().copy(this.target.position);

	
		cameraPosition.add( new THREE.Vector3(0, this.distanceUp, 0));
		cameraPosition.sub( targetDirection );
		*/
		
		this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
		// check 
		var targetPosition = this.target.position.clone();
		targetPosition.y += 4;

		this.camera.lookAt(targetPosition);
		this.camera.updateMatrix();
		
		//this.camera.lookAt(this.target.position);

	}
}