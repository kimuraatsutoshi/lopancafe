import { AfterLoadedJs, AfterLoadedCss } from './common.js';

/**
 * 動画コントロール
 * <video {valid_attributes} width="640" height="360" class="js-video" data-video="{unique_id}"></video>
 * <button type="button" class="js-videoControl" data-video="{unique_id}">再生する</button>
 -------------------------------------------------- */
export class VideoControls {
	constructor() {
		if (document.querySelector('.js-video') !== null) {
			this.videoData = {};
			const elms = document.getElementsByClassName('js-video');
			let id;
			for (let i = 0, len = elms.length; i < len; i++) {
				id = elms[i].dataset.video;
				this.setup(elms[i], id);
			}
			// console.log(this.videoData);
		}
	}
	setup(elm, id) {
		if (!elm.controls) {
			// controls 属性がなければ video 要素にフォーカスさせない
			elm.tabIndex = -1;
		}
		const button = document.querySelector(`.js-videoControl[data-video=${id}]`);
		button.tabIndex = 0;
		this.videoData[id] = {
			isPlaying: false,
			container: elm.closest('.c-video'),
			video: elm,
			button: button
		};
		
		button.addEventListener('click', () => {
			this.playToggle(id);	
		});
		elm.addEventListener('ended', () => {
			this.onPause(id);
		});
		// elm.addEventListener('playing', e => {
		// 	console.log('playing', id, e);
		// });
		button.addEventListener('keydown', e => {
			if (e.code.toLowerCase() === 'space' || e.code.toLowerCase() === 'enter') {
				e.preventDefault();
				this.playToggle(id);	
			}
		});
	}
	playToggle(id) {
		if (!this.videoData[id].isPlaying) {
			this.onPlay(id);
		} else {
			this.onPause(id);
		}	
	}
	onPlay(id) {
		this.videoData[id].isPlaying = true;
		this.videoData[id].video.play();
		if (this.videoData[id].container !== null) {
			// 親要素に c-video があったら is-playing を付与する
			this.videoData[id].container.classList.add('is-playing');
		}
	}
	onPause(id) {
		this.videoData[id].isPlaying = false;
		this.videoData[id].video.pause();
		if (this.videoData[id].container !== null) {
			// 親要素に c-video があったら is-playing を外す
			this.videoData[id].container.classList.remove('is-playing');
		}
	}
}

/**
 * YouTube API
 * <div class="js-yt" width="640" height="360" data-player="{unique_id}" data-ytid="{ytid}" data-vars="{param}"></div>
 * <button type="button" class="js-ytControl" data-player="{unique_id}">再生する</button>
 -------------------------------------------------- */
export class YouTubeIframeApi {
	constructor() {
		if (document.querySelector('.js-yt') !== null) {
			document.addEventListener('readystatechange', () => {
				const elm = document.getElementsByClassName('js-yt')[0];
				this.elmTop = elm.getBoundingClientRect().top - LPN.Wm.winH;
				this.onScroll();
			});
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
		
		const elms = document.getElementsByClassName('js-yt');
		let id;
		for (let i = 0, len = elms.length; i < len; i++) {
			// console.dir(ytElms[i]);
			id = elms[i].dataset.player;
			this.setUI(id);
			this.setup(elms[i], id);
		}
		// console.log(this.player);
	}
	setUI(id) {
		const button = document.querySelector(`.js-ytControl[data-player=${id}]`);
		button.tabIndex = 0;
		button.addEventListener('click', e => {
			this.playToggle(e);
		});
		button.addEventListener('keydown', e => {
			if (e.code.toLowerCase() === 'space' || e.code.toLowerCase() === 'enter') {
				e.preventDefault();
				this.playToggle(e);
			}
		});
	}
	setup(elm, id) {
		elm.id = id;
		elm.tabIndex = -1;
		const w = elm.width ? elm.width : 560;
		const h = elm.height ? elm.height : 315;
		const ytid = elm.dataset.ytid;
		const playerVars = {};
		for (let i in this.playerVars) {
			playerVars[i] = this.playerVars[i];
		}
		if (elm.dataset.vars !== undefined) {
			const vars = elm.dataset.vars.split('&');
			let param = [];
			for (let i = 0, len = vars.length; i < len; i++) {
				param = vars[i].split('=');
				playerVars[param[0]] = param[1];
			}
		}
		this.player[id] = new YT.Player(id, {
			width: w, height: h, videoId: ytid, playerVars: playerVars,
			events: {
				onReady: e => {
					this.onPlayerReady(e, parseInt(playerVars.autoplay));
				},
				onStateChange: e => {
					this.onPlayerStateChange(e);
				}
			},
		});
		this.player[id].container = this.player[id].getIframe().closest('.c-video');
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
	onPlayerReady(e, autoplay) {
		// console.log('onPlayerReady', e.target.getPlayerState());
		if (autoplay) {
			e.target.mute();
		}
	}
	onPlayerStateChange(e) {
		// console.log('onPlayerStateChange', e.data, e.target);
		if (e.target.container !== null) {
			// 親要素に c-video があったら is-playing を付け外しする
			if (e.data === 1 || e.data === -1) {
				e.target.container.classList.add('is-playing');
			} else {
				e.target.container.classList.remove('is-playing');
			}
		}
	}
}
