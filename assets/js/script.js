import { WindowManagement, MainResizeObserver, FetchAjax, Resized, Throttle, AddFnc } from './common.js';
import { DrawerMenu, AccordionUi, PulldownUi, AnchorScroll, TextCopy } from './ui.js';
import { SimpleMapping, TransformScroll, MagneticButton } from './gimmick.js';

(function() {
	'use strict';
	
	window.LPN = window.LPN || {};
	const LPN = window.LPN;
	
	LPN.registFnc = {
		onLoaded: [], onPopstate: [],
		onResize: [], onMainResize: [],
		onScroll: [], loop: []
	};
	
	document.addEventListener('DOMContentLoaded', e => {
		new AddFnc([
			webFontLoader,
			
			commonjs,
			gimmickjs,
			
			flickitySlider,
			
			flexTextarea,
			checkedAcceptInput,
			
			setInview,
			setLazy,
			setupGoogleMap,
			setupYouTube
		]);
		
		function commonjs() {
			LPN.wm = new WindowManagement();
			LPN.dm = new DrawerMenu();
			LPN.ts = new TransformScroll();
			new MainResizeObserver(LPN.registFnc.onMainResize);
			new AccordionUi();
			new PulldownUi();
			new AnchorScroll();
		}
		function gimmickjs() {
			new SimpleMapping();
			new MagneticButton();
		}
		
		if (location.search) console.log( returnObject(location.search.substring(1)) );
		if (document.querySelector('path') !== null) setPathLen();
		loop();
	});
	window.addEventListener('popstate', e => {
		console.log('onPopstate', e);
	});
	window.addEventListener('resize', e => {
		new Resized(() => {
			console.log('onResize', e);
			if (LPN.registFnc.onResize.length) {
				new AddFnc(LPN.registFnc.onResize);
			}
		});
	});
	window.addEventListener('scroll', e => {
		new Throttle(() => {
			console.log('onScroll', e);
			if (LPN.registFnc.onScroll.length) {
				new AddFnc(LPN.registFnc.onScroll);
			}
		}, 200);
	});
	function loop() {
		if (LPN.registFnc.loop.length) {
			requestAnimationFrame(loop);
			new AddFnc(LPN.registFnc.loop);
		}
	}
	
	/**
	 * Web Font Loader
	 -------------------------------------------------- */
	function webFontLoader() {
		wf.constructor();
	}
	const wf = {
		constructor: function() {
			window.WebFontConfig = {
				custom: {
					families: [ 'Noto+Sans+JP', 'Roboto', 'Ubuntu+Condensed' ],
					urls: [ 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Roboto:wght@400;500;700&family=Ubuntu+Condensed&display=swap' ]
				},
				loading: function() {
					// console.log('webFontLoader loading');
				},
				active: function() {
					// console.log('webFontLoader active');
					sessionStorage.fonts = true;
				}
			};
			this.setup(document);
		},
		setup: function(d) {
			const wf = d.createElement('script'), s = d.scripts[0];
			wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
			wf.async = true;
			s.parentNode.insertBefore(wf, s);
		}
	};
	
	/**
	 * Flickity.js
	 -------------------------------------------------- */
	function flickitySlider() {
		if (document.querySelector('.js-slider') !== null) fs.constructor();
	}
	const fs = {
		constructor: function() {
			this.flkty = {};
			const elm = document.getElementsByClassName('js-slider');
			let count = 0;
			for (let i = 0, len = elm.length; i < len; i++) {
				count++;
				this.setup(elm[i], `slider-${count}`);
			}
		},
		setup: function(elm, id) {
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
	};
	
	/**
	 * Google Maps API
	 * <div class="js-gm" data-map="{lat},{lng},{zoom},{title}"></div>
	 -------------------------------------------------- */
	function setupGoogleMap() {
		if (document.querySelector('.js-gm') !== null) gm.constructor();
	}
	const gm = {
		constructor: function() {
			let count = 0;
			const elms = document.getElementsByClassName('js-gm');
			for (let i = 0, len = elms.length; i < len; i++) {
				count++;
				elms[i].id = 'map-' + count;
				this.setup(elms[i], 'map-' + count);
			}
		},
		setup: function(elm, id) {
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
	};
	
	/**
	 * YouTube API
	 * <div class="js-yt" width="width" height="height" data-ytid="{ytid}"></div>
	 -------------------------------------------------- */
	function setupYouTube() {
		if (document.querySelector('.js-yt') !== null) yt.constructor();
	}
	const yt = {
		constructor: function() {
			this.elmTop = document.getElementsByClassName('js-yt')[0].getBoundingClientRect().top + window.pageYOffset;
			window.addEventListener('scroll', this.onScroll, false);
		},
		onScroll: function() {
			// 最初の js-yt 要素の位置まできたら API 読み込む
			if (window.pageYOffset + window.innerHeight > yt.elmTop) yt.ready();
		},
		ready: function() {
			window.removeEventListener('scroll', yt.onScroll, false);
			delete yt.elmTop;
			yt.player = {};
			yt.playerVars = { controls: 0, modestbranding: 1, enablejsapi: 1, playsinline: 1, rel: 0 };
			yt.loadAPI();
		},
		loadAPI: function() {
			let tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			let firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			window.onYouTubeIframeAPIReady = function() { yt.init(); }
		},
		init: function() {
			const ytElms = document.getElementsByClassName('js-yt');
			let id, ytid, w, h;
			for (let i = 0, len = ytElms.length; i < len; i++) {
				// console.dir(ytElms[i]);
				id = 'player-' + i;
				ytid = ytElms[i].dataset.ytid;
				w = ytElms[i].width ? ytElms[i].width : 560;
				h = ytElms[i].height ? ytElms[i].height : 315;
				ytElms[i].setAttribute('id', id);
				yt.setup(id, ytid, w, h);
				this.setUI(ytElms[i].parentNode.parentNode, id);
			}
		},
		setUI: function(wrap, id) {
			//console.log(wrap);
			const poster = wrap.getElementsByClassName('poster')[0];
			poster.dataset.player = id;
			poster.addEventListener('click', this.onPlay);
		},
		setup: function(id, ytid, w, h) {
			this.player[id] = new YT.Player(id, {
				width: w, height: h, videoId: ytid,
				playerVars: this.playerVars,
				events: {
					'onReady': yt.onPlayerReady,
					'onStateChange': yt.onPlayerStateChange
				}
			});
		},
		onPlay: function() {
			if (yt.player === undefined) return;
			// console.log('onPlay');
			const player = yt.player[this.dataset.player];
			if (player.getPlayerState() !== 1) {
				player.playVideo();
			} else {
				player.pauseVideo();
			}
		},
		onPlayerReady: function(e) {
			// console.log('onPlayerReady', e);
		},
		onPlayerStateChange: function(e) {
			// console.log('onPlayerStateChange', e);
			if (e.data === 1 || e.data === -1) {
				e.target.getIframe().parentNode.parentNode.classList.add('is-playing');
			} else {
				e.target.getIframe().parentNode.parentNode.classList.remove('is-playing');
			}
		}
	};
	
	/**
	 * flex textarea
	 -------------------------------------------------- */
	const flexTextarea = () => {
		const elm = document.querySelectorAll('.js-flextextarea');
		let dummy, textarea;
		elm.forEach(el => {
			dummy = el.querySelector('.dummy');
			textarea = el.querySelector('textarea');
			textarea.addEventListener('input', e => {
				dummy.textContent = e.target.value + '\u200b';
			});
		});
	}
	
	/**
	 * チェックすることで入力を受け入れる UI
	 * 1. トリガーとなるラジオボタンかチェックボックスに js-acceptInput 付与
	 * 2. 入力可否を切り替える対象のフォーム素材の type を data-type に明示
	 * <input type="checkbox" class="js-acceptInput" data-type="submit">
	 -------------------------------------------------- */
	function checkedAcceptInput() {
		if (document.querySelector('.js-acceptInput') !== null) cai.constructor();
	}
	const cai = {
		constructor: function() {
			this.acceptData = {};
			const elm = document.getElementsByClassName('js-acceptInput');
			
			let trigger, id;
			for (let i = 0, len = elm.length; i < len; i++) {
				// ラジオボタンの場合は、同じ name のラジオボタンすべてがリスナー
				trigger = elm[i].type !== 'radio' ? elm[i] : elm[i].form.querySelectorAll(`input[type="radio"][name="${elm[i].name}"]`);
				id = `accept-${i + 1}`;
				this.setup(elm[i], id, trigger);
			}
			
			setTimeout(() => {
				for (let id in this.acceptData) {
					!this.acceptData[id].checkbox.checked ? this.unAccept(id) : this.onAccept(id);
				}
			}, 60);
			console.log(this.acceptData);
		},
		setup: function(elm, id, trigger) {
			let target = null;
			if (elm.dataset.type === 'submit') {
				target = elm.form.querySelector('input[type="submit"], button[type="submit"]');
			} else {
				target = elm.parentNode.querySelector(`input[type="${elm.dataset.type}"]`);
			}
			this.acceptData[id] = {
				checkType: elm.type,
				targetType: target.type,
				checkbox: elm,
				target: target,
				isAccepted: elm.checked
			};
			if (elm.type === 'radio') {
				for (let i = 0, len = trigger.length; i < len; i++) {
					this.addListener(trigger[i], id);
				}
			} else {
				this.addListener(trigger, id);
			}
		},
		addListener: function(elm, id) {
			elm.addEventListener('change', () => {
				// 
				!this.acceptData[id].isAccepted && this.acceptData[id].checkbox.checked ? this.onAccept(id) : this.unAccept(id);
			});
		},
		onAccept: function(id) {
			this.acceptData[id].isAccepted = true;
			this.acceptData[id].target.disabled = false;
		},
		unAccept: function(id) {
			this.acceptData[id].isAccepted = false;
			this.acceptData[id].target.disabled = true;
			
			// 入力値があれば空にする
			if (this.acceptData[id].targetType !== 'submit' && this.acceptData[id].target.value !== '') {
				this.acceptData[id].target.value = '';
			}
		}
	};
	
	/**
	 * in-view
	 * <ul class="js-inview" data-last=":last-child"></ul>
	 * <ul class="js-inview" data-anim="animationName"></ul>
	 * -------------------------------------------------- */
	function setInview(elm) {
		const container = !elm ? document : elm;
		if (container.querySelector('.js-inview') !== null) iv.constructor(container);
	}
	const iv = {
		constructor: function(container) {
			const elms = container.getElementsByClassName('js-inview');
			if (self.IntersectionObserver !== undefined) {
				this.inview(elms);
			} else {
				for (let i = 0; i < elms.length; i++) {
					elms[i].classList.add('is-inview');
					elms[i].classList.remove('js-inview');
				}
			}
		},
		inview: function(elms) {
			this.intersectionObserver = new IntersectionObserver(entries => {
				for (let i = 0; i < entries.length; i++) {
					if (entries[i].intersectionRatio <= 0) continue;
					this.doInview(entries[i].target);
				}
			}, {
				root: null,
				rootMargin: '0px',
				threshold: [0.3, 0.7]
			});
			for (let i = 0; i < elms.length; i++) {
				this.intersectionObserver.observe(elms[i]);
			}
		},
		doInview: function(el) {
			if (!el.isInview) {
				el.isInview = 1;
				if (el.dataset.anim !== undefined) {
					el.addEventListener('animationend', iv.animationEnd);
				} else if (el.dataset.last !== undefined) {
					el.addEventListener('transitionend', iv.lastElmEnd);
				} else {
					el.addEventListener('transitionend', iv.transitionendEnd);
				}
				el.classList.add('is-anim');
				el.classList.add('is-inview');
			}
		},
		animationEnd: function(e) {
			if (e.animationName === this.dataset.anim) {
				this.classList.remove('is-anim', 'js-inview');
				this.removeAttribute('data-anim');
				this.removeEventListener('animationend', iv.animationEnd);
			}
		},
		lastElmEnd: function(e) {
			if (e.target === this.querySelector(this.dataset.last)) {
				this.classList.remove('is-anim', 'js-inview');
				this.removeAttribute('data-last');
				this.removeEventListener('transitionend', iv.lastElmEnd);
			}
		},
		transitionendEnd: function(e) {
			if (e.target === this) {
				this.classList.remove('is-anim', 'js-inview');
				this.removeEventListener('transitionend', iv.transitionendEnd);
			}
		}
	};
	
	/**
	 * lazy image
	 * <img data-src="path.jpg" alt="" width="w" height="h">
	 * -------------------------------------------------- */
	function setLazy(elm) {
		const container = !elm ? document : elm;
		if (container.querySelector('[data-src]') !== null) lz.constructor(container);
	}
	const lz = {
		constructor: function(container) {
			const imgs = container.querySelectorAll('img[data-src]');
			if (self.IntersectionObserver !== undefined) {
				for (let i = 0, len = imgs.length; i < len; i++) {
					imgs[i].src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 ' + imgs[i].width + ' ' + imgs[i].height + '%22%3E%3C/svg%3E';
				}
				this.lazy(imgs);
			} else {
				for (let i = 0, len = imgs.length; i < len; i++) {
					imgs[i].src = imgs[i].dataset.src;
				}
			}
		},
		lazy: function(imgs) {
			this.intersectionObserver = new IntersectionObserver(function(entries) {
				for (let i = 0; i < entries.length; i++) {
					if (entries[i].intersectionRatio <= 0) continue;
					lz.doLazy(entries[i].target);
				}
			}, {
				root: null,
				rootMargin: '0px',
				threshold: [0, 0.5]
			});
			for (let i = 0; i < imgs.length; i++) {
				this.intersectionObserver.observe(imgs[i]);
			}
		},
		doLazy: function(el) {
			imagesLoaded(el, lz.loaded);
			el.src = el.dataset.src;
			lz.intersectionObserver.unobserve(el);
		},
		loaded: function() {
			this.elements[0].classList.add('is-anim', 'is-loaded');
			this.elements[0].addEventListener('transitionend', lz.loadedEnd);
		},
		loadedEnd: function() {
			this.classList.remove('is-anim');
			this.removeAttribute('data-src');
			this.removeEventListener('transitionend', lz.loadedEnd);
		}
	};
	
	/**
	 * utility
	 * -------------------------------------------------- */
	function returnObject(param) {
		// MEMO: URL パラメーターを json オブジェクトにして返す
		const arg = new Object;
		const arr = param.split('&');
		for (let i in arr) {
			var keyval = arr[i].split('=');
			arg[keyval[0]] = keyval[1];
		}
		return arg;
	}
	function setPathLen() {
		// MEMO: path の長さを取得して stroke-dasharray と stroke-dashoffset のスタイルを生成する
		const path = document.querySelectorAll('path[class]');
		// console.log(path);
		let d = [];
		path.forEach(function(e) {
			const len = e.getTotalLength() * 10;
			d.push({ c: e.classList[0], l: Math.round(len) / 10 + 1 });
		});
		let style = '';
		for (let i in d) {
			style += `.${d[i].c}{stroke-dasharray:${d[i].l}px ${d[i].l}px;`;
			style += `stroke-dashoffset:-${d[i].l}px}` + "\n";
		}
		// console.log(style);
	}
	
	/**
	 * common
	 * -------------------------------------------------- */
	(function common() {
		const doc = document.documentElement, ua = navigator.userAgent.toLowerCase();
		LPN.isIE = ( ua.indexOf('msie') != -1 || ua.indexOf('trident') != -1 );
		LPN.isWindows = ua.indexOf('windows nt') !== -1;
		LPN.isTouch = !!( 'ontouchstart' in window || (navigator.pointerEnabled && navigator.maxTouchPoints > 0) );
		if (LPN.isIE) doc.classList.add('isIE');
		if (LPN.isWindows) doc.classList.add('isWindows');
		if (LPN.isTouch) doc.classList.add('isTouch');
		if (window.innerWidth !== doc.clientWidth) {
			doc.classList.add('hasScrollbar');
			doc.style.setProperty('--scroll-bar-width', window.innerWidth - doc.clientWidth + 'px');
		}
	})();
	// Element.closest() Polyfill
	Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),Element.prototype.closest||(Element.prototype.closest=function(e){var t=this;do{if(Element.prototype.matches.call(t,e))return t;t=t.parentElement||t.parentNode}while(null!==t&&1===t.nodeType);return null});
})();