import DoubleMap from './double-map';
import includes from 'core-js/fn/array/includes';
import {set_difference} from './utils';

/* Useful guide: http://hamelot.io/programming/using-bullet-only-for-collision-detection/ */

AFRAME.registerSystem('collision',
{
	init: function()
	{
		// entity mapping
		this.el2co = new DoubleMap();
		this.el2localBounds = new Map();
		this.regQueue = [];
		this.manifolds = new Set();
		this.forceUpdateObjects = new Set();
		this._debugMeshes = new Map();

		// ammo setup
		Ammo().then(() => {
			let collisionConfig = new Ammo.btDefaultCollisionConfiguration();
			let dispatcher = new Ammo.btCollisionDispatcher(collisionConfig);
			let broadphase = new Ammo.btAxisSweep3(
				new Ammo.btVector3(-100,-100,-100),
				new Ammo.btVector3(100,100,100)
			);
			this.world = new Ammo.btCollisionWorld(dispatcher, broadphase, collisionConfig);

			this.regQueue.forEach(el => this.registerCollisionBody(el));
			this.regQueue = null;
		});
	},
	
	tick: function()
	{
		if(!this.world) return;

		try {
		// update object transforms
		this.el2co.forEach((el, co) => 
		{
			if(!this.forceUpdateObjects.has(el) && !el.getAttribute('collision').kinematic){
				return;
			}

			el.object3D.updateMatrixWorld(true);
			let localBounds = this.el2localBounds.get(el);
			let worldPos = el.object3D.localToWorld(localBounds.getCenter());
			let worldRot = el.object3D.getWorldQuaternion();
			let worldScale = el.object3D.getWorldScale();
			let transform = co.getWorldTransform();
			let shape = co.getCollisionShape();
			/*if(el.id === 'spawn'){
				console.log('transform update');
				console.log('local center:', localBounds.getCenter().toArray());
				console.log('world center:', worldPos.toArray());
				console.log('object root:', el.object3D.getWorldPosition().toArray());
			}*/

			transform.setOrigin(new Ammo.btVector3(worldPos.x, worldPos.y, worldPos.z));
			transform.setRotation(new Ammo.btQuaternion(worldRot.x, worldRot.y, worldRot.z, worldRot.w));
			shape.setLocalScaling(new Ammo.btVector3(worldScale.x, worldScale.y, worldScale.z));

			this.forceUpdateObjects.delete(el);

			if(this.el.sceneEl.components.debug && this._debugMeshes.has(el)){
				let mesh = this._debugMeshes.get(el);
				mesh.position.copy(worldPos);
				mesh.quaternion.copy(worldRot);
				mesh.scale.copy(worldScale);
			}
		});

		// update collision list
		this.world.performDiscreteCollisionDetection();

		// get list of intersecting objects
		let dispatcher = this.world.getDispatcher();
		let hitCount = dispatcher.getNumManifolds();
		let hits = new Set();
		for(let i=0; i<hitCount; i++){
			let manifold = dispatcher.getManifoldByIndexInternal(i);
			hits.add(manifold);
		}

		// detect collision-start
		let newHits = set_difference(hits, this.manifolds);
		for(let manifold of newHits)
		{
			let co1 = manifold.getBody0(), co2 = manifold.getBody1();
			let el1 = this.el2co.getA(co1), el2 = this.el2co.getA(co2);
			if(!el1 || !el2) continue;

			let el1targets = [...el1.getAttribute('collision').with], el2targets = [...el2.getAttribute('collision').with];
			if(el1targets.includes(el2) && el2targets.includes(el1))
			{
				console.log('collision start');
				el2.emit('collision-start', el1, false);
				el1.emit('collision-start', el2, false);
			}
		}

		// detect collision-end
		let oldHits = set_difference(this.manifolds, hits);
		for(let manifold of oldHits)
		{
			let co1 = manifold.getBody0(), co2 = manifold.getBody1();
			let el1 = this.el2co.getA(co1), el2 = this.el2co.getA(co2);
			if(!el1 || !el2) continue;

			let el1targets = [...el1.getAttribute('collision').with], el2targets = [...el2.getAttribute('collision').with];
			if(el1targets.includes(el2) && el2targets.includes(el1))
			{
				console.log('collision end');
				el2.emit('collision-end', el1, false);
				el1.emit('collision-end', el2, false);
			}
		}

		// remember last frame's collisions
		this.manifolds = hits;
		}
		catch(e){
			console.error('collision error', e.stack);
			throw e;
		}
	},

	registerCollisionBody(el)
	{
		if(!this.world){
			this.regQueue.push(el);
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
		let halfExtants = new Ammo.btVector3(size.x/2, size.y/2, size.z/2);
		let co = new Ammo.btCollisionObject();
		co.setCollisionShape(new Ammo.btBoxShape(halfExtants));
		this.el2co.set(el, co);

		this.world.addCollisionObject(co);

		// create debug mesh
		if(this.el.sceneEl.components.debug){
			let mesh = new THREE.Mesh(
				new THREE.BoxBufferGeometry(size.x, size.y, size.z),
				new THREE.MeshBasicMaterial({color: 'magenta', transparent: true, opacity: .2})
			);
			this._debugMeshes.set(el, mesh);
			this.el.sceneEl.object3D.add(mesh);
		}
	},

	removeCollisionBody(el)
	{
		let co = this.el2co.getB(el);
		this.world.removeCollisionObject(co);
		this.el2co.deleteA(el);

		if(this.el.sceneEl.components.debug){
			this.el.sceneEl.object3D.remove(this._debugMeshes.get(el));
			this._debugMeshes.delete(el);
		}
	},

	isRegistered(el){
		return !!this.el2co.getB(el);
	},

	forceUpdateTransform(el){
		this.forceUpdateObjects.add(el);
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
	update: function(oldData){
		// one last late update when kinematic stops
		if(oldData.kinematic && !this.data.kinematic)
			this.system.forceUpdateTransform(this.el);
	},
	updateBounds: function(){
		//if(this.el.id === 'spawn') console.log('updateBounds');
		if(this.system.isRegistered(this.el))
			this.system.removeCollisionBody(this.el);
		this.system.registerCollisionBody(this.el);
		this.updateTransform();
	},
	updateTransform: function(){
		//if(this.el.id === 'spawn') console.log('updateTransform');
		this.system.forceUpdateTransform(this.el);
	},
	remove: function(){
		this.system.removeCollisionBody(this.el);
	}
})