"use strict";
window.addEventListener('DOMContentLoaded', function () {
    var playerEle = document.querySelectorAll('#xf-MusicPlayer')
    if (playerEle.length === 0) {
        return
    }

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
        alert('当前浏览器不支持解析 ES6 语法, 无法使用“xf-MusicPlayer”插件, 请升级您的浏览器!')
        window.location.href = 'https://support.dmeng.net/upgrade-your-browser.html?referrer=' + encodeURIComponent(window.location.href)
        return
    }

    const xfHead = document.head
    const playerBody = document.body
    const metaViewport = document.querySelector('meta[name="viewport"]')

    if (!metaViewport) {
        let newMeta = document.createElement('meta')
        newMeta.setAttribute('name', 'viewport')
        newMeta.setAttribute('content', 'width=device-width, initial-scale=1.0')
        xfHead.appendChild(newMeta)
    }

    let MusicPlayer = [...playerEle]
    if (MusicPlayer.length > 1) {
        MusicPlayer.splice(1)
    }
    MusicPlayer = MusicPlayer[0]
    
    let interfaceAndLocal = MusicPlayer.getAttribute('data-localMusic')
    const xfSongList = MusicPlayer.getAttribute('data-songList')

    let musicApi = `${location.protocol}//${MusicPlayer.getAttribute('data-musicApi')}`.trim()

    if (musicApi.slice(-4) === 'null') {
        musicApi = `${location.protocol}//api.xfyun.club`
    }

    if (musicApi === '' && interfaceAndLocal === null && xfSongList === null) {
        this.alert('请输入音乐API域名')
        return
    }

    customFile()

    function customFile() {
        const cdnName = MusicPlayer.getAttribute('data-cdnName')
        const wl = window.location
        let xfDomainName = cdnName === null ? `${wl.protocol}//${wl.hostname}${wl.port ? ':' + wl.port : ''}` : cdnName.trim()

        if (wl.protocol === 'https:') {
            const metaTag = document.createElement('meta')
            metaTag.setAttribute('http-equiv', 'Content-Security-Policy')
            metaTag.setAttribute('content', 'upgrade-insecure-requests')
            xfHead.appendChild(metaTag)
        }

        const removeDotAndSlash = str => str.replace(/(^[^a-zA-Z0-9]+)|([^a-zA-Z0-9]+$)/g, '')
        const filePath = MusicPlayer.getAttribute('data-filePath')
        if (filePath !== null) {
            xfDomainName += `/${removeDotAndSlash(filePath)}`
        }

        // 直接插入link，不进行fetch预检，错误由onerror捕获
        const appendStylesheet = href => {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = href
            link.crossOrigin = 'anonymous'
            link.onerror = () => {
                console.warn(`样式文件加载失败: ${href}，播放器可能显示异常`)
            }
            xfHead.appendChild(link)
            return Promise.resolve()
        }

        const xfplayIconCSS = './styles/xfplayIcon.css'
        const MusicPlayerCSS = './styles/xf-MusicPlayer.css'

        if (location.protocol === 'file:') {
            musicApi = 'https://api.xfyun.club'
        }
        
        Promise.all([
            appendStylesheet(xfplayIconCSS),
            appendStylesheet(MusicPlayerCSS),
        ]).catch(error => {
            console.error('样式加载出错:', error)
        })
    }

    startExecutionPlayer()

    function startExecutionPlayer() {
        const characterToElement = (str, mainBox) => {
            const parser = new DOMParser()
            let ele = parser.parseFromString(str, 'text/html')
            ele = ele.body.firstChild
            mainBox.appendChild(ele)
        }

        let musicStr = `<div class="xf-MusicPlayer-Main"><div class="xf-switchPlayer"><i class="iconfont icon-jiantou2"></i></div><div class="xf-insideSong"><div class="xf-songPicture"><img src="https://player.xfyun.club/img/playerLoad.gif" alt="加载中..." class="xf-musicPicture"></div><div class="xf-musicControl"><div class="xf-topControl"><div class="xf-introduce"><h3 class="xf-songName">加载歌单中...</h3><p class="xf-singer">请稍候</p></div><ul class="xf-playerControl"><li class="xf-previousSong"><i class="iconfont icon-shangyishou"></i></li><li class="xf-playbackControl"><i class="xf-pause iconfont icon-zantingtingzhi" style="display: none;"></i><i class="xf-playBack iconfont icon-bofang" style="display: block;"></i></li><li class="xf-nextSong"><i class="iconfont icon-xiayishou"></i></li></ul></div><ul class="xf-bottomControl"><li class="xf-audioFrequency"><i class="iconfont icon-shengyin-kai"></i></li><li class="xf-progressBar"><h5 class="xf-totalAudioProgress"><p class="xf-audioProgress" style="width: 0;"></p></h5></li><li class="xf-playlistBtn"><i class="iconfont icon-gedan"></i></li></ul></div></div><div class="xf-outsideSongList"><ul class="xf-listOfSongs"></ul></div></div>`

        let lyricStr = `<div id="xf-lyric"><ul class="xf-AllLyric-box"></ul></div>`
        characterToElement(musicStr, MusicPlayer)

        allPlayerFeatures()

        function allPlayerFeatures() {
            const xfAudio = document.createElement('audio')
            xfAudio.id = 'xf-musicAudio'
            playerBody.appendChild(xfAudio)
            const xfMusicAudio = document.getElementById('xf-musicAudio')
            xfMusicAudio.controls = 0
            if (interfaceAndLocal === null) {
                characterToElement(lyricStr, playerBody)
            }
            
            const setTimeoutPromise = delay => new Promise(resolve => setTimeout(resolve, delay))

            const playMusic = () => xfMusicAudio.play().catch(error => console.warn(`浏览器默认限制了自动播放：${error}`))

            const pauseMusic = () => xfMusicAudio.pause()

            const getEle = dom => MusicPlayer.querySelector(dom)
                , MusicPlayerMain = getEle('.xf-MusicPlayer-Main')
                , switchPlayer = getEle('.xf-switchPlayer')
                , switchArrow = switchPlayer.querySelector('.icon-jiantou2')
                , musicPicture = getEle('.xf-musicPicture')
                , songName = getEle('.xf-songName')
                , singer = getEle('.xf-singer')
                , previousSong = getEle('.xf-previousSong')
                , playbackControl = getEle('.xf-playbackControl')
                , pause = playbackControl.querySelector('.xf-pause')
                , playBack = playbackControl.querySelector('.xf-playBack')
                , nextSong = getEle('.xf-nextSong')
                , audioFrequency = getEle('.xf-audioFrequency')
                , totalAudioProgress = getEle('.xf-totalAudioProgress')
                , audioProgress = getEle('.xf-audioProgress')
                , playlistBtn = getEle('.xf-playlistBtn')
                , outsideSongList = getEle('.xf-outsideSongList')
                , listOfSongs = getEle('.xf-listOfSongs')
                , xfLyric = playerBody.querySelector('#xf-lyric')

            const themeStyle = MusicPlayer.getAttribute('data-themeColor')
            themeStyle === null ? MusicPlayerMain.classList.add('xf-original') : MusicPlayerMain.classList.add(themeStyle)

            const bottomHeight = MusicPlayer.getAttribute('data-bottomHeight')
            if (bottomHeight) {
                MusicPlayerMain.style.bottom = bottomHeight
            }

            const lazyLoadImages = () => {
                const images = playerBody.querySelectorAll('img[data-musicLjz-src]')
                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target
                            const src = img.getAttribute('data-musicLjz-src')
                            img.setAttribute('src', src)
                            img.onload = () => {
                                observer.unobserve(img)
                                img.removeAttribute('data-musicLjz-src')
                            }
                        }
                    })
                })

                images.forEach(image => observer.observe(image))
            }

            const removebePlaying = () => {
                pause.style.display = 'none'
                playBack.style.display = 'block'
                playbackControl.classList.remove('xf-bePlaying')
                musicPicture.classList.add('xf-pauseRotation')
                if (interfaceAndLocal === null && xfLyric) {
                    xfLyric.classList.add('xf-lyricHidden')
                    xfLyric.classList.remove('xf-lyricShow')
                }
            }

            const addPlaying = () => {
                pause.style.display = 'block'
                playBack.style.display = 'none'
                playbackControl.classList.add('xf-bePlaying')
                musicPicture.classList.remove('xf-pauseRotation')
                if (interfaceAndLocal === null && xfLyric) {
                    xfLyric.classList.remove('xf-lyricHidden')
                    xfLyric.classList.add('xf-lyricShow')
                }
            }

            const backgroundColors = ['rgba(85, 0, 255, .35)', 'rgba(0, 225, 255, .35)', 'rgba(255, 165, 0, .35)', 'rgba(0, 100, 0, .35)', 'rgba(80, 0, 0, .35)', 'rgba(255, 192, 203, .35)']
            const themeIndex = {
                'xf-original': 0,
                'xf-sky': 1,
                'xf-orange': 2,
                'xf-darkGreen': 3,
                'xf-wineRed': 4,
                'xf-girlPink': 5
            }
            const bgIndex = themeIndex[themeStyle] ?? 0

            let xfMusicPop
            let isAnimationInProgress = 0
