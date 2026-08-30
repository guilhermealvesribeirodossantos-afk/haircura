// ==========================================================
// HAIRCURA — script.js V3
// Correção do botão "Fazer avaliação"
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

  // --------------------------------------------------------
  // ABRIR A AVALIAÇÃO
  // --------------------------------------------------------
  document.addEventListener("click", (event) => {
    const element = event.target.closest("a, button");

    if (!element) return;

    const text = element.textContent
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const href = element.getAttribute("href");

    const isAssessmentButton =
      text.includes("fazer avaliacao") ||
      text.includes("comecar avaliacao") ||
      text.includes("iniciar avaliacao") ||
      text.includes("fazer minha avaliacao") ||
      text.includes("avaliacao capilar");

    if (isAssessmentButton) {
      event.preventDefault();
      event.stopPropagation();

      window.location.href = "avaliacao.html";
      return;
    }

    // ------------------------------------------------------
    // ROLAGEM SUAVE
    // ------------------------------------------------------
    if (href && href.startsWith("#") && href !== "#") {
      const target = document.querySelector(href);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }
  });

  // --------------------------------------------------------
  // SAIBA MAIS
  // --------------------------------------------------------
  document.querySelectorAll("a, button").forEach((element) => {
    const text = element.textContent
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (text === "saiba mais") {
      element.addEventListener("click", (event) => {
        event.preventDefault();

        document.querySelector("#como-funciona")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    }
  });

  // --------------------------------------------------------
  // HEADER AO ROLAR
  // --------------------------------------------------------
  const topbar = document.querySelector(".topbar");

  function updateHeader() {
    if (!topbar) return;

    topbar.classList.toggle("scrolled", window.scrollY > 18);
  }

  updateHeader();

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });

  // --------------------------------------------------------
  // MENU MOBILE
  // --------------------------------------------------------
  const menuButton =
    document.querySelector(".menu-button") ||
    document.querySelector(".menu-toggle");

  if (menuButton) {
    let mobileMenu = document.querySelector(".mobile-menu");

    if (!mobileMenu) {
      mobileMenu = document.createElement("div");
      mobileMenu.className = "mobile-menu";

      mobileMenu.innerHTML = `
        <a href="#inicio">Início</a>
        <a href="#como-funciona">Como funciona</a>
        <a href="#recursos">Recursos</a>
        <a href="#resultados">Resultados</a>

        <div class="mobile-menu-actions">
          <button type="button" data-login>Entrar</button>
          <button type="button" data-register>Criar conta</button>
        </div>
      `;

      document.body.appendChild(mobileMenu);
    }

    menuButton.addEventListener("click", () => {
      menuButton.classList.toggle("active");
      mobileMenu.classList.toggle("active");
      document.body.classList.toggle("menu-open");
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuButton.classList.remove("active");
        mobileMenu.classList.remove("active");
        document.body.classList.remove("menu-open");
      });
    });
  }

  // --------------------------------------------------------
  // LOGIN E CADASTRO — PLACEHOLDERS
  // --------------------------------------------------------
  document.querySelectorAll("a, button").forEach((element) => {
    const text = element.textContent
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (text === "entrar") {
      element.addEventListener("click", (event) => {
        event.preventDefault();

        showToast(
          "Login",
          "A tela de login será construída em uma próxima etapa."
        );
      });
    }

    if (text === "criar conta") {
      element.addEventListener("click", (event) => {
        event.preventDefault();

        showToast(
          "Criar conta",
          "O cadastro será conectado ao sistema de usuários do HAIRCURA."
        );
      });
    }
  });

  // --------------------------------------------------------
  // ANIMAÇÕES
  // --------------------------------------------------------
  const revealElements = document.querySelectorAll(
    ".section, .feature-card, .step-card, .preview, .hero-copy, .hero-visual"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach((element) => {
      element.classList.add("reveal-ready");
      observer.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("revealed");
    });
  }

  // --------------------------------------------------------
  // SCORE 78%
  // --------------------------------------------------------
  const scoreElements = [...document.querySelectorAll("*")]
    .filter((element) => {
      return (
        element.children.length === 0 &&
        element.textContent.trim() === "78%"
      );
    });

  scoreElements.forEach((scoreElement) => {
    let started = false;

    const animateScore = () => {
      if (started) return;

      started = true;

      const target = 78;
      const duration = 900;
      const startTime = performance.now();

      function frame(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        scoreElement.textContent =
          `${Math.round(target * eased)}%`;

        if (progress < 1) {
          requestAnimationFrame(frame);
        }
      }

      requestAnimationFrame(frame);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            animateScore();
            observer.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(scoreElement);
    } else {
      animateScore();
    }
  });

  // --------------------------------------------------------
  // TOAST
  // --------------------------------------------------------
  function showToast(title, message) {
    document.querySelector(".haircura-toast")?.remove();

    const toast = document.createElement("div");
    toast.className = "haircura-toast";

    toast.innerHTML = `
      <div class="haircura-toast-icon">✦</div>

      <div class="haircura-toast-content">
        <strong>${title}</strong>
        <span>${message}</span>
      </div>

      <button type="button" aria-label="Fechar">×</button>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("visible");
    });

    toast.querySelector("button")
      ?.addEventListener("click", () => {
        toast.remove();
      });

    setTimeout(() => {
      toast.classList.remove("visible");

      setTimeout(() => {
        toast.remove();
      }, 220);
    }, 3300);
  }

  // --------------------------------------------------------
  // CSS DINÂMICO
  // --------------------------------------------------------
  const style = document.createElement("style");

  style.textContent = `
    .reveal-ready {
      opacity: 0;
      transform: translateY(18px);
      transition:
        opacity .6s ease,
        transform .6s ease;
    }

    .reveal-ready.revealed {
      opacity: 1;
      transform: translateY(0);
    }

    .topbar.scrolled {
      box-shadow: 0 14px 40px rgba(0,0,0,.28);
    }

    .mobile-menu {
      position: fixed;
      top: 82px;
      left: 12px;
      right: 12px;
      z-index: 9998;

      padding: 14px;

      display: grid;
      gap: 8px;

      border: 1px solid rgba(255,255,255,.09);
      border-radius: 20px;

      background: rgba(8,9,16,.97);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);

      box-shadow: 0 22px 60px rgba(0,0,0,.42);

      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);

      transition:
        opacity .22s ease,
        transform .22s ease,
        visibility .22s ease;
    }

    .mobile-menu.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .mobile-menu > a {
      padding: 13px 14px;
      border-radius: 13px;
      color: #bcb7c8;
      text-decoration: none;
      font-weight: 700;
    }

    .mobile-menu-actions {
      padding-top: 10px;

      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;

      border-top: 1px solid rgba(255,255,255,.06);
    }

    .mobile-menu-actions button {
      min-height: 44px;
      border-radius: 13px;
      font-weight: 800;
      cursor: pointer;
    }

    .mobile-menu-actions button:first-child {
      border: 1px solid rgba(255,255,255,.09);
      background: rgba(255,255,255,.04);
      color: white;
    }

    .mobile-menu-actions button:last-child {
      border: 0;
      background: linear-gradient(135deg, #8b5cf6, #ff4fb8);
      color: white;
    }

    .haircura-toast {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 9999;

      width: min(390px, calc(100vw - 28px));
      padding: 14px;

      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 12px;

      border: 1px solid rgba(139,92,246,.27);
      border-radius: 18px;

      background: rgba(24,13,34,.96);
      box-shadow: 0 22px 60px rgba(0,0,0,.4);

      opacity: 0;
      transform: translateY(16px);

      transition:
        opacity .22s ease,
        transform .22s ease;
    }

    .haircura-toast.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .haircura-toast-icon {
      width: 42px;
      height: 42px;

      display: grid;
      place-items: center;

      border-radius: 13px;

      background: linear-gradient(135deg, #8b5cf6, #ff4fb8);
      color: white;
    }

    .haircura-toast-content {
      min-width: 0;

      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .haircura-toast-content strong {
      color: white;
      font-size: .86rem;
    }

    .haircura-toast-content span {
      color: #a59ead;
      font-size: .76rem;
      line-height: 1.35;
    }

    .haircura-toast > button {
      width: 34px;
      height: 34px;

      border: 0;
      border-radius: 10px;

      background: rgba(255,255,255,.05);
      color: #9c94a5;

      cursor: pointer;
    }

    @media (min-width: 761px) {
      .mobile-menu {
        display: none;
      }
    }

    @media (max-width: 760px) {
      body.menu-open {
        overflow: hidden;
      }

      .haircura-toast {
        left: 14px;
        right: 14px;
        bottom: 14px;
        width: auto;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .reveal-ready {
        opacity: 1;
        transform: none;
        transition: none;
      }
    }
  `;

  document.head.appendChild(style);
});
