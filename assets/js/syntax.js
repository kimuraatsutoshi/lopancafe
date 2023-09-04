import { AfterLoadedJs, AfterLoadedCss } from './_utility.js';

/**
 * シンタックスハイライト
 -------------------------------------------------- */
export class SyntacConvert {
	constructor() {
		this.insertTags();
		this.loadJs();
		this.loadCss();
	}
	insertTags() {
		const elms = document.getElementsByClassName('c-syntax');
		let lang, style, caption;
		for (let i = 0, len = elms.length; i < len; i++) {
			lang = elms[i].dataset.lang;
			style = '';
			if (elms[i].dataset.style) {
				style = ` style="${elms[i].dataset.style}"`;
			}
			caption = '';
			if (elms[i].dataset.caption) {
				caption = `<figcaption>${elms[i].dataset.caption}</figcaption>`;
			}
			let html = `<div class="wrap"${style} tabindex="0">`;
			html += `<pre class="line-numbers" tabindex="-1">`;
			html += `<code class="language-${lang}">${elms[i].innerHTML}`;
			html += `</code></pre></div>${caption}`;
			elms[i].innerHTML = html;
		}
	}
	loadJs() {
		new AfterLoadedJs(`${LPN.Rp.returnRootPath()}assets/js/lib/prism.js`).then(
		resolve => {
			document.addEventListener('readystatechange', e => {
				// console.log(resolve, e.target.readyState);
			});
		},
		error => {
			console.log(error.message);
		});
	}
	loadCss() {
		new AfterLoadedCss(`${LPN.Rp.returnRootPath()}assets/css/prism.css`).then(
		resolve => {
			document.addEventListener('readystatechange', e => {
				// console.log(resolve, e.target.readyState);
			});
		},
		error => {
			console.log(error.message);
		});
	}
}
