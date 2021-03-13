(function(global) {
	'use strict';
	let isIE, isTouch, isDesktop, isWindows;
	common();
	
	document.addEventListener('DOMContentLoaded', onLoaded, false);
	window.addEventListener('popstate', onPopstate, false);
	window.addEventListener('resize', onResize, false);
	window.addEventListener('scroll', onScroll, false);
	
	function onLoaded() {
		addFnc([
			webFontLoader,
			breakPointLintener,
			promiseMethod,
			transformScroll,
			setInview,
			drawerMenu,
			anchorScroll,
			setupYouTube
		]);
		if (document.querySelector('path') !== null) setPathLen();
		loop();
	}
	function onPopstate(e) {
		console.log('onPopstate');
	}
	function onResize() {
		resized(function() {
			if (as.duration !== undefined) as.onResize();
		});
	}
	function onScroll() {
		throttle(function() {
			console.log(window.pageYOffset);
		});
	}
	function loop() {
		requestAnimationFrame(loop);
		if (ts.wrapper !== undefined) {
			ts.onScroll();
			ts.insistentRefresh();
		}
	}
	
	/* MEMO: stroke-dasharray と stroke-dashoffset のスタイルを生成する */
	function setPathLen() {
		const parentClass = '.pathgroup';
		const path = document.querySelectorAll(parentClass + ' path[class]');
		let d = [];
		path.forEach(function(e) {
			const len = e.getTotalLength() * 10;
			d.push({ c: e.classList[1], l: Math.round(len) / 10 + 1 });
		});
		let style = '';
		for (let i in d) {
			style += parentClass + ' .' + d[i].c + '{stroke-dasharray:' + d[i].l + 'px ' + d[i].l + 'px;';
			style += 'stroke-dashoffset:-' + d[i].l + 'px}';
		}
		console.log(style);
	}
	
	/**
	 * Promise method
	 -------------------------------------------------- */
	function promiseMethod() {
		let promise = new Promise(function(resolve, reject) {
			console.log('#1');
			resolve('Hello');
		})
		.then(function(msg) {
			console.log('#2');
			return `${msg} I'm`;
		})
		.then(function(msg) {
			return new Promise(function(resolve, reject) {
				setTimeout(function(msg) {
					console.log('#3');
					resolve(`${msg} Jeccy.`);
				}, 500)
			})
		})
		.then(function(msg) {
			console.log('#4')
			console.log('-' + msg + '-');
		})
		.catch(function() {
			console.error('Something wrong!')
		});
	}
	
	/**
	 * Web Font Loader
	 -------------------------------------------------- */
	function webFontLoader() {
		wf.constructor();
	}
	const wf = {
		constructor: function() {
			//console.log('-----> webFontLoader');
			window.WebFontConfig = {
				google: {
					families: ['Lato:400,700', 'Noto+Sans+JP:400,700', 'Noto+Serif+JP']
				},
				loading: function() {
					console.log('loading');
				},
				active: function() {
					console.log('active');
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
	 * .js-sc-wrap 内のスクロールを transform: translate に置き換える
	 * transformScroll
	 -------------------------------------------------- */
	function transformScroll() {
		if (document.querySelector('.js-sc-wrap') !== null) ts.constructor();
	}
	const ts = {
		constructor: function() {
			//console.log('-----> transformScroll');
			if (isTouch) return false;
			
			document.body.insertAdjacentHTML('beforeend', '<div class="js-sc-dummy"></div>');
			this.dummy = document.getElementsByClassName('js-sc-dummy')[0];
			this.wrapper = document.getElementsByClassName('js-sc-wrap')[0];
			this.wrapper.classList.add('js-fixed');
			this.winH = window.innerHeight;
			
			this.frictionOrigin = 10 / 100;
			this.ratioOrigin = 60 / 10;
			this.friction = this.frictionOrigin;
			this.initialize();
		},
		initialize: function() {
			this.startY = window.pageYOffset;
			this.posY = this.startY;
			
			/* js-sc-slip があったら slipperData をつくる */
			if (document.querySelector('.js-sc-slip') !== null) {
				this.slipper = document.querySelectorAll('.js-sc-slip');
				this.slipperData = [];
				this.setSlipperData();
			}
		},
		
		/* slipperData に js-sc-slip の配置情報を記録する */
		setSlipperData: function() {
			this.isLock = true;
			let elm, ratio, clientRect;
			for (let i = this.slipper.length; i--;) {
				elm = this.slipper[i];
				clientRect = elm.getBoundingClientRect();
				ratio = elm.getAttribute('data-ratio') !== null ? elm.getAttribute('data-ratio') / 10 : this.ratioOrigin;
				this.slipperData[i] = {
					elm: elm,
					posY: null,
					ratio: ratio,
					position: window.pageYOffset + clientRect.top,
					rect: clientRect,
				};
			}
			this.isLock = false;
			//console.log(this.slipperData);
		},
		
		/* 以下を loop で requestAnimationFrame する */
		onScroll: function() {
			this.startY = this.posY;
			
			/* isLock 時はパララックスしない */
			if (this.isLock) {
				if (this.friction !== 1) this.friction = 1;
			} else {
				if (this.friction !== this.frictionOrigin) this.friction = this.frictionOrigin;
			}
			this.cal();
			this.positionSet();
			this.startY = this.posY;
		},
		cal: function() {
			this.startY = this.posY;
			const goalY = window.pageYOffset;
			
			// 大元スクロールの位置
			this.posY += (goalY - this.posY) * this.friction;
			this.posY = Math.round(this.posY * 100) / 100;
			if (this.posY < 0.1) {
				this.posY = 0;
			} else if (this.posY > this.wrapperBtm - 0.1) {
				this.posY = this.wrapperBtm;
			}
			
			// ずれる要素の位置
			if (this.slipperData !== undefined) {
				let data;
				const diff = this.winH / 2;
				for (var i = this.slipper.length; i--;) {
					data = this.slipperData[i];
					data.posY += (goalY + diff - data.posY) * (this.friction * 0.8);
					data.posY = Math.round(data.posY * 100) / 100;
				}
			}
		},
		positionSet: function() {
			// 大元スクロールの位置
			this.wrapper.style.transform = 'translate3d(0,-' + this.posY + 'px,0)';
			
			// ずれる要素の位置
			if (this.slipperData !== undefined) {
				let data, pos;
				for (var i = this.slipper.length; i--;) {
					data = this.slipperData[i];
					pos = Math.round((data.posY - data.position) * 100) / 100;
					this.slipper[i].style.transform = 'translate3d(0,' + pos / data.ratio + 'px,0)';
				}
			}
		},
		
		/* ダミー要素の高さをコンテンツと揃える */
		insistentRefresh: function() {
			if (this.wrapper.clientHeight !== this.dummyHeight) this.refresh();
		},
		refresh: function() {
			//console.log('refresh')
			const wrapperHeight = this.wrapper.clientHeight;
			this.wrapperBtm = wrapperHeight - window.innerHeight;
			this.dummy.style.height = wrapperHeight + 'px';
			this.dummyHeight = this.dummy.clientHeight;
			//console.log(this.wrapper.clientHeight, this.dummyHeight)
		}
	};
	
	/**
	 * .a-hamburger クリックで .l-nav を開閉
	 * dm.closeMenu();
	 -------------------------------------------------- */
	function drawerMenu() {
		if (document.querySelector('.l-nav') !== null) dm.constructor();
	}
	const dm = {
		constructor: function() {
			//console.log('-----> drawerMenu');
			this.yOffset = window.pageYOffset;
			this.menu = document.getElementsByClassName('l-nav')[0];
			this.btn = document.getElementsByClassName('a-hamburger');
			const btn = document.querySelectorAll('.a-hamburger, .l-nav .overlay');
			for (let i = 0, len = btn.length; i < len; i++) {
				btn[i].addEventListener('click', this.toggleMenu);
			}
			for (let i = 0, len = this.btn.length; i < len; i++) {
				this.btn[i].addEventListener('transitionend', this.btnEnd);
			}
			this.menu.addEventListener('transitionend', this.menuEnd);
		},
		toggleMenu: function() {
			!dm.isOpened ? dm.openMenu() : dm.closeMenu();
		},
		openMenu: function() {
			dm.isOpened = true;
			dm.yOffset = window.pageYOffset;
			//console.log('openMenu', dm.yOffset);
			document.body.classList.add('is-fixed');
			document.body.style.marginTop = -dm.yOffset + 'px';
			for (let i = 0, len = dm.btn.length; i < len; i++) {
				dm.btn[i].classList.add('is-active');
			}
			dm.menu.classList.add('is-active');
		},
		closeMenu: function() {
			//console.log('closeMenu', dm.yOffset);
			document.body.classList.remove('is-fixed');
			document.body.removeAttribute('style');
			window.scrollTo(0, dm.yOffset);
			dm.isOpened = false;
			for (let i = 0, len = dm.btn.length; i < len; i++) {
				dm.btn[i].classList.remove('is-active');
			}
			dm.menu.classList.remove('is-active');
		}
	};
	
	/**
	 * .anc[href^="#"] をクリックでスムーススクロール
	 * as.toScroll('top');
	 -------------------------------------------------- */
	function anchorScroll() {
		if (document.querySelector('.anc') !== null || location.hash) as.constructor();
	}
	const as = {
		constructor: function() {
			//console.log('-----> anchorScroll');
			if (location.hash) {
				// URL に hash があったらスクロール
				setTimeout(function() {
					as.toScroll(location.hash.slice(1));
					history.replaceState('', document.title, window.location.pathname);
					//history.replaceState(null, null, './');
				}, 60);
			}
			this.SPF = 1000 / 60;
			this.duration = 800;
			this.onResize();
			this.cancelScroll(this);
			const anchor = document.querySelectorAll('.anc[href^="#"]');
			for (let i = 0, len = anchor.length; i < len; i++) {
				anchor[i].addEventListener('click', this.onClick);
			}
		},
		onClick: function(e) {
			e.preventDefault();
			const targetId = this.closest('[href]').getAttribute('href');
			as.toScroll(targetId.slice(1));
		},
		onResize: function() {
			as.scBtm = document.body.offsetHeight - window.innerHeight;
			as.scPad = document.getElementsByClassName('l-header')[0].clientHeight - 1;
			as.scMax = document.body.clientHeight - window.innerHeight;
			
			// body の高さが取得できなかった場合 0.06 秒後に改めて実行
			if (as.scMax < 0) setTimeout(as.onResize, 60);
		},
		toScroll: function(targetId) {
			if (targetId !== 'top' && document.getElementById(targetId) === null) return;
			
			// ドロワーメニューが開いていたら、開いた時の位置からスタート (メニューは閉じる)
			this.startPos = (dm.isOpened) ? dm.yOffset : window.pageYOffset;
			if (dm.isOpened) dm.closeMenu();
			
			this.currentPos = this.startPos;
			this.elapsedTime = 0;
			this.goalPos = (targetId !== 'top') ? (document.getElementById(targetId).getBoundingClientRect().top + window.pageYOffset - this.scPad) : 0;
			//console.log(this.startPos, window.pageYOffset);
			if (this.goalPos >= this.scMax) {
				this.goalPos = this.scMax;
			}
			this.valueInChange = this.goalPos - this.startPos;
			//this.duration = Math.abs(this.valueInChange) < 1200 ? 600 : Math.abs(this.valueInChange) / 2;
			//console.log(this.startPos, this.goalPos, this.valueInChange);
			this.doScroll();
		},
		doScroll: function() {
			const elapsedTimeRate = as.elapsedTime / as.duration;
			const valueChangeRate = as.easing(elapsedTimeRate);
			const changeYOffset = as.valueInChange * valueChangeRate;
			
			as.currentPos = as.startPos + changeYOffset;
			
			if (as.elapsedTime >= as.duration) {
				as.currentPos = as.goalPos;
				clearTimeout(as.timer);
				return;
			} else {
				as.elapsedTime += as.SPF;
				as.timer = setTimeout(as.doScroll, as.SPF);
			}
			
			window.scrollTo(0, as.currentPos);
		},
		/* スワイプするかマウスホイールを操作したらスクロールを止める */
		cancelScroll: function(t) {
			//console.log(t);
			let count = 0;
			if (isTouch) {
				window.addEventListener('touchmove', function() {
					clearTimeout(t.timer);
				});
			} else {
				this.wheel = function() {
					clearTimeout(t.timer);
				}
				if (window.addEventListener) { window.addEventListener('DOMMouseScroll', this.wheel, false); }
				window.onmousewheel = document.onmousewheel = this.wheel;
			}
		},
		/* easeOutQuart ( https://easings.net/ ) */
		easing: function(x) {
			return 1 - Math.pow(1 - x, 4);
		}
	};
	/**
	 * YouTube API
	 * <div class="js-yt" width="width" height="height" data-ytid="DmoE_5aXV-U"></div>
	 -------------------------------------------------- */
	function setupYouTube() {
		if (document.querySelector('.js-yt') !== null) yt.constructor();
	}
	const yt = {
		constructor: function() {
			console.log('-----> setupYouTube');
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
			global.onYouTubeIframeAPIReady = function() { yt.init(); }
		},
		init: function() {
			const ytElms = document.getElementsByClassName('js-yt');
			let id, ytid, w, h;
			for (let i = 0, len = ytElms.length; i < len; i++) {
				//console.dir(ytElms[i]);
				id = 'player-' + i;
				ytid = ytElms[i].dataset['ytid'];
				console.dir(ytElms[i]);
				w = ytElms[i].getAttribute('width') ? ytElms[i].getAttribute('width') : 560;
				h = ytElms[i].getAttribute('height') ? ytElms[i].getAttribute('height') : 315;
				ytElms[i].setAttribute('id', id);
				yt.setup(id, ytid, w, h);
				this.setUI(ytElms[i].parentNode.parentNode, id);
			}
		},
		setUI: function(wrap, id) {
			//console.log(wrap);
			const poster = wrap.getElementsByClassName('poster')[0];
			poster.dataset['player'] = id;
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
			//console.log('onPlay');
			const player = yt.player[this.dataset['player']];
			if (player.getPlayerState() !== 1) {
				player.playVideo();
			} else {
				player.pauseVideo();
			}
		},
		onPlayerReady: function(e) {
			//console.log('onPlayerReady', e);
		},
		onPlayerStateChange: function(e) {
			//console.log('onPlayerStateChange', e);
			if (e.data === 1 || e.data === -1) {
				e.target.getIframe().parentNode.parentNode.classList.add('is-playing');
			} else {
				e.target.getIframe().parentNode.parentNode.classList.remove('is-playing');
			}
		}
	};
	
	/**
	 * fetch が使えたら fetch、使えなかったら xhr で Ajax する
	 * doAjax(request, function() {}, 'text');
	 * fetchAjax(request, function() {}, 'json');
	 * xhrAjax(request, function() {}, 'blob');
	 * -------------------------------------------------- */
	function doAjax(req, fn, format) {
		if (self.fetch) {
			fetchAjax(req, fn, format)
		} else {
			xhrAjax(req, fn, format)
		}
	}
	function fetchAjax(req, fn, format) {
		//console.log('-----> fetchAjax');
		fetch(req)
		.then(function(response) {
			return new Promise(function(resolve, reject) {
				return response[format]()
				.then(function(data) {
					return resolve(data);
				}, function(error) {
					return reject(error);
				});
			});
		})
		.then(function(data) {
			console.log('success ----->', JSON.stringify(data))
			fn(data);
		}, function(error) {
			console.log('error -----> '.concat(error));
		});
	};
	function xhrAjax(req, fn, format) {
		//console.log('-----> xhrAjax');
		const xhr = new XMLHttpRequest();
		xhr.responseType = format;
		xhr.addEventListener('progress', function(e) {
			const rate = e.loaded / (e.total == 0 ? e.loaded : e.total);
			console.log(e, rate);
		});
		xhr.addEventListener('load', function(e) {
			if (xhr.readyState === 4) {
				if (xhr.status == 200 || xhr.status == 304) {
					let data = e.target.response;
					if (format === 'json') data = JSON.parse(data);
					fn(data);
				}
			}
		});
		xhr.open('GET', req);
		xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
		xhr.send();
	};
	
	/**
	 * in-view
	 * <p class="js-inview"></p>
	 * <figure class="spacer"><img data-src="path.jpg" width="width" height="height"></figure>
	 * -------------------------------------------------- */
	function setInview() {
		inview.constructor();
	}
	const inview = {
		constructor: function() {
			if (document.querySelector('.js-spacer') !== null) inview.wrapSpacer();
			if (document.querySelector('.js-inview') !== null) inview.basic();
			if (document.querySelector('[data-src]') !== null) inview.lazy();
		},
		basic: function() {
			inView('.js-inview').on('enter', this.doInview);
			inView.offset({ top: 80, right: 0, bottom: 80, left: 0 });
		},
		wrapSpacer: function() {
			const spacer = document.getElementsByClassName('js-spacer');
			let w, h;
			for (let i = spacer.length; i--;) {
				//console.dir(spacer[i].firstChild);
				w = spacer[i].firstChild.getAttribute('width');
				h = spacer[i].firstChild.getAttribute('height');
				spacer[i].style.paddingBottom = h / w * 100 + '%';
				spacer[i].insertAdjacentHTML('beforeend', '<span class="cover"></span>');
				spacer[i].classList.replace('js-spacer', 'spacer');
			}
		},
		doInview: function(el) {
			if (!el.isInview) {
				el.isInview = 1;
				el.classList.add('is-anim', 'is-inview');
				el.addEventListener('transitionend', inview.animEnd);
			}
		},
		animEnd: function() {
			this.removeEventListener('transitionend', inview.animEnd);
			this.classList.remove('is-anim');
		},
		// lazyLoader & inview
		lazy: function() {
			inView('[data-src]').on('enter', this.doLazy);
			inView.offset({ top: 80, right: 0, bottom: 80, left: 0 });
		},
		doLazy: function(el) {
			if (!el.isInview) {
				imagesLoaded(el, inview.imageLoaded);
				el.src = el.dataset['src'];
				el.removeAttribute('data-src');
			}
		},
		imageLoaded: function() {
			this.elements[0].parentNode.classList.add('is-anim', 'is-loaded');
			this.elements[0].parentNode.addEventListener('transitionend', inview.loadedEnd);
		},
		loadedEnd: function() {
			this.removeEventListener('transitionend', inview.loadedEnd);
			//this.removeChild(this.lastElementChild); // cover を削除
			this.classList.remove('is-anim');
		}
	};
	
	/**
	 * common
	 * -------------------------------------------------- */
	function common() {
		const doc = document.documentElement, ua = navigator.userAgent.toLowerCase();
		isIE = ( ua.indexOf('msie') != -1 || ua.indexOf('trident') != -1 );
		isTouch = !!( 'ontouchstart' in window || (navigator.pointerEnabled && navigator.maxTouchPoints > 0) );
		isDesktop = window.matchMedia('(min-width: 768px)').matches;
		isWindows = ua.indexOf('windows nt') !== -1;
		if (isWindows) doc.classList.add('isWindows');
		if (isTouch) doc.classList.add('isTouch');
		if (isIE) doc.classList.add('isIE');
		if (window.innerWidth !== doc.clientWidth) {
			doc.classList.add('hasScrollbar');
			doc.style.setProperty('--scroll-bar-nega', doc.clientWidth - window.innerWidth + 'px');
			doc.style.setProperty('--scroll-bar-posi', window.innerWidth - doc.clientWidth + 'px');
		}
	}
	const resized = function(fn) {
		if (resized.timer !== false) clearTimeout(resized.timer);
		resized.timer = setTimeout(fn, 200);
	};
	const throttle = (function(fn) {
		const interval = 200;
		let lastTime = new Date().getTime() - interval;
		return function(fn) {
			if ((lastTime + interval) <= new Date().getTime()) {
				lastTime = new Date().getTime();
				fn();
			}
		}
	})();
	function breakPointLintener() {
		const breakPoint = window.matchMedia('(min-width: 768px)');
		breakPoint.addListener(function(e) { isDesktop = e.matches; });
	}
	function addFnc(fns) {
		for (let i = 0, len = fns.length; i < len; i++) { fns[i](); }
	}
	// Element.closest() Polyfill
	Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),Element.prototype.closest||(Element.prototype.closest=function(e){var t=this;do{if(Element.prototype.matches.call(t,e))return t;t=t.parentElement||t.parentNode}while(null!==t&&1===t.nodeType);return null});
})((this || 0).self || global);