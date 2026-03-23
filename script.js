/* =============================================
   STICKY HEADER
   Shows after scrolling past first fold (100vh),
   hides when scrolling back up above the fold.
   ============================================= */
(function () {
  const header = document.getElementById('stickyHeader');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    const fold = window.innerHeight;

    if (current > fold) {
      // Past first fold — show header
      header.classList.add('visible');
    } else {
      // Above first fold — always hide
      header.classList.remove('visible');
    }

    lastScroll = current <= 0 ? 0 : current;
  }, { passive: true });
})();

/* =============================================
   HAMBURGER MENU (mobile)
   ============================================= */
(function () {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
})();

/* =============================================
   IMAGE CAROUSEL
   - Prev/Next buttons
   - Dot navigation
   - Keyboard accessible
   - Shows 3 cards on desktop, 2 on tablet, 1 on mobile
   ============================================= */
(function () {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track) return;

  const cards = Array.from(track.children);
  let current = 0;

  /* How many cards visible at once based on viewport */
  function getVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - getVisible());
  }

  /* Build dots */
  function buildDots() {
    dotsContainer.innerHTML = '';
    const total = maxIndex() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === current ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.setAttribute('aria-selected', i === current);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  /* Update dots active state */
  function updateDots() {
    Array.from(dotsContainer.children).forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-selected', i === current);
    });
  }

  /* Move carousel to index */
  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));

    // Calculate card width + gap
    const card = cards[0];
    const gap = 24;
    const offset = current * (card.offsetWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    updateDots();
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= maxIndex();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  /* Keyboard navigation */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  /* Touch / swipe support */
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goTo(current + 1) : goTo(current - 1);
  });

  /* Rebuild on resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      current = Math.min(current, maxIndex());
      buildDots();
      goTo(current);
    }, 150);
  });

  /* Init */
  buildDots();
  goTo(0);
})();

/* =============================================
   FAQ ACCORDION
   ============================================= */
(function () {
  const items = document.querySelectorAll('.faq-question');

  items.forEach((btn) => {
    btn.addEventListener('click', () => {
      const wrapper = btn.nextElementSibling;
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      items.forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.style.maxHeight = null;
      });

      // Toggle clicked
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        wrapper.style.maxHeight = wrapper.scrollHeight + "px";
      }
    });
  });
})();

/* =============================================
   HIGHLIGHTS CAROUSEL LOGIC
   ============================================= */
(function () {
  const track = document.getElementById('hlTrack');
  const prevBtn = document.getElementById('hlPrev');
  const nextBtn = document.getElementById('hlNext');

  if (!track || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.children);
  let current = 0;

  function getVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - getVisible());
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const card = cards[0];
    const gap = 24;
    const offset = current * (card.offsetWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    // Flash visible cards for "changing" feel
    const visible = getVisible();
    cards.slice(current, current + visible).forEach(c => {
      c.classList.remove('hl-flash');
      void c.offsetWidth; // reflow to restart animation
      c.classList.add('hl-flash');
    });

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= maxIndex();
    prevBtn.style.opacity = current === 0 ? '0.3' : '1';
    nextBtn.style.opacity = current >= maxIndex() ? '0.3' : '1';
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goTo(current + 1) : goTo(current - 1);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      current = Math.min(current, maxIndex());
      goTo(current);
    }, 150);
  });

  goTo(0);
})();

/* =============================================
   SOLUTIONS TABS LOGIC
   - Tab pills with connecting line
   - Prev/Next arrow navigation
   - Slide animation on every switch
   ============================================= */
(function() {
  const tabs = document.querySelectorAll('#solutionTabs .tab-pill');
  const panels = document.querySelectorAll('#solutionPanels .tab-panel');
  const prevBtn = document.getElementById('tabPrev');
  const nextBtn = document.getElementById('tabNext');

  if (!tabs.length || !panels.length) return;

  let currentIndex = 0;
  let isAnimating = false;

  function updateArrows() {
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === tabs.length - 1;
    if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.35' : '1';
    if (nextBtn) nextBtn.style.opacity = currentIndex === tabs.length - 1 ? '0.35' : '1';
  }

  function setTab(index, direction) {
    if (isAnimating) return;
    if (index < 0 || index >= tabs.length) return;

    isAnimating = true;
    const enterFrom = direction === 'prev' ? '-20px' : '20px';
    const exitTo   = direction === 'prev' ? '20px'  : '-20px';

    // Update pills immediately
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tabs[index].classList.add('active');
    tabs[index].setAttribute('aria-selected', 'true');

    const currentPanel = panels[currentIndex];
    const nextPanel = panels[index];

    // Exit current
    currentPanel.style.animation = 'none';
    currentPanel.style.opacity = '1';
    currentPanel.style.transform = 'translateX(0)';
    currentPanel.style.display = 'block';

    requestAnimationFrame(() => {
      currentPanel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      currentPanel.style.opacity = '0';
      currentPanel.style.transform = `translateX(${exitTo})`;

      setTimeout(() => {
        currentPanel.style.display = 'none';
        currentPanel.style.transition = '';
        currentPanel.style.opacity = '';
        currentPanel.style.transform = '';

        currentIndex = index;

        // Enter next
        nextPanel.style.display = 'block';
        nextPanel.style.opacity = '0';
        nextPanel.style.transform = `translateX(${enterFrom})`;
        nextPanel.style.transition = '';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            nextPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            nextPanel.style.opacity = '1';
            nextPanel.style.transform = 'translateX(0)';

            setTimeout(() => {
              nextPanel.style.transition = '';
              nextPanel.classList.add('active');
              isAnimating = false;
              updateArrows();
            }, 310);
          });
        });
      }, 210);
    });
  }

  // Remove active from all panels first, show only index 0
  panels.forEach((p, i) => {
    p.classList.remove('active');
    p.style.display = i === 0 ? 'block' : 'none';
  });
  panels[0].classList.add('active');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.getAttribute('data-index'), 10);
      if (idx === currentIndex) return;
      setTab(idx, idx > currentIndex ? 'next' : 'prev');
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', () => setTab(currentIndex - 1, 'prev'));
  if (nextBtn) nextBtn.addEventListener('click', () => setTab(currentIndex + 1, 'next'));

  updateArrows();
})();

