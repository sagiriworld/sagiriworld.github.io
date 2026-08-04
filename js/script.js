/* =========================
   常量配置
========================= */
const CONFIG = {
  GISCUS_REPO: 'nekooa/nekooa.github.io',
  GISCUS_REPO_ID: 'R_kgDORzOqxQ',
  GISCUS_CATEGORY: 'Announcements',
  GISCUS_CATEGORY_ID: 'DIC_kwDORzOqxc4C-uzR',
  GISCUS_DARK_THEME: 'https://neneneko.pages.dev/styles/giscus-dark.css',
  GISCUS_LIGHT_THEME: 'https://neneneko.pages.dev/styles/giscus-light.css',
  GISCUS_BLUE_DARK_THEME: 'https://neneneko.pages.dev/styles/giscus-blue-dark.css',
  GISCUS_BLUE_LIGHT_THEME: 'https://neneneko.pages.dev/styles/giscus-blue-light.css',
  HITOKOTO_CACHE_DURATION: 5 * 1000,
  MIN_LOAD_TIME: 3000,
};

/* =========================
   加载屏
========================= */
var pageLoadStart = Date.now();

const LOADER_TIPS = [
  ' 你知道吗？这个网站没有使用任何框架',
  ' 这个网站使用纯 HTML CSS JS 打造！',
  ' 页面加载中，请稍候喵...',
  ' 加载速度取决于neko的心情',
  ' ♪ 世界でいちばんおひめさま ♪',
  ' ♪ 笑える時まで今日もscience! ♪',
  ' ♪ 群青色の空，自由なんてものは ♪',
  ' ♪ i cant wait no mistake ♪',
  ' 试试切换深色模式？',
  ' 试试切换蓝色主题？',
  ' 服务器正在翻滚，请稍候',
  ' 加载这么慢一定是网络的问题',
  ' ｡ﾟ･ (>﹏<) ･ﾟ｡ 快好了',
  ' 右下角有音乐播放器哦',
  ' 若加载时间过长请打开梯子喵~',
  ' 加载慢主要是因为这个字体太大了::>_<::',
];

(function injectLoaderTips() {
  const inner = document.querySelector('.loader-inner');
  if (!inner) return;
  const tip = LOADER_TIPS[Math.floor(Math.random() * LOADER_TIPS.length)];
  const el = document.createElement('p');
  el.className = 'loader-tips';
  el.textContent = tip;
  inner.appendChild(el);
})();

/* =========================
   全局变量与初始化
========================= */
const ThemeManager = {
  STORAGE_KEY: 'site-theme',
  getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'auto';
  },
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateMetaThemeColor();
    if (document.querySelector('.giscus')) {
      updateGiscusTheme();
    }
    // 安全调用：若 ColorThemeManager 已定义，则重新应用颜色
    if (typeof ColorThemeManager !== 'undefined') {
      ColorThemeManager.applyColor(ColorThemeManager.getColor());
    }
  },
  updateMetaThemeColor() {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = this.getTheme();
    if (theme === 'dark' || (theme === 'auto' && isDark)) {
      meta.content = '#201418';
    } else {
      meta.content = '#FFFBFF';
    }
  },
  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY) || 'auto';
    this.setTheme(saved);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.getTheme() === 'auto') {
        this.updateMetaThemeColor();
      }
    });
  }
};

