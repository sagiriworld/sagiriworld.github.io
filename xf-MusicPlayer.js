"use strict";
window.addEventListener('DOMContentLoaded', function () {
    var playerEle = document.querySelectorAll('#xf-MusicPlayer');
    if (playerEle.length === 0) { return; }

    // ES6 兼容性检测
    if (
        typeof Symbol !== 'function' ||
        typeof Promise !== 'function' ||
        typeof Object.assign !== 'function' ||
        typeof Array.from !== 'function' ||
        typeof Array.prototype.includes !== 'function' ||
        typeof (() => { }) !== 'function' ||
        typeof `template ${'string'}` !== 'string' ||
        ({}).toString.call({ ...{} }) !== '[object Object]' ||
        Array.isArray([]) !== true
    ) {
        alert('当前浏览器不支持解析 ES6 语法, 无法使用"xf-MusicPlayer"插件, 请升级您的浏览器!');
        window.location.href = 'https://support.dmeng.net/upgrade-your-browser.html?referrer=' + encodeURIComponent(window.location.href);
        return;
    }

    const xfHead = document.head;
    const playerBody = document.body;

    // 确保 viewport meta 存在
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
        let newMeta = document.createElement('meta');
        newMeta.setAttribute('name', 'viewport');
        newMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
        xfHead.appendChild(newMeta);
    }

    // 只取第一个播放器实例
    let MusicPlayer = [...playerEle];
    if (MusicPlayer.length > 1) { MusicPlayer.splice(1); }
    MusicPlayer = MusicPlayer[0];

    // 读取配置属性
    let interfaceAndLocal = MusicPlayer.getAttribute('data-localMusic');
    const xfSongList = MusicPlayer.getAttribute('data-songList');
    let musicApi = `${location.protocol}//${MusicPlayer.getAttribute('data-musicApi')}`.trim();
    if (musicApi.slice(-4) === 'null') {
        // 直接使用 HTTPS：http://api.xfyun.club 会 301 重定向到 https，
        // 但重定向响应没有 CORS 头，浏览器跨域 fetch 会被拦截，导致播放器无法加载
        musicApi = 'https://api.xfyun.club';
    }
    if (musicApi === '' && interfaceAndLocal === null && xfSongList === null) {
        this.alert('请输入音乐API域名');
        return;
    }

    customFile();

    /* =========================
       样式文件加载
    ========================= */
    function customFile() {
        const cdnName = MusicPlayer.getAttribute('data-cdnName');
        const wl = window.location;
        let xfDomainName = cdnName === null
            ? `${wl.protocol}//${wl.hostname}${wl.port ? ':' + wl.port : ''}`
            : cdnName.trim();

        if (wl.protocol === 'https:') {
            const metaTag = document.createElement('meta');
            metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
            metaTag.setAttribute('content', 'upgrade-insecure-requests');
            xfHead.appendChild(metaTag);
        }

        const removeDotAndSlash = str => str.replace(/(^[^a-zA-Z0-9]+)|([^a-zA-Z0-9]+$)/g, '');
        const filePath = MusicPlayer.getAttribute('data-filePath');
        if (filePath !== null) {
            xfDomainName += `/${removeDotAndSlash(filePath)}`;
        }

        const appendStylesheet = href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.crossOrigin = 'anonymous';
            link.onerror = () => {
                console.warn(`样式文件加载失败: ${href}，播放器可能显示异常`);
            };
            xfHead.appendChild(link);
            return Promise.resolve();
        };

        const xfplayIconCSS = './styles/xfplayIcon.css';
        const MusicPlayerCSS = './styles/xf-MusicPlayer.css';

        if (location.protocol === 'file:') {
            musicApi = 'https://api.xfyun.club';
        }

        Promise.all([
            appendStylesheet(xfplayIconCSS),
            appendStylesheet(MusicPlayerCSS),
        ]).catch(error => {
            console.error('样式加载出错:', error);
        });
    }

    startExecutionPlayer();

    /* =========================
       播放器主体
    ========================= */
    function startExecutionPlayer() {

        const characterToElement = (str, mainBox) => {
            const parser = new DOMParser();
            let ele = parser.parseFromString(str, 'text/html');
            ele = ele.body.firstChild;
            mainBox.appendChild(ele);
        };

        let musicStr = [
            '<div class="xf-MusicPlayer-Main">',
            '  <div class="xf-switchPlayer">',
            '    <i class="iconfont icon-jiantou2"></i>',
            '  </div>',
            '  <div class="xf-insideSong">',
            '    <div class="xf-songPicture">',
            '      <img src="https://a1.boltp.com/2026/08/04/6a717cac1618a.jpg" alt="加载中..." class="xf-musicPicture">',
            '    </div>',
            '    <div class="xf-musicControl">',
            '      <div class="xf-topControl">',
            '        <div class="xf-introduce">',
            '          <h3 class="xf-songName">加载歌单中...</h3>',
            '          <p class="xf-singer">请稍候</p>',
            '        </div>',
            '        <ul class="xf-playerControl">',
            '          <li class="xf-previousSong"><i class="iconfont icon-shangyishou xf-iconCircle"></i></li>',
            '          <li class="xf-playbackControl">',
            '            <i class="xf-pause iconfont icon-zantingtingzhi xf-iconCircle" style="display: none;"></i>',
            '            <i class="xf-playBack iconfont icon-bofang xf-iconCircle" style="display: block;"></i>',
            '          </li>',
            '          <li class="xf-nextSong"><i class="iconfont icon-xiayishou xf-iconCircle"></i></li>',
            '        </ul>',
            '      </div>',
            '      <ul class="xf-bottomControl">',
            '        <li class="xf-progressBar">',
            '          <span class="xf-currentTime">00:00</span>',
            '          <h5 class="xf-totalAudioProgress">',
            '            <p class="xf-audioProgress" style="width: 0;"></p>',
            '          </h5>',
            '          <span class="xf-totalTime">00:00</span>',
            '        </li>',
            '        <li class="xf-playlistBtn"><i class="iconfont icon-gedan xf-iconCircle"></i></li>',
            '      </ul>',
            '    </div>',
            '  </div>',
            '  <div class="xf-outsideSongList">',
            '    <ul class="xf-listOfSongs"></ul>',
            '  </div>',
            '</div>'
        ].join('');

        let lyricStr = '<div id="xf-lyric"><ul class="xf-AllLyric-box"></ul></div>';

        characterToElement(musicStr, MusicPlayer);
        allPlayerFeatures();

        // 播放器 DOM 创建完成后重新应用站点颜色主题
        if (typeof ColorThemeManager !== 'undefined') {
            ColorThemeManager.applyColor(ColorThemeManager.getColor());
        }

        /* =========================
           播放器全部功能
        ========================= */
        function allPlayerFeatures() {

            // 创建 audio 元素
            const xfAudio = document.createElement('audio');
            xfAudio.id = 'xf-musicAudio';
            playerBody.appendChild(xfAudio);
            const xfMusicAudio = document.getElementById('xf-musicAudio');
            xfMusicAudio.controls = 0;

            // 仅在线上模式创建歌词条
            if (interfaceAndLocal === null) {
                characterToElement(lyricStr, playerBody);
            }

            const setTimeoutPromise = delay => new Promise(resolve => setTimeout(resolve, delay));
            const playMusic = () => xfMusicAudio.play().catch(error => console.warn(`浏览器默认限制了自动播放：${error}`));
            const pauseMusic = () => xfMusicAudio.pause();

            // DOM 引用
            const getEle = dom => MusicPlayer.querySelector(dom);

            const MusicPlayerMain    = getEle('.xf-MusicPlayer-Main'),
                  switchPlayer       = getEle('.xf-switchPlayer'),
                  switchArrow        = switchPlayer.querySelector('.icon-jiantou2'),
                  musicPicture       = getEle('.xf-musicPicture'),
                  songName           = getEle('.xf-songName'),
                  singer             = getEle('.xf-singer'),
                  previousSong       = getEle('.xf-previousSong'),
                  playbackControl    = getEle('.xf-playbackControl'),
                  pause              = playbackControl.querySelector('.xf-pause'),
                  playBack           = playbackControl.querySelector('.xf-playBack'),
                  nextSong           = getEle('.xf-nextSong'),
                  totalAudioProgress = getEle('.xf-totalAudioProgress'),
                  audioProgress      = getEle('.xf-audioProgress'),
                  playlistBtn        = getEle('.xf-playlistBtn'),
                  outsideSongList    = getEle('.xf-outsideSongList'),
                  listOfSongs        = getEle('.xf-listOfSongs'),
                  xfLyric            = playerBody.querySelector('#xf-lyric');

            const currentTimeEl = getEle('.xf-currentTime');
            const totalTimeEl   = getEle('.xf-totalTime');

            // 主题 class
            const themeStyle = MusicPlayer.getAttribute('data-themeColor');
            themeStyle === null
                ? MusicPlayerMain.classList.add('xf-girlPink')
                : MusicPlayerMain.classList.add(themeStyle);

            // 自定义底部偏移
            const bottomHeight = MusicPlayer.getAttribute('data-bottomHeight');
            if (bottomHeight) {
                MusicPlayerMain.style.bottom = bottomHeight;
            }

            /* ---------- 图片懒加载 ---------- */
            const lazyLoadImages = () => {
                const images = playerBody.querySelectorAll('img[data-musicLjz-src]');
                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            const src = img.getAttribute('data-musicLjz-src');
                            img.setAttribute('src', src);
                            img.onload = () => {
                                observer.unobserve(img);
                                img.removeAttribute('data-musicLjz-src');
                            };
                        }
                    });
                });
                images.forEach(image => observer.observe(image));
            };

            /* ---------- 播放/暂停 UI 状态切换 ---------- */
            const removebePlaying = () => {
                pause.style.display = 'none';
                playBack.style.display = 'block';
                playbackControl.classList.remove('xf-bePlaying');
                musicPicture.classList.add('xf-pauseRotation');
                if (interfaceAndLocal === null && xfLyric) {
                    xfLyric.classList.add('xf-lyricHidden');
                    xfLyric.classList.remove('xf-lyricShow');
                }
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'paused';
                }
            };

            const addPlaying = () => {
                pause.style.display = 'block';
                playBack.style.display = 'none';
                playbackControl.classList.add('xf-bePlaying');
                musicPicture.classList.remove('xf-pauseRotation');
                if (interfaceAndLocal === null && xfLyric) {
                    xfLyric.classList.remove('xf-lyricHidden');
                    xfLyric.classList.add('xf-lyricShow');
                }
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'playing';
                }
            };

            /* ---------- 通知弹窗 ---------- */
            let xfMusicPop;
            let isAnimationInProgress = 0;

            const displayPopup = async musicName => {
                if (isAnimationInProgress) { return; }
                if (!xfMusicPop) {
                    xfMusicPop = document.createElement('div');
                    xfMusicPop.classList.add('xf-music-pop');
                    playerBody.appendChild(xfMusicPop);
                    if (typeof ColorThemeManager !== 'undefined') {
                        ColorThemeManager.applyColor(ColorThemeManager.getColor());
                    }
                }
                xfMusicPop.innerHTML = musicName.replace(/\n/g, '<br>');
                isAnimationInProgress = 1;
                xfMusicPop.classList.add('show');
                await setTimeoutPromise(800);
                xfMusicPop.classList.remove('show');
                await setTimeoutPromise(300);
                isAnimationInProgress = 0;
            };

            /* ---------- 自动播放检测 ---------- */
            const detectionPlay = async () => {
                await setTimeoutPromise(2000);
                if (xfMusicAudio.paused) {
                    console.warn('您的浏览器不支持自动播放音乐，请手动点击播放器继续欣赏歌曲吧~');
                    removebePlaying();
                } else {
                    displayPopup(`正在播放 ${songName.textContent}`);
                    addPlaying();
                }
            };

            /* ---------- 初始化时淡出/自动播放 ---------- */
            const fadeOutPlayer = async () => {
                if (MusicPlayer.getAttribute('data-fadeOutAutoplay') !== null) {
                    xfMusicAudio.autoplay = true;
                    await setTimeoutPromise(1000);
                    detectionPlay();
                    switchArrow.classList.add('xf-jiantou1');
                    MusicPlayerMain.classList.add('xf-playerShow');
                    playMusic();
                } else {
                    removebePlaying();
                }
            };
            fadeOutPlayer();

            /* ---------- 渲染歌曲列表项 ---------- */
            const playerMusicItem = (index, music, picture, Title, Author, loadingTime) => {
                let lis = [
                    `<li class="xf-songsItem" data-index="${index}" data-mp3url="${music}">`,
                    '  <div class="xf-songListSongPictures">',
                    `    <img data-musicLjz-src="${picture + '?param=200x200'}" src="https://a1.boltp.com/2026/08/04/6a717cac1618a.jpg" alt="songPicture" class="xf-playlistImg">`,
                    '  </div>',
                    '  <div class="xf-playlistSongInformation">',
                    '    <div class="xf-songTitle">',
                    `      <h5 class="xf-songName">${Title}</h5>`,
                    '      <p class="xf-authorAndDuration">',
                    `        <span class="xf-songAuthor">${Author}</span>`,
                    `        <span class="xf-songLength iconfont icon-shijian">\t${loadingTime}</span>`,
                    '      </p>',
                    '    </div>',
                    '  </div>',
                    '</li>'
                ].join('');
                characterToElement(lis, listOfSongs);
            };

            /* ---------- 网络请求工具 ---------- */
            const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
                return Promise.race([
                    fetch(url, options),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('请求超时')), timeout))
                ]);
            };

            async function fetchData(url, method = 'GET', headers = {}, body = null) {
                try {
                    const res = await fetchWithTimeout(url, { method, headers, body });
                    const data = await res.json();
                    return data;
                } catch (error) {
                    console.error('数据获取失败:', error);
                    songName.textContent = '加载失败，点击重试';
                    singer.textContent = '网络错误或超时';
                    throw error;
                }
            }

            /* ---------- 歌单 URL ---------- */
            const musicUrl = (() => {
                if (interfaceAndLocal !== null) {
                    return interfaceAndLocal.trim();
                } else if (xfSongList !== null) {
                    return `${musicApi}/musicAll/?playlistId=${xfSongList.trim()}`;
                } else {
                    return null;
                }
            })();

            /* ---------- 时间格式化 ---------- */
            const addLeadingZero = num => num < 10 ? `0${num}` : num;

            function convertTime(duration) {
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60);
                return `${addLeadingZero(minutes)}:${addLeadingZero(seconds)}`;
            }

            function millisecondConversion(milliseconds) {
                const minutes = addLeadingZero(Math.floor(milliseconds / 60000));
                const seconds = addLeadingZero(Math.floor((milliseconds % 60000) / 1000));
                return `${minutes}:${seconds} `;
            }

            /* ---------- MediaSession ---------- */
            function initMediaSession() {
                if (!('mediaSession' in navigator)) return;
                const actionHandlers = {
                    play:          () => { if (xfMusicAudio.paused) { playbackControl.click(); } },
                    pause:         () => { if (!xfMusicAudio.paused) { playbackControl.click(); } },
                    previoustrack: () => { previousSong.click(); },
                    nexttrack:     () => { nextSong.click(); },
                    seekbackward:  null,
                    seekforward:   null,
                    stop:          null
                };
                for (const [action, handler] of Object.entries(actionHandlers)) {
                    try {
                        navigator.mediaSession.setActionHandler(action, handler);
                    } catch (error) {
                        console.warn(`MediaSession action "${action}" not supported`);
                    }
                }
            }

            function updateMediaMetadata(title, artist, artwork) {
                if (!('mediaSession' in navigator)) return;
                const cleanArtwork = artwork.split('?')[0];
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: title,
                    artist: artist,
                    album: '',
                    artwork: [
                        { src: cleanArtwork, sizes: '96x96', type: 'image/jpeg' },
                        { src: cleanArtwork, sizes: '128x128', type: 'image/jpeg' },
                        { src: cleanArtwork, sizes: '192x192', type: 'image/jpeg' },
                        { src: cleanArtwork, sizes: '256x256', type: 'image/jpeg' },
                        { src: cleanArtwork, sizes: '384x384', type: 'image/jpeg' },
                        { src: cleanArtwork, sizes: '512x512', type: 'image/jpeg' }
                    ]
                });
            }

            initMediaSession();

            /* =========================
               交互控制（核心）
            ========================= */
            const clickControl = () => {

                let isFunctionTriggered = false;

                /* ---------- 播放/暂停切换 ---------- */
                const togglePlayback = () => {
                    const domLength = MusicPlayer.getElementsByClassName('xf-bePlaying').length;
                    if (domLength > 0) {
                        displayPopup('音乐已暂停');
                        pauseMusic();
                        removebePlaying();
                    } else {
                        displayPopup(`正在播放 ${songName.textContent}`);
                        playMusic();
                        addPlaying();
                        isFunctionTriggered = true;
                    }
                };

                playbackControl.addEventListener('click', togglePlayback);
                // 键盘事件：存储引用，SPA 切换时可清理
                if (window.__xfKeyupHandler) {
                    window.removeEventListener('keyup', window.__xfKeyupHandler);
                }
                window.__xfKeyupHandler = e => {
                    if (e.key === ' ' || e.keyCode === 32) {
                        togglePlayback();
                    }
                };
                window.addEventListener('keyup', window.__xfKeyupHandler);

                MusicPlayerMain.style.opacity = 0;

                let isLoading = false;
                let retryTimer = null;
                let expectedSongCount = 0;
                let pendingAudioLoadTimer = null;

                /* =========================
                   歌单加载与歌曲管理
                ========================= */
                const playBackAndForth = async () => {

                    if (!musicUrl) {
                        songName.textContent = '未配置歌单';
                        singer.textContent = '请设置 data-localMusic 或 data-songList';
                        return;
                    }
                    if (isLoading) return;
                    isLoading = true;
                    clearTimeout(retryTimer);

                    songName.textContent = '加载歌单中...';
                    singer.textContent = '请稍候';

                    try {
                        let res = await fetchData(musicUrl);
                        if (interfaceAndLocal === null && xfSongList !== null) {
                            res = res.playlist.tracks;
                        }

                        listOfSongs.innerHTML = '';
                        expectedSongCount = res.length;

                        await Promise.all(
                            res.map(async data => {
                                const musicId    = data.id;
                                const musicName  = data.name;
                                const artistsname = data.artistsname
                                    || (data.ar ? data.ar.map(a => a.name).join(' / ') : '未知歌手');
                                const picurl     = data.picurl || data.al.picUrl;
                                const mp3        = data.url || `${musicApi}/musicAll/?songId=${musicId}&mp3Url=mp3`;
                                const duration   = interfaceAndLocal === null
                                    ? (data.duration !== undefined ? convertTime(data.duration) : millisecondConversion(data.dt))
                                    : data.musicDuration;

                                playerMusicItem(musicId, mp3, picurl, musicName, artistsname, duration);
                            })
                        );

                        // 用 MutationObserver 等待 DOM 渲染完成（替代轮询，带 10 秒超时保护）
                        const checkSongsItemLength = () => {
                            return new Promise((resolve) => {
                                const startTime = Date.now();
                                let observer = null;
                                const check = () => {
                                    const lisNum = MusicPlayer.querySelectorAll('.xf-songsItem').length;
                                    if (lisNum === expectedSongCount || Date.now() - startTime > 10000) {
                                        if (lisNum !== expectedSongCount) console.warn('歌曲列表渲染超时，继续执行');
                                        if (observer) observer.disconnect();
                                        resolve(Date.now() - startTime);
                                        return true;
                                    }
                                    return false;
                                };
                                if (!check()) {
                                    observer = new MutationObserver(check);
                                    observer.observe(MusicPlayer, { childList: true, subtree: true });
                                }
                            });
                        };

                        /* ---------- Cookie 工具 ---------- */
                        const setCookie = (name, value, days) => {
                            const date = new Date();
                            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                            const expires = `expires=${date.toUTCString()}`;
                            document.cookie = `${name}=${value}; ${expires}; path=/`;
                        };

                        const getCookie = name => {
                            const cookieName = `${name}=`;
                            const cookies = document.cookie.split(';');
                            for (let cookie of cookies) {
                                while (cookie.charAt(0) === ' ') {
                                    cookie = cookie.substring(1);
                                }
                                if (cookie.indexOf(cookieName) === 0) {
                                    return cookie.substring(cookieName.length, cookie.length);
                                }
                            }
                            return null;
                        };

                        const deleteCookie = name => {
                            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                        };

                        const cookieName     = 'xf-MusicPlayer';
                        const memoryPlayback = MusicPlayer.getAttribute('data-memory');
                        let cookieData       = null;
                        const rsCookie       = getCookie(cookieName);

                        const detectionCookies = callback => {
                            if (memoryPlayback === '1' || memoryPlayback === 'true') {
                                callback();
                            } else {
                                if (rsCookie) { deleteCookie(cookieName); }
                            }
                        };

                        await checkSongsItemLength();

                        let songsItem = MusicPlayer.querySelectorAll('.xf-songsItem');
                        if (songsItem.length === 0) {
                            console.error('歌曲未被添加...');
                            songName.textContent = '暂无歌曲';
                            singer.textContent = '请检查网络';
                            isLoading = false;
                            return;
                        }

                        /* ---------- 确定初始歌曲索引 ---------- */
                        let currentSongIndex = 0;

                        const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                        const randomSong = getRandomInt(0, songsItem.length - 1);
                        const songStr = MusicPlayer.getAttribute('data-random');

                        if (songStr !== null && songStr !== 'false') {
                            if (songStr !== '' && !isNaN(Number(songStr))) {
                                currentSongIndex = Number(songStr) > 0 && songStr <= songsItem.length
                                    ? Number(songStr) - 1
                                    : 0;
                            } else {
                                currentSongIndex = randomSong;
                            }
                        }

                        detectionCookies(() => {
                            if (rsCookie) {
                                const { musicId } = JSON.parse(rsCookie);
                                currentSongIndex = musicId >= songsItem.length ? 0 : musicId;
                            } else {
                                cookieData = { musicId: 0, musicTime: 0 };
                                setCookie(cookieName, JSON.stringify(cookieData), 30);
                            }
                        });

                        /* ---------- 切换歌曲 ---------- */
                        const updateSong = index => {
                            MusicPlayerMain.style.opacity = 1;

                            songsItem.forEach((ele, i) => {
                                ele.classList.toggle('xf-inExecution', i === index);
                            });

                            const item     = songsItem[index];
                            const itemPic  = (item.querySelector('.xf-playlistImg')?.getAttribute('data-musicljz-src'))
                                ?? item.querySelector('.xf-playlistImg')?.src;
                            const itemUrl  = item.dataset.mp3url;
                            const itemName = item.querySelector('.xf-songName').textContent;
                            const itemAuto = item.querySelector('.xf-songAuthor').textContent;

                            musicPicture.src = itemPic;
                            musicPicture.alt = itemName;
                            songName.textContent = itemName;
                            singer.textContent = itemAuto;
                            updateMediaMetadata(itemName, itemAuto, itemPic);

                            // 重置时间显示
                            if (currentTimeEl) currentTimeEl.textContent = '00:00';
                            if (totalTimeEl)   totalTimeEl.textContent = '00:00';

                            if (pendingAudioLoadTimer) {
                                clearTimeout(pendingAudioLoadTimer);
                                pendingAudioLoadTimer = null;
                            }

                            pendingAudioLoadTimer = setTimeout(() => {

                                xfMusicAudio.src = itemUrl;

                                if (isFunctionTriggered || MusicPlayer.getAttribute('data-fadeOutAutoplay') !== null) {
                                    playMusic();
                                    addPlaying();
                                    displayPopup(`正在播放 ${itemName}`);
                                }

                                // 歌词显示开关
                                const lyricsShowOrHide = MusicPlayer.getAttribute('data-lyrics');
                                if (lyricsShowOrHide === '0' || lyricsShowOrHide === 'false') {
                                    if (xfLyric) xfLyric.style.display = 'none';
                                    pendingAudioLoadTimer = null;
                                    return;
                                }

                                // 滚动时歌词条隐藏/显示
                                function hasScrollbar() {
                                    return playerBody.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
                                }

                                if (window.__xfScrollHandler) {
                                    document.removeEventListener('scroll', window.__xfScrollHandler);
                                }

                                if (hasScrollbar()) {
                                    window.__xfScrollHandler = () => {
                                        if (xfMusicAudio.paused) return;
                                        if ((window.innerHeight + window.scrollY) >= playerBody.offsetHeight) {
                                            if (xfLyric) {
                                                xfLyric.classList.add('xf-lyricHidden');
                                                xfLyric.classList.remove('xf-lyricShow');
                                            }
                                        } else {
                                            if (xfLyric) {
                                                xfLyric.classList.add('xf-lyricShow');
                                                xfLyric.classList.remove('xf-lyricHidden');
                                            }
                                        }
                                    };
                                    document.addEventListener('scroll', window.__xfScrollHandler);
                                }

                                /* ---------- 歌词获取与显示 ---------- */
                                if (interfaceAndLocal === null && lyricsShowOrHide !== '0' && lyricsShowOrHide !== 'false' && xfLyric) {

                                    let xfAllLyri = xfLyric.querySelector('.xf-AllLyric-box');
                                    const eleInExecution = Array.from(songsItem).filter(ele =>
                                        ele.classList.contains('xf-inExecution')
                                    );

                                    if (eleInExecution.length === 0) return;

                                    const musicLyric = eleInExecution[0].dataset.index;
                                    const wyLyric = `${musicApi}/musicAll/?lyric=${musicLyric}`;

                                    fetchData(wyLyric).then(res => {
                                        xfAllLyri.innerHTML = '';

                                        if (res.code === 200) {
                                            const lyricsData = res.lrc.lyric;
                                            const lines = lyricsData.split('\n');

                                            const lyricsArray = lines.map(line => {
                                                const timeEndIndex = line.indexOf(']');
                                                if (timeEndIndex !== -1) {
                                                    const time = (() => {
                                                        const [minutes, seconds] = line.substring(1, timeEndIndex)
                                                            .split(':').map(parseFloat);
                                                        return minutes * 60 + seconds;
                                                    })();
                                                    const text = line.substring(timeEndIndex + 1).trim();
                                                    return { time, text };
                                                } else {
                                                    return null;
                                                }
                                            }).filter(lyric => lyric !== null);

                                            // 渲染歌词 DOM
                                            lyricsArray.forEach(lyric => {
                                                const lisEle = document.createElement('li');
                                                lisEle.classList.add('xf-ly');
                                                lisEle.innerHTML = `<span>${lyric.text}</span>`;
                                                xfAllLyri.appendChild(lisEle);
                                            });

                                            /* ---------- 歌词滚动控制 ---------- */
                                            let lastLyricIndex = -1;
                                            let scrollAnimFrame = null;
                                            let scrollStartTime  = null;
                                            let scrollOverflow   = 0;
                                            const scrollSpeed = 50; // 像素/秒

                                            function stopLyricScroll() {
                                                if (scrollAnimFrame) {
                                                    cancelAnimationFrame(scrollAnimFrame);
                                                    scrollAnimFrame = null;
                                                    scrollStartTime = null;
                                                }
                                            }

                                            function startLyricScroll(span, overflow, segmentWidth) {
                                                stopLyricScroll();
                                                scrollOverflow = overflow;
                                                const loopWidth = segmentWidth || (overflow + 40);
                                                const scroll = (timestamp) => {
                                                    if (!scrollStartTime) scrollStartTime = timestamp;
                                                    const elapsed = timestamp - scrollStartTime;
                                                    const offset = (elapsed / 1000 * scrollSpeed) % loopWidth;
                                                    span.style.transform = `translateX(-${offset}px)`;
                                                    scrollAnimFrame = requestAnimationFrame(scroll);
                                                };
                                                scrollAnimFrame = requestAnimationFrame(scroll);
                                            }

                                            function updateLyricDisplay() {
                                                const currentTime = xfMusicAudio.currentTime;

                                                // 移除所有行的高亮
                                                for (let i = 0; i < lyricsArray.length; i++) {
                                                    const el = xfAllLyri.children[i];
                                                    if (el) el.classList.remove('xf-textShow');
                                                }

                                                // 二分查找当前歌词行
                                                let currentLyricIndex;
                                                for (let j = 0; j < lyricsArray.length; j++) {
                                                    if (currentTime >= lyricsArray[j].time) {
                                                        currentLyricIndex = j;
                                                        if (j < lyricsArray.length - 1 && currentTime >= lyricsArray[j + 1].time) continue;
                                                        break;
                                                    }
                                                }

                                                const lisEle = xfAllLyri.children[currentLyricIndex];
                                                if (lisEle) lisEle.classList.add('xf-textShow');

                                                // 同一行不重复处理
                                                if (currentLyricIndex === lastLyricIndex) return;
                                                lastLyricIndex = currentLyricIndex;

                                                // 清除所有行的滚动状态
                                                const allItems = xfAllLyri.querySelectorAll('.xf-ly');
                                                allItems.forEach(item => {
                                                    item.classList.remove('scrolling');
                                                    const sp = item.querySelector('span');
                                                    if (sp) {
                                                        sp.style.transform = '';
                                                        const original = item.getAttribute('data-original-text');
                                                        if (original) sp.textContent = original;
                                                    }
                                                });
                                                stopLyricScroll();

                                                // 当前行超宽时启动滚动
                                                if (lisEle) {
                                                    const span = lisEle.querySelector('span');
                                                    if (span) {
                                                        const originalText = span.textContent;
                                                        lisEle.setAttribute('data-original-text', originalText);
                                                        requestAnimationFrame(() => {
                                                            span.textContent = originalText;
                                                            if (span.scrollWidth > lisEle.clientWidth) {
                                                                const separator = '　　';
                                                                span.textContent = (originalText + separator).repeat(5);
                                                                const overflow = span.scrollWidth - lisEle.clientWidth;
                                                                const segmentWidth = span.scrollWidth / 5;
                                                                startLyricScroll(span, overflow, segmentWidth);
                                                            }
                                                        });
                                                    }
                                                }
                                            }

                                            // 绑定歌词 timeupdate（先移除旧监听）
                                            if (window.__xfLyricTimeUpdate) {
                                                xfMusicAudio.removeEventListener('timeupdate', window.__xfLyricTimeUpdate);
                                            }
                                            window.__xfLyricTimeUpdate = updateLyricDisplay;
                                            xfMusicAudio.addEventListener('timeupdate', updateLyricDisplay);
                                        }
                                    }).catch(error => console.error(`歌词获取失败：${error}`));
                                }

                                pendingAudioLoadTimer = null;
                            }, 0);
                        };

                        /* ---------- 元数据加载完成 ---------- */
                        const loadedMetadataHandler = () => {
                            if (totalTimeEl && !isNaN(xfMusicAudio.duration)) {
                                totalTimeEl.textContent = convertTime(xfMusicAudio.duration);
                            }

                            detectionCookies(() => {
                                const freshCookie = getCookie(cookieName);
                                if (!freshCookie) return;
                                const { musicTime } = JSON.parse(freshCookie);
                                const duration = xfMusicAudio.duration;
                                xfMusicAudio.currentTime = musicTime >= duration ? 0 : musicTime;
                                playMusic();
                            });

                            xfMusicAudio.removeEventListener('loadedmetadata', loadedMetadataHandler);
                        };

                        // 先绑定监听器，再加载歌曲，防止缓存音频的 loadedmetadata 在绑定前触发
                        xfMusicAudio.addEventListener('loadedmetadata', loadedMetadataHandler);

                        // 首次加载歌曲
                        updateSong(currentSongIndex);

                        /* ---------- Cookie 记录 ---------- */
                        const setCk = id => {
                            detectionCookies(() => {
                                cookieData = { musicId: id, musicTime: 0 };
                                setCookie(cookieName, JSON.stringify(cookieData), 30);
                            });
                        };

                        /* ---------- 上一首/下一首 ---------- */
                        const prevMusic = () => {
                            isFunctionTriggered = true;
                            currentSongIndex = (currentSongIndex - 1 + songsItem.length) % songsItem.length;
                            updateSong(currentSongIndex);
                            setCk(currentSongIndex);
                        };

                        const nextMusic = () => {
                            isFunctionTriggered = true;
                            currentSongIndex = (currentSongIndex + 1) % songsItem.length;
                            updateSong(currentSongIndex);
                            setCk(currentSongIndex);
                        };

                        // 列表项点击
                        songsItem.forEach((item, index) => {
                            item.addEventListener('click', () => {
                                isFunctionTriggered = true;
                                currentSongIndex = index;
                                updateSong(currentSongIndex);
                                setCk(currentSongIndex);
                            });
                        });

                        nextSong.addEventListener('click', nextMusic);
                        previousSong.addEventListener('click', prevMusic);

                        // 键盘左右箭头切歌
                        window.addEventListener('keyup', e => {
                            if (e.key === 'ArrowRight' || e.keyCode === 39) {
                                isFunctionTriggered = true;
                                currentSongIndex = (currentSongIndex + 1) % songsItem.length;
                                updateSong(currentSongIndex);
                                setCk(currentSongIndex);
                            }
                            if (e.key === 'ArrowLeft' || e.keyCode === 37) {
                                prevMusic();
                            }
                        });

                        /* ---------- 进度条自动更新（播放中） ---------- */
                        let lastCookieWriteTime = 0;

                        xfMusicAudio.addEventListener('timeupdate', () => {
                            if (isSliding) return;

                            const duration    = xfMusicAudio.duration;
                            const currentTime = xfMusicAudio.currentTime;
                            const progress    = (currentTime / duration) * 100;

                            audioProgress.style.width = `${progress}%`;

                            if (currentTimeEl) {
                                currentTimeEl.textContent = convertTime(currentTime);
                            }

                            // 兜底：loadedmetadata 未触发时，从 timeupdate 补救总时长
                            if (totalTimeEl && !isNaN(duration) && totalTimeEl.textContent === '00:00') {
                                totalTimeEl.textContent = convertTime(duration);
                            }

                            // Cookie 节流：每 5 秒写一次，避免每秒多次写入
                            const now = Date.now();
                            if (now - lastCookieWriteTime >= 5000) {
                                lastCookieWriteTime = now;
                                detectionCookies(() => {
                                    cookieData = { musicId: currentSongIndex, musicTime: xfMusicAudio.currentTime };
                                    setCookie(cookieName, JSON.stringify(cookieData), 30);
                                });
                            }

                        });

                        // 歌曲自然播放结束 → 自动下一首（用 ended 事件替代浮点比较）
                        xfMusicAudio.addEventListener('ended', nextMusic);


                        const currentMusic = () => {
                            if (musicPicture.src === '' || songName.textContent === '') {
                                nextMusic();
                                pauseMusic();
                                removebePlaying();
                                displayPopup('音乐已停止播放！');
                            }
                        };
                        currentMusic();

                        lazyLoadImages();

                    } catch (error) {
                        console.error(`发生错误：${error}`);
                        songName.textContent = '加载失败';
                        singer.textContent = '点击重试';
                    } finally {
                        isLoading = false;
                        retryTimer = setTimeout(() => {
                            const lis = listOfSongs.querySelectorAll('.xf-songsItem');
                            if (!isLoading && lis.length === 0) {
                                console.warn('歌单未成功加载，尝试重新获取');
                                playBackAndForth();
                            }
                        }, 8000);
                    }
                };

                playBackAndForth();

                /* =========================
                   进度条拖拽（修复版）
                   - 事件绑定到 document，防止快速拖动丢失
                   - 拖拽期间禁用 CSS transition 消除延迟
                   - 缓存 getBoundingClientRect 避免每帧重排
                ========================= */
                let isSliding  = false;
                let cachedRect = null;

                const getClientX = e => e.touches ? e.touches[0].clientX : e.clientX;

                const startSlide = e => {
                    // 阻止触摸时页面滚动
                    if (e.cancelable) e.preventDefault();

                    isSliding = true;

                    // 禁用 CSS 过渡动画，进度条即时跟随鼠标
                    audioProgress.classList.add('xf-no-transition');

                    // 缓存进度条尺寸，避免拖拽期间每帧触发 reflow
                    cachedRect = totalAudioProgress.getBoundingClientRect();

                    pauseMusic();
                    removebePlaying();
                    slide(e);

                    // 在 document 上监听，鼠标移出进度条也能继续跟踪
                    document.addEventListener('mousemove', slide);
                    document.addEventListener('mouseup', endSlide);
                    document.addEventListener('touchmove', slide, { passive: false });
                    document.addEventListener('touchend', endSlide);

                    // 拖拽期间禁止文字选中
                    document.body.style.userSelect      = 'none';
                    document.body.style.webkitUserSelect = 'none';
                };

                const slide = e => {
                    if (!isSliding || !cachedRect) return;
                    if (e.cancelable) e.preventDefault();

                    const clickX       = getClientX(e) - cachedRect.left;
                    const clickProgress = Math.max(0, Math.min(100, (clickX / cachedRect.width) * 100));

                    audioProgress.style.width = `${clickProgress}%`;

                    // 实时显示拖拽位置对应的时间
                    if (currentTimeEl && !isNaN(xfMusicAudio.duration)) {
                        currentTimeEl.textContent = convertTime((clickProgress / 100) * xfMusicAudio.duration);
                    }
                };

                const endSlide = () => {
                    if (!isSliding) return;
                    isSliding = false;

                    // 将播放进度跳转到拖拽结束位置（使用 cachedRect 避免 parseFloat 空字符串）
                    const duration = xfMusicAudio.duration;
                    if (!isNaN(duration) && cachedRect) {
                        const clickX = parseFloat(audioProgress.style.width) || 0;
                        const newTime = (clickX / 100) * duration;
                        if (!isNaN(newTime)) {
                            xfMusicAudio.currentTime = newTime;
                            if (currentTimeEl) {
                                currentTimeEl.textContent = convertTime(newTime);
                            }
                        }
                    }

                    // 恢复 CSS 过渡动画
                    requestAnimationFrame(() => {
                        audioProgress.classList.remove('xf-no-transition');
                    });

                    cachedRect = null;
                    playMusic();
                    addPlaying();

                    // 移除 document 上的拖拽监听
                    document.removeEventListener('mousemove', slide);
                    document.removeEventListener('mouseup', endSlide);
                    document.removeEventListener('touchmove', slide);
                    document.removeEventListener('touchend', endSlide);

                    // 恢复文字选中
                    document.body.style.userSelect      = '';
                    document.body.style.webkitUserSelect = '';
                };

                // mousedown / touchstart 触发拖拽
                totalAudioProgress.addEventListener('mousedown', startSlide);
                totalAudioProgress.addEventListener('touchstart', startSlide, { passive: false });

                /* ---------- 播放列表展开/收起 ---------- */
                playlistBtn.addEventListener('click', () => {
                    const showSong = MusicPlayer.getElementsByClassName('xf-outsideSongListShow').length;
                    if (showSong) {
                        outsideSongList.classList.remove('xf-outsideSongListShow');
                    } else {
                        outsideSongList.classList.add('xf-outsideSongListShow');
                    }
                });

                /* ---------- 按钮悬浮提示 ---------- */
                let throughDisplayDiv;

                const goThroughShowAndLeaveHidden = () => {
                    if (!throughDisplayDiv) {
                        throughDisplayDiv = document.createElement('div');
                        throughDisplayDiv.classList.add('xf-throughDisplay');
                        playerBody.appendChild(throughDisplayDiv);
                    }

                    const throughDisplay = document.querySelector('.xf-throughDisplay');
                    const arr = [previousSong, playbackControl, nextSong, playlistBtn];

                    function handleMouseEnter(event) {
                        const mouseX = event.pageX;
                        const mouseY = event.pageY;
                        throughDisplay.style.left = `${mouseX + 15}px`;
                        throughDisplay.style.top  = `${mouseY}px`;

                        switch (this) {
                            case previousSong:    eleShow('上一首');   break;
                            case playbackControl: eleShow('播放音乐'); break;
                            case nextSong:        eleShow('下一首');   break;
                            case playlistBtn:     eleShow('查看歌单'); break;
                            default:              eleHidden();
                        }
                    }

                    const eleShow  = text => {
                        throughDisplay.style.display = 'block';
                        throughDisplay.textContent = text;
                    };
                    const eleHidden = () => {
                        throughDisplay.style.display = 'none';
                    };

                    for (let i = 0; i < arr.length; i++) {
                        const ele = arr[i];
                        ele.addEventListener('mouseenter', handleMouseEnter);
                        ele.addEventListener('mouseleave', eleHidden);
                        ele.addEventListener('click', eleHidden);
                    }
                };

                goThroughShowAndLeaveHidden();

            }; // end clickControl

            clickControl();

            // 播放器 Ripple 效果（事件委托，自动覆盖动态创建的 .xf-songsItem）
            MusicPlayerMain.addEventListener('pointerdown', function(e) {
                // 动画关闭时禁用水波纹（与站点全局动画开关保持一致）
                if (document.documentElement.classList.contains('animations-off')) return;
                const target = e.target.closest(
                    '.xf-switchPlayer, .xf-previousSong, .xf-playbackControl, .xf-nextSong, .xf-playlistBtn, .xf-songsItem'
                );
                if (!target) return;

                const rect = target.getBoundingClientRect();
                const diameter = Math.max(rect.width, rect.height);
                const radius = diameter / 2;

                const circle = document.createElement('span');
                circle.classList.add('xf-ripple');
                circle.style.width = circle.style.height = diameter + 'px';
                circle.style.left = (e.clientX - rect.left - radius) + 'px';
                circle.style.top = (e.clientY - rect.top - radius) + 'px';

                const old = target.querySelector('.xf-ripple');
                if (old) old.remove();

                target.appendChild(circle);
                setTimeout(() => circle.remove(), 600);
            });
            
            /* ---------- 展开/收起播放器面板 ---------- */
            const switchPlayerFun = () => {
                const playerToggleClasses = () => {
                    switchArrow.classList.toggle('xf-jiantou1');
                    MusicPlayerMain.classList.toggle('xf-playerShow');
                };

                switchPlayer.addEventListener('click', playerToggleClasses);

                document.addEventListener('click', function (event) {
                    if (!MusicPlayer.contains(event.target)) {
                        switchArrow.classList.remove('xf-jiantou1');
                        MusicPlayerMain.classList.remove('xf-playerShow');
                    }
                });
            };

            switchPlayerFun();

        } // end allPlayerFeatures

    } // end startExecutionPlayer

    const printStyle = [
        'padding: 5px 10px; border-radius: 5px 0 0 5px; background-color: #8b52ec; font-weight: bold;',
        'padding: 5px 10px; border-radius: 0 5px 5px 0; background-color: #a17eff; font-weight: bold;'
    ];

});
