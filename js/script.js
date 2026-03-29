async function loadPage(url) {
  try {

    // ⭐ 防止重复触发
    if (window.__loading) return;
    window.__loading = true;

    // ⭐ 1. 立刻回顶（防止滚动残留）
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

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
    const currentHeader = document.querySelector('.article-header');
    const currentArticleCard = document.querySelector('.article-card');

    if (!newContent || !currentContent) {
      window.__loading = false;
      return;
    }

    // ⭐ 2. 开始淡出
    currentContent.classList.add('fade-out');
    if (currentLogo) currentLogo.classList.add('fade-out');
    if (currentHeader) currentHeader.classList.add('fade-out');
    if (currentArticleCard) currentArticleCard.classList.add('fade-out');

    // ⭐ 3. 等待淡出完成
    setTimeout(() => {

      // ⭐ 4. 再等 0.2s（你的节奏）
      setTimeout(() => {

        // ⭐ 5. 更新 URL
        history.pushState(null, '', url);

        // ⭐ 6. 替换 content
        currentContent.innerHTML = newContent.innerHTML;

        // ⭐ 7. 替换 logo
        if (newLogo && currentLogo) {
          currentLogo.innerHTML = newLogo.innerHTML;
        }

        // ⭐ 8. 替换 header
        if (newHeader) {
          if (currentHeader) {
            currentHeader.replaceWith(newHeader);
          } else {
            document.body.insertBefore(newHeader, currentContent);
          }
        } else if (currentHeader) {
          currentHeader.remove();
        }

        // ⭐ 9. 替换 article card
        if (newArticleCard) {
          if (currentArticleCard) {
            currentArticleCard.replaceWith(newArticleCard);
          } else {
            document.body.insertBefore(newArticleCard, currentContent);
          }
        } else if (currentArticleCard) {
          currentArticleCard.remove();
        }

        // ⭐ 10. 触发淡入
        currentContent.classList.remove('fade-out');
        currentContent.classList.add('fade-in');

        if (currentLogo) {
          currentLogo.classList.remove('fade-out');
          currentLogo.classList.add('fade-in');
        }

        if (newHeader) {
          setTimeout(() => {
            newHeader.classList.remove('fade-out');
            newHeader.classList.add('fade-in');
          }, 50);
        }

        if (newArticleCard) {
          setTimeout(() => {
            newArticleCard.classList.remove('fade-out');
            newArticleCard.classList.add('fade-in');
          }, 50);
        }

        // ⭐ 11. 清理 fade-in 状态
        setTimeout(() => {
          currentContent.classList.remove('fade-in');
          if (currentLogo) currentLogo.classList.remove('fade-in');
          if (newHeader) newHeader.classList.remove('fade-in');
          if (newArticleCard) newArticleCard.classList.remove('fade-in');

          window.__loading = false;
        }, 400);

        // ⭐ 12. 重新绑定功能
        bindLinks();
        addRippleEffect();
        animateProfileCard();
        animateArticleCard();

        // ⭐ 13. sidebar 高亮
        document.querySelectorAll('.sidebar a').forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === url) {
            a.classList.add('active');
          }
        });

      }, 200);

    }, 200);

  } catch (err) {
    console.error('加载失败:', err);
    window.__loading = false;
  }
}


/* =========================
   链接绑定
========================= */
function bindLinks() {
  document.querySelectorAll('.sidebar a, .spa-link').forEach(link => {
    if (link.__bound) return;

    link.__bound = true;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      loadPage(link.getAttribute('href'));
    });
  });
}


/* =========================
   popstate
========================= */
window.addEventListener('popstate', () => {
  loadPage(location.pathname);
});


/* =========================
   ripple效果（防重复绑定）
========================= */
function addRippleEffect() {
  document.querySelectorAll('.sidebar a').forEach(button => {
    if (button.__rippleBound) return;
    button.__rippleBound = true;

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
   profile动画
========================= */
function animateProfileCard() {
  const card = document.querySelector('.profile-card');
  if (!card) return;

  card.classList.remove('fade-in');
  setTimeout(() => card.classList.add('fade-in'), 50);
}


/* =========================
   article动画
========================= */
function animateArticleCard() {
  document.querySelectorAll('.article-card').forEach(card => {
    card.classList.remove('fade-in');
    setTimeout(() => card.classList.add('fade-in'), 50);
  });
}


/* =========================
   初始化
========================= */
bindLinks();
addRippleEffect();
animateProfileCard();
animateArticleCard();
