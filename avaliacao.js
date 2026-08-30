// ==========================================================
// HAIRCURA — avaliacao.js V2
// Foto + questionário + testes guiados
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("HAIRCURA avaliação JS V5 carregado");
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
    // Delegação de clique: funciona mesmo se os botões forem
    // recriados ou alterados depois que a página já carregou.
    document.addEventListener("click", (event) => {
      const helpButton = event.target.closest("[data-help]");

      if (helpButton) {
        event.preventDefault();
        event.stopPropagation();

        const helpType = helpButton.dataset.help;

        if (helpType) {
          openHelp(helpType);
        }

        return;
      }

      const closeButton = event.target.closest("[data-close-help]");

      if (closeButton) {
        event.preventDefault();
        closeHelp();
      }
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
    if (
      !hairHelpModal ||
      !hairHelpTitle ||
      !hairHelpEyebrow ||
      !hairHelpDescription ||
      !hairHelpContent ||
      !hairHelpResult ||
      !hairHelpNext
    ) {
      console.error("HAIRCURA: elementos do modal de ajuda não foram encontrados.");
      showToast(
        "Não foi possível abrir o teste",
        "Atualize a página com Ctrl + F5 e tente novamente."
      );
      return;
    }

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
    const guidedTypes = ["curvatura", "espessura", "porosidade"];
    const hasGuidedTest = guidedTypes.includes(type);

    hairHelpNext.textContent = hasGuidedTest
      ? "Começar teste"
      : "Entendi";

    hairHelpNext.onclick = () => {
      if (!hasGuidedTest) {
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
    const visual = (emoji, title, text, note = "") => `
      <div class="help-visual-card">
        <div class="help-visual-image" aria-hidden="true">${emoji}</div>
        <div>
          <strong>${title}</strong>
          <p>${text}</p>
          ${note ? `<small>${note}</small>` : ""}
        </div>
      </div>
    `;

    const tip = (title, text) => `
      <div class="help-tip-box">
        <strong>✦ ${title}</strong>
        <p>${text}</p>
      </div>
    `;

    const referencePhoto = (src, title, caption, sourceUrl) => `
      <figure class="help-reference-photo">
        <img
          src="${src}"
          alt="${title}"
          loading="lazy"
          referrerpolicy="no-referrer"
          onerror="this.closest('.help-reference-photo').classList.add('image-error')"
        >
        <figcaption>
          <strong>${title}</strong>
          <span>${caption}</span>
          <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">
            Ver fonte da imagem ↗
          </a>
        </figcaption>
      </figure>
    `;

    const hairReferenceGallery = () => `
      <div class="help-photo-section">
        <div class="help-photo-heading">
          <span>FOTOS DE REFERÊNCIA</span>
          <p>
            Use as imagens apenas para comparar o formato geral. Textura, iluminação,
            finalização e mistura de padrões podem mudar bastante a aparência.
          </p>
        </div>

        <div class="help-reference-grid">
          ${referencePhoto(
            "https://commons.wikimedia.org/wiki/Special:Redirect/file/KatharineShepard1928.png?width=700",
            "Referência de cabelo liso",
            "Exemplo fotográfico de cabelo predominantemente reto.",
            "https://commons.wikimedia.org/wiki/File:KatharineShepard1928.png"
          )}

          ${referencePhoto(
            "https://commons.wikimedia.org/wiki/Special:Redirect/file/Vintage_studio_portrait_woman_with_wavy_hair.jpg?width=700",
            "Referência de cabelo ondulado",
            "Exemplo com ondas visíveis no comprimento.",
            "https://commons.wikimedia.org/wiki/File:Vintage_studio_portrait_woman_with_wavy_hair.jpg"
          )}

          ${referencePhoto(
            "https://commons.wikimedia.org/wiki/Special:Redirect/file/Woman_with_curly_hair_1.jpg?width=700",
            "Referência de cabelo cacheado",
            "Exemplo com cachos e espirais aparentes.",
            "https://commons.wikimedia.org/wiki/File:Woman_with_curly_hair_1.jpg"
          )}

          ${referencePhoto(
            "https://commons.wikimedia.org/wiki/Special:Redirect/file/Woman_with_afro-textured_hair_(cropped).jpg?width=700",
            "Referência de cabelo crespo",
            "Exemplo de cabelo com textura afro e curvatura muito fechada.",
            "https://commons.wikimedia.org/wiki/File:Woman_with_afro-textured_hair_(cropped).jpg"
          )}
        </div>

        <p class="help-photo-disclaimer">
          Uma fotografia sozinha não determina com precisão a classificação do cabelo.
          Confirme sempre observando seus próprios fios em estado natural.
        </p>
      </div>
    `;

    const guides = {
      tipo: {
        eyebrow: "GUIA VISUAL • ETAPA 1",
        title: "Observe o formato natural do cabelo",
        description:
          "Avalie o padrão predominante com o cabelo limpo, seco e sem chapinha, escova ou modelador. É normal existir mais de um padrão na mesma cabeça.",
        html: `
          ${hairReferenceGallery()}
          <div class="help-visual-grid">
            ${visual("│", "Tipo 1 — Liso", "Predominantemente reto da raiz às pontas. Pode ter leve curvatura nas pontas, mas não forma ondas em S bem marcadas.", "Compare o desenho geral do cabelo, não apenas um fio isolado.")}
            ${visual("〰", "Tipo 2 — Ondulado", "Forma ondas parecidas com a letra S. O padrão pode ser discreto ou bastante marcado, mas não forma anéis completos na maior parte do comprimento.", "Ondas podem começar abaixo da raiz ou aparecer em quase todo o comprimento.")}
            ${visual("➰", "Tipo 3 — Cacheado", "Forma cachos completos, espirais ou anéis visíveis. O diâmetro dos cachos pode variar de largo a bem pequeno.", "Observe o cabelo sem esticar os cachos.")}
            ${visual("〽", "Tipo 4 — Crespo", "Apresenta curvaturas muito fechadas, pequenas espirais ou padrões angulares/zigue-zague. O encolhimento pode ser bastante perceptível.", "Não use o volume como critério: observe o formato do fio.")}
          </div>
          ${tip("Como observar melhor", "Depois de lavar, deixe o cabelo secar no padrão natural. Não penteie esticando os fios. Observe principalmente laterais, topo e nuca.")}
          ${tip("Cabelo misto", "Se você enxergar dois padrões, escolha o que aparece na maior parte do cabelo. Na etapa seguinte você poderá refinar a curvatura.")}
        `
      },

      curvatura: {
        eyebrow: "GUIA + TESTE • ETAPA 2",
        title: "Compare a intensidade da sua curvatura",
        description:
          "As letras A, B e C ajudam a descrever o quanto o padrão é suave, intermediário ou intenso dentro de cada família. Use como referência prática, não como medição clínica.",
        html: `
          ${hairReferenceGallery()}
          <div class="help-family-section">
            <strong>TIPO 1 • LISOS</strong>
            <div class="help-mini-grid">
              ${visual("│", "1A", "Muito reto, com pouca ou nenhuma curvatura aparente.")}
              ${visual("╵", "1B", "Reto, mas com um pouco mais de corpo e movimento.")}
              ${visual("⌒", "1C", "Liso encorpado, podendo apresentar leves curvas nas pontas.")}
            </div>
          </div>
          <div class="help-family-section">
            <strong>TIPO 2 • ONDULADOS</strong>
            <div class="help-mini-grid">
              ${visual("﹏", "2A", "Ondas suaves e abertas, geralmente pouco marcadas.")}
              ${visual("〰", "2B", "Ondas em S mais visíveis e distribuídas pelo comprimento.")}
              ${visual("≈", "2C", "Ondas intensas; algumas partes podem quase formar cachos.")}
            </div>
          </div>
          <div class="help-family-section">
            <strong>TIPO 3 • CACHEADOS</strong>
            <div class="help-mini-grid">
              ${visual("◯", "3A", "Cachos grandes e abertos.")}
              ${visual("➰", "3B", "Cachos médios, definidos e mais fechados.")}
              ${visual("꩜", "3C", "Cachos pequenos, densos e bem fechados.")}
            </div>
          </div>
          <div class="help-family-section">
            <strong>TIPO 4 • CRESPOS</strong>
            <div class="help-mini-grid">
              ${visual("∞", "4A", "Pequenas espirais relativamente definidas.")}
              ${visual("〽", "4B", "Curvas menores e padrão mais angular/zigue-zague.")}
              ${visual("✣", "4C", "Curvatura extremamente fechada, com padrão visual muito compacto.")}
            </div>
          </div>
          ${tip("Importante", "Não precisa encaixar 100% em uma letra. Escolha a opção predominante. O HAIRCURA cruza essa resposta com as outras etapas.")}
        `
      },

      espessura: {
        eyebrow: "GUIA + TESTE • ETAPA 3",
        title: "Descubra se um fio é fino, médio ou grosso",
        description:
          "Espessura é o diâmetro de um único fio. Não confunda com densidade, que é a quantidade de fios na cabeça.",
        html: `
          <div class="help-visual-grid">
            ${visual("│", "Fino", "Fio delicado, pouco perceptível visualmente e difícil de sentir entre os dedos.", "Pode embaraçar ou quebrar com maior facilidade, mas isso sozinho não define a espessura.")}
            ${visual("┃", "Médio", "Você consegue ver e sentir o fio, mas ele não parece especialmente delicado nem rígido.")}
            ${visual("▌", "Grosso", "Fio facilmente visível e perceptível entre os dedos, com sensação mais firme ou encorpada.")}
          </div>
          ${tip("Teste de um fio", "Separe um único fio limpo e seco. Passe-o suavemente entre o polegar e o indicador. Compare também visualmente com um fio de linha comum, sem tratar isso como uma medição exata.")}
          ${tip("Evite este erro", "Um cabelo com muito volume pode ter fios finos e alta densidade. Volume não significa necessariamente fio grosso.")}
          ${tip("Por que não usamos foto para decidir a espessura", "Uma foto comum não mede o diâmetro real de um único fio com segurança. Distância, foco e iluminação podem enganar. Por isso o teste manual continua sendo a referência principal nesta etapa.")}
        `
      },

      porosidade: {
        eyebrow: "GUIA + TESTE • ETAPA 4",
        title: "Observe como o cabelo recebe e mantém água",
        description:
          "A porosidade descreve, de forma prática, como os fios interagem com água e produtos. O teste guiado usa o comportamento cotidiano do cabelo.",
        html: `
          <div class="help-visual-grid">
            ${visual("💧", "Baixa porosidade", "Pode demorar para ficar completamente molhado e alguns produtos parecem permanecer sobre os fios ou pesar.")}
            ${visual("💦", "Porosidade média", "Molha e seca de maneira relativamente equilibrada e costuma responder bem aos produtos.")}
            ${visual("🌧", "Alta porosidade", "Pode molhar rapidamente e também perder a sensação de hidratação mais depressa; danos químicos ou térmicos podem contribuir.")}
          </div>
          ${tip("O que observar", "Pense em várias lavagens, não em um único dia. Observe velocidade para molhar, comportamento durante a secagem e quanto tempo permanece a sensação de maciez após produtos.")}
          ${tip("Sobre o teste do copo", "O HAIRCURA não usa o fio boiando ou afundando em um copo como resultado definitivo. Resíduos, tensão superficial e outras variáveis podem atrapalhar essa comparação.")}
          ${tip("Por que uma foto não confirma porosidade", "Porosidade é principalmente um comportamento do fio com água e produtos. Uma imagem pode mostrar sinais visuais, mas não confirma sozinha se a porosidade é baixa, média ou alta.")}
        `
      },

      lavagem: {
        eyebrow: "ORIENTAÇÃO • ETAPA 5",
        title: "Conte sua frequência real de lavagem",
        description:
          "Não existe uma frequência universal que sirva para todo cabelo. Aqui queremos entender sua rotina atual para distribuir os cuidados de forma realista.",
        html: `
          <div class="help-visual-grid">
            ${visual("1–2×", "1–2 vezes por semana", "Escolha se normalmente existem vários dias entre uma lavagem e outra.")}
            ${visual("3–4×", "3–4 vezes por semana", "Escolha se você costuma lavar em dias alternados ou próximo disso.")}
            ${visual("5+×", "5 vezes ou mais", "Escolha se você lava quase diariamente ou todos os dias.")}
          </div>
          ${tip("Como contar", "Considere uma semana comum das últimas semanas. Não escolha a frequência que você gostaria de ter; escolha a que realmente acontece.")}
          ${tip("Aqui a foto não é necessária", "A etapa de lavagem depende da sua rotina real, então uma resposta direta é mais confiável do que tentar inferir isso por imagem.")}
          ${tip("Por que perguntamos", "O cronograma precisa caber nos dias em que você já lava o cabelo. Assim evitamos sugerir tratamentos em uma frequência pouco prática.")}
        `
      },

      quimica: {
        eyebrow: "GUIA VISUAL • ETAPA 6",
        title: "Identifique procedimentos químicos no cabelo",
        description:
          "Marque tudo que estiver presente atualmente no comprimento dos fios, mesmo que o procedimento tenha sido feito há algum tempo.",
        html: `
          <div class="help-visual-grid">
            ${visual("🎨", "Tintura / coloração", "Coloração permanente, semipermanente ou tonalização que altera a cor dos fios.")}
            ${visual("☀", "Descoloração", "Mechas, luzes, balayage, platinado ou qualquer processo usado para clarear removendo pigmento.")}
            ${visual("〰→│", "Alisamento / progressiva", "Procedimentos químicos destinados a reduzir volume, modificar a curvatura ou deixar o cabelo mais liso.")}
            ${visual("✓", "Nenhuma química", "Escolha somente quando nenhuma das opções anteriores estiver presente no cabelo.")}
          </div>
          ${tip("Mais de uma opção", "Um cabelo pode ter, por exemplo, descoloração e tintura ao mesmo tempo. Marque todas as opções aplicáveis.")}
          ${tip("A aparência pode enganar", "Alguns procedimentos químicos não ficam evidentes em uma foto. Por isso a informação fornecida por você é mais confiável nesta etapa.")}
          ${tip("Por que isso importa", "Procedimentos químicos podem alterar as necessidades do fio. Por isso essa informação terá peso no cronograma personalizado.")}
        `
      },

      calor: {
        eyebrow: "ORIENTAÇÃO • ETAPA 7",
        title: "Veja o que consideramos fonte de calor",
        description:
          "Considere ferramentas que aplicam calor diretamente ou ar quente aos fios.",
        html: `
          <div class="help-visual-grid">
            ${visual("💨", "Secador", "Conte quando usado com ar morno ou quente, principalmente próximo aos fios.")}
            ${visual("▭", "Chapinha", "O contato direto das placas aquecidas conta como uso de calor.")}
            ${visual("➰", "Modelador / babyliss", "Ferramentas aquecidas usadas para criar ondas ou cachos também contam.")}
          </div>
          ${tip("Raramente", "Quase nunca ou apenas em ocasiões específicas.")}
          ${tip("Às vezes", "Em torno de 1–2 vezes por semana.")}
          ${tip("Frequentemente", "Em torno de 3 vezes por semana ou mais.")}
          ${tip("Proteção térmica", "O uso de protetor térmico é uma informação importante para os cuidados, mas nesta pergunta queremos saber a frequência de exposição ao calor.")}
          ${tip("Foto não mostra frequência", "Mesmo que o cabelo apresente sinais compatíveis com calor, uma imagem não informa quantas vezes você usa secador, chapinha ou modelador.")}
        `
      },

      estadoAtual: {
        eyebrow: "GUIA DE SINAIS • ETAPA 8",
        title: "Compare os sinais que você percebe hoje",
        description:
          "Você pode marcar vários sinais. Observe principalmente comprimento e pontas, sem tentar transformar um único sintoma em diagnóstico.",
        html: `
          <div class="help-visual-grid">
            ${visual("☁", "Ressecado", "Toque áspero, pouca maciez e sensação de fio seco.")}
            ${visual("≈", "Frizz", "Fios arrepiados ou desalinhados ao redor do cabelo, especialmente fora do padrão principal.")}
            ${visual("◇", "Sem brilho", "O cabelo parece opaco e reflete pouca luz mesmo quando está limpo.")}
            ${visual("⚡", "Quebradiço", "Fios partem com facilidade e podem aparecer pedaços menores durante penteado ou manipulação.")}
            ${visual("💧", "Poroso", "Comportamento compatível com absorção/perda rápida de água e produtos.")}
            ${visual("●", "Oleoso", "Raiz ou fios apresentam oleosidade perceptível rapidamente.")}
            ${visual("➰?", "Sem definição", "Ondas, cachos ou crespos perdem o formato que normalmente apresentam.")}
            ${visual("⌁", "Embaraça muito", "Nós aparecem com frequência e desembaraçar exige mais esforço que o habitual.")}
            ${visual("✓", "Parece saudável", "Boa aparência geral, sem os sinais anteriores de forma relevante.")}
          </div>
          ${tip("Selecione mais de um", "Ressecamento, frizz e falta de brilho podem aparecer juntos. Marque todos que realmente representam o momento atual.")}
          ${tip("Compare com a sua própria foto", "Nesta etapa, a foto enviada pode ajudar você a observar frizz, brilho e definição. Ainda assim, toque, quebra e sensação de ressecamento precisam ser confirmados por você.")}
          ${tip("Couro cabeludo", "Feridas, dor, secreção, coceira intensa ou queda acentuada não devem ser avaliadas por este questionário; nesses casos, procure avaliação de um dermatologista.")}
        `
      },

      objetivo: {
        eyebrow: "GUIA DE OBJETIVOS • ETAPA 9",
        title: "Escolha a prioridade que mais importa agora",
        description:
          "Mesmo que você queira vários resultados, escolha aquele que deve ter maior prioridade no início do cronograma.",
        html: `
          <div class="help-visual-grid">
            ${visual("🛠", "Recuperação", "Para quem percebe danos, quebra, fragilidade ou efeitos importantes de química/calor.")}
            ${visual("✨", "Maciez e brilho", "Para priorizar toque mais sedoso, aparência menos opaca e melhor acabamento.")}
            ${visual("➰", "Definição", "Para valorizar o desenho natural de ondas, cachos ou crespos.")}
            ${visual("≈", "Reduzir frizz", "Para priorizar alinhamento e controle dos fios arrepiados.")}
            ${visual("↗", "Crescimento", "O foco do app será apoiar retenção de comprimento e redução de danos; o ritmo biológico de crescimento não pode ser garantido por cosméticos.")}
            ${visual("✓", "Manutenção", "Para quem considera o cabelo saudável e quer preservar o equilíbrio atual.")}
          </div>
          ${tip("Como decidir", "Pergunte: se eu pudesse melhorar apenas uma coisa nas próximas semanas, qual mudança faria mais diferença para mim?")}
          ${tip("Objetivo é pessoal", "Nenhuma foto consegue escolher a sua prioridade por você. Essa etapa representa o resultado que você deseja alcançar.")}
        `
      },

      rotina: {
        eyebrow: "COMPARADOR • ETAPA 10",
        title: "Escolha uma rotina que você realmente consiga manter",
        description:
          "A melhor rotina não é a mais longa: é aquela que cabe na sua semana e pode ser seguida com consistência.",
        html: `
          <div class="help-visual-grid">
            ${visual("⚡", "Rápida e prática", "Poucos passos, foco no essencial e menor tempo por sessão.", "Ideal para quem quer simplicidade e pouca manutenção.")}
            ${visual("◎", "Equilibrada", "Combina praticidade com etapas extras quando elas fizerem sentido.", "Boa opção para quem consegue reservar um pouco mais de tempo.")}
            ${visual("✦", "Completa", "Rotina mais detalhada, com maior variedade de etapas e acompanhamento.", "Para quem gosta de dedicar mais atenção aos cuidados.")}
          </div>
          ${tip("Sem resposta certa", "Escolher uma rotina rápida não reduz a qualidade da avaliação. O HAIRCURA deve adaptar as recomendações ao tempo disponível.")}
          ${tip("A rotina precisa caber na vida real", "Esta escolha não depende da aparência do cabelo, e sim de quanto tempo e atenção você consegue dedicar aos cuidados.")}
          ${tip("Você poderá ajustar depois", "A preferência de rotina pode mudar. Futuramente o perfil permitirá recalcular o cronograma quando sua disponibilidade mudar.")}
        `
      }
    };

    return guides[type] || guides.tipo;
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


      .hair-help-dialog {
        max-height: min(88vh, 900px);
        overflow-y: auto;
      }


      .help-photo-section {
        margin-top: 17px;
        padding: 15px;
        border: 1px solid rgba(139,92,246,.16);
        border-radius: 20px;
        background: rgba(139,92,246,.035);
      }

      .help-photo-heading span {
        color: #b7a5ff;
        font-size: .66rem;
        font-weight: 900;
        letter-spacing: .1em;
      }

      .help-photo-heading p {
        margin: 7px 0 0;
        color: #918a9f;
        font-size: .73rem;
        line-height: 1.5;
      }

      .help-reference-grid {
        margin-top: 13px;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 9px;
      }

      .help-reference-photo {
        margin: 0;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 15px;
        background: rgba(255,255,255,.025);
      }

      .help-reference-photo img {
        width: 100%;
        aspect-ratio: 4 / 5;
        display: block;
        object-fit: cover;
        background: rgba(255,255,255,.03);
      }

      .help-reference-photo figcaption {
        padding: 10px;
      }

      .help-reference-photo figcaption strong {
        display: block;
        color: #f4f0ff;
        font-size: .72rem;
      }

      .help-reference-photo figcaption span {
        display: block;
        margin-top: 4px;
        color: #837d8f;
        font-size: .64rem;
        line-height: 1.4;
      }

      .help-reference-photo figcaption a {
        display: inline-block;
        margin-top: 7px;
        color: #b49cff;
        font-size: .61rem;
        text-decoration: none;
      }

      .help-reference-photo.image-error img {
        display: none;
      }

      .help-reference-photo.image-error::before {
        content: "Imagem temporariamente indisponível";
        min-height: 140px;
        padding: 12px;
        display: grid;
        place-items: center;
        color: #817a8d;
        font-size: .67rem;
        text-align: center;
      }

      .help-photo-disclaimer {
        margin: 12px 0 0;
        color: #766f83;
        font-size: .66rem;
        line-height: 1.5;
      }

      .help-visual-grid,
      .help-mini-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 14px;
      }

      .help-mini-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .help-visual-card {
        min-width: 0;
        padding: 14px;
        display: grid;
        grid-template-columns: 54px 1fr;
        gap: 12px;
        align-items: start;
        border: 1px solid rgba(255,255,255,.075);
        border-radius: 17px;
        background:
          linear-gradient(145deg, rgba(139,92,246,.07), rgba(255,255,255,.018));
      }

      .help-visual-image {
        width: 54px;
        height: 54px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(139,92,246,.22);
        border-radius: 15px;
        background: rgba(139,92,246,.09);
        color: #d5c8ff;
        font-size: 1.45rem;
        font-weight: 900;
      }

      .help-visual-card strong {
        display: block;
        color: #f5f2ff;
        font-size: .86rem;
      }

      .help-visual-card p {
        margin: 5px 0 0;
        color: #aaa4b5;
        font-size: .76rem;
        line-height: 1.5;
      }

      .help-visual-card small {
        display: block;
        margin-top: 7px;
        color: #7f788e;
        font-size: .68rem;
        line-height: 1.45;
      }

      .help-tip-box {
        margin-top: 11px;
        padding: 13px 14px;
        border-left: 3px solid #8b5cf6;
        border-radius: 0 13px 13px 0;
        background: rgba(139,92,246,.065);
      }

      .help-tip-box strong {
        color: #c8b8ff;
        font-size: .77rem;
      }

      .help-tip-box p {
        margin: 5px 0 0;
        color: #9d96aa;
        font-size: .74rem;
        line-height: 1.55;
      }

      .help-family-section {
        margin-top: 16px;
      }

      .help-family-section > strong {
        color: #9c8cff;
        font-size: .67rem;
        letter-spacing: .09em;
      }

      @media (max-width: 640px) {
        .result-score-grid {
          grid-template-columns: 1fr;
        }

        .help-reference-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .help-visual-grid,
        .help-mini-grid {
          grid-template-columns: 1fr;
        }

        .help-visual-card {
          grid-template-columns: 48px 1fr;
        }

        .help-visual-image {
          width: 48px;
          height: 48px;
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
