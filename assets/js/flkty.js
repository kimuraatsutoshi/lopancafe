import { AfterLoadedJs, AfterLoadedCss } from './common.js';

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
			}
			this.loadCss();
		}
	}
	loadAPI() {
		new AfterLoadedJs('https://unpkg.com/flickity@2/dist/flickity.pkgd.min.js').then(
		resolve => {
			document.addEventListener('readystatechange', e => {
				console.log(resolve, e.target.readyState);
				this.init();
			});
		},
		error => {
			console.log(error.message);
		});
	}
	loadCss() {
		new AfterLoadedCss('https://unpkg.com/flickity@2/dist/flickity.min.css').then(
		resolve => {
			// console.log('readystatechange:', resolve);
		},
		error => {
			console.log(error.message);
		});
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
