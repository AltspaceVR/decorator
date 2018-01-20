function loadFile(url, loader = new AFRAME.THREE.FileLoader())
{
	return new Promise((resolve, reject) => {
		loader.load(url, resolve, () => {}, reject);
	});
}

function mapProperties(obj, fun)
{
	let newobj = {};
	for(let k in obj){
		newobj[k] = fun(obj[k]);
	}
	return newobj;
}

function setAttributes(el, obj)
{
	for(let k in obj){
		el.setAttribute(k, obj[k]);
	}
}

function obj2array(obj, keys)
{
	return keys.map(k => obj[k]);
}

function set_difference(a, b)
{
	let diff = new Set(a);
	for(let elem of b){
		diff.delete(elem);
	}
	return diff;
}

let pos = new AFRAME.THREE.Vector3(),
	quat = new AFRAME.THREE.Quaternion(),
	scale = new AFRAME.THREE.Vector3();

function setLocalTransform(el, newTransform)
{
	// compute spawn point position
	newTransform.decompose(pos, quat, scale);

	// position at spawn point
	el.setAttribute('position', pos);
	el.setAttribute('quaternion', quat);
	el.setAttribute('scale', scale);
}

function arrayDeepEquals(a, b)
{
	return a && b && a.length === b.length && a.every((x,i) => x === b[i]);
}

function objFromKeys(src, keys)
{
	return keys.reduce((dest, k) => {dest[k] = src[k]; return dest;}, {});
}

export {loadFile, mapProperties, setAttributes, obj2array, set_difference, setLocalTransform, arrayDeepEquals, objFromKeys}