const displayPopup = async musicName => {
    if (isAnimationInProgress) {
        return;
    }

    if (!xfMusicPop) {
        xfMusicPop = document.createElement('div');
        xfMusicPop.classList.add('xf-music-pop');
        playerBody.appendChild(xfMusicPop);
    }
    xfMusicPop.textContent = musicName;

    const randomColor = backgroundColors[bgIndex];

    isAnimationInProgress = 1;

    // 显示 Toast
    xfMusicPop.classList.add('show');

    // 保持 0.6 秒后隐藏
    await setTimeoutPromise(600);

    xfMusicPop.classList.remove('show');

    // 等动画结束后再解锁状态（过渡时间 0.25s）
    await setTimeoutPromise(300);
    isAnimationInProgress = 0;
};

            const detectionPlay = async () => {
                await setTimeoutPromise(2000)
                if (xfMusicAudio.paused) {
                    console.warn('您的浏览器不支持自动播放音乐，请手动点击播放器继续欣赏歌曲吧~')
                    removebePlaying()
                } else {
                    displayPopup(`正在播放：${songName.textContent}`)
                    addPlaying()
                }
            }

            const fadeOutPlayer = async () => {
                if (MusicPlayer.getAttribute('data-fadeOutAutoplay') !== null) {
                    xfMusicAudio.autoplay = true
                    await setTimeoutPromise(1000)
                    detectionPlay()
                    switchArrow.classList.add('xf-jiantou1')
                    MusicPlayerMain.classList.add('xf-playerShow')
                    playMusic()
                } else {
                    removebePlaying()
                }
            }
            fadeOutPlayer()

            const playerMusicItem = (index, music, picture, Title, Author, loadingTime) => {
                let lis = `<li class="xf-songsItem" data-index="${index}" data-mp3url="${music}"><div class="xf-songListSongPictures"><i class="xf-songIcon iconfont icon-bofang"></i><img data-musicLjz-src="${picture + '?param=200x200'}" src="https://player.xfyun.club/img/playerLoad.gif" alt="songPicture" class="xf-playlistImg"></div><div class="xf-playlistSongInformation"><div class="xf-songTitle"><h5 class="xf-songName">${Title}</h5><p class="xf-authorAndDuration"><span class="xf-songAuthor">${Author}</span><span class="xf-songLength iconfont icon-shijian">\t${loadingTime}</span></p></div></div></li>`
                characterToElement(lis, listOfSongs)
            }

            // 添加超时控制的fetch
            const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
                return Promise.race([
                    fetch(url, options),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('请求超时')), timeout)
                    )
                ])
            }

            async function fetchData(url, method = 'GET', headers = {}, body = null) {
                try {
                    const res = await fetchWithTimeout(url, { method, headers, body })
                    const data = await res.json()
                    return data
                } catch (error) {
                    console.error('数据获取失败:', error)
                    songName.textContent = '加载失败，点击重试'
                    singer.textContent = '网络错误或超时'
                    throw error
                }
            }

            let songChart = MusicPlayer.getAttribute('data-songChart') || '热歌榜'

            const randomSongList = MusicPlayer.getAttribute('data-randomSongList')
            if (randomSongList === '' || randomSongList === '1' || randomSongList === 'true') {
                let SongListArr = ['热歌榜', '新歌榜', '原创榜', '飙升榜']
                songChart = SongListArr[Math.floor(Math.random() * SongListArr.length)]
            }

            if (interfaceAndLocal) {
                songChart = '本地'
            }

            console.log(`%c 正在播放${songChart}歌单~`, 'color: #b3c4ec;')

            const musicUrl = (() => {
                if (interfaceAndLocal === null && xfSongList === null) {
                    return `${musicApi}/musicAll/?sortAll=${songChart.trim()}`
                }
                else if (interfaceAndLocal === null && xfSongList !== null) {
                    return `${musicApi}/musicAll/?playlistId=${xfSongList.trim()}`
                } 
                else {
                    return interfaceAndLocal.trim()
                }
            })()

            const addLeadingZero = num => num < 10 ? `0${num}` : num

            function convertTime(duration) {
                const minutes = Math.floor(duration / 60)
                const seconds = Math.floor(duration % 60)
                return `${addLeadingZero(minutes)}:${addLeadingZero(seconds)}`
            }

            function millisecondConversion(milliseconds) {
                const minutes = addLeadingZero(Math.floor(milliseconds / 60000))
                const seconds = addLeadingZero(Math.floor((milliseconds % 60000) / 1000))
                return `${minutes}:${seconds} `
            }

            const clickControl = () => {
                let isFunctionTriggered = false

                const togglePlayback = () => {
                    const domLength = MusicPlayer.getElementsByClassName('xf-bePlaying').length
                    if (domLength > 0) {
                        displayPopup('音乐已暂停')
                        pauseMusic()
                        removebePlaying()
                    } else {
                        displayPopup(`正在播放：${songName.textContent}`)
                        playMusic()
                        addPlaying()
                        isFunctionTriggered = true
                    }
                }

                playbackControl.addEventListener('click', togglePlayback)

                window.addEventListener('keyup', e => {
                    if (e.key === ' ' || e.keyCode === 32) {
                        togglePlayback()
                    }
                })

                audioFrequency.addEventListener('click', function () {
                    xfMusicAudio.muted = !xfMusicAudio.muted

                    if (xfMusicAudio.muted) {
                        displayPopup('开启静音')
                        this.children[0].classList.remove('icon-shengyin-kai')
                        this.children[0].classList.add('icon-shengyin-guan')
                    } else {
                        displayPopup('取消静音')
                        this.children[0].classList.add('icon-shengyin-kai')
                        this.children[0].classList.remove('icon-shengyin-guan')
                    }
                })

                MusicPlayerMain.style.opacity = 0

                // 防并发锁
                let isLoading = false
                let retryTimer = null
                let expectedSongCount = 0

                // 用于取消待执行的音频加载任务（防止快速切歌堆积）
                let pendingAudioLoadTimer = null

                const playBackAndForth = async () => {
                    if (isLoading) return
                    isLoading = true
                    clearTimeout(retryTimer)

                    songName.textContent = '加载歌单中...'
                    singer.textContent = '请稍候'
                    
                    try {
                        let res = await fetchData(musicUrl)

                        if (interfaceAndLocal === null && xfSongList !== null) {
                            res = res.playlist.tracks
                        }

                        listOfSongs.innerHTML = ''
                        expectedSongCount = res.length

                        await Promise.all(
                            res.map(async data => {
                                const musicId = data.id
                                const musicName = data.name
                                const artistsname = data.artistsname || data.al.name
                                const picurl = data.picurl || data.al.picUrl
                                const mp3 = data.url || `${musicApi}/musicAll/?songId=${musicId}&mp3Url=mp3`
                                const duration = interfaceAndLocal === null ? (data.duration !== undefined ? convertTime(data.duration) : millisecondConversion(data.dt)) : data.musicDuration

                                playerMusicItem(musicId, mp3, picurl, musicName, artistsname, duration)
                            })
                        )

                        const checkSongsItemLength = () => {
                            return new Promise(resolve => {
                                const startTime = Date.now()
                                const intervalId = setInterval(() => {
                                    const lisNum = MusicPlayer.querySelectorAll('.xf-songsItem').length
                                    if (lisNum === expectedSongCount) {
                                        clearInterval(intervalId)
                                        const endTime = Date.now()
                                        const waitTime = endTime - startTime
                                        resolve(waitTime)
                                    }
                                }, 30)
                            })
                        }

                        const setCookie = (name, value, days) => {
                            const date = new Date()
                            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
                            const expires = `expires=${date.toUTCString()}`
                            document.cookie = `${name}=${value}; ${expires}; path=/`
                        }

                        const getCookie = name => {
                            const cookieName = `${name}=`
                            const cookies = document.cookie.split(';')
                            for (let cookie of cookies) {
                                while (cookie.charAt(0) === ' ') {
                                    cookie = cookie.substring(1)
                                }
                                if (cookie.indexOf(cookieName) === 0) {
                                    return cookie.substring(cookieName.length, cookie.length)
                                }
                            }
                            return null
                        }
                        const deleteCookie = name => document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                        const cookieName = 'xf-MusicPlayer'
                        const memoryPlayback = MusicPlayer.getAttribute('data-memory')
                        let cookieData = null
                        const rsCookie = getCookie(cookieName)
                        const detectionCookies = callback => {
                            if (memoryPlayback === '1' || memoryPlayback === 'true') {
                                callback()
                            } else {
                                if (rsCookie) {
                                    deleteCookie(cookieName)
                                }
                            }
                        }

                        const waitTime = await checkSongsItemLength()

                        if (waitTime <= 100) {
                            console.log(`%c 播放器接口加载耗时【正常】：${waitTime}ms`, 'color: #60a060')
                        } else if (waitTime <= 8000) {
                            console.log(`%c 播放器接口加载耗时【稍慢】：${waitTime}ms`, 'color: #ffb87a')
                        } else {
                            console.warn(`%c 加载时间较长 (${waitTime}ms)，请耐心等待`, 'color: #a51212')
                        }

                        let songsItem = MusicPlayer.querySelectorAll('.xf-songsItem')
                        if (songsItem.length === 0) {
                            console.error('歌曲未被添加...')
                            songName.textContent = '暂无歌曲'
                            singer.textContent = '请检查网络'
                            isLoading = false
                            return
                        }

                        let currentSongIndex = 0

                        const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
                        const randomSong = getRandomInt(0, songsItem.length - 1)

                        const songStr = MusicPlayer.getAttribute('data-random')
                        if (songStr !== null && songStr !== 'false') {
                            if (songStr !== '' && !isNaN(Number(songStr))) {
                                currentSongIndex = Number(songStr) > 0 && songStr <= songsItem.length ? Number(songStr) - 1 : 0
                            } else {
                                currentSongIndex = randomSong
                            }
                        }

                        detectionCookies(() => {
                            if (rsCookie) {
                                const { musicId } = JSON.parse(rsCookie)
                                currentSongIndex = musicId >= songsItem.length ? 0 : musicId
                            } else {
                                cookieData = {
                                    musicId: 0,
                                    musicTime: 0
                                }
                                setCookie(cookieName, JSON.stringify(cookieData), 30)
                            }
                        })

                        // ---------- 彻底优化后的 updateSong（解决切歌卡顿）----------
                        const updateSong = index => {
                            MusicPlayerMain.style.opacity = 1
                            
                            // 1. 更新高亮状态（仅遍历，不重复过滤）
                            songsItem.forEach((ele, i) => {
                                ele.classList.toggle('xf-inExecution', i === index)
                                ele.querySelector('.xf-songListSongPictures .xf-songIcon').classList.remove('icon-zantingtingzhi')
                            })
                            
                            // 2. 仅一次过滤，获取当前播放的项
                            const eleInExecution = Array.from(songsItem).filter(ele => ele.classList.contains('xf-inExecution'))

                            const item = songsItem[index]
                            const itemPic = (item.querySelector('.xf-playlistImg')?.getAttribute('data-musicljz-src')) ?? item.querySelector('.xf-playlistImg')?.src
                            const itemUrl = item.dataset.mp3url
                            const itemName = item.querySelector('.xf-songName').textContent
                            const itemAuto = item.querySelector('.xf-songAuthor').textContent

                            // 3. 立即更新 UI（封面、歌名、歌手）
                            musicPicture.src = itemPic
                            musicPicture.alt = itemName
                            songName.textContent = itemName
                            singer.textContent = itemAuto

                            // 4. 更新播放图标
                            if (eleInExecution.length > 0) {
                                const xfSongIcon = eleInExecution[0].querySelector('.xf-songListSongPictures .xf-songIcon')
                                xfSongIcon.classList.add('icon-zantingtingzhi')
                            }

                            // 5. 取消之前的音频加载任务，防止堆积
                            if (pendingAudioLoadTimer) {
                                clearTimeout(pendingAudioLoadTimer)
                                pendingAudioLoadTimer = null
                            }

                            // 6. 延迟加载音频，避免阻塞 UI 渲染
                            pendingAudioLoadTimer = setTimeout(() => {
                                xfMusicAudio.src = itemUrl

                                if (isFunctionTriggered || MusicPlayer.getAttribute('data-fadeOutAutoplay') !== null) {
                                    playMusic()
                                    addPlaying()
                                    displayPopup(`正在播放：${itemName}`)
                                }

                                // 歌词处理
                                const lyricsShowOrHide = MusicPlayer.getAttribute('data-lyrics')

                                if (lyricsShowOrHide === '0' || lyricsShowOrHide === 'false') {
                                    if (xfLyric) xfLyric.style.display = 'none'
                                    pendingAudioLoadTimer = null
                                    return
                                }

                                function hasScrollbar() {
                                    return playerBody.scrollHeight > (window.innerHeight || document.documentElement.clientHeight)
                                }

                                if (hasScrollbar()) {
                                    document.addEventListener('scroll', () => {
                                        if (xfMusicAudio.paused) return
                                        if ((window.innerHeight + window.scrollY) >= playerBody.offsetHeight) {
                                            if (xfLyric) {
                                                xfLyric.classList.add('xf-lyricHidden')
                                                xfLyric.classList.remove('xf-lyricShow')
                                            }
                                        } else {
                                            if (xfLyric) {
                                                xfLyric.classList.add('xf-lyricShow')
                                                xfLyric.classList.remove('xf-lyricHidden')
                                            }
                                        }
                                    })
                                }

                                if (interfaceAndLocal === null && lyricsShowOrHide !== '0' && lyricsShowOrHide !== 'false' && xfLyric) {
                                    xfLyric.style.backgroundColor = backgroundColors[bgIndex]
                                    let xfAllLyri = xfLyric.querySelector('.xf-AllLyric-box')
                                    const musicLyric = eleInExecution[0].dataset.index
                                    const wyLyric = `${musicApi}/musicAll/?lyric=${musicLyric}`
                                    fetchData(wyLyric)
                                        .then(res => {
                                            xfAllLyri.innerHTML = ''
                                            if (res.code === 200) {
                                                const lyricsData = res.lrc.lyric
                                                const lines = lyricsData.split('\n')
                                                const lyricsArray = lines.map(line => {
                                                    const timeEndIndex = line.indexOf(']')
                                                    if (timeEndIndex !== -1) {
                                                        const time = (() => {
                                                            const [minutes, seconds] = line.substring(1, timeEndIndex).split(':').map(parseFloat)
                                                            return minutes * 60 + seconds
                                                        })()
                                                        const text = line.substring(timeEndIndex + 1).trim()
                                                        return { time, text }
                                                    } else {
                                                        return null
                                                    }
                                                }).filter(lyric => lyric !== null)

                                                lyricsArray.forEach(lyric => {
                                                    const lisEle = document.createElement('li')
                                                    lisEle.classList.add('xf-ly')
                                                    lisEle.textContent = lyric.text
                                                    xfAllLyri.appendChild(lisEle)
                                                })

                                                function updateLyricDisplay() {
                                                    const currentTime = xfMusicAudio.currentTime
                                                    for (let i = 0; i < lyricsArray.length; i++) {
                                                        const lisEle = xfAllLyri.children[i]
                                                        if (lisEle) lisEle.classList.remove('xf-textShow')
                                                    }
                                                    let currentLyricIndex
                                                    for (let j = 0; j < lyricsArray.length; j++) {
                                                        if (currentTime >= lyricsArray[j].time) {
                                                            currentLyricIndex = j
                                                            if (j < lyricsArray.length - 1 && currentTime >= lyricsArray[j + 1].time) continue
                                                            break
                                                        }
                                                    }
                                                    const lisEle = xfAllLyri.children[currentLyricIndex]
                                                    if (lisEle) lisEle.classList.add('xf-textShow')
                                                }

                                                xfMusicAudio.removeEventListener('timeupdate', updateLyricDisplay)
                                                xfMusicAudio.addEventListener('timeupdate', updateLyricDisplay)
                                            }
                                        })
                                        .catch(error => console.error(`歌词获取失败：${error}`))
                                }

                                pendingAudioLoadTimer = null
                            }, 0)
                        }
                        // ---------- updateSong 结束 ----------

                        updateSong(currentSongIndex)

                        const setCk = id => {
                            detectionCookies(() => {
                                cookieData = { musicId: id, musicTime: 0 }
                                setCookie(cookieName, JSON.stringify(cookieData), 30)
                            })
                        }

                        const prevMusic = () => {
                            isFunctionTriggered = true
                            currentSongIndex = (currentSongIndex - 1 + songsItem.length) % songsItem.length
                            updateSong(currentSongIndex)
                            setCk(currentSongIndex)
                        }

                        const nextMusic = () => {
                            isFunctionTriggered = true
                            currentSongIndex = (currentSongIndex + 1) % songsItem.length
                            updateSong(currentSongIndex)
                            setCk(currentSongIndex)
                        }

                        songsItem.forEach((item, index) => {
                            item.addEventListener('click', () => {
                                isFunctionTriggered = true
                                currentSongIndex = index
                                updateSong(currentSongIndex)
                                setCk(currentSongIndex)
                            })
                        })

                        nextSong.addEventListener('click', nextMusic)
                        previousSong.addEventListener('click', prevMusic)

                        window.addEventListener('keyup', e => {
                            if (e.key === 'ArrowRight' || e.keyCode === 39) {
                                isFunctionTriggered = true
                                currentSongIndex = (currentSongIndex + songsItem.length + 2) % songsItem.length
                                updateSong(currentSongIndex)
                                setCk(currentSongIndex)
                            }
                            if (e.key === 'ArrowLeft' || e.keyCode === 37) {
                                prevMusic()
                            }
                        })

                        xfMusicAudio.addEventListener('timeupdate', () => {
                            const duration = xfMusicAudio.duration
                            const currentTime = xfMusicAudio.currentTime
                            const progress = (currentTime / duration) * 100
                            audioProgress.style.width = `${progress}%`

                            detectionCookies(() => {
                                cookieData = {
                                    musicId: currentSongIndex,
                                    musicTime: xfMusicAudio.currentTime
                                }
                                setCookie(cookieName, JSON.stringify(cookieData), 30)
                            })
                            if (progress === 100) {
                                nextMusic()
                            }
                        })

                        const loadedMetadataHandler = () => {
                            detectionCookies(() => {
                                if (!rsCookie) return
                                const { musicTime } = JSON.parse(rsCookie)
                                const duration = xfMusicAudio.duration
                                xfMusicAudio.currentTime = musicTime >= duration ? 0 : musicTime
                                playMusic()
                            })
                            xfMusicAudio.removeEventListener('loadedmetadata', loadedMetadataHandler)
                        }

                        xfMusicAudio.addEventListener('loadedmetadata', loadedMetadataHandler)

                        const currentMusic = () => {
                            if (musicPicture.src === "" || songName.textContent === "") {
                                nextMusic()
                                pauseMusic()
                                removebePlaying()
                                displayPopup('音乐已停止播放！')
                            }
                        }
                        currentMusic()
                        lazyLoadImages()
                        
                    } catch (error) {
                        console.error(`发生错误：${error}`)
                        songName.textContent = '加载失败'
                        singer.textContent = '点击重试'
                    } finally {
                        isLoading = false
                        retryTimer = setTimeout(() => {
                            const lis = listOfSongs.querySelectorAll('.xf-songsItem')
                            if (!isLoading && lis.length === 0) {
                                console.warn('歌单未成功加载，尝试重新获取')
                                playBackAndForth()
                            }
                        }, 8000)
                    }
                }

                playBackAndForth()

                let isSliding = false
                const startSlide = e => {
                    isSliding = true 
                    slide(e)
                    playMusic()
                    addPlaying()
                }
                const slide = e => {
                    if (!isSliding) return
                    const containerRect = totalAudioProgress.getBoundingClientRect()
                    const clickX = e.clientX - containerRect.left
                    const containerWidth = containerRect.width
                    const clickProgress = (clickX / containerWidth) * 100
                    const duration = xfMusicAudio.duration
                    const newTime = (clickProgress / 100) * duration
                    xfMusicAudio.currentTime = newTime
                }
                const endSlide = () => { isSliding = false }

                totalAudioProgress.addEventListener('mousedown', startSlide)
                totalAudioProgress.addEventListener('mousemove', slide)
                totalAudioProgress.addEventListener('mouseup', endSlide)
                totalAudioProgress.addEventListener('mouseleave', endSlide)

                playlistBtn.addEventListener('click', () => {
                    const showSong = MusicPlayer.getElementsByClassName('xf-outsideSongListShow').length
                    showSong ? outsideSongList.classList.remove('xf-outsideSongListShow') : outsideSongList.classList.add('xf-outsideSongListShow')
                })

                let throughDisplayDiv
                const goThroughShowAndLeaveHidden = () => {
                    if (!throughDisplayDiv) {
                        throughDisplayDiv = document.createElement('div')
                        throughDisplayDiv.classList.add('xf-throughDisplay')
                        playerBody.appendChild(throughDisplayDiv)
                    }
                    const throughDisplay = document.querySelector('.xf-throughDisplay')
                    const arr = [previousSong, playbackControl, nextSong, audioFrequency, playlistBtn]

                    function handleMouseEnter(event) {
                        const mouseX = event.pageX
                        const mouseY = event.pageY
                        throughDisplay.style.left = `${mouseX + 15}px`
                        throughDisplay.style.top = `${mouseY}px`
                        switch (this) {
                            case previousSong: eleShow('上一首'); break
                            case playbackControl: eleShow('播放音乐'); break
                            case nextSong: eleShow('下一首'); break
                            case audioFrequency: eleShow('音量设置'); break
                            case playlistBtn: eleShow('查看歌单'); break
                            default: eleHidden()
                        }
                    }

                    const eleShow = text => {
                        throughDisplay.style.display = 'block'
                        throughDisplay.textContent = text
                    }
                    const eleHidden = () => throughDisplay.style.display = 'none'

                    for (let i = 0; i < arr.length; i++) {
                        const ele = arr[i]
                        ele.addEventListener('mouseenter', handleMouseEnter)
                        ele.addEventListener('mouseleave', eleHidden)
                        ele.addEventListener('click', eleHidden)
                    }
                }
                goThroughShowAndLeaveHidden()
            }
            clickControl()

            const switchPlayerFun = () => {
                const playerToggleClasses = () => {
                    switchArrow.classList.toggle('xf-jiantou1')
                    MusicPlayerMain.classList.toggle('xf-playerShow')
                }

                switchPlayer.addEventListener('click', playerToggleClasses)

                document.addEventListener('click', function (event) {
                    if (!MusicPlayer.contains(event.target)) {
                        switchArrow.classList.remove('xf-jiantou1')
                        MusicPlayerMain.classList.remove('xf-playerShow')
                    }
                })
            }

            switchPlayerFun()
            xfMusicAudio.remove()
        }
    }

    const printStyle = [
        'padding: 5px 10px; border-radius: 5px 0 0 5px; background-color: #8b52ec; font-weight: bold;',
        'padding: 5px 10px; border-radius: 0 5px 5px 0; background-color: #a17eff; font-weight: bold;'
    ]
})
