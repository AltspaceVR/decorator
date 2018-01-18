AFRAME.registerComponent('spawner', {
	schema: {
		enabled: {default: true},
		spawnTarget: {type: 'selector', default: '#decor'}
	},
	init: function()
	{
		this._hoverStart = this.hoverStart.bind(this);
		this._hoverEnd = this.hoverEnd.bind(this);
		this.handlers = new Map();

		this.syncSys = this.el.sceneEl.systems['sync-system'];
		this.activeItem = null;
	},
	update: function()
	{
		if(this.data.enabled){
			this.el.addEventListener('collision-start', this._hoverStart);
			this.el.addEventListener('collision-end', this._hoverEnd);
		}
		else {
			this.el.removeEventListener('collision-start', this._hoverStart);
			this.el.removeEventListener('collision-end', this._hoverEnd);

			for(let [el,handler] of this.handlers){
				this.hoverEnd({detail: el});
			}
		}
	},
	hoverStart: function({detail: target})
	{
		let handler = this.spawn(target);
		this.handlers.set(target, handler);
		target.addEventListener('gripdown', handler);
	},
	spawn: function(target)
	{
		return () => {

			// create new model
			/*let child = document.createElement('a-entity');
			child.id = key;
			child.setAttribute('mixin', 'decoration');
			child.setAttribute('data-src', this.el.getAttribute('gltf-model'));
			child.setAttribute('data-spawnedby', this.el.id);
			child.setAttribute('data-spawnedto', target.id);
			this.data.spawnTarget.appendChild(child);*/

			/*this.data.spawnTarget.components['decor-sync'].instantiate(
				this.activeItem.type,
				this.activeItem.srcUrl,
				this.activeItem.moreInfoUrl
			);*/

			if (!this.syncSys.isConnected) {
				console.error('Spawner: sync system not yet connected, cannot spawn.');
				return;
			}

			/*
			This is copy-pasted from the source code for sync-system#instantiate with minor changes
			*/
			let instantiationProps = {
				instantiatorId: '',
				groupName: 'main',
				mixin: 'decoration',
				parent: this.attrValue.spawnTarget,
				creatorUserId: this.syncSys.userInfo.userId,
				clientId: this.syncSys.clientId
			};
			
			let instance = this.syncSys.instantiatedElementsRef
				.child(instantiationProps.groupName).push(instantiationProps);

			let entityRef = this.syncSys.sceneRef.child(instance.key()),
				ownerRef = entityRef.child('owner'),
				dataRef = entityRef.child('data');

			// assign initial owner
			ownerRef.set(this.syncSys.clientId);

			// compute new local transform matrix
			this.data.spawnTarget.object3D.updateMatrixWorld(true);
			this.el.object3D.updateMatrixWorld(true);
			let mat = new AFRAME.THREE.Matrix4()
				.getInverse(this.data.spawnTarget.object3D.matrixWorld)
				.multiply(this.el.object3D.matrixWorld);
			
			// extract to transform data
			let pos = new AFRAME.THREE.Vector3(),
				quat = new AFRAME.THREE.Quaternion(),
				rot = new AFRAME.THREE.Euler(),
				scale = new AFRAME.THREE.Vector3();
			mat.decompose(pos, quat, scale);
			rot = rot.setFromQuaternion(quat).toVector3().multiplyScalar(180/Math.PI);

			// set sync initial position
			dataRef.child('position').set(pos.toArray().join(' '));
			dataRef.child('rotation').set(rot.toArray().join(' '));
			dataRef.child('scale').set(scale.toArray().join(' '));
			
			// disable this spawner until the hand clears the collider
			this.el.setAttribute('spawner', 'enabled', false);
		};
	},
	hoverEnd: function({detail: target})
	{
		target.removeEventListener('gripdown', this.handlers.get(target));
		this.handlers.delete(target);
		this.el.setAttribute('spawner', 'enabled', true);
	},
	setSpawn: function(type, srcUrl, moreInfoUrl)
	{
		this.activeItem = {type, srcUrl, moreInfoUrl};
		if(type === 'model-gltf')
			this.el.setAttribute('gltf-model', srcUrl);
	}
});