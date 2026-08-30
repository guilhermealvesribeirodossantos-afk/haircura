// ==========================================================
// HAIRCURA — script.js
// Página inicial
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------------------------------------
  // 1. BOTÕES "FAZER AVALIAÇÃO"
  // --------------------------------------------------------
  const assessmentButtons = [
    ...document.querySelectorAll('a[href="#avaliacao"]'),
    ...document.querySelectorAll('[data-action="avaliacao"]'),
    ...document.querySelectorAll(".btn-primary")
  ];

  assessmentButtons.forEach((button) => {
    const text = button.textContent.trim().toLowerCase();

    if (
      text.includes("fazer avaliação") ||
      text.includes("começar avaliação") ||
      text.includes("iniciar avaliação")
    ) {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = "avaliacao.html";
      });
    }
  });

  // --------------------------------------------------------
  // 2. LINKS COM ROLAGEM SUAVE
  // --------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  // --------------------------------------------------------
  // 3. CABEÇALHO AO ROLAR
  // --------------------------------------------------------
  const topbar = document.querySelector(".topbar");

  function updateHeader() {
    if (!topbar) return;

    if (window.scrollY > 18) {
      topbar.classList.add("scrolled");
    } else {
      topbar.classList.remove("scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // --------------------------------------------------------
  // 4. MENU MOBILE
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
          <button type="button" data-mobile-action="login">Entrar</button>
          <button type="button" data-mobile-action="register">Criar conta</button>
        </div>
      `;

      document.body.appendChild(mobileMenu);
    }

    menuButton.addEventListener("click", () => {
      menuButton.classList.toggle("active");
      mobileMenu.classList.toggle("active");
      document.body.classList.toggle("menu-open");
    });

    mobileMenu.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => {
        menuButton.classList.remove("active");
        mobileMenu.classList.remove("active");
        document.body.classList.remove("menu-open");
      });
    });
  }

  // --------------------------------------------------------
  // 5. ANIMAÇÕES DE ENTRADA
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
      {
        threshold: 0.12
      }
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
  // 6. EFEITO 3D NO CARD DO HERO (DESKTOP)
  // --------------------------------------------------------
  const heroCard =
    document.querySelector(".hero-card") ||
    document.querySelector(".haircura-card");

  const finePointer = window.matchMedia("(pointer: fine)");

  if (heroCard && finePointer.matches) {
    heroCard.addEventListener("mousemove", (event) => {
      const rect = heroCard.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -3.5;
      const rotateY = ((x - centerX) / centerX) * 4.5;

      heroCard.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroCard.addEventListener("mouseleave", () => {
      heroCard.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg)";
    });
  }

  // --------------------------------------------------------
  // 7. ANIMAÇÃO DO SCORE 78%
  // --------------------------------------------------------
  const scoreElements = [...document.querySelectorAll("*")].filter((element) => {
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
        const value = Math.round(target * eased);

        scoreElement.textContent = `${value}%`;

        if (progress < 1) {
          requestAnimationFrame(frame);
        }
      }

      requestAnimationFrame(frame);
    };

    if ("IntersectionObserver" in window) {
      const scoreObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            animateScore();
            scoreObserver.disconnect();
          }
        },
        { threshold: 0.5 }
      );

      scoreObserver.observe(scoreElement);
    } else {
      animateScore();
    }
  });

  // --------------------------------------------------------
  // 8. BOTÕES QUE AINDA SERÃO CONSTRUÍDOS
  // --------------------------------------------------------
  const loginButtons = [
    ...document.querySelectorAll('[data-action="login"]'),
    ...document.querySelectorAll('[data-mobile-action="login"]')
  ];

  const registerButtons = [
    ...document.querySelectorAll('[data-action="register"]'),
    ...document.querySelectorAll('[data-mobile-action="register"]')
  ];

  document.querySelectorAll("button, a").forEach((element) => {
    const text = element.textContent.trim().toLowerCase();

    if (text === "entrar" && !loginButtons.includes(element)) {
      loginButtons.push(element);
    }

    if (text === "criar conta" && !registerButtons.includes(element)) {
      registerButtons.push(element);
    }
  });

  loginButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(
        "Login",
        "A tela de login será construída em uma próxima etapa."
      );
    });
  });

  registerButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(
        "Criar conta",
        "O cadastro será conectado ao sistema de usuários do HAIRCURA."
      );
    });
  });

  // --------------------------------------------------------
  // 9. TOAST
  // --------------------------------------------------------
  function showToast(title, message) {
    const previousToast = document.querySelector(".haircura-toast");

    if (previousToast) {
      previousToast.remove();
    }

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

    const closeButton = toast.querySelector("button");

    closeButton.addEventListener("click", () => {
      closeToast(toast);
    });

    setTimeout(() => {
      closeToast(toast);
    }, 3600);
  }

  function closeToast(toast) {
    if (!toast || !toast.isConnected) return;

    toast.classList.remove("visible");

    setTimeout(() => {
      toast.remove();
    }, 220);
  }

  // --------------------------------------------------------
  // 10. ESTILOS COMPLEMENTARES
  // --------------------------------------------------------
  const dynamicStyle = document.createElement("style");

  dynamicStyle.textContent = `
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
      box-shadow: 0 14px 40px rgba(0, 0, 0, .28);
    }

    .hero-card,
    .haircura-card {
      transition: transform .18s ease;
      transform-style: preserve-3d;
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

    .mobile-menu > a:hover {
      background: rgba(255,255,255,.045);
      color: white;
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

      .hero-card,
      .haircura-card {
        transform: none !important;
      }
    }
  `;

  document.head.appendChild(dynamicStyle);
});
