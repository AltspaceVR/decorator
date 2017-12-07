AFRAME.registerComponent('list-library-items',
{
	schema: {
		service: {type: 'string', default: 'poly'},
		page: {type: 'int', default: 0}
	},
	update: async function(oldData)
	{
		let payload = await this.el.sceneEl.systems[`${this.data.service}-service`].fakeGetListing(this.data.page);
		console.log(payload);
	}
});