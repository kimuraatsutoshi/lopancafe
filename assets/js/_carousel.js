import { AfterLoadedJs, AfterLoadedCss } from './_utility.js';
import { scrollend } from './_scrollyfills.modern.js'

/**
 * スクロールカルーセル
 * 参考: https://web.dev/patterns/components/carousel/
 -------------------------------------------------- */
export class Carousel {
	constructor(elm) {
		this.setup(elm);
	}
	setup(elm) {
		const container = elm.getElementsByClassName('carousel_container')[0];
		const rell = elm.getElementsByClassName('carousel_reel')[0];
		this.carouselData = {
			root: elm,
			container: container,
			reel: rell,
			items: rell.children,
			prev: null,
			next: null,
			pagination: null,
			curIndex: 0,
			cur: undefined
		};
		// console.log(this.carouselData);
		
		this.hasIntersected = new Set();
		this.carouselData.root.tabIndex = -1;
		this.carouselData.root.setAttribute('aria-roledescription', 'Carousel');
		for (let i = 0, len = this.carouselData.items.length; i < len; i++) {
			this.carouselData.items[i].id = `item-${i + 1}`;
		}
		this.createControls();
		this.createPagination();
		
		this.createObservers();
		this.initialize();
		this.addListener();
		this.refresh();
	}
	createObservers() {
		// カルーセル画像の要素への出入りを監視する
		this.carouselObserver = new IntersectionObserver(observations => {
			for (let observation of observations) {
				this.hasIntersected.add(observation);
				observation.target.classList.toggle('is-active', observation.isIntersecting);
				
				// dots クリック以外はすぐに反映
				if (!this.isPagination) this.refresh();
			}
		}, {
			root: this.carouselData.container,
			threshold: .6,
		});
		// DOM ツリーが変更されたことを監視する
		this.mutationObserver = new MutationObserver((mutationList, observer) => {
			mutationList
			.filter(x => x.removedNodes.length > 0)
			.forEach(mutation => {
				[...mutation.removedNodes]
				.filter(x => x.querySelector('.js-carousel') === this.carouselData.root)
				.forEach(removedEl => {
					this.removeListener();
				});
			});
		});
	}
	initialize() {
		this.carouselData.cur = this.carouselData.items[this.carouselData.curIndex];
		
		let child = null;
		for (let i = 0, len = this.carouselData.items.length; i < len; i++) {
			child = this.carouselData.items[i];
			this.hasIntersected.add({
				isIntersecting: i === 0,
				target: child
			});
			this.carouselData.pagination.insertAdjacentHTML('beforeend', this.returnDot(child, i));
			child.ariaLabel = `${i + 1} of ${this.carouselData.items.length}`;
			child.setAttribute('aria-roledescription', 'item');
		}
	}
	addListener() {
		// observe children intersection
		for (let item of this.carouselData.items) {
			this.carouselObserver.observe(item);
		}
		// watch document for removal of this carousel node
		this.mutationObserver.observe(document, {
			childList: true,
			subtree: true
		});
		// scrollend listener for sync
		this.carouselData.container.addEventListener('scrollend', this.refresh.bind(this))
		this.carouselData.next.addEventListener('click', this.goNext.bind(this))
		this.carouselData.prev.addEventListener('click', this.goPrev.bind(this))
		this.carouselData.pagination.addEventListener('click', this.handlePaginate.bind(this))
		this.carouselData.root.addEventListener('keydown', this.handleKeydown.bind(this))
	}
	removeListener() {
		for (let item of this.carouselData.items) {
			this.carouselObserver.unobserve(item);
		}
		this.mutationObserver.disconnect();
		this.carouselData.container.removeEventListener('scrollend', this.refresh);
		this.carouselData.next.removeEventListener('click', this.goNext);
		this.carouselData.prev.removeEventListener('click', this.goPrev);
		this.carouselData.pagination.removeEventListener('click', this.handlePaginate);
		this.carouselData.root.removeEventListener('keydown', this.handleKeydown);
	}
	
