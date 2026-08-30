// ==========================================================
// HAIRCURA — avaliacao.js V2
// Foto + questionário + testes guiados
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

  const photoInput = document.getElementById("hairPhotoInput");
  const selectPhotoButton = document.getElementById("selectPhotoButton");
  const changePhotoButton = document.getElementById("changePhotoButton");
  const removePhotoButton = document.getElementById("removePhotoButton");
  const analyzePhotoButton = document.getElementById("analyzePhotoButton");
  const skipPhotoButton = document.getElementById("skipPhotoButton");
  const photoEmptyState = document.getElementById("photoEmptyState");
  const photoPreviewState = document.getElementById("photoPreviewState");
  const hairPhotoPreview = document.getElementById("hairPhotoPreview");
  const photoAnalysisResult = document.getElementById("photoAnalysisResult");

  const hairHelpModal = document.getElementById("hairHelpModal");
  const hairHelpTitle = document.getElementById("hairHelpTitle");
  const hairHelpEyebrow = document.getElementById("hairHelpEyebrow");
  const hairHelpDescription = document.getElementById("hairHelpDescription");
  const hairHelpContent = document.getElementById("hairHelpContent");
  const hairHelpResult = document.getElementById("hairHelpResult");
  const hairHelpNext = document.getElementById("hairHelpNext");

  let selectedPhotoFile = null;
  let photoObjectUrl = null;
  let currentHelpType = null;
  let helpStage = 0;
  let helpSelections = {};

  restoreSavedAnswers();
  showStep(currentStep);
  setupPhotoArea();
  setupHelpSystem();
  injectDynamicStyles();

  // ========================================================
  // FOTO
  // ========================================================

  function setupPhotoArea() {
    if (!photoInput) return;

    [selectPhotoButton, changePhotoButton].forEach((button) => {
      if (!button) return;

      button.addEventListener("click", () => {
        photoInput.click();
      });
    });

    photoInput.addEventListener("change", () => {
      const file = photoInput.files && photoInput.files[0];

      if (!file) return;

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!allowedTypes.includes(file.type)) {
        showToast(
          "Formato não suportado",
          "Escolha uma imagem JPG, PNG ou WEBP."
        );

        photoInput.value = "";
        return;
      }

      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        showToast(
          "Imagem muito grande",
          "Escolha uma foto com até 10 MB."
        );

        photoInput.value = "";
        return;
      }

      selectedPhotoFile = file;

      if (photoObjectUrl) {
        URL.revokeObjectURL(photoObjectUrl);
      }

      photoObjectUrl = URL.createObjectURL(file);
      hairPhotoPreview.src = photoObjectUrl;

      photoEmptyState.hidden = true;
      photoPreviewState.hidden = false;
      analyzePhotoButton.disabled = false;

      photoAnalysisResult.hidden = true;

      showToast(
        "Foto adicionada",
        "Agora você pode iniciar a análise visual."
      );
    });

    if (removePhotoButton) {
      removePhotoButton.addEventListener("click", () => {
        clearPhoto();
      });
    }

    if (skipPhotoButton) {
      skipPhotoButton.addEventListener("click", () => {
        scrollToQuestions();
      });
    }

    if (analyzePhotoButton) {
      analyzePhotoButton.addEventListener("click", () => {
        if (!selectedPhotoFile) return;

        runPhotoPreparation();
      });
    }
  }

  function clearPhoto() {
    selectedPhotoFile = null;

    if (photoObjectUrl) {
      URL.revokeObjectURL(photoObjectUrl);
      photoObjectUrl = null;
    }

    photoInput.value = "";
    hairPhotoPreview.removeAttribute("src");

    photoEmptyState.hidden = false;
    photoPreviewState.hidden = true;
    photoAnalysisResult.hidden = true;
    analyzePhotoButton.disabled = true;
  }

  function runPhotoPreparation() {
    analyzePhotoButton.disabled = true;
    analyzePhotoButton.textContent = "✦ Preparando foto...";

    setTimeout(() => {
      document.getElementById("photoHairType").textContent =
        "Confirmar nas perguntas";

      document.getElementById("photoCurlType").textContent =
        "Confirmar nas perguntas";

      document.getElementById("photoThickness").textContent =
        "Teste + análise visual";

      document.getElementById("photoVisualSigns").textContent =
        "Foto pronta";

      document.getElementById("photoConfidence").textContent =
        "imagem carregada";

      photoAnalysisResult.hidden = false;

      analyzePhotoButton.disabled = false;
      analyzePhotoButton.textContent = "✦ Analisar novamente";

      showToast(
        "Foto preparada",
        "A imagem foi carregada. Use as perguntas e testes para confirmar seu perfil."
      );

      /*
        IMPORTANTE:
        Nesta versão em GitHub Pages, não inventamos uma classificação visual.

        Para reconhecimento REAL da foto, o próximo passo será enviar a imagem
        para um serviço de visão/IA através de um backend seguro, como uma
        Supabase Edge Function. A chave da IA nunca deve ficar neste arquivo.
      */

      setTimeout(scrollToQuestions, 450);
    }, 850);
  }

  function scrollToQuestions() {
    const questions = document.getElementById("assessmentQuestions");

    if (!questions) return;

    questions.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // ========================================================
  // QUESTIONÁRIO
  // ========================================================

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

  function handleSingleSelect(stepNumber, button) {
    const stepElement = getStepElement(stepNumber);
    const key = stepKeys[stepNumber];

    stepElement
      .querySelectorAll(".answer-card, .answer-row, .answer-chip")
      .forEach((item) => item.classList.remove("selected"));

    button.classList.add("selected");
    answers[key] = button.dataset.value;
  }

  function handleMultiSelect(stepNumber, button) {
    const key = stepKeys[stepNumber];
    const value = button.dataset.value;

    if (!Array.isArray(answers[key])) {
      answers[key] = [];
    }

    if (stepNumber === 6 && value === "nenhuma") {
      getStepElement(stepNumber)
        .querySelectorAll(".multi")
        .forEach((item) => item.classList.remove("selected"));

      button.classList.add("selected");
      answers[key] = ["nenhuma"];
      return;
    }

    if (stepNumber === 6 && value !== "nenhuma") {
      const noneButton = getStepElement(stepNumber)
        .querySelector('[data-value="nenhuma"]');

      if (noneButton) noneButton.classList.remove("selected");

      answers[key] = answers[key].filter(
        (item) => item !== "nenhuma"
      );
    }

    if (stepNumber === 8 && value === "saudavel") {
      getStepElement(stepNumber)
        .querySelectorAll(".multi")
        .forEach((item) => item.classList.remove("selected"));

      button.classList.add("selected");
      answers[key] = ["saudavel"];
      return;
    }

    if (stepNumber === 8 && value !== "saudavel") {
      const healthyButton = getStepElement(stepNumber)
        .querySelector('[data-value="saudavel"]');

      if (healthyButton) healthyButton.classList.remove("selected");

      answers[key] = answers[key].filter(
        (item) => item !== "saudavel"
      );
    }

    button.classList.toggle("selected");

    if (button.classList.contains("selected")) {
      if (!answers[key].includes(value)) {
        answers[key].push(value);
      }
    } else {
      answers[key] = answers[key].filter(
        (item) => item !== value
      );
    }
  }

  nextButton.addEventListener("click", () => {
    if (!isCurrentStepAnswered()) return;

    if (currentStep < totalSteps) {
      currentStep += 1;
      showStep(currentStep);

      document.getElementById("assessmentQuestions")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      return;
    }

    finishAssessment();
  });

  backButton.addEventListener("click", () => {
    if (currentStep <= 1) return;

    currentStep -= 1;
    showStep(currentStep);

    document.getElementById("assessmentQuestions")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  });

  closeAssessment.addEventListener("click", () => {
    const hasAnswers = Object.values(answers).some((value) => {
      return Array.isArray(value)
        ? value.length > 0
        : Boolean(value);
    });

    if (!hasAnswers && !selectedPhotoFile) {
      window.location.href = "index.html";
      return;
    }

    showExitModal();
  });

  function showStep(stepNumber) {
    document.querySelectorAll(".question-step").forEach((step) => {
      step.classList.remove("active");
    });

    const activeStep = getStepElement(stepNumber);

    if (activeStep) activeStep.classList.add("active");

    restoreSelectedState(stepNumber);
    updateProgress();
    updateButtons();
  }

  function getStepElement(stepNumber) {
    return document.querySelector(
      `.question-step[data-step="${stepNumber}"]`
    );
  }

  function updateProgress() {
    const percent = 10 + (currentStep / totalSteps) * 90;

    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${currentStep} de ${totalSteps}`;
  }

  function updateButtons() {
    backButton.disabled = currentStep === 1;

    nextButton.textContent =
      currentStep === totalSteps
        ? "Gerar meu cronograma ✦"
        : "Continuar →";

    updateNextButton();
  }

  function updateNextButton() {
    nextButton.disabled = !isCurrentStepAnswered();
  }

  function isCurrentStepAnswered() {
    const key = stepKeys[currentStep];
    const value = answers[key];

    return Array.isArray(value)
      ? value.length > 0
      : Boolean(value);
  }

  function restoreSelectedState(stepNumber) {
    const stepElement = getStepElement(stepNumber);
    const key = stepKeys[stepNumber];
    const savedValue = answers[key];

    if (!stepElement) return;

    stepElement
      .querySelectorAll(".answer-card, .answer-row, .answer-chip")
      .forEach((button) => {
        button.classList.remove("selected");

        const value = button.dataset.value;

        if (Array.isArray(savedValue)) {
          if (savedValue.includes(value)) {
            button.classList.add("selected");
          }
        } else if (savedValue === value) {
          button.classList.add("selected");
        }
      });
  }

  // ========================================================
  // SALVAMENTO
  // ========================================================

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

  // ========================================================
  // SISTEMA DE AJUDA
  // ========================================================

  function setupHelpSystem() {
    document
      .querySelectorAll("[data-help]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          openHelp(button.dataset.help);
        });
      });

    document
      .querySelectorAll("[data-close-help]")
      .forEach((button) => {
        button.addEventListener("click", closeHelp);
      });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        hairHelpModal &&
        !hairHelpModal.hidden
      ) {
        closeHelp();
      }
    });
  }

  function openHelp(type) {
    currentHelpType = type;
    helpStage = 0;
    helpSelections = {};

    hairHelpModal.hidden = false;
    document.body.style.overflow = "hidden";

    hairHelpResult.hidden = true;

    const content = getHelpIntro(type);

    hairHelpEyebrow.textContent = content.eyebrow;
    hairHelpTitle.textContent = content.title;
    hairHelpDescription.textContent = content.description;
    hairHelpContent.innerHTML = content.html;
    hairHelpNext.textContent =
      type === "tipo"
        ? "Entendi"
        : "Começar teste";

    hairHelpNext.onclick = () => {
      if (type === "tipo") {
        closeHelp();
        return;
      }

      startGuidedTest(type);
    };
  }

  function closeHelp() {
    hairHelpModal.hidden = true;
    document.body.style.overflow = "";
  }

  function getHelpIntro(type) {
    const guides = {
      tipo: {
        eyebrow: "GUIA DE TIPO",
        title: "Observe o formato natural do fio",
        description:
          "Veja o cabelo limpo, seco e sem chapinha, escova ou modelador.",
        html: `
          <div class="help-guide-card">
            <strong>Tipo 1 — Liso</strong>
            <p>O fio permanece predominantemente reto.</p>
          </div>

          <div class="help-guide-card">
            <strong>Tipo 2 — Ondulado</strong>
            <p>Forma ondas parecidas com a letra S, sem fechar cachos completos.</p>
          </div>

          <div class="help-guide-card">
            <strong>Tipo 3 — Cacheado</strong>
            <p>Forma espirais ou anéis visíveis ao longo do cabelo.</p>
          </div>

          <div class="help-guide-card">
            <strong>Tipo 4 — Crespo</strong>
            <p>Apresenta curvaturas muito fechadas, pequenas espirais ou padrão em zigue-zague.</p>
          </div>
        `
      },

      curvatura: {
        eyebrow: "TESTE DE CURVATURA",
        title: "Vamos estimar sua curvatura",
        description:
          "Responda observando a maior parte do cabelo em seu estado natural.",
        html: `
          <div class="help-guide-card">
            <strong>O teste leva poucos segundos</strong>
            <p>Vamos perguntar como o fio se comporta e indicar a faixa mais provável.</p>
          </div>
        `
      },

      espessura: {
        eyebrow: "TESTE DE ESPESSURA",
        title: "Descubra se o fio é fino, médio ou grosso",
        description:
          "Pegue um único fio limpo e seco. Observe e sinta o fio entre os dedos.",
        html: `
          <div class="help-guide-card">
            <strong>Dica</strong>
            <p>Não avalie a quantidade de cabelo. Queremos a espessura de apenas um fio.</p>
          </div>

          <div class="help-guide-card">
            <strong>Como comparar</strong>
            <p>Um fio fino costuma ser pouco perceptível; um fio grosso é facilmente visível e sentido entre os dedos.</p>
          </div>
        `
      },

      porosidade: {
        eyebrow: "TESTE DE POROSIDADE",
        title: "Vamos observar como seu cabelo reage à água",
        description:
          "O teste usa o comportamento real dos fios em vez de depender do teste do copo.",
        html: `
          <div class="help-guide-card">
            <strong>Antes de começar</strong>
            <p>Pense em como seu cabelo costuma molhar, secar e receber produtos no dia a dia.</p>
          </div>
        `
      }
    };

    return guides[type];
  }

  function startGuidedTest(type) {
    helpStage = 1;
    helpSelections = {};

    if (type === "curvatura") {
      renderTestQuestion(
        "Qual formato aparece com mais frequência?",
        [
          ["reto", "Predominantemente reto", "Quase não forma ondas."],
          ["ondas", "Ondas em S", "Forma ondas visíveis."],
          ["aneis", "Anéis / espirais", "Forma cachos completos."],
          ["fechado", "Curvatura muito fechada", "Espirais pequenas ou zigue-zague."]
        ],
        (value) => {
          const resultMap = {
            reto: {
              value: "1B",
              title: "Curvatura provável: Tipo 1",
              text: "Seu padrão parece estar na família dos cabelos lisos. Compare 1A, 1B e 1C para escolher o mais parecido."
            },
            ondas: {
              value: "2B",
              title: "Curvatura provável: Tipo 2",
              text: "Seu padrão parece ondulado. Compare 2A, 2B e 2C para escolher a intensidade das ondas."
            },
            aneis: {
              value: "3B",
              title: "Curvatura provável: Tipo 3",
              text: "Seu padrão parece cacheado. Compare 3A, 3B e 3C para escolher o tamanho dos cachos."
            },
            fechado: {
              value: "4A",
              title: "Curvatura provável: Tipo 4",
              text: "Seu padrão parece crespo. Compare 4A, 4B e 4C para escolher a opção mais próxima."
            }
          };

          showHelpResult(
            resultMap[value],
            "Usar como ponto de partida"
          );
        }
      );
    }

    if (type === "espessura") {
      renderTestQuestion(
        "Ao segurar um único fio entre os dedos, como ele parece?",
        [
          ["fino", "Quase não sinto o fio", "Ele é delicado e pouco perceptível."],
          ["medio", "Consigo sentir o fio", "É perceptível, mas não parece muito rígido."],
          ["grosso", "Sinto o fio facilmente", "Ele parece mais firme e encorpado."]
        ],
        (value) => {
          const map = {
            fino: {
              value: "fino",
              title: "Espessura provável: Fina",
              text: "Seu fio apresenta características mais próximas de cabelos finos."
            },
            medio: {
              value: "medio",
              title: "Espessura provável: Média",
              text: "Seu fio apresenta características intermediárias."
            },
            grosso: {
              value: "grosso",
              title: "Espessura provável: Grossa",
              text: "Seu fio apresenta características mais próximas de cabelos grossos."
            }
          };

          showHelpResult(map[value], "Usar esta resposta");
        }
      );
    }

    if (type === "porosidade") {
      renderPorosityQuestionOne();
    }
  }

  function renderPorosityQuestionOne() {
    renderTestQuestion(
      "Quando você molha o cabelo, o que costuma acontecer?",
      [
        ["demora", "Demora para molhar", "A água parece ficar sobre os fios no início."],
        ["normal", "Molha normalmente", "A água entra nos fios sem muita dificuldade."],
        ["rapido", "Molha muito rápido", "Os fios absorvem água quase imediatamente."]
      ],
      (value) => {
        helpSelections.water = value;
        renderPorosityQuestionTwo();
      }
    );
  }

  function renderPorosityQuestionTwo() {
    renderTestQuestion(
      "E depois de aplicar creme ou máscara?",
      [
        ["acumula", "Produtos pesam ou acumulam", "Parece que ficam sobre o cabelo."],
        ["equilibrado", "O cabelo recebe bem", "Nem pesa demais nem perde o efeito rapidamente."],
        ["some", "O efeito some rápido", "O cabelo volta a parecer seco em pouco tempo."]
      ],
      (value) => {
        helpSelections.product = value;
        calculatePorosityTest();
      }
    );
  }

  function calculatePorosityTest() {
    let low = 0;
    let medium = 0;
    let high = 0;

    if (helpSelections.water === "demora") low += 2;
    if (helpSelections.water === "normal") medium += 2;
    if (helpSelections.water === "rapido") high += 2;

    if (helpSelections.product === "acumula") low += 2;
    if (helpSelections.product === "equilibrado") medium += 2;
    if (helpSelections.product === "some") high += 2;

    const ranking = [
      ["baixa", low],
      ["media", medium],
      ["alta", high]
    ].sort((a, b) => b[1] - a[1]);

    const result = ranking[0][0];

    const resultMap = {
      baixa: {
        value: "baixa",
        title: "Porosidade provável: Baixa",
        text: "Seu cabelo parece ter mais dificuldade para absorver água e produtos."
      },
      media: {
        value: "media",
        title: "Porosidade provável: Média",
        text: "Seu cabelo parece absorver e manter hidratação de forma equilibrada."
      },
      alta: {
        value: "alta",
        title: "Porosidade provável: Alta",
        text: "Seu cabelo parece absorver rapidamente, mas também perder hidratação com facilidade."
      }
    };

    showHelpResult(
      resultMap[result],
      "Usar esta resposta"
    );
  }

  function renderTestQuestion(title, options, onSelect) {
    hairHelpTitle.textContent = title;
    hairHelpDescription.textContent =
      "Escolha a opção que mais representa seu cabelo.";

    hairHelpContent.innerHTML = options
      .map(([value, label, description]) => `
        <button
          class="help-test-option"
          type="button"
          data-test-value="${value}"
        >
          <strong>${label}</strong>
          <p>${description}</p>
        </button>
      `)
      .join("");

    hairHelpResult.hidden = true;
    hairHelpNext.style.display = "none";

    hairHelpContent
      .querySelectorAll(".help-test-option")
      .forEach((button) => {
        button.addEventListener("click", () => {
          hairHelpContent
            .querySelectorAll(".help-test-option")
            .forEach((item) => item.classList.remove("selected"));

          button.classList.add("selected");

          setTimeout(() => {
            onSelect(button.dataset.testValue);
          }, 180);
        });
      });
  }

  function showHelpResult(result, buttonText) {
    hairHelpContent.innerHTML = "";

    hairHelpResult.hidden = false;

    hairHelpResult.innerHTML = `
      <strong>${result.title}</strong>
      <p>${result.text}</p>
    `;

    hairHelpNext.style.display = "";
    hairHelpNext.textContent = buttonText;

    hairHelpNext.onclick = () => {
      applyGuidedResult(currentHelpType, result.value);
      closeHelp();
    };
  }

  function applyGuidedResult(type, value) {
    const stepMap = {
      curvatura: 2,
      espessura: 3,
      porosidade: 4
    };

    const keyMap = {
      curvatura: "curvatura",
      espessura: "espessura",
      porosidade: "porosidade"
    };

    const step = stepMap[type];
    const key = keyMap[type];

    if (!step || !key) return;

    answers[key] = value;
    saveAnswers();

    currentStep = step;
    showStep(currentStep);

    document.getElementById("assessmentQuestions")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    showToast(
      "Resposta preenchida",
      "Você pode manter essa opção ou escolher outra manualmente."
    );
  }

  // ========================================================
  // PERFIL E RESULTADO
  // ========================================================

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

  function calculateHairProfile(data) {
    let hidratacao = 0;
    let nutricao = 0;
    let reconstrucao = 0;

    if (data.estadoAtual.includes("ressecado")) hidratacao += 4;
    if (data.estadoAtual.includes("opaco")) hidratacao += 2;
    if (data.estadoAtual.includes("sem-definicao")) hidratacao += 1;

    if (data.estadoAtual.includes("frizz")) nutricao += 3;
    if (data.estadoAtual.includes("embaraçando")) nutricao += 2;
    if (data.estadoAtual.includes("poroso")) nutricao += 2;

    if (data.estadoAtual.includes("quebradico")) reconstrucao += 4;
    if (data.estadoAtual.includes("poroso")) reconstrucao += 2;

    if (data.porosidade === "alta") {
      hidratacao += 2;
      nutricao += 2;
      reconstrucao += 2;
    }

    if (data.porosidade === "baixa") {
      hidratacao += 1;
    }

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

    if (data.calor === "frequente") {
      hidratacao += 2;
      nutricao += 2;
      reconstrucao += 2;
    }

    if (data.calor === "as-vezes") {
      hidratacao += 1;
      nutricao += 1;
    }

    if (data.objetivo === "recuperacao") reconstrucao += 2;
    if (data.objetivo === "maciez-brilho") hidratacao += 2;
    if (data.objetivo === "definicao") nutricao += 2;
    if (data.objetivo === "frizz") nutricao += 2;

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

    return {
      createdAt: new Date().toISOString(),
      answers: data,
      scores,
      priority
    };
  }

  function showAnalysisScreen(profile) {
    const shell = document.querySelector(".assessment-shell");

    shell.innerHTML = `
      <section class="analysis-screen">
        <div class="analysis-orb">
          <span>✦</span>
        </div>

        <span class="analysis-label">HAIRCURA INTELLIGENCE</span>

        <h1>Analisando seu perfil capilar...</h1>

        <p>
          Cruzando suas respostas para identificar as prioridades do seu cabelo.
        </p>

        <div class="analysis-loader">
          <span></span>
        </div>
      </section>
    `;

    setTimeout(() => {
      showResultPreview(profile);
    }, 2300);
  }

  function showResultPreview(profile) {
    const shell = document.querySelector(".assessment-shell");

    const labels = {
      hidratacao: "Hidratação",
      nutricao: "Nutrição",
      reconstrucao: "Reconstrução"
    };

    const topPriority = profile.priority[0];

    shell.innerHTML = `
      <section class="result-preview">
        <div class="result-badge">✓ Avaliação concluída</div>

        <h1>Seu perfil capilar está pronto.</h1>

        <p>
          A maior prioridade identificada no momento é
          <strong>${labels[topPriority]}</strong>.
        </p>

        <div class="result-priority-card">
          <span>MAIOR PRIORIDADE</span>
          <h2>${labels[topPriority]}</h2>
          <strong>${profile.scores[topPriority]}%</strong>
        </div>

        <div class="result-score-grid">
          ${renderScoreCard("Hidratação", profile.scores.hidratacao)}
          ${renderScoreCard("Nutrição", profile.scores.nutricao)}
          ${renderScoreCard("Reconstrução", profile.scores.reconstrucao)}
        </div>

        <button
          class="result-button"
          id="createScheduleButton"
          type="button"
        >
          Criar meu cronograma →
        </button>

        <button
          class="restart-assessment"
          id="restartAssessment"
          type="button"
        >
          Refazer avaliação
        </button>
      </section>
    `;

    document
      .getElementById("createScheduleButton")
      .addEventListener("click", () => {
        showToast(
          "Cronograma personalizado",
          "A próxima etapa será construir a tela do cronograma automático."
        );
      });

    document
      .getElementById("restartAssessment")
      .addEventListener("click", () => {
        localStorage.removeItem("haircuraAssessment");
        localStorage.removeItem("haircuraProfile");
        window.location.reload();
      });
  }

  function renderScoreCard(label, score) {
    return `
      <div class="result-score-card">
        <strong>${score}%</strong>
        <small>${label}</small>
      </div>
    `;
  }

  // ========================================================
  // MODAL DE SAÍDA
  // ========================================================

  function showExitModal() {
    const modal = document.createElement("div");
    modal.className = "assessment-exit-modal";

    modal.innerHTML = `
      <div class="assessment-exit-card">
        <div class="exit-icon">✦</div>

        <h3>Sair da avaliação?</h3>

        <p>
          Suas respostas já preenchidas ficam salvas neste dispositivo.
        </p>

        <div class="exit-actions">
          <button class="exit-cancel" type="button">
            Continuar
          </button>

          <button class="exit-confirm" type="button">
            Sair
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal
      .querySelector(".exit-cancel")
      .addEventListener("click", () => modal.remove());

    modal
      .querySelector(".exit-confirm")
      .addEventListener("click", () => {
        window.location.href = "index.html";
      });
  }

  // ========================================================
  // TOAST
  // ========================================================

  function showToast(title, message) {
    document.querySelector(".assessment-toast")?.remove();

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

      setTimeout(() => toast.remove(), 230);
    }, 3300);
  }

  // ========================================================
  // ESTILOS DINÂMICOS
  // ========================================================

  function injectDynamicStyles() {
    const style = document.createElement("style");

    style.textContent = `
      .assessment-toast {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 10000;
        width: min(390px, calc(100vw - 28px));
        padding: 14px;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: center;
        border: 1px solid rgba(139,92,246,.24);
        border-radius: 17px;
        background: rgba(11,12,20,.97);
        box-shadow: 0 24px 60px rgba(0,0,0,.43);
        opacity: 0;
        transform: translateY(16px);
        transition: .23s ease;
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
        font-size: .86rem;
      }

      .assessment-toast span {
        color: #8f899d;
        font-size: .76rem;
        line-height: 1.4;
      }

      .assessment-exit-modal {
        position: fixed;
        inset: 0;
        z-index: 10000;
        padding: 20px;
        display: grid;
        place-items: center;
        background: rgba(3,4,9,.78);
        backdrop-filter: blur(10px);
      }

      .assessment-exit-card {
        width: min(420px, 100%);
        padding: 27px;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 24px;
        background: #0c0e17;
        text-align: center;
        box-shadow: 0 30px 80px rgba(0,0,0,.5);
      }

      .exit-icon {
        width: 54px;
        height: 54px;
        margin: 0 auto 14px;
        display: grid;
        place-items: center;
        border-radius: 17px;
        background: linear-gradient(135deg, #8b5cf6, #ff4fb8);
      }

      .assessment-exit-card h3 {
        font-size: 1.3rem;
      }

      .assessment-exit-card p {
        margin-top: 9px;
        color: #8e899a;
        font-size: .84rem;
      }

      .exit-actions {
        margin-top: 20px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 9px;
      }

      .exit-actions button {
        min-height: 46px;
        border-radius: 13px;
        font-weight: 800;
        cursor: pointer;
      }

      .exit-cancel {
        border: 1px solid rgba(255,255,255,.08);
        background: rgba(255,255,255,.04);
        color: white;
      }

      .exit-confirm {
        border: 0;
        background: linear-gradient(135deg, #8b5cf6, #ff4fb8);
        color: white;
      }

      .analysis-screen,
      .result-preview {
        max-width: 820px;
        margin: 0 auto;
        padding: 75px 20px;
        text-align: center;
      }

      .analysis-orb {
        width: 100px;
        height: 100px;
        margin: 0 auto 22px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background:
          radial-gradient(circle at center, #0c0e17 46%, transparent 48%),
          conic-gradient(#8b5cf6, #ff4fb8, #8b5cf6);
        animation: haircuraSpin 2.4s linear infinite;
      }

      .analysis-orb span {
        font-size: 1.8rem;
      }

      .analysis-label {
        color: #bba9ff;
        font-size: .68rem;
        font-weight: 800;
        letter-spacing: .12em;
      }

      .analysis-screen h1,
      .result-preview h1 {
        margin-top: 15px;
        font-size: clamp(2.2rem, 5vw, 4rem);
        line-height: 1;
        letter-spacing: -.055em;
      }

      .analysis-screen p,
      .result-preview > p {
        max-width: 600px;
        margin: 17px auto 0;
        color: #9691a7;
        line-height: 1.6;
      }

      .analysis-loader {
        width: min(430px, 90%);
        height: 7px;
        margin: 28px auto 0;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255,255,255,.06);
      }

      .analysis-loader span {
        display: block;
        width: 40%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #8b5cf6, #ff4fb8);
        animation: haircuraLoad 1s ease-in-out infinite alternate;
      }

      .result-badge {
        width: fit-content;
        margin: 0 auto;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(89,221,160,.07);
        color: #73e3b0;
        font-size: .7rem;
        font-weight: 800;
      }

      .result-priority-card {
        max-width: 420px;
        margin: 28px auto 16px;
        padding: 25px;
        border: 1px solid rgba(139,92,246,.2);
        border-radius: 22px;
        background: rgba(139,92,246,.07);
      }

      .result-priority-card > span {
        color: #8d83a2;
        font-size: .65rem;
        font-weight: 800;
        letter-spacing: .1em;
      }

      .result-priority-card h2 {
        margin-top: 10px;
        font-size: 1.5rem;
      }

      .result-priority-card > strong {
        display: block;
        margin-top: 7px;
        font-size: 2.5rem;
        color: #c8b5ff;
      }

      .result-score-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }

      .result-score-card {
        min-height: 105px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
        border: 1px solid rgba(255,255,255,.06);
        border-radius: 17px;
        background: rgba(255,255,255,.025);
      }

      .result-score-card strong {
        font-size: 1.35rem;
      }

      .result-score-card small {
        color: #7c7789;
      }

      .result-button {
        width: min(420px, 100%);
        min-height: 53px;
        margin-top: 24px;
        border: 0;
        border-radius: 15px;
        background: linear-gradient(135deg, #8b5cf6, #ff4fb8);
        color: white;
        font-weight: 800;
        cursor: pointer;
      }

      .restart-assessment {
        display: block;
        margin: 13px auto 0;
        border: 0;
        background: transparent;
        color: #777284;
        cursor: pointer;
      }

      @keyframes haircuraSpin {
        to { transform: rotate(360deg); }
      }

      @keyframes haircuraLoad {
        from { transform: translateX(-25%); }
        to { transform: translateX(190%); }
      }

      @media (max-width: 640px) {
        .result-score-grid {
          grid-template-columns: 1fr;
        }

        .assessment-toast {
          left: 14px;
          right: 14px;
          bottom: 14px;
          width: auto;
        }

        .exit-actions {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(style);
  }
});
