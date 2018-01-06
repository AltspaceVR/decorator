export default class AmmoPool
{
	constructor(){
		this._pools = {};
		this._refs = new Map();
	}

	get(type){
		this._pools[type] = this._pools[type] || [];
		let ret = this._pools[type].shift() || new Ammo[type]();
		this._refs.set(ret, type);
		return ret;
	}

	getSome(type, count){
		let acc = [];
		for(let i=0; i<count; i++)
			acc.push(this.get(type));
		return acc;
	}

	done(...vals){
		vals.forEach(val => {
			let type = this._refs.get(val);
			this._pools[type] = this._pools[type] || [];
			this._pools[type].push(val);
		});
	}
}