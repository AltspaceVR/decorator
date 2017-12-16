AFRAME.registerComponent('avr-visible', {
	schema: {type: 'boolean', default: true},
	update: function()
	{
		this.el.object3D.traverse(o => o.visible = this.data);
	}
});