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
		console.log('attemping grab of page', page);
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
			let prevPage = {};
			try {
				prevPage = await this.getListing(page-1);
			}
			catch(e){
				console.log(e.stack);
				throw new Error(`Requested page (${page}) past end, no previous page`);
			}

			if(prevPage.nextPageToken)
			{
				let data = await loadFile(`${this.query}&pageToken=${prevPage.nextPageToken}`, this.loader);
				let json = JSON.parse(data);
				this.pages.push(json);
				return json;
			}
			else {
				throw new Error(`Requested page (${page}) past end, no page token`);
			}
		}
	},
	fakeGetListing: async function(page)
	{
		let data = await loadFile('testdata/listing.json', this.loader);
		return JSON.parse(data);
	}
});