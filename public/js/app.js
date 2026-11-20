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

