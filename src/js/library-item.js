AFRAME.registerComponent('library-item',
{
	schema: {type: 'int'},
	init: function()
	{
		this.itemData = null;
		

		this.el.parentElement.addEventListener('pageupdatestart', this.showLoading.bind(this));
		this.el.parentElement.addEventListener('pageupdateend', this.updateContents.bind(this));
		this.el.addEventListener('materialtextureloaded', this.updateDimensions.bind(this));

		this.el.addEventListener('click', this.previewItem.bind(this));
	},
	showLoading: function()
	{
		this.el.setAttribute('color', '#555');
	},
	updateContents: function()
	{
		this.itemData = this.el.parentElement.components['library-page'].currentPage.assets[this.data];
		if(this.itemData)
			this.el.setAttribute('src', this.itemData.thumbnail.url);
	},
	updateDimensions: function()
	{
		let map = this.el.object3DMap.mesh.material.map;
		let img = map && map.image && map.image.tagName === 'IMG' ? map.image : {width: 1, height: 1};
		let ratio = img.width / img.height;
		
		if(ratio > 1){
			this.el.setAttribute('scale', {x: 1, y: 1/ratio, z: 1});
		}
		else {
			this.el.setAttribute('scale', {x: ratio, y: 1, z: 1});
		}

		if(this.itemData)
			this.el.setAttribute('color', '#fff');
	},

	previewItem: function()
	{
		let spawn = document.querySelector('#spawn');
		let gltfUrls = this.itemData.formats.filter(x => x.formatType === 'GLTF2');
		let polyId = 

		spawn.components.spawner.setSpawn(
			'model-gltf',
			gltfUrls[0].root.url,
			`https://poly.google.com/view/${this.itemData.name.slice(7)}`
		);
	}
});