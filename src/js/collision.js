import DoubleMap from './double-map';

/* Useful guide: http://hamelot.io/programming/using-bullet-only-for-collision-detection/ */

AFRAME.registerSystem('collision',
{
	init: function()
	{
		// entity mapping
		this.el2co = new DoubleMap();
		this.el2localBounds = new Map();
		this._regQueue = [];
		this._step = 0;

		// ammo setup
		Ammo().then(() => {
			let collisionConfig = new Ammo.btDefaultCollisionConfiguration();
			let dispatcher = new Ammo.btCollisionDispatcher(collisionConfig);
			let solver = new Ammo.btSequentialImpulseConstraintSolver();
			let broadphase = new Ammo.btDbvtBroadphase();
			this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfig);

			this._regQueue.forEach(el => this.registerCollisionBody(el));
			this._regQueue = null;
		});
	},
	
	tick: function()
	{
		if(!this.world) return;

		// update dynamic object transforms
		this.el2co.forEach((el, co) => 
		{
			if(!el.getAttribute('collision').kinematic){
				return;
			}

			let localBounds = this.el2localBounds.get(el);
			let worldPos = el.object3D.localToWorld(localBounds.getCenter());
			let worldRot = el.object3D.getWorldQuaternion();
			let worldScale = el.object3D.getWorldScale();
			let transform = co.getWorldTransform();
			let shape = co.getCollisionShape();

			transform.setOrigin(new Ammo.btVector3(worldPos.x, worldPos.y, worldPos.z));
			transform.setRotation(new Ammo.btQuaternion(worldRot.x, worldRot.y, worldRot.z, worldRot.w));
			shape.setLocalScaling(new Ammo.btVector3(worldScale.x, worldScale.y, worldScale.z));
		});

		this.world.stepSimulation(this._step++);

		let dispatcher = this.world.getDispatcher();
		let hitCount = dispatcher.getNumManifolds();
		for(let i=0; i<hitCount; i++)
		{
			let manifold = dispatcher.getManifoldByIndexInternal(i);
			let co1 = manifold.getBody0(), co2 = manifold.getBody1();
			let el1 = this.el2co.getA(co1), el2 = this.el2co.getA(co2);
			if(el1.getAttribute('collision').with.includes(el2) && el2.getAttribute('collision').with.includes(el1))
			{
				console.log('fire event!');
				//el2.dispatchEvent('collision-start', el1, false);
				//el1.dispatchEvent('collision-start', el2, false);
			}
		}
	},

	registerCollisionBody(el)
	{
		if(!this.world){
			this._regQueue.push(el);
			return;
		}

		// compute bounding box of entity
		let bounds = new AFRAME.THREE.Box3();
		bounds.setFromObject(el.object3DMap.mesh);
		let inv = new THREE.Matrix4().getInverse(el.object3D.matrixWorld);
		bounds.applyMatrix4(inv);
		this.el2localBounds.set(el, bounds);

		// create shape
		let size = bounds.getSize();
		let halfExtants = new Ammo.btVector3(size.x, size.y, size.z);
		let shape = new Ammo.btBoxShape(halfExtants);
		let co = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(1, null, shape));
		this.el2co.set(el, co);

		this.world.addCollisionObject(co);
	},

	removeCollisionBody(el)
	{

	},

	isRegistered(el){
		return !!this.el2co.getB(el);
	}
});

AFRAME.registerComponent('collision', {
	schema: {
		with: {type: 'selectorAll'},
		kinematic: {type: 'boolean', default: false}
	},
	init: function(){
		if(this.el.object3DMap.mesh)
			this.updateBounds();
		this.el.addEventListener('model-loaded', this.updateBounds.bind(this));
	},
	updateBounds: function(){
		if(this.system.isRegistered(this.el))
			this.system.removeCollisionBody(this.el);
		this.system.registerCollisionBody(this.el);
	},
	remove: function(){
		this.system.removeCollisionBody(this.el);
	}
})