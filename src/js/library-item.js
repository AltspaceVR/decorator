AFRAME.registerComponent('library-item',
{
	schema: {type: 'int'},
	init: function(){
		this.el.parentElement.addEventListener('pageupdated', this.updateContents.bind(this));
	},
	updateContents: function()
	{
	
	}
});