/* =========================
   主题颜色管理器
========================= */
const ColorThemeManager = {
  STORAGE_KEY: 'site-color-theme',

  themes: {
    pink: {
      light: {
        '--color-bg': '#FFFBFF',
        '--color-pink': '#ff95bc',
        '--color-pink-soft': 'rgba(255,216,231,0.7)',
        '--color-svg': '#352f31',
        '--sidebar-bg': 'rgba(240,240,240)',
        '--sidebar-a': 'rgba(106,106,106,0.2)',
        '--sidebar-bg-mobile': 'rgba(247,236,244,0.8)',
        '--card-bg': '#FAF2F8',
        '--profile-list-bg': 'rgba(255,216,231,0.3)',
        '--time-badge-bg': 'rgba(255,216,231,0.8)',
        '--li-a-bg': 'rgba(255,216,231,0.8)',
        '--li-a-hover-bg': 'rgba(253,176,210,0.626)',
        '--slogan-color': '#e91e63',
        '--slogan-text-shadow': '0 2px 8px rgba(233,30,99,0.25)',
        '--thoughts-color': '#b06a8c',
        '--thoughts-bg': 'rgba(255,235,245,0.5)',
        '--thoughts-border': '#f8bbd0',
        '--nav-time-bg': 'rgba(255,216,231,0.8)',
        '--settings-panel-bg': '#FFFBFF',
        lyPop: {
          '--lyric-bg': 'rgba(253, 217, 231, 0.7)',
          '--lyric-shadow': '0 -2px 10px rgba(0, 0, 0, 0.1)',
          '--pop-bg': 'rgba(253, 217, 231, 0.9)',
          '--pop-color': '#504348'
        },
        player: {
          '--playerColor-1': '#fffbff',
          '--playerColor-2': '#1f1a1c',
          '--playerColor-3': '#fdd9e7',
          '--playerColor-4': '#504348',
          '--playerColor-5': '#1C1B1F',
          '--playerColor-6': '#ae1d79',
          '--playerColor-7': '#fdd9e7',
          '--playerColor-8': '#3d0027',
          '--playerColor-9': '#f1dee4',
          '--playerColor-10': '#7f553a',
          '--playerColor-11': '#C27E94',
          '--playerColor-12': '#301401',
          '--playerColor-rgba-1': 'rgba(176,0,92,0.08)',
          '--playerColor-rgba-2': 'rgba(255,255,255,0.8)',
          '--playerShadow-1': '0px 4px 8px 3px rgba(176,0,92,0.05),0px 1px 3px 0px rgba(0,0,0,0.08)',
          '--playerShadow-2': '-4px 4px 8px 0px rgba(176,0,92,0.08),inset -4px 4px 10px 0px rgba(0,0,0,0.03)',
          '--playerTextShadow-1': '0 0 1px rgba(176,0,92,0.15)',
          '--playerTextShadow-2': '0 0 1px rgba(255,255,255,0.5)'
        }
      },
      dark: {
        '--color-bg': '#1F1A1C',
        '--color-pink': '#ffb3cf',
        '--color-pink-soft': 'rgba(255,179,207,0.25)',
        '--color-svg': '#fed9e6',
        '--sidebar-bg': 'rgba(30,30,30)',
        '--sidebar-a': 'rgba(106,106,106,0.25)',
        '--sidebar-bg-mobile': 'rgba(49,38,42,0.8)',
        '--card-bg': '#2A2125',
        '--profile-list-bg': 'rgba(90,63,72,0.5)',
        '--time-badge-bg': 'rgba(255,179,207,0.2)',
        '--li-a-bg': 'rgba(255,179,207,0.25)',
        '--li-a-hover-bg': 'rgba(255,179,207,0.35)',
        '--slogan-color': '#f48fb1',
        '--slogan-text-shadow': '0 2px 12px rgba(244,143,177,0.35)',
        '--thoughts-color': '#f8bbd0',
        '--thoughts-bg': 'rgba(255,210,225,0.08)',
        '--thoughts-border': '#f06292',
        '--nav-time-bg': 'rgba(255,179,207,0.2)',
        '--settings-panel-bg': '#1F1A1C',
        lyPop: {
          '--lyric-bg': 'rgba(65, 42, 52, 0.9)',
          '--lyric-shadow': '0 -2px 10px rgba(0, 0, 0, 0.4)',
          '--pop-bg': 'rgba(89, 64, 75, 0.9)',
          '--pop-color': '#d4c2c8'
        },
        player: {
          '--playerColor-1': '#1f1a1c',
          '--playerColor-2': '#ebe0e2',
          '--playerColor-3': '#59404b',
          '--playerColor-4': '#d4c2c8',
          '--playerColor-5': '#FFB3C6',
          '--playerColor-6': '#ffafd5',
          '--playerColor-7': '#5C3A47',
          '--playerColor-8': '#ffd8e8',
          '--playerColor-9': '#504348',
          '--playerColor-10': '#D27B94',
          '--playerColor-11': '#F5C2D2',
          '--playerColor-12': '#FFDFED',
          '--playerColor-rgba-1': 'rgba(255,223,237,0.12)',
          '--playerColor-rgba-2': 'rgba(65,42,52,0.7)',
          '--playerShadow-1': '0px 4px 8px 3px rgba(0,0,0,0.3),0px 1px 3px 0px rgba(0,0,0,0.4)',
          '--playerShadow-2': '-4px 4px 8px 0px rgba(0,0,0,0.4),inset -4px 4px 10px 0px rgba(255,223,237,0.05)',
          '--playerTextShadow-1': '0 0 1px rgba(255,179,198,0.4)',
          '--playerTextShadow-2': '0 0 1px rgba(0,0,0,0.5)'
        }
      }
    },

    blue: {
      light: {
        '--color-bg': '#FBFCFE',
        '--color-pink': '#006689',
        '--color-pink-soft': '#C3E8FF',
        '--color-svg': '#2f4554',
        '--sidebar-bg': '#EFF5F8',
        '--sidebar-a': 'rgba(106,106,106,0.2)',
        '--sidebar-bg-mobile': 'rgba(231,240,245,0.8)',
        '--card-bg': '#EFF5F8',
        '--profile-list-bg': '#D1E5F4',
        '--time-badge-bg': 'rgba(195,232,255,0.6)',
        '--li-a-bg': 'rgba(195,232,255,0.8)',
        '--li-a-hover-bg': 'rgba(127,180,224,1)',
        '--slogan-color': '#006689',
        '--slogan-text-shadow': '0 2px 8px rgba(59,122,191,0.2)',
        '--thoughts-color': '#006689',
        '--thoughts-bg': 'rgba(209,229,244,0.3)',
        '--thoughts-border': '#C3E8FF',
        '--nav-time-bg': 'rgba(195,232,255,0.6)',
        '--settings-panel-bg': '#FBFCFE',
        lyPop: {
          '--lyric-bg': 'rgba(195, 232, 255, 0.7)',
          '--lyric-shadow': '0 -2px 10px rgba(91, 155, 213, 0.15)',
          '--pop-bg': 'rgba(195, 232, 255, 0.9)',
          '--pop-color': '#1a2a38'
        },
        player: {
          '--playerColor-1': '#f4f9fd',
          '--playerColor-2': '#1a2a38',
          '--playerColor-3': '#d9eaf8',
          '--playerColor-4': '#3e5a70',
          '--playerColor-5': '#1C1B1F',
          '--playerColor-6': '#5b9bd5',
          '--playerColor-7': '#d9eaf8',
          '--playerColor-8': '#0f2a3f',
          '--playerColor-9': '#e4f0f8',
          '--playerColor-10': '#7f553a',
          '--playerColor-11': '#6c8ebf',
          '--playerColor-12': '#301401',
          '--playerColor-rgba-1': 'rgba(91,155,213,0.08)',
          '--playerColor-rgba-2': 'rgba(255,255,255,0.8)',
          '--playerShadow-1': '0px 4px 8px 3px rgba(91,155,213,0.05),0px 1px 3px 0px rgba(0,0,0,0.08)',
          '--playerShadow-2': '-4px 4px 8px 0px rgba(91,155,213,0.08),inset -4px 4px 10px 0px rgba(0,0,0,0.03)',
          '--playerTextShadow-1': '0 0 1px rgba(91,155,213,0.15)',
          '--playerTextShadow-2': '0 0 1px rgba(255,255,255,0.5)'
        }
      },
      dark: {
        '--color-bg': '#191C1E',
        '--color-pink': '#91c0f0',
        '--color-pink-soft': 'rgba(145,192,240,0.25)',
        '--color-svg': '#c8ddf0',
        '--sidebar-bg': 'rgba(20,28,36)',
        '--sidebar-a': 'rgba(100,130,160,0.25)',
        '--sidebar-bg-mobile': 'rgba(25,35,45,0.85)',
        '--card-bg': '#1E2529',
        '--profile-list-bg': 'rgba(30,60,90,0.5)',
        '--time-badge-bg': 'rgba(145,192,240,0.2)',
        '--li-a-bg': 'rgba(145,192,240,0.25)',
        '--li-a-hover-bg': 'rgba(145,192,240,0.35)',
        '--slogan-color': '#91c0f0',
        '--slogan-text-shadow': '0 2px 12px rgba(145,192,240,0.35)',
        '--thoughts-color': '#b8d8f8',
        '--thoughts-bg': 'rgba(30,60,90,0.15)',
        '--thoughts-border': '#4a7ca5',
        '--nav-time-bg': 'rgba(145,192,240,0.2)',
        '--settings-panel-bg': '#17212b',
        lyPop: {
          '--lyric-bg': 'rgba(46, 67, 88, 0.9)',
          '--lyric-shadow': '0 -2px 10px rgba(0, 0, 0, 0.4)',
          '--pop-bg': 'rgba(46, 67, 88, 0.9)',
          '--pop-color': '#b8d4f0'
        },
        player: {
          '--playerColor-1': '#17212b',
          '--playerColor-2': '#d4e4f5',
          '--playerColor-3': '#2e4358',
          '--playerColor-4': '#b8d4f0',
          '--playerColor-5': '#91c0f0',
          '--playerColor-6': '#91c0f0',
          '--playerColor-7': '#2e4358',
          '--playerColor-8': '#d4e4f5',
          '--playerColor-9': '#3a4a5a',
          '--playerColor-10': '#a4c2d8',
          '--playerColor-11': '#8ab8e0',
          '--playerColor-12': '#e4f0f8',
          '--playerColor-rgba-1': 'rgba(145,192,240,0.12)',
          '--playerColor-rgba-2': 'rgba(23,33,43,0.7)',
          '--playerShadow-1': '0px 4px 8px 3px rgba(0,0,0,0.3),0px 1px 3px 0px rgba(0,0,0,0.4)',
          '--playerShadow-2': '-4px 4px 8px 0px rgba(0,0,0,0.4),inset -4px 4px 10px 0px rgba(145,192,240,0.05)',
          '--playerTextShadow-1': '0 0 1px rgba(145,192,240,0.4)',
          '--playerTextShadow-2': '0 0 1px rgba(0,0,0,0.5)'
        }
      }
    }
  },

  getColor() {
    return localStorage.getItem(this.STORAGE_KEY) || 'pink';
  },

  isDarkMode() {
    const theme = ThemeManager.getTheme();
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  applyColor(name) {
    const mode = this.isDarkMode() ? 'dark' : 'light';
    const vars = this.themes[name]?.[mode] || this.themes.pink[mode];

    // 应用全局页面变量
    Object.entries(vars).forEach(([prop, value]) => {
      // 跳过 lyPop
      if (prop !== 'player' && prop !== 'lyPop') {
        document.documentElement.style.setProperty(prop, value);
      }
    });

    // 应用播放器变量
    const playerEl = document.querySelector('#xf-MusicPlayer .xf-girlPink');
    if (playerEl && vars.player) {
      Object.entries(vars.player).forEach(([prop, value]) => {
        playerEl.style.setProperty(prop, value);
      });
    }

    // 应用歌词条 / 弹窗颜色
    const lp = vars.lyPop;
    const xfLyric = document.getElementById('xf-lyric');
    const xfPop = document.querySelector('.xf-music-pop');

    if (lp) {
      if (xfLyric) {
        xfLyric.style.backgroundColor = lp['--lyric-bg'];
        xfLyric.style.boxShadow = lp['--lyric-shadow'];
      }
      if (xfPop) {
        xfPop.style.background = lp['--pop-bg'];
        xfPop.style.color = lp['--pop-color'];
      }
    } else {
      // fallback：清除内联样式，回退到 CSS 默认值
      if (xfLyric) { xfLyric.style.backgroundColor = ''; xfLyric.style.boxShadow = ''; }
      if (xfPop) { xfPop.style.background = ''; xfPop.style.color = ''; }
    }

    // 切换主页头图
    const heroImg = document.querySelector('.home-header');
    if (heroImg) {
      const targetSrc = heroImg.getAttribute(`data-${name}-src`);
      if (targetSrc && heroImg.src !== new URL(targetSrc, location.href).href) {
        heroImg.src = targetSrc;
      }
    }

    this.updateActiveButton(name);
  },

  setColor(name) {
    localStorage.setItem(this.STORAGE_KEY, name);
    this.applyColor(name);
    if (document.querySelector('.giscus')) {
      updateGiscusTheme();
    }
  },

  updateActiveButton(name) {
    document.querySelectorAll('.theme-color-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.color === name) btn.classList.add('active');
    });
  },

  init() {
    const saved = this.getColor();
    this.applyColor(saved);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (ThemeManager.getTheme() === 'auto') {
        this.applyColor(this.getColor());
      }
    });
  }
};

