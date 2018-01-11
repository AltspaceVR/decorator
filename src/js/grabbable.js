AFRAME.registerComponent('grabbable', {
	schema: {
		enabled: {default: true},
		dropTarget: {type: 'selector', default: '#decorations'}
	},
	init: function()
	{
		this._hoverStart = this.hoverStart.bind(this);
		this._pickup = this.pickup.bind(this);
		this._drop = this.drop.bind(this);
		this._hoverEnd = this.hoverEnd.bind(this);

		if(this.el.dataset.spawned){
			this.el.parentElement.addEventListener('gripup', this._drop);
			this.el.removeAttribute('data-spawned');
		}
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
		}
	},
	hoverStart: function({detail: hand})
	{
		hand.addEventListener('gripdown', this._pickup);
	},
	pickup: function({detail: hand})
	{

		this.el.addEventListener('gripup', this._drop);
	},
	drop: function({detail: hand})
	{
		// set transform
		this.data.dropTarget.object3D.updateMatrixWorld(true);
		this.el.object3D.updateMatrixWorld(true);

		// set transform
		let mat = new AFRAME.THREE.Matrix4()
			.getInverse(this.data.dropTarget.object3D.matrixWorld)
			.multiply(this.el.object3D.matrixWorld),
			pos = new AFRAME.THREE.Vector3(),
			quat = new AFRAME.THREE.Quaternion(),
			rot = new AFRAME.THREE.Euler(),
			scale = new AFRAME.THREE.Vector3();
		mat.decompose(pos, quat, scale);
		rot.setFromQuaternion(quat);
		rot = rot.toVector3().multiplyScalar(180/Math.PI);

		this.el.setAttribute('position', pos);
		this.el.setAttribute('rotation', rot);
		this.el.setAttribute('scale', scale);

		this.data.dropTarget.appendChild(this.el);
		this.el.setAttribute('collision', 'kinematic', false);
		console.log('drop finished');
	},
	hoverEnd: function({detail: hand})
	{
		hand.removeEventListener('gripdown', this._pickup);
	}
});