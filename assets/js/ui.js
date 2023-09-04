import { VideoControls, YouTubeIframeApi } from './_video.js';
import { Carousel, FlickitySlider } from './_carousel.js';
import { GoogleMapsApi } from './_googlemap.js?v=1';
import { FetchAjax } from './_utility.js';

/**
* UI
* AccordionUi
* DrawerMenu
* InsertShareLink
* PulldownUi
* PullmenuUi
* SmoothScrolling
* TextCopy
-------------------------------------------------- */
export class UiBundle {
	constructor() {
		if (document.querySelector('.js-accordion') !== null) {
			new AccordionUi();
		}
		if (document.querySelector('.js-menuToggle') !== null) {
			new DrawerMenu();
		}
		if (document.querySelector('.c-share') !== null) {
			const shareElms = document.getElementsByClassName('c-share');
			for (let el of shareElms) {
				new InsertShareLink(el);
			}
		}
		if (document.querySelector('.js-pullContent') !== null) {
			new PulldownUi();
		}
		if (document.querySelector('.c-pullmenu') !== null) {
			new PullmenuUi();
		}
		if (document.querySelector('.js-smoothscroll') !== null) {
			new SmoothScrolling();
		}
		if (document.querySelector('.js-copy') !== null) {
			const copyElms = document.getElementsByClassName('js-copy');
			for (let el of copyElms) {
				new TextCopy(el);
			}
		}
		
		// VideoControls, YouTubeIframeApi
		if (document.querySelector('.js-video') !== null) {
			new VideoControls();
		}
		if (document.querySelector('.js-yt') !== null) {
			new YouTubeIframeApi();
		}
		
		// FlickitySlider, Carousel
		if (document.querySelector('.js-slider') !== null) {
			new FlickitySlider();
		}
		if (document.querySelector('.js-carousel') !== null) {
			const carouselElms = document.getElementsByClassName('js-carousel');
			for (let el of carouselElms) {
				new Carousel(el);
			}
		}
		
		// GoogleMapsApi
		if (document.querySelector('.js-gm') !== null) {
			const APIkey =  new FetchAjax('../../assets/apikey.txt', data => {
				new GoogleMapsApi(data);
			}, 'text');
		}
	}
}

