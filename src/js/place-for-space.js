AFRAME.registerComponent('place-for-space', {
	schema: {
		templates: {default: []},
		mixins: {default: []},
		otherwise: {default: ''}
	},
	init: async function(){
		let space = altspace.inClient ? await altspace.getSpace() : {};
		console.log(space);
		let index = this.data.templates.indexOf(space.templateSid);
		if(index >= 0){
			this.el.setAttribute('mixin', this.data.mixins[index]);
		}
		else {
			this.el.setAttribute('mixin', this.data.otherwise);
		}
	}
});