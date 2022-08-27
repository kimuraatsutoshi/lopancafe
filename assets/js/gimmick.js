/**
 * Mapping (parallax)
 -------------------------------------------------- */
export class SimpleMapping {
	constructor() {
		if (document.querySelector('.js-mapping') !== null) this.setup();
	}
	setup() {
		this.elm = document.getElementsByClassName('js-mapping')[0];
		this.fromMin = this.elm.getBoundingClientRect().bottom + window.pageYOffset;
		this.fromMax = this.elm.getBoundingClientRect().top + window.pageYOffset;
		LPN.registFnc.loop.push(() => {
			this.mapLoop();
		});
	}
	mapping(value, fromMin, fromMax, toMin, toMax) {
		const val = (value - fromMin) / (fromMax - fromMin) * (toMax - toMin) + toMin;
		return Math.max(Math.min(val, toMax), toMin);
	}
	mapLoop() {
		// pageYOffset が fromMax から fromMin まで変化する間に 1000 から 0 へ推移する
		const a = this.mapping(window.pageYOffset, this.fromMin, this.fromMax, 0, 1000);
		this.elm.style.opacity = a / 1000;
	}
}

/**
 * .js-sc-wrap 内のスクロールを transform: translate に置き換える (※scroll-behavior は auto にしておく)
 * <div class="js-sc-wrap">{コンテンツ}</div>
 * <div class="js-sc-slip">{ずれる要素}</div>
 -------------------------------------------------- */
export class TransformScroll {
	constructor() {
		if (document.querySelector('.js-sc-wrap') !== null) {
			LPN.Wm.html.classList.add('is-transformScroll');
			this.setup();
		}
	}
	setup() {
		if (!LPN.isTouch) {
			document.body.insertAdjacentHTML('beforeend', '<div class="js-sc-dummy"></div>');
			this.dummy = document.getElementsByClassName('js-sc-dummy')[0];
			this.wrapper = document.getElementsByClassName('js-sc-wrap')[0];
			this.wrapper.classList.add('js-fixed');
			
			// this.isSmooth = getComputedStyle(document.documentElement).scrollBehavior === 'smooth';
			
			this.frictionOrigin = 10 / 100;
			this.ratioOrigin = 100 / 10;
			this.friction = this.frictionOrigin;
			this.initialize();
			this.refresh();
		}
	}
	initialize() {
		this.startY = LPN.Wm.yOffset;
		this.posY = this.startY;
		
		// js-sc-slip があったら slipperData をつくる
		if (document.querySelector('.js-sc-slip') !== null) {
			this.slipper = document.querySelectorAll('.js-sc-slip');
			this.slipperData = [];
			this.setSlipperData();
		}
		LPN.registFnc.loop.push(() => {
			this.onScroll();
		});
		LPN.registFnc.onMainResize.push(() => {
			this.refresh();
		});
	}
	// slipperData に js-sc-slip の配置情報を記録する
	setSlipperData() {
		this.isLock = true;
		// if (this.isSmooth) document.documentElement.style.scrollBehavior = 'auto';
		
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
		//console.log(this.slipperData);
		
		// if (this.isSmooth) document.documentElement.style.scrollBehavior = 'smooth';
		this.isLock = false;
	}
	// 以下を loop で requestAnimationFrame する
	onScroll() {
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
	}
	cal() {
		const goalY = LPN.Wm.yOffset;
		
		// 大元スクロールの位置
		this.posY += (goalY - this.posY) * this.friction;
		this.posY = Math.round(this.posY * 100) / 100;
		if (this.posY < 0.1) {
			this.posY = 0;
		} else if (this.posY > this.wrapperBtm - 0.1) {
			this.posY = this.wrapperBtm;
		}
		
		// ずれる要素の位置
		if (!this.isLock && this.slipperData !== undefined) {
			let data;
			const diff = LPN.Wm.winH / 2;
			for (var i = this.slipper.length; i--;) {
				data = this.slipperData[i];
				data.posY += (goalY + diff - data.posY) * (this.friction * 0.8);
				data.posY = Math.round(data.posY * 100) / 100;
			}
		}
		//console.log(this.posY);
	}
	positionSet() {
		// 大元スクロールの位置
		this.wrapper.style.transform = `translate3d(0,-${this.posY}px,0)`;
		
		// ずれる要素の位置
		if (this.slipperData !== undefined) {
			let data, pos;
			for (var i = this.slipper.length; i--;) {
				data = this.slipperData[i];
				pos = Math.round((data.posY - data.position) * 100) / 100;
				this.slipper[i].style.transform = `translate3d(0,${pos / data.ratio}px,0)`;
			}
		}
	}
	// ダミー要素の高さをコンテンツと揃える
	refresh() {
		// console.log('refresh')
		const wrapperHeight = this.wrapper.clientHeight;
		this.wrapperBtm = wrapperHeight - window.innerHeight;
		this.dummy.style.height = wrapperHeight + 'px';
		this.dummyHeight = this.dummy.clientHeight;
		//console.log(this.wrapper.clientHeight, this.dummyHeight)
	}
}