/**
* アコーディオン UI
* MEMO: 閉じてる時にブラウザで文字列検索しても開かない問題は未解決
-------------------------------------------------- */
class AccordionUi {
	constructor() {
		this.accData = {};
		const elm = document.getElementsByClassName('js-accordion');
		let count = 0;
		for (let i = 0, len = elm.length; i < len; i++) {
			count++;
			this.setup(`acc-${count}`, elm[i]);
		}
		this.refresh();
		
		window.addEventListenr('mainresized', () => {
			this.refresh();
		});
	}
	setup(id, elm) {
		const head = elm.getElementsByClassName('acc_head')[0];
		const body = elm.getElementsByClassName('acc_body')[0];
		this.accData[id] = {
			isOpen: true,
			container: elm,
			head: head,
			body: body,
			headHeight: head.getBoundingClientRect().height,
			elmHeight: head.getBoundingClientRect().height + body.getBoundingClientRect().height
		}
		
		// ARIA: head と body を関連づける
		head.setAttribute('aria-controls', id);
		body.id = id;
		head.tabIndex = 0;
		
		// ARIA: head をクリックすると body が開くことを知らせる
		head.insertAdjacentHTML('beforeend', '<svg width="24" height="24" viewBox="0 0 24 24" class="ico"><path d="M22,6l-10,12L2,6"/></svg>');
		head.ariaLabel = '開く';
		head.ariaExpanded = 'false'; // 対象の body は開かれているかどうか
		body.ariaHidden = 'true'; // 閉じているかどうか
		
		head.addEventListener('click', () => {
			this.toggleAcc(id, true);
		});
		head.addEventListener('keypress', e => {
			e.preventDefault();
			if (e.code.toLowerCase() === 'space' || e.code.toLowerCase() === 'enter') {
				this.toggleAcc(id, true);
			}
		});
		this.closeAcc(id, false);
	}
	toggleAcc(id, anim) {
		if (!this.accData[id].isAnim) {
			!this.accData[id].isOpen ? this.openAcc(id, anim) : this.closeAcc(id, anim);
		}
	}
	openAcc(id, anim) {
		this.accData[id].isOpen = true;
		if (anim) {
			this.addAnim(id);
		}
		this.accData[id].container.style.height = `${this.accData[id].elmHeight}px`;
		
		// ARIA: 対象の body が開いたことを知らせる
		this.accData[id].head.ariaLabel = '閉じる';
		this.accData[id].head.ariaExpanded = 'true';
		this.accData[id].body.ariaHidden = 'false';
	}
	closeAcc(id, anim) {
		this.accData[id].isOpen = false;
		if (anim) {
			this.addAnim(id);
		}
		this.accData[id].container.style.height = `${this.accData[id].elmHeight}px`;
		setTimeout(() => {
			this.accData[id].container.style.height = `${this.accData[id].headHeight}px`;
			
			// ARIA: 対象の body が閉じたことを知らせる
			this.accData[id].head.ariaLabel = '開く';
			this.accData[id].head.ariaExpanded = 'false';
			this.accData[id].body.ariaHidden = 'true';
		}, 60);
	}
	addAnim(id) {
		this.accData[id].isAnim = true;
		if (this.accData[id].isOpen) {
			this.accData[id].head.classList.add('is-active', 'is-anim');
		} else {
			this.accData[id].head.classList.replace('is-active', 'is-anim');
		}
		this.accData[id].head.addEventListener('transitionend', e => {
			this.accData[id].head.classList.remove('is-anim');
		}, { once: true });
		
		this.accData[id].container.classList.add('is-anim');
		this.accData[id].container.addEventListener('transitionend', e => {
			this.accData[id].isAnim = false;
			this.accData[id].container.classList.remove('is-anim');
			if (this.accData[id].isOpen) {
				this.accData[id].container.removeAttribute('style');
			}
		}, { once: true });
	}
	refresh() {
		let head, body;
		for (let id in this.accData) {
			head = this.accData[id].head;
			body = this.accData[id].body;
			this.accData[id].headHeight = head.getBoundingClientRect().height;
			this.accData[id].elmHeight = head.getBoundingClientRect().height + body.getBoundingClientRect().height;
			if (!this.accData[id].isOpen) {
				this.accData[id].container.style.height = `${this.accData[id].headHeight}px`;
			}
		}
	}
}

