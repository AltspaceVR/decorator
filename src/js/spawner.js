AFRAME.registerComponent('spawner', {
	schema: {
		enabled: {default: true},
		spawnTarget: {type: 'selector', default: '#decorations'}
	},
	init: function()
	{
		this._hoverStart = this.hoverStart.bind(this);
		this._hoverEnd = this.hoverEnd.bind(this);
		this.handlers = new Map();
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
			let child = document.createElement('a-entity');
			child.classList.add('decoration');
			child.setAttribute('mixin', 'model');
			child.setAttribute('data-src', this.el.getAttribute('gltf-model'));
			child.setAttribute('data-spawned', 'true');
			child.setAttribute('grabbable', {enabled: false});
			child.setAttribute('collision', {with: '#lefthand,#righthand', kinematic: true});
			target.appendChild(child);

			this.el.object3D.updateMatrixWorld(true);
			target.object3D.updateMatrixWorld(true);
			console.log('target pos:', target.object3D.getWorldPosition().toArray());
			console.log('entity pos:', this.el.object3D.getWorldPosition().toArray());

			// set transform
			let mat = new AFRAME.THREE.Matrix4()
				.getInverse(target.object3D.matrixWorld)
				.multiply(this.el.object3D.matrixWorld),
				pos = new AFRAME.THREE.Vector3(),
				quat = new AFRAME.THREE.Quaternion(),
				rot = new AFRAME.THREE.Euler(),
				scale = new AFRAME.THREE.Vector3();
			mat.decompose(pos, quat, scale);
			rot.setFromQuaternion(quat, 'XYZ');
			rot = rot.toVector3().multiplyScalar(180/Math.PI);

			console.log('relative pos:', pos.toArray());

			child.setAttribute('position', pos);
			child.setAttribute('rotation', rot);
			child.setAttribute('scale', scale);

			this.el.setAttribute('spawner', 'enabled', false);
		};
	},
	hoverEnd: function({detail: target})
	{
		console.log('hover end');
		target.removeEventListener('gripdown', this.handlers.get(target));
		this.handlers.delete(target);
		this.el.setAttribute('spawner', 'enabled', true);
	}
});