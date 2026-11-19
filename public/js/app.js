/**
 * FirstAid+ Main Application Coordinator
 * Handles top-level routing, guides library, settings, and global helpers
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Global text-to-speech helpers
  window.speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
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
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">No first aid guides match your search.</div>`;
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
      head: "Grandmother has sudden face drooping on one side and slurred speech.",
      airway: "Child is choking on food, cannot breathe or cough, hands clutched to neck.",
      chest: "Sudden severe crushing chest pressure radiating into left arm and shortness of breath.",
      arm: "My friend accidentally spilled boiling water on his hand and wrist.",
      leg: "Tripped on stairs, twisted ankle severely, swollen and cannot put weight.",
      systemic: "Person having violent shaking, jerking convulsions, foaming at the mouth."
    };
    if (input && presets[region]) {
      input.value = presets[region];
      if (counter) counter.textContent = `${presets[region].length} characters`;
      input.focus();
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
});