/**
* ドロワーメニュー
-------------------------------------------------- */
class DrawerMenu {
	constructor() {
		this.btn = document.getElementsByClassName('l-drawer')[0];
		this.menu = document.getElementsByClassName('l-menu')[0];
		
		this.toggle = document.getElementsByClassName('js-menuToggle');
		
		this.overlay = this.menu.getElementsByClassName('overlay')[0];
		this.container = this.menu.getElementsByClassName('container')[0];
		this.menuList = this.menu.getElementsByClassName('menu');
		this.menuItems = this.menu.getElementsByTagName('li');
		
		this.menuLinks = this.menu.querySelectorAll('a[href]');
		this.relation = this.menu.querySelectorAll('.overlay, .container');
		
		// is-active, is-anim を付与する要素たち
		this.elms = Object.setPrototypeOf([...this.menuLinks, ...this.relation], NodeList.prototype);
		
		this.init();
	}
	init() {
		// メニュー内リンクに data-index 付与 (Firefox でもタブ移動する用)
		this.menuLinks.forEach((link, index) => {
			link.dataset.index = index;
		});
		
		// メニューボタンは animationend で終わり
		this.btn.addEventListener('animationend', e => {
			e.currentTarget.classList.remove('is-anim');
		});
		
		// ARIA: svg は読み上げない
		for (let bar of this.btn.children) {
			// Firefox で ariaHidden = true で設定できない
			bar.setAttribute('aria-hidden', true);
		}
		
		// ARIA: js-menu をクリクするとナビゲーションが開くことを知らせる
		const id = 'navigation';
		for (let toggle of this.toggle) {
			toggle.addEventListener('click', () => {
				this.toggleMenu();
			});
			toggle.setAttribute('aria-controls', id);
			toggle.setAttribute('aria-label', 'ナビゲーションを開く');
			toggle.setAttribute('aria-expanded', false); // 対象の menu が開かれているかどうか
		}
		this.menu.id = id;
		this.menu.setAttribute('aria-hidden', true); // 閉じているかどうか
		
		// 最初は tab 移動させない
		document.addEventListener('readystatechange', e => {
			for (let link of this.menuLinks) {
				link.tabIndex = -1;
			}
		}, { once: true });
		
		this.keyShifted = false;
		this.tabFocusControl();
		this.menuAnchor();
	}
	menuAnchor() {
		// menu 内のリンククリックで閉じる
		for (let link of this.menuLinks) {
			link.addEventListener('click', () => {
				this.closeMenu();
			});
		}
	}
	toggleMenu() {
		if (!this.isAnim) {
			this.isAnim = true;
			!this.isOpened ? this.openMenu() : this.closeMenu();
		}
	}
	openMenu() {
		this.menu.classList.add('is-active');
		const menuOpen = new Event('menuopen');
		window.dispatchEvent(menuOpen);
		
		this.btn.classList.add('is-active', 'is-anim');
		for (let elm of this.elms) {
			elm.classList.add('is-active', 'is-anim');
			elm.addEventListener('transitionend', e => {
				elm.classList.remove('is-anim');
			}, { once: true });
		}
		
		// コンテナのアニメーションが終わったら終わりを告げる
		this.container.addEventListener('transitionend', () => {
			this.isAnim = false;
			this.isOpened = true;
			const menuOpened = new Event('menuopened');
			window.dispatchEvent(menuOpened);
		}, { once: true });

		// ARIA: ナビゲーションが開いたことを知らせる
		this.menu.setAttribute('aria-hidden', false);
		this.toggleEnd('閉じる');

		for (let i = 0, len = this.menuLinks.length; i < len; i++) {
			this.menuLinks[i].tabIndex = 0;
		}
	}
	closeMenu(fn) {
		this.btn.classList.replace('is-active', 'is-anim');
		for (let elm of this.elms) {
			elm.classList.replace('is-active', 'is-anim');
			elm.addEventListener('transitionend', e => {
				elm.classList.remove('is-anim');
			}, { once: true });
		}
		
		// オーバーレイのアニメーションが終わったら終わりを告げる
		this.overlay.addEventListener('transitionend', () => {
			this.isAnim = false;
			this.isOpened = false;
			
			this.menu.classList.remove('is-active');
			const menuClosed = new Event('menuclosed');
			window.dispatchEvent(menuClosed);
		}, { once: true });

		// ARIA: ナビゲーションが閉じたことを知らせる
		this.menu.setAttribute('aria-hidden', true);
		this.toggleEnd('開く');

		// ≡ btn へフォーカス
		this.btn.focus({ focusVisible: false });
		for (let i = 0, len = this.menuLinks.length; i < len; i++) {
			this.menuLinks[i].tabIndex = -1;
		}
		
		const menuClose = new Event('menuclose');
		window.dispatchEvent(menuClose);
	}
	toggleEnd(str) {
		// ARIA: ナビゲーションの開閉を知らせる
		for (let i = 0, len = this.toggle.length; i < len; i++) {
			const toggle = str === '閉じる' ? 'add' : 'replace';
			const expanded = str === '閉じる' ? 'true' : 'false';
			this.toggle[i].classList[toggle]('is-active', 'is-anim');
			this.toggle[i].setAttribute('aria-label', `ナビゲーションを${str}`);
			this.toggle[i].setAttribute('aria-expanded', expanded);
		}

		// ≡ btn は animationend をきっかけに remove
		this.btn.addEventListener(
			'animationend',
			(e) => {
				this.btn.classList.remove('is-anim');
			},
			{ once: true }
		);

		// overlay は transitionend をきっかけに remove
		this.overlay.addEventListener(
			'transitionend',
			(e) => {
				this.overlay.classList.remove('is-anim');
			},
			{ once: true }
		);
	}
	// モーダルが開いている間、tab でのフォーカスをモーダル内に閉じ込める
	tabFocusControl() {
		document.addEventListener('keydown', (e) => {
			if (e.code.toLowerCase().startsWith('shift')) this.keyShifted = true;
			if (this.isOpened) {
				
				// 最初のリンクが display: none ならふたつめのリンクが最初のリンク
				this.firstLink = this.menuLinks[0];
				if (getComputedStyle(this.menuLinks[0].parentNode).display === 'none') {
					this.firstLink = this.menuLinks[1];
				}
				if (e.code.toLowerCase() === 'tab') {
					if (this.keyShifted) {
						this.keyBack(e);
					} else {
						this.keyNext(e);
					}
				}
				// スペースキーはクリックとする
				else if (e.code.toLowerCase() === 'space') {
					e.preventDefault();
					e.target.click();
				}
				// ページスクロールは無効にする
				else if (e.code.toLowerCase() === 'pageup' || e.code.toLowerCase() === 'pagedown' || e.code.toLowerCase() === 'home' || e.code.toLowerCase() === 'end') {
					e.preventDefault();
				}
				// 矢印キーは tab と同じ挙動にする
				else if (e.code.toLowerCase() === 'arrowup' || e.code.toLowerCase() === 'arrowleft') {
					e.preventDefault();
					this.keyBack(e);
				}
				else if (e.code.toLowerCase() === 'arrowdown' || e.code.toLowerCase() === 'arrowright') {
					e.preventDefault();
					this.keyNext(e);
				}
			}
		});
		document.addEventListener('keyup', (e) => {
			if (e.code.toLowerCase().startsWith('shift')) this.keyShifted = false;
		});
	}
	keyBack(e) {
		e.preventDefault();
		if (e.target === this.firstLink) {
			// フォーカスしてるのが、メニュー内の最初のリンクなら、≡ btn にフォーカス
			this.btn.focus({ focusVisible: true });
		}
		else if (e.target === this.btn) {
			// ≡ btn なら最後のリンクにフォーカス
			this.menuLinks[this.menuLinks.length - 1].focus({ focusVisible: true });
		}
		else {
			// それ以外は前のリンクにフォーカス
			if (e.target.dataset.index) {
				const index = parseInt(e.target.dataset.index) - 1;
				this.menuLinks[index].focus({ focusVisible: true });
			} else {
				// 違うとこにあったら強制的にメニュー内に戻す
				this.btn.focus({ focusVisible: true });
			}
		}
	}
	keyNext(e) {
		e.preventDefault();
		if (e.target === this.menuLinks[this.menuLinks.length - 1]) {
			// フォーカスしてるのが、メニュー内の最後のリンクなら、≡ btn にフォーカス
			this.btn.focus({ focusVisible: true });
		}
		else if (e.target === this.btn) {
			// ≡ btn なら最初のリンクにフォーカス
			this.firstLink.focus({ focusVisible: true });
		}
		else {
			// それ以外は次のリンクにフォーカス
			if (e.target.dataset.index) {
				const index = parseInt(e.target.dataset.index) + 1;
				this.menuLinks[index].focus({ focusVisible: true });
			} else {
				// 違うとこにあったら強制的にメニュー内に戻す
				this.btn.focus({ focusVisible: true });
			}
		}
	}
}

