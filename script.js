/* ==========================================================================
   Talha Naqqash — Portfolio
   Vanilla ES6+ JS. No jQuery, no dependencies.
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initActiveNavLink();
    initTypewriter();
    initStatCounters();
    initRevealOnScroll();
    initCursorGlow();
    initParticleField();
    initContactForm();
    initFooterYear();
  });

  /* ---------- Sticky header: shadow state on scroll ---------- */
  function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    const toggle = () => {
      header.classList.toggle('header--scrolled', window.scrollY > 24);
    };
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
  }

  /* ---------- Mobile hamburger menu ---------- */
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('headerNav');
    if (!hamburger || !nav) return;

    const closeMenu = () => {
      nav.classList.remove('header__nav--open');
      hamburger.classList.remove('header__hamburger--active');
      hamburger.setAttribute('aria-expanded', 'false');
    };

    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('header__nav--open');
      hamburger.classList.toggle('header__hamburger--active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click (mobile UX)
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

    // Close on outside click
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target) && !hamburger.contains(event.target)) closeMenu();
    });

    // Close on Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Active nav link highlighting while scrolling ---------- */
  function initActiveNavLink() {
    const sections = document.querySelectorAll('main section[id]');
    const links = document.querySelectorAll('.header__nav-link');
    if (!sections.length || !links.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          links.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
          });
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- Typewriter effect for rotating role text ---------- */
  function initTypewriter() {
    const el = document.getElementById('typedText');
    if (!el) return;

    const roles = [
      'Senior Front-End Developer',
      'WordPress Theme Architect',
      'API Integration Specialist',
      'Figma-to-Code Specialist',
    ];

    if (prefersReducedMotion) {
      el.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const TYPE_SPEED = 65;
    const DELETE_SPEED = 35;
    const PAUSE_AFTER_TYPE = 1800;
    const PAUSE_AFTER_DELETE = 300;

    const tick = () => {
      const currentRole = roles[roleIndex];

      if (!isDeleting) {
        charIndex++;
        el.textContent = currentRole.slice(0, charIndex);
        if (charIndex === currentRole.length) {
          isDeleting = true;
          setTimeout(tick, PAUSE_AFTER_TYPE);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        charIndex--;
        el.textContent = currentRole.slice(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(tick, PAUSE_AFTER_DELETE);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    };

    tick();
  }

  /* ---------- Animated stat counters (count up once, on scroll into view) ---------- */
  function initStatCounters() {
    const counters = document.querySelectorAll('.hero__stat-number');
    if (!counters.length) return;

    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;

      if (prefersReducedMotion) {
        el.textContent = target;
        return;
      }

      const duration = 1400;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /* ---------- Generic scroll-reveal for section content ---------- */
  function initRevealOnScroll() {
    const items = document.querySelectorAll('.u-reveal');
    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((item) => observer.observe(item));
  }

  /* ---------- Ambient cursor glow that follows the pointer ---------- */
  function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow || prefersReducedMotion) return;
    if (window.matchMedia('(hover: none)').matches) return; // skip on touch devices

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let active = false;

    window.addEventListener('mousemove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!active) {
        active = true;
        glow.classList.add('is-active');
      }
    });

    document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));

    const render = () => {
      // Smooth trailing motion
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  /* ---------- Lightweight particle constellation field in the hero ---------- */
  function initParticleField() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.hero');
    let width, height, particles;
    let animationId;

    const PARTICLE_COLOR = '79, 70, 229'; // matches --color-accent (indigo)
    const LINK_DISTANCE = 130;

    const particleCount = () => (window.innerWidth < 720 ? 26 : 55);

    const resize = () => {
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
    };

    const createParticles = () => {
      particles = Array.from({ length: particleCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PARTICLE_COLOR}, 0.35)`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${PARTICLE_COLOR}, ${0.12 * (1 - dist / LINK_DISTANCE)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    // Pause the animation when the tab isn't visible to save CPU/battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        draw();
      }
    });
  }

  /* ---------- Contact form (front-end only) ---------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form || !status) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        status.textContent = 'Please fill in all fields with a valid email.';
        return;
      }

      // NOTE: this is a front-end-only demo. To actually deliver messages,
      // connect this form to a backend or a service such as Formspree,
      // EmailJS, or your own API endpoint, then submit the data there.
      status.textContent = "✅ Message ready to send — connect this form to your email service to go live.";
      form.reset();
    });
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    const el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }
})();
