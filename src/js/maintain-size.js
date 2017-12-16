AFRAME.registerComponent('maintain-size', {
	schema: {type: 'vec3'},
	init: function(){
		this.el.addEventListener('model-loaded', this.rescale.bind(this));
	},
	rescale: function()
	{
		this.el.setAttribute('position', {x:0,y:0,z:0});
		this.el.setAttribute('scale', {x:1,y:1,z:1});

		let box = new AFRAME.THREE.Box3();
		box.setFromObject(this.el.object3D);
		let size = box.getSize(),
			center = box.getCenter().sub(this.el.object3D.getWorldPosition());
		let ratio = Math.min(this.data.x/size.x, this.data.y/size.y, this.data.z/size.z);
		
		this.el.setAttribute('scale', {x: ratio, y: ratio, z: ratio});
		this.el.setAttribute('position', center.multiplyScalar(-ratio));
	}
});