/**
* シェアする
* <ul class="c-share">
* <li data-share="twitter">ツイートする</li>
* -------------------------------------------------- */
class InsertShareLink {
	constructor(elm) {
		const links = elm.querySelectorAll('[data-share]');
		let data = {};
		for (let i = 0, len = links.length; i < len; i++) {
			data = this.returnUrl(links[i]);
			links[i].innerHTML = `<a href="${data.href}" title="${data.title}" rel="noopener" target="_blank">${links[i].innerHTML}</a>`;
			links[i].removeAttribute('data-share');
		}
	}
	returnUrl(link) {
		let data = {};
		link.classList.add(link.dataset.share);
		const url = location.href;
		const title = document.querySelector('[property="og:title"]').content;
		const description = document.querySelector('meta[name="description"]').content;
		switch (link.dataset.share) {
			case 'twitter': data = {
				href: `https://twitter.com/intent/tweet?url=${url}&text=${description}&hashtags=LopanCafé`,
				title: `${title} をツイート` }
			break;
			case 'facebook': data = {
				href: `http://www.facebook.com/share.php?u=${url}`,
				title: `${title} をFacebookでシェア` }
			break;
			case 'line': data = {
				href: `https://social-plugins.line.me/lineit/share?url=${url}`,
				title: `${title} をLINEでシェア` }
			break;
		}
		return data;
	}
}

