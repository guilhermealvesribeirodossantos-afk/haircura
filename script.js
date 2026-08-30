// ==========================================================
// HAIRCURA — script.js
// Interações da Landing Page
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-button");
  const topbar = document.querySelector(".topbar");
  const nav = document.querySelector(".desktop-nav");
  const topActions = document.querySelector(".top-actions");

  // ----------------------------------------------------------
  // MENU MOBILE
  // ----------------------------------------------------------

  if (menuButton && topbar && nav && topActions) {
    const mobileMenu = document.createElement("div");
    mobileMenu.className = "mobile-menu";

    mobileMenu.innerHTML = `
      <nav class="mobile-nav" aria-label="Navegação mobile">
        <a href="#inicio">Início</a>
        <a href="#como-funciona">Como funciona</a>
        <a href="#recursos">Recursos</a>
        <a href="#resultados">Resultados</a>
      </nav>

      <div class="mobile-actions">
        <button class="btn btn-ghost mobile-login" type="button">
          Entrar
        </button>

        <button class="btn btn-primary mobile-create-account" type="button">
          Criar conta
        </button>
      </div>
    `;

    topbar.appendChild(mobileMenu);

    const closeMenu = () => {
      topbar.classList.remove("menu-open");
      menuButton.textContent = "☰";
      menuButton.setAttribute("aria-label", "Abrir menu");
    };

    const openMenu = () => {
      topbar.classList.add("menu-open");
      menuButton.textContent = "×";
      menuButton.setAttribute("aria-label", "Fechar menu");
    };

    menuButton.addEventListener("click", () => {
      if (topbar.classList.contains("menu-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileMenu.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) {
        closeMenu();
      }
    });
  }

  // ----------------------------------------------------------
  // SCROLL SUAVE PARA LINKS INTERNOS
  // ----------------------------------------------------------

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");

      if (!id || id === "#") return;

      const target = document.querySelector(id);

      if (!target) return;

      event.preventDefault();

      const headerOffset = 105;
      const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    });
  });

  // ----------------------------------------------------------
  // HEADER AO ROLAR
  // ----------------------------------------------------------

  const updateHeader = () => {
    if (!topbar) return;

    if (window.scrollY > 35) {
      topbar.classList.add("topbar-scrolled");
    } else {
      topbar.classList.remove("topbar-scrolled");
    }
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // ----------------------------------------------------------
  // ANIMAÇÃO DOS ELEMENTOS AO ENTRAR NA TELA
  // ----------------------------------------------------------

  const revealElements = document.querySelectorAll(
    ".section-heading, .step-card, .feature-card, .preview-copy, .phone-preview, .final-cta"
  );

  revealElements.forEach((element) => {
    element.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px",
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) =>
      element.classList.add("reveal-visible")
    );
  }

  // ----------------------------------------------------------
  // EFEITO 3D SUAVE NO CARD DO HERO
  // ----------------------------------------------------------

  const heroVisual = document.querySelector(".hero-visual");
  const heroCard = document.querySelector(".hero-card");

  if (
    heroVisual &&
    heroCard &&
    window.matchMedia("(pointer: fine)").matches
  ) {
    heroVisual.addEventListener("mousemove", (event) => {
      const rect = heroVisual.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 5;
      const rotateX = ((centerY - y) / centerY) * 5;

      heroCard.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroVisual.addEventListener("mouseleave", () => {
      heroCard.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg)";
    });
  }

  // ----------------------------------------------------------
  // CONTADOR ANIMADO DO SCORE CAPILAR
  // ----------------------------------------------------------

  const score = document.querySelector(".score-ring strong");

  if (score) {
    const finalScore = 78;
    let currentScore = 0;

    const animateScore = () => {
      currentScore += 1;
      score.textContent = `${currentScore}%`;

      if (currentScore < finalScore) {
        requestAnimationFrame(animateScore);
      }
    };

    setTimeout(animateScore, 500);
  }

  // ----------------------------------------------------------
  // BOTÕES PRINCIPAIS
  // Por enquanto levam para a futura Avaliação Capilar.
  // Na próxima etapa criaremos essa página de verdade.
  // ----------------------------------------------------------

  const evaluationButtons = [
    ...document.querySelectorAll(".hero .btn-primary"),
    ...document.querySelectorAll(".final-cta .btn-primary"),
  ];

  evaluationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showToast(
        "Avaliação Capilar",
        "Essa será a próxima tela que vamos construir."
      );
    });
  });

  // ----------------------------------------------------------
  // LOGIN E CADASTRO
  // ----------------------------------------------------------

  const loginButtons = document.querySelectorAll(
    ".top-actions .btn-ghost, .mobile-login"
  );

  const createAccountButtons = document.querySelectorAll(
    ".top-actions .btn-primary, .mobile-create-account"
  );

  loginButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showToast(
        "Login",
        "A tela de login será adicionada nas próximas etapas."
      );
    });
  });

  createAccountButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showToast(
        "Criar conta",
        "O cadastro dos usuários será conectado ao HAIRCURA."
      );
    });
  });

  // ----------------------------------------------------------
  // ROTINA COMPLETA NA PRÉVIA DO CELULAR
  // ----------------------------------------------------------

  const routineButton = document.querySelector(".today-card button");

  if (routineButton) {
    routineButton.addEventListener("click", () => {
      showToast(
        "Rotina de Hidratação",
        "Em breve essa área terá o passo a passo completo do tratamento."
      );
    });
  }

  // ----------------------------------------------------------
  // TOAST / AVISO BONITO
  // ----------------------------------------------------------

  function showToast(title, message) {
    const oldToast = document.querySelector(".haircura-toast");

    if (oldToast) {
      oldToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "haircura-toast";

    toast.innerHTML = `
      <div class="toast-icon">✦</div>

      <div class="toast-content">
        <strong>${title}</strong>
        <span>${message}</span>
      </div>

      <button class="toast-close" type="button" aria-label="Fechar">
        ×
      </button>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("toast-visible");
    });

    const removeToast = () => {
      toast.classList.remove("toast-visible");

      setTimeout(() => {
        toast.remove();
      }, 260);
    };

    toast
      .querySelector(".toast-close")
      .addEventListener("click", removeToast);

    setTimeout(removeToast, 4300);
  }
});

// ==========================================================
// CSS DAS INTERAÇÕES
// Adicionado via JavaScript para não precisar alterar o
// style.css que você já colocou no GitHub nesta etapa.
// ==========================================================

const interactionStyles = document.createElement("style");

interactionStyles.textContent = `
  .topbar {
    transition:
      background .25s ease,
      border-color .25s ease,
      box-shadow .25s ease;
  }

  .topbar.topbar-scrolled {
    background: rgba(7, 8, 14, .92);
    border-color: rgba(138, 92, 255, .16);
    box-shadow:
      0 16px 42px rgba(0, 0, 0, .35),
      0 0 35px rgba(138, 92, 255, .05);
  }

  .mobile-menu {
    display: none;
  }

  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition:
      opacity .7s ease,
      transform .7s ease;
  }

  .reveal.reveal-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .haircura-toast {
    position: fixed;
    z-index: 9999;
    right: 22px;
    bottom: 22px;
    width: min(390px, calc(100vw - 30px));
    padding: 15px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;

    color: #f8f8ff;
    background:
      linear-gradient(
        135deg,
        rgba(138, 92, 255, .13),
        rgba(255, 79, 184, .08)
      ),
      rgba(11, 12, 20, .94);

    border: 1px solid rgba(138, 92, 255, .22);
    border-radius: 18px;
    box-shadow:
      0 24px 60px rgba(0, 0, 0, .45),
      0 0 30px rgba(138, 92, 255, .10);

    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);

    opacity: 0;
    transform: translateY(20px) scale(.98);
    pointer-events: none;

    transition:
      opacity .25s ease,
      transform .25s ease;
  }

  .haircura-toast.toast-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  .toast-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    color: white;
    background: linear-gradient(135deg, #8a5cff, #ff4fb8);
    box-shadow: 0 0 24px rgba(138, 92, 255, .25);
  }

  .toast-content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .toast-content strong {
    font-size: .9rem;
  }

  .toast-content span {
    color: #9e9caf;
    font-size: .78rem;
    line-height: 1.45;
  }

  .toast-close {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 10px;
    background: rgba(255, 255, 255, .05);
    color: #b7b6c8;
    cursor: pointer;
    font-size: 1.15rem;
  }

  @media (max-width: 980px) {
    .topbar.menu-open {
      border-radius: 20px 20px 0 0;
    }

    .mobile-menu {
      position: absolute;
      top: calc(100% - 1px);
      left: -1px;
      right: -1px;
      padding: 15px;
      border: 1px solid rgba(255, 255, 255, .08);
      border-top: 0;
      border-radius: 0 0 20px 20px;
      background: rgba(8, 9, 16, .97);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      box-shadow: 0 22px 35px rgba(0, 0, 0, .32);
    }

    .topbar.menu-open .mobile-menu {
      display: block;
      animation: haircuraMenu .22s ease both;
    }

    .mobile-nav {
      display: grid;
    }

    .mobile-nav a {
      padding: 14px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, .055);
      color: #b7b6c8;
      font-size: .9rem;
    }

    .mobile-nav a:hover {
      color: white;
    }

    .mobile-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding-top: 15px;
    }

    @keyframes haircuraMenu {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  @media (max-width: 540px) {
    .mobile-actions {
      grid-template-columns: 1fr;
    }

    .haircura-toast {
      left: 15px;
      right: 15px;
      bottom: 15px;
      width: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal {
      opacity: 1;
      transform: none;
    }
  }
`;

document.head.appendChild(interactionStyles);
