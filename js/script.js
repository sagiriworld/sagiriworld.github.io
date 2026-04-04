/* =========================
   SPA 页面加载 + Markdown 渲染 + 高亮 + 行号 + 顶部语言 + 复制按钮
========================= */
async function loadPage(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const newContent = doc.querySelector('.content');
    const newLogo = doc.querySelector('.logo');
    const newHeader = doc.querySelector('.article-header');
    const newArticleCard = doc.querySelector('.article-card');

    const currentContent = document.querySelector('.content');
    const currentLogo = document.querySelector('.logo');
    let currentHeader = document.querySelector('.article-header');
    let currentArticleCard = document.querySelector('.article-card');

    if (newContent && currentContent) {
      currentContent.classList.add('fade-out');
      if (currentLogo) currentLogo.classList.add('fade-out');
      if (currentHeader) currentHeader.classList.add('fade-out');
      if (currentArticleCard) currentArticleCard.classList.add('fade-out');

      setTimeout(() => {
        // ===== DOM 替换 =====
        currentContent.innerHTML = newContent.innerHTML;
        // 一言刷新：内容替换后立即更新
        initHitokoto();

        if (newLogo && currentLogo) currentLogo.innerHTML = newLogo.innerHTML;

        // ===== header 替换 =====
        if (newHeader) {
          newHeader.classList.add('fade-out');
          if (currentHeader) {
            currentHeader.replaceWith(newHeader);
          } else {
            document.body.insertBefore(newHeader, currentContent);
          }
          setTimeout(() => {
            newHeader.classList.remove('fade-out');
            newHeader.classList.add('fade-in');
          }, 50);
        } else if (currentHeader) {
          currentHeader.remove();
        }

        // ===== article-card 替换 =====
        if (newArticleCard) {
          newArticleCard.classList.add('fade-out');
          if (currentArticleCard) {
            currentArticleCard.replaceWith(newArticleCard);
          } else {
            document.body.insertBefore(newArticleCard, currentContent);
          }
          setTimeout(() => {
            newArticleCard.classList.remove('fade-out');
            newArticleCard.classList.add('fade-in');
            renderMarkdown(newArticleCard); // 渲染 Markdown
          }, 50);
        } else if (currentArticleCard) {
          currentArticleCard.remove();
        }

        // ===== content 淡入 =====
        currentContent.classList.remove('fade-out');
        currentContent.classList.add('fade-in');
        if (currentLogo) {
          currentLogo.classList.remove('fade-out');
          currentLogo.classList.add('fade-in');
        }

        // ===== 动画清理 + 回顶 =====
        setTimeout(() => {
          currentContent.classList.remove('fade-in');
          if (currentLogo) currentLogo.classList.remove('fade-in');
          if (newHeader) newHeader.classList.remove('fade-in');
          if (newArticleCard) newArticleCard.classList.remove('fade-in');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 400);

        // ===== 重新绑定 =====
        bindLinks();
        addRippleEffect();
        animateProfileCard();
        animateArticleCard();
      }, 200);
    }

    history.pushState(null, '', url);

    // sidebar 高亮
    document.querySelectorAll('.sidebar a').forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === url) a.classList.add('active');
    });
  } catch (err) {
    console.error('加载失败:', err);
  }
}