/**
 * in-view
 * <ul class="js-inview" data-last=":last-child"></ul>
 * <ul class="js-inview" data-anim="animationName"></ul>
 * -------------------------------------------------- */
export class InviewEffect {
	constructor(elm) {
		const container = !elm ? document : elm;
		if (container.querySelector('.js-inview') !== null) this.init(container);
	}
	init(c) {
		const elms = c.getElementsByClassName('js-inview');
		if (self.IntersectionObserver !== undefined) {
			this.inview(elms);
		} else {
			for (let i = 0; i < elms.length; i++) {
				elms[i].classList.add('is-inview');
				elms[i].classList.remove('js-inview');
			}
		}
	}
	inview(elms) {
		this.intersectionObserver = new IntersectionObserver(entries => {
			for (let i = 0; i < entries.length; i++) {
				if (entries[i].intersectionRatio <= 0) continue;
				this.doInview(entries[i].target);
			}
		}, {
			root: null,
			rootMargin: '0px',
			threshold: [0.3, 0.7]
		});
		for (let i = 0; i < elms.length; i++) {
			this.intersectionObserver.observe(elms[i]);
		}
	}
	doInview(el) {
		if (!el.isInview) {
			el.isInview = 1;
			if (el.dataset.anim !== undefined) {
				el.addEventListener('animationend', e => {
					this.animationEnd(el, e);
				}, { once: true });
				
			} else if (el.dataset.last !== undefined) {
				el.addEventListener('transitionend', e => {
					this.lastElmEnd(el, e);
				}, { once: true });
				
			} else {
				el.addEventListener('transitionend', e => {
					this.transitionendEnd(el, e);
				}, { once: true });
			}
			el.classList.add('is-anim');
			el.classList.add('is-inview');
		}
	}
	animationEnd(el, e) {
		if (e.animationName === el.dataset.anim) {
			el.classList.remove('is-anim', 'js-inview');
			el.removeAttribute('data-anim');
		}
	}
	lastElmEnd(el, e) {
		if (e.target === el.querySelector(el.dataset.last)) {
			el.classList.remove('is-anim', 'js-inview');
			el.removeAttribute('data-last');
		} else {
			el.addEventListener('transitionend', e => {
				this.lastElmEnd(el, e);
			}, { once: true });
		}
	}
	transitionendEnd(el, e) {
		if (e.target === el) {
			el.classList.remove('is-anim', 'js-inview');
		} else {
			el.addEventListener('transitionend', e => {
				this.transitionendEnd(el, e);
			}, { once: true });
		}
	}
}

/**
 * lazy image
 * <img data-src="path.jpg" alt="" width="w" height="h">
 * -------------------------------------------------- */
