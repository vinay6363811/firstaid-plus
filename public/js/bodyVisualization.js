/**
 * FirstAid+ Interactive Human Body Visualization Engine
 * High-performance, holographic medical anatomical model (Front & Back views).
 * Real-time symptom mapping, interactive 3D orbital drag, organ-specific blinking & pulsing,
 * systemic fever/fatigue auras, and bidirectional synchronization with FirstAid+ triage.
 */

(function () {
  'use strict';

  // Comprehensive symptom-to-anatomy mapping dictionary
  const SYMPTOM_MAP = [
    {
      id: 'heart',
      name: 'Chest & Heart (Cardiac Focus)',
      label: 'HEART / CHEST',
      keywords: ['heart', 'chest', 'chest pain', 'angina', 'palpitation', 'palpitations', 'heartbeat', 'crushing chest', 'cardiac', 'myocardial', 'heart attack', 'chest pressure', 'tightness in chest'],
      frontZones: ['zone-heart', 'zone-lungs'],
      backZones: ['zone-back-upper'],
      view: 'front',
      color: '#ef4444',
      pulseType: 'cardiac'
    },
    {
      id: 'lungs',
      name: 'Lungs & Respiratory Airway',
      label: 'LUNGS / AIRWAY',
      keywords: ['breath', 'breathing', 'lung', 'lungs', 'shortness of breath', 'asthma', 'wheeze', 'wheezing', 'suffocating', 'choking', 'airway', 'gasping', 'cant breathe', 'cannot breathe', 'cough', 'coughing'],
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
      keywords: ['head', 'headache', 'migraine', 'forehead', 'temple', 'temples', 'dizzy', 'dizziness', 'vertigo', 'concussion', 'head trauma', 'slurred speech', 'face drooping', 'stroke', 'brain', 'scalp', 'head ache'],
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
      keywords: ['tooth', 'teeth', 'toothache', 'jaw', 'gum', 'gums', 'mouth', 'dental', 'tongue', 'tooth ake', 'tooth ache'],
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
      keywords: ['throat', 'sore throat', 'swallow', 'swallowing', 'neck', 'vocal', 'pharynx', 'larynx', 'tonsil', 'choking on food', 'clutched to neck'],
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
      keywords: ['stomach', 'abdomen', 'abdominal', 'belly', 'gut', 'acidity', 'gastritis', 'nausea', 'vomit', 'vomiting', 'diarrhea', 'indigestion', 'bloating', 'food poisoning', 'colic', 'stomac', 'belly pain', 'stomach ache', 'stomach pain'],
      frontZones: ['zone-stomach', 'zone-pelvis'],
      backZones: ['zone-back-lower'],
      view: 'front',
      color: '#f97316',
      pulseType: 'visceral'
    },
    {
      id: 'back',
      name: 'Spine & Dorsal Back',
      label: 'SPINE / BACK',
      keywords: ['back', 'back pain', 'spine', 'spinal', 'lower back', 'lumbago', 'slip disc', 'vertebra', 'lumbar', 'sciatica', 'mid back', 'upper back', 'spine/back'],
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
      keywords: ['ankle', 'ankles', 'sprain', 'sprained', 'twisted ankle', 'twisted foot', 'ankle pain', 'swollen ankle', 'cannot put weight', 'twist'],
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
      keywords: ['fever', 'weakness', 'fatigue', 'chills', 'shivering', 'body pain', 'body ache', 'viral', 'unwell', 'dehydration', 'exhaustion', 'fainting', 'faint', 'malaise', 'lethargy', 'pale', 'high fever', 'flu', 'temperature'],
      frontZones: [],
      backZones: [],
      view: 'front',
      color: '#fbbf24',
      pulseType: 'aura'
    }
  ];

  const SYSTEM_ASSOCIATIONS = {
    heart: 'cardiovascular',
    lungs: 'respiratory',
    throat: 'respiratory',
    head: 'nervous',
    eyes: 'nervous',
    jaw: 'skeletal',
    back: 'skeletal',
    kidneys: 'cardiovascular',
    shoulders: 'muscular',
    hands: 'muscular',
    arms: 'muscular',
    knees: 'skeletal',
    ankles: 'skeletal',
    feet: 'skeletal',
    legs: 'muscular',
    skin: 'lymphatic',
    systemic: 'lymphatic'
  };

  const SYSTEM_NAMES = {
    all: 'Real Human Body (Natural Skin & Anatomy)',
    cardiovascular: 'Cardiovascular System (Heart & Arterial Network)',
    respiratory: 'Respiratory System (Airways, Lungs & Bronchi)',
    skeletal: 'Skeletal Framework (Bones, Joints & Cranium)',
    nervous: 'Nervous System (Brain, Spinal Cord & Peripheral Nerves)',
    muscular: 'Muscular System (Striated Muscle Anatomy)',
    lymphatic: 'Lymphatic & Immune Network (Lymph Nodes & Vessels)'
  };

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
      this.currentSystem = 'all'; // 'all', 'cardiovascular', 'respiratory', 'skeletal', 'nervous', 'muscular', 'lymphatic'
      this.isAutoRotating = true;
      this.rotationAngle = 0;
      this.targetRotationAngle = 0;
      this.pitchAngle = 0;
      this.targetPitchAngle = 0;
      this.zoomLevel = 1.0;
      this.targetZoomLevel = 1.0;
      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.lastDragX = 0;
      this.lastDragY = 0;
      this.velocityX = 0;
      this.velocityY = 0;
      this.initialPinchDist = null;
      this.activeTargets = new Set();
      this.systemicActive = false;
      this.systemicType = null;

      // Cache 3D HUD & control elements
      this.hudOrbitAngle = document.getElementById('hud-orbit-angle');
      this.hudTiltAngle = document.getElementById('hud-tilt-angle');
      this.hudZoomLevel = document.getElementById('hud-zoom-level');
      this.pedestalCompass = document.querySelector('.pedestal-compass-ticks');
      this.zoomInBtn = document.getElementById('body-zoom-in-btn');
      this.zoomOutBtn = document.getElementById('body-zoom-out-btn');
      this.hudStageStopBtn = document.getElementById('hud-stage-stop-rotate-btn');
      this.frontSvg = document.getElementById('svg-anatomy-front');
      this.backSvg = document.getElementById('svg-anatomy-back');
      this.anglePresetChips = document.querySelectorAll('.preset-angle-chip');

      this.animFrameId = null;

      if (!this.container) return;

      this.init();
    }

    init() {
      this.bindControls();
      this.bindSystemSelector();
      this.bindDragInteraction();
      this.bindZoneInteractions();
      this.bindSymptomInputListener();
      this.updateRotationButtonUI();
      this.startIdleAnimation();

      // Listen for when intro animation completes
      window.addEventListener('firstaid-intro-complete', () => {
        this.container.classList.add('ready-visible');
        this.checkInitialInput();
      });

      // Also ensure it is visible if user visits directly or intro finishes
      setTimeout(() => {
        if (this.container) {
          this.container.classList.add('ready-visible');
          this.checkInitialInput();
        }
      }, 5200);
    }

    checkInitialInput() {
      const textarea = document.getElementById('problem-description-input');
      if (textarea && textarea.value.trim().length > 0) {
        this.scanAndHighlightSymptoms(textarea.value);
      }
    }

    bindControls() {
      // Toggle Front / Back View (180° Flip)
      if (this.hudViewToggle) {
        this.hudViewToggle.addEventListener('click', () => {
          const isBack = this.currentView === 'back';
          this.rotateToAngle(isBack ? 0 : 180);
        });
      }

      // Stop / Start 3D Rotation (Toolbar Button)
      if (this.hudRotateToggle) {
        this.hudRotateToggle.addEventListener('click', () => {
          this.toggleRotation();
        });
      }

      // Stop / Start 3D Rotation (Floating Stage HUD Button)
      if (this.hudStageStopBtn) {
        this.hudStageStopBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleRotation();
        });
      }

      // Zoom Controls
      if (this.zoomInBtn) {
        this.zoomInBtn.addEventListener('click', () => this.zoom(0.15));
      }
      if (this.zoomOutBtn) {
        this.zoomOutBtn.addEventListener('click', () => this.zoom(-0.15));
      }

      // Reset 3D Camera & Highlights Button
      if (this.hudResetBtn) {
        this.hudResetBtn.addEventListener('click', () => {
          this.resetVisualization();
        });
      }

      // 3D Angle Preset Chips
      const presetChips = document.querySelectorAll('.preset-angle-chip');
      presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const angle = parseInt(chip.getAttribute('data-angle'), 10);
          if (!isNaN(angle)) {
            this.rotateToAngle(angle);
            // Stop continuous spinning so the user can study chosen angle
            this.stopRotation();
          }
        });
      });
    }

    toggleRotation() {
      if (this.isAutoRotating) {
        this.stopRotation();
      } else {
        this.startRotation();
      }
    }

    stopRotation() {
      this.isAutoRotating = false;
      this.targetRotationAngle = this.rotationAngle;
      this.updateRotationButtonUI();
    }

    startRotation() {
      this.isAutoRotating = true;
      this.updateRotationButtonUI();
    }

    updateRotationButtonUI() {
      if (this.hudRotateToggle) {
        this.hudRotateToggle.classList.toggle('active', this.isAutoRotating);
        this.hudRotateToggle.classList.toggle('btn-stop-active', this.isAutoRotating);
        this.hudRotateToggle.title = this.isAutoRotating ? 'Stop continuous 3D rotation' : 'Start continuous 3D rotation';
        const span = this.hudRotateToggle.querySelector('span');
        if (span) {
          span.textContent = this.isAutoRotating ? '⏹ Stop 3D Rotation' : '▶ Rotate 3D';
        }
        const iconSvg = this.hudRotateToggle.querySelector('svg');
        if (iconSvg) {
          if (this.isAutoRotating) {
            iconSvg.innerHTML = '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>';
          } else {
            iconSvg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>';
          }
        }
      }

      if (this.hudStageStopBtn) {
        this.hudStageStopBtn.classList.toggle('is-stopped', !this.isAutoRotating);
        this.hudStageStopBtn.textContent = this.isAutoRotating ? '⏹ Stop Rotation' : '▶ Rotate 3D';
        this.hudStageStopBtn.title = this.isAutoRotating ? 'Stop continuous 3D rotation' : 'Resume continuous 3D rotation';
      }
    }

    bindSystemSelector() {
      if (!this.container) return;
      const buttons = this.container.querySelectorAll('.system-tab-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const sysId = btn.getAttribute('data-system');
          if (sysId) {
            this.setSystem(sysId);
          }
        });
      });
    }

    setSystem(systemId, updateHud = true) {
      if (!systemId) systemId = 'all';
      this.currentSystem = systemId;

      // Update toolbar button states
      if (this.container) {
        const buttons = this.container.querySelectorAll('.system-tab-btn');
        buttons.forEach(btn => {
          const isTarget = btn.getAttribute('data-system') === systemId;
          btn.classList.toggle('active', isTarget);
        });
      }

      // Update active system on front & back SVGs
      const frontSvg = document.getElementById('svg-anatomy-front');
      const backSvg = document.getElementById('svg-anatomy-back');
      if (frontSvg) frontSvg.setAttribute('data-active-system', systemId);
      if (backSvg) backSvg.setAttribute('data-active-system', systemId);

      // Update HUD status label if idle
      if (updateHud && this.hudStatusLabel && this.hudOrganName) {
        const readableName = SYSTEM_NAMES[systemId] || 'System Active';
        if (this.activeTargets.size === 0) {
          this.setHudStatus(
            systemId === 'all' ? 'ALL SYSTEMS NORMAL' : `SYSTEM: ${systemId.toUpperCase()}`,
            readableName,
            false
          );
        }
      }
    }

    bindDragInteraction() {
      const stageWrapper = this.container ? this.container.querySelector('.body-stage-wrapper') : null;
      const targetArea = stageWrapper || this.modelWrapper;
      if (!targetArea) return;

      const onStart = (clientX, clientY) => {
        this.isDragging = true;
        this.dragStartX = clientX;
        this.dragStartY = clientY;
        this.lastDragX = clientX;
        this.lastDragY = clientY;
        this.velocityX = 0;
        this.velocityY = 0;
        if (this.modelWrapper) this.modelWrapper.style.cursor = 'grabbing';
      };

      const onMove = (clientX, clientY) => {
        if (!this.isDragging) return;
        const deltaX = clientX - this.lastDragX;
        const deltaY = clientY - this.lastDragY;
        this.velocityX = deltaX;
        this.velocityY = deltaY;
        this.lastDragX = clientX;
        this.lastDragY = clientY;

        // Smooth horizontal orbit
        this.targetRotationAngle += deltaX * 0.55;

        // Vertical perspective tilt (clamped between -18° and +22°)
        this.targetPitchAngle = Math.max(-18, Math.min(22, this.targetPitchAngle - deltaY * 0.35));
      };

      const onEnd = () => {
        if (this.isDragging) {
          this.isDragging = false;
          if (this.modelWrapper) this.modelWrapper.style.cursor = 'grab';
          // Inertial release drift
          if (Math.abs(this.velocityX) > 2) {
            this.targetRotationAngle += this.velocityX * 1.5;
          }
        }
        this.initialPinchDist = null;
      };

      // Mouse drag events on stage
      targetArea.addEventListener('mousedown', (e) => {
        // Only trigger drag on main mouse button and not on interactive buttons
        if (e.button !== 0 || e.target.closest('button')) return;
        onStart(e.clientX, e.clientY);
      });
      window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
      window.addEventListener('mouseup', onEnd);

      // Touch drag and pinch events
      targetArea.addEventListener('touchstart', (e) => {
        if (e.target.closest('button')) return;
        if (e.touches.length === 1) {
          onStart(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2) {
          this.initialPinchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && this.isDragging) {
          onMove(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2 && this.initialPinchDist) {
          const currentDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const pinchDelta = (currentDist - this.initialPinchDist) * 0.005;
          this.zoom(pinchDelta);
          this.initialPinchDist = currentDist;
        }
      }, { passive: true });

      window.addEventListener('touchend', onEnd);

      // Mouse wheel zoom
      targetArea.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomStep = e.deltaY < 0 ? 0.08 : -0.08;
        this.zoom(zoomStep);
      }, { passive: false });

      // Double-click to reset zoom & tilt to neutral
      targetArea.addEventListener('dblclick', (e) => {
        if (e.target.closest('button')) return;
        this.targetPitchAngle = 0;
        this.targetZoomLevel = 1.0;
      });
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

        zone.addEventListener('click', (e) => {
          e.stopPropagation();
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
      const chatInput = document.getElementById('chat-user-input');
      const contextInput = document.getElementById('preview-context-input');

      const triggerScan = (val) => {
        this.scanAndHighlightSymptoms(val);
      };

      if (textarea) {
        ['input', 'keyup', 'change', 'paste'].forEach(evt => {
          textarea.addEventListener(evt, () => {
            setTimeout(() => triggerScan(textarea.value), 30);
          });
        });
      }

      if (chatInput) {
        ['input', 'keyup', 'change', 'paste'].forEach(evt => {
          chatInput.addEventListener(evt, () => {
            setTimeout(() => triggerScan(chatInput.value), 30);
          });
        });
      }

      if (contextInput) {
        ['input', 'keyup', 'change', 'paste'].forEach(evt => {
          contextInput.addEventListener(evt, () => {
            setTimeout(() => triggerScan(contextInput.value), 30);
          });
        });
      }

      // Example prompt chips
      const chips = document.querySelectorAll('.example-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          const prompt = chip.getAttribute('data-prompt') || '';
          setTimeout(() => triggerScan(prompt), 50);
        });
      });

      // Quick zone locator chips
      const quickChips = document.querySelectorAll('.quick-zone-chip');
      quickChips.forEach(qChip => {
        qChip.addEventListener('click', () => {
          const text = qChip.textContent || '';
          setTimeout(() => triggerScan(text), 50);
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
      const lerp = (start, end, factor) => start + (end - start) * factor;

      const loop = () => {
        // Continuous smooth 360° orbital rotation when active and not dragging
        if (this.isAutoRotating && !this.isDragging) {
          this.targetRotationAngle += 0.42;
        }

        // 60 FPS smooth interpolation
        this.rotationAngle = lerp(this.rotationAngle, this.targetRotationAngle, 0.16);
        this.pitchAngle = lerp(this.pitchAngle, this.targetPitchAngle, 0.16);
        this.zoomLevel = lerp(this.zoomLevel, this.targetZoomLevel, 0.16);

        this.update3DTransform();
        this.animFrameId = requestAnimationFrame(loop);
      };
      this.animFrameId = requestAnimationFrame(loop);
    }

    update3DTransform() {
      if (!this.modelWrapper) return;

      // 1. Apply true 3D perspective transformation
      this.modelWrapper.style.transform = `scale(${this.zoomLevel.toFixed(3)}) rotateX(${this.pitchAngle.toFixed(2)}deg) rotateY(${this.rotationAngle.toFixed(2)}deg)`;

      // 2. Normalized angle in range [0, 359]
      const normalizedAngle = ((Math.round(this.rotationAngle) % 360) + 360) % 360;

      // 3. Current aspect hemisphere (Anterior vs Posterior)
      const isBack = normalizedAngle >= 90 && normalizedAngle <= 270;
      this.currentView = isBack ? 'back' : 'front';

      // 4. Manage active pointer-events so organ zones can be hovered & clicked on the facing side
      const frontSvg = this.frontSvg || document.getElementById('svg-anatomy-front');
      const backSvg = this.backSvg || document.getElementById('svg-anatomy-back');
      if (frontSvg) frontSvg.style.pointerEvents = isBack ? 'none' : 'auto';
      if (backSvg) backSvg.style.pointerEvents = isBack ? 'auto' : 'none';

      // 5. Update pedestal compass ring rotation in sync with model
      const pedestalCompass = this.pedestalCompass || document.querySelector('.pedestal-compass-ticks');
      if (pedestalCompass) {
        pedestalCompass.style.transform = `rotateZ(${(-this.rotationAngle).toFixed(2)}deg)`;
      }

      // 6. Anatomical perspective classification
      let aspectName = 'Anterior (Front)';
      if (normalizedAngle >= 315 || normalizedAngle < 45) {
        aspectName = 'Anterior (Front)';
      } else if (normalizedAngle >= 45 && normalizedAngle < 135) {
        aspectName = 'Right Lateral Profile';
      } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
        aspectName = 'Posterior (Back)';
      } else {
        aspectName = 'Left Lateral Profile';
      }

      // 7. Update HUD Badges
      const hudOrbit = this.hudOrbitAngle || document.getElementById('hud-orbit-angle');
      if (hudOrbit) {
        hudOrbit.textContent = `3D ANGLE: ${normalizedAngle}° (${aspectName})`;
      }

      const hudTilt = this.hudTiltAngle || document.getElementById('hud-tilt-angle');
      if (hudTilt) {
        hudTilt.textContent = `TILT: ${Math.round(this.pitchAngle)}°`;
      }

      const hudZoom = this.hudZoomLevel || document.getElementById('hud-zoom-level');
      if (hudZoom) {
        hudZoom.textContent = `ZOOM: ${Math.round(this.zoomLevel * 100)}%`;
      }

      // 8. Update View Flip Button Label
      if (this.hudViewToggle) {
        const span = this.hudViewToggle.querySelector('span');
        if (span) {
          span.textContent = isBack ? 'View: Back' : 'View: Front';
        }
      }

      // 9. Update Preset Chips
      const chips = this.anglePresetChips || document.querySelectorAll('.preset-angle-chip');
      chips.forEach(chip => {
        const chipAngle = parseInt(chip.getAttribute('data-angle'), 10);
        let diff = Math.abs(normalizedAngle - chipAngle);
        if (diff > 180) diff = 360 - diff;
        chip.classList.toggle('active', diff < 45);
      });
    }

    getNearestAngle(targetBase) {
      const current = this.targetRotationAngle;
      const currentNorm = ((current % 360) + 360) % 360;
      let diff = targetBase - currentNorm;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      return current + diff;
    }

    rotateToAngle(targetBase) {
      this.targetRotationAngle = this.getNearestAngle(targetBase);
    }

    zoom(delta) {
      this.targetZoomLevel = Math.max(0.75, Math.min(1.65, this.targetZoomLevel + delta));
    }

    switchView(viewName) {
      this.currentView = viewName;
      if (viewName === 'front') {
        this.rotateToAngle(0);
      } else {
        this.rotateToAngle(180);
      }
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
            el.classList.add('highlighted-zone', 'blinking-zone', `pulse-${target.pulseType}`);
            el.style.setProperty('--zone-glow-color', target.color);
          });
        });

        // Highlight matching back SVG zones
        target.backZones.forEach(zoneClass => {
          const els = this.container.querySelectorAll(`.${zoneClass}`);
          els.forEach(el => {
            el.classList.add('highlighted-zone', 'blinking-zone', `pulse-${target.pulseType}`);
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

      // Intelligent View Switching: if symptom is primarily on back and user is on front, switch!
      if (shouldSwitchBack && !shouldSwitchFront && this.currentView !== 'back') {
        this.switchView('back');
      } else if (shouldSwitchFront && this.currentView === 'back' && !shouldSwitchBack) {
        this.switchView('front');
      }

      // Automatically isolate and illuminate corresponding anatomical system
      const primaryTarget = matchedTargets[0];
      const mappedSystem = matchedTargets.reduce((sys, t) => sys || SYSTEM_ASSOCIATIONS[t.id], null);
      if (mappedSystem) {
        this.setSystem(mappedSystem, false);
      }

      // Mark symptom active to hide background picture during diagnosis (Problem 2 fix)
      const frontSvg = document.getElementById('svg-anatomy-front');
      const backSvg = document.getElementById('svg-anatomy-back');
      if (frontSvg) frontSvg.setAttribute('data-symptom-active', 'true');
      if (backSvg) backSvg.setAttribute('data-symptom-active', 'true');

      // Update HUD Labels
      const combinedLabel = targetLabels.slice(0, 3).join(' • ');
      this.setHudStatus(`⚡ BLINKING: ${combinedLabel}`, primaryTarget.name, true);
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

      // Restore background picture visibility when no symptoms are active
      const frontSvg = document.getElementById('svg-anatomy-front');
      const backSvg = document.getElementById('svg-anatomy-back');
      if (frontSvg) frontSvg.setAttribute('data-symptom-active', 'false');
      if (backSvg) backSvg.setAttribute('data-symptom-active', 'false');

      // Safe DOM class removal on SVG elements (Never direct assignment to read-only className)
      const allHighlighted = this.container.querySelectorAll('.highlighted-zone, .blinking-zone');
      allHighlighted.forEach(el => {
        el.classList.remove(
          'highlighted-zone',
          'blinking-zone',
          'pulse-cardiac',
          'pulse-respiratory',
          'pulse-focal',
          'pulse-focus',
          'pulse-neural',
          'pulse-visceral',
          'pulse-surface',
          'pulse-aura'
        );
      });

      const auras = this.container.querySelectorAll('.body-systemic-aura');
      auras.forEach(aura => {
        aura.classList.remove('active-aura', 'aura-fever', 'aura-fatigue', 'aura-general');
      });
    }

    resetVisualization() {
      this.clearActiveHighlights();
      this.targetRotationAngle = this.getNearestAngle(0);
      this.targetPitchAngle = 0;
      this.targetZoomLevel = 1.0;
      this.currentView = 'front';
      this.setSystem('all');
      this.setHudStatus('IDLE MONITORING', 'All Systems Normal', false);
    }

    setHudStatus(statusTag, organDetails, isBlinking = false) {
      if (this.hudStatusLabel) {
        this.hudStatusLabel.textContent = statusTag;
        this.hudStatusLabel.classList.toggle('blinking-status', isBlinking);
      }
      if (this.hudOrganName) {
        this.hudOrganName.textContent = organDetails;
      }
    }

    handleZoneClick(targetId, organName) {
      const match = SYMPTOM_MAP.find(m => m.id === targetId);
      if (!match) return;

      // Stop continuous spinning so the user can inspect the selected organ
      this.stopRotation();
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

  window.setAnatomicalSystem = function (sysId) {
    if (window.bodyVisualization) {
      window.bodyVisualization.setSystem(sysId);
    }
  };
})();
