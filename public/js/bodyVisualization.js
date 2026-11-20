/**
 * FirstAid+ Interactive Human Body Visualization Engine
 * High-performance, holographic medical anatomical model (Front & Back views).
 * Real-time symptom mapping, interactive 3D orbital drag, organ-specific pulsing,
 * systemic fever/fatigue auras, and bidirectional synchronization with FirstAid+ triage.
 */

(function () {
  'use strict';

  // Comprehensive symptom-to-anatomy mapping dictionary
  const SYMPTOM_MAP = [
    {
      id: 'heart',
      name: 'Chest & Heart (Cardiac)',
      label: 'HEART / CHEST',
      keywords: ['heart', 'chest', 'chest pain', 'angina', 'palpitation', 'heartbeat', 'crushing chest', 'cardiac', 'myocardial', 'heart attack'],
      frontZones: ['zone-heart', 'zone-chest'],
      backZones: ['zone-back-upper'],
      view: 'front',
      color: '#ef4444',
      pulseType: 'cardiac'
    },
    {
      id: 'lungs',
      name: 'Lungs & Respiratory Airway',
      label: 'LUNGS / AIRWAY',
      keywords: ['breath', 'breathing', 'lung', 'lungs', 'shortness of breath', 'asthma', 'wheeze', 'wheezing', 'suffocating', 'choking', 'airway', 'gasping', 'cant breathe', "cannot breathe"],
      frontZones: ['zone-lungs', 'zone-throat'],
      backZones: ['zone-back-upper'],
      view: 'front',
      color: '#06b6d4',
      pulseType: 'respiratory'
    },
    {
      id: 'head',
      name: 'Head & Cranium (Neurological)',
      label: 'HEAD / CRANIUM',
      keywords: ['head', 'headache', 'migraine', 'forehead', 'temple', 'temples', 'dizzy', 'dizziness', 'vertigo', 'concussion', 'head trauma', 'slurred speech', 'face drooping', 'stroke', 'brain', 'scalp'],
      frontZones: ['zone-head', 'zone-eyes'],
      backZones: ['zone-head-back'],
      view: 'front',
      color: '#f59e0b',
      pulseType: 'neural'
    },
    {
      id: 'eyes',
      name: 'Eyes & Optical Region',
      label: 'EYES / VISION',
      keywords: ['eye', 'eyes', 'vision', 'blurred vision', 'double vision', 'cornea', 'eye pain', 'pupil', 'eyeball'],
      frontZones: ['zone-eyes'],
      backZones: [],
      view: 'front',
      color: '#38bdf8',
      pulseType: 'focus'
    },
    {
      id: 'jaw',
      name: 'Jaw & Dental / Oral Region',
      label: 'JAW / TEETH',
      keywords: ['tooth', 'teeth', 'toothache', 'jaw', 'gum', 'gums', 'mouth', 'dental', 'tongue', 'tooth ake'],
      frontZones: ['zone-jaw'],
      backZones: [],
      view: 'front',
      color: '#ec4899',
      pulseType: 'focal'
    },
    {
      id: 'throat',
      name: 'Throat & Cervical Neck',
      label: 'NECK / THROAT',
      keywords: ['throat', 'sore throat', 'swallow', 'swallowing', 'neck', 'vocal', 'pharynx', 'larynx', 'tonsil', 'choking on food'],
      frontZones: ['zone-throat'],
      backZones: ['zone-neck-back'],
      view: 'front',
      color: '#a855f7',
      pulseType: 'focal'
    },
    {
      id: 'stomach',
      name: 'Abdomen & Digestive System',
      label: 'STOMACH / ABDOMEN',
      keywords: ['stomach', 'abdomen', 'abdominal', 'belly', 'gut', 'acidity', 'gastritis', 'nausea', 'vomit', 'vomiting', 'diarrhea', 'indigestion', 'bloating', 'food poisoning', 'colic', 'stomac', 'belly pain'],
      frontZones: ['zone-stomach'],
      backZones: ['zone-back-lower'],
      view: 'front',
      color: '#f97316',
      pulseType: 'visceral'
    },
    {
      id: 'back',
      name: 'Spine & Dorsal Back',
      label: 'SPINE / BACK',
      keywords: ['back', 'back pain', 'spine', 'spinal', 'lower back', 'lumbago', 'slip disc', 'vertebra', 'lumbar', 'sciatica', 'mid back', 'upper back'],
      frontZones: [],
      backZones: ['zone-spine', 'zone-back-upper', 'zone-back-lower'],
      view: 'back',
      color: '#e11d48',
      pulseType: 'focal'
    },
    {
      id: 'kidneys',
      name: 'Kidneys & Renal Flank',
      label: 'KIDNEYS / FLANK',
      keywords: ['kidney', 'kidneys', 'renal', 'flank', 'flank pain'],
      frontZones: [],
      backZones: ['zone-back-lower'],
      view: 'back',
      color: '#9333ea',
      pulseType: 'focal'
    },
    {
      id: 'shoulders',
      name: 'Shoulders & Clavicle',
      label: 'SHOULDERS',
      keywords: ['shoulder', 'shoulders', 'rotator cuff', 'collarbone', 'clavicle', 'deltoid'],
      frontZones: ['zone-shoulder-left', 'zone-shoulder-right'],
      backZones: ['zone-shoulders-back'],
      view: 'front',
      color: '#3b82f6',
      pulseType: 'focal'
    },
    {
      id: 'hands',
      name: 'Hands, Wrists & Fingers',
      label: 'HANDS / WRISTS',
      keywords: ['hand', 'hands', 'finger', 'fingers', 'thumb', 'wrist', 'wrists', 'palm', 'boiling water on hand', 'cut on hand', 'burned hand'],
      frontZones: ['zone-hand-left', 'zone-hand-right'],
      backZones: ['zone-hands-back'],
      view: 'front',
      color: '#ef4444',
      pulseType: 'focal'
    },
    {
      id: 'arms',
      name: 'Arms & Forearms',
      label: 'ARMS / FOREARMS',
      keywords: ['arm', 'arms', 'elbow', 'elbows', 'bicep', 'forearm', 'radiating into left arm', 'radiating to left arm', 'left arm'],
      frontZones: ['zone-arm-left', 'zone-arm-right'],
      backZones: ['zone-arms-back'],
      view: 'front',
      color: '#f43f5e',
      pulseType: 'focal'
    },
    {
      id: 'knees',
      name: 'Knees & Patella',
      label: 'KNEES / JOINTS',
      keywords: ['knee', 'knees', 'patella', 'meniscus', 'ligament', 'knee cut', 'bleeding knee', 'deep cut on knee', 'fell down and is bleeding from their knee'],
      frontZones: ['zone-knee-left', 'zone-knee-right'],
      backZones: ['zone-knees-back'],
      view: 'front',
      color: '#ef4444',
      pulseType: 'focal'
    },
    {
      id: 'ankles',
      name: 'Ankles & Achilles',
      label: 'ANKLES / SPRAIN',
      keywords: ['ankle', 'ankles', 'sprain', 'twisted ankle', 'twisted foot', 'ankle pain', 'swollen ankle', 'cannot put weight'],
      frontZones: ['zone-ankle-left', 'zone-ankle-right'],
      backZones: ['zone-heels-back'],
      view: 'front',
      color: '#f97316',
      pulseType: 'focal'
    },
    {
      id: 'feet',
      name: 'Feet & Toes',
      label: 'FEET / TOES',
      keywords: ['foot', 'feet', 'toe', 'toes', 'heel', 'snakebite on foot', 'sole', 'punctured foot', 'bitten by a snake on foot'],
      frontZones: ['zone-foot-left', 'zone-foot-right'],
      backZones: ['zone-heels-back'],
      view: 'front',
      color: '#ef4444',
      pulseType: 'focal'
    },
    {
      id: 'legs',
      name: 'Legs, Thighs & Calves',
      label: 'LEGS / CALVES',
      keywords: ['leg', 'legs', 'thigh', 'thighs', 'calf', 'calves', 'shin', 'shins', 'muscle cramp in calf', 'cramp in right calf', 'hamstring'],
      frontZones: ['zone-thigh-left', 'zone-thigh-right', 'zone-calf-left', 'zone-calf-right'],
      backZones: ['zone-hamstrings-back', 'zone-calves-back'],
      view: 'front',
      color: '#eab308',
      pulseType: 'focal'
    },
    {
      id: 'skin',
      name: 'Dermatological / Skin Surface',
      label: 'SKIN / RASH',
      keywords: ['rash', 'skin', 'itching', 'hives', 'eczema', 'allergy', 'dermatitis', 'red itchy', 'blister', 'burn', 'scald', 'red itchy hives'],
      frontZones: ['zone-skin-front'],
      backZones: ['zone-skin-back'],
      view: 'front',
      color: '#f43f5e',
      pulseType: 'surface'
    },
    {
      id: 'systemic',
      name: 'Whole Body Systemic State',
      label: 'WHOLE BODY (SYSTEMIC)',
      keywords: ['fever', 'weakness', 'fatigue', 'chills', 'shivering', 'body pain', 'body ache', 'viral', 'unwell', 'dehydration', 'exhaustion', 'fainting', 'faint', 'malaise', 'lethargy', 'pale', 'high fever', 'flu'],
      frontZones: ['zone-aura-front'],
      backZones: ['zone-aura-back'],
      view: 'front',
      color: '#fbbf24',
      pulseType: 'aura'
    }
  ];

  class BodyVisualizationController {
    constructor() {
      this.container = document.getElementById('interactive-body-container');
      this.modelWrapper = document.getElementById('body-model-3d-wrapper');
      this.hudStatusLabel = document.getElementById('body-hud-status-label');
      this.hudOrganName = document.getElementById('body-hud-organ-name');
      this.hudViewToggle = document.getElementById('body-view-toggle-btn');
      this.hudRotateToggle = document.getElementById('body-rotate-toggle-btn');
      this.hudResetBtn = document.getElementById('body-reset-btn');
      this.tooltip = document.getElementById('body-hover-tooltip');

      this.currentView = 'front'; // 'front' or 'back'
      this.isAutoRotating = true;
      this.rotationAngle = 0;
      this.dragStartX = 0;
      this.isDragging = false;
      this.activeTargets = new Set();
      this.systemicActive = false;
      this.systemicType = null; // 'fever', 'fatigue', 'general'

      this.animFrameId = null;

      if (!this.container) return;

      this.init();
    }

    init() {
      this.bindControls();
      this.bindDragInteraction();
      this.bindZoneInteractions();
      this.bindSymptomInputListener();
      this.startIdleAnimation();

      // Listen for when intro animation completes
      window.addEventListener('firstaid-intro-complete', () => {
        this.container.classList.add('ready-visible');
      });

      // Also ensure it is visible if user visits directly or intro finishes
      setTimeout(() => {
        if (this.container) this.container.classList.add('ready-visible');
      }, 5200);
    }

    bindControls() {
      // Toggle Front / Back View
      if (this.hudViewToggle) {
        this.hudViewToggle.addEventListener('click', () => {
          this.switchView(this.currentView === 'front' ? 'back' : 'front');
        });
      }

      // Toggle Auto-Rotation
      if (this.hudRotateToggle) {
        this.hudRotateToggle.addEventListener('click', () => {
          this.isAutoRotating = !this.isAutoRotating;
          this.hudRotateToggle.classList.toggle('active', this.isAutoRotating);
          this.hudRotateToggle.querySelector('span').textContent = this.isAutoRotating ? 'Auto-Rotate: ON' : 'Auto-Rotate: OFF';
        });
      }

      // Reset Button
      if (this.hudResetBtn) {
        this.hudResetBtn.addEventListener('click', () => {
          this.resetVisualization();
        });
      }
    }

    bindDragInteraction() {
      if (!this.modelWrapper) return;

      const onStart = (clientX) => {
        this.isDragging = true;
        this.dragStartX = clientX;
        this.modelWrapper.style.cursor = 'grabbing';
      };

      const onMove = (clientX) => {
        if (!this.isDragging) return;
        const deltaX = clientX - this.dragStartX;
        this.rotationAngle += deltaX * 0.45;
        // Clamp rotation between -60deg and +60deg for natural inspection
        this.rotationAngle = Math.max(-60, Math.min(60, this.rotationAngle));
        this.dragStartX = clientX;
        this.update3DTransform();
      };

      const onEnd = () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.modelWrapper.style.cursor = 'grab';
        }
      };

      // Mouse events
      this.modelWrapper.addEventListener('mousedown', (e) => onStart(e.clientX));
      window.addEventListener('mousemove', (e) => onMove(e.clientX));
      window.addEventListener('mouseup', onEnd);

      // Touch events
      this.modelWrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) onStart(e.touches[0].clientX);
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (this.isDragging && e.touches.length === 1) {
          onMove(e.touches[0].clientX);
        }
      }, { passive: true });

      window.addEventListener('touchend', onEnd);
    }

    bindZoneInteractions() {
      const allZones = this.container.querySelectorAll('.anatomy-zone');
      allZones.forEach((zone) => {
        zone.addEventListener('mouseenter', (e) => {
          const organName = zone.getAttribute('data-organ-name') || 'Anatomical Region';
          this.showTooltip(organName, e.clientX, e.clientY);
        });

        zone.addEventListener('mousemove', (e) => {
          this.moveTooltip(e.clientX, e.clientY);
        });

        zone.addEventListener('mouseleave', () => {
          this.hideTooltip();
        });

        zone.addEventListener('click', () => {
          const targetId = zone.getAttribute('data-target-id');
          const organName = zone.getAttribute('data-organ-name');
          if (targetId) {
            this.handleZoneClick(targetId, organName);
          }
        });
      });
    }

    bindSymptomInputListener() {
      const textarea = document.getElementById('problem-description-input');
      if (textarea) {
        // Real-time debounced symptom analysis as user types
        let debounceTimer = null;
        textarea.addEventListener('input', () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            this.scanAndHighlightSymptoms(textarea.value);
          }, 180);
        });
      }

      // Example prompt chips
      const chips = document.querySelectorAll('.example-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          const prompt = chip.getAttribute('data-prompt') || '';
          setTimeout(() => this.scanAndHighlightSymptoms(prompt), 50);
        });
      });

      // Clear button
      const clearBtn = document.getElementById('clear-text-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.resetVisualization();
        });
      }
    }

    startIdleAnimation() {
      let t = 0;
      const loop = () => {
        if (this.isAutoRotating && !this.isDragging) {
          t += 0.018;
          // Gentle sinusoidal swaying between -18deg and +18deg
          this.rotationAngle = Math.sin(t) * 16;
          this.update3DTransform();
        }
        this.animFrameId = requestAnimationFrame(loop);
      };
      this.animFrameId = requestAnimationFrame(loop);
    }

    update3DTransform() {
      if (!this.modelWrapper) return;
      const isBack = this.currentView === 'back';
      const baseRotation = isBack ? 180 : 0;
      const totalY = baseRotation + this.rotationAngle;
      this.modelWrapper.style.transform = `perspective(850px) rotateY(${totalY}deg)`;
    }

    switchView(viewName) {
      this.currentView = viewName;
      if (this.hudViewToggle) {
        this.hudViewToggle.querySelector('span').textContent = viewName === 'front' ? 'View: Front' : 'View: Back';
      }
      const frontSvg = document.getElementById('svg-anatomy-front');
      const backSvg = document.getElementById('svg-anatomy-back');
      if (frontSvg && backSvg) {
        if (viewName === 'front') {
          frontSvg.style.display = 'block';
          backSvg.style.display = 'none';
        } else {
          frontSvg.style.display = 'none';
          backSvg.style.display = 'block';
        }
      }
      this.update3DTransform();
    }

    /**
     * Core Symptom Matcher: Evaluates raw text description against anatomical models
     */
    scanAndHighlightSymptoms(text) {
      if (!text || text.trim().length === 0) {
        this.resetVisualization();
        return;
      }

      const lower = text.toLowerCase();
      const matchedTargets = [];

      for (const item of SYMPTOM_MAP) {
        let matched = false;
        for (const kw of item.keywords) {
          if (lower.includes(kw)) {
            matched = true;
            break;
          }
        }
        if (matched) {
          matchedTargets.push(item);
        }
      }

      if (matchedTargets.length === 0) {
        this.clearActiveHighlights();
        this.setHudStatus('SCANNING ACTIVE', 'No specific organ localized');
        return;
      }

      this.applyHighlights(matchedTargets);
    }

    applyHighlights(matchedTargets) {
      this.clearActiveHighlights();

      let targetLabels = [];
      let shouldSwitchBack = false;
      let shouldSwitchFront = false;

      matchedTargets.forEach(target => {
        this.activeTargets.add(target.id);
        targetLabels.push(target.label);

        // Highlight matching front SVG zones
        target.frontZones.forEach(zoneClass => {
          const els = this.container.querySelectorAll(`.${zoneClass}`);
          els.forEach(el => {
            el.classList.add('highlighted-zone', `pulse-${target.pulseType}`);
            el.style.setProperty('--zone-glow-color', target.color);
          });
        });

        // Highlight matching back SVG zones
        target.backZones.forEach(zoneClass => {
          const els = this.container.querySelectorAll(`.${zoneClass}`);
          els.forEach(el => {
            el.classList.add('highlighted-zone', `pulse-${target.pulseType}`);
            el.style.setProperty('--zone-glow-color', target.color);
          });
        });

        if (target.view === 'back') shouldSwitchBack = true;
        if (target.view === 'front') shouldSwitchFront = true;

        // Whole body systemic aura trigger
        if (target.id === 'systemic') {
          this.activateSystemicAura('fever');
        }
      });

      // Intelligent View Switching: if symptom is primarily on back (e.g. spine/back/kidneys) and user is on front, prompt or switch!
      if (shouldSwitchBack && !shouldSwitchFront && this.currentView !== 'back') {
        this.switchView('back');
      } else if (shouldSwitchFront && this.currentView === 'back' && !shouldSwitchBack) {
        this.switchView('front');
      }

      // Update HUD Labels
      const primaryTarget = matchedTargets[0];
      const combinedLabel = targetLabels.slice(0, 3).join(' • ');
      this.setHudStatus(`TARGET: ${combinedLabel}`, primaryTarget.name);
    }

    activateSystemicAura(type = 'fever') {
      this.systemicActive = true;
      this.systemicType = type;
      const frontAura = document.getElementById('body-systemic-aura-front');
      const backAura = document.getElementById('body-systemic-aura-back');

      if (frontAura) frontAura.classList.add('active-aura', `aura-${type}`);
      if (backAura) backAura.classList.add('active-aura', `aura-${type}`);
    }

    clearActiveHighlights() {
      this.activeTargets.clear();
      this.systemicActive = false;
      this.systemicType = null;

      const allHighlighted = this.container.querySelectorAll('.highlighted-zone');
      allHighlighted.forEach(el => {
        el.className = el.className.baseVal 
          ? el.className.baseVal.replace(/highlighted-zone|pulse-[a-z]+/g, '').trim()
          : el.className.replace(/highlighted-zone|pulse-[a-z]+/g, '').trim();
      });

      const auras = this.container.querySelectorAll('.body-systemic-aura');
      auras.forEach(aura => {
        aura.className = 'body-systemic-aura';
      });
    }

    resetVisualization() {
      this.clearActiveHighlights();
      this.rotationAngle = 0;
      this.switchView('front');
      this.setHudStatus('IDLE MONITORING', 'All Systems Normal');
      this.update3DTransform();
    }

    setHudStatus(statusTag, organDetails) {
      if (this.hudStatusLabel) {
        this.hudStatusLabel.textContent = statusTag;
      }
      if (this.hudOrganName) {
        this.hudOrganName.textContent = organDetails;
      }
    }

    handleZoneClick(targetId, organName) {
      const match = SYMPTOM_MAP.find(m => m.id === targetId);
      if (!match) return;

      this.applyHighlights([match]);

      // Populate input if user wants guidance on clicked area
      const textarea = document.getElementById('problem-description-input');
      const charCounter = document.getElementById('char-counter');
      if (textarea && textarea.value.trim().length === 0) {
        const examplePrompt = `Acute pain and discomfort in ${organName.toLowerCase()}. Need first aid assistance.`;
        textarea.value = examplePrompt;
        if (charCounter) charCounter.textContent = `${examplePrompt.length} characters`;
        textarea.focus();
      }
    }

    showTooltip(text, x, y) {
      if (!this.tooltip) return;
      this.tooltip.textContent = text;
      this.tooltip.style.display = 'block';
      this.moveTooltip(x, y);
    }

    moveTooltip(x, y) {
      if (!this.tooltip) return;
      const rect = this.container.getBoundingClientRect();
      const relX = x - rect.left + 14;
      const relY = y - rect.top - 28;
      this.tooltip.style.left = `${relX}px`;
      this.tooltip.style.top = `${relY}px`;
    }

    hideTooltip() {
      if (this.tooltip) {
        this.tooltip.style.display = 'none';
      }
    }
  }

  // Initialize immediately on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.bodyVisualization = new BodyVisualizationController();
    });
  } else {
    window.bodyVisualization = new BodyVisualizationController();
  }
})();
