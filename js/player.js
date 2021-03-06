var Player = function(gameScope, cameraControls) {
	this.game = gameScope;
	this.velocity = new THREE.Vector3(0,0,0);
	this.airborne = false; // in der luft?
	this.cameraControls = cameraControls;
	this.animation =  null;
}

Player.prototype = {
	init: function(position) {
		var self = this;
		this.game.loader.load('models/santa2f.json', function(geometry, materials) {

			// ensure loop?
			animation = geometry.animations[0];
			for ( var i = 0; i < animation.hierarchy.length; i ++ ) {

					var bone = animation.hierarchy[ i ];

					var first = bone.keys[ 0 ];
					var last = bone.keys[ bone.keys.length - 1 ];

					last.pos = first.pos;
					last.rot = first.rot;
					last.scl = first.scl;

				}

			//geometry.center();
			for (var i = 0; i< materials.length; i++) {
				materials[i].shading = THREE.FlatShading;
			//	materials[i].skinning = true;
			}
			var facematerial = new THREE.MeshFaceMaterial(materials);


			facematerial.skinning = true;
			self.player = new THREE.SkinnedMesh(
				geometry,
				facematerial
				
			//	new THREE.MeshLambertMaterial({color: 0x00ff00, shading: THREE.FlatShading})
			);
			//ld31.player.scale.set(2,2,2);
			self.player.scale.set(0.7,0.7,0.7);
			self.player.castShadow = true;
			self.player.receiveShadow = true;
		
			self.player.position.set(position.x, position.y, position.z);
			//this.player.add(this.camera);
			self.cameraControls.setTarget(self.player);

			
			self.animate();
			self.game.scene.add(self.player);

		/*	helper = new THREE.SkeletonHelper( self.player );
			helper.material.linewidth = 3;
			helper.visible = true;
			self.game.scene.add( helper );
		*/
			// reset positionaddLaterne(-100, -34, 100);
			// ld31.motion.position.set(-100,-38,100);
			// ld31.motion.velocity.multiplyScalar(0);


		});


	},
	animate: function() {
		var self = this;
		var materials = self.player.material.materials;
		for (var k in materials) {
			var mat = self.player.material.materials[k];
			mat.skinning = true;
			//materials[k].skinning = true;
		}



	//	console.log(materials);

    	  //THREE.AnimationHandler.add( self.player.geometry.animations[0]);
		self.animation = new THREE.Animation(self.player, self.player.geometry.animations[0]);
		
		self.animation.play(0.4);
		self.animation.loop = false;
	},
	update: function(delta) {
		// THREE.AnimationHandler.update(delta);
		if (this.animation) {
			if (this.speed == 0 && this.animation.currentTime >= 0.5 ) {
				// standing animation
				this.animation.play(0.4);
				this.animation.update(delta *30);
				//this.animation.stop();
			} else {
				if (this.animation.currentTime >= 1.9) {
					//this.animation.stop();
					this.animation.play(0.4);
				}
				this.animation.update(delta *300 * this.speed);

			}
		}
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
				if (horizontal < 0.1 && horizontal > -0.1) {
					horizontal = 0;
				}
			}
			if (!vertical) {
				vertical = pad.leftStickY;
				if (vertical < 0.1 && vertical > -0.1) {
					vertical = 0;
				}
			}

		}

		speed = new THREE.Vector2(horizontal, vertical);
		speed = speed.dot(speed);
		speed = speed * 0.2;
		self.speed = speed;

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

	
		var rootAngle = targetDirection.angleTo(moveDirection) * (axisSign.y >= 0 ? -1.0 : 1.0);
		rootAngle = rootAngle;
		if (rootAngle) {
		 self.player.rotateY( rootAngle * 0.2 );

		}

		self.player.translateZ(speed);


//		var forward = 0.0; //new THREE.Vector3();
		//var delta = self.game.clock.getDelta();
  		//var rotateAngle = Math.PI / 2 * delta; 
  		/*
		if (inputState.pressed[inputState.keys.SPACE] && !inputState.motion.airborne) {
			inputState.motion.airborne = true;
			//forward.y = 0.4;
		}*/

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

	}
}