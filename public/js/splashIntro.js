/**
 * FirstAid+ Cinematic Emergency Welcome Intro Controller
 * Exactly 5.0 seconds duration.
 * Manages ECG animation, ambulance light sweeps, medical cross pulse,
 * optional subtle Web Audio heartbeat, and smooth dissolve into the main application.
 */

(function () {
  'use strict';

  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class CinematicIntroController {
    constructor() {
      this.overlay = document.getElementById('cinematic-welcome-intro');
      this.skipBtn = document.getElementById('intro-skip-btn');
      this.soundBtn = document.getElementById('intro-sound-toggle-btn');
      this.soundIcon = document.getElementById('intro-sound-icon');
      this.soundLabel = document.getElementById('intro-sound-label');
      this.audioCtx = null;
      this.audioEnabled = false;
      this.isFinished = false;
      this.timerId = null;

      if (!this.overlay) return;

      this.init();
    }

    init() {
      // Lock scroll while intro is playing
      document.body.style.overflow = 'hidden';

      // Reduced motion fallback: dissolve quickly
      if (prefersReducedMotion) {
        setTimeout(() => this.finishIntro(), 400);
        return;
      }

      // Bind Skip Button
      if (this.skipBtn) {
        this.skipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.finishIntro();
        });
      }

      // Bind Sound Toggle
      if (this.soundBtn) {
        this.soundBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleSound();
        });
      }

      // Clicking anywhere on intro can activate audio if user wishes, without interrupting the visual timeline
      this.overlay.addEventListener('click', (e) => {
        if (e.target !== this.skipBtn && !this.audioEnabled) {
          this.enableAudio();
        }
      }, { once: true });

      // Start the 5.0-second exact timeline
      this.startTimeline();
    }

    enableAudio() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!this.audioCtx) {
          this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        this.audioEnabled = true;
        if (this.soundIcon) this.soundIcon.textContent = '🔊';
        if (this.soundLabel) this.soundLabel.textContent = 'Heartbeat On';
      } catch (err) {
        // Audio error ignored safely
      }
    }

    toggleSound() {
      if (this.audioEnabled) {
        this.audioEnabled = false;
        if (this.soundIcon) this.soundIcon.textContent = '🔈';
        if (this.soundLabel) this.soundLabel.textContent = 'Audio Off';
      } else {
        this.enableAudio();
        // Play immediate sample thump so user knows it works
        this.playHeartbeatThump();
      }
    }

    playHeartbeatThump() {
      if (!this.audioEnabled || !this.audioCtx) return;
      try {
        const now = this.audioCtx.currentTime;

        // "Lub" - First low resonant thump
        const osc1 = this.audioCtx.createOscillator();
        const gain1 = this.audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(62, now);
        osc1.frequency.exponentialRampToValueAtTime(38, now + 0.12);
        gain1.gain.setValueAtTime(0.35, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc1.connect(gain1);
        gain1.connect(this.audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.15);

        // "Dub" - Second slightly softer thump after 140ms
        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(54, now + 0.14);
        osc2.frequency.exponentialRampToValueAtTime(34, now + 0.28);
        gain2.gain.setValueAtTime(0.25, now + 0.14);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);
        osc2.start(now + 0.14);
        osc2.stop(now + 0.30);
      } catch (e) {}
    }

    startTimeline() {
      // 1.0s: Heartbeat spike trigger (ECG spike reaches peak)
      setTimeout(() => {
        if (!this.isFinished && this.audioEnabled) {
          this.playHeartbeatThump();
        }
      }, 1100);

      // 2.3s: Second subtle heartbeat as logo resolves
      setTimeout(() => {
        if (!this.isFinished && this.audioEnabled) {
          this.playHeartbeatThump();
        }
      }, 2300);

      // 4.2s: Initiate smooth dissolution into main website
      setTimeout(() => {
        if (!this.isFinished && this.overlay) {
          this.overlay.classList.add('dissolving');
        }
      }, 4200);

      // Exactly 5.0 seconds (5000ms): Fully remove splash screen and reveal main app
      this.timerId = setTimeout(() => {
        this.finishIntro();
      }, 5000);
    }

    finishIntro() {
      if (this.isFinished) return;
      this.isFinished = true;

      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }

      if (this.overlay) {
        this.overlay.classList.add('finished');
        // Give 300ms for CSS fade out to finish cleanly
        setTimeout(() => {
          this.overlay.style.display = 'none';
          this.overlay.remove(); // Remove from DOM completely to eliminate any possibility of blocking UI
          document.body.style.overflow = ''; // Unlock scrolling completely
          
          // Trigger custom event so main app knows it is fully visible
          window.dispatchEvent(new CustomEvent('firstaid-intro-complete'));
        }, 350);
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  // Initialize immediately on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CinematicIntroController());
  } else {
    new CinematicIntroController();
  }
})();