/* =========================
   动画执行
========================= */
function playEnterAnimation(selectors) {
  const elements = document.querySelectorAll(selectors);
  if (!elements.length) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // 一：清除旧类，设置内联初始状态
  elements.forEach(el => {
    el.classList.remove('fade-out', 'fade-in');
    if (el.matches('.header-container')) return;
    el.style.opacity = '0';
    if (el.matches('.logo')) {
      el.style.transform = 'translateX(-20px)';
    } else if (el.matches('.settings-button')) {
      el.style.transform = 'translateX(20px)';
    } else if (el.matches('.article-card, .comment-content')) {
      el.style.transform = isMobile
        ? 'translateY(15px)'
        : 'translateX(-50%) translateY(15px)';
    } else {
      el.style.transform = 'translateY(15px)';
    }
  });

  // 二：强制重排
  void document.body.offsetWidth;

  // 三：移除内联样式并添加 .fade-in
  elements.forEach(el => {
    if (el.matches('.header-container')) {
      el.classList.add('fade-in');
      return;
    }
    el.style.opacity = '';
    el.style.transform = '';
    el.classList.add('fade-in');
  });
}

/* =========================
   页面加载
========================= */
let isLoadingPage = false;

async function loadPage(url, addToHistory = true) {
  if (isLoadingPage) return;
  isLoadingPage = true;

  const settingsDialog = document.getElementById('settingsDialog');
  if (settingsDialog && settingsDialog.classList.contains('open')) {
    settingsDialog.classList.remove('open');
    settingsDialog.setAttribute('aria-hidden', 'true');
  }

  try {
    const res = await fetch(url);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    let newContent = doc.querySelector('.home-content') || doc.querySelector('.content');
    const newLogo = doc.querySelector('.logo');
    const newHeaderContainer = doc.querySelector('.header-container');
    const newHeader = doc.querySelector('.article-header');
    const newArticleCard = doc.querySelector('.article-card');
    const newFooter = doc.querySelector('.footer');
    let newCommentContent = doc.querySelector('.comment-content');
    if (newCommentContent && newContent && newContent.contains(newCommentContent)) {
      newCommentContent.remove();
    }

    const currentLogo = document.querySelector('.logo');
    let currentContent = document.querySelector('.home-content') || document.querySelector('.content');
    const currentSettingsBtn = document.querySelector('.settings-button');
    let currentHeaderContainer = document.querySelector('.header-container');
    let currentHeader = document.querySelector('.article-header');
    let currentArticleCard = document.querySelector('.article-card');
    let currentFooter = document.querySelector('.footer');
    let currentCommentContent = document.querySelector('.comment-content');

    // ---------- 1. 其他元素通用退场 ----------
    const outElements = [
      currentContent,
      currentLogo,
      currentSettingsBtn,
      currentHeader,
      currentArticleCard,
      currentFooter,
      currentCommentContent,
    ].filter(Boolean);

    outElements.forEach(el => {
      el.classList.remove('fade-in');
      el.classList.add('fade-out');
    });

    // ---------- 2. 头图专属退场动画 ----------
    const heroOutPromise = new Promise(resolve => {
      if (currentHeaderContainer) {
        currentHeaderContainer.classList.remove('fade-in', 'fade-out');
        currentHeaderContainer.classList.add('hero-out');

        const onAnimationEnd = () => {
          currentHeaderContainer.removeEventListener('animationend', onAnimationEnd);
          currentHeaderContainer.classList.remove('hero-out');
          resolve();
        };
        currentHeaderContainer.addEventListener('animationend', onAnimationEnd, { once: true });

        setTimeout(resolve, 500);
      } else {
        resolve();
      }
    });

    await heroOutPromise;
    if (!currentHeaderContainer) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // ---------- 3. DOM 替换 ----------
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (newContent && currentContent) {
      currentContent.innerHTML = newContent.innerHTML;
      currentContent.className = newContent.className;
    } else if (newContent && !currentContent) {
      const ref = currentHeaderContainer || currentHeader || currentArticleCard || currentFooter;
      if (ref && ref.parentNode) {
        ref.parentNode.insertBefore(newContent, ref.nextSibling);
      } else {
        document.body.appendChild(newContent);
      }
      currentContent = newContent;
    } else if (!newContent && currentContent) {
      currentContent.remove();
      currentContent = null;
    }

    if (currentHeaderContainer && !newHeaderContainer) {
      currentHeaderContainer.remove();
      currentHeaderContainer = null;
    } else if (newHeaderContainer) {
      const oldHeader = document.querySelector('.header-container');
      if (oldHeader && oldHeader !== currentHeaderContainer) {
        oldHeader.remove();
      }
      if (currentHeaderContainer) {
        currentHeaderContainer.replaceWith(newHeaderContainer);
      } else {
        document.body.insertBefore(newHeaderContainer, document.body.firstChild);
      }
      currentHeaderContainer = newHeaderContainer;
    }

    if (newHeader) {
      if (currentHeader) {
        currentHeader.replaceWith(newHeader);
      } else {
        document.body.insertBefore(newHeader, currentContent || currentFooter);
      }
      currentHeader = newHeader;
    } else if (currentHeader) {
      currentHeader.remove();
      currentHeader = null;
    }

    if (newLogo && currentLogo) {
      currentLogo.innerHTML = newLogo.innerHTML;
    }

    if (newArticleCard) {
      if (currentArticleCard) {
        currentArticleCard.replaceWith(newArticleCard);
      } else {
        document.body.insertBefore(newArticleCard, currentContent || currentFooter);
      }
      currentArticleCard = newArticleCard;
    } else if (currentArticleCard) {
      currentArticleCard.remove();
      currentArticleCard = null;
    }

    if (currentCommentContent) {
      currentCommentContent.remove();
      currentCommentContent = null;
    }
    if (newCommentContent) {
      if (currentFooter && currentFooter.parentNode) {
        currentFooter.parentNode.insertBefore(newCommentContent, currentFooter);
      } else {
        document.body.appendChild(newCommentContent);
      }
      currentCommentContent = newCommentContent;
    }

    if (newFooter) {
      if (currentFooter) {
        currentFooter.replaceWith(newFooter);
      } else {
        document.body.appendChild(newFooter);
      }
      currentFooter = newFooter;
    } else if (currentFooter) {
      currentFooter.remove();
      currentFooter = null;
    }

    // ---------- 4. 初始化新页面内容 ----------
    initCodeBoxes();
    playEnterAnimation(
      '.content, .home-content, .card, .home-link-card, .about-card, ' +
      '.profile-card, .article-card, .header-container, .article-header, ' +
      '.logo, .settings-button, .footer, .comment-content'
    );
    initHitokoto(true);
    initImageViewer();
    bindLinks();
    addRippleEffect();
    bindSettingsTrigger();
    Calendar.init();
    initGiscus();
    ColorThemeManager.applyColor(ColorThemeManager.getColor());

    if (addToHistory) {
      history.pushState(null, '', url);
    }

    window.__lastLoadedPath = url;

    const currentPath = location.pathname;
    document.querySelectorAll('.sidebar a').forEach(a => {
      a.classList.remove('active');
      const href = a.getAttribute('href');
      if (
        href === currentPath ||
        href === currentPath.replace(/^\//, '') ||
        (href === 'index.html' && (currentPath === '/' || currentPath === '/index.html'))
      ) {
        a.classList.add('active');
      }
    });
  } catch (err) {
    console.error('页面加载失败:', err);
    document.querySelectorAll('.fade-out').forEach(el => {
      el.classList.remove('fade-out');
      el.classList.add('fade-in');
    });
  } finally {
    isLoadingPage = false;
  }
}

/* =========================
   链接绑定
========================= */
function bindLinks() {
  let activeTimer = null;

  const isSamePage = (url1, url2) => {
    const normalize = (path) => {
      if (path === '/' || path === '/index.html') return 'index.html';
      return path.replace(/^\//, '');
    };
    return normalize(url1) === normalize(url2);
  };

  const isInternalLink = (url) => {
    if (!url) return false;
    if (url.startsWith('http://') || url.startsWith('https://')) return false;
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) return false;
    if (url.startsWith('#')) return false;
    return true;
  };

  document.querySelectorAll('.sidebar a, .spa-link, .spa-link-home, .content a[href$=".html"], .home-content a[href$=".html"]').forEach(link => {
    if (link.dataset.spaBound === 'true') return;
    link.dataset.spaBound = 'true';

    link.onclick = e => {
      const url = link.getAttribute('href');

      if (!isInternalLink(url)) return;

      e.preventDefault();

      if (isSamePage(url, location.pathname)) {
        return;
      }

      clearTimeout(activeTimer);
      activeTimer = setTimeout(() => {
        document.querySelectorAll('.sidebar a').forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === url) {
            a.classList.add('active');
          }
        });
      }, 300);

      loadPage(url);
    };
  });
}

