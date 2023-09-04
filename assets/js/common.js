/**
* window の情報を管理する
* モーダルが開いた時とかはここで画面をロックする
* Safari 16 未満は画面ロックを js で行う
* Safari 16 以上は body { overflow: hidden } でいける
-------------------------------------------------- */
export class WindowManagement {
	constructor() {
		this.hasOverscroll = CSS.supports('overscroll-behavior', 'none');
		
		this.html = document.documentElement;
		this.body = document.body;
		this.winH = window.innerHeight;
		this.yOffset = window.pageYOffset;
		
		window.addEventListener('menuopen', () => {
			this.posLock();
		});
		window.addEventListener('menuclose', () => {
			this.posUnlock();
		});
		window.addEventListener('resized', () => {
			this.winH = window.innerHeight;
		});
		LPN.registFnc.loop.push(() => {
			this.yOffset = window.pageYOffset;
		});
	}
	posLock() {
		if (this.hasOverscroll) {
			this.isLock = true;
			this.body.style.overflow = 'hidden';
		}
		else {
			this.isLock = true;
			this.lockOffset = this.yOffset;
			this.html.style.scrollBehavior = 'auto';
			
			this.body.style.position = 'fixed';
			this.body.style.width = '100%';
			this.body.style.marginTop = -this.lockOffset + 'px';
		}
	}
	posUnlock(fn) {
		if (this.hasOverscroll) {
			this.isLock = false;
			this.body.style.overflow = '';
		}
		else {
			this.body.style.position = '';
			this.body.style.width = '';
			this.body.style.marginTop = '';
			
			window.scrollTo(0, this.lockOffset);
			this.html.style.scrollBehavior = '';
			this.isLock = false;
		}
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
