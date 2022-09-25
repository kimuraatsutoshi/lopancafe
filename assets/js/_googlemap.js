import { AfterLoadedJs } from './_utility.js';

/**
 * Google Maps API
 * @param {string} APIkey
 * <div class="js-gm" data-map="{lat},{lng},{zoom},{title}"></div>
 -------------------------------------------------- */
export class GoogleMapsApi {
	constructor(APIkey) {
		if (APIkey === undefined) {
			console.log('※API キーがありません。');
			
		} else {
			this.APIkey = APIkey;
			this.loadAPI();
		}
	}
	loadAPI() {
		new AfterLoadedJs(`https://maps.googleapis.com/maps/api/js?key=${this.APIkey}`).then(
		resolve => {
			document.addEventListener('readystatechange', e => {
				// console.log(resolve, e.target.readyState);
				this.init();
			});
		},
		error => {
			console.log(error.message);
		});
	}
	init() {
		let count = 0;
		const elms = document.getElementsByClassName('js-gm');
		for (let i = 0, len = elms.length; i < len; i++) {
			count++;
			elms[i].id = 'map-' + count;
			this.setup(elms[i], 'map-' + count);
		}
	}
	setup(elm, id) {
		const data = elm.dataset.gm.split(',');
		const latlng = { lat: parseFloat(data[0]), lng: parseFloat(data[1]) };
		const option = {
			name: 'lopan',
			center: latlng,
			zoom: parseFloat(data[2]),
			disableDefaultUI: true
		};
		if (elm.dataset.simple === undefined) {
			option.zoomControl = true;
		}
		const map = new google.maps.Map(document.getElementById(id), option);
		if (elm.dataset.marker !== undefined) {
			const relativePath = LPN.Rp.returnRootPath();
			const marker = new google.maps.Marker({
				position: latlng,
				title: data[3],
				icon: {
					url: `${relativePath}assets/img/marker.svg`,
					scaledSize: new google.maps.Size(60,70)
				},
				map: map
			});
			marker.addListener('click', e => {
				map.panTo(latlng);
			});
		}
		if (elm.dataset.mono !== undefined) {
			const styles = [{
				"stylers": [{
					"saturation": -100
				}]
			}];
			const monoType = new google.maps.StyledMapType(styles, { name: 'MonoMap' });
			map.mapTypes.set('mono', monoType);
			map.setMapTypeId('mono');
		}
		if (elm.dataset.simple !== undefined) {
			const styles  = [{
				"elementType": "geometry",
				"stylers": [{
					"saturation": -50
				}, {
					"visibility": "simplified"
				}]
			},{
				"elementType": "labels",
				"stylers": [{
					"visibility": "off"
				}]
			}];
			const simpleType = new google.maps.StyledMapType(styles, { name: 'SimpleMap' });
			map.mapTypes.set('simple', simpleType);
			map.setMapTypeId('simple');
		}
	}
}