/* =============================================
   CUSTOM THEME VERTICAL TABS
   ============================================= */
(function() {
  const items = document.querySelectorAll('#ctFeatureList li');
  const imgTarget = document.getElementById('ctMainImage');

  if (!items.length || !imgTarget) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all
      items.forEach(i => i.classList.remove('active'));
      
      // Add active to clicked
      item.classList.add('active');
      
      // Change image
      const src = item.getAttribute('data-img');
      imgTarget.style.opacity = '0.5';
      setTimeout(() => {
        imgTarget.src = src;
        imgTarget.style.opacity = '1';
      }, 200);
    });
  });
})();

/* =============================================
   MODALS LOGIC
   ============================================= */
(function() {
  const btnDatasheet = document.getElementById('openDatasheetModal');
  const btnQuote = document.getElementById('openQuoteModal');
  const overlayDatasheet = document.getElementById('datasheetModal');
  const overlayQuote = document.getElementById('quoteModal');
  const closeBtns = document.querySelectorAll('.modal-close, .ds-modal-close');

  function openModal(modal) {
    if(modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modal) {
    if(modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (btnDatasheet) {
    btnDatasheet.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(overlayDatasheet);
    });
  }

  if (btnQuote) {
    btnQuote.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(overlayQuote);
    });
  }

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const target = document.getElementById(modalId);
      closeModal(target);
    });
  });

  // Close on outside click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal(e.target);
    }
  });

  // Datasheet Form Logic
  const datasheetForm = document.getElementById('datasheetForm');

  if (datasheetForm) {
    datasheetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal(overlayDatasheet);
      datasheetForm.reset();
    });
  }

  // Quote Form Logic
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal(overlayQuote);
      quoteForm.reset();
    });
  }
})();

/* =============================================
   HERO GALLERY LOGIC & ZOOM
   ============================================= */
(function() {
  const galPrev = document.getElementById('galPrev');
  const galNext = document.getElementById('galNext');
  const thumbsContainer = document.getElementById('galThumbnails');
  const mainImg = document.getElementById('mainZoomImage');
  const zoomContainer = document.getElementById('mainZoomContainer');

  if (!galPrev || !galNext || !thumbsContainer || !mainImg || !zoomContainer) return;

  const thumbs = Array.from(thumbsContainer.children);
  let currentIndex = 0;

  function updateGallery(index) {
    if (index < 0) index = thumbs.length - 1;
    if (index >= thumbs.length) index = 0;
    currentIndex = index;

    // Update active thumb
    thumbs.forEach(t => {
      t.classList.remove('active');
    });
    thumbs[currentIndex].classList.add('active');

    // Update main image
    const newSrc = thumbs[currentIndex].getAttribute('data-img');
    mainImg.src = newSrc;
  }

  thumbs.forEach((thumb, idx) => {
    thumb.addEventListener('click', () => {
      updateGallery(idx);
    });
  });

  galPrev.addEventListener('click', () => updateGallery(currentIndex - 1));
  galNext.addEventListener('click', () => updateGallery(currentIndex + 1));

  // Zoom Logic on Desktop (Amazon Style Side Zoom)
  const zoomLens = document.getElementById('zoomLens');
  const zoomPreviewBox = document.getElementById('zoomPreviewBox');
  const zoomRatio = 2.5; // Represents how much larger the preview image is relative to main image

  zoomContainer.addEventListener('mouseenter', () => {
    if (window.innerWidth < 1024) return;
    zoomLens.style.opacity = '1';
    zoomPreviewBox.style.opacity = '1';
    zoomPreviewBox.style.backgroundImage = `url('${mainImg.src}')`;
    
    // Set preview box background size based on ratio
    const rect = zoomContainer.getBoundingClientRect();
    zoomPreviewBox.style.backgroundSize = `${rect.width * zoomRatio}px ${rect.height * zoomRatio}px`;
  });

  zoomContainer.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 1024) return;
    
    const rect = zoomContainer.getBoundingClientRect();
    
    // Calculate lens dimensions dynamically
    const previewRect = zoomPreviewBox.getBoundingClientRect();
    const lensWidth = previewRect.width / zoomRatio;
    const lensHeight = previewRect.height / zoomRatio;
    
    zoomLens.style.width = lensWidth + 'px';
    zoomLens.style.height = lensHeight + 'px';

    // Mouse coordinates relative to image container
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Center the lens on the mouse
    let lensX = x - (lensWidth / 2);
    let lensY = y - (lensHeight / 2);

    // Prevent lens from going outside the image bounds
    if (lensX < 0) lensX = 0;
    if (lensY < 0) lensY = 0;
    if (lensX > rect.width - lensWidth) lensX = rect.width - lensWidth;
    if (lensY > rect.height - lensHeight) lensY = rect.height - lensHeight;

    zoomLens.style.left = lensX + 'px';
    zoomLens.style.top = lensY + 'px';

    // Move the background of the preview box
    const bgPosX = -(lensX * zoomRatio);
    const bgPosY = -(lensY * zoomRatio);
    
    zoomPreviewBox.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
  });

  zoomContainer.addEventListener('mouseleave', () => {
    zoomLens.style.opacity = '0';
    zoomPreviewBox.style.opacity = '0';
  });
})();
