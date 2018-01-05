AFRAME.registerComponent('spawner', {
	schema: {
		enabled: {default: true}
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
			child.setAttribute('grabbable', {enabled: true});
			child.setAttribute('collision', {with: '#lefthand,#righthand', kinematic: true});

			// set transform
			target.object3D.updateMatrixWorld(true);
			let mat = new AFRAME.THREE.Matrix4().getInverse(target.object3D.matrixWorld)
				.multiply(this.el.object3D.matrixWorld);

			let pos = new AFRAME.THREE.Vector3(),
				quat = new AFRAME.THREE.Quaternion(),
				scale = new AFRAME.THREE.Vector3();
			mat.decompose(pos, quat, scale);
			let rot = new AFRAME.THREE.Euler().setFromQuaternion(quat);

			child.setAttribute('position', pos);
			child.setAttribute('rotation', rot);
			child.setAttribute('scale', scale);

			target.appendChild(child);
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