/**
* プルダウン UI
-------------------------------------------------- */
class PulldownUi {
	constructor() {
		this.isSmooth = getComputedStyle(document.documentElement).scrollBehavior === 'smooth';
		this.pullData = {};
		const elm = document.getElementsByClassName('js-pullContent');
		for (let i = 0, len = elm.length; i < len; i++) {
			this.setup(elm[i].dataset.pull, elm[i]);
		}
		this.refresh();
		window.addEventListenr('mainresized', () => {
			this.refresh(true);
		});
	}
	setup(id, elm) {
		const toggle = document.querySelectorAll(`.js-pullToggle[data-pull="${id}"]`);
		const tabElms = elm.querySelectorAll('a[href], button');
		this.SPF = 1000 / 60;
		this.duration = 1000;
		this.cancelScroll();
		this.pullData[id] = {
			isOpen: true,
			toggle: toggle,
			content: elm,
			tabElms: tabElms,
			defaultHeight: elm.dataset.default ? elm.dataset.default : 0,
			contentHeight: elm.getBoundingClientRect().height
		};
		// head をクリックすると body が開くことを知らせる
		toggle.ariaExpanded = 'false'; // 対象の body は開かれているかどうか
		elm.ariaHidden = 'true'; // 閉じているかどうか
		
		// head と body を関連づける
		elm.id = id;
		for (let i = 0, len = toggle.length; i < len; i++) {
			toggle[i].ariaLabel = '開く';
			toggle[i].setAttribute('aria-controls', id);
			toggle[i].addEventListener('click', () => {
				this.togglePull(id, true);
			});
		}
		this.closePull(id, false);
		
		// 中身に tab 移動させない
		document.addEventListener('readystatechange', e => {
			if (tabElms.length !== 0) {
				for (let i = 0, len = tabElms.length; i < len; i++) {
					tabElms[i].tabIndex = -1;
				}
			}
		}, { once: true });
	}
	togglePull(id, anim) {
		!this.pullData[id].isOpen ? this.openPull(id, anim) : this.closePull(id, anim);
	}
	openPull(id, anim) {
		this.pullData[id].isOpen = true;
		if (anim) {
			this.addAnim(id);
			this.toScroll(id);
		}
		this.pullData[id].content.style.height = `${this.pullData[id].contentHeight}px`;
		
		// 対象の body が開いたことを知らせる
		for (let i = 0, len = this.pullData[id].toggle.length; i < len; i++) {
			this.pullData[id].toggle[i].ariaLabel = '閉じる';
			this.pullData[id].toggle[i].ariaExpanded = 'true';
		}
		this.pullData[id].content.ariaHidden = 'false';
		
		if (this.pullData[id].tabElms.length !== 0) {
			for (let i = 0, len = this.pullData[id].tabElms.length; i < len; i++) {
				this.pullData[id].tabElms[i].tabIndex = 0;
			}
			this.pullData[id].tabElms[0].focus();
		}
	}
	closePull(id, anim) {
		this.pullData[id].isOpen = false;
		if (anim) {
			this.addAnim(id);
			this.toScroll(id);
		}
		this.pullData[id].content.style.height = `${this.pullData[id].contentHeight}px`;
		
		setTimeout(() => {
			this.pullData[id].content.style.height = `${this.pullData[id].defaultHeight}px`;
			
			// 対象の body が閉じたことを知らせる
			for (let i = 0, len = this.pullData[id].toggle.length; i < len; i++) {
				this.pullData[id].toggle[i].ariaLabel = '開く';
				this.pullData[id].toggle[i].ariaExpanded = 'false';
			}
			this.pullData[id].content.ariaHidden = 'true';
			
			for (let i = 0, len = this.pullData[id].tabElms.length; i < len; i++) {
				this.pullData[id].tabElms[i].tabIndex = -1;
			}
		}, 60);
	}
	addAnim(id) {
		if (this.pullData[id].isOpen) {
			for (let i = 0, len = this.pullData[id].toggle.length; i < len; i++) {
				this.pullData[id].toggle[i].classList.add('is-active', 'is-anim');
			}
			this.pullData[id].content.classList.add('is-active', 'is-anim');
		} else {
			for (let i = 0, len = this.pullData[id].toggle.length; i < len; i++) {
				this.pullData[id].toggle[i].classList.replace('is-active', 'is-anim');
			}
			this.pullData[id].content.classList.replace('is-active', 'is-anim');
		}
		for (let i = 0, len = this.pullData[id].toggle.length; i < len; i++) {
			this.pullData[id].toggle[i].addEventListener('transitionend', () => {
				this.pullData[id].toggle[i].classList.remove('is-anim');
			}, { once: true });
		}
		this.contentEnd(id);
	}
	contentEnd(id) {
		this.pullData[id].content.addEventListener('transitionend', e => {
			if (e.propertyName !== 'height') {
				this.contentEnd(id);
			} else {
				this.pullData[id].content.classList.remove('is-anim');
				if (this.pullData[id].isOpen) {
					this.pullData[id].content.removeAttribute('style');
				}
			}
		}, { once: true });
	}
	toScroll(targetId) {
		if (this.isSmooth) {
			LPN.Wm.html.classList.add('is-behaviorAuto');
		}
		this.startPos = LPN.Wm.yOffset;
		this.currentPos = this.startPos;
		this.elapsedTime = 0;
		const y = this.startPos - this.scPad;
		this.goalPos = document.getElementById(targetId).getBoundingClientRect().top + y;
		if (this.goalPos >= this.scMax) {
			this.goalPos = this.scMax;
		}
		this.valueInChange = this.goalPos - this.startPos;
		this.doScroll();
	}
	doScroll() {
		this.currentPos = this.startPos + this.valueInChange * this.easing(this.elapsedTime / this.duration);
		if (this.elapsedTime >= this.duration) {
			this.currentPos = this.goalPos;
			cancelAnimationFrame(this.timer);
			if (this.isSmooth) {
				LPN.Wm.html.classList.remove('is-behaviorAuto');
			}
			return;
		} else {
			this.elapsedTime += this.SPF;
			this.timer = requestAnimationFrame(() => {
				this.doScroll();
			});
		}
		window.scrollTo(0, this.currentPos);
	}
	refresh(isResize) {
		// console.log(isResize);
		this.scPad = document.getElementsByClassName('l-header')[0].clientHeight || 56;
		this.scBtm = document.body.offsetHeight - window.innerHeight;
		this.scMax = document.body.clientHeight - window.innerHeight;
		
		// .js-pullContent 内の最後の要素の底辺座標から最初の要素の頂点座標を引いて、中身の高さを取得
		let lastElm, firstElm, bottomY, topY;
		for (let id in this.pullData) {
			lastElm = this.pullData[id].content.lastElementChild;
			firstElm = this.pullData[id].content.firstElementChild;
			bottomY = lastElm.getBoundingClientRect().bottom + parseFloat(window.getComputedStyle(lastElm)['margin-bottom']);
			topY = firstElm.getBoundingClientRect().top - parseFloat(window.getComputedStyle(firstElm)['margin-top']);
			this.pullData[id].contentHeight = bottomY - topY;
		}
	}
	/* スワイプするかマウスホイールを操作したらスクロールを止める */
	cancelScroll() {
		if (LPN.isTouch) {
			window.addEventListener('touchmove', () => { cancelAnimationFrame(this.timer); }, { once: true });
		} else {
			this.wheel = () => { cancelAnimationFrame(this.timer); }
			window.addEventListener('DOMMouseScroll', () => { this.wheel(); }, { once: true });
			window.onmousewheel = document.onmousewheel = this.wheel;
		}
	}
	/* easeOutCubic ( https://easings.net/ ) */
	easing(x) {
		return 1 - Math.pow(1 - x, 3);
	}
}