/* =========================
   代码框组件
========================= */
function smartEscapeHTML(str, lang) {
  if (lang === 'html') {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  let processed = str.replace(/<\/([a-zA-Z0-9]+)>/gi, '');
  processed = processed.replace(/<([a-zA-Z][a-zA-Z0-9_:.+/ -]*)([^>]*)>/gi, (match, tagName, attrs) => {
    return `&lt;${tagName}${attrs}&gt;`;
  });
  return processed;
}

function initCodeBoxes() {
  const codeBoxes = document.querySelectorAll('code-box');
  if (codeBoxes.length === 0) return;

  codeBoxes.forEach((box) => {
    if (box.getAttribute('data-initialized') === 'true') return;

    const originalCode = box.innerHTML.trim();
    const lang = box.getAttribute('data-lang') || 'plaintext';
    const escapedCode = smartEscapeHTML(originalCode, lang);

    box.innerHTML = `
      <div class="code-box-header">
        <span class="code-lang">${lang}</span>
        <button class="copy-btn" title="复制代码">复制</button>
      </div>
      <div class="code-box-content">
        <pre><code class="language-${lang}">${escapedCode}</code></pre>
      </div>
    `;

    const codeElement = box.querySelector('code');
    if (typeof hljs !== 'undefined') {
      hljs.highlightElement(codeElement);
    }

    const copyBtn = box.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
      const textToCopy = codeElement.textContent;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          copyBtn.textContent = '已复制';
          setTimeout(() => { copyBtn.textContent = '复制'; }, 2000);
        });
      } else {
        fallbackCopyText(textToCopy, copyBtn);
      }
    });

    box.setAttribute('data-initialized', 'true');
  });
}

