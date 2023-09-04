/**
 * window の情報を管理する
 * モーダルが開いた時とかはここで画面をロックする
 -------------------------------------------------- */
export class WindowManagement {
	constructor() {
		
		if (CSS.supports('overscroll-behavior', 'none')) {
			// Safari 16 未満は画面ロックを js で行う
			
		}
		else {
			// Safari 16 以上は body { overflow: hidden } でいける
			
		}
		
		this.html = document.documentElement;
		this.body = document.body;
		this.isSmoothBehavior = getComputedStyle(this.html).scrollBehavior === 'smooth';
		this.yOffset = window.pageYOffset;
		
		this.onResize();
		window.addEventListener('resized', () => {
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
	constructor() {
		const target = document.getElementsByClassName('l-main')[0];
		this.mainHeight = target.clientHeight;
		this.setup();
		this.resizeObserver.observe(target);
	}
	setup() {
		this.resizeObserver = new ResizeObserver((entries) => {
			const rect = entries[0].contentRect;
			if (this.mainHeight !== rect.height) {
				this.resize();
				this.mainHeight = rect.height;
			}
		});
	}
	resize() {
		if (this.timer !== false) clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			const event = new Event('mainresized');
			window.dispatchEvent(event);
		}, 200);
	}
}

/**
 * Web Fonts Loader
 * @param {object}
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
		wf.src = `${LPN.Rp.returnRootPath()}assets/js/lib/webfontloader.js`;
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
