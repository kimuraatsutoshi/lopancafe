/**
 * .js-sc-wrap 内のスクロールを transform: translate に置き換える (※scroll-behavior は auto にしておく)
 * <div class="js-sc-wrap">{コンテンツ}</div>
 * <div class="js-sc-slip">{ずれる要素}</div>
 * 参考: https://github.com/min30327/luxy.js/blob/master/src/js/luxy.js
 -------------------------------------------------- */
export class TransformScroll {
	constructor() {
		LPN.Wm.html.classList.add('is-behaviorAuto');
		this.setup();
	}
	setup() {
		if (!LPN.isTouch) {
			document.body.insertAdjacentHTML('beforeend', '<div class="js-sc-dummy"></div>');
			this.dummy = document.getElementsByClassName('js-sc-dummy')[0];
			this.wrapper = document.getElementsByClassName('js-sc-wrap')[0];
			this.wrapper.classList.add('js-fixed');
			
			// this.isSmooth = getComputedStyle(document.documentElement).scrollBehavior === 'smooth';
			
			this.frictionOrigin = 8 / 100;
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
				position: LPN.Wm.yOffset + clientRect.top,
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
				data.posY += (goalY + diff - data.posY) * this.friction;
				data.posY = Math.round(data.posY * 100) / 100;
				// if (i === 0) console.log(goalY, LPN.Wm.yOffset);
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
				pos = Math.round((data.posY - data.position / 2) * 100) / 100;
				this.slipper[i].style.transform = `translate3d(0,${pos / data.ratio}px,0)`;
				// if (i === 0) console.log(data.posY, data.position / 2);
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
