AFRAME.registerComponent('if-mod', {
	schema: {type: 'string', default: ''},
	init: function()
	{
		let syncSys = this.el.sceneEl.systems['sync-system'];
		if(syncSys.connected){
			evaluateModStatus();
		}
		else {
			this.el.sceneEl.addEventListener('connected', evaluateModStatus);
		}

		let evaluateModStatus = (function(){
			if(syncSys.userInfo.isModerator)
				this.el.setAttribute('mixin', this.data + ' ' + this.el.getAttribute('mixin'));
		}).bind(this);
	}
});