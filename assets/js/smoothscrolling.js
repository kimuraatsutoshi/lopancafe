/**
* スムーズスクロール
* スクロールコンテンツを以下の要素で括る
* <div class="js-smoothscroll"><div class="container">
 -------------------------------------------------- */
export class SmoothScrolling {
	constructor(el) {
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
