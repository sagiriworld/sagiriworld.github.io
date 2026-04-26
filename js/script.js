/* =========================
   1. 全局变量与主题管理
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
      if (this.getTheme() === 'auto') this.updateMetaThemeColor();
    });
  }
};

ThemeManager.init();

/* =========================
   2. SPA 核心加载逻辑 (含统一动画)
========================= */
async function loadPage(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // 提取新页面元素
    const newContent = doc.querySelector('.home-content') || doc.querySelector('.content');
    const newLogo = doc.querySelector('.logo');
    const newHeaderContainer = doc.querySelector('.header-container');
    const newHeader = doc.querySelector('.article-header');
    const newArticleCard = doc.querySelector('.article-card');

    // 获取当前页面元素
    const currentContent = document.querySelector('.home-content') || document.querySelector('.content');
    const currentLogo = document.querySelector('.logo');
    let currentHeaderContainer = document.querySelector('.header-container');
    let currentHeader = document.querySelector('.article-header');
    let currentArticleCard = document.querySelector('.article-card');

    if (newContent && currentContent) {
      const newContentClasses = newContent.className;

      // --- 阶段 A: 统一退场 (0.2s) ---
      const fadeTargets = [currentContent, currentLogo, currentHeaderContainer, currentHeader, currentArticleCard].filter(Boolean);
      fadeTargets.forEach(el => el.classList.add('fade-out'));

      setTimeout(() => {
        // --- 阶段 B: DOM 替换 ---
        
        // 1. 头图容器处理
        if (newHeaderContainer) {
          if (currentHeaderContainer) currentHeaderContainer.replaceWith(newHeaderContainer);
          else document.body.insertBefore(newHeaderContainer, currentContent);
          newHeaderContainer.classList.add('fade-out'); // 准备入场
        } else if (currentHeaderContainer) {
          currentHeaderContainer.remove();
        }

        // 2. 文章头图处理
        if (newHeader) {
          if (currentHeader) currentHeader.replaceWith(newHeader);
          else document.body.insertBefore(newHeader, currentContent);
          newHeader.classList.add('fade-out');
        } else if (currentHeader) {
          currentHeader.remove();
        }

        // 3. 主内容替换
        currentContent.innerHTML = newContent.innerHTML;
        currentContent.className = newContentClasses; 
        currentContent.classList.add('fade-out'); // 确保新内容初始是隐藏下沉状态

        // 4. 文章卡片处理
        if (newArticleCard) {
          if (currentArticleCard) currentArticleCard.replaceWith(newArticleCard);
          else document.body.insertBefore(newArticleCard, currentContent);
          newArticleCard.classList.add('fade-out');
        } else if (currentArticleCard) {
          currentArticleCard.remove();
        }

        // 5. Logo 状态重置
        if (newLogo && currentLogo) {
          currentLogo.innerHTML = newLogo.innerHTML;
          currentLogo.classList.add('fade-out');
        }

        // --- 阶段 C: 统一入场 (0.4s) ---
        // 强制重排 (Reflow)
        void currentContent.offsetWidth;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const entryTargets = [currentContent, currentLogo, newHeaderContainer, newHeader, newArticleCard].filter(Boolean);
            entryTargets.forEach(el => {
              el.classList.remove('fade-out');
              el.classList.add('fade-in');
            });
            // 初始化新内容中的组件
            initCodeBoxes();
          });
        });

        // --- 阶段 D: 收尾清理 ---
        setTimeout(() => {
          [currentContent, currentLogo, newHeaderContainer, newHeader, newArticleCard].filter(Boolean).forEach(el => {
            el.classList.remove('fade-in');
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 450);

        // 重新挂载逻辑
        initHitokoto(true);
        bindLinks();
        addRippleEffect();
        runPageAnimations(); // 重新运行卡片等微动效
        bindSettingsTrigger();
      }, 200); // 匹配 fade-out 的 0.2s
    }

    history.pushState(null, '', url);

    // 更新侧边栏状态
    document.querySelectorAll('.sidebar a').forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === url) a.classList.add('active');
    });
  } catch (err) {
    console.error('SPA加载失败:', err);
  }
}

/* =========================
   3. 功能组件初始化
========================= */

