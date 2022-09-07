import { AfterLoadedJs, AfterLoadedCss } from './common.js';

/**
 * YouTube API
 * <div class="js-yt" width="width" height="height" data-ytid="{ytid}"></div>
 -------------------------------------------------- */
export class YouTubeIframeApi {
	constructor() {
		if (document.querySelector('.js-yt') !== null) {
			// document.addEventListener('readystatechange', e => {
				const elm = document.getElementsByClassName('js-yt')[0];
				this.elmTop = elm.getBoundingClientRect().top - LPN.Wm.winH;
			// });
			window.addEventListener('scroll', () => {
				this.onScroll();
			}, { once: true });
		}
	}
	onScroll() {
		// 最初の js-yt 要素の位置まできたら API 読み込む
		if (LPN.Wm.yOffset + LPN.Wm.winH > this.elmTop) {
			this.ready();
		} else {
			window.addEventListener('scroll', () => {
				this.onScroll();
			}, { once: true });
		}
	}
	ready() {
		// console.log('YouTubeIframeApi.ready');
		delete this.elmTop;
		this.loadAPI();
		window.onYouTubeIframeAPIReady = () => {
			this.init();
		}
	}
	loadAPI() {
		let tag = document.createElement('script');
		tag.src = 'https://www.youtube.com/iframe_api';
		let firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}
	init() {
		this.player = {};
		this.playerVars = { controls: 0, modestbranding: 1, enablejsapi: 1, playsinline: 1, rel: 0 };
		
		const ytElms = document.getElementsByClassName('js-yt');
		let id;
		for (let i = 0, len = ytElms.length; i < len; i++) {
			// console.dir(ytElms[i]);
			id = `player-${i + 1}`;
			this.setUI(ytElms[i].parentNode.parentNode, id);
			this.setup(ytElms[i], id);
		}
	}
	setUI(wrap, id) {
		//console.log(wrap);
		const poster = wrap.getElementsByClassName('poster')[0];
		poster.tabIndex = 0;
		poster.dataset.player = id;
		poster.addEventListener('click', e => {
			this.playToggle(e);
		});
		poster.addEventListener('keypress', e => {
			e.preventDefault();
			if (e.code.toLowerCase() === 'space' || e.code.toLowerCase() === 'enter') {
				this.playToggle(e);
			}
		});
		const play = poster.getElementsByClassName('play')[0];
		play.tabIndex = -1;
	}
	setup(elm, id) {
		elm.id = id;
		elm.tabIndex = -1;
		const ytid = elm.dataset.ytid;
		const w = elm.width ? elm.width : 560;
		const h = elm.height ? elm.height : 315;
		this.player[id] = new YT.Player(id, {
			width: w, height: h, videoId: ytid, playerVars: this.playerVars,
			events: {
				'onReady': e => {
					this.onPlayerReady(e);
				},
				'onStateChange': e => {
					this.onPlayerStateChange(e);
				}
			}
		});
	}
	playToggle(e) {
		if (this.player === undefined) return;
		const id = e.target.dataset.player;
		if (this.player[id].getPlayerState() !== 1) {
			this.player[id].playVideo();
		} else {
			this.player[id].pauseVideo();
		}
	}
	onPlayerReady(e) {
		// console.log('onPlayerReady', e);
	}
	onPlayerStateChange(e) {
		// console.log('onPlayerStateChange', e);
		if (e.data === 1 || e.data === -1) {
			e.target.getIframe().parentNode.parentNode.classList.add('is-playing');
		} else {
			e.target.getIframe().parentNode.parentNode.classList.remove('is-playing');
		}
	}
}
