import {setAttributes, mapProperties, obj2array} from './utils';

const scaleFactor = 1.2;

AFRAME.registerComponent('hover-scale', {
	init: function()
	{
		// create animation
		this.el.setAttribute('animation__hover', {
			startEvents: ['hoverstart', 'mouseleave'],
			property: 'scale',
			dir: 'alternate',
			easing: 'easeOutQuad',
			dur: 200
		});

		// update scale
		this.el.addEventListener('mouseenter', () =>
		{
			let smallScale = obj2array(this.el.getAttribute('scale'), ['x','y','z']);
			let bigScale = smallScale.map(x => x*scaleFactor);
			this.el.setAttribute('animation__hover', {from: smallScale.join(' '), to: bigScale.join(' ')});

			this.el.emit('hoverstart');
		});
	}
});