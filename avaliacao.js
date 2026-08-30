// ==========================================================
// HAIRCURA — avaliacao.js
// Lógica da Avaliação Capilar Inteligente
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  const totalSteps = 10;

  let currentStep = 1;

  const answers = {
    tipo: null,
    curvatura: null,
    espessura: null,
    porosidade: null,
    lavagem: null,
    quimica: [],
    calor: null,
    estadoAtual: [],
    objetivo: null,
    rotina: null
  };

  const stepKeys = {
    1: "tipo",
    2: "curvatura",
    3: "espessura",
    4: "porosidade",
    5: "lavagem",
    6: "quimica",
    7: "calor",
    8: "estadoAtual",
    9: "objetivo",
    10: "rotina"
  };

  const multiSteps = [6, 8];

  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const backButton = document.getElementById("backButton");
  const nextButton = document.getElementById("nextButton");
  const closeAssessment = document.getElementById("closeAssessment");

  // ----------------------------------------------------------
  // INICIALIZAÇÃO
  // ----------------------------------------------------------

  restoreSavedAnswers();
  showStep(currentStep);

  // ----------------------------------------------------------
  // CLIQUES NAS RESPOSTAS
  // ----------------------------------------------------------

  document.querySelectorAll(".question-step").forEach((stepElement) => {
    const stepNumber = Number(stepElement.dataset.step);

    stepElement
      .querySelectorAll(".answer-card, .answer-row, .answer-chip")
      .forEach((button) => {
        button.addEventListener("click", () => {
          if (multiSteps.includes(stepNumber)) {
            handleMultiSelect(stepNumber, button);
          } else {
            handleSingleSelect(stepNumber, button);
          }

          saveAnswers();
          updateNextButton();
        });
      });
  });

  // ----------------------------------------------------------
  // SELEÇÃO ÚNICA
  // ----------------------------------------------------------

  function handleSingleSelect(stepNumber, button) {
    const stepElement = getStepElement(stepNumber);
    const key = stepKeys[stepNumber];

    stepElement
      .querySelectorAll(".answer-card, .answer-row, .answer-chip")
      .forEach((item) => item.classList.remove("selected"));

    button.classList.add("selected");

    answers[key] = button.dataset.value;
  }

  // ----------------------------------------------------------
  // SELEÇÃO MÚLTIPLA
  // ----------------------------------------------------------

  function handleMultiSelect(stepNumber, button) {
    const key = stepKeys[stepNumber];
    const value = button.dataset.value;

    if (!Array.isArray(answers[key])) {
      answers[key] = [];
    }

    // Passo 6: "Nenhuma química" exclui todas as outras.
    if (stepNumber === 6 && value === "nenhuma") {
      getStepElement(stepNumber)
        .querySelectorAll(".multi")
        .forEach((item) => item.classList.remove("selected"));

      button.classList.add("selected");
      answers[key] = ["nenhuma"];
      return;
    }

    // Se selecionar qualquer química, remove "nenhuma".
    if (stepNumber === 6 && value !== "nenhuma") {
      const noneButton = getStepElement(stepNumber)
        .querySelector('[data-value="nenhuma"]');

      if (noneButton) {
        noneButton.classList.remove("selected");
      }

      answers[key] = answers[key].filter((item) => item !== "nenhuma");
    }

    // Passo 8: "Parece saudável" exclui os sinais de dano.
    if (stepNumber === 8 && value === "saudavel") {
      getStepElement(stepNumber)
        .querySelectorAll(".multi")
        .forEach((item) => item.classList.remove("selected"));

      button.classList.add("selected");
      answers[key] = ["saudavel"];
      return;
    }

    // Se selecionar algum sinal, remove "saudável".
    if (stepNumber === 8 && value !== "saudavel") {
      const healthyButton = getStepElement(stepNumber)
        .querySelector('[data-value="saudavel"]');

      if (healthyButton) {
        healthyButton.classList.remove("selected");
      }

      answers[key] = answers[key].filter((item) => item !== "saudavel");
    }

    button.classList.toggle("selected");

    if (button.classList.contains("selected")) {
      if (!answers[key].includes(value)) {
        answers[key].push(value);
      }
    } else {
      answers[key] = answers[key].filter((item) => item !== value);
    }
  }

  // ----------------------------------------------------------
  // BOTÃO CONTINUAR
  // ----------------------------------------------------------

  nextButton.addEventListener("click", () => {
    if (!isCurrentStepAnswered()) {
      return;
    }

    if (currentStep < totalSteps) {
      currentStep += 1;
      showStep(currentStep);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      return;
    }

    finishAssessment();
  });

  // ----------------------------------------------------------
  // BOTÃO VOLTAR
  // ----------------------------------------------------------

  backButton.addEventListener("click", () => {
    if (currentStep <= 1) return;

    currentStep -= 1;
    showStep(currentStep);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // ----------------------------------------------------------
  // FECHAR AVALIAÇÃO
  // ----------------------------------------------------------

  closeAssessment.addEventListener("click", () => {
    const hasAnswers = Object.values(answers).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return Boolean(value);
    });

    if (!hasAnswers) {
      window.location.href = "index.html";
      return;
    }

    showExitModal();
  });

  // ----------------------------------------------------------
  // MOSTRAR ETAPA
  // ----------------------------------------------------------

  function showStep(stepNumber) {
    document.querySelectorAll(".question-step").forEach((step) => {
      step.classList.remove("active");
    });

    const activeStep = getStepElement(stepNumber);

    if (activeStep) {
      activeStep.classList.add("active");
    }

    restoreSelectedState(stepNumber);
    updateProgress();
    updateButtons();
  }

  function getStepElement(stepNumber) {
    return document.querySelector(
      `.question-step[data-step="${stepNumber}"]`
    );
  }

  // ----------------------------------------------------------
  // PROGRESSO
  // ----------------------------------------------------------

  function updateProgress() {
    const percent = (currentStep / totalSteps) * 100;

    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${currentStep} de ${totalSteps}`;
  }

  // ----------------------------------------------------------
  // BOTÕES
  // ----------------------------------------------------------

  function updateButtons() {
    backButton.disabled = currentStep === 1;

    if (currentStep === totalSteps) {
      nextButton.textContent = "Gerar meu cronograma ✦";
    } else {
      nextButton.textContent = "Continuar →";
    }

    updateNextButton();
  }

  function updateNextButton() {
    nextButton.disabled = !isCurrentStepAnswered();
  }

  function isCurrentStepAnswered() {
    const key = stepKeys[currentStep];
    const value = answers[key];

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return Boolean(value);
  }

  // ----------------------------------------------------------
  // RESTAURAR MARCAÇÕES VISUAIS
  // ----------------------------------------------------------

  function restoreSelectedState(stepNumber) {
    const stepElement = getStepElement(stepNumber);
    const key = stepKeys[stepNumber];
    const savedValue = answers[key];

    if (!stepElement) return;

    stepElement
      .querySelectorAll(".answer-card, .answer-row, .answer-chip")
      .forEach((button) => {
        button.classList.remove("selected");

        const buttonValue = button.dataset.value;

        if (Array.isArray(savedValue)) {
          if (savedValue.includes(buttonValue)) {
            button.classList.add("selected");
          }
        } else if (savedValue === buttonValue) {
          button.classList.add("selected");
        }
      });
  }

  // ----------------------------------------------------------
  // SALVAMENTO LOCAL
  // ----------------------------------------------------------

  function saveAnswers() {
    try {
      localStorage.setItem(
        "haircuraAssessment",
        JSON.stringify(answers)
      );
    } catch (error) {
      console.warn("Não foi possível salvar a avaliação.", error);
    }
  }

  function restoreSavedAnswers() {
    try {
      const saved = localStorage.getItem("haircuraAssessment");

      if (!saved) return;

      const parsed = JSON.parse(saved);

      Object.keys(answers).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) {
          answers[key] = parsed[key];
        }
      });
    } catch (error) {
      console.warn("Não foi possível restaurar a avaliação.", error);
    }
  }

  // ----------------------------------------------------------
  // FINALIZAÇÃO
  // ----------------------------------------------------------

  function finishAssessment() {
    saveAnswers();

    const profile = calculateHairProfile(answers);

    try {
      localStorage.setItem(
        "haircuraProfile",
        JSON.stringify(profile)
      );
    } catch (error) {
      console.warn("Não foi possível salvar o perfil.", error);
    }

    showAnalysisScreen(profile);
  }

  // ----------------------------------------------------------
  // MOTOR INICIAL DE ANÁLISE
  // ----------------------------------------------------------

  function calculateHairProfile(data) {
    let hidratacao = 0;
    let nutricao = 0;
    let reconstrucao = 0;

    // Estado atual
    if (data.estadoAtual.includes("ressecado")) hidratacao += 4;
    if (data.estadoAtual.includes("opaco")) hidratacao += 2;
    if (data.estadoAtual.includes("sem-definicao")) hidratacao += 1;

    if (data.estadoAtual.includes("frizz")) nutricao += 3;
    if (data.estadoAtual.includes("embaraçando")) nutricao += 2;
    if (data.estadoAtual.includes("poroso")) nutricao += 2;

    if (data.estadoAtual.includes("quebradico")) reconstrucao += 4;
    if (data.estadoAtual.includes("poroso")) reconstrucao += 2;

    // Porosidade
    if (data.porosidade === "alta") {
      hidratacao += 2;
      nutricao += 2;
      reconstrucao += 2;
    }

    if (data.porosidade === "baixa") {
      hidratacao += 1;
    }

    // Química
    if (data.quimica.includes("descoloracao")) {
      reconstrucao += 4;
      hidratacao += 2;
    }

    if (data.quimica.includes("alisamento")) {
      reconstrucao += 3;
      nutricao += 2;
    }

    if (data.quimica.includes("tintura")) {
      reconstrucao += 2;
      hidratacao += 1;
    }

    // Calor
    if (data.calor === "frequente") {
      hidratacao += 2;
      nutricao += 2;
      reconstrucao += 2;
    }

    if (data.calor === "as-vezes") {
      hidratacao += 1;
      nutricao += 1;
    }

    // Objetivo
    if (data.objetivo === "recuperacao") reconstrucao += 2;
    if (data.objetivo === "maciez-brilho") hidratacao += 2;
    if (data.objetivo === "definicao") nutricao += 2;
    if (data.objetivo === "frizz") nutricao += 2;

    // Normalização para score visual
    const maxScore = Math.max(
      hidratacao,
      nutricao,
      reconstrucao,
      1
    );

    const scores = {
      hidratacao: Math.round((hidratacao / maxScore) * 100),
      nutricao: Math.round((nutricao / maxScore) * 100),
      reconstrucao: Math.round((reconstrucao / maxScore) * 100)
    };

    const priority = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    const frequency = getCareFrequency(data.lavagem);

    return {
      createdAt: new Date().toISOString(),
      answers: data,
      rawScores: {
        hidratacao,
        nutricao,
        reconstrucao
      },
      scores,
      priority,
      weeklyCareFrequency: frequency,
      recommendation: createRecommendation(
        priority,
        scores,
        frequency
      )
    };
  }

  function getCareFrequency(washFrequency) {
    if (washFrequency === "1-2") return 2;
    if (washFrequency === "3-4") return 3;
    if (washFrequency === "5+") return 3;

    return 3;
  }

  function createRecommendation(priority, scores, frequency) {
    const labels = {
      hidratacao: "Hidratação",
      nutricao: "Nutrição",
      reconstrucao: "Reconstrução"
    };

    return {
      principal: labels[priority[0]],
      secundaria: labels[priority[1]],
      terceira: labels[priority[2]],
      frequency,
      summary:
        `Seu cabelo demonstra maior necessidade de ${labels[
          priority[0]
        ].toLowerCase()}, seguida de ${labels[
          priority[1]
        ].toLowerCase()}.`
    };
  }

  // ----------------------------------------------------------
  // TELA DE ANÁLISE
  // ----------------------------------------------------------

  function showAnalysisScreen(profile) {
    const shell = document.querySelector(".assessment-shell");

    shell.innerHTML = `
      <section class="analysis-screen">
        <div class="analysis-orb">
          <span class="analysis-symbol">✦</span>
        </div>

        <span class="analysis-label">HAIRCURA INTELLIGENCE</span>

        <h1>Analisando seu perfil capilar...</h1>

        <p id="analysisMessage">
          Cruzando suas respostas e identificando as principais necessidades
          dos seus fios.
        </p>

        <div class="analysis-loader">
          <span></span>
        </div>

        <div class="analysis-steps">
          <div class="analysis-item active">
            <span>✓</span>
            Perfil capilar
          </div>

          <div class="analysis-item" id="analysisNeeds">
            <span>◌</span>
            Necessidades
          </div>

          <div class="analysis-item" id="analysisSchedule">
            <span>◌</span>
            Cronograma
          </div>
        </div>
      </section>
    `;

    injectAnalysisStyles();

    setTimeout(() => {
      const needs = document.getElementById("analysisNeeds");

      if (needs) {
        needs.classList.add("active");
        needs.querySelector("span").textContent = "✓";
      }

      const message = document.getElementById("analysisMessage");

      if (message) {
        message.textContent =
          "Identificamos as prioridades do seu cabelo. Agora estamos organizando sua rotina.";
      }
    }, 1100);

    setTimeout(() => {
      const schedule = document.getElementById("analysisSchedule");

      if (schedule) {
        schedule.classList.add("active");
        schedule.querySelector("span").textContent = "✓";
      }
    }, 2100);

    setTimeout(() => {
      showResultPreview(profile);
    }, 3000);
  }

  // ----------------------------------------------------------
  // RESULTADO PRELIMINAR
  // ----------------------------------------------------------

  function showResultPreview(profile) {
    const shell = document.querySelector(".assessment-shell");

    const topPriority = profile.priority[0];

    const icons = {
      hidratacao: "💧",
      nutricao: "◉",
      reconstrucao: "✦"
    };

    const labels = {
      hidratacao: "Hidratação",
      nutricao: "Nutrição",
      reconstrucao: "Reconstrução"
    };

    shell.innerHTML = `
      <section class="result-preview">
        <div class="result-badge">
          <span>✓</span>
          Avaliação concluída
        </div>

        <h1>Seu perfil capilar está pronto.</h1>

        <p>
          ${profile.recommendation.summary}
        </p>

        <div class="result-priority-card">
          <span class="result-priority-label">MAIOR PRIORIDADE</span>

          <div class="result-priority-icon">
            ${icons[topPriority]}
          </div>

          <h2>${labels[topPriority]}</h2>

          <strong>
            ${profile.scores[topPriority]}%
          </strong>

          <span class="result-score-caption">
            necessidade relativa no seu perfil
          </span>
        </div>

        <div class="result-score-grid">
          ${renderScoreCard(
            "💧",
            "Hidratação",
            profile.scores.hidratacao
          )}

          ${renderScoreCard(
            "◉",
            "Nutrição",
            profile.scores.nutricao
          )}

          ${renderScoreCard(
            "✦",
            "Reconstrução",
            profile.scores.reconstrucao
          )}
        </div>

        <button class="result-button" id="createScheduleButton" type="button">
          Criar meu cronograma →
        </button>

        <button class="restart-assessment" id="restartAssessment" type="button">
          Refazer avaliação
        </button>
      </section>
    `;

    injectResultStyles();

    const createScheduleButton = document.getElementById(
      "createScheduleButton"
    );

    createScheduleButton.addEventListener("click", () => {
      // A próxima etapa do projeto será cronograma.html.
      showTemporaryMessage(
        "Cronograma personalizado",
        "A próxima tela que vamos construir será o seu cronograma automático."
      );
    });

    const restartAssessment = document.getElementById(
      "restartAssessment"
    );

    restartAssessment.addEventListener("click", () => {
      localStorage.removeItem("haircuraAssessment");
      localStorage.removeItem("haircuraProfile");
      window.location.reload();
    });
  }

  function renderScoreCard(icon, label, score) {
    return `
      <div class="result-score-card">
        <span>${icon}</span>
        <strong>${score}%</strong>
        <small>${label}</small>
      </div>
    `;
  }

  // ----------------------------------------------------------
  // MODAL PARA SAIR
  // ----------------------------------------------------------

  function showExitModal() {
    const existing = document.querySelector(".assessment-modal");

    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.className = "assessment-modal";

    modal.innerHTML = `
      <div class="assessment-modal-card">
        <div class="modal-icon">✦</div>

        <h3>Sair da avaliação?</h3>

        <p>
          Suas respostas já foram salvas neste dispositivo e você poderá
          continuar depois.
        </p>

        <div class="modal-actions">
          <button type="button" class="modal-cancel">
            Continuar avaliação
          </button>

          <button type="button" class="modal-exit">
            Sair
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      modal.classList.add("visible");
    });

    modal
      .querySelector(".modal-cancel")
      .addEventListener("click", () => {
        modal.classList.remove("visible");

        setTimeout(() => {
          modal.remove();
        }, 220);
      });

    modal
      .querySelector(".modal-exit")
      .addEventListener("click", () => {
        window.location.href = "index.html";
      });
  }

  // ----------------------------------------------------------
  // MENSAGEM TEMPORÁRIA
  // ----------------------------------------------------------

  function showTemporaryMessage(title, message) {
    const old = document.querySelector(".assessment-toast");

    if (old) old.remove();

    const toast = document.createElement("div");
    toast.className = "assessment-toast";

    toast.innerHTML = `
      <div class="assessment-toast-icon">✦</div>

      <div>
        <strong>${title}</strong>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("visible");
    });

    setTimeout(() => {
      toast.classList.remove("visible");

      setTimeout(() => {
        toast.remove();
      }, 250);
    }, 3800);
  }

  // ----------------------------------------------------------
  // ESTILOS DAS TELAS DINÂMICAS
  // ----------------------------------------------------------

  function injectAnalysisStyles() {
    if (document.getElementById("analysisStyles")) return;

    const style = document.createElement("style");
    style.id = "analysisStyles";

    style.textContent = `
      .analysis-screen {
        min-height: 590px;
        padding: 70px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .analysis-orb {
        width: 118px;
        height: 118px;
        display: grid;
        place-items: center;
        position: relative;
        margin-bottom: 25px;
        border-radius: 50%;
        background:
          radial-gradient(circle at center, #10111a 48%, transparent 50%),
          conic-gradient(#8b5cf6, #ff4fb8, #66ddff, #8b5cf6);
        box-shadow:
          0 0 50px rgba(139,92,246,.2),
          0 20px 55px rgba(0,0,0,.3);
        animation: analysisSpin 3s linear infinite;
      }

      .analysis-orb::after {
        content: "";
        position: absolute;
        inset: 8px;
        border-radius: 50%;
        background: #0c0d15;
      }

      .analysis-symbol {
        position: relative;
        z-index: 2;
        color: white;
        font-size: 2rem;
        animation: analysisSpinReverse 3s linear infinite;
      }

      .analysis-label {
        color: #bba9ff;
        font-size: .68rem;
        font-weight: 800;
        letter-spacing: .12em;
      }

      .analysis-screen h1 {
        max-width: 700px;
        margin-top: 14px;
        font-family: 'Manrope', sans-serif;
        font-size: clamp(2.3rem, 5vw, 4rem);
        line-height: 1;
        letter-spacing: -.055em;
      }

      .analysis-screen > p {
        max-width: 590px;
        margin-top: 18px;
        color: #9691a7;
        line-height: 1.65;
      }

      .analysis-loader {
        width: min(450px, 90%);
        height: 7px;
        margin-top: 30px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255,255,255,.055);
      }

      .analysis-loader span {
        display: block;
        width: 35%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #8b5cf6, #ff4fb8);
        animation: analysisLoad 1.15s ease-in-out infinite alternate;
      }

      .analysis-steps {
        margin-top: 26px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .analysis-item {
        padding: 10px 13px;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border: 1px solid rgba(255,255,255,.06);
        border-radius: 999px;
        background: rgba(255,255,255,.025);
        color: #716d7d;
        font-size: .76rem;
        font-weight: 700;
        transition: .25s ease;
      }

      .analysis-item.active {
        color: #d3c7ff;
        border-color: rgba(139,92,246,.2);
        background: rgba(139,92,246,.08);
      }

      @keyframes analysisSpin {
        to { transform: rotate(360deg); }
      }

      @keyframes analysisSpinReverse {
        to { transform: rotate(-360deg); }
      }

      @keyframes analysisLoad {
        from { transform: translateX(-20%); }
        to { transform: translateX(205%); }
      }
    `;

    document.head.appendChild(style);
  }

  function injectResultStyles() {
    if (document.getElementById("resultStyles")) return;

    const style = document.createElement("style");
    style.id = "resultStyles";

    style.textContent = `
      .result-preview {
        max-width: 820px;
        margin: 0 auto;
        padding: 25px 0 10px;
        text-align: center;
      }

      .result-badge {
        width: fit-content;
        margin: 0 auto;
        padding: 9px 13px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid rgba(89,221,160,.18);
        border-radius: 999px;
        background: rgba(89,221,160,.06);
        color: #74e5b1;
        font-size: .72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .08em;
      }

      .result-preview > h1 {
        margin-top: 18px;
        font-family: 'Manrope', sans-serif;
        font-size: clamp(2.5rem, 5vw, 4.4rem);
        line-height: .98;
        letter-spacing: -.06em;
      }

      .result-preview > p {
        max-width: 650px;
        margin: 18px auto 0;
        color: #9e99ac;
        line-height: 1.65;
      }

      .result-priority-card {
        margin: 32px auto 18px;
        padding: 28px;
        max-width: 420px;
        border: 1px solid rgba(139,92,246,.22);
        border-radius: 24px;
        background:
          radial-gradient(circle at 50% 0%, rgba(255,79,184,.12), transparent 35%),
          linear-gradient(180deg, rgba(139,92,246,.12), rgba(255,255,255,.025));
        box-shadow: 0 20px 50px rgba(0,0,0,.25);
      }

      .result-priority-label {
        color: #9b8dbd;
        font-size: .66rem;
        font-weight: 800;
        letter-spacing: .12em;
      }

      .result-priority-icon {
        width: 72px;
        height: 72px;
        margin: 17px auto 12px;
        display: grid;
        place-items: center;
        border-radius: 21px;
        background: rgba(139,92,246,.1);
        font-size: 2rem;
      }

      .result-priority-card h2 {
        font-family: 'Manrope', sans-serif;
        font-size: 1.55rem;
      }

      .result-priority-card > strong {
        display: block;
        margin-top: 8px;
        font-size: 2.45rem;
        background: linear-gradient(135deg, #bba2ff, #ff5dbd);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .result-score-caption {
        color: #747082;
        font-size: .75rem;
      }

      .result-score-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-top: 18px;
      }

      .result-score-card {
        min-height: 125px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border: 1px solid rgba(255,255,255,.065);
        border-radius: 18px;
        background: rgba(255,255,255,.025);
      }

      .result-score-card > span {
        font-size: 1.3rem;
      }

      .result-score-card strong {
        font-size: 1.45rem;
      }

      .result-score-card small {
        color: #7c7789;
      }

      .result-button {
        width: min(420px, 100%);
        min-height: 54px;
        margin-top: 26px;
        border: 0;
        border-radius: 16px;
        background: linear-gradient(135deg, #8b5cf6, #ff4fb8);
        color: white;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 14px 32px rgba(139,92,246,.23);
      }

      .restart-assessment {
        display: block;
        margin: 14px auto 0;
        border: 0;
        background: transparent;
        color: #777284;
        font-size: .8rem;
        cursor: pointer;
      }

      @media (max-width: 640px) {
        .result-score-grid {
          grid-template-columns: 1fr;
        }

        .result-score-card {
          min-height: 95px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ----------------------------------------------------------
  // ESTILOS GERAIS DINÂMICOS
  // ----------------------------------------------------------

  const dynamicStyles = document.createElement("style");

  dynamicStyles.textContent = `
    .assessment-modal {
      position: fixed;
      inset: 0;
      z-index: 9999;
      padding: 20px;
      display: grid;
      place-items: center;
      background: rgba(4,5,9,.72);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      opacity: 0;
      pointer-events: none;
      transition: opacity .22s ease;
    }

    .assessment-modal.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .assessment-modal-card {
      width: min(430px, 100%);
      padding: 27px;
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 24px;
      background:
        radial-gradient(circle at 100% 0%, rgba(255,79,184,.08), transparent 28%),
        #0c0e17;
      box-shadow: 0 30px 80px rgba(0,0,0,.45);
      text-align: center;
      transform: translateY(15px) scale(.98);
      transition: transform .22s ease;
    }

    .assessment-modal.visible .assessment-modal-card {
      transform: translateY(0) scale(1);
    }

    .modal-icon {
      width: 54px;
      height: 54px;
      margin: 0 auto 15px;
      display: grid;
      place-items: center;
      border-radius: 17px;
      background: linear-gradient(135deg, #8b5cf6, #ff4fb8);
      box-shadow: 0 0 28px rgba(139,92,246,.2);
    }

    .assessment-modal-card h3 {
      font-family: 'Manrope', sans-serif;
      font-size: 1.35rem;
    }

    .assessment-modal-card p {
      margin-top: 10px;
      color: #918c9e;
      font-size: .86rem;
      line-height: 1.55;
    }

    .modal-actions {
      margin-top: 22px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .modal-actions button {
      min-height: 47px;
      border-radius: 14px;
      font-weight: 800;
      cursor: pointer;
    }

    .modal-cancel {
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(255,255,255,.04);
      color: #c2bdcc;
    }

    .modal-exit {
      border: 0;
      background: linear-gradient(135deg, #8b5cf6, #ff4fb8);
      color: white;
    }

    .assessment-toast {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 9999;
      width: min(390px, calc(100vw - 30px));
      padding: 15px;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 12px;
      align-items: center;
      border: 1px solid rgba(139,92,246,.2);
      border-radius: 18px;
      background: rgba(11,12,20,.96);
      box-shadow: 0 24px 60px rgba(0,0,0,.44);
      opacity: 0;
      transform: translateY(18px);
      transition: .25s ease;
    }

    .assessment-toast.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .assessment-toast-icon {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 13px;
      background: linear-gradient(135deg, #8b5cf6, #ff4fb8);
    }

    .assessment-toast > div:last-child {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .assessment-toast strong {
      font-size: .88rem;
    }

    .assessment-toast span {
      color: #8f899d;
      font-size: .77rem;
      line-height: 1.4;
    }

    @media (max-width: 520px) {
      .modal-actions {
        grid-template-columns: 1fr;
      }

      .assessment-toast {
        left: 15px;
        right: 15px;
        bottom: 15px;
        width: auto;
      }
    }
  `;

  document.head.appendChild(dynamicStyles);
});
