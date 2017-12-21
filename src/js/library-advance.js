AFRAME.registerComponent('library-advance', {
	schema: {type: 'int'},
	init: function()
	{
		this.active = false;
		this.el.addEventListener('click', this.advance.bind(this));
		this.el.parentElement.addEventListener('pageupdateend', this.updatePaging.bind(this));
	},
	advance: function()
	{
		if(this.active)
		{
			let pageEl = this.el.parentElement;
			let oldPage = pageEl.getAttribute('library-page').page;
			pageEl.setAttribute('library-page', 'page', oldPage + this.data);
		}
	},
	updatePaging: function()
	{
		let page = this.el.parentElement.components['library-page'];
		let service = this.el.sceneEl.systems['poly-service'];

		if(service.pages[page.data.page+this.data] || this.data>0 && page.currentPage.nextPageToken)
		{
			this.el.setAttribute('avr-visible', true);
			this.active = true;
			console.log(`advance ${this.data}: shown`);
		}
		else
		{
			this.el.setAttribute('avr-visible', false);
			this.active = false;
			console.log(`advance ${this.data}: hidden`)
		}
	}
});