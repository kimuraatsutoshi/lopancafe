import { AfterLoadedJs, AfterLoadedCss } from './utility.js';

/**
 * ドロワーメニュー
 -------------------------------------------------- */
export class DrawerMenu {
	constructor() {
		//console.log('-----> drawerMenu');
		const id = 'navigation';
		this.menu = document.getElementsByClassName('l-menu')[0];
		this.menuLinks = this.menu.querySelectorAll('a[href]');
		this.toggle = document.getElementsByClassName('js-menuToggle');
		this.btn = document.querySelector('.js-menuToggle.l-drawer');
		this.overlay = document.querySelector('.js-menuToggle.overlay');
		
		// ARIA: js-menuToggle をクリクするとナビゲーションが開くことを知らせる
		for (let i = 0, len = this.toggle.length; i < len; i++) {
			this.toggle[i].addEventListener('click', () => {
				this.toggleMenu();
			});
			this.toggle[i].setAttribute('aria-controls', id);
			this.toggle[i].ariaLabel = 'ナビゲーションを開く';
			this.toggle[i].ariaExpanded = 'false'; // 対象の menu が開かれているかどうか
		}
		this.menu.id = id;
		this.menu.ariaHidden = 'true'; // 閉じているかどうか
		
		// アンカースクロールが実装されてなければ実装
		if (LPN.As !== undefined) {
			if (LPN.As.scPad === undefined) {
				this.menuAnchor();
			}
		} else {
			this.menuAnchor();
		}
		document.addEventListener('readystatechange', e => {
			// 最初は tab 移動させない
			for (let i = 0, len = this.menuLinks.length; i < len; i++) {
				this.menuLinks[i].tabIndex = -1;
			}
		}, { once: true });
		
		this.tabFocusControl();
	}
	menuAnchor() {
		// スムーススクロールの実装がない場合、menu 内のアンカーリンククリックで閉じる
		const anchor = this.menu.querySelectorAll('a[href^="#"]');
		for (let i = 0, len = anchor.length; i < len; i++) {
			anchor[i].addEventListener('click', e => {
				e.preventDefault();
				this.closeMenu(() => {
					location.hash = anchor[i].getAttribute('href');
				});
			});
		}
	}
	toggleMenu() {
		!this.isOpened ? this.openMenu() : this.closeMenu();
		this.menu.addEventListener('transitionend', e => {
			this.menuEnd(e);
		}, { once: true });
	}
	openMenu() {
		this.isOpened = true;
		LPN.Wm.posLock();
		this.menu.classList.add('is-active', 'is-anim');
		
		// ARIA: ナビゲーションが開いたことを知らせる
		this.menu.ariaHidden = 'false';
		this.toggleEnd('開く');
		
		// menu 内最初のリンクへフォーカス
		this.menu.querySelector('a[href]').focus();
		this.isTabWrap = true;
		for (let i = 0, len = this.menuLinks.length; i < len; i++) {
			this.menuLinks[i].tabIndex = 0;
		}
	}
	closeMenu(fn) {
		this.isOpened = false;
		LPN.Wm.posUnlock(fn); // fn: スクロールのロック解除後にハッシュリンク
		this.menu.classList.replace('is-active', 'is-anim');
		
		// ARIA: ナビゲーションが閉じたことを知らせる
		this.menu.ariaHidden = 'true';
		this.toggleEnd('閉じる');
		
		// ≡ btn へフォーカス
		this.btn.focus();
		this.isTabWrap = false;
		for (let i = 0, len = this.menuLinks.length; i < len; i++) {
			this.menuLinks[i].tabIndex = -1;
		}
	}
	toggleEnd(str) {
		// ARIA: ナビゲーションの開閉を知らせる
		for (let i = 0, len = this.toggle.length; i < len; i++) {
			const toggle = str === '開く' ? 'add' : 'replace';
			const expanded = str === '開く' ? 'true' : 'false';
			this.toggle[i].classList[toggle]('is-active', 'is-anim');
			this.toggle[i].ariaLabel = `ナビゲーションを${str}`;
			this.toggle[i].ariaExpanded = expanded;
		}
		
		// ≡ btn は animationend をきっかけに remove
		this.btn.addEventListener('animationend', e => {
			this.btn.classList.remove('is-anim');
		}, { once: true });
		
		// overlay は transitionend をきっかけに remove
		this.overlay.addEventListener('transitionend', e => {
			this.overlay.classList.remove('is-anim');
		}, { once: true });
	}
	menuEnd(e) {
		this.isOpened ? this.openEnd(e) : this.closeEnd(e);
	}
	openEnd(e) {
		// 開く時は overlay が先なので container をきっかけに remove
		if (e.target.className.indexOf('container') >= 0) {
			this.menu.classList.remove('is-anim');
			
		} else {
			// container じゃなかったらもっかい addEventListener
			this.menu.addEventListener('transitionend', e => {
				this.openEnd(e);
			}, { once: true });
		}
	}
	closeEnd(e) {
		// 閉じる時は overlay が後なので overlay をきっかけに remove
		if (e.target.className.indexOf('overlay') >= 0) {
			this.menu.classList.remove('is-anim');
			
		} else {
			this.menu.addEventListener('transitionend', e => {
				this.closeEnd(e);
			}, { once: true });
		}
	}
	// モーダルが開いている間、tab でのフォーカスをモーダル内に閉じ込める
	tabFocusControl() {
		document.addEventListener('keydown', e => {
			if (e.code.toLowerCase().startsWith('shift')) this.keyShifted = true;
			if (this.isTabWrap) {
				if (e.code.toLowerCase() === 'tab') {
					this.tabFocus(e);
				}
			}
		});
		document.addEventListener('keyup', e => {
			if (e.code.toLowerCase().startsWith('shift')) this.keyShifted = false;
		});
	}
	tabFocus(e) {
		if (this.keyShifted) {
			// タブを押した時、モーダル内の最初のリンクなら、最後のリンクにフォーカス
			if (e.target === this.menuLinks[0]) {
				e.preventDefault();
				this.menuLinks[this.menuLinks.length - 1].focus();
			}
			
		} else {
			// タブを押した時、モーダル内の最後のリンクなら、最初のリンクにフォーカス
			if (e.target === this.menuLinks[this.menuLinks.length - 1]) {
				e.preventDefault();
				this.menuLinks[0].focus();
			}
		}
	}
}

