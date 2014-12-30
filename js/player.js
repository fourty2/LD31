var Player = function(gameScope, cameraControls) {
	this.game = gameScope;
	this.velocity = new THREE.Vector3(0,0,0);
	this.airborne = false; // in der luft?
	this.cameraControls = cameraControls;
}

Player.prototype = {
	init: function(position) {
		var self = this;
		this.game.loader.load('models/santa.json', function(geometry, materials) {
			geometry.center();
			for (var i = 0; i< materials.length; i++) {
				materials[i].shading = THREE.FlatShading;
			}

			self.player = new THREE.Mesh(
				geometry,
				new THREE.MeshFaceMaterial(materials)
			//	new THREE.MeshLambertMaterial({color: 0x00ff00, shading: THREE.FlatShading})
			);
			//ld31.player.scale.set(2,2,2);
			self.player.castShadow = true;
			self.player.receiveShadow = true;

			self.player.position.set(position.x, position.y, position.z);
			//this.player.add(this.camera);
			self.cameraControls.setTarget(self.player);

			self.game.scene.add(self.player);



			// reset positionaddLaterne(-100, -34, 100);
			// ld31.motion.position.set(-100,-38,100);
			// ld31.motion.velocity.multiplyScalar(0);


		});


	},
	moveWithInput: function(inputState) {
		var self = this;
		var vertical = 0.0;
		var horizontal = 0.0;
		var speed = 0;


		if (!self.player) {
			return;
		}

		// get vertical (forward/backward) direction;
		if (inputState.pressed[inputState.keys.UP] || inputState.pressed[inputState.keys.W]) {
			vertical = -1.0;
		} 
		else if (inputState.pressed[inputState.keys.DOWN] || inputState.pressed[inputState.keys.S]) {
			vertical = 1.0;
		}
		else {
			vertical = 0.0;
		}


		if (inputState.pressed[inputState.keys.LEFT] || inputState.pressed[inputState.keys.A]) {
        	horizontal = -1.0;
		} 
		else if (inputState.pressed[inputState.keys.RIGHT] || inputState.pressed[inputState.keys.D]) {
	      	horizontal = 1.0;
		}
		else {
			horizontal = 0.0;
		}

		var pads = Gamepad.getStates();
		var pad = pads[0];
		if (pad) {
			if (!horizontal) {
				horizontal = pad.leftStickX;
			}
			if (!vertical) {
				vertical = pad.leftStickY;
			}

		}


		speed = new THREE.Vector2(horizontal, vertical);
		speed = speed.dot(speed);
		speed = speed * 0.4;
/*		console.log(vertical);
		console.log(horizontal);
		console.log("speed: " + speed);
		console.log("direction: " + horizontal);
*/
		var stickDirection = new THREE.Vector3(horizontal, 0, vertical);

		var targetMatrix = new THREE.Matrix4();
		targetMatrix.extractRotation(self.player.matrix);
		var targetDirection = new THREE.Vector3(1,0,1); // root direction
		targetDirection = targetDirection.applyMatrix4(targetMatrix);

			
		// get camera direction
		var cameraMatrix = new THREE.Matrix4();
		cameraMatrix.extractRotation(self.cameraControls.camera.matrix);
		var cameraDirection = new THREE.Vector3(1,1,1); // root direction
		cameraDirection = cameraDirection.applyMatrix4(cameraMatrix);

		cameraDirection.y = 0;

		var referentialShift = new THREE.Quaternion();
		referentialShift.setFromUnitVectors(new THREE.Vector3(0,0,1), cameraDirection);
		
		var moveDirection = new THREE.Vector3();
		moveDirection.copy(stickDirection);
		moveDirection.applyQuaternion(referentialShift);

		var axisSign = new THREE.Vector3();
		axisSign.crossVectors(moveDirection, targetDirection);

//		moveDirection.multiplyVectors(referentialShift, targetDirection);
	
		
		var rootAngle = targetDirection.angleTo(moveDirection) * (axisSign.y >= 0 ? -1.0 : 1.0);
		//rootAngle = rootAngle / 180;
		if (rootAngle) {
			console.log("would rotate to " + rootAngle)
		 self.player.rotateY( rootAngle * 0.2 );

		}

		self.player.translateZ(speed);


//		var forward = 0.0; //new THREE.Vector3();
		var delta = self.game.clock.getDelta();
  		var rotateAngle = Math.PI / 2 * delta; 

//		var sideways = new THREE.Vector3();
		// calculate x and y steps for current rotation

		//forward.set( Math.sin( self.player.rotation.y ), 0, Math.cos( self.player.rotation.y ) );
//		sideways.set( forward.z, 0, -forward.x );

	/*	if (inputState.pressed[inputState.keys.UP] || inputState.pressed[inputState.keys.W]) {
			forward = 0.3;
		} 
		else if (inputState.pressed[inputState.keys.DOWN] || inputState.pressed[inputState.keys.S]) {
			forward = -0.3;
		}
		else {
			forward = 0.0;
		}

		if (inputState.pressed[inputState.keys.SPACE] && !inputState.motion.airborne) {
			inputState.motion.airborne = true;
			//forward.y = 0.4;
		}

	// wir wollen nicht mehr schrittweise rotieren, sondern quasi nach rechts laufen. also rotieren und dann vorwärtsbewegung.
		if (inputState.pressed[inputState.keys.LEFT] || inputState.pressed[inputState.keys.A]) {
        	//self.player.rotateY(90);
        	self.player.translateX(0.3);
		} 
		else if (inputState.pressed[inputState.keys.RIGHT] || inputState.pressed[inputState.keys.D]) {
	       	//self.player.rotateY(-rotateAngle);
        	self.player.translateX(-0.3);

		}

		self.player.translateZ(forward);
		*/

		//var relativeCameraOffset = new THREE.Vector3(0, 20, 30);
		// hard version ;)
//		var relativeCameraOffset = new THREE.Vector3(0, 60, 200);

		//var cameraOffset = relativeCameraOffset.applyMatrix4(ld31.player.matrixWorld);
		// Camera TWEEN.
	/*	if (!ld31.lookAround) {
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
		*/

	

		




	/*
		var combined = forward; //.add( sideways );
		if( Math.abs( combined.x ) >= Math.abs( inputState.motion.velocity.x ) ) inputState.motion.velocity.x = combined.x;
		if( Math.abs( combined.y ) >= Math.abs( inputState.motion.velocity.y ) ) inputState.motion.velocity.y = combined.y;
		if( Math.abs( combined.z ) >= Math.abs( inputState.motion.velocity.z ) ) {
			inputState.motion.velocity.z = combined.z;
		}
	
*/

	}


}

