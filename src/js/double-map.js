export default class DoubleMap {
	constructor(){
		this.aToB = new Map();
		this.bToA = new Map();
	}
	set(a, b)
	{
		let oldA = this.bToA.get(b), oldB = this.aToB.get(a);
		if( oldA !== a || oldB !== b){
			this.aToB.delete(oldA);
			this.bToA.delete(oldB);
		}

		this.aToB.set(a, b);
		this.bToA.set(b, a);
	}
	getB(a){ return this.aToB.get(a); }
	getA(b){ return this.bToA.get(b); }
	forEach(fn){ return this.bToA.forEach(fn); }
	deleteA(a){
		if(!this.aToB.get(a)) return;
		this.bToA.delete(this.aToB.get(a));
		this.aToB.delete(a);
	}
	deleteB(b){
		if(!this.bToA.get(b)) return;
		this.aToB.delete(this.bToA.get(b));
		this.bToA.delete(b);
	}
}