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

    if (!newContent || !currentContent) return;

    // ⭐ 1. 开始淡出
    currentContent.classList.add('fade-out');
    if (currentLogo) currentLogo.classList.add('fade-out');
    if (currentHeader) currentHeader.classList.add('fade-out');
    if (currentArticleCard) currentArticleCard.classList.add('fade-out');

    // ⭐ 2. 监听“真正淡出结束”
    const onFadeOutEnd = (e) => {
      if (e.target !== currentContent) return;

      currentContent.removeEventListener('transitionend', onFadeOutEnd);

      // ⭐ 3. 真正淡出完成后再回顶
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // ⭐ 4. 替换内容
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

      // ⭐ 5. 开始淡入（下一帧更稳定）
      requestAnimationFrame(() => {
        currentContent.classList.remove('fade-out');
        currentContent.classList.add('fade-in');

        if (currentLogo) {
          currentLogo.classList.remove('fade-out');
          currentLogo.classList.add('fade-in');
        }

        if (newHeader) {
          newHeader.classList.remove('fade-out');
          newHeader.classList.add('fade-in');
        }

        if (newArticleCard) {
          newArticleCard.classList.remove('fade-out');
          newArticleCard.classList.add('fade-in');
        }
      });

      // ⭐ 6. 清理 fade-in 状态
      setTimeout(() => {
        currentContent.classList.remove('fade-in');
        if (currentLogo) currentLogo.classList.remove('fade-in');
        if (newHeader) newHeader.classList.remove('fade-in');
        if (newArticleCard) newArticleCard.classList.remove('fade-in');
      }, 400);

      // ⭐ 7. 重新绑定事件
      bindLinks();
      addRippleEffect();
      animateProfileCard();
      animateArticleCard();
    };

    currentContent.addEventListener('transitionend', onFadeOutEnd);

    // ⭐ 8. 更新地址栏 + sidebar active
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
