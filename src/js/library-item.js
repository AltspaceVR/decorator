AFRAME.registerComponent('library-item',
{
	schema: {type: 'int'},
	init: function()
	{
		this.maxWidth = this.el.getAttribute('width');
		this.maxHeight = this.el.getAttribute('height');
		this.el.parentElement.addEventListener('pageupdated', this.updateContents.bind(this));
		this.el.addEventListener('materialtextureloaded', this.updateDimensions.bind(this));
	},
	updateContents: function()
	{
		let itemData = this.el.parentElement.components['library-page']
			.currentPage.assets[this.data];
		this.el.setAttribute('src', itemData.thumbnail.url);
	},
	updateDimensions: function()
	{
		let img = this.el.object3DMap.mesh.material.map.image
	}
});