/* =========================
   Markdown 渲染 + 高亮 + 行号 + 顶部语言 + 复制按钮
========================= */
function renderMarkdown(container) {
  const codeBlocks = container.querySelectorAll('.codeblock');
  codeBlocks.forEach(block => {
    const codeContent = block.textContent.trim();
    const langMatch = codeContent.match(/^```(\w+)/);
    let lang = langMatch ? langMatch[1] : '';
    const rawCode = codeContent.replace(/^```[\w]*\n?/, '').replace(/```$/, '');

    let highlighted;
    if (lang && hljs.getLanguage(lang)) {
      highlighted = hljs.highlight(rawCode, { language: lang }).value;
    } else {
      highlighted = hljs.highlightAuto(rawCode).value;
      lang = lang || 'text';
    }

    // 分行生成带行号的 HTML
    const lines = highlighted.split(/\n/);
    const codeWithLines = lines.map((line, index) => {
      return `<div class="code-line"><span class="line-number">${index + 1}</span>${line || '&#8203;'}</div>`;
    }).join('');

    const html = `
      <div class="code-header">
        <span class="code-lang">${lang}</span>
        <button class="copy-btn">复制</button>
      </div>
      <pre class="hljs ${lang}"><code>${codeWithLines}</code></pre>
    `;

    block.innerHTML = html;

    // 移除 hljs 自动生成的 language-XXX
    block.querySelectorAll('.hljs [class^="language-"]').forEach(el => el.remove());

    // 绑定复制按钮
    const btn = block.querySelector('.copy-btn');
    const codeEl = block.querySelector('pre code');
    if (btn && codeEl) {
      btn.onclick = () => {
        navigator.clipboard.writeText(rawCode).then(() => {
          btn.textContent = '已复制';
          setTimeout(() => { btn.textContent = '复制'; }, 1000);
        });
      };
    }
  });
}

/* =========================
   绑定 SPA 链接
========================= */
function bindLinks() {
  document.querySelectorAll('.sidebar a, .spa-link').forEach(link => {
    link.onclick = function (e) {
      e.preventDefault();
      loadPage(this.getAttribute('href'));
    };
  });
}

/* =========================
   popstate 返回
========================= */
window.addEventListener('popstate', () => {
  loadPage(location.pathname);
});

/* =========================
   水波效果
========================= */
function addRippleEffect() {
  document.querySelectorAll('.sidebar a').forEach(button => {
    button.addEventListener('click', function (e) {
      const rect = button.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.classList.add('ripple');
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;

      const ripple = button.querySelector('.ripple');
      if (ripple) ripple.remove();
      button.appendChild(circle);
    });
  });
}

/* =========================
   profile-card 动画
========================= */
function animateProfileCard() {
  const profileCard = document.querySelector('.profile-card');
  if (profileCard) {
    profileCard.classList.remove('fade-in');
    setTimeout(() => {
      profileCard.classList.add('fade-in');
    }, 50);
  }
}

/* =========================
   article-card 动画
========================= */
function animateArticleCard() {
  const articleCards = document.querySelectorAll('.article-card');
  articleCards.forEach(card => {
    card.classList.remove('fade-in');
    setTimeout(() => {
      card.classList.add('fade-in');
    }, 50);
  });
}

/* =========================
   一言
========================= */
async function initHitokoto() {
  const mainTextLink = document.getElementById('hitokoto_text');
  const mainFromSpan = document.getElementById('hitokoto_from');
  const navTextLink = document.getElementById('nav_hitokoto_text');
  const navFromSpan = document.getElementById('nav_hitokoto_from');

  if (!mainTextLink && !navTextLink) return;

  try {
    const response = await fetch('https://v1.hitokoto.cn/?c=a');
    const data = await response.json();
    const sentence = data.hitokoto;
    const source = (data.from && data.from.trim() !== '') ? `—— ${data.from}` : '';

    // 更新普通区域
    if (mainTextLink) {
      mainTextLink.href = `https://hitokoto.cn/?uuid=${data.uuid}`;
      mainTextLink.innerText = sentence;
    }
    if (mainFromSpan) mainFromSpan.innerText = source;

    // 更新 navbar 区域（句子 + 来源）
    if (navTextLink) {
      navTextLink.href = `https://hitokoto.cn/?uuid=${data.uuid}`;
      navTextLink.innerText = sentence;
    }
    if (navFromSpan) navFromSpan.innerText = source;
  } catch (err) {
    console.error('一言获取失败:', err);
    const fallbackText = '愿你的每一天都独特而美好';
    if (mainTextLink) mainTextLink.innerText = fallbackText;
    if (navTextLink) navTextLink.innerText = fallbackText;
    if (mainFromSpan) mainFromSpan.innerText = '';
    if (navFromSpan) navFromSpan.innerText = '';
  }
}

/* =========================
   初始化
========================= */
bindLinks();
addRippleEffect();
animateProfileCard();
animateArticleCard();

// 渲染初始页面 Markdown
document.querySelectorAll('.article-card').forEach(block => renderMarkdown(block));

// 初始化一言（页面首次加载）
initHitokoto();
