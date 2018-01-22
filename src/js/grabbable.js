import {setLocalTransform} from './utils';

let mat = new AFRAME.THREE.Matrix4();

AFRAME.registerComponent('grabbable', {
	dependencies: ['sync'],
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

		this.sync = this.el.components.sync;
		if(this.sync.isConnected)
			this.spawnPickup();
		else
			this.el.addEventListener('connected', this.spawnPickup.bind(this));
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
	},
	spawnPickup: function()
	{
		let self = this,
			syncSys = this.el.sceneEl.systems['sync-system'];

		self.sync.dataRef.child('spawnClient').on('value', checkSpawnClient);
		function checkSpawnClient(snapshot)
		{
			if(snapshot.val() === syncSys.clientId){
				self.sync.dataRef.child('grabber').on('value', assignGrabHand);
			}
		}

		function assignGrabHand(snapshot)
		{
			if(!snapshot.val()) return;
			
			let hand = document.getElementById(snapshot.val());
			console.log(snapshot.val(), hand);
			self.pickup({detail: hand});
			self.sync.dataRef.child('spawnClient').remove();
			self.sync.dataRef.child('grabber').remove();
		}
	}
});