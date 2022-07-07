(function(global) {
	'use strict';
	
	function onLoaded() {
		addFnc([
			webFontLoader,
			windowManagement,
			mainResizeObserver,
			
			flexTextarea,
			simpleMapping,
			magneticButton,
			transformScroll,
			
			setInview,
			setLazy,
			drawerMenu,
			anchorScroll,
			setupYouTube
		]);
		simpleMapping();
		if (location.search) console.log( returnObject(location.search.substring(1)) );
		if (document.querySelector('path') !== null) setPathLen();
		loop();
	}
	const registFnc = { onLoaded: [], onPopstate: [], onResize: [], onMainResize: [], onScroll: [], loop: [] };
	
	function onPopstate(e) {
		console.log('onPopstate');
	}
	function onResize() {
		resized(() => {
			if (registFnc.onResize.length) addFnc(registFnc.onResize);
		});
	}
	function onScroll() {
		throttle(() => {
			if (registFnc.onScroll.length) addFnc(registFnc.onScroll);
		});
	}
	function loop() {
		if (registFnc.loop.length) {
			requestAnimationFrame(loop);
			addFnc(registFnc.loop);
		}
	}
	
	document.addEventListener('DOMContentLoaded', onLoaded);
	window.addEventListener('popstate', onPopstate);
	window.addEventListener('resize', onResize);
	window.addEventListener('scroll', onScroll);
	
	
	/**
	 * マッピング (パララックス)
	 -------------------------------------------------- */
	function simpleMapping() {
		sm.constructor();
	}
	const sm = {
		constructor: function() {
			this.movie = document.getElementsByClassName('c-video')[0];
			this.fromMin = document.getElementById('video').getBoundingClientRect().bottom + window.pageYOffset;
			this.fromMax = document.getElementById('video').getBoundingClientRect().top + window.pageYOffset;
			registFnc.loop.push(this.mapLoop);
		},
		mapping: function(value, fromMin, fromMax, toMin, toMax) {
			const val = (value - fromMin) / (fromMax - fromMin) * (toMax - toMin) + toMin;
			return Math.max(Math.min(val, toMax), toMin);
		},
		mapLoop: function() {
			// pageYOffset が fromMax から fromMin まで変化する間に 1000 から 0 へ推移する
			const a = sm.mapping(window.pageYOffset, sm.fromMin, sm.fromMax, 0, 1000);
			sm.movie.style.opacity = a / 1000;
		}
	}
	
	/**
	 * flex textarea
	 -------------------------------------------------- */
	const flexTextarea = () => {
		const elm = document.querySelectorAll('.c-flextextarea');
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
	 * l-main のリサイズを監視する
	 -------------------------------------------------- */
	function mainResizeObserver() {
		mro.constructor();
	}
	const mro = {
		constructor: function() {
			const target = document.getElementsByClassName('l-main')[0];
			this.mainHeight = target.clientHeight;
			this.setup();
			this.resizeObserver.observe(target);
		},
		setup: function() {
			this.resizeObserver = new ResizeObserver(entries => {
				const rect = entries[0].contentRect;
				if (this.mainHeight !== rect.height) {
					console.log('mainResizeObserver');
					if (registFnc.onMainResize.length) {
						resized(() => { addFnc(registFnc.onMainResize); });
					}
					this.mainHeight = rect.height;
				}
			});
		}
	};
	
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
		if (document.querySelector('.js-mgBtn') !== null) mgbtn.constructor();
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
				btns[i].dataset.mg = 'btn-' + (i + 1);
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
			//console.log(this.btnsData[id].rect.top);
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
	 * window の情報を管理する
	 * モーダルが開いた時とかはここで画面をロックする
	 -------------------------------------------------- */
	function windowManagement() {
		wm.constructor();
	}
	const wm = {
		constructor: function() {
			this.body = document.body;
			this.yOffset = window.pageYOffset;
			this.onResize();
			registFnc.onResize.push(this.onResize);
			registFnc.loop.push(this.onScroll);
		},
		onResize: function() {
			wm.winH = window.innerHeight;
		},
		onScroll: function() {
			wm.yOffset = window.pageYOffset;
		},
		posLock: function() {
			wm.isLock = true;
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
				wm.isLock = false;
				if (ts.wrapper !== undefined) ts.isLock = wm.isLock;
			}, 60);
		}
	};
	
	/**
	 * .js-sc-wrap 内のスクロールを transform: translate に置き換える
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
			this.ratioOrigin = 100 / 10;
			this.friction = this.frictionOrigin;
			this.initialize();
			this.refresh();
		},
		initialize: function() {
			this.startY = wm.yOffset;
			this.posY = this.startY;
			
			/* js-sc-slip があったら slipperData をつくる */
			if (document.querySelector('.js-sc-slip') !== null) {
				this.slipper = document.querySelectorAll('.js-sc-slip');
				this.slipperData = [];
				this.setSlipperData();
			}
			registFnc.loop.push(this.onScroll);
			registFnc.onScroll.push(this.insistentRefresh);
		},
		
		/* slipperData に js-sc-slip の配置情報を記録する */
		setSlipperData: function() {
			this.isLock = true;
			let elm, ratio, clientRect;
			for (let i = this.slipper.length; i--;) {
				elm = this.slipper[i];
				clientRect = elm.getBoundingClientRect();
				ratio = elm.dataset.ratio !== undefined ? elm.dataset.ratio / 10 : this.ratioOrigin;
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
			ts.startY = ts.posY;
			
			/* isLock 時はパララックスしない */
			if (ts.isLock) {
				if (ts.friction !== 1) ts.friction = 1;
			} else {
				if (ts.friction !== ts.frictionOrigin) ts.friction = ts.frictionOrigin;
			}
			ts.cal();
			ts.positionSet();
			ts.startY = ts.posY;
		},
		cal: function() {
			const goalY = wm.yOffset;
			
			// 大元スクロールの位置
			this.posY += (goalY - this.posY) * this.friction;
			this.posY = Math.round(this.posY * 100) / 100;
			if (this.posY < 0.1) {
				this.posY = 0;
			} else if (this.posY > this.wrapperBtm - 0.1) {
				this.posY = this.wrapperBtm;
			}
			
			// ずれる要素の位置
			if (!ts.isLock && this.slipperData !== undefined) {
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
			if (ts.wrapper.clientHeight !== ts.dummyHeight) ts.refresh();
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
			this.btn = btn;
			for (let i = 0, len = btn.length; i < len; i++) {
				btn[i].addEventListener('click', this.toggleMenu);
			}
		},
		toggleMenu: function() {
			!dm.isOpened ? dm.openMenu() : dm.closeMenu();
			dm.menu.addEventListener('transitionend', dm.menuEnd);
		},
		openMenu: function() {
			this.isOpened = true;
			wm.posLock();
			this.menu.classList.add('is-active', 'is-anim');
			for (let i = 0, len = this.btn.length; i < len; i++) {
				this.btn[i].classList.add('is-active', 'is-anim');
				this.btn[i].addEventListener('animationend', e => {
					this.btn[i].classList.remove('is-anim');
				}, { once: true });
			}
		},
		closeMenu: function() {
			this.isOpened = false;
			wm.posUnlock();
			this.menu.classList.replace('is-active', 'is-anim');
			for (let i = 0, len = this.btn.length; i < len; i++) {
				this.btn[i].classList.replace('is-active', 'is-anim');
				this.btn[i].addEventListener('animationend', e => {
					this.btn[i].classList.remove('is-anim');
				}, { once: true });
			}
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
	 * .js-anc[href^="#"] をクリックでスムーススクロール
	 * as.toScroll('top');
	 -------------------------------------------------- */
	function anchorScroll() {
		if (document.querySelector('.js-anc') !== null || location.hash) as.constructor();
	}
	const as = {
		constructor: function() {
			registFnc.onResize.push(this.onResize);
			if (location.hash) {
				// URL に hash があったらスクロール
				setTimeout(function() {
					as.toScroll(location.hash.slice(1));
					history.replaceState('', document.title, window.location.pathname);
				}, 80);
			}
			this.SPF = 1000 / 60;
			this.duration = 1000;
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
			const yOffset = ts.wrapper !== undefined ? wm.yOffset - this.scPad : this.startPos - this.scPad;
			this.goalPos = targetId !== 'top' ? document.getElementById(targetId).getBoundingClientRect().top + yOffset : 0;
			//console.log(targetId, this.startPos, this.goalPos);
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
					cancelAnimationFrame(t.timer);
				});
			} else {
				this.wheel = function() {
					cancelAnimationFrame(t.timer);
				}
				if (window.addEventListener) { window.addEventListener('DOMMouseScroll', this.wheel, false); }
				window.onmousewheel = document.onmousewheel = this.wheel;
			}
		},
		/* easeInOutCubic ( https://easings.net/ ) */
		easing: function(x) {
			return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
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
			//console.log('-----> setupYouTube');
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
				ytid = ytElms[i].dataset.ytid;
// 				console.dir(ytElms[i]);
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
			//console.log('onPlay');
			const player = yt.player[this.dataset.player];
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
			this.intersectionObserver = new IntersectionObserver(function(entries) {
				for (let i = 0; i < entries.length; i++) {
					if (entries[i].intersectionRatio <= 0) continue;
					iv.doInview(entries[i].target);
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
		//console.log(style);
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