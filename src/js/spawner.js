AFRAME.registerComponent('spawner', {
	schema: {
		enabled: {default: true},
		spawnTarget: {type: 'selector', default: '#decor'}
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
			/*let child = document.createElement('a-entity');
			child.id = key;
			child.setAttribute('mixin', 'decoration');
			child.setAttribute('data-src', this.el.getAttribute('gltf-model'));
			child.setAttribute('data-spawnedby', this.el.id);
			child.setAttribute('data-spawnedto', target.id);
			this.data.spawnTarget.appendChild(child);*/

			this.data.spawnTarget.components['decor-sync'].instantiate(
				'model-gltf',
				this.el.getAttribute('gltf-model')
			);

			// disable this spawner until the hand clears the collider
			this.el.setAttribute('spawner', 'enabled', false);
		};
	},
	hoverEnd: function({detail: target})
	{
		target.removeEventListener('gripdown', this.handlers.get(target));
		this.handlers.delete(target);
		this.el.setAttribute('spawner', 'enabled', true);
	}
});