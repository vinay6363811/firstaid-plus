/**
 * FirstAid+ Module 2: AI Voice Emergency Assistant (Feature 41)
 * Hands-free conversational speech recognition and female voice guidance.
 * Converts user speech to text, detects language, coordinates first-aid AI,
 * and speaks clinical emergency instructions aloud.
 */

(function (window) {
  'use strict';

  class VoiceAssistantController {
    constructor() {
      this.recognition = null;
      this.isListening = false;
      this.isProcessing = false;
      this.isSpeaking = false;
      this.transcript = '';
      this.lastResult = null;

      // Web Speech API Support Check
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.supported = Boolean(SpeechRecognition);

      if (this.supported) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }

      // DOM Elements - Voice Assistant View
      this.container = document.getElementById('view-voice-assistant');
      this.micMainBtn = document.getElementById('voice-assistant-mic-btn');
      this.statusTitle = document.getElementById('voice-status-title');
      this.statusSub = document.getElementById('voice-status-sub');
      this.transcriptBox = document.getElementById('voice-transcript-text');
      this.transcriptEditInput = document.getElementById('voice-transcript-edit-input');
      this.editToggleBtn = document.getElementById('btn-edit-voice-transcript');
      this.analyzeVoiceBtn = document.getElementById('btn-analyze-voice-text');
      this.stopVoiceBtn = document.getElementById('btn-stop-voice-assistant');
      this.speakAgainBtn = document.getElementById('btn-speak-again-assistant');
      this.listenAgainBtn = document.getElementById('btn-listen-again-assistant');
      this.voiceWaveCanvas = document.getElementById('voice-wave-canvas');
      this.voiceLangBadge = document.getElementById('voice-assistant-lang-badge');

      // Inline Mic Button on Smart Analyzer input bar
      this.inlineMicBtn = document.getElementById('inline-mic-input-btn');

      this.init();
    }

    init() {
      this.bindEvents();
      this.setupRecognitionListeners();
    }

    bindEvents() {
      // Main Center Mic Button
      if (this.micMainBtn) {
        this.micMainBtn.addEventListener('click', () => {
          this.toggleListening();
        });
      }

      // Inline Mic Button on Analyzer page
      if (this.inlineMicBtn) {
        this.inlineMicBtn.addEventListener('click', () => {
          this.startInlineVoiceInput();
        });
      }

      // Analyze Recognized Speech
      if (this.analyzeVoiceBtn) {
        this.analyzeVoiceBtn.addEventListener('click', () => {
          this.processRecognizedSpeech();
        });
      }

      // Stop Voice Speech
      if (this.stopVoiceBtn) {
        this.stopVoiceBtn.addEventListener('click', () => {
          this.stopSpeech();
        });
      }

      // Speak Again
      if (this.speakAgainBtn) {
        this.speakAgainBtn.addEventListener('click', () => {
          this.resetForNewVoiceQuery();
        });
      }

      // Listen Again (re-reads current first aid advice)
      if (this.listenAgainBtn) {
        this.listenAgainBtn.addEventListener('click', () => {
          this.readAloudLastAdvice();
        });
      }

      // Toggle Manual Transcript Edit
      if (this.editToggleBtn && this.transcriptEditInput && this.transcriptBox) {
        this.editToggleBtn.addEventListener('click', () => {
          const isEditing = this.transcriptEditInput.style.display !== 'none';
          if (isEditing) {
            // Save edited text
            this.transcript = this.transcriptEditInput.value.trim();
            this.transcriptBox.textContent = `"${this.transcript}"`;
            this.transcriptEditInput.style.display = 'none';
            this.transcriptBox.style.display = 'block';
            this.editToggleBtn.textContent = '✏️ Edit Text';
          } else {
            // Open editor
            this.transcriptEditInput.value = this.transcript;
            this.transcriptBox.style.display = 'none';
            this.transcriptEditInput.style.display = 'block';
            this.transcriptEditInput.focus();
            this.editToggleBtn.textContent = '💾 Save Edit';
          }
        });
      }
    }

    setupRecognitionListeners() {
      if (!this.recognition) return;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.setUIState('listening');
        this.startSoundWaveAnimation();
      };

      this.recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = final || interim;
        this.transcript = currentText;

        if (this.transcriptBox) {
          this.transcriptBox.textContent = `"${currentText}"`;
        }

        // Live Language Detection on Spoken Text
        if (window.languageDetector && currentText.trim().length > 3) {
          const detected = window.languageDetector.detectLanguageFromText(currentText);
          if (this.voiceLangBadge) {
            this.voiceLangBadge.textContent = `${detected.flag} ${detected.name}`;
          }
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech Recognition Error:', event.error);
        this.isListening = false;
        this.stopSoundWaveAnimation();

        let message = 'Could not capture audio. Please try speaking again.';
        if (event.error === 'not-allowed') {
          message = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
        } else if (event.error === 'no-speech') {
          message = 'No speech detected. Please speak clearly into your microphone.';
        } else if (event.error === 'network') {
          message = 'Network error during speech processing. Please check your internet connection.';
        }

        this.setUIState('idle', 'MICROPHONE PAUSED', message);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.stopSoundWaveAnimation();

        if (this.transcript && this.transcript.trim().length > 0) {
          this.setUIState('ready_to_analyze', 'SPEECH RECOGNIZED', 'Review your spoken symptom and click "Analyze Now" or edit if needed.');
          if (this.analyzeVoiceBtn) this.analyzeVoiceBtn.style.display = 'inline-flex';
        } else {
          this.setUIState('idle', 'TAP MICROPHONE TO SPEAK', 'Hands-free emergency assistant ready.');
        }
      };
    }

    /**
     * Start/Stop Listening Toggle
     */
    toggleListening() {
      if (!this.supported) {
        alert('Speech Recognition is not supported by your current browser. Please use Chrome, Edge, or an Android browser.');
        return;
      }

      if (this.isListening) {
        this.recognition.stop();
      } else {
        // Stop any current voice speech before listening
        this.stopSpeech();

        // Set speech recognition language based on active language detector setting
        const activeLang = window.languageDetector ? window.languageDetector.getCurrentLanguage() : { code: 'en-IN' };
        this.recognition.lang = activeLang.code || 'en-IN';

        try {
          this.recognition.start();
        } catch (err) {
          console.warn('Recognition start exception:', err);
        }
      }
    }

    toggleVoice() {
      return this.toggleListening();
    }

    startListening() {
      if (!this.isListening && this.recognition) {
        this.recognition.start();
      }
    }

    stopListening() {
      if (this.isListening && this.recognition) {
        this.recognition.stop();
      }
    }

    speak(text, opts) {
      if (typeof text === 'string') {
        return window.speechEngine ? window.speechEngine.speak(text, opts) : null;
      }
      return this.speakFirstAidAdvice(text);
    }

    analyzeRecognizedText() {
      return this.processRecognizedSpeech();
    }

    renderSoundWave() {
      return this.drawWaveFrame();
    }

    /**
     * Inline microphone input directly on the Smart Analyzer text bar
     */
    startInlineVoiceInput() {
      if (!this.supported) {
        alert('Voice speech-to-text is not supported in this browser. Please type your problem description.');
        return;
      }

      // If active, stop
      if (this.isListening) {
        this.recognition.stop();
        return;
      }

      const textarea = document.getElementById('problem-description-input');
      const micBtn = document.getElementById('inline-mic-input-btn');

      if (micBtn) {
        micBtn.classList.add('mic-pulsing-active');
        micBtn.title = 'Listening... Speak now';
      }

      const activeLang = window.languageDetector ? window.languageDetector.getCurrentLanguage() : { code: 'en-IN' };
      this.recognition.lang = activeLang.code || 'en-IN';

      this.recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        if (textarea) {
          textarea.value = text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (micBtn) {
          micBtn.classList.remove('mic-pulsing-active');
          micBtn.title = 'Speak Symptoms';
        }
        // Auto-analyze if meaningful text transcribed
        if (textarea && textarea.value.trim().length > 3) {
          setTimeout(() => {
            const analyzeBtn = document.getElementById('analyze-text-btn');
            if (analyzeBtn) analyzeBtn.focus();
          }, 300);
        }
        // Restore standard listeners
        this.setupRecognitionListeners();
      };

      try {
        this.isListening = true;
        this.recognition.start();
      } catch (err) {
        if (micBtn) micBtn.classList.remove('mic-pulsing-active');
      }
    }

    /**
     * Send Recognized Speech to Existing Smart First Aid Analyzer
     */
    async processRecognizedSpeech() {
      const query = this.transcript ? this.transcript.trim() : '';
      if (!query) {
        alert('Please speak your symptom first.');
        return;
      }

      this.isProcessing = true;
      this.setUIState('processing', 'AI ANALYZING SYMPTOMS...', 'Evaluating emergency indicators and self-care steps...');

      try {
        const response = await fetch('/api/analyze-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem: query,
            lang: window.languageDetector ? window.languageDetector.getCurrentLanguage().code : 'en-IN'
          })
        });

        const result = await response.json();
        this.isProcessing = false;
        this.lastResult = result;

        // Save session in Symptom History
        if (window.symptomHistory) {
          window.symptomHistory.saveSession(result, query, 'voice_assistant');
        }

        // Display Result in Voice Cockpit
        this.renderVoiceResult(result);

        // Read Result Aloud in natural Female Voice
        this.speakFirstAidAdvice(result);

      } catch (err) {
        this.isProcessing = false;
        console.error('Error analyzing voice query:', err);
        this.setUIState('idle', 'ANALYSIS ERROR', 'Could not process voice request. Please check connection and try again.');
      }
    }

    /**
     * Speak First-Aid Guidance Aloud using SpeechEngine
     */
    speakFirstAidAdvice(result) {
      if (!window.speechEngine) return;

      const title = result.possibleEmergency || 'Emergency Assessment';
      const steps = Array.isArray(result.immediateFirstAid) ? result.immediateFirstAid.join('. ') : '';
      const textToSpeak = `${title}. Immediate action required: ${steps}`;

      this.isSpeaking = true;
      this.setUIState('speaking', `SPEAKING INSTRUCTIONS: ${title.toUpperCase()}`, 'Listening to female medical assistant. Tap "Stop Voice" to interrupt.');

      const targetLang = window.languageDetector ? window.languageDetector.getCurrentLanguage().code : 'en-IN';

      window.speechEngine.speak(textToSpeak, {
        lang: targetLang,
        gender: 'female',
        onEnd: () => {
          this.isSpeaking = false;
          this.setUIState('idle', 'ASSISTANCE COMPLETE', 'You can ask another follow-up question or tap "Listen Again".');
        }
      });
    }

    stopSpeech() {
      if (window.speechEngine && typeof window.speechEngine.stop === 'function') {
        window.speechEngine.stop();
      }
      this.isSpeaking = false;
      this.setUIState('idle', 'VOICE GUIDANCE STOPPED', 'Tap "Listen Again" or speak a new symptom.');
    }

    readAloudLastAdvice() {
      if (this.lastResult) {
        this.speakFirstAidAdvice(this.lastResult);
      } else {
        alert('No previous first-aid advice to replay. Speak a symptom first.');
      }
    }

    resetForNewVoiceQuery() {
      this.stopSpeech();
      this.transcript = '';
      if (this.transcriptBox) {
        this.transcriptBox.textContent = 'Tap the microphone and describe what happened...';
      }
      const resultsContainer = document.getElementById('voice-assistant-results-card');
      if (resultsContainer) resultsContainer.style.display = 'none';

      this.toggleListening();
    }

    renderVoiceResult(result) {
      const resultsContainer = document.getElementById('voice-assistant-results-card');
      if (!resultsContainer) return;

      const isEmergency = result.isEmergency || result.severity === 'Critical';

      resultsContainer.innerHTML = `
        <div class="voice-result-box ${isEmergency ? 'voice-emergency-override' : ''}">
          <div class="result-header-strip">
            <span class="voice-sev-tag ${result.severity ? result.severity.toLowerCase() : 'moderate'}">
              ${isEmergency ? '🚨 ' : ''}${result.severity || 'Moderate'} Severity
            </span>
            ${isEmergency ? '<a href="tel:112" class="voice-call-112-btn">📞 CALL 112 NOW</a>' : ''}
          </div>

          <h3 class="voice-result-title">${result.possibleEmergency || 'First Aid Assessment'}</h3>
          <p class="voice-result-desc">${result.whatHappened || ''}</p>

          <div class="voice-steps-box">
            <h4>✅ Immediate Action Steps:</h4>
            <ol>
              ${(result.immediateFirstAid || []).map(s => `<li>${s}</li>`).join('')}
            </ol>
          </div>

          ${result.whatNotToDo && result.whatNotToDo.length > 0 ? `
            <div class="voice-warning-box">
              <h4>❌ What NOT To Do:</h4>
              <ul>
                ${result.whatNotToDo.map(w => `<li>${w}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="voice-result-footer">
            <button type="button" class="btn-voice-open-details" onclick="window.switchView('analyzer'); window.smartAnalyzer.renderResults(window.voiceAssistant.lastResult);">
              📄 View Full Prescription & Hospital Options
            </button>
          </div>
        </div>
      `;

      resultsContainer.style.display = 'block';
    }

    /**
     * UI Status Controller
     */
    setUIState(state, title = '', subtext = '') {
      if (this.micMainBtn) {
        this.micMainBtn.className = `voice-mic-giant-btn state-${state}`;
      }

      if (this.statusTitle && title) this.statusTitle.textContent = title;
      if (this.statusSub && subtext) this.statusSub.textContent = subtext;

      // Controls visibility
      if (this.stopVoiceBtn) {
        this.stopVoiceBtn.style.display = (state === 'speaking') ? 'inline-flex' : 'none';
      }
      if (this.listenAgainBtn) {
        this.listenAgainBtn.style.display = (this.lastResult && state !== 'speaking') ? 'inline-flex' : 'none';
      }
    }

    /**
     * Canvas Sound Wave Animation while listening
     */
    startSoundWaveAnimation() {
      if (!this.voiceWaveCanvas) return;
      const ctx = this.voiceWaveCanvas.getContext('2d');
      if (!ctx) return;

      this.animatingWave = true;
      let phase = 0;

      const draw = () => {
        if (!this.animatingWave) {
          ctx.clearRect(0, 0, this.voiceWaveCanvas.width, this.voiceWaveCanvas.height);
          return;
        }

        ctx.clearRect(0, 0, this.voiceWaveCanvas.width, this.voiceWaveCanvas.height);
        ctx.fillStyle = '#0284c7';

        const barCount = 28;
        const width = this.voiceWaveCanvas.width;
        const height = this.voiceWaveCanvas.height;
        const barWidth = width / barCount - 2;

        for (let i = 0; i < barCount; i++) {
          const barHeight = Math.sin(phase + i * 0.4) * (height / 2.5) + (height / 3);
          const x = i * (barWidth + 2);
          const y = (height - barHeight) / 2;

          ctx.fillRect(x, y, barWidth, barHeight);
        }

        phase += 0.18;
        requestAnimationFrame(draw);
      };

      draw();
    }

    stopSoundWaveAnimation() {
      this.animatingWave = false;
      if (this.voiceWaveCanvas) {
        const ctx = this.voiceWaveCanvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, this.voiceWaveCanvas.width, this.voiceWaveCanvas.height);
      }
    }
  }

  // Instantiate and expose globally
  document.addEventListener('DOMContentLoaded', () => {
    window.voiceAssistant = new VoiceAssistantController();
  });

  window.VoiceAssistantController = VoiceAssistantController;

})(window);
