AFRAME.registerComponent('set-from-data', {
	schema: {
		from: {type: 'string'},
		to: {type: 'array'}
	},
	multiple: true,
	update: function(){
		this.el.setAttribute(...this.data.to, this.el.dataset[this.data.from]);
	}
});