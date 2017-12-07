AFRAME.registerComponent('library-page',
{
	schema: {
		service: {type: 'string', default: 'poly'},
		page: {type: 'int', default: 0}
	},
	update: async function(oldData)
	{
		this.currentPage = await this.el.sceneEl.systems[`${this.data.service}-service`].fakeGetListing(this.data.page);
		this.el.emit('pageupdated');
	}
});