/**
 * Flickity.js
 * https://unpkg.com/flickity@2/dist/flickity.pkgd.min.js
 -------------------------------------------------- */
export class FlickitySlider {
	constructor() {
		if (document.querySelector('.js-slider') !== null) {
			if (typeof Flickity !== 'undefined') {
				this.init();
				
			} else {
				this.loadAPI();
				document.addEventListener('readystatechange', e => {
					console.log('readystatechange:', e.target.readyState);
					this.init();
				});
			}
		}
	}
	loadAPI() {
		let tag = document.createElement('script');
		tag.src = 'https://unpkg.com/flickity@2/dist/flickity.pkgd.min.js';
		let firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}
	init() {
		this.flkty = {};
		const elm = document.getElementsByClassName('js-slider');
		let count = 0;
		for (let i = 0, len = elm.length; i < len; i++) {
			count++;
			this.setup(elm[i], `slider-${count}`);
		}
	}
	setup(elm, id) {
		const opt = {
			lock: elm.dataset.lock === undefined,
			loop: elm.dataset.loop !== undefined,
			auto: elm.dataset.auto ? parseInt(elm.dataset.auto) : false, // {number}
			cell: elm.dataset.cell ? elm.dataset.cell : false, // {strings}
			arrow: elm.dataset.arrow !== undefined,
			dots: elm.dataset.dots !== undefined
		};
		let arg = {
			contain: true,
			groupCells: true,
			draggable: opt.lock,
			wrapAround: opt.loop,
			autoPlay: opt.auto,
			cellSelector: opt.cell,
			prevNextButtons: opt.arrow,
			pageDots: opt.dots,
			arrowShape: 'M65,90L25,50,65,10'
		};
		if (opt.auto) {
			arg.on = {
				change: function() {
					this.stopPlayer();
				},
				settle: function() {
					this.playPlayer();
				}
			}
		}
		this.flkty[id] = new Flickity(elm, arg);
	}
}

/**
 * Google Maps API
 * <div class="js-gm" data-map="{lat},{lng},{zoom},{title}"></div>
 -------------------------------------------------- */
export class GoogleMapsApi {
	constructor(APIkey) {
		if (APIkey === undefined) {
			console.log('※API キーがありません。');
			
		} else if (document.querySelector('.js-gm') !== null) {
			this.APIkey = APIkey;
			this.loadAPI();
			document.addEventListener('readystatechange', e => {
				this.init();
			});
		}
	}
	loadAPI() {
		let tag = document.createElement('script');
		tag.src = `https://maps.googleapis.com/maps/api/js?key=${this.APIkey}`;
		let firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
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
		
		const map = new google.maps.Map(document.getElementById(id), {
			name: 'lopan',
			center: latlng,
			zoom: parseFloat(data[2]),
			disableDefaultUI: true,
			zoomControl: true
		});
		const marker = new google.maps.Marker({
			position: latlng,
			title: data[3],
			icon: {
				url: './assets/img/marker.svg',
				scaledSize: new google.maps.Size(60,70)
			},
			map: map,
		});
		marker.addListener('click', e => {
			map.panTo(latlng);
		});
		const styles  = [{
			"elementType": "geometry",
			"stylers": [{
				"saturation": -100
			}]
		},{
			"elementType": "labels",
			"stylers": [{
				"saturation": -100
			}]
		}];
		const silverType = new google.maps.StyledMapType(styles, { name: 'SilverMap' });
		map.mapTypes.set('silver', silverType);
		map.setMapTypeId('silver');
	}
}

/**
 * YouTube API
 * <div class="js-yt" width="width" height="height" data-ytid="{ytid}"></div>
 -------------------------------------------------- */
export class YouTubeIframeApi {
	constructor() {
		if (document.querySelector('.js-yt') !== null) {
			document.addEventListener('readystatechange', e => {
				const elm = document.getElementsByClassName('js-yt')[0];
				this.elmTop = elm.getBoundingClientRect().top - LPN.Wm.winH;
			});
			window.addEventListener('scroll', () => {
				this.onScroll();
			}, { once: true });
		}
	}
	onScroll() {
		// 最初の js-yt 要素の位置まできたら API 読み込む
		if (LPN.Wm.yOffset + LPN.Wm.winH > this.elmTop) {
			this.ready();
		} else {
			window.addEventListener('scroll', () => {
				this.onScroll();
			}, { once: true });
		}
	}
	ready() {
		// console.log('YouTubeIframeApi.ready');
		delete this.elmTop;
		this.loadAPI();
		window.onYouTubeIframeAPIReady = () => {
			this.init();
		}
	}
	loadAPI() {
		let tag = document.createElement('script');
		tag.src = 'https://www.youtube.com/iframe_api';
		let firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}
	init() {
		this.player = {};
		this.playerVars = { controls: 0, modestbranding: 1, enablejsapi: 1, playsinline: 1, rel: 0 };
		
		const ytElms = document.getElementsByClassName('js-yt');
		let id, ytid, w, h;
		for (let i = 0, len = ytElms.length; i < len; i++) {
			// console.dir(ytElms[i]);
			id = 'player-' + i;
			ytid = ytElms[i].dataset.ytid;
			w = ytElms[i].width ? ytElms[i].width : 560;
			h = ytElms[i].height ? ytElms[i].height : 315;
			ytElms[i].setAttribute('id', id);
			
			this.setUI(ytElms[i].parentNode.parentNode, id);
			this.setup(id, ytid, w, h);
		}
	}
	setUI(wrap, id) {
		//console.log(wrap);
		const poster = wrap.getElementsByClassName('poster')[0];
		poster.dataset.player = id;
		poster.addEventListener('click', e => {
			this.onPlay(e);
		});
	}
	setup(id, ytid, w, h) {
		this.player[id] = new YT.Player(id, {
			width: w, height: h, videoId: ytid, playerVars: this.playerVars,
			events: {
				'onReady': e => {
					this.onPlayerReady(e);
				},
				'onStateChange': e => {
					this.onPlayerStateChange(e);
				}
			}
		});
	}
	onPlay(e) {
		// console.log('onPlay', e);
		if (this.player === undefined) return;
		const player = this.player[e.target.dataset.player];
		if (player.getPlayerState() !== 1) {
			player.playVideo();
		} else {
			player.pauseVideo();
		}
	}
	onPlayerReady(e) {
		// console.log('onPlayerReady', e);
	}
	onPlayerStateChange(e) {
		// console.log('onPlayerStateChange', e);
		if (e.data === 1 || e.data === -1) {
			e.target.getIframe().parentNode.parentNode.classList.add('is-playing');
		} else {
			e.target.getIframe().parentNode.parentNode.classList.remove('is-playing');
		}
	}
}
