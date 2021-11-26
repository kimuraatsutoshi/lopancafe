(function(global) {
	'use strict';
	
	function onLoaded() {
		addFnc([
			webFontLoader,
			windowManagement,
			transformScroll,
			magneticButton,
			setInview,
			setLazy,
			drawerMenu,
			anchorScroll,
			setupYouTube
		]);
		if (location.search) {
			console.log( returnObject(location.search.substring(1)) );
		}
		if (document.querySelector('path') !== null) setPathLen();
		loop();
	}
	function onPopstate(e) {
		console.log('onPopstate');
	}
	function onResize() {
		resized(function() {
			if (as.duration !== undefined) as.onResize();
			if (wm.yOffset !== undefined) wm.refresh();
		});
	}
	function onScroll() {
		throttle(function() {
// 			console.log(window.pageYOffset);
		});
	}
	/* マッピング (パララックス)
	 * value が fromMin から toMin へ変化する間 fromMax から toMax を返す
	 */
	function map (value, fromMin, fromMax, toMin, toMax, trimming) {
		var val = (value - fromMin) / (fromMax - fromMin) * (toMax - toMin) + toMin;
		return trimming ? Math.max(Math.min(val, toMax), toMin) : val;
	}
	const movie = document.getElementsByClassName('c-video')[0];
	function loop() {
		const a = map(window.pageYOffset, 400, 0, 0, 1000, true);
		movie.style.opacity = a / 1000;
		requestAnimationFrame(loop);
		if (ts.wrapper !== undefined) {
			ts.onScroll();
			ts.insistentRefresh();
		}
		if (wm.yOffset !== undefined) {
			wm.yOffset = ts.wrapper !== undefined ? ts.posY : window.pageYOffset;
		}
	}
	
	document.addEventListener('DOMContentLoaded', onLoaded, false);
	window.addEventListener('popstate', onPopstate, false);
	window.addEventListener('resize', onResize, false);
	window.addEventListener('scroll', onScroll, false);
	
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
				custom: {
					families: [ 'Lato', 'Noto+Sans+JP' ],
					urls: [ 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap' ]
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
	 * MagneticButton
	 -------------------------------------------------- */
	function magneticButton() {
		mgbtn.constructor();
	}
	const mgbtn = {
		constructor: function() {
			this.winsize = this.calcWinsize();
			this.cursorpos = { x: 0, y: 0 };
			window.addEventListener('mousemove', function(e) {
				mgbtn.cursorpos = { x: e.clientX, y: e.clientY };
			});
			this.btnsData = {};
			
			const btns = document.getElementsByClassName('js-mgBtn');
			for (let i = 0, len = btns.length; i < len; i++) {
				btns[i].dataset['mg'] = 'btn-' + (i + 1);
				btns[i].innerHTML = '<span class="text">' + btns[i].innerHTML + '</span>';
				this.setData(btns[i], 'btn-' + (i + 1));
				btns[i].addEventListener('mouseenter', this.enter);
				btns[i].addEventListener('mouseleave', this.leave);
			}
			//console.log(this.btnsData);
			this.loop();
		},
		setData: function(btn, id) {
			const rect = btn.getBoundingClientRect();
			const top = rect.top + window.pageYOffset;
			this.btnsData[id] = {
				isHov: false,
				el: btn,
				txt: btn.firstChild,
				rect: {
					top: rect.top + window.pageYOffset,
					left: rect.left,
					width: rect.width,
					height: rect.height
				},
				renderedStyles: {
					tx: { pre: 0, cur: 0, amt: .1 },
					ty: { pre: 0, cur: 0, amt: .1 }
				},
				distanceToTrigger: rect.width / 1.5
			};
			console.log(this.btnsData[id].rect.top);
		},
		resetData: function() {
			let rect;
			for (let i in this.btnsData) {
				rect = this.btnsData[i].el.getBoundingClientRect();
				this.btnsData[i].rect = {
					top: rect.top + window.pageYOffset,
					left: rect.left,
					width: rect.width,
					height: rect.height
				};
				this.btnsData[i].distanceToTrigger = rect.width / 1.5;
				console.log(i, this.btnsData[i].rect.top);
			}
		},
		lerp: function(a, b, n) {
			return (1 - n) * a + n * b;
		},
		calcWinsize: function() {
			return { width: window.innerWidth, height: window.innerHeight };
		},
		distance: function(x1, y1, x2, y2) {
			const a = x1 - x2;
			const b = y1 - y2;
			return Math.hypot(a, b);
		},
		loop: function() {
			for (let i in mgbtn.btnsData) {
				mgbtn.render(mgbtn.btnsData[i]);
			}
			requestAnimationFrame(mgbtn.loop);
		},
		enter(e) {
			mgbtn.btnsData[this.dataset['mg']].isHov = true;
		},
		leave(e) {
			mgbtn.btnsData[this.dataset['mg']].isHov = false;
		},
		render(data) {
			//if (data.isHov) console.log(data.el.dataset['mg']);
			let x = 0, y = 0;
			
			// カーソルからボタンの中心までの距離
			const distanceMouseButton = mgbtn.distance(
				mgbtn.cursorpos.x + window.scrollX,
				mgbtn.cursorpos.y + window.scrollY,
				data.rect.left + data.rect.width / 2,
				data.rect.top + data.rect.height / 2
			);
			if (distanceMouseButton < data.distanceToTrigger) {
				x = (mgbtn.cursorpos.x + window.scrollX - (data.rect.left + data.rect.width / 2)) * .3;
				y = (mgbtn.cursorpos.y + window.scrollY - (data.rect.top + data.rect.height / 2)) * .3;
			}
			data.renderedStyles['tx'].cur = x;
			data.renderedStyles['ty'].cur = y;
			
			for (let key in data.renderedStyles) {
				data.renderedStyles[key].pre = mgbtn.lerp(
					data.renderedStyles[key].pre,
					data.renderedStyles[key].cur,
					data.renderedStyles[key].amt
				);
			}
			const tx = data.renderedStyles['tx'].pre;
			const ty = data.renderedStyles['ty'].pre;
			
			if (Math.abs(tx) >= 0.01 || Math.abs(ty) >= 0.01) {
				data.el.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
				data.txt.style.transform = 'translate3d(' + -tx / 2 + 'px,' + -ty / 2 + 'px,0)';
			} else {
				data.el.removeAttribute('style');
				data.txt.removeAttribute('style');
			}
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
				const diff = wm.winH / 2;
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
	 * .js-menuToggle クリックで .l-menu を開閉
	 * dm.closeMenu();
	 -------------------------------------------------- */
	function drawerMenu() {
		if (document.querySelector('.l-menu') !== null) dm.constructor();
	}
	const dm = {
		constructor: function() {
			//console.log('-----> drawerMenu');
			this.menu = document.getElementsByClassName('l-menu')[0];
			const btn = document.getElementsByClassName('js-menuToggle');
			for (let i = 0, len = btn.length; i < len; i++) {
				btn[i].addEventListener('click', this.toggleMenu);
			}
		},
		toggleMenu: function() {
			!dm.isOpened ? dm.openMenu() : dm.closeMenu();
			dm.menu.addEventListener('transitionend', dm.menuEnd);
		},
		openMenu: function() {
// 			console.log('openMenu', wm.yOffset);
			dm.isOpened = true;
			wm.posLock();
			dm.menu.classList.add('is-active', 'is-anim');
		},
		closeMenu: function() {
// 			console.log('closeMenu', wm.yOffset);
			dm.isOpened = false;
			wm.posUnlock();
			dm.menu.classList.replace('is-active', 'is-anim');
		},
		menuEnd: function(e) {
			if (dm.isOpened) {
				if (e.target.className.indexOf('close') >= 0) {
					this.classList.remove('is-anim');
					dm.menu.removeEventListener('transitionend', dm.menuEnd);
				}
			} else {
				if (e.target.className.indexOf('overlay') >= 0) {
					this.classList.remove('is-anim');
					dm.menu.removeEventListener('transitionend', dm.menuEnd);
				}
			}
		}
	};
	
	/**
	 * window の情報を管理する
	 * モーダルが開いた時とかはここで画面をロックする
	 * windowManagement
	 -------------------------------------------------- */
	function windowManagement() {
		wm.constructor();
	}
	const wm = {
		constructor: function() {
			this.body = document.body;
			this.refresh();
		},
		refresh: function() {
			this.winH = window.innerHeight;
			this.yOffset = ts.wrapper !== undefined ? ts.posY : window.pageYOffset;
		},
		posLock: function() {
			wm.isLock = 1;
			if (ts.wrapper !== undefined) ts.isLock = wm.isLock;
			wm.lockOffset = wm.yOffset;
			wm.body.classList.add('is-fixed');
			wm.body.style.marginTop = -wm.lockOffset + 'px';
		},
		posUnlock: function() {
			wm.body.classList.remove('is-fixed');
			wm.body.removeAttribute('style');
			window.scrollTo(0, wm.lockOffset);
			setTimeout(function() {
				wm.isLock = 0;
				if (ts.wrapper !== undefined) ts.isLock = wm.isLock;
			}, 60);
		}
	};
	
	/**
	 * .js-anc[href^="#"] をクリックでスムーススクロール
	 * as.toScroll('top');
	 -------------------------------------------------- */
	function anchorScroll() {
		if (document.querySelector('.js-anc') !== null || location.hash) as.constructor();
	}
	const as = {
		constructor: function() {
			//console.log('-----> anchorScroll');
			if (location.hash) {
				// URL に hash があったらスクロール
				setTimeout(function() {
					as.toScroll(location.hash.slice(1));
					history.replaceState('', document.title, window.location.pathname);
				}, 80);
			}
			this.SPF = 1000 / 60;
			this.duration = 800;
			this.onResize();
			this.cancelScroll(this);
			const anchor = document.querySelectorAll('.js-anc[href^="#"]');
			for (let i = 0, len = anchor.length; i < len; i++) {
				anchor[i].addEventListener('click', this.onClick);
			}
		},
		onClick: function(e) {
			e.preventDefault();
			const targetId = this.getAttribute('href');
			as.toScroll(targetId.slice(1));
		},
		onResize: function() {
			as.scBtm = document.body.offsetHeight - window.innerHeight;
			as.scPad = document.getElementsByClassName('l-header')[0].clientHeight;
			as.scMax = document.body.clientHeight - window.innerHeight;
			
			// body の高さが取得できなかった場合 0.06 秒後に改めて実行
			if (as.scMax < 0) setTimeout(as.onResize, 60);
		},
		toScroll: function(targetId) {
			if (targetId !== 'top' && document.getElementById(targetId) === null) return;
			//console.log(targetId);
			
			// ドロワーメニューが開いていたら、開いた時の位置からスタート (メニューは閉じる)
			this.startPos = (dm.isOpened) ? wm.lockOffset : wm.yOffset;
			if (dm.isOpened) dm.closeMenu();
			
			this.currentPos = this.startPos;
			this.elapsedTime = 0;
			this.goalPos = (targetId !== 'top') ? (document.getElementById(targetId).getBoundingClientRect().top + wm.yOffset - this.scPad) : 0;
			//console.log(targetId, this.startPos, this.goalPos);
			if (this.goalPos >= this.scMax) {
				this.goalPos = this.scMax;
			}
			this.valueInChange = this.goalPos - this.startPos;
			this.duration = Math.abs(this.valueInChange) < 1200 ? 600 : Math.abs(this.valueInChange) / 2;
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
				cancelAnimationFrame(as.timer);
				return;
			} else {
				as.elapsedTime += as.SPF;
				as.timer = requestAnimationFrame(as.doScroll);
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
// 				console.dir(ytElms[i]);
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
	 * fetchAjax(request, function() {}, 'json');
	 * -------------------------------------------------- */
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
	
	/**
	 * in-view
	 * <ul class="js-inview" data-last=":last-child"></ul>
	 * <ul class="js-inview" data-anim="animationName"></ul>
	 * -------------------------------------------------- */
	function setInview() {
		if (document.querySelector('.js-inview') !== null) iv.constructor();
	}
	const iv = {
		constructor: function() {
			//inView('.js-inview').on('enter', this.doInview);
			//inView.offset({ top: 80, right: 0, bottom: 80, left: 0 });
			const elms = document.getElementsByClassName('js-inview');
			if (self.IntersectionObserver !== undefined) {
				console.log('IntersectionObserver');
				this.inview(elms);
			} else {
				console.log('スクロールで実装');
			}
		},
		inview: function(elms) {
			this.intersectionObserver = new IntersectionObserver(function(entries) {
				for (let i = 0; i < entries.length; i++) {
					if (entries[i].intersectionRatio <= 0) continue;
					iv.doInview(entries[i].target);
				}
			}, {
				rootMargin: '-80px 0px -80px 0px'
			});
			for (let i = 0; i < elms.length; i++) {
				this.intersectionObserver.observe(elms[i]);
			}
		},
		doInview: function(el) {
			if (!el.isInview) {
				el.isInview = 1;
				if (el.dataset['anim'] !== undefined) {
					el.addEventListener('animationend', iv.animationEnd);
				} else if (el.dataset['last'] !== undefined) {
					el.addEventListener('transitionend', iv.lastElmEnd);
				} else {
					el.addEventListener('transitionend', iv.transitionendEnd);
				}
				el.classList.add('is-anim');
				el.classList.add('is-inview');
			}
		},
		animationEnd: function(e) {
			if (e.animationName === this.dataset['anim']) {
				this.classList.remove('is-anim', 'js-inview');
				this.removeAttribute('data-anim');
				this.removeEventListener('animationend', iv.animationEnd);
			}
		},
		lastElmEnd: function(e) {
			if (e.target === this.querySelector(this.dataset['last'])) {
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
	function setLazy() {
		if (document.querySelector('[data-src]') !== null) lz.constructor();
	}
	const lz = {
		constructor: function() {
			let cls, w, h;
			const imgs = document.querySelectorAll('img[data-src]');
			for (let i = 0, len = imgs.length; i < len; i++) {
				cls = imgs[i].getAttribute('class') ? ' ' + imgs[i].getAttribute('class') : '';
				w = imgs[i].getAttribute('width');
				h = imgs[i].getAttribute('height');
				imgs[i].src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 ' + w + ' ' + h + '%22%3E%3C/svg%3E';
			}
			
			if (self.IntersectionObserver !== undefined) {
				console.log('IntersectionObserver');
				this.lazy(imgs);
			} else {
				console.log('スクロールで実装');
			}
		},
		lazy: function(imgs) {
			this.intersectionObserver = new IntersectionObserver(function(entries) {
				for (let i = 0; i < entries.length; i++) {
					if (entries[i].intersectionRatio <= 0) continue;
					lz.doLazy(entries[i].target);
				}
			}, {
				rootMargin: '-80px 0px -80px 0px'
			});
			for (let i = 0; i < imgs.length; i++) {
				this.intersectionObserver.observe(imgs[i]);
			}
		},
		doLazy: function(el) {
			imagesLoaded(el, lz.loaded);
			el.src = el.dataset['src'];
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
	
	/* MEMO: lopan=jp&sample=test みたいなパラメーターをオブジェクトにして返す */
	function returnObject(param) {
		const arg = new Object;
		const arr = param.split('&');
		for (let i in arr) {
			var keyval = arr[i].split('=');
			arg[keyval[0]] = keyval[1];
		}
		return arg;
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
	 * common
	 * -------------------------------------------------- */
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
	let isIE, isTouch, isWindows;
	function addFnc(fns) {
		for (let i = 0, len = fns.length; i < len; i++) { fns[i](); }
	}
	(function common() {
		const doc = document.documentElement, ua = navigator.userAgent.toLowerCase();
		isIE = ( ua.indexOf('msie') != -1 || ua.indexOf('trident') != -1 );
		isWindows = ua.indexOf('windows nt') !== -1;
		isTouch = !!( 'ontouchstart' in window || (navigator.pointerEnabled && navigator.maxTouchPoints > 0) );
		if (isIE) doc.classList.add('isIE');
		if (isWindows) doc.classList.add('isWindows');
		if (isTouch) doc.classList.add('isTouch');
		if (window.innerWidth !== doc.clientWidth) {
			doc.classList.add('hasScrollbar');
			doc.style.setProperty('--scroll-bar-width', window.innerWidth - doc.clientWidth + 'px');
		}
	})();
	// Element.closest() Polyfill
	Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),Element.prototype.closest||(Element.prototype.closest=function(e){var t=this;do{if(Element.prototype.matches.call(t,e))return t;t=t.parentElement||t.parentNode}while(null!==t&&1===t.nodeType);return null});
})((this || 0).self || global);