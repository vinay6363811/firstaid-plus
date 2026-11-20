/**
 * FirstAid+ Main Application Coordinator
 * Handles top-level routing, guides library, settings, and global helpers
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Global text-to-speech helpers
  window.speakText = (text, lang) => {
    if (window.speechEngine) {
      window.speechEngine.speak({
        text: text,
        lang: lang
      });
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  window.playAlertBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  // Instantiate Sub-Controllers
  window.stepGuide = new window.StepGuideController();
  window.cprMetronome = new window.CprMetronomeController();
  window.kitChecklist = new window.KitChecklistController();
  window.smartAnalyzer = new window.SmartAnalyzerController();
  window.smartAssistant = new window.SmartAssistantController();

  // Navigation Links & Views
  const navButtons = document.querySelectorAll(".nav-btn");
  const viewSections = document.querySelectorAll(".view-section");

  function switchView(viewId) {
    navButtons.forEach(btn => {
      const target = btn.getAttribute("data-view");
      btn.classList.toggle("active", target === viewId);
    });

    viewSections.forEach(sec => {
      sec.classList.toggle("active", sec.id === `view-${viewId}`);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const viewId = btn.getAttribute("data-view");
      if (viewId) switchView(viewId);
    });
  });

  // Set default view to "analyzer" to highlight the new feature
  switchView("analyzer");

  // Load and render Emergency Guides Library
  let allGuides = [];
  try {
    const res = await fetch("/api/guides");
    const data = await res.json();
    allGuides = data.guides || [];
    renderGuidesList(allGuides);
  } catch (err) {
    console.error("Failed to fetch guides library", err);
  }

  function renderGuidesList(guides) {
    const container = document.getElementById("guides-list-grid");
    if (!container) return;
    container.innerHTML = "";

    if (guides.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;">No first aid guides match your search.</div>`;
      return;
    }

    guides.forEach(g => {
      const card = document.createElement("div");
      card.className = "guide-item-card";
      
      const sevClass = (g.severity || "moderate").toLowerCase();

      let iconSvg = "assets/guide-cpr.svg";
      const idLower = g.id.toLowerCase();
      if (idLower.includes("burn")) iconSvg = "assets/guide-burns.svg";
      else if (idLower.includes("bleed") || idLower.includes("cut") || idLower.includes("wound")) iconSvg = "assets/guide-bleeding.svg";
      else if (idLower.includes("chok") || idLower.includes("asthma") || idLower.includes("breath")) iconSvg = "assets/guide-choking.svg";
      else if (idLower.includes("cpr") || idLower.includes("heart") || idLower.includes("unconscious")) iconSvg = "assets/guide-cpr.svg";
      else if (idLower.includes("stroke") || idLower.includes("head") || idLower.includes("seizure")) iconSvg = "assets/diagrams/stroke-fast.svg";
      else if (idLower.includes("fract") || idLower.includes("sprain")) iconSvg = "assets/diagrams/fracture-rice.svg";
      else if (idLower.includes("snake") || idLower.includes("bite") || idLower.includes("poison")) iconSvg = "assets/diagrams/snakebite-action.svg";

      card.innerHTML = `
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${iconSvg}" alt="${g.title}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px;">
              <span class="guide-item-category">${g.category}</span>
            </div>
            <span class="num-pill" style="font-size: 0.72rem; border-color: transparent; background: rgba(0,0,0,0.06); color: #334155;">${g.severity}</span>
          </div>
          <h3 class="guide-item-title">${g.title}</h3>
          <p class="guide-item-snippet">${g.whatHappened}</p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
          <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.82rem;" onclick="window.viewGuideDetail('${g.id}')">
            View Protocol
          </button>
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.82rem;" onclick="window.launchStepGuideById('${g.id}')">
            Step-by-Step
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Search input for guides
  const guideSearchInput = document.getElementById("guide-search-input");
  if (guideSearchInput) {
    guideSearchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderGuidesList(allGuides);
        return;
      }
      const filtered = allGuides.filter(g => 
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.whatHappened.toLowerCase().includes(q) ||
        g.keywords.some(k => k.toLowerCase().includes(q))
      );
      renderGuidesList(filtered);
    });
  }

  // Visual Body Region Selector Quick Action
  window.filterByBodyRegion = (region) => {
    const input = document.getElementById("problem-description-input");
    const counter = document.getElementById("char-counter");
    const presets = {
      head: "Severe throbbing headache in temples and forehead for the past 4 hours.",
      airway: "Child is choking on food, cannot breathe or cough, hands clutched to neck.",
      chest: "Sudden severe crushing chest pressure radiating into left arm and shortness of breath.",
      arm: "My friend accidentally spilled boiling water on his hand and wrist.",
      leg: "Tripped on stairs, twisted ankle severely, swollen and cannot put weight.",
      stomach: "Sharp stomach pain, bloating, and burning acidity after dinner.",
      back: "Severe lower back pain and spinal stiffness, difficulty bending or walking.",
      systemic: "Person having high fever, severe chills, shivering, and body aches."
    };
    if (input && presets[region]) {
      input.value = presets[region];
      if (counter) counter.textContent = `${presets[region].length} characters`;
      input.focus();
      if (window.bodyVisualization && typeof window.bodyVisualization.scanAndHighlightSymptoms === 'function') {
        window.bodyVisualization.scanAndHighlightSymptoms(presets[region]);
      }
    }
  };

  // Global helper to view guide detail in Smart Analyzer results format
  window.viewGuideDetail = (guideId) => {
    const guide = allGuides.find(g => g.id === guideId);
    if (!guide) return;
    switchView("analyzer");
    window.smartAnalyzer.renderResults(guide, false);
  };

  window.launchStepGuideById = (guideId) => {
    const guide = allGuides.find(g => g.id === guideId);
    if (!guide) return;
    window.stepGuide.startGuide(guide.title, guide.immediateFirstAid);
  };

  window.launchStepGuideFromChat = (guideId) => {
    const guide = allGuides.find(g => g.id === guideId);
    if (guide) {
      window.stepGuide.startGuide(guide.title, guide.immediateFirstAid);
    }
  };

  window.readGuideAloud = (guideId) => {
    const guide = allGuides.find(g => g.id === guideId);
    if (!guide) return;
    let text = `First Aid for ${guide.title}. `;
    (guide.immediateFirstAid || []).forEach((step, i) => {
      text += `Step ${i+1}: ${step}. `;
    });
    window.speakText(text);
  };

  // Settings & API Configuration Handler
  const saveKeyBtn = document.getElementById("save-api-key-btn");
  const clearKeyBtn = document.getElementById("clear-api-key-btn");
  const apiKeyInput = document.getElementById("gemini-api-key-input");
  const aiStatusIndicator = document.getElementById("ai-status-indicator");

  async function checkServerStatus() {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      if (aiStatusIndicator) {
        if (data.hasApiKey) {
          aiStatusIndicator.innerHTML = `<span style="color: #38bdf8; font-weight: bold;">⚡ Cloud Gemini 2.5 Flash AI Active</span>`;
        } else {
          aiStatusIndicator.innerHTML = `<span style="color: #fbbf24; font-weight: bold;">⚠️ Local Clinical Rule & Demo Vision Engine Active (No Cloud API Key)</span>`;
        }
      }
    } catch (e) {}
  }
  checkServerStatus();

  if (saveKeyBtn && apiKeyInput) {
    saveKeyBtn.addEventListener("click", async () => {
      const key = apiKeyInput.value.trim();
      if (!key) {
        alert("Please enter a valid Gemini API key.");
        return;
      }
      try {
        const res = await fetch("/api/config-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: key })
        });
        const data = await res.json();
        alert(data.message || "Key configured successfully!");
        apiKeyInput.value = "";
        checkServerStatus();
      } catch (err) {
        alert("Failed to save API key: " + err.message);
      }
    });
  }

  if (clearKeyBtn) {
    clearKeyBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/api/config-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: "" })
        });
        const data = await res.json();
        alert(data.message || "Key cleared. Using local rules.");
        checkServerStatus();
      } catch (err) {
        alert("Failed to clear API key: " + err.message);
      }
    });
  }

  // Voice Customization Settings Manager (Female Voice Preference & Speed)
  function initVoiceSettings() {
    if (!window.speechEngine) return;
    const se = window.speechEngine;

    const genderSelect = document.getElementById("voice-gender-select");
    const styleSelect = document.getElementById("voice-style-select");
    const speedSelect = document.getElementById("voice-speed-select");
    const volumeSlider = document.getElementById("voice-volume-slider");
    const volumeVal = document.getElementById("voice-volume-val");
    const autoSpeakToggle = document.getElementById("voice-auto-speak-toggle");
    const previewBtn = document.getElementById("preview-voice-btn");
    const activeVoiceLabel = document.getElementById("active-voice-detected-label");

    // Initialize UI from saved settings
    if (genderSelect) genderSelect.value = se.settings.gender || "female";
    if (styleSelect) styleSelect.value = se.settings.style || "calm";
    if (speedSelect) speedSelect.value = se.settings.speed || "normal";
    if (volumeSlider) {
      const volPct = Math.round((se.settings.volume || 1.0) * 100);
      volumeSlider.value = volPct;
      if (volumeVal) volumeVal.textContent = `${volPct}%`;
    }
    if (autoSpeakToggle) autoSpeakToggle.checked = !!se.settings.autoSpeak;

    function updateDiagnosticLabel() {
      if (!activeVoiceLabel) return;
      const match = se.getBestVoice("en-IN", se.settings.gender);
      if (match && match.voice) {
        const genderText = match.isFemale ? "👩 Female Voice" : "🎙️ Voice";
        activeVoiceLabel.textContent = `Active: ${match.voice.name} (${genderText})`;
      } else {
        activeVoiceLabel.textContent = "Active: Browser Default TTS Voice";
      }
    }

    updateDiagnosticLabel();
    if (typeof window.speechSynthesis !== "undefined") {
      window.speechSynthesis.onvoiceschanged = () => updateDiagnosticLabel();
    }

    // Listeners
    if (genderSelect) {
      genderSelect.addEventListener("change", (e) => {
        se.saveSettings({ gender: e.target.value });
        updateDiagnosticLabel();
      });
    }

    if (styleSelect) {
      styleSelect.addEventListener("change", (e) => {
        se.saveSettings({ style: e.target.value });
      });
    }

    if (speedSelect) {
      speedSelect.addEventListener("change", (e) => {
        se.saveSettings({ speed: e.target.value });
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener("input", (e) => {
        const pct = parseInt(e.target.value, 10);
        if (volumeVal) volumeVal.textContent = `${pct}%`;
        se.saveSettings({ volume: pct / 100 });
      });
    }

    if (autoSpeakToggle) {
      autoSpeakToggle.addEventListener("change", (e) => {
        se.saveSettings({ autoSpeak: e.target.checked });
      });
    }

    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        se.previewVoice();
      });
    }
  }
  initVoiceSettings();

  // =========================================================================
  // Language Change Controller (Global Header Icon + Input Toolbar Pills)
  // =========================================================================
  function initLanguageSelector() {
    if (!window.speechEngine) return;
    const se = window.speechEngine;

    const dropdownContainer = document.getElementById("global-lang-dropdown-container");
    const toggleBtn = document.getElementById("global-lang-toggle-btn");
    const currentLabel = document.getElementById("global-lang-current-label");
    const menuItems = document.querySelectorAll(".lang-menu-item");
    const pills = document.querySelectorAll(".lang-pill");
    const activeIndicator = document.getElementById("active-lang-indicator");
    const settingsLangSelect = document.getElementById("settings-language-select");
    const voiceChangeBtn = document.getElementById("voice-change-lang-btn");
    const problemInput = document.getElementById("problem-description-input");

    const PLACEHOLDERS = {
      'kn-IN': 'ಏನಾಯಿತು ಎಂದು ವಿವರಿಸಿ... ಉದಾಹರಣೆಗೆ: ವ್ಯಕ್ತಿಯೊಬ್ಬರು ಬಿದ್ದು ಮೊಣಕಾಲಿನಿಂದ ರಕ್ತಸ್ರಾವವಾಗುತ್ತಿದೆ.',
      'hi-IN': 'क्या हुआ बताएं... उदाहरण: एक व्यक्ति गिर गया और उसके घुटने से खून बह रहा है।',
      'te-IN': 'ఏమి జరిగిందో వివరించండి... ఉదాహరణ: ఒక వ్యక్తి కిందపడి మోకాలి నుండి రక్తం కారుతోంది.',
      'ta-IN': 'என்ன நடந்தது என்று விவரிக்கவும்... உதாரணம்: ஒருவர் கீழே விழுந்து முழங்காலில் ரத்தம் வழிகிறது.',
      'ml-IN': 'എന്താണ് സംഭവിച്ചതെന്ന് വിവരിക്കുക... ഉദാഹരണത്തിന്: ഒരാൾ വീണു കാൽമുട്ടിൽ നിന്ന് രക്തസ്രാവമുണ്ട്.',
      'bn-IN': 'কী হয়েছে বর্ণনা করুন... उदाहरण: একজন পড়ে গিয়ে হাঁটু থেকে রক্ত পড়ছে।',
      'mr-IN': 'काय झाले ते सांगा... उदाहरण: एक व्यक्ती पडली आणि गुडघ्यातून रक्त येत आहे.',
      'en-IN': 'Describe what happened... Example: A person fell down and is bleeding from their knee.',
      'auto': 'Describe what happened... Example: A person fell down and is bleeding from their knee.'
    };

    const UI_TRANSLATIONS = {
      'en-IN': {
        describeTitle: "📝 Describe What Happened",
        regionSelectorLabel: "🎯 Visual Body Region Selector (Tap to filter symptoms):",
        regions: { head: "Head / Face", airway: "Airway / Throat", chest: "Chest / Heart", arm: "Arm / Hand", leg: "Leg / Ankle", systemic: "Whole Body" },
        examplesLabel: "Quick Example Prompts (Click to test):",
        clearBtn: "Clear",
        analyzeBtn: "Analyze Problem",
        chips: {
          burns: { label: "🔥 Boiling water on hand", prompt: "My friend accidentally spilled boiling water on his hand." },
          bleeding_knee: { label: "🩸 Deep bleeding knee cut", prompt: "A person fell down and is bleeding heavily from their knee with a deep cut." },
          choking: { label: "🫁 Choking & cannot breathe", prompt: "Child is choking on food, cannot breathe or cough, hands clutched to neck." },
          stroke: { label: "🧠 Face drooping & slurred speech", prompt: "Grandmother has sudden face drooping on one side and slurred speech." },
          chest_pain: { label: "❤️ Crushing chest pain", prompt: "Sudden severe crushing chest pressure radiating into left arm and shortness of breath." },
          ankle_sprain: { label: "🦴 Twisted swollen ankle", prompt: "Tripped on stairs, twisted ankle severely, swollen and cannot put weight." },
          snakebite: { label: "🐍 Snakebite puncture marks", prompt: "Bitten by a snake on foot, two puncture fang marks visible with burning pain." },
          unconscious: { label: "⚡ Unconscious & not breathing", prompt: "Adult person collapsed on the floor, unresponsive and not breathing normally." },
          headache: { label: "🤕 Severe headache", prompt: "Severe throbbing headache in temples and forehead for the past 4 hours." },
          fever: { label: "🌡️ High fever & chills", prompt: "High fever with shivering chills and body aches since yesterday." },
          stomach_pain: { label: "🤢 Stomach pain & acidity", prompt: "Sharp stomach pain, bloating, and burning acidity after dinner." },
          toothache: { label: "🦷 Toothache & swollen gum", prompt: "Terrible throbbing toothache with swollen gums on lower jaw." },
          skin_rash: { label: "🔴 Skin rash & itching", prompt: "Red itchy hives and rash spreading on arms after wearing new sweater." },
          unknown: { label: "❓ Unknown problem test", prompt: "I have an unusual strange purple tingling feeling with random unidentifiable sensations." }
        }
      },
      'kn-IN': {
        describeTitle: "📝 ಏನಾಯಿತು ಎಂದು ವಿವರಿಸಿ",
        regionSelectorLabel: "🎯 ದೇಹದ ಭಾಗದ ಆಯ್ಕೆ (ಲಕ್ಷಣಗಳನ್ನು ಫಿಲ್ಟರ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ):",
        regions: { head: "ತಲೆ / ಮುಖ", airway: "ಉಸಿರಾಟ / ಗಂಟಲು", chest: "ಎದೆ / ಹೃದಯ", arm: "ತೋಳು / ಕೈ", leg: "ಕಾಲು / ಪಾದ", systemic: "ಇಡೀ ದೇಹ" },
        examplesLabel: "ತ್ವರಿತ ಉದಾಹರಣೆಗಳು (ಪರೀಕ್ಷಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ):",
        clearBtn: "ತೆರವುಗೊಳಿಸಿ",
        analyzeBtn: "ಸಮಸ್ಯೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
        chips: {
          burns: { label: "🔥 ಕೈಗೆ ಬಿಸಿ ನೀರು", prompt: "ನನ್ನ ಸ್ನೇಹಿತನ ಕೈಗೆ ಆಕಸ್ಮಿಕವಾಗಿ ಬಿಸಿ ನೀರು ಚೆಲ್ಲಿತು." },
          bleeding_knee: { label: "🩸 ಮೊಣಕಾಲಿನಿಂದ ರಕ್ತಸ್ರಾವ", prompt: "ವ್ಯಕ್ತಿಯೊಬ್ಬರು ಕೆಳಗೆ ಬಿದ್ದು ಮೊಣಕಾಲಿನ ಆಳವಾದ ಗಾಯದಿಂದ ರಕ್ತಸ್ರಾವವಾಗುತ್ತಿದೆ." },
          choking: { label: "🫁 ಉಸಿರುಗಟ್ಟುವಿಕೆ / ಅನ್ನ ಸಿಲುಕಿದೆ", prompt: "ಮಗುವಿಗೆ ಆಹಾರ ಗಂಟಲಿನಲ್ಲಿ ಸಿಲುಕಿ ಉಸಿರಾಡಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ, ಕೆಮ್ಮಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ." },
          stroke: { label: "🧠 ಮುಖ ಬಾಗುವುದು, ತೊದಲು ಮಾತು", prompt: "ಅಜ್ಜಿಯ ಮುಖದ ಒಂದು ಬದಿ ಬಾಗಿದೆ ಮತ್ತು ಮಾತು ತೊದಲುತ್ತಿದೆ." },
          chest_pain: { label: "❤️ ಎದೆಯಲ್ಲಿ ತೀವ್ರ ನೋವು", prompt: "ಎದೆಯಲ್ಲಿ ತೀವ್ರವಾದ ಭಾರ, ಎಡಗೈಗೆ ಹರಡುವ ನೋವು ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ." },
          ankle_sprain: { label: "🦴 ಕಾಲು ಉಳುಕು ಮತ್ತು ಊತ", prompt: "ಮೆಟ್ಟಿಲಿನಿಂದ ಜಾರಿ ಕಾಲು ಉಳುಕಿದೆ, ಊತ ಬಂದಿದೆ ಮತ್ತು ಪಾದ ಇಡಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ." },
          snakebite: { label: "🐍 ಹಾವಿನ ಕಡಿತದ ಗುರುತುಗಳು", prompt: "ಕಾಲಿಗೆ ಹಾವು ಕಚ್ಚಿದೆ, ಎರಡು ಹಲ್ಲಿನ ಗುರುತುಗಳು ಮತ್ತು ತೀವ್ರ ಉರಿ ಕಾಣಿಸುತ್ತಿದೆ." },
          unconscious: { label: "⚡ ಪ್ರಜ್ಞಾಹೀನ ಮತ್ತು ಉಸಿರಾಟವಿಲ್ಲ", prompt: "ವ್ಯಕ್ತಿ ನೆಲದ ಮೇಲೆ ಪ್ರಜ್ಞೆ ತಪ್ಪಿ ಬಿದ್ದಿದ್ದಾರೆ ಮತ್ತು ಸರಿಯಾಗಿ ಉಸಿರಾಡುತ್ತಿಲ್ಲ." },
          headache: { label: "🤕 ತೀವ್ರ ತಲೆನೋವು", prompt: "ಕಳೆದ 4 ಗಂಟೆಗಳಿಂದ ಹಣೆಯಲ್ಲಿ ತೀವ್ರವಾಗಿ ಸಿಡಿಯುವ ತಲೆನೋವು ಇದೆ." },
          fever: { label: "🌡️ ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಚಳಿ", prompt: "ನಿನ್ನೆಯಿಂದ ನಡುಕ, ಚಳಿ ಮತ್ತು ತೀವ್ರ ಮೈ ಕೈ ನೋವಿನೊಂದಿಗೆ ಜ್ವರ ಇದೆ." },
          stomach_pain: { label: "🤢 ಹೊಟ್ಟೆ ನೋವು ಮತ್ತು ಅಸಿಡಿಟಿ", prompt: "ಊಟದ ನಂತರ ಹೊಟ್ಟೆಯಲ್ಲಿ ಚುಚ್ಚುವ ನೋವು, ಉಬ್ಬರ ಮತ್ತು ತೀವ್ರ ಅಸಿಡಿಟಿ." },
          toothache: { label: "🦷 ಹಲ್ಲು ನೋವು ಮತ್ತು ವಸಡು ಊತ", prompt: "ಕೆಳಗಿನ ದವಡೆಯ ವಸಡು ಊದಿಕೊಂಡು ತೀವ್ರ ಹಲ್ಲು ನೋವು ಕಾಣಿಸಿಕೊಂಡಿದೆ." },
          skin_rash: { label: "🔴 ಚರ್ಮದ ದದ್ದು ಮತ್ತು ತುರಿಕೆ", prompt: "ತೋಳುಗಳ ಮೇಲೆ ಕೆಂಪು ದದ್ದುಗಳು ಮತ್ತು ತೀವ್ರ ತುರಿಕೆ ಹರಡುತ್ತಿದೆ." },
          unknown: { label: "❓ ಅಪರಿಚಿತ ಸಮಸ್ಯೆ ಪರೀಕ್ಷೆ", prompt: "ನನಗೆ ಗುರುತಿಸಲಾಗದ ವಿಚಿತ್ರವಾದ ಸಂವೇದನೆಗಳು ಮತ್ತು ಅಸಾಮಾನ್ಯ ನೋವು ಕಾಣಿಸುತ್ತಿದೆ." }
        }
      },
      'hi-IN': {
        describeTitle: "📝 क्या हुआ विस्तार से बताएं",
        regionSelectorLabel: "🎯 शारीरिक अंग चयनकर्ता (लक्षण फिल्टर करने के लिए टैप करें):",
        regions: { head: "सिर / चेहरा", airway: "श्वासनली / गला", chest: "सीना / दिल", arm: "बांह / हाथ", leg: "पैर / टखना", systemic: "पूरा शरीर" },
        examplesLabel: "त्वरित उदाहरण (परीक्षण के लिए क्लिक करें):",
        clearBtn: "साफ करें",
        analyzeBtn: "समस्या का विश्लेषण करें",
        chips: {
          burns: { label: "🔥 हाथ पर गर्म पानी", prompt: "मेरे दोस्त के हाथ पर गलती से उबलता पानी गिर गया।" },
          bleeding_knee: { label: "🩸 घुटने से गहरा खून बहना", prompt: "एक व्यक्ति गिर गया और उसके घुटने के गहरे कट से भारी खून बह रहा है।" },
          choking: { label: "🫁 दम घुटना व सांस रुकना", prompt: "बच्चे के गले में खाना अटक गया है, सांस नहीं आ रही और न खांस पा रहा है।" },
          stroke: { label: "🧠 चेहरा टेढ़ा व आवाज लड़खड़ाना", prompt: "दादी का चेहरा एक तरफ झुक गया है और आवाज लड़खड़ा रही है।" },
          chest_pain: { label: "❤️ सीने में तेज दर्द व दबाव", prompt: "सीने में बहुत तेज दबाव, बाईं बांह में दर्द और सांस फूलना।" },
          ankle_sprain: { label: "🦴 मोच व सूजा हुआ टखना", prompt: "सीढ़ियों से पैर मुड़ गया, टखने में तेज सूजन है और चला नहीं जा रहा।" },
          snakebite: { label: "🐍 सांप के काटने के निशान", prompt: "पैर पर सांप ने काट लिया, दो दांतों के निशान दिख रहे हैं और तेज जलन है।" },
          unconscious: { label: "⚡ बेहोश व सांस बंद", prompt: "व्यक्ति जमीन पर बेहोश पड़ा है, कोई प्रतिक्रिया नहीं और सांस नहीं ले रहा।" },
          headache: { label: "🤕 तेज सिरदर्द", prompt: "पिछले 4 घंटों से माथे और सिर में बहुत तेज धड़कता हुआ सिरदर्द है।" },
          fever: { label: "🌡️ तेज बुखार व कंपकंपी", prompt: "कल से कंपकंपी, ठंड और बदन दर्द के साथ तेज बुखार है।" },
          stomach_pain: { label: "🤢 पेट दर्द व एसिडिटी", prompt: "खाने के बाद पेट में तेज दर्द, भारीपन और जलन वाली एसिडिटी है।" },
          toothache: { label: "🦷 दांत दर्द व मसूड़ों में सूजन", prompt: "निचले जबड़े में मसूड़ों की सूजन के साथ असहनीय दांत दर्द है।" },
          skin_rash: { label: "🔴 त्वचा पर चकत्ते व खुजली", prompt: "हाथों पर लाल चकत्ते और बहुत तेज खुजली फैल रही है।" },
          unknown: { label: "❓ अज्ञात समस्या परीक्षण", prompt: "मुझे अजीब तरह की अनजानी झनझनाहट और अज्ञात बेचैनी महसूस हो रही है।" }
        }
      },
      'te-IN': {
        describeTitle: "📝 ఏమి జరిగిందో వివరించండి",
        regionSelectorLabel: "🎯 శరీర భాగాల ఎంపిక (లక్షణాలను ఫిల్టర్ చేయడానికి):",
        regions: { head: "తల / ముఖం", airway: "శ్వాసనాళం / గొంతు", chest: "ఛాతీ / గుండె", arm: "చేయి / అరచేయి", leg: "కాలు / చీలమండ", systemic: "మొత్తం శరీరం" },
        examplesLabel: "త్వరిత ఉదాహరణలు (పరీక్షించడానికి క్లిక్ చేయండి):",
        clearBtn: "క్లియర్",
        analyzeBtn: "సమస్యను విశ్లేషించండి",
        chips: {
          burns: { label: "🔥 చేతిపై వేడి నీరు", prompt: "నా స్నేహితుడి చేతిపై ప్రమాదవశాత్తూ వేడి నీరు పడింది." },
          bleeding_knee: { label: "🩸 మోకాలి నుంచి రక్తం", prompt: "ఒక వ్యక్తి కిందపడి మోకాలికి లోతైన గాయమై రక్తం కారుతోంది." },
          choking: { label: "🫁 ఊపిరాడటం లేదు", prompt: "పిల్లవాడి గొంతులో ఆహారం ఇరుక్కుంది, ఊపిరి ఆడటం లేదు." },
          stroke: { label: "🧠 ముఖం వంకర & మాట తడబాటు", prompt: "అమ్మమ్మ ముఖం ఒకవైపు వంకరైంది మరియు మాట తడబడుతోంది." },
          chest_pain: { label: "❤️ ఛాతీలో తీవ్ర నొప్పి", prompt: "ఛాతీలో తీవ్రమైన ఒత్తిడి, ఎడమచేతికి పాకుతున్న నొప్పి." },
          ankle_sprain: { label: "🦴 చీలమండ బెణుకు & వాపు", prompt: "మెట్లపై జారిపడి చీలమండ బెణికింది, వాచిపోయింది." },
          snakebite: { label: "🐍 పాము కాటు గుర్తులు", prompt: "కాలిపై పాము కుట్టింది, రెండు కోరల గుర్తులు కనిపిస్తున్నాయి." },
          unconscious: { label: "⚡ స్పృహ తప్పి పడిపోవడం", prompt: "వ్యక్తి నేలపై పడిపోయి అపస్మారక స్థితిలో ఉన్నాడు." },
          headache: { label: "🤕 తీవ్రమైన తలనొప్పి", prompt: "గత 4 గంటలుగా నుదిటిలో తీవ్రమైన నొప్పి వేధిస్తోంది." },
          fever: { label: "🌡️ తీవ్ర జ్వరం & చలి", prompt: "నిన్నటి నుండి వణుకు, చలి మరియు ఒళ్లు నొప్పులతో తీవ్ర జ్వరం ఉంది." },
          stomach_pain: { label: "🤢 కడుపు నొప్పి & అసిడిటీ", prompt: "భోజనం తర్వాత కడుపులో తీవ్రమైన నొప్పి, ఉబ్బరం ఉంది." },
          toothache: { label: "🦷 పంటి నొప్పి & వాపు", prompt: "కింది దవడ చిగుళ్లు వాచి తీవ్రమైన పంటి నొప్పి వస్తోంది." },
          skin_rash: { label: "🔴 చర్మంపై దద్దుర్లు", prompt: "చేతులపై ఎర్రటి దద్దుర్లు మరియు తీవ్రమైన దురద వ్యాపిస్తోంది." },
          unknown: { label: "❓ తెలియని సమస్య పరీక్ష", prompt: "నాకు అర్థంకాని వింతైన తిమ్మిరి మరియు తెలియని అనుభూతులు కలుగుతున్నాయి." }
        }
      },
      'ta-IN': {
        describeTitle: "📝 என்ன நடந்தது என்பதை விவரிக்கவும்",
        regionSelectorLabel: "🎯 உடல் பகுதி தேர்வு (அறிகுறிகளை வடிகட்ட தட்டவும்):",
        regions: { head: "தலை / முகம்", airway: "சுவாசப்பாதை / தொண்டை", chest: "மார்பு / இதயம்", arm: "கை / விரல்கள்", leg: "கால் / கணுக்கால்", systemic: "முழு உடல்" },
        examplesLabel: "மாதிரி குறிப்புகள் (சோதிக்க கிளிக் செய்க):",
        clearBtn: "அழிக்கவும்",
        analyzeBtn: "பகுப்பாய்வு செய்க",
        chips: {
          burns: { label: "🔥 கையில் சுடுநீர்", prompt: "என் நண்பரின் கையில் தவறுதலாக கொதிக்கும் நீர் கொட்டிவிட்டது." },
          bleeding_knee: { label: "🩸 முழங்காலில் இரத்தப்போக்கு", prompt: "ஒருவர் கீழே விழுந்து முழங்காலில் ஆழமான வெட்டு ஏற்பட்டு இரத்தம் கொட்டுகிறது." },
          choking: { label: "🫁 மூச்சுத்திணறல்", prompt: "குழந்தைக்கு தொண்டையில் உணவு சிக்கி மூச்சுத்திணறல் ஏற்பட்டுள்ளது." },
          stroke: { label: "🧠 வாய் கோணுதல், பேச்சு குளறல்", prompt: "பாட்டியின் முகம் ஒருபுறம் கோணலாகி பேச்சு குளறுகிறது." },
          chest_pain: { label: "❤️ கடுமையான மார்பு வலி", prompt: "மார்பில் கடுமையான அழுத்தம், இடது கைக்கு பரவும் வலி." },
          ankle_sprain: { label: "🦴 கணுக்கால் சுளுக்கு & வீக்கம்", prompt: "படியில் இடறி கணுக்கால் சுளுக்கியது, வீங்கிவிட்டது." },
          snakebite: { label: "🐍 பாம்பு கடி அடையாளங்கள்", prompt: "காலில் பாம்பு கடித்துவிட்டது, இரண்டு பல் தடங்கள் தெரிகின்றன." },
          unconscious: { label: "⚡ மயங்கி விழுந்த நிலை", prompt: "ஒருவர் தரையில் மயங்கி விழுந்துவிட்டார், மூச்சுவிடவில்லை." },
          headache: { label: "🤕 கடுமையான தலைவலி", prompt: "கடந்த 4 மணி நேரமாக நெற்றியில் தாங்க முடியாத தலைவலி துடிக்கிறது." },
          fever: { label: "🌡️ அதிக காய்ச்சல் & நடுக்கம்", prompt: "நேற்றிலிருந்து நடுக்கம், குளிர் மற்றும் உடல் வலியுடன் காய்ச்சல்." },
          stomach_pain: { label: "🤢 வயிற்று வலி & நெஞ்செரிச்சல்", prompt: "சாப்பிட்ட பிறகு கடுமையான வயிற்று வலி, உப்புசம்." },
          toothache: { label: "🦷 பல் வலி & ஈறு வீக்கம்", prompt: "கீழ் தாடை ஈறு வீங்கி கடுமையான பல் வலி துடிக்கிறது." },
          skin_rash: { label: "🔴 தோல் தடிப்பு & அரிப்பு", prompt: "கைகளில் சிவந்த தடிப்புகளும் கடுமையான அரிப்பும் பரவுகிறது." },
          unknown: { label: "❓ அறியப்படாத பிரச்சனை", prompt: "எனக்கு விவரிக்க முடியாத விசித்திரமான கூச்சமும் உணர்வுகளும் ஏற்படுகின்றன." }
        }
      },
      'ml-IN': {
        describeTitle: "📝 എന്താണ് സംഭവിച്ചതെന്ന് വിവരിക്കുക",
        regionSelectorLabel: "🎯 ശരീര ഭാഗം തിരഞ്ഞെടുക്കുക:",
        regions: { head: "തല / മുഖം", airway: "ശ്വസനനാളം / തൊണ്ട", chest: "നെഞ്ച് / ഹൃദയം", arm: "കൈ / കൈപ്പത്തി", leg: "കാൽ / കണങ്കാൽ", systemic: "മുഴുവൻ ശരീരം" },
        examplesLabel: "ദ്രുത ഉദാഹരണങ്ങൾ (പരിശോധിക്കാൻ ക്ലിക്കുചെയ്യുക):",
        clearBtn: "മായ്ക്കുക",
        analyzeBtn: "വിശകലനം ചെയ്യുക",
        chips: {
          burns: { label: "🔥 കൈയിൽ ചൂടുവെള്ളം", prompt: "എന്റെ സുഹൃത്തിന്റെ കൈയിൽ അബദ്ധത്തിൽ തിളച്ച വെള്ളം വീണു." },
          bleeding_knee: { label: "🩸 കാൽമുട്ടിൽ നിന്ന് ചോര", prompt: "ഒരാൾ വീണു കാൽമുട്ടിലെ ആഴത്തിലുള്ള മുറിവിൽ നിന്ന് കഠിനമായ രക്തസ്രാവമുണ്ട്." },
          choking: { label: "🫁 ശ്വാസം മുട്ടൽ", prompt: "കുട്ടിയുടെ തൊണ്ടയിൽ ഭക്ഷണം കുടുങ്ങി, ശ്വാസമെടുക്കാൻ കഴിയുന്നില്ല." },
          stroke: { label: "🧠 മുഖം കോടൽ, സംസാരക്കുഴപ്പം", prompt: "മുത്തശ്ശിയുടെ മുഖം ഒരു വശത്തേക്ക് കോടി സംസാരം അവ്യക്തമായി." },
          chest_pain: { label: "❤️ കഠിനമായ നെഞ്ചുവേദന", prompt: "നെഞ്ചിൽ കനത്ത ഭാരം, ഇടതുകൈയിലേക്ക് പടരുന്ന വേദന." },
          ankle_sprain: { label: "🦴 കണങ്കാൽ ഉളുക്കൽ", prompt: "കോണിപ്പടിയിൽ തെന്നി കണങ്കാൽ ഉളുക്കി, വീങ്ങി ഭാരം കൊടുക്കാൻ കഴിയുന്നില്ല." },
          snakebite: { label: "🐍 പാമ്പ് കടിയേറ്റ പാടുകൾ", prompt: "കാലിൽ പാമ്പ് കടിച്ചു, രണ്ട് പല്ലിന്റെ പാടുകൾ കാണാം." },
          unconscious: { label: "⚡ അബോധാവസ്ഥ", prompt: "ഒരാൾ നിലത്തു വീണു ബോധമില്ലാതെ കിടക്കുന്നു." },
          headache: { label: "🤕 കടുത്ത തലവേദന", prompt: "കഴിഞ്ഞ 4 മണിക്കൂറായി നെറ്റിയിലും തലയിലും കഠിനമായ തലവേദനയുണ്ട്." },
          fever: { label: "🌡️ കടുത്ത പനിയും വിറയലും", prompt: "ഇന്നലെ മുതൽ വിറയലും ശരീരവേദനയുമായി കഠിനമായ പനിയുണ്ട്." },
          stomach_pain: { label: "🤢 വയറുവേദനയും അസിഡിറ്റിയും", prompt: "ഭക്ഷണത്തിന് ശേഷം കടുത്ത വയറുവേദനയും വീർപ്പുമുട്ടലും." },
          toothache: { label: "🦷 പല്ലുവേദനയും മോണവീക്കവും", prompt: "താഴത്തെ താടിയെല്ലിലെ മോണ വീങ്ങി കടുത്ത പല്ലുവേദനയുണ്ട്." },
          skin_rash: { label: "🔴 ത്വക്കിലെ തിണർപ്പും ചൊറിച്ചിലും", prompt: "കൈകളിൽ ചുവന്ന തിണർപ്പുകളും കഠിനമായ ചൊറിച്ചിലും പടരുന്നു." },
          unknown: { label: "❓ അപരിചിതമായ പ്രശ്നം", prompt: "എനിക്ക് തിരിച്ചറിയാനാവാത്ത വിചിത്രമായ തരിപ്പും അസ്വസ്ഥതയും അനുഭവപ്പെടുന്നു." }
        }
      },
      'bn-IN': {
        describeTitle: "📝 কী ঘটেছে তা বর্ণনা করুন",
        regionSelectorLabel: "🎯 শরীরের অংশ নির্বাচন করুন:",
        regions: { head: "মাথা / মুখ", airway: "শ্বাসনালী / গলা", chest: "বুক / হৃদপিণ্ড", arm: "বাহু / হাত", leg: "পা / গোড়ালি", systemic: "সমগ্র শরীর" },
        examplesLabel: "দ্রুত উদাহরণ (পরীক্ষা করতে ক্লিক করুন):",
        clearBtn: "মুছুন",
        analyzeBtn: "বিশ্লেষণ করুন",
        chips: {
          burns: { label: "🔥 হাতে গরম জল", prompt: "আমার বন্ধুর হাতে অসাবধানতাবশত ফুটন্ত জল পড়ে গেছে।" },
          bleeding_knee: { label: "🩸 হাঁটু কেটে রক্তপাত", prompt: "একজন ব্যক্তি পড়ে গিয়ে হাঁটুতে গভীর ক্ষত থেকে প্রচণ্ড রক্তপাত হচ্ছে।" },
          choking: { label: "🫁 গলায় খাবার আটকে শ্বাসকষ্ট", prompt: "বাচ্চার গলায় খাবার আটকে গেছে, শ্বাস নিতে পারছে না।" },
          stroke: { label: "🧠 মুখ বেঁকে যাওয়া ও জড়ানো কথা", prompt: "দাদিমার মুখ একদিকে বেঁকে গেছে এবং কথা জড়িয়ে যাচ্ছে।" },
          chest_pain: { label: "❤️ বুকে তীব্র চাপ ও ব্যথা", prompt: "বুকে হঠাৎ তীব্র চাপ, বাঁ বাহুতে ছড়িয়ে পড়া ব্যথা।" },
          ankle_sprain: { label: "🦴 গোড়ালি মচকে ফোলা", prompt: "সিঁড়িতে পা পিছলে গোড়ালি মচকে গেছে, ফুলে গেছে।" },
          snakebite: { label: "🐍 সাপের কামড়ের চিহ্ন", prompt: "পায়ে সাপে কামড়েছে, দুটো দাঁতের দাগ স্পষ্ট।" },
          unconscious: { label: "⚡ অচেতন অবস্থা", prompt: "ব্যক্তি মেঝেতে অজ্ঞান হয়ে পড়ে আছেন, কোনো সাড়া নেই।" },
          headache: { label: "🤕 তীব্র মাথা ব্যথা", prompt: "গত ৪ ঘণ্টা ধরে কপাল ও মাথায় প্রচণ্ড দপদপানি মাথা ব্যথা।" },
          fever: { label: "🌡️ তীব্র জ্বর ও কাঁপুনি", prompt: "গতকাল থেকে কাঁপুনি, ঠান্ডা লাগা এবং শরীর ব্যথাসহ তীব্র জ্বর।" },
          stomach_pain: { label: "🤢 পেট ব্যথা ও অম্বল", prompt: "রাতের খাবারের পর পেটে তীব্র ব্যথা ও ফাঁপা ভাব।" },
          toothache: { label: "🦷 দাঁত ব্যথা ও মাড়ি ফোলা", prompt: "নিচের চোয়ালের মাড়ি ফুলে অসহ্য দাঁত ব্যথা করছে।" },
          skin_rash: { label: "🔴 ত্বকে র‍্যাশ ও চুলকানি", prompt: "হাতে লাল চাকা চাকা র‍্যাশ ও তীব্র চুলকানি।" },
          unknown: { label: "❓ অজানা সমস্যা পরীক্ষা", prompt: "আমার এক অদ্ভুত ধরনের অবর্ণনীয় অনুভূতি ও অস্বস্তি হচ্ছে।" }
        }
      },
      'mr-IN': {
        describeTitle: "📝 काय घडले ते सांगा",
        regionSelectorLabel: "🎯 शरीराचा भाग निवडा (लक्षणे फिल्टर करण्यासाठी):",
        regions: { head: "डोके / चेहरा", airway: "श्वासनलिका / घसा", chest: "छाती / हृदय", arm: "हात / मनगट", leg: "पाय / घोटा", systemic: "संपूर्ण शरीर" },
        examplesLabel: "झटपट उदाहरणे (तपासण्यासाठी क्लिक करा):",
        clearBtn: "साफ करा",
        analyzeBtn: "विश्लेषण करा",
        chips: {
          burns: { label: "🔥 हातावर गरम पाणी", prompt: "माझ्या मित्राच्या हातावर चुकून उकळते पाणी पडले." },
          bleeding_knee: { label: "🩸 गुडघ्यातून रक्तस्त्राव", prompt: "एक व्यक्ती पडली आणि तिच्या गुडघ्याला खोल जखम होऊन खूप रक्त येत आहे." },
          choking: { label: "🫁 घशात अडकले व श्वास बंद", prompt: "लहान मुलाच्या घशात अन्न अडकले आहे, श्वास घेता येत नाही." },
          stroke: { label: "🧠 तोंड वाकडे व अडखळणारी भाषा", prompt: "आजीचे तोंड एका बाजूला वाकडे झाले आहे आणि बोलताना अडखळत आहे." },
          chest_pain: { label: "❤️ छातीत तीव्र दाब व वेदना", prompt: "छातीत प्रचंड दाब, डाव्या हाताकडे पसरणाऱ्या वेदना." },
          ankle_sprain: { label: "🦴 घोटा मुरगळणे व सूज", prompt: "पायऱ्यांवरून पाय मुरगळला, घोट्याला प्रचंड सूज आली आहे." },
          snakebite: { label: "🐍 सापदंशाच्या खुणा", prompt: "पायाला सापाने चावले, दातांचे दोन व्रण दिसत आहेत." },
          unconscious: { label: "⚡ बेशुद्ध पडलेली व्यक्ती", prompt: "एक व्यक्ती जमिनीवर बेशुद्ध पडली आहे, कसलाही प्रतिसाद नाही." },
          headache: { label: "🤕 प्रचंड डोकेदुखी", prompt: "गेल्या ४ तासांपासून कपाळात आणि डोक्यात भयंकर डोकेदुखी होत आहे." },
          fever: { label: "🌡️ तीव्र ताप व थंडी", prompt: "कालपासून थंडी, हुडहुडी आणि अंगदुखीसह तीव्र ताप भरला आहे." },
          stomach_pain: { label: "🤢 पोटदुखी व अॅसिडिटी", prompt: "जेवणानंतर पोटात तीव्र कळा, फुगारा आणि जळजळणारी अॅसिडिटी." },
          toothache: { label: "🦷 दातदुखी व हिरड्यांची सूज", prompt: "खालच्या जबड्यातील हिरडी सुजून भयंकर दातदुखी सुरू आहे." },
          skin_rash: { label: "🔴 अंगावर पुरळ व खाज", prompt: "हातांवर लाल रंगाचे पुरळ आणि तीव्र खाज पसरत आहे." },
          unknown: { label: "❓ अज्ञात समस्या चाचणी", prompt: "मला विचित्र प्रकारची अनपेक्षित मुंग्या आल्यासारखी जाणीव होत आहे." }
        }
      }
    };

    function updateLanguageUI(langCode) {
      const code = langCode || se.settings.selectedLanguage || 'auto';
      const langObj = se.supportedLanguages[code];

      // 1. Update Header Button Label
      if (currentLabel) {
        if (code === 'auto') {
          currentLabel.textContent = 'Language: Auto';
        } else if (langObj) {
          currentLabel.textContent = `Language: ${langObj.nativeName || langObj.name}`;
        }
      }

      // 2. Update Header Dropdown Checks
      menuItems.forEach((item) => {
        const itemCode = item.getAttribute("data-lang");
        const checkSpan = item.querySelector(".lang-check");
        if (itemCode === code) {
          item.classList.add("active");
          if (checkSpan) checkSpan.textContent = '✓';
        } else {
          item.classList.remove("active");
          if (checkSpan) checkSpan.textContent = '';
        }
      });

      // 3. Update Input Toolbar Pills
      pills.forEach((pill) => {
        const pillCode = pill.getAttribute("data-lang");
        if (pillCode === code) {
          pill.classList.add("active");
        } else {
          pill.classList.remove("active");
        }
      });

      // 4. Update Active Tag Badge
      if (activeIndicator) {
        if (code === 'auto') {
          activeIndicator.textContent = '🔄 Auto-Detect';
        } else if (langObj) {
          activeIndicator.textContent = `🇮🇳 ${langObj.nativeName} (${langObj.name})`;
        }
      }

      // 5. Update Settings Dropdown
      if (settingsLangSelect) {
        settingsLangSelect.value = code;
      }

      // 6. Update Textarea Placeholder if empty
      if (problemInput && (!problemInput.value || problemInput.value.trim() === '')) {
        problemInput.placeholder = PLACEHOLDERS[code] || PLACEHOLDERS['auto'];
      }

      // 7. Update Voice Lang Badge in Results Card
      const voiceBadge = document.getElementById("voice-lang-badge");
      if (voiceBadge) {
        const targetCode = code === 'auto' ? 'en-IN' : code;
        const targetObj = se.supportedLanguages[targetCode] || se.supportedLanguages['en-IN'];
        const bestVoice = se.getBestVoice(targetCode, se.settings.gender);
        const genderTag = (bestVoice && bestVoice.isFemale) ? "👩 Female Voice" : "🎙️ Voice";
        voiceBadge.textContent = `${genderTag} (${targetObj.name})`;
      }

      // 8. Update Section Title, Region Selector, Example Chips & Action Buttons
      const targetLangKey = code === 'auto' ? 'en-IN' : code;
      const currentUi = UI_TRANSLATIONS[targetLangKey] || UI_TRANSLATIONS['en-IN'];

      const sectionTitle = document.getElementById("section-describe-title");
      if (sectionTitle) sectionTitle.textContent = currentUi.describeTitle;

      const regionLabel = document.getElementById("region-selector-label");
      if (regionLabel) regionLabel.textContent = currentUi.regionSelectorLabel;

      if (currentUi.regions) {
        const headText = document.getElementById("region-head-text");
        const airwayText = document.getElementById("region-airway-text");
        const chestText = document.getElementById("region-chest-text");
        const armText = document.getElementById("region-arm-text");
        const legText = document.getElementById("region-leg-text");
        const systemicText = document.getElementById("region-systemic-text");
        if (headText) headText.textContent = currentUi.regions.head;
        if (airwayText) airwayText.textContent = currentUi.regions.airway;
        if (chestText) chestText.textContent = currentUi.regions.chest;
        if (armText) armText.textContent = currentUi.regions.arm;
        if (legText) legText.textContent = currentUi.regions.leg;
        if (systemicText) systemicText.textContent = currentUi.regions.systemic;
      }

      const examplesLabel = document.getElementById("example-prompts-label");
      if (examplesLabel) examplesLabel.textContent = currentUi.examplesLabel;

      const clearBtnText = document.getElementById("clear-btn-text");
      if (clearBtnText) clearBtnText.textContent = currentUi.clearBtn;

      const analyzeBtnText = document.getElementById("analyze-btn-text");
      if (analyzeBtnText) analyzeBtnText.textContent = currentUi.analyzeBtn;

      // Update all 14 Example Prompt Chips
      const chips = document.querySelectorAll(".example-chip");
      chips.forEach((chip) => {
        const chipId = chip.getAttribute("data-chip-id");
        if (chipId && currentUi.chips && currentUi.chips[chipId]) {
          chip.textContent = currentUi.chips[chipId].label;
          chip.setAttribute("data-prompt", currentUi.chips[chipId].prompt);
        }
      });
    }

    // Toggle Dropdown
    if (toggleBtn && dropdownContainer) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dropdownContainer.classList.contains("open");
        dropdownContainer.classList.toggle("open", !isOpen);
        toggleBtn.setAttribute("aria-expanded", String(!isOpen));
      });
    }

    // Close Dropdown on Click Outside
    document.addEventListener("click", (e) => {
      if (dropdownContainer && dropdownContainer.classList.contains("open")) {
        if (!dropdownContainer.contains(e.target)) {
          dropdownContainer.classList.remove("open");
          if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
        }
      }
    });

    // Dropdown Item Click
    menuItems.forEach((item) => {
      item.addEventListener("click", () => {
        const langCode = item.getAttribute("data-lang");
        se.setLanguage(langCode);
        if (dropdownContainer) dropdownContainer.classList.remove("open");
        if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
      });
    });

    // Input Toolbar Pill Click
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const langCode = pill.getAttribute("data-lang");
        se.setLanguage(langCode);
      });
    });

    // Settings Dropdown Change
    if (settingsLangSelect) {
      settingsLangSelect.addEventListener("change", (e) => {
        se.setLanguage(e.target.value);
      });
    }

    // Voice Card "Change Language" Button
    if (voiceChangeBtn) {
      voiceChangeBtn.addEventListener("click", () => {
        if (dropdownContainer) {
          dropdownContainer.classList.add("open");
          if (toggleBtn) {
            toggleBtn.setAttribute("aria-expanded", "true");
            toggleBtn.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      });
    }

    // Listen to custom event from SpeechEngine
    window.addEventListener("firstaid-language-changed", (e) => {
      updateLanguageUI(e.detail ? e.detail.langCode : null);
    });

    // Initial sync
    updateLanguageUI(se.settings.selectedLanguage || 'auto');
  }
  initLanguageSelector();

  // Global Doctor Consultation Modal Controllers (Requirement 3 & 6)
  window.openDoctorConsultModal = () => {
    const modal = document.getElementById("doctor-consult-modal");
    if (modal) {
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  };

  window.closeDoctorConsultModal = () => {
    const modal = document.getElementById("doctor-consult-modal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  };

  const doctorModal = document.getElementById("doctor-consult-modal");
  if (doctorModal) {
    doctorModal.addEventListener("click", (e) => {
      if (e.target === doctorModal) {
        window.closeDoctorConsultModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.closeDoctorConsultModal();
    }
  });
});

