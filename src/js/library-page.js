AFRAME.registerComponent('library-page',
{
	schema: {
		service: {type: 'string', default: 'poly'},
		page: {type: 'int', default: 0}
	},
	update: async function(oldData)
	{
		this.el.emit('pageupdatestart');
		try {
			let fnName = this.el.sceneEl.hasAttribute('debug') ? 'fakeGetListing' : 'getListing';
			this.currentPage = await this.el.sceneEl.systems[`${this.data.service}-service`][fnName](this.data.page);
		}
		catch(e){
			console.error(e.stack);
		}
		this.el.emit('pageupdateend');
	}
});