function fallbackCopyText(text, copyBtn) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      copyBtn.textContent = '已复制';
      setTimeout(() => { copyBtn.textContent = '复制'; }, 2000);
    }
  } catch (err) {
    copyBtn.textContent = '复制失败';
    setTimeout(() => { copyBtn.textContent = '复制'; }, 2000);
  }
  document.body.removeChild(textArea);
}

/* =========================
   Giscus
========================= */
function getGiscusThemeUrl() {
  const color = (typeof ColorThemeManager !== 'undefined')
    ? ColorThemeManager.getColor()
    : 'pink';

  const isDark = (() => {
    const theme = ThemeManager.getTheme();
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  })();

  if (color === 'blue') {
    return isDark ? CONFIG.GISCUS_BLUE_DARK_THEME : CONFIG.GISCUS_BLUE_LIGHT_THEME;
  }
  return isDark ? CONFIG.GISCUS_DARK_THEME : CONFIG.GISCUS_LIGHT_THEME;
}

function updateGiscusTheme() {
  const iframe = document.querySelector('iframe.giscus-frame');
  if (!iframe) return;
  iframe.contentWindow.postMessage({
    giscus: { setConfig: { theme: getGiscusThemeUrl() } }
  }, 'https://giscus.app');
}

function initGiscus() {
  const container = document.querySelector('.giscus');
  if (!container) return;

  const oldScript = document.querySelector('script[data-giscus]');
  if (oldScript) oldScript.remove();
  container.querySelectorAll('iframe').forEach(f => f.remove());
  container.querySelectorAll('.giscus-error').forEach(e => e.remove());

  // 清除上一轮的定时器
  if (window.__giscusWatchTimer) { clearInterval(window.__giscusWatchTimer); }
  if (window.__giscusTimeoutTimer) { clearTimeout(window.__giscusTimeoutTimer); }

  const script = document.createElement('script');
  script.src = './js/giscus-client.js';
  script.setAttribute('data-repo', CONFIG.GISCUS_REPO);
  script.setAttribute('data-repo-id', CONFIG.GISCUS_REPO_ID);
  script.setAttribute('data-category', CONFIG.GISCUS_CATEGORY);
  script.setAttribute('data-category-id', CONFIG.GISCUS_CATEGORY_ID);
  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-input-position', 'bottom');
  script.setAttribute('data-theme', getGiscusThemeUrl());
  script.setAttribute('data-lang', 'zh-CN');
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;
  script.dataset.giscus = 'true';

  container.innerHTML = '';
  container.appendChild(script);

  // 等待 iframe 创建并监听加载状态
  let handled = false;

  function showError() {
    if (handled) return;
    handled = true;
    clearInterval(window.__giscusWatchTimer);
    clearTimeout(window.__giscusTimeoutTimer);

    // 移除已有的 iframe 和加载中状态
    container.querySelectorAll('iframe').forEach(f => f.remove());
    container.classList.remove('giscus-loading');

    if (container.querySelector('.giscus-error')) return;

    const errDiv = document.createElement('div');
    errDiv.className = 'giscus-error';
    errDiv.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<line x1="12" y1="8" x2="12" y2="12"/>' +
        '<line x1="12" y1="16" x2="12.01" y2="16"/>' +
      '</svg>' +
      '<p class="giscus-error-title">评论区加载失败</p>' +
      '<p class="giscus-error-desc">网络连接异常，请稍后再试</p>' +
      '<button class="giscus-error-btn" onclick="initGiscus()">重新加载</button>';
    container.appendChild(errDiv);
  }

  function onSuccess() {
    if (handled) return;
    handled = true;
    clearInterval(window.__giscusWatchTimer);
    clearTimeout(window.__giscusTimeoutTimer);
    container.classList.remove('giscus-loading');
  }

  container.classList.add('giscus-loading');

  // 轮询等待 iframe 出现，绑定 load/error 事件
  window.__giscusWatchTimer = setInterval(() => {
    const iframe = container.querySelector('iframe.giscus-frame');
    if (!iframe) return;

    clearInterval(window.__giscusWatchTimer);

    // 检查 iframe 是否已加载完成（异步插入时可能已经 loaded）
    try {
      // 如果能读到 contentWindow 且已 load，直接成功
      if (iframe.contentWindow && iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
        onSuccess();
        return;
      }
    } catch (e) { /* 跨域正常 */ }

    iframe.addEventListener('load', () => {
      onSuccess();
    });

    iframe.addEventListener('error', () => {
      showError();
    });
  }, 100);

  // 10 秒超时兜底：如果 iframe 始终未出现或未触发 load，判定失败
  window.__giscusTimeoutTimer = setTimeout(() => {
    if (handled) return;
    // 如果 iframe 已存在但仍未 load，说明加载卡住
    const iframe = container.querySelector('iframe.giscus-frame');
    if (!iframe) {
      showError();
    }
    // iframe 存在但没 load → 再等 5 秒
    window.__giscusTimeoutTimer = setTimeout(() => {
      if (!handled) showError();
    }, 5000);
  }, 10000);
}

