/**
 * fetchAjax(request, function() {}, 'json');
 * @param {string} File URL
 * @param {function} 読み込み完了後に実行する関数
 * @param {string} Format
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
 * @param {string} js File URL
 -------------------------------------------------- */
export class AfterLoadedJs {
	constructor(src) {
		return new Promise((resolve, reject) => {
			let tag = document.createElement('script');
			tag.src = src;
			document.getElementsByTagName('head')[0].appendChild(tag);
			
			tag.addEventListener('load', () => {
	  			resolve(`Loaded: "${tag.src}"`);
			});
			tag.addEventListener('error', () => {
  				reject( new Error(`Error: "${tag.src}"`) );
			});
		});
	}
}

/**
 * css ファイル読み込み後の処理
 * @param {string} css File URL
 -------------------------------------------------- */
export class AfterLoadedCss {
	constructor(href) {
		return new Promise((resolve, reject) => {
			let tag = document.createElement('link');
			tag.rel = 'stylesheet';
			tag.href = href;
			document.getElementsByTagName('head')[0].appendChild(tag);
			
			tag.addEventListener('load', () => {
	  			resolve(`Loaded: "${tag.href}"`);
			});
			tag.addEventListener('error', () => {
  				reject( new Error(`Error: "${tag.href}"`) );
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
