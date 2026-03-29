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

      // ⭐ 1. 先淡出
      currentContent.classList.add('fade-out');
      if (currentLogo) currentLogo.classList.add('fade-out');
      if (currentHeader) currentHeader.classList.add('fade-out');
      if (currentArticleCard) currentArticleCard.classList.add('fade-out');

      setTimeout(() => {

        // ⭐ 2. 淡出完成后 → 立刻回顶（关键）
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // ⭐ 3. 替换内容
        currentContent.innerHTML = newContent.innerHTML;

        if (newLogo && currentLogo) {
          currentLogo.innerHTML = newLogo.innerHTML;
        }

        if (newHeader) {
          if (currentHeader) {
            currentHeader.replaceWith(newHeader);
          } else {
            document.body.insertBefore(newHeader, currentContent);
          }
        } else if (currentHeader) {
          currentHeader.remove();
        }

        if (newArticleCard) {
          if (currentArticleCard) {
            currentArticleCard.replaceWith(newArticleCard);
          } else {
            document.body.insertBefore(newArticleCard, currentContent);
          }
        } else if (currentArticleCard) {
          currentArticleCard.remove();
        }

        // ⭐ 4. 开始淡入
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

        // ⭐ 5. 清理动画状态
        setTimeout(() => {
          currentContent.classList.remove('fade-in');
          if (currentLogo) currentLogo.classList.remove('fade-in');
          if (newHeader) newHeader.classList.remove('fade-in');
          if (newArticleCard) newArticleCard.classList.remove('fade-in');
        }, 400);

        // ⭐ 6. 重新绑定
        bindLinks();
        addRippleEffect();
        animateProfileCard();
        animateArticleCard();

      }, 200); // fade-out 时间

    }

    history.pushState(null, '', url);

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
