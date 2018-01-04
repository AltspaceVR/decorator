AFRAME.registerComponent('grab-indicator',
{
	init: function()
	{
		this.el.setAttribute('color', 'white');
		this.el.addEventListener('collision-start', () => {
			this.el.setAttribute('color', 'yellow');
		});
		this.el.addEventListener('collision-end', () => {
			this.el.setAttribute('color', 'white');
		})
	}
});