export class LazyImage {
	constructor(elm) {
		const container = !elm ? document : elm;
		if (container.querySelector('[data-src]') !== null) {
			if (typeof Flickity !== undefined) {
				this.init(container);
				
			} else {
				this.loadAPI();
				document.addEventListener('readystatechange', e => {
					this.init(container);
				});
			}
		}
	}
	loadAPI() {
		let tag = document.createElement('script');
		tag.src = 'https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js';
		let firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}
	init(c) {
		const imgs = c.querySelectorAll('img[data-src]');
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
	}
	lazy(imgs) {
		this.intersectionObserver = new IntersectionObserver(entries => {
			for (let i = 0; i < entries.length; i++) {
				if (entries[i].intersectionRatio <= 0) continue;
				this.doLazy(entries[i].target);
			}
		}, {
			root: null,
			rootMargin: '0px',
			threshold: [0, 0.5]
		});
		for (let i = 0; i < imgs.length; i++) {
			this.intersectionObserver.observe(imgs[i]);
		}
	}
	doLazy(el) {
		imagesLoaded(el, el => {
			this.loaded(el);
		});
		el.src = el.dataset.src;
		this.intersectionObserver.unobserve(el);
	}
	loaded(el) {
		el.elements[0].classList.add('is-anim', 'is-loaded');
		el.elements[0].addEventListener('transitionend', e => {
			this.loadedEnd(e.target);
		}, { once: true });
	}
	loadedEnd(el) {
		el.classList.remove('is-anim');
		el.removeAttribute('data-src');
	}
}

/**
 * MagneticButton
 -------------------------------------------------- */
export class MagneticButton {
	constructor() {
		if (!LPN.isTouch && document.querySelector('.js-mgntc') !== null) this.setup();
	}
	setup() {
		this.winsize = this.calcWinsize();
		this.cursorpos = { x: 0, y: 0 };
		window.addEventListener('resize', this.resetData);
		window.addEventListener('mousemove', e => {
			this.cursorpos = { x: e.clientX, y: e.clientY };
		});
		this.btnsData = {};
		
		const btns = document.getElementsByClassName('js-mgntc');
		for (let i = 0, len = btns.length; i < len; i++) {
			btns[i].dataset.mg = 'btn-' + (i + 1);
			btns[i].innerHTML = '<span class="text">' + btns[i].innerHTML + '</span>';
			this.setData(btns[i], 'btn-' + (i + 1));
			btns[i].addEventListener('mouseenter', this.enter);
			btns[i].addEventListener('mouseleave', this.leave);
		}
		//console.log(this.btnsData);
		this.loop();
		setTimeout(this.resetData, 1000);
	}
	setData(btn, id) {
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
	}
	resetData() {
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
			//console.log(i, this.btnsData[i].rect.top);
		}
	}
	lerp(a, b, n) {
		return (1 - n) * a + n * b;
	}
	calcWinsize() {
		return { width: window.innerWidth, height: window.innerHeight };
	}
	distance(x1, y1, x2, y2) {
		const a = x1 - x2;
		const b = y1 - y2;
		return Math.hypot(a, b);
	}
	loop() {
		for (let i in this.btnsData) {
			this.render(this.btnsData[i]);
		}
		requestAnimationFrame(this.loop);
	}
	enter(e) {
		this.btnsData[this.dataset['mg']].isHov = true;
	}
	leave(e) {
		this.btnsData[this.dataset['mg']].isHov = false;
	}
	render(data) {
		//if (data.isHov) console.log(data.el.dataset['mg']);
		let x = 0, y = 0;
		
		// カーソルからボタンの中心までの距離
		const distanceMouseButton = this.distance(
			this.cursorpos.x + window.scrollX,
			this.cursorpos.y + window.scrollY,
			data.rect.left + data.rect.width / 2,
			data.rect.top + data.rect.height / 2
		);
		if (distanceMouseButton < data.distanceToTrigger) {
			x = (this.cursorpos.x + window.scrollX - (data.rect.left + data.rect.width / 2)) * .3;
			y = (this.cursorpos.y + window.scrollY - (data.rect.top + data.rect.height / 2)) * .3;
		}
		data.renderedStyles['tx'].cur = x;
		data.renderedStyles['ty'].cur = y;
		
		for (let key in data.renderedStyles) {
			data.renderedStyles[key].pre = this.lerp(
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
}