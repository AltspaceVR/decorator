function getGamepads()
{
	if(!altspace.inClient) return Promise.reject();

	function getPads(resolve, reject)
	{
		console.log('Attempting to get controllers');
		gamepads = altspace.getGamepads();
		if(gamepads.length > 0){
			console.log('Got controllers');
			resolve(gamepads.filter(g => !!g.hand));
		}
		else {
			reject();
		}
	}

	function waitForFocus(resolve, reject)
	{
		let scene = document.querySelector('a-scene');
		function clearAndResolve(){
			scene.removeEventListener('click', clearAndResolve);
			resolve();
		}

		console.log('waiting for focus');
		scene.addEventListener('click', clearAndResolve);
	}

	function getPadsRepeatedly(attemptsRemaining)
	{
		return new Promise(getPads).catch(() => {
			if(--attemptsRemaining > 0){
				return new Promise((resolve, reject) => setTimeout(resolve, 500))
					.then(() => getPadsRepeatedly(attemptsRemaining));
			}
			else
				console.log('Failed to get controllers');
		});
	}

	return new Promise(getPads)
		.catch(() => new Promise(waitForFocus))
		.then(() => getPadsRepeatedly(20));
}

let gamepads = [];
let gamepadsPromise = null;


AFRAME.registerComponent('altspace-controls',
{
	schema: {default: 'right'},
	init: async function()
	{
		this.gamepad = null;
		this.parentInverse = new THREE.Matrix4().getInverse(
			this.el.parentElement.object3D.matrixWorld
		);
		if(!gamepadsPromise)
			gamepadsPromise = getGamepads();

		let pads = gamepads.length > 0 ? gamepads : await gamepadsPromise;
		this.gamepad = pads.filter(p => p.hand === this.data)[0];
		if(!this.gamepad){
			console.log(`No ${this.data}-hand controller found`);
		}
	},
	tick: function()
	{
		if(!this.gamepad) return;

		this.el.object3D.position.copy(this.gamepad.position).applyMatrix4(this.parentInverse);
		this.el.object3D.quaternion.copy(this.gamepad.rotation);

		if(!this.gripState && this.gamepad.buttons[1].pressed){
			this.gripState = true;
			this.el.emit('gripdown', this.el, false);
		}
		else if(this.gripState && !this.gamepad.buttons[1].pressed){
			this.gripState = false;
			this.el.emit('gripup', this.el, false);
		}
	}
});