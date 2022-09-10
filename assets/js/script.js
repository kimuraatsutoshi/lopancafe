import { WindowManagement, MainResizeObserver, FetchAjax, AfterLoadedJs, ReturnRelativePath, Resized, Throttle, AddFnc } from './common.js';
import { DrawerMenu, AccordionUi, PulldownUi, AnchorScroll, SyntacConvert, ScrollCarousel, TextCopy } from './ui.js';
import { InviewEffect, LazyImage, SimpleMapping, MagneticButton } from './gimmick.js';
import { FlexTextarea, CheckedAcceptInput } from './form-ui.js';
import { VideoControls, YouTubeIframeApi } from './video.js';
import { TransformScroll } from './transformscroll.js';
import { GoogleMapsApi } from './googlemap.js';
import { FlickitySlider } from './flkty.js';

(function() {
	'use strict';
	
	window.LPN = window.LPN || {};
	const LPN = window.LPN;
	
	LPN.registFnc = { onLoaded: [], onPopstate: [], onResize: [], onMainResize: [], loop: [] };
	
	document.addEventListener('DOMContentLoaded', e => {
		new AddFnc([
			webFontLoader,
			
			commonjs,
			uijs,
			apijs,
			gimmickjs,
			loop
		]);
		
		function commonjs() {
			LPN.Wm = new WindowManagement();
			LPN.Ts = new TransformScroll();
			LPN.As = new AnchorScroll();
			LPN.Dm = new DrawerMenu();
			LPN.Rp = new ReturnRelativePath('component');
			new MainResizeObserver(LPN.registFnc.onMainResize);
		}
		function uijs() {
			new VideoControls();
			new SyntacConvert();
			new AccordionUi();
			new PulldownUi();
			new FlexTextarea();
			new CheckedAcceptInput();
			new ScrollCarousel();
			new TextCopy();
		}
		function apijs() {
			new FlickitySlider();
			new GoogleMapsApi('AIzaSyBtrT0BTN-uUaKugxrwVv3-DowAtnMQ-UU');
			new YouTubeIframeApi();
		}
		function gimmickjs() {
			new SimpleMapping();
			new InviewEffect();
			new LazyImage();
			new MagneticButton();
		}
		const links = document.querySelectorAll('a[href]');
		for (let i = 0, len = links.length; i < len; i++) {
			links[i].tabIndex = 0;
		}
		
		if (location.search) console.log( returnObject(location.search.substring(1)) );
		if (document.querySelector('path') !== null) setPathLen();
	});
	window.addEventListener('popstate', e => {
		if (LPN.registFnc.onPopstate.length) {
			console.log('onPopstate', e);
			new AddFnc(LPN.registFnc.onPopstate);
		}
	});
	window.addEventListener('resize', e => {
		new Resized(() => {
			if (LPN.registFnc.onResize.length) {
				new AddFnc(LPN.registFnc.onResize);
			}
		});
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
			wf.src = 'https://cdnjs.cloudflare.com/ajax/libs/webfont/1.6.28/webfontloader.js';
			wf.async = true;
			s.parentNode.insertBefore(wf, s);
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
		if (LPN.isWindows) doc.classList.add('is-windows');
		if (LPN.isTouch) doc.classList.add('is-touch');
		if (window.innerWidth !== doc.clientWidth) {
			doc.classList.add('hasScrollbar');
			doc.style.setProperty('--scroll-bar-width', window.innerWidth - doc.clientWidth + 'px');
		}
	})();
	// Element.closest() Polyfill
	Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),Element.prototype.closest||(Element.prototype.closest=function(e){var t=this;do{if(Element.prototype.matches.call(t,e))return t;t=t.parentElement||t.parentNode}while(null!==t&&1===t.nodeType);return null});
})();