async function loadPage(url) {
  try {

    // ⭐ 1. 立刻回到顶部（在任何动画/请求之前）
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
    let currentHeader = document.querySelector('.article-header');
    let currentArticleCard = document.querySelector('.article-card');

    if (newContent && currentContent) {

      // ⭐ 2. 先开始淡出动画
      currentContent.classList.add('fade-out');
      if (currentLogo) currentLogo.classList.add('fade-out');
      if (currentHeader) currentHeader.classList.add('fade-out');
      if (currentArticleCard) currentArticleCard.classList.add('fade-out');

      setTimeout(() => {

        // ⭐ 3. 替换 content
        currentContent.innerHTML = newContent.innerHTML;

        // 替换 logo
        if (newLogo && currentLogo) {
          currentLogo.innerHTML = newLogo.innerHTML;
        }

        // 替换 header
        if (newHeader) {
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

        // 替换 article-card
        if (newArticleCard) {
          if (currentArticleCard) {
            currentArticleCard.replaceWith(newArticleCard);
          } else {
            document.body.insertBefore(newArticleCard, currentContent);
          }

          setTimeout(() => {
            newArticleCard.classList.remove('fade-out');
            newArticleCard.classList.add('fade-in');
          }, 50);

        } else if (currentArticleCard) {
          currentArticleCard.remove();
        }

        // ⭐ 4. content / logo 淡入
        currentContent.classList.remove('fade-out');
        currentContent.classList.add('fade-in');

        if (currentLogo) {
          currentLogo.classList.remove('fade-out');
          currentLogo.classList.add('fade-in');
        }

        // ⭐ 5. 清理 fade-in + 收尾
        setTimeout(() => {
          currentContent.classList.remove('fade-in');
          if (currentLogo) currentLogo.classList.remove('fade-in');
          if (newHeader) newHeader.classList.remove('fade-in');
          if (newArticleCard) newArticleCard.classList.remove('fade-in');
        }, 400);

        // ⭐ 6. 重新绑定事件 & 动画
        bindLinks();
        addRippleEffect();
        animateProfileCard();
        animateArticleCard();

      }, 200);
    }

    // ⭐ 7. 更新 URL
    history.pushState(null, '', url);

    // ⭐ 8. sidebar 高亮
    document.querySelectorAll('.sidebar a').forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === url) {
        a.classList.add('active');
      }
    });

  } catch (err) {
    console.error('加载失败:', err);
  }
}


/* =========================
   事件绑定
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
   popstate（返回/前进）
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
   profile card 动画
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
   article card 动画
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
   初始化
========================= */
bindLinks();
addRippleEffect();
animateProfileCard();
animateArticleCard();
