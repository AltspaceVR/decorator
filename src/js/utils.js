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

export {loadFile, mapProperties, setAttributes, obj2array}