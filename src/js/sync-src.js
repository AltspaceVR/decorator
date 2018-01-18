import debounce from 'debounce';

AFRAME.registerComponent('sync-src', {
	dependencies: ['sync'],
	init: function()
	{
		this.currentData = {type: '', srcUrl: '', moreInfoUrl: ''};
		this.sync = this.el.components.sync;

		this.el.addEventListener('click', () => {
			if(this.currentData.moreInfoUrl)
				altspace.open(this.currentData.moreInfoUrl);
		});

		if(this.sync.isConnected)
			this.init2();
		else
			this.el.addEventListener('connected', this.init2.bind(this));
	},
	init2: function()
	{
		let applyData = debounce(() => {
			if(this.currentData.type === 'model-gltf'){
				// TODO: remove other types
				this.el.setAttribute('gltf-model', this.currentData.srcUrl);
			}
		}, 150);

		let typeRef = this.sync.dataRef.child('type'),
			srcRef = this.sync.dataRef.child('srcUrl'),
			moreInfoRef = this.sync.dataRef.child('moreInfoUrl');

		typeRef.on('value', snapshot => {
			if(!this.currentData.type){
				this.currentData.type = snapshot.val();
				applyData();
			}
		});

		srcRef.on('value', snapshot => {
			if(!this.currentData.srcUrl){
				this.currentData.srcUrl = snapshot.val();
				applyData();
			}
		});

		moreInfoRef.on('value', snapshot => {
			if(!this.currentData.moreInfoUrl){
				this.currentData.moreInfoUrl = snapshot.val();
			}
		});
	}
});