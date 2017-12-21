AFRAME.registerComponent('avr-visible', {
	schema: {type: 'boolean', default: false},
	init: function()
	{
		this.el.addEventListener('model-loaded', this.update.bind(this));
	},
	update: function()
	{
		console.log('visible update:', this.data);
		this.el.object3D.traverse(o => o.visible = this.data);
	}
});