import {setLocalTransform} from './utils';

let mat = new AFRAME.THREE.Matrix4();

AFRAME.registerComponent('grabbable', {
	schema: {
		enabled: {default: true}
	},
	init: function()
	{
		this.grabber = null;
		this.localTransform = new AFRAME.THREE.Matrix4();

		// pre-bound event handlers
		this._hoverStart = this.hoverStart.bind(this);
		this._pickup = this.pickup.bind(this);
		this._drop = this.drop.bind(this);
		this._hoverEnd = this.hoverEnd.bind(this);

		// set initial transform and grabber from data attributes
		if(this.el.dataset.spawnedby && this.el.dataset.spawnedto)
		{
			let spawner = document.getElementById(this.el.dataset.spawnedby);
			let target = document.getElementById(this.el.dataset.spawnedto);

			spawner.object3D.updateMatrixWorld(true);
			this.el.object3D.updateMatrixWorld(true);
			mat.getInverse(this.el.object3D.matrixWorld)
				.multiply(spawner.object3D.matrixWorld);
			setLocalTransform(this.el, mat);

			this.pickup({detail: target});

			this.el.removeAttribute('data-spawnedby');
			this.el.removeAttribute('data-spawnedto');
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
		this.grabber = hand;

		// the transform of the object in hand space
		hand.object3D.updateMatrixWorld(true);
		this.el.object3D.updateMatrixWorld(true);
		this.localTransform.getInverse(hand.object3D.matrixWorld)
			.multiply(this.el.object3D.matrixWorld);

		this.el.setAttribute('collision', 'kinematic', true);
		hand.addEventListener('gripup', this._drop);
	},
	drop: function({detail: hand})
	{
		if(this.grabber === hand)
		{
			this.grabber = null;
			this.el.setAttribute('collision', 'kinematic', false);
		}
	},
	hoverEnd: function({detail: hand})
	{
		hand.removeEventListener('gripdown', this._pickup);
	},
	tick: function()
	{
		if(this.grabber)
		{
			this.grabber.object3D.updateMatrixWorld(true);
			setLocalTransform(this.el,
				mat.getInverse(this.el.object3D.parent.matrixWorld)
				.multiply(this.grabber.object3D.matrixWorld)
				.multiply(this.localTransform)
			);
		}
	}
});