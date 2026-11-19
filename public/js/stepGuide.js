/**
 * Step-by-Step Interactive Guide Controller
 * Walks the user through numbered first aid steps one at a time with optional timers
 */

class StepGuideController {
  constructor() {
    this.currentSteps = [];
    this.currentIndex = 0;
    this.currentTitle = "";
    this.timerInterval = null;
    this.timerSecondsLeft = 0;

    this.modal = document.getElementById("step-modal");
    this.titleEl = document.getElementById("step-guide-title");
    this.tagEl = document.getElementById("step-number-tag");
    this.textEl = document.getElementById("step-instruction-text");
    this.progressFillEl = document.getElementById("step-progress-fill");
    this.timerContainer = document.getElementById("step-timer-container");
    this.timerDigits = document.getElementById("step-timer-digits");
    this.timerBtn = document.getElementById("step-timer-toggle-btn");

    this.prevBtn = document.getElementById("step-prev-btn");
    this.nextBtn = document.getElementById("step-next-btn");
    this.closeBtn = document.getElementById("step-close-btn");

    this.bindEvents();
  }

  bindEvents() {
    if (this.prevBtn) this.prevBtn.addEventListener("click", () => this.prevStep());
    if (this.nextBtn) this.nextBtn.addEventListener("click", () => this.nextStep());
    if (this.closeBtn) this.closeBtn.addEventListener("click", () => this.close());
    if (this.timerBtn) this.timerBtn.addEventListener("click", () => this.toggleTimer());
  }

  startGuide(title, steps) {
    if (!steps || steps.length === 0) return;
    this.currentTitle = title || "First Aid Procedure";
    this.currentSteps = steps;
    this.currentIndex = 0;
    this.modal.classList.add("active");
    this.renderCurrentStep();
  }

  renderCurrentStep() {
    this.stopTimer();
    const total = this.currentSteps.length;
    const current = this.currentIndex + 1;
    const stepText = this.currentSteps[this.currentIndex];

    if (this.titleEl) this.titleEl.textContent = this.currentTitle;
    if (this.tagEl) this.tagEl.textContent = `STEP ${current} OF ${total}`;
    if (this.textEl) this.textEl.textContent = stepText;

    // Update progress bar
    const percent = Math.round((current / total) * 100);
    if (this.progressFillEl) this.progressFillEl.style.width = `${percent}%`;

    // Button states
    if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
    if (this.nextBtn) {
      if (this.currentIndex === total - 1) {
        this.nextBtn.innerHTML = `<span>Complete</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      } else {
        this.nextBtn.innerHTML = `<span>Next Step</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      }
    }

    // Detect if this step mentions a time duration (e.g. 20 minutes, 15 minutes, 10 minutes, 5 minutes)
    this.detectStepTimer(stepText);

    // Optional voice prompt
    if (window.speechSynthesis && window.speechAutoRead) {
      window.speakText(`Step ${current}. ${stepText}`);
    }
  }

  detectStepTimer(stepText) {
    const textLower = stepText.toLowerCase();
    let seconds = 0;

    if (textLower.includes("20 minutes") || textLower.includes("20 mins")) {
      seconds = 20 * 60;
    } else if (textLower.includes("15 minutes") || textLower.includes("15 mins")) {
      seconds = 15 * 60;
    } else if (textLower.includes("10 minutes") || textLower.includes("10 mins")) {
      seconds = 10 * 60;
    } else if (textLower.includes("5 minutes") || textLower.includes("5 mins")) {
      seconds = 5 * 60;
    } else if (textLower.includes("2 minutes") || textLower.includes("3 minutes")) {
      seconds = 3 * 60;
    }

    if (seconds > 0) {
      this.timerSecondsLeft = seconds;
      this.updateTimerDisplay();
      if (this.timerContainer) this.timerContainer.style.display = "block";
    } else {
      if (this.timerContainer) this.timerContainer.style.display = "none";
    }
  }

  updateTimerDisplay() {
    const m = Math.floor(this.timerSecondsLeft / 60);
    const s = this.timerSecondsLeft % 60;
    if (this.timerDigits) {
      this.timerDigits.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
  }

  toggleTimer() {
    if (this.timerInterval) {
      this.stopTimer();
      if (this.timerBtn) this.timerBtn.textContent = "Resume Timer";
    } else {
      this.timerInterval = setInterval(() => {
        if (this.timerSecondsLeft > 0) {
          this.timerSecondsLeft--;
          this.updateTimerDisplay();
        } else {
          this.stopTimer();
          if (this.timerDigits) this.timerDigits.textContent = "00:00 (Done!)";
          if (window.playAlertBeep) window.playAlertBeep();
        }
      }, 1000);
      if (this.timerBtn) this.timerBtn.textContent = "Pause Timer";
    }
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  nextStep() {
    if (this.currentIndex < this.currentSteps.length - 1) {
      this.currentIndex++;
      this.renderCurrentStep();
    } else {
      this.close();
    }
  }

  prevStep() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCurrentStep();
    }
  }

  close() {
    this.stopTimer();
    this.modal.classList.remove("active");
  }
}

window.StepGuideController = StepGuideController;

