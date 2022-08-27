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
 * fetchAjax(request, function() {}, 'json');
 * -------------------------------------------------- */
export class FetchAjax {
	constructor(req, fn, format) {
		fetch(req)
		.then(response => {
			this.handleErrors(response, fn, format);
		})
		.catch(error => {
			//console.log('error');
			this.onReject(error);
		});
	}
	handleErrors(response, fn, format) {
		if (!response.ok) {
			// 4xx/5xx error
			console.log(`${response.status} error`);
			throw Error(response.statusText);
		}
		this.processData(response, fn, format);
	}
	processData(response, fn, format) {
		//console.log('---> success');
		return response[format]()
		.then(data => {
			//console.log('resolve');
			this.onResolve(data, fn);
		})
		.catch(error => {
			//console.log('reject');
			this.onReject(error);
		});
	}
	onResolve(data, fn) {
		fn(data);
	}
	onReject(error) {
		if (error.message !== '') console.log(error.message);
	}
}

/**
 * js ファイル読み込み後の処理
 -------------------------------------------------- */
export class AfterLoadedJs {
	constructor(src, tag = 'head') {
		return new Promise((resolve,reject) => {
			let tag = document.createElement('script');
			tag.src = src;
			document.getElementsByTagName(tag)[0].appendChild(tag);
			
			tag.addEventListener('load', () => {
	  			resolve(`Loaded: "${tag.src}"`);
			});
			tag.addEventListener('error', () => {
  				reject(
				  	new Error(`Error: "${tag.src}"`)
			  	);
			});
		});
	}
}

/**
 * イベントの間引き
 -------------------------------------------------- */
export class Resized {
	constructor(fn) {
		if (LPN.timer !== false) clearTimeout(LPN.timer);
		LPN.timer = setTimeout(fn, 200);
	}
}
export class Throttle {
	constructor(fn, interval) {
		let lastTime = Date.now() - interval;
		return () => {
			if ((lastTime + interval) < Date.now()) {
				lastTime = Date.now();
				fn();
			}
		}
	}
}

/**
 * 関数一遍実行
 -------------------------------------------------- */
export class AddFnc {
	constructor(fns) {
		for (let i = 0, len = fns.length; i < len; i++) { fns[i](); }
	}
}