// 统一运行卡片入场动画
function runPageAnimations() {
  const selectors = ['.about-card', '.profile-card', '.article-card'];
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.remove('fade-in');
      void el.offsetWidth;
      el.classList.add('fade-in');
    });
  });
}

// 链接绑定
function bindLinks() {
  document.querySelectorAll('.sidebar a, .spa-link').forEach(link => {
    link.onclick = e => {
      e.preventDefault();
      loadPage(link.getAttribute('href'));
    };
  });
}

// 代码高亮与复制
function initCodeBoxes() {
  const codeBoxes = document.querySelectorAll('code-box');
  codeBoxes.forEach((box) => {
    if (box.dataset.initialized === 'true') return;
    const originalCode = box.innerHTML.trim();
    const lang = box.getAttribute('data-lang') || 'plaintext';
    
    // HTML 转义
    let escaped = originalCode;
    if (lang === 'html') {
      const div = document.createElement('div');
      div.textContent = originalCode;
      escaped = div.innerHTML;
    }

    box.innerHTML = `
      <div class="code-box-header"><span class="code-lang">${lang}</span><button class="copy-btn">复制</button></div>
      <div class="code-box-content"><pre><code class="language-${lang}">${escaped}</code></pre></div>
    `;

    const codeEl = box.querySelector('code');
    if (window.hljs) hljs.highlightElement(codeEl);

    box.querySelector('.copy-btn').onclick = function() {
      navigator.clipboard.writeText(codeEl.textContent).then(() => {
        this.textContent = '已复制';
        setTimeout(() => this.textContent = '复制', 2000);
      });
    };
    box.dataset.initialized = 'true';
  });
}

// 涟漪效果
function addRippleEffect() {
  const rippleElements = document.querySelectorAll('.sidebar a, .li-a, .settings-button, .md3-button, .md3-list-item');
  rippleElements.forEach(element => {
    if (element.dataset.rippleBound === "true") return;
    element.dataset.rippleBound = "true";
    if (getComputedStyle(element).position === 'static') element.style.position = 'relative';
    element.style.overflow = 'hidden';

    element.addEventListener('click', function (e) {
      const rect = element.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      circle.classList.add('ripple');
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - diameter/2}px`;
      circle.style.top = `${e.clientY - rect.top - diameter/2}px`;
      const old = element.querySelector('.ripple');
      if (old) old.remove();
      element.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });
}

// 一言 API
async function initHitokoto(delay = false) {
  const mainText = document.getElementById('hitokoto_text');
  if (!mainText) return;
  if (delay) { setTimeout(() => initHitokoto(false), 350); return; }

  try {
    const res = await fetch('https://v1.hitokoto.cn/?c=a&c=b');
    const data = await res.json();
    mainText.textContent = data.hitokoto;
    const from = document.getElementById('hitokoto_from');
    if (from) from.textContent = `—— ${data.from}`;
  } catch (e) {
    mainText.textContent = '愿你的每一天都独特而美好';
  }
}

/* =========================
   4. 设置弹窗逻辑
========================= */
function createSettingsDialog() {
  if (document.getElementById('settingsDialog')) return;
  const html = `
    <div class="settings-dialog" id="settingsDialog">
      <div class="dialog-overlay" onclick="this.parentElement.classList.remove('open')"></div>
      <div class="settings-panel">
        <div class="settings-header"><h2>设置</h2><button class="close-button" onclick="this.closest('.settings-dialog').classList.remove('open')">✕</button></div>
        <div class="settings-content">
          <div class="md3-list-item"><span>主题模式</span>
            <select id="themeSelect" onchange="ThemeManager.setTheme(this.value)">
              <option value="auto">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option>
            </select>
          </div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function bindSettingsTrigger() {
  const btn = document.getElementById('settings-trigger') || document.getElementById('settings-nav');
  if (btn) btn.onclick = () => {
    createSettingsDialog();
    document.getElementById('settingsDialog').classList.add('open');
    document.getElementById('themeSelect').value = ThemeManager.getTheme();
  };
}

/* =========================
   5. 启动执行
========================= */
function initAll() {
  bindLinks();
  addRippleEffect();
  runPageAnimations();
  initHitokoto();
  bindSettingsTrigger();
  initCodeBoxes();
}

window.addEventListener('popstate', () => loadPage(location.pathname));
document.addEventListener('DOMContentLoaded', initAll);
