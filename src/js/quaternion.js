AFRAME.registerComponent('quaternion',
{
	schema: {type: 'vec4'},
	update: function()
	{
		//this.el.object3D.quaternion.copy(this.data);
		let e = new AFRAME.THREE.Euler().setFromQuaternion(this.data, 'YZX').toVector3().multiplyScalar(180/Math.PI);
		this.el.setAttribute('rotation', e);
	}
});