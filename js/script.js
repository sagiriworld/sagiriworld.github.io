/* =========================
   全局变量与初始化
========================= */
// 主题管理器
const ThemeManager = {
  STORAGE_KEY: 'site-theme',
  getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'auto';
  },
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateMetaThemeColor();
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

ThemeManager.init();

/* =========================
   SPA 页面加载（修复 content 上浮动画）
========================= */
async function loadPage(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const newContent = doc.querySelector('.home-content') || doc.querySelector('.content');
    const newLogo = doc.querySelector('.logo');
    const newHeaderContainer = doc.querySelector('.header-container');
    const newHeader = doc.querySelector('.article-header');
    const newArticleCard = doc.querySelector('.article-card');

    const currentContent = document.querySelector('.home-content') || document.querySelector('.content');
    const currentLogo = document.querySelector('.logo');
    let currentHeaderContainer = document.querySelector('.header-container');
    let currentHeader = document.querySelector('.article-header');
    let currentArticleCard = document.querySelector('.article-card');

    if (newContent && currentContent) {
      const newContentClasses = newContent.className;

      // 退场
      currentContent.classList.add('fade-out');
      if (currentLogo) currentLogo.classList.add('fade-out');
      if (currentHeaderContainer) currentHeaderContainer.classList.add('fade-out');
      if (currentHeader) currentHeader.classList.add('fade-out');
      if (currentArticleCard) currentArticleCard.classList.add('fade-out');

      setTimeout(() => {
        // 1. 头图容器
        if (newHeaderContainer) {
          if (currentHeaderContainer) {
            currentHeaderContainer.replaceWith(newHeaderContainer);
          } else {
            document.body.insertBefore(newHeaderContainer, currentContent);
          }
          newHeaderContainer.classList.add('fade-out');
          requestAnimationFrame(() => {
            newHeaderContainer.classList.remove('fade-out');
            newHeaderContainer.classList.add('fade-in');
          });
        } else {
          if (currentHeaderContainer) currentHeaderContainer.remove();
        }

        // 2. 文章头图
        if (newHeader) {
          newHeader.classList.add('fade-out');
          if (currentHeader) {
            currentHeader.replaceWith(newHeader);
          } else {
            document.body.insertBefore(newHeader, currentContent);
          }
          requestAnimationFrame(() => {
            newHeader.classList.remove('fade-out');
            newHeader.classList.add('fade-in');
          });
        } else {
          if (currentHeader) currentHeader.remove();
        }

        // 3. 主内容区：替换内容并触发上浮 + 渐显动画
        currentContent.innerHTML = newContent.innerHTML;
        currentContent.className = newContentClasses;   // 干净的 .content 或 .home-content

        // 强制应用 fade-out 起始状态
        currentContent.classList.add('fade-out');
        // 强制重排，让浏览器记录 fade-out 的样式
        void currentContent.offsetWidth;

        // 使用双重 requestAnimationFrame 确保过渡被正确触发
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            currentContent.classList.remove('fade-out');
            currentContent.classList.add('fade-in');
          });
        });

        // 4. Logo
        if (newLogo && currentLogo) currentLogo.innerHTML = newLogo.innerHTML;

        // 5. 文章卡片
        if (newArticleCard) {
          newArticleCard.classList.add('fade-out');
          if (currentArticleCard) {
            currentArticleCard.replaceWith(newArticleCard);
          } else {
            document.body.insertBefore(newArticleCard, currentContent);
          }
          requestAnimationFrame(() => {
            newArticleCard.classList.remove('fade-out');
            newArticleCard.classList.add('fade-in');
            initCodeBoxes();
          });
        } else {
          if (currentArticleCard) currentArticleCard.remove();
        }

        // 6. Logo 淡入
        if (currentLogo) {
          currentLogo.classList.remove('fade-out');
          currentLogo.classList.add('fade-in');
        }

        // 7. 清理动画
        setTimeout(() => {
          currentContent.classList.remove('fade-in');
          currentContent.className = newContentClasses;   // 确保最终类名正确
          if (currentLogo) currentLogo.classList.remove('fade-in');
          if (newHeaderContainer) newHeaderContainer.classList.remove('fade-in');
          if (newHeader) newHeader.classList.remove('fade-in');
          if (newArticleCard) newArticleCard.classList.remove('fade-in');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 400);

        // 8. 一言
        initHitokoto(true);

        // 9. 重新绑定
        bindLinks();
        addRippleEffect();
        animateAboutCard();
        animateProfileCard();
        animateArticleCard();
        bindSettingsTrigger();
      }, 200);
    }

    history.pushState(null, '', url);

    document.querySelectorAll('.sidebar a').forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === url) a.classList.add('active');
    });
  } catch (err) {
    console.error('加载失败:', err);
  }
}