/**
 * アコーディオン UI
 * MEMO: 閉じてる時にブラウザで文字列検索しても開かない問題は未解決
 -------------------------------------------------- */
export class AccordionUi {
	constructor() {
		if (document.querySelector('.js-acc') !== null) {
			this.accData = {};
			const elm = document.getElementsByClassName('js-acc');
			let count = 0;
			for (let i = 0, len = elm.length; i < len; i++) {
				count++;
				this.setup(`acc-${count}`, elm[i]);
			}
			this.refresh();
			LPN.registFnc.onMainResize.push(() => {
				this.refresh();
			});
		}
	}
	setup(id, elm) {
		const head = elm.getElementsByClassName('js-accHead')[0];
		const body = elm.getElementsByClassName('js-accBody')[0];
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
 * プルダウン UI
 -------------------------------------------------- */
export class PulldownUi {
	constructor() {
		if (document.querySelector('.js-pullContent') !== null) {
			this.isSmooth = getComputedStyle(document.documentElement).scrollBehavior === 'smooth';
			this.pullData = {};
			const elm = document.getElementsByClassName('js-pullContent');
			for (let i = 0, len = elm.length; i < len; i++) {
				this.setup(elm[i].dataset.pull, elm[i]);
			}
			this.refresh();
			LPN.registFnc.onMainResize.push(() => {
				this.refresh();
			});
		}
	}
	setup(id, elm) {
		const toggle = document.querySelectorAll(`.js-pullToggle[data-pull="${id}"]`);
		const tabElms = elm.querySelectorAll('a[href], button');
		this.SPF = 1000 / 60;
		this.duration = 1000;
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
	refresh() {
		this.scPad = document.getElementsByClassName('l-header')[0].clientHeight || 56;
		this.scBtm = document.body.offsetHeight - window.innerHeight;
		this.scMax = document.body.clientHeight - window.innerHeight;
		for (let id in this.pullData) {
			if (!this.pullData[id].isOpen) {
				this.pullData[id].content.removeAttribute('style');
			}
			this.pullData[id].contentHeight = this.pullData[id].content.getBoundingClientRect().height;
			if (!this.pullData[id].isOpen) {
				this.pullData[id].content.style.height = `${this.pullData[id].defaultHeight}px`;
			}
		}
	}
	/* easeOutCubic ( https://easings.net/ ) */
	easing(x) {
		return 1 - Math.pow(1 - x, 3);
	}
}

/**
 * スムーススクロール
 -------------------------------------------------- */
export class AnchorScroll {
	constructor() {
		// overscroll-behavior: smooth なら実装しない
		if (getComputedStyle(document.documentElement).scrollBehavior !== 'smooth') {
			this.setup();
		} else {
			// smooth なら pagetop の目的地 #top を用意しておく
			if (document.querySelector('#top') === null) {
				document.body.insertAdjacentHTML('afterbegin', '<a id="top"></a>');
			}
		}
	}
	setup() {
		if (location.hash) {
			// URL に hash があったらスクロール
			setTimeout(() => {
				this.toScroll(location.hash.slice(1));
				history.replaceState(null, document.title, window.location.pathname);
			}, 80);
		}
		this.SPF = 1000 / 60;
		this.duration = 1000;
		this.onResize();
		this.cancelScroll();
		LPN.registFnc.onResize.push(() => {
			this.onResize();
		});
		
		const anchor = document.querySelectorAll('.js-anc[href^="#"]');
		for (let i = 0, len = anchor.length; i < len; i++) {
			anchor[i].addEventListener('click', e => {
				this.anchorClick(e);
			});
		}
	}
	anchorClick(e) {
		e.preventDefault();
		const target = e.target.closest('[href]');
		const targetId = target.getAttribute('href');
		this.toScroll(targetId.slice(1));
	}
	onResize() {
		// header の高さが 0 でも 56px は空ける
		this.scPad = document.getElementsByClassName('l-header')[0].clientHeight || 56;
		this.scBtm = document.body.offsetHeight - window.innerHeight;
		this.scMax = document.body.clientHeight - window.innerHeight;
		
		// body の高さが取得できなかった場合 0.06 秒後に改めて実行
		if (this.scMax < 0) setTimeout(() => {
			this.onResize();
		}, 60);
	}
	toScroll(targetId) {
		if (targetId !== 'top' && document.getElementById(targetId) === null) return;
		// console.log(targetId);
		
		// ドロワーメニューが開いていたら、開いた時の位置からスタート (メニューは閉じる)
		if (LPN.Dm.isOpened) {
			this.startPos = LPN.Wm.lockOffset;
			LPN.Dm.closeMenu();
		} else {
			this.startPos = LPN.Wm.yOffset;
		}
		
		this.currentPos = this.startPos;
		this.elapsedTime = 0;
		let y = this.startPos - this.scPad;
		// if (LPN.Ts !== undefined) {
		// 	if (LPN.Ts.wrapper !== undefined) {
		// 		y = LPN.Wm.yOffset - this.scPad;
		// 	}
		// }
		
		this.goalPos = targetId !== 'top' ? document.getElementById(targetId).getBoundingClientRect().top + y : 0;
		if (this.goalPos >= this.scMax) {
			this.goalPos = this.scMax;
		}
		this.valueInChange = this.goalPos - this.startPos;
		this.doScroll();
		if (targetId === 'top') {
			document.querySelector('header a').focus();
		}
	}
	doScroll() {
		const elapsedTimeRate = this.elapsedTime / this.duration;
		const valueChangeRate = this.easing(elapsedTimeRate);
		const changeYOffset = this.valueInChange * valueChangeRate;
		
		this.currentPos = this.startPos + changeYOffset;
		
		if (this.elapsedTime >= this.duration) {
			this.currentPos = this.goalPos;
			cancelAnimationFrame(this.timer);
			return;
		} else {
			this.elapsedTime += this.SPF;
			this.timer = requestAnimationFrame(() => {
				this.doScroll();
			});
		}
		
		window.scrollTo(0, this.currentPos);
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
	/* easeInOutCubic ( https://easings.net/ ) */
	easing(x) {
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	}
}

/**
 * テキストコピー
 * .js-copy をクリックすると要素の内容をコピーする
 * <div class="js-copy"><textarea></div> or
 * class="js-copy" data-copytext="コピーテキスト"
 * -------------------------------------------------- */
export class TextCopy {
	constructor(elm) {
		elm.addEventListener('click', e => this.copyText(e));
	}
	copyText(e) {
		const t = e.target.className.indexOf('js-copy') >= 0 ? e.target : e.target.closest('.js-copy');
		const element = document.createElement('input');
		
		if (t.childElementCount !== 0) {
			if (t.firstChild.tagName.toLowerCase() === 'textarea') {
				element.value = t.firstChild.value;
			} else {
				element.value = t.textContent;
			}
		} else if (t.dataset['copytext'] !== undefined) {
			element.value = t.dataset['copytext'];
		} else {
			element.value = t.textContent;
		}
		if (element.value === '') return;
		
		document.body.appendChild(element);
		element.select();
		document.execCommand('copy');
		document.body.removeChild(element);
		t.insertAdjacentHTML('beforeend', '<span class="msg">Copied!</span>');
		t.classList.add('is-copyed');
		t.addEventListener('animationend', this.copyEnd, { once: true });
	}
	copyEnd() {
		this.classList.remove('is-copyed');
		this.removeChild(this.getElementsByClassName('msg')[0]);
		//this.removeEventListener('animationend', textCopy.copyEnd);
	}
}
