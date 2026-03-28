async function loadPage(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const newContent = doc.querySelector('.content');
    const newLogo = doc.querySelector('.logo');
    const newHeader = doc.querySelector('.article-header'); // 头图
    const newArticleCard = doc.querySelector('.article-card'); // 新增：文章卡片

    const currentContent = document.querySelector('.content');
    const currentLogo = document.querySelector('.logo');
    let currentHeader = document.querySelector('.article-header');
    let currentArticleCard = document.querySelector('.article-card');

    if (newContent && currentContent) {
      // 添加淡出动画
      currentContent.classList.add('fade-out');
      if (currentLogo) currentLogo.classList.add('fade-out');
      if (currentHeader) currentHeader.classList.add('fade-out');
      if (currentArticleCard) currentArticleCard.classList.add('fade-out');

      setTimeout(() => {
        // 替换 content 内容
        currentContent.innerHTML = newContent.innerHTML;

        // 替换 logo
        if (newLogo && currentLogo) currentLogo.innerHTML = newLogo.innerHTML;

        // 替换或插入头图
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

        // 替换或插入 article-card
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
          }, 50);
        } else if (currentArticleCard) {
          currentArticleCard.remove();
        }

        // 添加 content 淡入动画
        currentContent.classList.remove('fade-out');
        currentContent.classList.add('fade-in');

        if (currentLogo) {
          currentLogo.classList.remove('fade-out');
          currentLogo.classList.add('fade-in');
        }

        // 清理 fade-in
        setTimeout(() => {
          currentContent.classList.remove('fade-in');
          if (currentLogo) currentLogo.classList.remove('fade-in');
          if (newHeader) newHeader.classList.remove('fade-in');
          if (newArticleCard) newArticleCard.classList.remove('fade-in');
        }, 400);

        // 重新绑定事件和动画
        bindLinks();
        addRippleEffect();
        animateProfileCard();
        animateArticleCard();

      }, 200);
    }

    // 修改 URL
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

function bindLinks() {
  document.querySelectorAll('.sidebar a, .spa-link').forEach(link => {
    link.onclick = function(e) {
      e.preventDefault();
      loadPage(this.getAttribute('href'));
    }
  });
}

window.addEventListener('popstate', () => {
  loadPage(location.pathname);
});

/* 水波效果 */
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

/* 个人信息卡动画 */
function animateProfileCard() {
  const profileCard = document.querySelector('.profile-card');
  if (profileCard) {
    profileCard.classList.remove('fade-in');
    setTimeout(() => {
      profileCard.classList.add('fade-in');
    }, 50);
  }
}

/* 文章卡片动画 */
function animateArticleCard() {
  const articleCards = document.querySelectorAll('.article-card');
  articleCards.forEach(card => {
    card.classList.remove('fade-in');
    setTimeout(() => {
      card.classList.add('fade-in');
    }, 50);
  });
}

/* 初始化 */
bindLinks();
addRippleEffect();
animateProfileCard();
animateArticleCard();
