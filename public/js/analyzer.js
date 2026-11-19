/**
 * FirstAid+ Smart First Aid Analyzer Controller
 * Coordinates text problem description, photo drag-and-drop/camera capture,
 * laser scanning animation, result presentation, and voice guidance.
 */

class SmartAnalyzerController {
  constructor() {
    this.selectedImageData = null;
    this.selectedImageMime = "image/jpeg";
    this.selectedImageFilename = "";
    this.currentAnalysisResult = null;
    this.isSpeaking = false;
    this.speechUtterance = null;
    this.videoStream = null;

    // DOM Elements - Tabs
    this.tabTextBtn = document.getElementById("tab-text-btn");
    this.tabPhotoBtn = document.getElementById("tab-photo-btn");
    this.tabChatBtn = document.getElementById("tab-chat-btn");
    this.tabTextContent = document.getElementById("tab-text-content");
    this.tabPhotoContent = document.getElementById("tab-photo-content");
    this.tabChatContent = document.getElementById("tab-chat-content");

    // DOM Elements - Text Analyzer
    this.problemTextarea = document.getElementById("problem-description-input");
    this.analyzeTextBtn = document.getElementById("analyze-text-btn");
    this.clearTextBtn = document.getElementById("clear-text-btn");
    this.charCounter = document.getElementById("char-counter");
    this.exampleChips = document.querySelectorAll(".example-chip");

    // DOM Elements - Photo Analyzer
    this.dropzone = document.getElementById("photo-dropzone");
    this.fileInput = document.getElementById("photo-file-input");
    this.uploadBtn = document.getElementById("upload-photo-btn");
    this.cameraBtn = document.getElementById("camera-capture-btn");
    this.previewCard = document.getElementById("image-preview-card");
    this.scannerFrame = document.getElementById("scanner-frame");
    this.previewImg = document.getElementById("preview-img");
    this.previewFileName = document.getElementById("preview-file-name");
    this.previewFileSpecs = document.getElementById("preview-file-specs");
    this.previewContextInput = document.getElementById("preview-context-input");
    this.removeImageBtn = document.getElementById("remove-image-btn");
    this.analyzeImageBtn = document.getElementById("analyze-image-btn");
    this.progressBar = document.getElementById("upload-progress-bar");
    this.progressFill = document.getElementById("upload-progress-fill");

    // Loading & Status Overlay
    this.statusBox = document.getElementById("analyzer-status-box");
    this.stepText = document.getElementById("analyzer-step-text");

    // Results View
    this.inputSection = document.getElementById("analyzer-input-section");
    this.resultsView = document.getElementById("analyzer-results-view");
    this.analyzeAnotherBtn = document.getElementById("analyze-another-btn");
    this.backToAnalyzerBtn = document.getElementById("back-to-analyzer-btn");
    this.resultsStartGuideBtn = document.getElementById("results-start-guide-btn");

    // Voice Guidance Elements
    this.voicePlayBtn = document.getElementById("voice-play-btn");
    this.voicePauseBtn = document.getElementById("voice-pause-btn");
    this.voiceStopBtn = document.getElementById("voice-stop-btn");
    this.voiceWave = document.getElementById("voice-wave-anim");

    // Camera Modal Elements
    this.cameraModal = document.getElementById("camera-modal");
    this.cameraVideo = document.getElementById("camera-video");
    this.cameraShutterBtn = document.getElementById("camera-shutter-btn");
    this.cameraCloseBtn = document.getElementById("camera-close-btn");

    this.bindEvents();
    this.initSampleImages();
  }

