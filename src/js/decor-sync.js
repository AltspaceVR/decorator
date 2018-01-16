AFRAME.registerComponent('decor-sync',
{
	init: function()
	{
		this.queuedInstantiations = [];
		this.syncSys = this.el.sceneEl.systems['sync-system'];
		this.el.sceneEl.addEventListener('connected', this.connected.bind(this));
	},
	connected: function()
	{
		this.instances = this.syncSys.connection.space.child('decorations');
		this.instances.on('child_added', this.listenToInstanceGroup.bind(this));
		this.instances.on('child_removed', this.stopListeningToInstanceGroup.bind(this));
	},
	listenToInstanceGroup: function(snapshot)
	{
		snapshot.ref().on('child_added', this.createDecoration.bind(this));
		snapshot.ref().on('child_removed', this.removeDecoration.bind(this));
	},
	stopListeningToInstanceGroup: function(snapshot)
	{
		snapshot.ref().off('child_added');
		snapshot.ref().off('child_removed');
	},
	createDecoration: function(snapshot)
	{
		let val = snapshot.val(), key = snapshot.key();

		// create new model
		/*let child = document.createElement('a-entity');
		child.id = key;
		child.setAttribute('mixin', 'decoration');
		child.setAttribute('data-src', this.el.getAttribute('gltf-model'));
		child.setAttribute('data-spawnedby', this.el.id);
		child.setAttribute('data-spawnedto', target.id);
		this.el.appendChild(child);*/
	},
	removeDecoration: function(snapshot)
	{
		let key = snapshot.key();
		let el = this.el.querySelector(`#${key}`);
		el.parentNode.removeChild(el);
	},
	processQueuedInstantiations: function()
	{
		this.queuedInstantiations.forEach(instanceProps => {
			this.instances.push(instanceProps)
			.onDisconnect().remove();
		});
		this.queuedInstantiations.length = 0;
	},
	instantiate: function(type, srcUrl)
	{
		/*
		General: ownerId, clientId
		Specific: type, srcUrl
		*/
		let instanceProps = {

		};

		this.queuedInstantiations.push(instanceProps);
		if(this.syncSys.connected){
			this.processQueuedInstantiations();
		}
	}
});