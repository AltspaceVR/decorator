function loadFile(url, loader = new AFRAME.THREE.FileLoader())
{
	return new Promise((resolve, reject) => {
		loader.load(url, resolve, () => {}, reject);
	});
}

export {loadFile}