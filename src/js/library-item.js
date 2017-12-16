AFRAME.registerComponent('library-item',
{
	schema: {type: 'int'},
	init: function()
	{
		this.el.parentElement.addEventListener('pageupdatestart', this.showLoading.bind(this));
		this.el.parentElement.addEventListener('pageupdateend', this.updateContents.bind(this));
		this.el.addEventListener('materialtextureloaded', this.updateDimensions.bind(this));
	},
	showLoading: function()
	{
		this.el.setAttribute('avr-visible', false);
	},
	updateContents: function()
	{
		let itemData = this.el.parentElement.components['library-page']
			.currentPage.assets[this.data];
		if(itemData)
			this.el.setAttribute('src', itemData.thumbnail.url);
	},
	updateDimensions: function()
	{
		let map = this.el.object3DMap.mesh.material.map;
		let img = map ? map.image : {width: 1, height: 1};
		let ratio = img.width / img.height;
		
		if(ratio > 1){
			this.el.setAttribute('scale', {x: 1, y: 1/ratio, z: 1});
		}
		else {
			this.el.setAttribute('scale', {x: ratio, y: 1, z: 1});
		}

		let itemData = this.el.parentElement.components['library-page']
			.currentPage.assets[this.data];
		if(itemData)
			this.el.setAttribute('avr-visible', true);
		else
			this.el.setAttribute('avr-visible', false);
	}
});