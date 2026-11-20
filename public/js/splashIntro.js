/**
 * FirstAid+ Cinematic Emergency Welcome Intro Controller
 * Advanced 5-Second Futuristic Medical HUD Experience
 * Completely Silent (Strict zero audio / no sound effects / no audio autoplay)
 * Manages 6-scene timeline, HUD elements, ECG monitor, and smooth non-blocking transition.
 */

(function () {
  'use strict';

  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class CinematicIntroController {
    constructor() {
      this.overlay = document.getElementById('cinematic-welcome-intro');
      this.skipBtn = document.getElementById('intro-skip-btn');
      this.isFinished = false;
      this.timerId = null;
      this.dissolveTimerId = null;

      if (!this.overlay) return;

      this.init();
    }

    init() {
      // Lock scroll while intro is actively playing
      document.body.style.overflow = 'hidden';

      // Reduced motion fallback: bypass immediately and smoothly
      if (prefersReducedMotion) {
        setTimeout(() => this.finishIntro(), 200);
        return;
      }

      // Bind Skip Button
      if (this.skipBtn) {
        this.skipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.finishIntro();
        });
      }

      // Allow pressing ESC to skip cleanly
      this.handleKeyDown = (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
          this.finishIntro();
        }
      };
      window.addEventListener('keydown', this.handleKeyDown, { once: true });

      // Start the 5.0-second exact timeline
      this.startTimeline();
    }

    startTimeline() {
      // Scene 6 Trigger: 4.2s (4200ms) - Initiate smooth dissolution into main website
      this.dissolveTimerId = setTimeout(() => {
        if (!this.isFinished && this.overlay) {
          this.overlay.classList.add('dissolving');
        }
      }, 4200);

      // Exactly 5.0 seconds (5000ms): Fully finalize and remove splash screen
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
      if (this.dissolveTimerId) {
        clearTimeout(this.dissolveTimerId);
        this.dissolveTimerId = null;
      }

      window.removeEventListener('keydown', this.handleKeyDown);

      if (this.overlay) {
        this.overlay.classList.add('finished');
        // Give 350ms for CSS fade/scale out to finish cleanly
        setTimeout(() => {
          if (this.overlay) {
            this.overlay.style.display = 'none';
            this.overlay.remove(); // Safely detach from DOM completely
          }
          document.body.style.overflow = ''; // Unlock scrolling completely
          
          // Trigger custom event so main app knows it is fully visible and interactive
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
