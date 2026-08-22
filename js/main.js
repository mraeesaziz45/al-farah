/* ==========================================================================
   AL-FARAH MEDICAL CENTER — MAIN JS
   Vanilla JS only. No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Header scroll state
  --------------------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 12) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------------- */
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  var menuClose = document.querySelector('.mobile-menu-close');

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    var firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) { closeMenu(); } else { openMenu(); }
    });
    if (menuClose) menuClose.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal (IntersectionObserver)
  --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealEls.length && !prefersReduced && 'IntersectionObserver' in window) {
    var groups = {};
    revealEls.forEach(function (el) {
      var group = el.closest('[data-reveal-group]');
      if (group) {
        var key = group;
        if (!groups.has) { /* noop for older browsers */ }
      }
    });

    var indexInGroup = new WeakMap();
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      var children = group.querySelectorAll('[data-reveal]');
      children.forEach(function (child, i) {
        child.style.setProperty('--i', i);
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------------
     Gallery filtering
  --------------------------------------------------------------------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var galleryItems = document.querySelectorAll('.gallery-grid figure');

  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        var category = btn.getAttribute('data-filter');

        galleryItems.forEach(function (item) {
          var itemCategory = item.getAttribute('data-category');
          if (category === 'all' || itemCategory === category) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     Lightbox
  --------------------------------------------------------------------- */
  var lightbox = document.querySelector('.lightbox');

  if (lightbox && galleryItems.length) {
    var lightboxImg = lightbox.querySelector('.lightbox-figure img');
    var lightboxCaption = lightbox.querySelector('.lightbox-caption');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    var currentIndex = 0;
    var visibleItems = [];
    var lastFocused = null;

    function refreshVisibleItems() {
      visibleItems = Array.prototype.filter.call(galleryItems, function (item) {
        return !item.classList.contains('hidden');
      });
    }

    function showImage(index) {
      refreshVisibleItems();
      if (!visibleItems.length) return;
      currentIndex = (index + visibleItems.length) % visibleItems.length;
      var item = visibleItems[currentIndex];
      var img = item.querySelector('img');
      var captionEl = item.querySelector('.gallery-caption');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      lightboxCaption.textContent = captionEl ? captionEl.textContent : (img.alt || '');
    }

    function openLightbox(item) {
      refreshVisibleItems();
      var idx = visibleItems.indexOf(item);
      lastFocused = document.activeElement;
      showImage(idx === -1 ? 0 : idx);
      lightbox.classList.add('is-open');
      document.body.classList.add('menu-open');
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      if (lastFocused) lastFocused.focus();
    }

    galleryItems.forEach(function (item) {
      item.addEventListener('click', function () { openLightbox(item); });
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(item);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', function () { showImage(currentIndex - 1); });
    nextBtn.addEventListener('click', function () { showImage(currentIndex + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });
  }

  /* ---------------------------------------------------------------------
     Contact form validation
  --------------------------------------------------------------------- */
  var form = document.querySelector('.contact-form');

  if (form) {
    var statusEl = form.querySelector('.form-status');

    function setFieldError(field, message) {
      var errorEl = document.getElementById(field.id + '-error');
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        if (errorEl) errorEl.textContent = message;
      } else {
        field.removeAttribute('aria-invalid');
        if (errorEl) errorEl.textContent = '';
      }
    }

    function validateField(field) {
      var value = field.value.trim();
      if (field.hasAttribute('required') && !value) {
        setFieldError(field, 'This field is required.');
        return false;
      }
      if (field.type === 'email' && value) {
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          setFieldError(field, 'Enter a valid email address.');
          return false;
        }
      }
      if (field.type === 'tel' && value) {
        var phonePattern = /^[0-9+\-\s()]{7,}$/;
        if (!phonePattern.test(value)) {
          setFieldError(field, 'Enter a valid phone number.');
          return false;
        }
      }
      setFieldError(field, '');
      return true;
    }

    var fields = form.querySelectorAll('input, textarea');
    fields.forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var isValid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) isValid = false;
      });

      statusEl.classList.remove('success', 'error');

      if (!isValid) {
        statusEl.textContent = 'Please correct the highlighted fields before sending.';
        statusEl.classList.add('error', 'is-visible');
        statusEl.setAttribute('role', 'alert');
        return;
      }

      statusEl.textContent = 'Your message has been validated. This is a static website — connect a backend or email service to deliver messages to Al-Farah Medical Center.';
      statusEl.classList.add('success', 'is-visible');
      statusEl.setAttribute('role', 'status');
      form.reset();
      fields.forEach(function (field) { setFieldError(field, ''); });
    });
  }
})();
