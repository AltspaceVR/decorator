import {loadFile} from './utils';

AFRAME.registerSystem('poly-service', {
	schema: {
		key: {type: 'string'}
	},
	init: function(){
		this.pages = [];
		this.loader = new AFRAME.THREE.FileLoader();
		this.query = `https://poly.googleapis.com/v1/assets/?format=GLTF2&maxComplexity=SIMPLE&pageSize=20&key=${this.data.key}`;
	},
	getListing: async function(page)
	{
		if(page < 0)
			throw new Error(`Requested page (${page}) before beginning`);

		if(this.pages[page]){
			return this.pages[page];
		}
		else if(page === 0)
		{
			// request initial poly listing
			let data = await loadFile(this.query, this.loader);
			let json = JSON.parse(data);
			this.pages.push(json);
			return json;
		}
		else {
			try {
				let prevPage = await this.getOrFetchListing(page-1);
			}
			catch(e){
				throw new Error(`Requested page (${page}) past end`);
			}

			if(prevPage.nextPageToken)
			{
				let data = await loadFile(`${this.query}&pageToken=${prevPage.nextPageToken}`, this.loader);
				let json = JSON.parse(data);
				this.pages.push(json);
				return json;
			}
			else {
				throw new Error(`Requested page (${page}) past end`);
			}
		}
	},
	fakeGetListing: async function(page)
	{
		let data = await loadFile('testdata/listing.json', this.loader);
		return JSON.parse(data);
	}
});