import { AfterLoadedJs, AfterLoadedCss, AddFnc } from './utility.js';

/**
 * window の情報を管理する
 * モーダルが開いた時とかはここで画面をロックする
 -------------------------------------------------- */
export class WindowManagement {
	constructor() {
		this.html = document.documentElement;
		this.body = document.body;
		this.isSmoothBehavior = getComputedStyle(this.html).scrollBehavior === 'smooth';
		this.yOffset = window.pageYOffset;
		this.onResize();
		LPN.registFnc.onResize.push(() => {
			this.onResize();
		});
		LPN.registFnc.loop.push(() => {
			this.onScroll();
		});
	}
	onResize() {
		this.winH = window.innerHeight;
	}
	onScroll() {
		this.yOffset = window.pageYOffset;
	}
	posLock() {
		this.isLock = true;
		if (LPN.Ts !== undefined) {
			LPN.Ts.isLock = this.isLock;
		}
		this.lockOffset = this.yOffset;
		
		if (this.isSmoothBehavior) {
			this.html.style.scrollBehavior = 'auto';
		}
		this.body.classList.add('is-fixed');
		this.body.style.marginTop = -this.lockOffset + 'px';
	}
	posUnlock(fn) {
		this.body.classList.remove('is-fixed');
		this.body.removeAttribute('style');
		window.scrollTo(0, this.lockOffset);
		setTimeout(() => {
			this.isLock = false;
			if (LPN.Ts !== undefined) {
				LPN.Ts.isLock = this.isLock;
			}
			if (this.isSmoothBehavior) {
				this.html.removeAttribute('style');
			}
			// fn があったら実行
			if (fn) fn();
		}, 60);
	}
}

/**
 * l-main のリサイズを監視する
 * @param {array} リサイズ後に実行する関数配列
 -------------------------------------------------- */
export class MainResizeObserver {
	constructor(fns) {
		const target = document.getElementsByClassName('l-main')[0];
		this.fns = fns;
		this.mainHeight = target.clientHeight;
		this.setup();
		this.resizeObserver.observe(target);
	}
	setup() {
		this.resizeObserver = new ResizeObserver(entries => {
			const rect = entries[0].contentRect;
			if (this.mainHeight !== rect.height) {
				if (this.fns.length) {
					this.resized(() => {
						new AddFnc(this.fns);
					});
				}
				this.mainHeight = rect.height;
			}
		});
	}
	resized(fn) {
		if (this.timer !== false) clearTimeout(this.timer);
		this.timer = setTimeout(fn, 200);
	}
}

/**
 * Web Fonts Loader
 -------------------------------------------------- */
export class WebFontsLoader {
	constructor(param) {
		window.WebFontConfig = {
			custom: param,
			loading: function() {
				// console.log('webFontLoader loading');
			},
			active: function() {
				// console.log('webFontLoader active');
				sessionStorage.fonts = true;
			}
		};
		this.setup(document);
	}
	setup(d) {
		const wf = d.createElement('script'), s = d.scripts[0];
		wf.src = 'https://cdnjs.cloudflare.com/ajax/libs/webfont/1.6.28/webfontloader.js';
		wf.async = true;
		s.parentNode.insertBefore(wf, s);
	}
}

/**
 * 現在のディレクトリからルートへの相対パスを返す
 * @param {string} HOME directory
 -------------------------------------------------- */
export class ReturnRelativePath {
	constructor(root) {
		const dirArray = location.href.split('/');
		if (root !== '/') {
			this.pathLength = dirArray.length - 1 - dirArray.indexOf(root) - 1;
		} else {
			this.pathLength = 0;
		}
	}
	returnRootPath() {
		let path = './';
		if (this.pathLength) {
			path = '';
			for (let i = this.pathLength; i--;) {
				path += '../';
			}
		}
		return path;
	}
}

/**
 * シンタックスハイライト
 -------------------------------------------------- */
export class SyntacConvert {
	constructor() {
		if (document.querySelector('.c-syntax') !== null) {
			this.insertTags();
			this.loadJs();
			this.loadCss();
		}
	}
	insertTags() {
		const elms = document.getElementsByClassName('c-syntax');
		let lang, style, caption;
		for (let i = 0, len = elms.length; i < len; i++) {
			lang = elms[i].dataset.lang;
			style = '';
			if (elms[i].dataset.style) {
				style = ` style="${elms[i].dataset.style}"`;
			}
			caption = '';
			if (elms[i].dataset.caption) {
				caption = `<figcaption>${elms[i].dataset.caption}</figcaption>`;
			}
			let html = `<div class="wrap"${style} tabindex="0">`;
			html += `<pre class="line-numbers" tabindex="-1">`;
			html += `<code class="language-${lang}">${elms[i].innerHTML}`;
			html += `</code></pre></div>${caption}`;
			elms[i].innerHTML = html;
		}
	}
	loadJs() {
		new AfterLoadedJs('/component/assets/js/prism.js').then(
		resolve => {
			document.addEventListener('readystatechange', e => {
				console.log(resolve, e.target.readyState);
			});
		},
		error => {
			console.log(error.message);
		});
	}
	loadCss() {
		new AfterLoadedCss('/component/assets/css/prism.css').then(
		resolve => {
			document.addEventListener('readystatechange', e => {
				console.log(resolve, e.target.readyState);
			});
		},
		error => {
			console.log(error.message);
		});
	}
}
