AFRAME.registerComponent('grabbable', {
	init: function()
	{
		this._hoverStart = this.hoverStart.bind(this);
		this._pickup = this.pickup.bind(this);
		this._drop = this.drop.bind(this);
		this._hoverEnd = this.hoverEnd.bind(this);

		this.el.addEventListener('collision-start', this._hoverStart);
		this.el.addEventListener('collision-end', this._hoverEnd);
	},
	hoverStart: function()
	{
		this.el.object3DMap.mesh.traverse(obj => {
			if(obj.material){
				obj.material.color.set('gray');
			}
		});
	},
	pickup: function()
	{

	},
	drop: function()
	{

	},
	hoverEnd: function()
	{
		this.el.object3DMap.mesh.traverse(obj => {
			if(obj.material){
				obj.material.color.set('white');
			}
		});
	}
});