/**
* プルメニュー UI (767px 未満はアコーディオン)
-------------------------------------------------- */
class PullmenuUi {
	constructor() {
		const menu = document.getElementsByClassName('c-pullmenu')[0];
		const parent = menu.getElementsByClassName('parent');
	}
	// 最後の要素の底辺座標から最初の要素の頂点座標を引いて、中身の高さを取得
	returnContainerHeight(elms) {
		const lastElm = elms.lastElementChild;
		const firstElm = elms.firstElementChild;
		const bottomY = lastElm.getBoundingClientRect().bottom + parseFloat(window.getComputedStyle(lastElm)['margin-bottom']);
		const topY = firstElm.getBoundingClientRect().top - parseFloat(window.getComputedStyle(firstElm)['margin-top']);
		return bottomY - topY;
	}
	addListener(elm) {
		
	}
}

/**
* スムーズスクロール
* スクロールコンテンツを以下の要素で括る
* <div class="js-smoothscroll"><div class="container">
-------------------------------------------------- */
export class SmoothScrolling {
	constructor() {
		const el = document.getElementsByClassName('js-smoothscroll')[0];
		el.classList.replace('js-smoothscroll', 'wrapper');
		
		document.documentElement.classList.add('is-smooth');
		this.isSmooth = true;
		
		// ボディの高さがなくなるのでコンテンツ分指定する
		this.container = el.getElementsByClassName('container')[0];
		this.resize();
		
		this.targetScrollY = 0; // 本来のスクロール位置
		this.currentScrollY = 0; // 線形補間を適用した現在のスクロール位置
		this.scrollOffset = 0; // 上記2つの差分
		this.curY = 0;
		
		window.addEventListener('resized', () => {
			this.resize();
		});
		window.addEventListener('mainresized', () => {
			this.resize();
		});
		LPN.registFnc.loop.push(() => {
			this.loop();
		});
	}
	loop() {
		// スクロール位置を取得
		this.targetScrollY = document.documentElement.scrollTop;
		
		if (!this.isSmooth) {
			if (this.curY !== this.currentScrollY) {
				this.curY = this.currentScrollY = this.targetScrollY;
				this.container.style.transform = `translate3d(0,${-this.curY}px,0)`;
			}
		}
		else {
			// リープ関数でスクロール位置をなめらかに追従
			this.currentScrollY = this.lerp(this.currentScrollY, this.targetScrollY, 0.01);
			this.scrollOffset = this.targetScrollY - this.currentScrollY;
			
			if (this.curY !== this.currentScrollY) {
				this.curY = this.currentScrollY;
				if (this.curY < 0.01) this.curY = this.currentScrollY = 0;
				this.container.style.transform = `translate3d(0,${-this.curY}px,0)`;
			}
		}
	}
	// 開始と終了をなめらかに補間する関数
	lerp(start, end, t) {
		if (end == start) return start;
		return start + this.out_expo(t) * (end - start);
		// return (1 - t) * start + t * end;
	}
	out_expo(x) {
		let t = x; let b = 0; let c = 1; let d = 1;
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	}
	resize() {
		document.body.style.height = `${this.container.getBoundingClientRect().height}px`;
	}
}

/**
* テキストコピー
* .js-copy をクリックすると要素の内容をコピーする
* <div class="js-copy"><textarea></div> or
* class="js-copy" data-copytext="コピーテキスト"
-------------------------------------------------- */
class TextCopy {
	constructor(elm) {
		this.copyMsg = !elm.dataset.msg ? 'Copied!' : elm.dataset.msg;
		this.copyTxt = elm.dataset.text === '$url' ?  location.href : elm.dataset.text;
		elm.addEventListener('click', e => this.copyText(e));
	}
	copyText(e) {
		const t = e.target;
		
		const element = document.createElement('input');
		element.value = this.copyTxt;
		document.body.appendChild(element);
		element.select();
		document.execCommand('copy');
		document.body.removeChild(element);
		
		t.insertAdjacentHTML('beforeend', `<span class="copy_msg">${this.copyMsg}</span>`);
		t.classList.add('is-copyed');
		t.addEventListener('animationend', this.copyEnd, { once: true });
	}
	copyEnd() {
		this.classList.remove('is-copyed');
		this.removeChild(this.lastElementChild);
		//this.removeEventListener('animationend', textCopy.copyEnd);
	}
}