	// スクロール終わり
	refresh() {
		for (let observation of this.hasIntersected) {
			observation.target.inert = !observation.isIntersecting;
			
			this.carouselData.curIndex = this._getElementIndex(observation.target);
			const dot = this.carouselData.pagination.children[this.carouselData.curIndex];
			dot.ariaSelected = observation.isIntersecting;
			dot.tabIndex = !observation.isIntersecting ? -1 : 0;
			
			if (observation.isIntersecting) {
				dot.classList.add('is-active');
				this.carouselData.cur = observation.target;
				this.goToElement({
					scrollport: this.carouselData.pagination,
					element: dot
				});
			} else {
				this.isPagination = false;
				dot.classList.remove('is-active');
			}
		}
		this.refreshArrows();
		this.hasIntersected.clear();
	}
	refreshArrows() {
		const {lastElementChild:last, firstElementChild:first} = this.carouselData.reel;
		const isAtEnd = this.carouselData.cur === last;
		const isAtStart = this.carouselData.cur === first;
		
		if (document.activeElement === this.carouselData.next && isAtEnd) {
			this.carouselData.prev.focus();
		} else if (document.activeElement === this.carouselData.prev && isAtStart) {
			this.carouselData.next.focus();
		}
		this.carouselData.next.disabled = isAtEnd;
		this.carouselData.prev.disabled = isAtStart;
	}
	
	goNext() {
		const next = this.carouselData.cur.nextElementSibling;
		if (this.carouselData.cur === next) return;
		if (next) {
			this.goToElement({
				scrollport: this.carouselData.container,
				element: next
			})
			this.carouselData.cur = next;
		}
	}
	goPrev() {
		const prev = this.carouselData.cur.previousElementSibling;
		if (this.carouselData.cur === prev) return;
		if (prev) {
			this.goToElement({
				scrollport: this.carouselData.container,
				element: prev
			})
			this.carouselData.cur = prev;
		}
	}
	goToElement(e) {
		const dir = this._documentDirection();
		const delta = Math.abs(e.scrollport.offsetLeft - e.element.offsetLeft);
		const scrollerPadding = parseInt(getComputedStyle(e.scrollport)['padding-left']);
		const pos = e.scrollport.clientWidth / 2 > delta ? delta - scrollerPadding : delta + scrollerPadding;
		e.scrollport.scrollTo(dir === 'ltr' ? pos : pos * -1, 0);
		// console.log(pos);
	}
	_documentDirection() {
		return document.firstElementChild.getAttribute('dir') || 'ltr';
	}
	_getElementIndex(element) {
		let index = 0
		while (element = element.previousElementSibling) index++
		return index
	}
	
	// dots をクリック
	handlePaginate(e) {
		if (e.target.classList.contains('pagination')) return;
		this.isPagination = true;
		
		this.carouselData.pagination.children[this.carouselData.curIndex].classList.remove('is-active');
		e.target.classList.add('is-active');
		e.target.ariaSelected = true;
		const item = this.carouselData.items[this._getElementIndex(e.target)];
		this.goToElement({
			scrollport: this.carouselData.container,
			element: item
		});
	}
	
	// 矢印キーを押下
	handleKeydown(e) {
		const dir = this._documentDirection();
		const idx = this._getElementIndex(e.target);
		switch (e.key.toLowerCase()) {
			case 'arrowright':
				e.preventDefault();
				
				if (e.target.closest('.pagination')) {
					const nextOffset = dir === 'ltr' ? 1 : -1;
					const nextDot = this.carouselData.pagination.children[idx + nextOffset];
					this.keypressAnimation(nextDot);
					nextDot?.focus();
					
				} else {
					const nextControl = dir === 'ltr' ? this.carouselData.next : this.carouselData.prev;
					if (document.activeElement === nextControl) {
						this.keypressAnimation(nextControl);
					}
					nextControl.focus();
				}
				dir === 'ltr' ? this.goNext() : this.goPrev();
			break;
			case 'arrowleft':
				e.preventDefault();
				
				if (e.target.closest('.pagination')) {
					const prevOffset = dir === 'ltr' ? -1 : 1;
					const prevDot = this.carouselData.pagination.children[idx + prevOffset];
					this.keypressAnimation(prevDot);
					prevDot?.focus();
					
				} else {
					const prevControl = dir === 'ltr' ? this.carouselData.prev : this.carouselData.next;
					if (document.activeElement === prevControl) {
						this.keypressAnimation(prevControl);
					}
					prevControl.focus();
				}
				dir === 'ltr' ? this.goPrev() : this.goNext();
			break;
		}
	}
	keypressAnimation(element) {
		if (element) {
			element.style.animation = 'keypressAnim .4s cubic-bezier(.3,1,.7,1)';
			element.addEventListener('animationend', e => {
				element.style.animation = null;
			}, { once: true });
		}
	}
	
