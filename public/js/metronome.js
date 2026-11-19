/**
 * CPR Metronome & Chest Compression Guide
 * Synthesizes crisp audio clicks at 100-120 BPM using Web Audio API
 */

class CprMetronomeController {
  constructor() {
    this.bpm = 110; // Recommended CPR range is 100-120 BPM
    this.isRunning = false;
    this.audioCtx = null;
    this.intervalId = null;
    this.compressionCount = 0;
    this.cycleCount = 1;

    this.toggleBtn = document.getElementById("cpr-toggle-btn");
    this.bpmSlider = document.getElementById("cpr-bpm-slider");
    this.bpmValEl = document.getElementById("cpr-bpm-val");
    this.heartEl = document.getElementById("cpr-heart-icon");
    this.countEl = document.getElementById("cpr-counter-digits");
    this.cycleEl = document.getElementById("cpr-cycle-text");

    this.bindEvents();
  }

  bindEvents() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", () => this.toggle());
    }
    if (this.bpmSlider) {
      this.bpmSlider.addEventListener("input", (e) => {
        this.bpm = parseInt(e.target.value, 10);
        if (this.bpmValEl) this.bpmValEl.textContent = this.bpm;
        if (this.isRunning) {
          this.stop();
          this.start();
        }
      });
    }
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  playClick(isBreathCue = false) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (isBreathCue) {
        // Higher pitched sound for rescue breath reminder
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      } else {
        // Sharp, punchy metronome click
        osc.frequency.setValueAtTime(520, this.audioCtx.currentTime);
      }

      gain.gain.setValueAtTime(1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.start(this.audioCtx.currentTime);
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn("Audio click failed", e);
    }
  }

  toggle() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    this.initAudio();
    this.isRunning = true;
    if (this.toggleBtn) {
      this.toggleBtn.textContent = "Stop Metronome";
      this.toggleBtn.classList.replace("btn-primary", "btn-secondary");
    }

    const intervalMs = (60 / this.bpm) * 1000;
    this.intervalId = setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  tick() {
    this.compressionCount++;
    const is30th = this.compressionCount === 30;

    this.playClick(is30th);

    // Heart beat animation
    if (this.heartEl) {
      this.heartEl.classList.add("beat");
      setTimeout(() => {
        if (this.heartEl) this.heartEl.classList.remove("beat");
      }, 90);
    }

    if (this.countEl) {
      this.countEl.textContent = this.compressionCount;
    }

    if (is30th) {
      if (this.cycleEl) {
        this.cycleEl.innerHTML = `<span style="color: #38bdf8; font-weight: bold;">GIVE 2 RESCUE BREATHS NOW</span> (Cycle ${this.cycleCount})`;
      }
      this.compressionCount = 0;
      this.cycleCount++;
    } else {
      if (this.cycleEl) {
        this.cycleEl.textContent = `Push hard & fast at center of chest (Cycle ${this.cycleCount})`;
      }
    }
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.toggleBtn) {
      this.toggleBtn.textContent = "Start CPR Metronome";
      this.toggleBtn.classList.replace("btn-secondary", "btn-primary");
    }
    this.compressionCount = 0;
    if (this.countEl) this.countEl.textContent = "0";
  }
}

window.CprMetronomeController = CprMetronomeController;