/* =========================
   涟漪效果
========================= */
function addRippleEffect() {
  const rippleElements = document.querySelectorAll(`
    .sidebar a,
    .footer a,
    .li-a,
    .card,
    .home-link-card,
    .settings-button,
    .close-button,
    .md3-button,
    .md3-list-item,
    .spa-link-home,
    .project,
    .article-nav a
  `);

  rippleElements.forEach(element => {
    if (element.dataset.rippleBound === "true") return;
    element.dataset.rippleBound = "true";

    const position = window.getComputedStyle(element).position;
    if (position === 'static') element.style.position = 'relative';
    if (window.getComputedStyle(element).overflow !== 'hidden') element.style.overflow = 'hidden';

    element.addEventListener('pointerdown', function (e) {
      const rect = element.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.classList.add('ripple');
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;

      const old = element.querySelector('.ripple');
      if (old) old.remove();

      element.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });
}

/* =========================
   一言 API
========================= */
let hitokotoCache = null;
let hitokotoCacheTime = 0;

function applyHitokoto(data) {
  const mainText = document.getElementById('hitokoto_text');
  const mainFrom = document.getElementById('hitokoto_from');

  if (!mainText) return;

  const sentence = data.hitokoto;
  const source = data.from ? `—— ${data.from}` : '';

  if (mainText.dataset.current === sentence) return;
  mainText.dataset.current = sentence;

  mainText.textContent = sentence;
  mainText.href = `https://hitokoto.cn/?uuid=${data.uuid}`;

  if (mainFrom) {
    mainFrom.textContent = source;
  }

  mainText.classList.remove('loading');
  if (mainFrom) mainFrom.classList.remove('loading');
}

function applyFallback() {
  const mainText = document.getElementById('hitokoto_text');
  if (!mainText) return;

  const fallbacks = [
    '愿你的每一天都独特而美好',
    '生活明朗，万物可爱',
    '保持热爱，奔赴山海',
    '心有所期，全力以赴',
  ];
  const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

  if (mainText.dataset.current === fallback) return;
  mainText.dataset.current = fallback;
  mainText.textContent = fallback;

  mainText.classList.remove('loading');
  const mainFrom = document.getElementById('hitokoto_from');
  if (mainFrom) {
    mainFrom.textContent = '';
    mainFrom.classList.remove('loading');
  }
}

async function initHitokoto(delay = false) {
  const mainText = document.getElementById('hitokoto_text');
  if (!mainText) return;

  if (delay) {
    setTimeout(() => initHitokoto(false), 350);
    return;
  }

  if (hitokotoCache && (Date.now() - hitokotoCacheTime) < CONFIG.HITOKOTO_CACHE_DURATION) {
    applyHitokoto(hitokotoCache);
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('https://v1.hitokoto.cn/', {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json();
    hitokotoCache = data;
    hitokotoCacheTime = Date.now();

    applyHitokoto(data);
  } catch (e) {
    console.warn('一言获取失败', e);
    if (hitokotoCache) {
      applyHitokoto(hitokotoCache);
    } else {
      applyFallback();
    }
  }
}

/* =========================
   设置弹窗
========================= */
function createSettingsDialog() {
  if (document.querySelector('.settings-dialog')) return;

  const dialogHTML = `
    <div class="settings-dialog" id="settingsDialog" aria-hidden="true">
      <div class="dialog-overlay"></div>
      <div class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div class="settings-header">
          <h2 id="settings-title">设置</h2>
          <button class="close-button" aria-label="关闭设置" id="closeSettingsBtn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="settings-content">
          <div class="md3-list-item" style="cursor: default;">
            <span>
              <div class="item-label">主题模式</div>
              <div class="item-supporting">切换浅色/深色外观</div>
            </span>
            <select id="themeSelect" class="ui-select">
              <option value="auto">跟随系统</option>
              <option value="light">浅色模式</option>
              <option value="dark">深色模式</option>
            </select>
          </div>
          <label class="md3-list-item">
            <span>
              <div class="item-label">动画效果（beta）</div>
              <div class="item-supporting">启用页面切换动画</div>
            </span>
            <span class="md3-switch">
              <input type="checkbox" id="animationToggle" checked>
              <span class="slider"></span>
            </span>
          </label>
          <div class="md3-list-item theme-picker-item">
            <span>
              <div class="item-label">主题颜色（beta）</div>
            </span>
            <span class="theme-color-options">
              <span class="theme-color-btn pink" data-color="pink"></span>
              <span class="theme-color-btn blue" data-color="blue"></span>
            </span>
          </div>
          <div class="md3-list-item" id="clearCacheBtn">
            <span class="item-label">清除缓存</span>
          </div>
        </div>
        <div class="settings-footer-actions">
          <button class="md3-button" id="resetSettingsBtn">重置</button>
          <button class="md3-button" id="saveSettingsBtn">完成</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', dialogHTML);

  const dialog = document.getElementById('settingsDialog');
  const overlay = dialog.querySelector('.dialog-overlay');
  const closeBtn = document.getElementById('closeSettingsBtn');
  const saveBtn = document.getElementById('saveSettingsBtn');
  const themeSelect = document.getElementById('themeSelect');
  const animationToggle = document.getElementById('animationToggle');
  const resetBtn = document.getElementById('resetSettingsBtn');

  themeSelect.addEventListener('click', (e) => e.stopPropagation());

  themeSelect.value = ThemeManager.getTheme();
  const animEnabled = localStorage.getItem('animations-enabled') !== 'false';
  animationToggle.checked = animEnabled;

  const closeDialog = () => {
    dialog.classList.remove('open');
    dialog.setAttribute('aria-hidden', 'true');
  };

  overlay.addEventListener('click', closeDialog);
  closeBtn.addEventListener('click', closeDialog);

  saveBtn.addEventListener('click', () => {
    ThemeManager.setTheme(themeSelect.value);
    localStorage.setItem('animations-enabled', animationToggle.checked);
    closeDialog();
  });

  resetBtn.addEventListener('click', () => {
    themeSelect.value = 'auto';
    animationToggle.checked = true;
  });

  dialog.querySelector('.settings-panel').addEventListener('click', (e) => e.stopPropagation());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog.classList.contains('open')) {
      closeDialog();
    }
  });

  document.getElementById('clearCacheBtn').addEventListener('click', () => {
    if (confirm('确定清除所有缓存数据吗？？')) {
      localStorage.clear();
      ThemeManager.setTheme('auto');
      themeSelect.value = 'auto';
      animationToggle.checked = true;
      alert('缓存已清除');
    }
  });

  themeSelect.addEventListener('change', () => {
    ThemeManager.setTheme(themeSelect.value);
  });

  document.querySelectorAll('.theme-color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const color = btn.dataset.color;
      ColorThemeManager.setColor(color);
    });
  });

  window.addEventListener('popstate', closeDialog);

  addRippleEffect();
}

function openSettingsDialog() {
  createSettingsDialog();
  const dialog = document.getElementById('settingsDialog');
  dialog.classList.add('open');
  dialog.setAttribute('aria-hidden', 'false');
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) themeSelect.value = ThemeManager.getTheme();
  ColorThemeManager.updateActiveButton(ColorThemeManager.getColor());
}

function bindSettingsTrigger() {
  const trigger = document.getElementById('settings-trigger');
  const nav = document.getElementById('settings-nav');
  if (trigger) {
    trigger.removeEventListener('click', openSettingsDialog);
    trigger.addEventListener('click', openSettingsDialog);
  }
  if (nav) {
    nav.removeEventListener('click', openSettingsDialog);
    nav.addEventListener('click', openSettingsDialog);
  }
}

/* =========================
   Viewer.js 图片查看器初始化
========================= */
function initImageViewer() {
  const containers = document.querySelectorAll('.article-card');
  containers.forEach(container => {
    if (container.dataset.viewer === 'true') return;
    container.dataset.viewer = 'true';
    new Viewer(container, {
      toolbar: {
        zoomIn: false,
        zoomOut: false,
        oneToOne: false,
        reset: true,
        prev: true,
        play: false,
        next: true,
        rotateLeft: false,
        rotateRight: false,
        flipHorizontal: false,
        flipVertical: false,
      },
      navbar: false,
      title: false,
      keyboard: true,
      tooltip: true,
      movable: true,
      zoomable: true,
      rotatable: true,
      scalable: true,
      transition: true,
      fullscreen: true,
    });
  });
}

/* =========================
   日历组件（事件委托）
========================= */
const Calendar = {
  current: new Date(),

  init() {
    this.render();
    this.bindEvents();
  },

  render() {
    const container = document.getElementById('calendar');
    if (!container) return;

    const year = this.current.getFullYear();
    const month = this.current.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const today = new Date();

    let html = `
      <div class="calendar-header">
        <button class="cal-prev">‹</button>
        <span>${year} 年 ${month + 1} 月</span>
        <button class="cal-next">›</button>
      </div>
      <div class="calendar-grid">
        ${['日','一','二','三','四','五','六'].map(d => `<div class="cal-day-name">${d}</div>`).join('')}
    `;

    for (let i = 0; i < firstDay; i++) {
      html += `<div class="cal-day empty"></div>`;
    }

    for (let d = 1; d <= lastDate; d++) {
      const isToday =
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      html += `
        <div class="cal-day ${isToday ? 'today' : ''}">
          ${d}
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  bindEvents() {
    const container = document.getElementById('calendar');
    if (!container || container.dataset.bound === 'true') return;
    container.dataset.bound = 'true';

    container.addEventListener('click', (e) => {
      if (e.target.closest('.cal-prev')) {
        this.current.setMonth(this.current.getMonth() - 1);
        this.render();
      } else if (e.target.closest('.cal-next')) {
        this.current.setMonth(this.current.getMonth() + 1);
        this.render();
      }
    });
  }
};

/* =========================
   初始化执行
========================= */
function initAll() {
  ThemeManager.init();
  ColorThemeManager.init();

  bindLinks();
  addRippleEffect();
  bindSettingsTrigger();
  Calendar.init();
  initGiscus();

  const hidePreloader = () => {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const elapsed = Date.now() - pageLoadStart;
    const remaining = Math.max(CONFIG.MIN_LOAD_TIME - elapsed, 0);

    const doHide = () => {
      preloader.classList.add('hidden');

      setTimeout(() => {
        initCodeBoxes();
        initHitokoto();
        playEnterAnimation(
          '.content, .home-content, .card, .home-link-card, .about-card, ' +
          '.profile-card, .article-card, .header-container, .article-header, ' +
          '.logo, .settings-button, .footer, .comment-content'
        );
        initImageViewer();
      }, 400);
    };

    if (remaining > 0) {
      setTimeout(doHide, remaining);
    } else {
      doHide();
    }
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(hidePreloader, 0);
  } else {
    document.addEventListener('DOMContentLoaded', hidePreloader);
  }
}

window.addEventListener('popstate', () => {
  const targetPath = location.pathname;
  const normalize = (path) => {
    if (path === '/' || path === '/index.html') return 'index.html';
    return path.replace(/^\//, '');
  };
  if (normalize(targetPath) !== normalize(window.__lastLoadedPath || '')) {
    loadPage(targetPath, false);
  }
});

initAll();