	returnDot(item, index) {
		let title = index;
		if (item.querySelector('.title') !== null) {
			title = item.getElementsByClassName('title')[0].textContent;
		}
		let dot = `<button type="button" class="dot" role="tab"`;
		dot += ` aria-label="${title}"`;
		dot += ` aria-setsize="${this.carouselData.items.length}"`;
		dot += ` aria-posinset="${index}"`;
		dot += ` aria-controls="item-${index}"></button>`;
		return dot;
	}
	createPagination() {
		this.carouselData.root.insertAdjacentHTML('beforeend', '<nav class="carousel_pagination"></nav>');
		this.carouselData.pagination = this.carouselData.root.getElementsByClassName('carousel_pagination')[0];
	}
	createControls() {
		let arrows = '<div class="carousel_arrows">';
		arrows += '<button type="button" class="carousel_arrow -prev" aria-label="Previous">';
		arrows += '<svg width="24" height="24" viewBox="0 0 24 24" class="arr"><path d="M17.5,21L6.5,12,17.5,3"/></svg>';
		arrows += '</button>';
		arrows += '<button type="button" class="carousel_arrow -next" aria-label="Next">';
		arrows += '<svg width="24" height="24" viewBox="0 0 24 24" class="arr"><path d="M6.5,3l11,9L6.5,21"/></svg>';
		arrows += '</button>';
		arrows += '</div>';
		this.carouselData.root.insertAdjacentHTML('beforeend', arrows);
		this.carouselData.prev = this.carouselData.root.getElementsByClassName('-prev')[0];
		this.carouselData.next = this.carouselData.root.getElementsByClassName('-next')[0];
	}
}

/**
 * Flickity.js
 * https://unpkg.com/flickity@2/dist/flickity.pkgd.min.js
 -------------------------------------------------- */
export class FlickitySlider {
	constructor() {
		if (typeof Flickity !== 'undefined') {
			this.init();
		} else {
			this.loadAPI();
		}
		if (document.querySelector('link[href*="/flickity."]') === null) {
			this.loadCss();
		}
	}
	loadAPI() {
		new AfterLoadedJs('https://unpkg.com/flickity@2/dist/flickity.pkgd.min.js').then(
		resolve => {
			document.addEventListener('readystatechange', e => {
				console.log(resolve, e.target.readyState);
				this.init();
			});
		},
		error => {
			console.log(error.message);
		});
	}
	loadCss() {
		new AfterLoadedCss(`${LPN.Rp.returnRootPath()}assets/css/flickity.css`).then(
		resolve => {
			console.log('readystatechange:', resolve);
		},
		error => {
			console.log(error.message);
		});
	}
	init() {
		this.flkty = {};
		const elm = document.getElementsByClassName('js-slider');
		let count = 0;
		for (let i = 0, len = elm.length; i < len; i++) {
			count++;
			this.setup(elm[i], `slider-${count}`);
		}
	}
	setup(elm, id) {
		const opt = {
			group: elm.dataset.group ? parseInt(elm.dataset.group) : true, // {number}
			lock: elm.dataset.lock === undefined,
			loop: elm.dataset.loop !== undefined,
			auto: elm.dataset.auto ? parseInt(elm.dataset.auto) : false, // {number}
			cell: elm.dataset.cell ? elm.dataset.cell : false, // {strings}
			arrow: elm.dataset.arrow !== undefined,
			dots: elm.dataset.dots !== undefined
		};
		// console.log(opt);
		let arg = {
			contain: true,
			groupCells: opt.group,
			draggable: opt.lock,
			wrapAround: opt.loop,
			autoPlay: opt.auto,
			cellSelector: opt.cell,
			prevNextButtons: opt.arrow,
			pageDots: opt.dots,
			arrowShape: 'M65,90L25,50,65,10'
		};
		if (opt.auto) {
			arg.on = {
				change: function() {
					this.stopPlayer();
				},
				settle: function() {
					this.playPlayer();
				}
			}
		}
		this.flkty[id] = new Flickity(elm, arg);
	}
}
