/* =========================
   SPA 页面加载
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
        currentContent.innerHTML = newContent.innerHTML;
        initHitokoto();

        if (newLogo && currentLogo) currentLogo.innerHTML = newLogo.innerHTML;

        if (newHeader) {
          newHeader.classList.add('fade-out');
          if (currentHeader) currentHeader.replaceWith(newHeader);
          else document.body.insertBefore(newHeader, currentContent);

          setTimeout(() => {
            newHeader.classList.remove('fade-out');
            newHeader.classList.add('fade-in');
          }, 50);
        } else if (currentHeader) currentHeader.remove();

        if (newArticleCard) {
          newArticleCard.classList.add('fade-out');
          if (currentArticleCard) currentArticleCard.replaceWith(newArticleCard);
          else document.body.insertBefore(newArticleCard, currentContent);

          setTimeout(() => {
            newArticleCard.classList.remove('fade-out');
            newArticleCard.classList.add('fade-in');
			initCodeBoxes();
          }, 50);
        } else if (currentArticleCard) currentArticleCard.remove();

        currentContent.classList.remove('fade-out');
        currentContent.classList.add('fade-in');
        if (currentLogo) {
          currentLogo.classList.remove('fade-out');
          currentLogo.classList.add('fade-in');
        }

        setTimeout(() => {
          currentContent.classList.remove('fade-in');
          if (currentLogo) currentLogo.classList.remove('fade-in');
          if (newHeader) newHeader.classList.remove('fade-in');
          if (newArticleCard) newArticleCard.classList.remove('fade-in');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 400);

        bindLinks();
        addRippleEffect();
        animateProfileCard();
        animateArticleCard();
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
   代码框组件
========================= */
// 改进版：转义HTML特殊字符并修复浏览器对代码的“自动修补”
function smartEscapeHTML(str, lang) {
    // 1. 如果是 HTML 语言，我们希望完整显示源码，直接转义所有字符即可
    if (lang === 'html') {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // 2. 对于其他语言（如 C++, Java），处理浏览器误判产生的“假标签”
    // 核心逻辑：
    // a) 移除所有闭合标签（如 </iostream>），因为它们通常是浏览器为了修补结构自动加上的
    let processed = str.replace(/<\/([a-zA-Z0-9]+)>/gi, '');

    // b) 将被误认为是“开始标签”的部分（如 <iostream>）还原为纯文本转义形式
    // 我们限制标签名必须以字母开头，避免误伤 i < 10 这样的逻辑判断
    processed = processed.replace(/<([a-zA-Z][a-zA-Z0-9_:.+/ -]*)([^>]*)>/gi, (match, tagName, attrs) => {
        // 如果浏览器把后面的代码当成了属性 (attrs)，也一并还原
        return `&lt;${tagName}${attrs}&gt;`;
    });

    // c) 最后处理可能漏掉的孤立尖括号（例如 i < 10 中的 <）
    // 注意：由于 & 符号在 innerHTML 中已经是 &amp;，这里不需要重复处理
    return processed;
}

        
// 初始化代码框组件
function initCodeBoxes() {
  const codeBoxes = document.querySelectorAll('code-box');
  if (codeBoxes.length === 0) return;

  codeBoxes.forEach((box) => {
    // 检查是否已初始化，防止 SPA 切换时重复渲染
    if (box.getAttribute('data-initialized') === 'true') return;

    // 1. 获取原始代码和语言
    // 注意：这里用 innerHTML 获取源码，以便处理其中的 HTML 标签
    const originalCode = box.innerHTML.trim();
    const lang = box.getAttribute('data-lang') || 'plaintext';

    // 2. 转义 HTML（防止代码里的 <script> 等标签直接运行）
    const escapedCode = smartEscapeHTML(originalCode, lang);

    // 3. 构建包含复制按钮和标题的 UI 结构
    box.innerHTML = `
      <div class="code-box-header">
        <span class="code-lang">${lang}</span>
        <button class="copy-btn" title="复制代码">复制</button>
      </div>
      <div class="code-box-content">
        <pre><code class="language-${lang}">${escapedCode}</code></pre>
      </div>
    `;

    // 4. 调用 Highlight.js 进行渲染
    const codeElement = box.querySelector('code');
    if (typeof hljs !== 'undefined') {
      hljs.highlightElement(codeElement);
    } else {
      console.error('未检测到 Highlight.js，请确保已在 HTML 中引入脚本。');
    }

    // 5. 绑定复制功能
    const copyBtn = box.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
      // 获取代码元素的纯文本内容（hljs 渲染后依然能通过 textContent 获取原文）
      const textToCopy = codeElement.textContent;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = '已复制';
          setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
        });
      } else {
        fallbackCopyText(textToCopy, copyBtn);
      }
    });

    // 标记为已初始化
    box.setAttribute('data-initialized', 'true');
  });
}

        
// 传统复制方法
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
            // 复制成功提示
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已复制';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }
    } catch (err) {
        console.error('复制失败: ', err);
        copyBtn.textContent = '复制失败';
        setTimeout(() => {
            copyBtn.textContent = '复制';
        }, 2000);
    }    
    document.body.removeChild(textArea);
}
// 页面加载完成后初始化代码框
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeBoxes);
} else {
    initCodeBoxes();
}


/* =========================
   SPA 链接
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
   popstate
========================= */
window.addEventListener('popstate', () => {
  loadPage(location.pathname);
});


/* =========================
   ripple
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

      const old = button.querySelector('.ripple');
      if (old) old.remove();
      button.appendChild(circle);
    });
  });
}


/* =========================
   animations
========================= */
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
   一言
========================= */
async function initHitokoto() {
  const mainText = document.getElementById('hitokoto_text');
  const mainFrom = document.getElementById('hitokoto_from');
  const navText = document.getElementById('nav_hitokoto_text');
  const navFrom = document.getElementById('nav_hitokoto_from');

  if (!mainText && !navText) return;

  try {
    const res = await fetch('https://v1.hitokoto.cn/?c=a&c=c&c=b');
    const data = await res.json();

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

  } catch (e) {
    const fallback = '愿你的每一天都独特而美好';
    if (mainText) mainText.innerText = fallback;
    if (navText) navText.innerText = fallback;
  }
}


/* =========================
   init
========================= */
bindLinks();
addRippleEffect();
animateProfileCard();
animateArticleCard();
initHitokoto();
