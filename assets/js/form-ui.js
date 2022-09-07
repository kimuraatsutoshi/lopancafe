/**
 * チェックすることで入力を受け入れる UI
 * <input type="checkbox" class="js-acceptInput" data-type="submit">
 -------------------------------------------------- */
export class CheckedAcceptInput {
	constructor() {
		if (document.querySelector('.js-acceptInput') !== null) {
			this.init();
		}
	}
	init() {
		this.acceptData = {};
		const elm = document.getElementsByClassName('js-acceptInput');
		
		let trigger, id;
		for (let i = 0, len = elm.length; i < len; i++) {
			// ラジオボタンの場合は、同じ name のラジオボタンすべてがリスナー
			trigger = elm[i].type !== 'radio' ? elm[i] : elm[i].form.querySelectorAll(`input[type="radio"][name="${elm[i].name}"]`);
			id = `accept-${i + 1}`;
			this.setup(elm[i], id, trigger);
		}
		
		setTimeout(() => {
			for (let id in this.acceptData) {
				!this.acceptData[id].checkbox.checked ? this.unAccept(id) : this.onAccept(id);
			}
		}, 60);
		// console.log(this.acceptData);
	}
	setup(elm, id, trigger) {
		let target = null;
		if (elm.dataset.type === 'submit') {
			target = elm.form.querySelector('input[type="submit"], button[type="submit"]');
		} else {
			target = elm.parentNode.querySelector(`input[type="${elm.dataset.type}"]`);
		}
		this.acceptData[id] = {
			checkType: elm.type,
			targetType: target.type,
			checkbox: elm,
			target: target,
			isAccepted: elm.checked
		};
		if (elm.type === 'radio') {
			for (let i = 0, len = trigger.length; i < len; i++) {
				this.addListener(trigger[i], id);
			}
		} else {
			this.addListener(trigger, id);
		}
	}
	addListener(elm, id) {
		elm.addEventListener('change', () => {
			// 
			!this.acceptData[id].isAccepted && this.acceptData[id].checkbox.checked ? this.onAccept(id) : this.unAccept(id);
		});
	}
	onAccept(id) {
		this.acceptData[id].isAccepted = true;
		this.acceptData[id].target.disabled = false;
	}
	unAccept(id) {
		this.acceptData[id].isAccepted = false;
		this.acceptData[id].target.disabled = true;
		
		// 入力値があれば空にする
		if (this.acceptData[id].targetType !== 'submit' && this.acceptData[id].target.value !== '') {
			this.acceptData[id].target.value = '';
		}
	}
}

/**
 * flex textarea
 * <div class="js-flextextarea"><textarea/></div>
 -------------------------------------------------- */
export class FlexTextarea {
	constructor() {
		if (document.querySelector('.js-flextextarea') !== null) {
			this.init();
		}
	}
	init() {
		const elm = document.querySelectorAll('.js-flextextarea');
		let dummy, textarea;
		elm.forEach(el => {
			el.insertAdjacentHTML('afterbegin', '<div class="dummy"></div>')
			dummy = el.getElementsByClassName('dummy')[0];
			textarea = el.getElementsByTagName('textarea')[0];
			textarea.addEventListener('input', e => {
				dummy.textContent = e.target.value + '\u200b';
			});
		});
	}
}
