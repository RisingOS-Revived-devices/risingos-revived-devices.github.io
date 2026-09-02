/**
* Template Name: Personal
* Template URL: https://bootstrapmade.com/personal-free-resume-bootstrap-template/
* Updated: Nov 04 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
  const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const navmenu = document.querySelector('#navmenu');
  const mobileNavMediaQuery = window.matchMedia('(max-width: 1199px)');

  function isMobileNavViewport() {
    return mobileNavMediaQuery.matches;
  }

  function getNavMenuList() {
    return navmenu?.querySelector(':scope > ul') || mobileNavDrawer?.querySelector(':scope > ul') || null;
  }

  function mountMobileNavMenu() {
    const menuList = navmenu?.querySelector(':scope > ul');
    if (menuList && mobileNavDrawer && menuList.parentElement !== mobileNavDrawer) {
      mobileNavDrawer.appendChild(menuList);
    }
  }

  function unmountMobileNavMenu() {
    const menuList = mobileNavDrawer?.querySelector(':scope > ul');
    if (menuList && navmenu && menuList.parentElement !== navmenu) {
      navmenu.appendChild(menuList);
    }
  }

  function setMobileNavOpen(isOpen) {
    if (!mobileNavToggleBtn) {
      return;
    }

    const body = document.body;

    if (isOpen && isMobileNavViewport()) {
      mountMobileNavMenu();
      body.classList.add('mobile-nav-active');
      if (mobileNavBackdrop) {
        mobileNavBackdrop.hidden = false;
        mobileNavBackdrop.setAttribute('aria-hidden', 'false');
      }
      if (mobileNavDrawer) {
        mobileNavDrawer.setAttribute('aria-hidden', 'false');
      }
      mobileNavToggleBtn.classList.remove('bi-list');
      mobileNavToggleBtn.classList.add('bi-x');
      mobileNavToggleBtn.setAttribute('aria-label', 'Close menu');
      mobileNavToggleBtn.setAttribute('aria-expanded', 'true');
      return;
    }

    body.classList.remove('mobile-nav-active');
    unmountMobileNavMenu();
    if (mobileNavBackdrop) {
      mobileNavBackdrop.hidden = true;
      mobileNavBackdrop.setAttribute('aria-hidden', 'true');
    }
    if (mobileNavDrawer) {
      mobileNavDrawer.setAttribute('aria-hidden', 'true');
    }
    mobileNavToggleBtn.classList.remove('bi-x');
    mobileNavToggleBtn.classList.add('bi-list');
    mobileNavToggleBtn.setAttribute('aria-label', 'Open menu');
    mobileNavToggleBtn.setAttribute('aria-expanded', 'false');
  }

  function mobileNavToggle() {
    setMobileNavOpen(!document.body.classList.contains('mobile-nav-active'));
  }

  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      mobileNavToggle();
    });

    if (mobileNavBackdrop) {
      mobileNavBackdrop.addEventListener('click', () => {
        if (document.body.classList.contains('mobile-nav-active')) {
          setMobileNavOpen(false);
        }
      });
    }

    document.addEventListener('click', (event) => {
      const menuList = getNavMenuList();
      if (
        document.body.classList.contains('mobile-nav-active') &&
        menuList &&
        !menuList.contains(event.target) &&
        !mobileNavToggleBtn.contains(event.target) &&
        !mobileNavBackdrop?.contains(event.target)
      ) {
        setMobileNavOpen(false);
      }
    });

    mobileNavMediaQuery.addEventListener('change', () => {
      if (!isMobileNavViewport()) {
        setMobileNavOpen(false);
      }
    });
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.addEventListener('click', (event) => {
    const navLink = event.target.closest('#navmenu a, #mobile-nav-drawer a');
    if (navLink && document.body.classList.contains('mobile-nav-active')) {
      setMobileNavOpen(false);
    }
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

})();