/* =========================
   链接绑定
========================= */
function bindLinks() {
  document.querySelectorAll('.sidebar a, .spa-link').forEach(link => {
    link.onclick = e => {
      e.preventDefault();
      loadPage(link.getAttribute('href'));
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
   涟漪效果
========================= */
function addRippleEffect() {
  const rippleElements = document.querySelectorAll(`
    .sidebar a, 
    .li-a, 
    .settings-button, 
    .settings-button-m,
    .close-button, 
    .md3-button, 
    .md3-list-item
  `);

  rippleElements.forEach(element => {
    if (element.dataset.rippleBound === "true") return;
    element.dataset.rippleBound = "true";

    const position = window.getComputedStyle(element).position;
    if (position === 'static') element.style.position = 'relative';
    if (window.getComputedStyle(element).overflow !== 'hidden') element.style.overflow = 'hidden';

    element.addEventListener('click', function (e) {
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
   入场动画
========================= */
function animateAboutCard() {
  const el = document.querySelector('.about-card');
  if (!el) return;
  el.classList.remove('fade-in');
  setTimeout(() => el.classList.add('fade-in'), 50);
}

function animateProfileCard() {
  const el = document.querySelector('.profile-card');
  if (!el) return;
  el.classList.remove('fade-in');
  setTimeout(() => el.classList.add('fade-in'), 50);
}

function animateArticleCard() {
  document.querySelectorAll('.article-card').forEach(el => {
    el.classList.remove('fade-in');
    setTimeout(() => el.classList.add('fade-in'), 50);
  });
}

/* =========================
   一言 API
========================= */
let hitokotoCache = null;
let hitokotoCacheTime = 0;
const HITOKOTO_CACHE_DURATION = 5 * 60 * 1000;

function applyHitokoto(data) {
  const mainText = document.getElementById('hitokoto_text');
  const mainFrom = document.getElementById('hitokoto_from');
  const navText = document.getElementById('nav_hitokoto_text');
  const navFrom = document.getElementById('nav_hitokoto_from');

  const sentence = data.hitokoto;
  const source = data.from ? `—— ${data.from}` : '';

  if (mainText) {
    mainText.innerText = sentence;
    mainText.href = `https://hitokoto.cn/?uuid=${data.uuid}`;
  }
  if (mainFrom) mainFrom.innerText = source;

  if (navText) {
    navText.innerText = sentence;
    navText.href = `https://hitokoto.cn/?uuid=${data.uuid}`;
  }
  if (navFrom) navFrom.innerText = source;
}

function applyFallback() {
  const mainText = document.getElementById('hitokoto_text');
  const navText = document.getElementById('nav_hitokoto_text');
  const fallback = '愿你的每一天都独特而美好';
  if (mainText) mainText.innerText = fallback;
  if (navText) navText.innerText = fallback;
}

async function initHitokoto() {
  const mainText = document.getElementById('hitokoto_text');
  const navText = document.getElementById('nav_hitokoto_text');
  if (!mainText && !navText) return;

  if (hitokotoCache && (Date.now() - hitokotoCacheTime) < HITOKOTO_CACHE_DURATION) {
    applyHitokoto(hitokotoCache);
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://v1.hitokoto.cn/?c=a&c=c&c=b', { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await res.json();
    hitokotoCache = data;
    hitokotoCacheTime = Date.now();
    applyHitokoto(data);
  } catch (e) {
    console.warn('一言获取失败', e);
    if (hitokotoCache) applyHitokoto(hitokotoCache);
    else applyFallback();
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
            <select id="themeSelect" class="theme-select" style="padding: 8px 12px; border-radius: 20px; border: 1px solid var(--color-pink-soft); background: var(--color-bg); color: var(--color-text);">
              <option value="auto">跟随系统</option>
              <option value="light">浅色模式</option>
              <option value="dark">深色模式</option>
            </select>
          </div>
          <label class="md3-list-item">
            <span>
              <div class="item-label">动画效果</div>
              <div class="item-supporting">启用页面切换动画</div>
            </span>
            <span class="md3-switch">
              <input type="checkbox" id="animationToggle" checked>
              <span class="slider"></span>
            </span>
          </label>
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
    if (confirm('确定清除所有缓存数据吗？')) {
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

  window.addEventListener('popstate', closeDialog);
  const originalLoadPage = window.loadPage;
  if (originalLoadPage) {
    window.loadPage = async function(url) {
      closeDialog();
      return originalLoadPage.call(this, url);
    };
  }

  addRippleEffect();
}

function openSettingsDialog() {
  createSettingsDialog();
  const dialog = document.getElementById('settingsDialog');
  dialog.classList.add('open');
  dialog.setAttribute('aria-hidden', 'false');
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) themeSelect.value = ThemeManager.getTheme();
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
   初始化执行
========================= */
function initAll() {
  bindLinks();
  addRippleEffect();
  animateAboutCard();
  animateProfileCard();
  animateArticleCard();
  initHitokoto();
  bindSettingsTrigger(); // 关键：绑定设置按钮
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeBoxes);
  } else {
    initCodeBoxes();
  }
}

initAll();

// 监听 popstate
window.addEventListener('popstate', () => {
  loadPage(location.pathname);
});
