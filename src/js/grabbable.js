AFRAME.registerComponent('grabbable', {
	schema: {
		by: {type: 'selectorAll'}
	},
	init: function()
	{
		this.bounds = new AFRAME.THREE.Box3();
		this.el.addEventListener('model-loaded', this.updateBounds.bind(this));

		this._pickup = this.pickup.bind(this);
		this._drop = this.drop.bind(this);

		this.el.addEventListener('beginContact', () => this.el.setAttribute('color', 'red'));
		this.el.addEventListener('endContact', () => this.el.setAttribute('color', 'green'));
	},
	tick: function()
	{

	},
	pickup: function()
	{

	},
	drop: function()
	{

	},
	updateBounds: function(){
		this.bounds.setFromObject(this.el.object3D);
		this.bounds.applyMatrix4(new THREE.Matrix4().getInverse(this.el.object3D.matrixWorld));
	}
});