  bindEvents() {
    // Tab switching
    if (this.tabTextBtn) this.tabTextBtn.addEventListener("click", () => this.switchTab("text"));
    if (this.tabPhotoBtn) this.tabPhotoBtn.addEventListener("click", () => this.switchTab("photo"));
    if (this.tabChatBtn) this.tabChatBtn.addEventListener("click", () => this.switchTab("chat"));

    // Text Problem Events
    if (this.problemTextarea) {
      this.problemTextarea.addEventListener("input", () => {
        const len = this.problemTextarea.value.length;
        if (this.charCounter) this.charCounter.textContent = `${len} characters`;
      });
    }

    if (this.clearTextBtn) {
      this.clearTextBtn.addEventListener("click", () => {
        if (this.problemTextarea) {
          this.problemTextarea.value = "";
          if (this.charCounter) this.charCounter.textContent = "0 characters";
          this.problemTextarea.focus();
        }
      });
    }

    if (this.analyzeTextBtn) {
      this.analyzeTextBtn.addEventListener("click", () => this.analyzeTextProblem());
    }

    // Example Prompt Chips
    this.exampleChips.forEach(chip => {
      chip.addEventListener("click", () => {
        const prompt = chip.getAttribute("data-prompt");
        if (this.problemTextarea && prompt) {
          this.problemTextarea.value = prompt;
          const len = prompt.length;
          if (this.charCounter) this.charCounter.textContent = `${len} characters`;
          this.problemTextarea.focus();
        }
      });
    });

    // Photo Upload & Dropzone Events
    if (this.uploadBtn && this.fileInput) {
      this.uploadBtn.addEventListener("click", () => this.fileInput.click());
    }

    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (file) this.handleSelectedFile(file);
      });
    }

    if (this.dropzone) {
      this.dropzone.addEventListener("click", (e) => {
        if (e.target !== this.uploadBtn && e.target !== this.cameraBtn) {
          if (this.fileInput) this.fileInput.click();
        }
      });

      this.dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        this.dropzone.classList.add("dragover");
      });

      this.dropzone.addEventListener("dragleave", () => {
        this.dropzone.classList.remove("dragover");
      });

      this.dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        this.dropzone.classList.remove("dragover");
        const file = e.dataTransfer?.files?.[0];
        if (file) this.handleSelectedFile(file);
      });
    }

    // Camera capture
    if (this.cameraBtn) {
      this.cameraBtn.addEventListener("click", () => this.openCameraModal());
    }

    if (this.cameraShutterBtn) {
      this.cameraShutterBtn.addEventListener("click", () => this.capturePhotoFromCamera());
    }

    if (this.cameraCloseBtn) {
      this.cameraCloseBtn.addEventListener("click", () => this.closeCameraModal());
    }

    // Remove / Change Image
    if (this.removeImageBtn) {
      this.removeImageBtn.addEventListener("click", () => this.clearSelectedImage());
    }

    // Analyze Image Button
    if (this.analyzeImageBtn) {
      this.analyzeImageBtn.addEventListener("click", () => this.analyzePhotograph());
    }

    // Results Navigation
    if (this.analyzeAnotherBtn) {
      this.analyzeAnotherBtn.addEventListener("click", () => this.showInputSection());
    }
    if (this.backToAnalyzerBtn) {
      this.backToAnalyzerBtn.addEventListener("click", () => this.showInputSection());
    }

    // Start Step Guide
    if (this.resultsStartGuideBtn) {
      this.resultsStartGuideBtn.addEventListener("click", () => {
        if (this.currentAnalysisResult) {
          window.stepGuide.startGuide(
            this.currentAnalysisResult.possibleEmergency,
            this.currentAnalysisResult.immediateFirstAid
          );
        }
      });
    }

    // Voice Guidance Controls
    if (this.voicePlayBtn) this.voicePlayBtn.addEventListener("click", () => this.playVoiceGuidance());
    if (this.voicePauseBtn) this.voicePauseBtn.addEventListener("click", () => this.pauseVoiceGuidance());
    if (this.voiceStopBtn) this.voiceStopBtn.addEventListener("click", () => this.stopVoiceGuidance());
  }

  initSampleImages() {
    const container = document.getElementById("sample-images-grid");
    if (!container || !window.SAMPLE_IMAGES) return;

    container.innerHTML = "";
    window.SAMPLE_IMAGES.forEach(sample => {
      const card = document.createElement("div");
      card.className = "sample-card";
      card.title = `Click to load: ${sample.name}`;
      card.innerHTML = `
        <img class="sample-thumbnail" src="${sample.dataUrl}" alt="${sample.name}">
        <div class="sample-title">${sample.name}</div>
      `;

      card.addEventListener("click", () => {
        this.selectedImageData = sample.dataUrl;
        this.selectedImageMime = sample.mimeType;
        this.selectedImageFilename = sample.filename;

        this.showImagePreview({
          name: sample.filename,
          size: 42000,
          type: sample.mimeType,
          dataUrl: sample.dataUrl,
          context: sample.context
        });
      });

      container.appendChild(card);
    });
  }

  switchTab(tabName) {
    [this.tabTextBtn, this.tabPhotoBtn, this.tabChatBtn].forEach(btn => btn?.classList.remove("active"));
    [this.tabTextContent, this.tabPhotoContent, this.tabChatContent].forEach(c => c?.classList.remove("active"));

    if (tabName === "text") {
      this.tabTextBtn?.classList.add("active");
      this.tabTextContent?.classList.add("active");
    } else if (tabName === "photo") {
      this.tabPhotoBtn?.classList.add("active");
      this.tabPhotoContent?.classList.add("active");
    } else if (tabName === "chat") {
      this.tabChatBtn?.classList.add("active");
      this.tabChatContent?.classList.add("active");
    }
  }

  handleSelectedFile(file) {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert("Please upload a valid image file (JPG, JPEG, PNG, or WEBP).");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("Image file size exceeds 20MB. Please select a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.selectedImageData = dataUrl;
      this.selectedImageMime = file.type;
      this.selectedImageFilename = file.name;

      this.showImagePreview({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: dataUrl,
        context: ""
      });
    };
    reader.readAsDataURL(file);
  }

  showImagePreview(fileInfo) {
    if (this.previewImg) this.previewImg.src = fileInfo.dataUrl;
    if (this.previewFileName) this.previewFileName.textContent = fileInfo.name;
    
    const sizeKb = Math.round(fileInfo.size / 1024);
    if (this.previewFileSpecs) {
      this.previewFileSpecs.textContent = `Format: ${fileInfo.type.replace("image/", "").toUpperCase()} • Size: ${sizeKb} KB`;
    }

    if (this.previewContextInput && fileInfo.context) {
      this.previewContextInput.value = fileInfo.context;
    }

    if (this.previewCard) this.previewCard.classList.add("active");
    if (this.dropzone) this.dropzone.style.display = "none";
  }

  clearSelectedImage() {
    this.selectedImageData = null;
    this.selectedImageFilename = "";
    if (this.fileInput) this.fileInput.value = "";
    if (this.previewCard) this.previewCard.classList.remove("active");
    if (this.dropzone) this.dropzone.style.display = "block";
    if (this.previewContextInput) this.previewContextInput.value = "";
  }

  // --- Camera Capture Modal Methods ---
  async openCameraModal() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera API is not supported on this browser or origin. Please use the file upload option.");
      return;
    }

    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      if (this.cameraVideo) {
        this.cameraVideo.srcObject = this.videoStream;
        this.cameraVideo.play();
      }

      if (this.cameraModal) this.cameraModal.classList.add("active");
    } catch (err) {
      console.error("Camera access failed", err);
      alert("Unable to access camera: " + err.message + ". You can still upload photos from your device.");
    }
  }

  capturePhotoFromCamera() {
    if (!this.cameraVideo || !this.videoStream) return;

    const canvas = document.createElement("canvas");
    canvas.width = this.cameraVideo.videoWidth || 640;
    canvas.height = this.cameraVideo.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.cameraVideo, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    this.selectedImageData = dataUrl;
    this.selectedImageMime = "image/jpeg";
    this.selectedImageFilename = `camera_capture_${Date.now()}.jpg`;

    this.closeCameraModal();

    this.showImagePreview({
      name: this.selectedImageFilename,
      size: Math.round(dataUrl.length * 0.75),
      type: "image/jpeg",
      dataUrl: dataUrl,
      context: "Captured directly via device camera"
    });
  }

  closeCameraModal() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    if (this.cameraModal) this.cameraModal.classList.remove("active");
  }

  // --- Text Analysis ---
  async analyzeTextProblem() {
    const text = this.problemTextarea?.value?.trim();
    if (!text) {
      alert("Please describe the medical problem first.");
      this.problemTextarea?.focus();
      return;
    }

    this.showStatus(true, "Analyzing problem description with emergency triage protocols...");
    if (this.analyzeTextBtn) this.analyzeTextBtn.disabled = true;

    try {
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text })
      });

      const result = await response.json();
      this.showStatus(false);
      if (this.analyzeTextBtn) this.analyzeTextBtn.disabled = false;

      if (result.error) {
        alert("Analysis error: " + result.error);
        return;
      }

      this.renderResults(result);
    } catch (err) {
      this.showStatus(false);
      if (this.analyzeTextBtn) this.analyzeTextBtn.disabled = false;
      alert("Server communication error: " + err.message);
    }
  }

  // --- Photo Analysis with Animated Scanner Beam (Requirement 8) ---
  async analyzePhotograph() {
    if (!this.selectedImageData) {
      alert("Please upload or select an injury photo first.");
      return;
    }

    const context = this.previewContextInput?.value?.trim() || "";

    // Activate laser scan beam on preview frame
    if (this.scannerFrame) this.scannerFrame.classList.add("scanning");
    if (this.progressBar) this.progressBar.classList.add("active");
    if (this.progressFill) this.progressFill.style.width = "40%";

    this.showStatus(true, "Inspecting observable image features and skin patterns...");
    if (this.analyzeImageBtn) this.analyzeImageBtn.disabled = true;

    // Simulate progress stages
    setTimeout(() => {
      if (this.progressFill) this.progressFill.style.width = "75%";
      if (this.stepText) this.stepText.textContent = "Correlating visible cues with FirstAid+ emergency protocols...";
    }, 600);

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: this.selectedImageData,
          mimeType: this.selectedImageMime,
          filename: this.selectedImageFilename,
          description: context
        })
      });

      const result = await response.json();

      if (this.progressFill) this.progressFill.style.width = "100%";
      setTimeout(() => {
        if (this.scannerFrame) this.scannerFrame.classList.remove("scanning");
        if (this.progressBar) this.progressBar.classList.remove("active");
        this.showStatus(false);
        if (this.analyzeImageBtn) this.analyzeImageBtn.disabled = false;

        if (result.error) {
          alert("Photo analysis error: " + result.error);
          return;
        }

        this.renderResults(result, true);
      }, 500);

    } catch (err) {
      if (this.scannerFrame) this.scannerFrame.classList.remove("scanning");
      if (this.progressBar) this.progressBar.classList.remove("active");
      this.showStatus(false);
      if (this.analyzeImageBtn) this.analyzeImageBtn.disabled = false;
      alert("Server communication error: " + err.message);
    }
  }

  showStatus(show, message = "") {
    if (this.statusBox) {
      if (show) {
        this.statusBox.classList.add("active");
        if (this.stepText) this.stepText.textContent = message;
      } else {
        this.statusBox.classList.remove("active");
      }
    }
  }

  // --- Dynamic Pictorial Diagram Selector for Emergency Protocols ---
  getPictorialDiagram(result) {
    const text = ((result.possibleEmergency || "") + " " + (result.whatHappened || "") + " " + (result.id || "")).toLowerCase();
    if (text.includes("burn") || text.includes("scald") || text.includes("blister") || text.includes("fire")) {
      return { url: "assets/diagrams/burns-action.svg", alt: "Thermal Burn Tap Water Protocol Diagram" };
    }
    if (text.includes("bleed") || text.includes("cut") || text.includes("wound") || text.includes("lacerat") || text.includes("arter")) {
      return { url: "assets/diagrams/bleeding-action.svg", alt: "Direct Pressure & Hemorrhage Control Diagram" };
    }
    if (text.includes("cpr") || text.includes("cardiac") || text.includes("unconscious") || text.includes("not breathing") || text.includes("compress")) {
      return { url: "assets/diagrams/cpr-action.svg", alt: "CPR Hands Interlocked Compression Diagram" };
    }
    if (text.includes("chok") || text.includes("airway") || text.includes("heimlich") || text.includes("food stuck")) {
      return { url: "assets/diagrams/choking-action.svg", alt: "5 Back Blows & 5 Abdominal Thrusts Diagram" };
    }
    if (text.includes("stroke") || text.includes("fast") || text.includes("droop") || text.includes("slurr") || text.includes("paralys")) {
      return { url: "assets/diagrams/stroke-fast.svg", alt: "FAST Stroke Detection Diagram" };
    }
    if (text.includes("fractur") || text.includes("sprain") || text.includes("twist") || text.includes("ankle") || text.includes("swoll") || text.includes("bone")) {
      return { url: "assets/diagrams/fracture-rice.svg", alt: "R.I.C.E Sprain & Fracture Protocol Diagram" };
    }
    if (text.includes("snake") || text.includes("venom") || text.includes("fang") || text.includes("bite")) {
      return { url: "assets/diagrams/snakebite-action.svg", alt: "Snakebite Splint Immobilization Diagram" };
    }
    return { url: "assets/diagrams/recovery-position.svg", alt: "Casualty Recovery Position Diagram" };
  }

  // --- Render Results View (Section 2, 3, 4, 8) ---
  renderResults(result, isPhoto = false) {
    this.currentAnalysisResult = result;
    this.stopVoiceGuidance();

    // 1. Possible Emergency
    const titleEl = document.getElementById("results-emergency-title");
    if (titleEl) titleEl.textContent = result.possibleEmergency || "Possible Emergency Detected";

    // 2. Severity Level & Indicator (Low, Moderate, High, Critical)
    const severity = (result.severity || "Moderate").toLowerCase();
    const severityBadge = document.getElementById("results-severity-badge");
    const severityText = document.getElementById("results-severity-text");
    const severityDesc = document.getElementById("results-severity-desc");

    if (severityBadge) {
      severityBadge.className = `severity-badge-large ${severity}`;
    }
    if (severityText) {
      severityText.textContent = result.severity || "Moderate";
    }

    let severityExplanation = "Medical evaluation may be needed.";
    if (severity === "low") {
      severityExplanation = "Low — Basic first aid may be sufficient, but monitor the condition.";
    } else if (severity === "moderate") {
      severityExplanation = "Moderate — Medical evaluation may be needed.";
    } else if (severity === "high") {
      severityExplanation = "High — Seek urgent medical care.";
    } else if (severity === "critical") {
      severityExplanation = "Critical — Call emergency services immediately.";
    }
    if (severityDesc) severityDesc.textContent = severityExplanation;

    // 3. Engine & Mode Badge (Requirement 7)
    const engineBadge = document.getElementById("results-engine-badge");
    if (engineBadge) {
      if (result.isDemoMode) {
        engineBadge.className = "engine-badge demo-mode";
        engineBadge.innerHTML = `📋 Visual Heuristic Analysis (Offline Guide Mode)`;
      } else {
        engineBadge.className = "engine-badge ai-mode";
        engineBadge.innerHTML = `📋 ${result.engine || "Clinical Triage Protocol"}`;
      }
    }

    // 4. Uncertainty Notice (Requirement 4)
    const uncertaintyAlert = document.getElementById("results-uncertainty-alert");
    if (uncertaintyAlert) {
      if (result.uncertaintyNotice) {
        uncertaintyAlert.style.display = "flex";
        uncertaintyAlert.innerHTML = `<span>⚠️</span> <div>${result.uncertaintyNotice}</div>`;
      } else {
        uncertaintyAlert.style.display = "none";
      }
    }

    // 5. Observable Features (Requirement 4 - Photo analysis)
    const featuresBox = document.getElementById("results-observable-features-box");
    const featuresList = document.getElementById("results-observable-features-list");
    if (featuresBox && featuresList) {
      if (isPhoto && result.observableFeatures && result.observableFeatures.length > 0) {
        featuresBox.style.display = "block";
        featuresList.innerHTML = result.observableFeatures.map(f => `<li>${f}</li>`).join("");
      } else {
        featuresBox.style.display = "none";
      }
    }

    // 6. Card A: What might have happened?
    const whatHappenedEl = document.getElementById("results-what-happened-text");
    if (whatHappenedEl) whatHappenedEl.textContent = result.whatHappened || "Observation indicates acute physical injury or symptoms requiring first aid.";

    // 7. Card B: Warning signs
    const warningsList = document.getElementById("results-warning-signs-list");
    if (warningsList) {
      const signs = result.warningSigns || [];
      warningsList.innerHTML = signs.map(s => `<li>• ${s}</li>`).join("");
    }

    // 8. Card C: Immediate first aid & Clinical Diagram
    const diagram = this.getPictorialDiagram(result);
    const diagramBox = document.getElementById("results-action-diagram-box");
    const diagramImg = document.getElementById("results-action-diagram-img");
    if (diagramBox && diagramImg) {
      diagramImg.src = diagram.url;
      diagramImg.alt = diagram.alt;
      diagramBox.style.display = "block";
    }

    const stepsList = document.getElementById("results-first-aid-steps-list");
    if (stepsList) {
      const steps = result.immediateFirstAid || [];
      stepsList.innerHTML = steps.map((step, idx) => `
        <li>
          <span class="step-num">${idx + 1}</span>
          <span>${step}</span>
        </li>
      `).join("");
    }

    // 9. Card D: What NOT to do
    const dontList = document.getElementById("results-dont-list");
    if (dontList) {
      const donts = result.whatNotToDo || [];
      dontList.innerHTML = donts.map(d => `
        <li>
          <span class="dont-icon">✕</span>
          <span>${d}</span>
        </li>
      `).join("");
    }

    // 10. Card E: When to get medical help
    const whenHelpEl = document.getElementById("results-when-help-text");
    if (whenHelpEl) whenHelpEl.textContent = result.whenToGetHelp || "Seek prompt emergency hospital care if symptoms fail to stabilize or worsen.";

    // 11. Card F: Emergency Call 112 Action
    const call112Btn = document.getElementById("results-call-112-btn");
    if (call112Btn) {
      if (result.emergencyCallRequired || severity === "critical" || severity === "high") {
        call112Btn.style.display = "inline-flex";
      } else {
        call112Btn.style.display = "inline-flex"; // Always readily accessible
      }
    }

    // Switch view to results
    if (this.inputSection) this.inputSection.style.display = "none";
    if (this.resultsView) this.resultsView.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showInputSection() {
    this.stopVoiceGuidance();
    if (this.resultsView) this.resultsView.classList.remove("active");
    if (this.inputSection) this.inputSection.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- Voice Guidance (Requirement 3.G) ---
  playVoiceGuidance() {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.isSpeaking = true;
      if (this.voiceWave) this.voiceWave.classList.add("playing");
      return;
    }

    if (!this.currentAnalysisResult) return;

    window.speechSynthesis.cancel();

    // Construct clean speech narrative
    const r = this.currentAnalysisResult;
    let narrative = `First Aid Guidance for ${r.possibleEmergency}. `;
    narrative += `Severity is ${r.severity}. `;
    narrative += `What might have happened: ${r.whatHappened}. `;
    narrative += `Immediate first aid steps: `;
    (r.immediateFirstAid || []).forEach((step, i) => {
      narrative += `Step ${i + 1}. ${step}. `;
    });
    narrative += `What not to do: `;
    (r.whatNotToDo || []).forEach(d => {
      narrative += `${d}. `;
    });
    narrative += `When to get medical help: ${r.whenToGetHelp}. `;

    this.speechUtterance = new SpeechSynthesisUtterance(narrative);
    this.speechUtterance.rate = 0.95; // Clear emergency pace
    this.speechUtterance.pitch = 1.0;

    this.speechUtterance.onstart = () => {
      this.isSpeaking = true;
      if (this.voiceWave) this.voiceWave.classList.add("playing");
    };

    this.speechUtterance.onend = () => {
      this.isSpeaking = false;
      if (this.voiceWave) this.voiceWave.classList.remove("playing");
    };

    this.speechUtterance.onerror = () => {
      this.isSpeaking = false;
      if (this.voiceWave) this.voiceWave.classList.remove("playing");
    };

    window.speechSynthesis.speak(this.speechUtterance);
  }

  pauseVoiceGuidance() {
    if (window.speechSynthesis && this.isSpeaking) {
      window.speechSynthesis.pause();
      if (this.voiceWave) this.voiceWave.classList.remove("playing");
    }
  }

  stopVoiceGuidance() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      if (this.voiceWave) this.voiceWave.classList.remove("playing");
    }
  }
}

window.SmartAnalyzerController = SmartAnalyzerController;

