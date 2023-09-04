import { ReturnRelativePath, WindowManagement, MainResizeObserver, WebFontsLoader } from './common.js';
import { FlexTextarea, CheckedAcceptInput } from './form-ui.js';
import { InviewEffect, LazyImage } from './effect.js';
import { SyntacConvert } from './syntax.js';
import { UiBundle } from './ui.js';

const registerServiceWorker = async () => {
	if ('serviceWorker' in navigator) {
		try {
			const registration = await navigator.serviceWorker.register(
				'/sw.js',
				{
					scope: '/',
				}
			);
			if (registration.installing) {
				console.log('Service worker installing');
			}
			else if (registration.waiting) {
				console.log('Service worker installed');
			}
			else if (registration.active) {
				console.log('Service worker active');
			}
		} catch (error) {
			console.error(`Registration failed with ${error}`);
		}
	}
};

// registerServiceWorker();

(function() {
	'use strict';
	
	window.LPN = window.LPN || {};
	const LPN = window.LPN;
	LPN.registFnc = { loop: [] };
	
	// HTML 要素に関係なく実行する
	LPN.Rp = new ReturnRelativePath('lopan.cafe');
	LPN.Wf = new WebFontsLoader({
		families: [ 'Noto+Sans+JP', 'Roboto', 'Ubuntu+Condensed' ],
		urls: [ 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Roboto:wght@400;500;700&family=Ubuntu+Condensed&display=swap' ]
	});
	LPN.Wm = new WindowManagement();
	common();
	
	// フォントの読み込み完了を待つ
	document.fonts.addEventListener('loadingdone', e => {
		// console.log('fonts.loadingdone', e);
	});
	
	// HTML 文書の読み込み完了を待つ
	document.addEventListener('DOMContentLoaded', e => {
		new MainResizeObserver();
		insertNavMenu();
		
		// UI 一括 (アンカースクロール, ドロワーメニュー, アコーディオン, プルダウン, テキストコピー, シェアする, Flickity, カルーセル, 動画, YouTube, GoogleMap)
		new UiBundle();
		
		// form
		if (document.querySelector('.c-form') !== null) {
			if (document.querySelector('.js-acceptInput') !== null) {
				new CheckedAcceptInput();
			}
			if (document.querySelector('.js-flextextarea') !== null) {
				new FlexTextarea();
			}
		}
		
		// シンタックスハイライト
		if (document.querySelector('.c-syntax') !== null) {
			new SyntacConvert();
		}
		
		// エフェクト
		if (document.querySelector('.js-inview') !== null) {
			new InviewEffect(document);
		}
		if (document.querySelector('[data-src]') !== null) {
			new LazyImage(document);
		}
		
		// const links = document.querySelectorAll('a[href]');
		// for (let i = 0, len = links.length; i < len; i++) {
		// 	links[i].tabIndex = 0;
		// }
		
		loop();
		
		if (location.search) console.log( returnObject(location.search.substring(1)) );
		if (document.querySelector('path') !== null) setPathLen();
	});
	window.addEventListener('popstate', e => {
		console.log('onPopstate', e);
	});
	window.addEventListener('resize', e => {
		if (LPN.timer !== false) clearTimeout(LPN.timer);
		LPN.timer = setTimeout(() => {
			const event = new Event('resized');
			window.dispatchEvent(event);
		}, 200);
	});
	function loop() {
		if (LPN.registFnc.loop.length) {
			new AddFnc(LPN.registFnc.loop);
			requestAnimationFrame(loop);
		}
	}
	
	/**
	 * insertNavMenu
	 * すぐ表示されるわけじゃないから js で作ることにする
	 * -------------------------------------------------- */
	function insertNavMenu() {
		const nav = document.getElementsByClassName('l-menu')[0];
		const menu = document.querySelectorAll('.l-header .menu');
		let html = '';
		html += '<div class="overlay js-menuToggle"></div>';
		html += '<div class="container">';
		html += '<h2 class="u-visuallyhidden">ナビゲーション</h2>';
		for (let item of menu) {
			html += item.outerHTML;
		}
		html += '<a href="#top" class="pagetop">';
		html += '<svg width="24" height="24" viewBox="0 0 24 24" preserveAspectRatio="none" class="ico">';
		html += '<path d="M2,18L12,6l10,12" vector-effect="non-scaling-stroke"/></svg></a>';
		html += '</div>';
		nav.innerHTML = html;
	}
	
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
	function AddFnc(fns) {
		for (let i = 0, len = fns.length; i < len; i++) {
			fns[i]();
		}
	}
	
	/**
	 * common
	 * -------------------------------------------------- */
	function common() {
		const doc = document.documentElement, ua = navigator.userAgent.toLowerCase();
		LPN.isIE = ( ua.indexOf('msie') != -1 || ua.indexOf('trident') != -1 );
		LPN.isWindows = ua.indexOf('windows nt') !== -1;
		LPN.isTouch = !!( 'ontouchstart' in window || (navigator.pointerEnabled && navigator.maxTouchPoints > 0) );
		if (LPN.isIE) doc.classList.add('is-ie');
		if (LPN.isWindows) doc.classList.add('is-windows');
		if (LPN.isTouch) doc.classList.add('is-touch');
		if (window.innerWidth !== doc.clientWidth) {
			doc.classList.add('has-scrollbar');
			doc.style.setProperty('--scrollBarWidth', window.innerWidth - doc.clientWidth + 'px');
		}
	}
})();