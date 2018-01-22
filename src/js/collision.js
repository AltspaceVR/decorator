import DoubleMap from './double-map';
import includes from 'core-js/fn/array/includes';
import {set_difference, arrayDeepEquals} from './utils';
import AmmoPool from './ammo-pool';

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
		this.ap = new AmmoPool();

		// ammo setup
		Ammo().then(() => {

			// initialize sim world
			let collisionConfig = new Ammo.btDefaultCollisionConfiguration();
			let dispatcher = new Ammo.btCollisionDispatcher(collisionConfig);
			let [min, max] = this.ap.getSome('btVector3', 2);
			min.setValue(-100, -100, -100); max.setValue(100, 100, 100);
			let broadphase = new Ammo.btAxisSweep3(min, max);
			this.world = new Ammo.btCollisionWorld(dispatcher, broadphase, collisionConfig);
			this.ap.done(min, max);

			this.regQueue.forEach(el => this.registerCollisionBody(el));
			this.regQueue = null;
		});
	},
	
	tick: function()
	{
		if(!this.world) return;

		// update object transforms
		this.el2co.forEach((el, co) => 
		{
			try {
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

			// make sure to free any allocated vectors!
			let [pos, scale] = this.ap.getSome('btVector3', 2);
			let quat = this.ap.get('btQuaternion');
			pos.setValue(...worldPos.toArray());
			quat.setValue(...worldRot.toArray());
			scale.setValue(...worldScale.toArray());
			transform.setOrigin(pos);
			transform.setRotation(quat);
			shape.setLocalScaling(scale);
			this.ap.done(pos, quat, scale);

			this.forceUpdateObjects.delete(el);

			if(this.el.sceneEl.hasAttribute('debug') && this._debugMeshes.has(el)){
				let mesh = this._debugMeshes.get(el);
				mesh.position.copy(worldPos);
				mesh.quaternion.copy(worldRot);
				mesh.scale.copy(worldScale);
			}
			}
			catch(e){
				console.error('xfrm update failed:', err, el);
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
			if(manifold.getNumContacts() > 0)
				hits.add(manifold);
		}

		try {
		// detect collision-start
		let newHits = set_difference(hits, this.manifolds);
		for(let manifold of newHits)
		{
			let co1 = manifold.getBody0(), co2 = manifold.getBody1();
			let el1 = this.el2co.getA(co1), el2 = this.el2co.getA(co2);
			if(!el1 || !el2) continue;

			let el1targets = el1.getAttribute('collision').with, el2targets = el2.getAttribute('collision').with;
			if(el1targets.includes(el2) && el2targets.includes(el1))
			{
				el2.emit('collision-start', el1, false);
				el1.emit('collision-start', el2, false);
			}
		}
		}
		catch(e){
			console.error('coll-start failed:', e);
		}

		try {
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
				el2.emit('collision-end', el1, false);
				el1.emit('collision-end', el2, false);
			}
		}
		}
		catch(e){
			console.error('coll-end failed:', e);
		}
		
		// remember last frame's collisions
		this.manifolds = hits;
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
		if(this.el.sceneEl.hasAttribute('debug')){
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

		if(this.el.sceneEl.hasAttribute('debug')){
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
		with: {type: 'selectorAll'
			/*default: [],
			parse: function(value){
				if (!value) { return null; }
				if (typeof value !== 'string') { return value; }

				let sel = value.split(',').map(x => `${x}[collision]`).join(',');
				return Array.prototype.slice.call(document.querySelectorAll(sel), 0);
			}*/
		},
		kinematic: {type: 'boolean', default: false}
	},
	init: function()
	{
		if(this.el.object3DMap.mesh)
			this.updateBounds();
		this.el.addEventListener('model-loaded', this.updateBounds.bind(this));
	},
	update: function(oldData)
	{
		// one last late update when kinematic stops
		if(oldData.kinematic && !this.data.kinematic)
			this.system.forceUpdateTransform(this.el);

		if(!arrayDeepEquals(oldData.with, this.data.with))
		{
			for(let el of this.data.with){
				if(el !== this.el && el.components && el.components.collision){
					console.log('updating collider of', el.id);
					el.components.collision.updateProperties();
				}
			}
		}
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