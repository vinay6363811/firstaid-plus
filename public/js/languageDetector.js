/**
 * FirstAid+ Module 3: Automatic Language Detection Engine (Feature 42)
 * Intelligently recognizes language of typed text and speech input across
 * Kannada, Hindi, Telugu, Tamil, Malayalam, Bengali, Marathi, and English.
 * Automatically synchronizes AI responses, female voice TTS, and navigation.
 */

(function (window) {
  'use strict';

  // Comprehensive Language Metadata
  const SUPPORTED_LANGUAGES = {
    'kn-IN': {
      code: 'kn-IN',
      prefix: 'kn',
      name: 'Kannada',
      nativeName: 'ಕನ್ನಡ',
      flag: '🇮🇳',
      scriptRegex: /[\u0C80-\u0CFF]/,
      keywordsRegex: /\b(tale\s*novu|thale\s*novu|hotte\s*novu|jwara|jvara|neeru|kai\s*novu|kaalu\s*novu|kalu\s*novu|ede\s*novu|rakta|raktha|haavu|kadita|usirata|kannada|nanna|bisi\s*neeru|sutta|suttide|gaya|makkalu|hege|beku|agide)\b/i,
      labels: {
        analyzeBtn: 'ಸಮಸ್ಯೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ',
        clearBtn: 'ತೆರವುಗೊಳಿಸಿ',
        listenBtn: '🔊 ಧ್ವನಿಯನ್ನು ಆಲಿಸಿ',
        emergencyTitle: 'ತುರ್ತು ವೈದ್ಯಕೀಯ ಮಾರ್ಗದರ್ಶಿ',
        detectedNotice: 'ಕನ್ನಡ ಭಾಷೆಯನ್ನು ಗುರುತಿಸಲಾಗಿದೆ'
      }
    },
    'hi-IN': {
      code: 'hi-IN',
      prefix: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
      scriptRegex: /[\u0900-\u097F]/,
      keywordsRegex: /\b(sir\s*dard|sar\s*dard|pet\s*dard|bukhar|khoon|chot|jalan|saans|saanp|chakkar|gala|garm\s*pani|jal\s*gaya|soojan|hath|pair|aag|madad|chhati\s*dard|khansi|ulti|mujhe|hai|kripya)\b/i,
      labels: {
        analyzeBtn: 'समस्या का विश्लेषण करें',
        clearBtn: 'साफ़ करें',
        listenBtn: '🔊 आवाज़ सुनें',
        emergencyTitle: 'आपातकालीन प्राथमिक चिकित्सा',
        detectedNotice: 'हिन्दी भाषा पहचानी गई'
      }
    },
    'te-IN': {
      code: 'te-IN',
      prefix: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      flag: '🇮🇳',
      scriptRegex: /[\u0C00-\u0C7F]/,
      keywordsRegex: /\b(thala\s*noppi|tala\s*noppi|kadupu\s*noppi|jwaram|gunde\s*noppi|daggulu|kalu\s*noppi|cheyyi\s*noppi|raktham|kalindi|vedi\s*neellu|telugulo|telugu|naaku|vachindi)\b/i,
      labels: {
        analyzeBtn: 'సమస్యను విశ్లేషించండి',
        clearBtn: 'క్లియర్ చేయండి',
        listenBtn: '🔊 వాయిస్ వినండి',
        emergencyTitle: 'అత్యవసర ప్రథమ చికిత్స',
        detectedNotice: 'తెలుగు భాష గుర్తించబడింది'
      }
    },
    'ta-IN': {
      code: 'ta-IN',
      prefix: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      flag: '🇮🇳',
      scriptRegex: /[\u0B80-\u0BFF]/,
      keywordsRegex: /\b(thalai\s*vali|vayiru\s*vali|kaichal|irumal|nenju\s*vali|kai\s*vali|kaal\s*vali|ratham|theekkayam|sudu\s*thanni|tamil|tamilil|enakku|vandhathu)\b/i,
      labels: {
        analyzeBtn: 'சிக்கலை பகுப்பாய்வு செய்க',
        clearBtn: 'அழிக்கவும்',
        listenBtn: '🔊 ஒலியைக் கேளுங்கள்',
        emergencyTitle: 'அவசர முதலுதவி வழிகாட்டி',
        detectedNotice: 'தமிழ் மொழி கண்டறியப்பட்டது'
      }
    },
    'ml-IN': {
      code: 'ml-IN',
      prefix: 'ml',
      name: 'Malayalam',
      nativeName: 'മലയാളം',
      flag: '🇮🇳',
      scriptRegex: /[\u0D00-\u0D7F]/,
      keywordsRegex: /\b(thala\s*vedana|vayar\s*vedana|pani|chuma|nenju\s*vedana|kaal\s*vedana|kai\s*vedana|chora|pollal|choodu\s*vellam|malayalam|malayalathil|enikku)\b/i,
      labels: {
        analyzeBtn: 'പ്രശ്നം വിശകലനം ചെയ്യുക',
        clearBtn: 'മായ്ക്കുക',
        listenBtn: '🔊 ശബ്ദം കേൾക്കുക',
        emergencyTitle: 'അടിയന്തര പ്രഥമശുശ്രൂഷ',
        detectedNotice: 'മലയാളം തിരിച്ചറിഞ്ഞു'
      }
    },
    'bn-IN': {
      code: 'bn-IN',
      prefix: 'bn',
      name: 'Bengali',
      nativeName: 'বাংলা',
      flag: '🇮🇳',
      scriptRegex: /[\u0980-\u09FF]/,
      keywordsRegex: /\b(matha\s*betha|pet\s*betha|jor|kashi|buker\s*betha|roktpat|rokto|pure\s*geche|gorom\s*jol|bangla|banglay|amar|hoyeche)\b/i,
      labels: {
        analyzeBtn: 'সমস্যা বিশ্লেষণ করুন',
        clearBtn: 'মুছুন',
        listenBtn: '🔊 অডিও শুনুন',
        emergencyTitle: 'জরুরি প্রাথমিক চিকিৎসা',
        detectedNotice: 'বাংলা ভাষা শনাক্ত হয়েছে'
      }
    },
    'mr-IN': {
      code: 'mr-IN',
      prefix: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      flag: '🇮🇳',
      scriptRegex: /[\u0900-\u097F]/,
      keywordsRegex: /\b(doke\s*dukhi|pot\s*dukhi|taap|khokla|chhati\s*dukhi|rakta|dukhana|bhajle|garam\s*pani|marathi|marathit|majhe|jhale|ahe|nahi)\b/i,
      labels: {
        analyzeBtn: 'समस्येचे विश्लेषण करा',
        clearBtn: 'साफ करा',
        listenBtn: '🔊 आवाज ऐका',
        emergencyTitle: 'तातडीची प्रथमोपचार मार्गदर्शिका',
        detectedNotice: 'मराठी भाषा ओळखली गेली'
      }
    },
    'en-IN': {
      code: 'en-IN',
      prefix: 'en',
      name: 'English (India)',
      nativeName: 'English',
      flag: '🇮🇳',
      scriptRegex: /^[A-Za-z0-9\s.,!?'"()-]+$/,
      keywordsRegex: /.*/,
      labels: {
        analyzeBtn: 'Analyze Problem',
        clearBtn: 'Clear',
        listenBtn: '🔊 Listen to Audio',
        emergencyTitle: 'Emergency First Aid Guide',
        detectedNotice: 'English Detected'
      }
    }
  };

  class LanguageDetectorController {
    constructor() {
      this.currentLanguage = SUPPORTED_LANGUAGES['en-IN'];
      this.isLockedByUser = false;
      this.detectedBadge = document.getElementById('auto-lang-detected-badge');
      this.manualLangSelect = document.getElementById('auto-lang-manual-select');
      this.problemTextarea = document.getElementById('problem-description-input');

      this.init();
    }

    init() {
      this.bindEvents();
    }

    bindEvents() {
      // Live Typing listener on problem description textarea
      if (this.problemTextarea) {
        this.problemTextarea.addEventListener('input', () => {
          const text = this.problemTextarea.value;
          this.processInputText(text);
        });
      }

      // Manual selector change
      if (this.manualLangSelect) {
        this.manualLangSelect.addEventListener('change', (e) => {
          const val = e.target.value;
          if (val === 'auto') {
            this.isLockedByUser = false;
            this.processInputText(this.problemTextarea ? this.problemTextarea.value : '');
          } else {
            this.isLockedByUser = true;
            this.setLanguage(val, true);
          }
        });
      }
    }

    /**
     * Real-time text analysis to detect language
     */
    detect(text) {
      return this.detectLanguageFromText(text);
    }

    detectLanguageFromText(text) {
      if (!text || typeof text !== 'string') {
        return SUPPORTED_LANGUAGES['en-IN'];
      }

      const clean = text.trim();
      if (!clean) return this.currentLanguage;

      // 1. Check Unicode Scripts
      if (SUPPORTED_LANGUAGES['kn-IN'].scriptRegex.test(clean)) return SUPPORTED_LANGUAGES['kn-IN'];
      if (SUPPORTED_LANGUAGES['te-IN'].scriptRegex.test(clean)) return SUPPORTED_LANGUAGES['te-IN'];
      if (SUPPORTED_LANGUAGES['ta-IN'].scriptRegex.test(clean)) return SUPPORTED_LANGUAGES['ta-IN'];
      if (SUPPORTED_LANGUAGES['ml-IN'].scriptRegex.test(clean)) return SUPPORTED_LANGUAGES['ml-IN'];
      if (SUPPORTED_LANGUAGES['bn-IN'].scriptRegex.test(clean)) return SUPPORTED_LANGUAGES['bn-IN'];
      
      // Devanagari script: Marathi vs Hindi
      if (SUPPORTED_LANGUAGES['hi-IN'].scriptRegex.test(clean)) {
        if (SUPPORTED_LANGUAGES['mr-IN'].keywordsRegex.test(clean)) {
          return SUPPORTED_LANGUAGES['mr-IN'];
        }
        return SUPPORTED_LANGUAGES['hi-IN'];
      }

      // 2. Check Romanized / Transliterated vocabulary
      for (const key of ['kn-IN', 'hi-IN', 'te-IN', 'ta-IN', 'ml-IN', 'bn-IN', 'mr-IN']) {
        const langObj = SUPPORTED_LANGUAGES[key];
        if (langObj.keywordsRegex && langObj.keywordsRegex.test(clean)) {
          return langObj;
        }
      }

      return SUPPORTED_LANGUAGES['en-IN'];
    }

    processInputText(text) {
      if (this.isLockedByUser) return;

      if (!text || text.trim().length === 0) {
        this.updateBadge(this.currentLanguage, false);
        return;
      }

      const detected = this.detectLanguageFromText(text);
      this.setLanguage(detected.code, false);
    }

    /**
     * Set active language and synchronize voice & UI
     */
    setLanguage(langCode, isUserManual = false) {
      const target = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES['en-IN'];
      this.currentLanguage = target;

      // Update Speech Engine
      if (window.speechEngine && typeof window.speechEngine.setLanguage === 'function') {
        window.speechEngine.setLanguage(target.code);
      }

      // Update Live UI Badge
      this.updateBadge(target, true);

      // Update Dynamic UI Labels
      this.localizeButtons(target);

      // Dispatch global event for other components
      window.dispatchEvent(new CustomEvent('firstaid-lang-detected', {
        detail: {
          code: target.code,
          name: target.name,
          nativeName: target.nativeName,
          flag: target.flag,
          isUserManual
        }
      }));
    }

    updateBadge(langObj, hasText = true) {
      if (!this.detectedBadge) return;

      if (!hasText) {
        this.detectedBadge.innerHTML = `
          <span class="badge-icon">🌐</span>
          <span class="badge-text">Auto-Detecting Language...</span>
        `;
        this.detectedBadge.className = 'auto-lang-badge badge-idle';
        return;
      }

      this.detectedBadge.innerHTML = `
        <span class="badge-icon">${langObj.flag}</span>
        <span class="badge-text">Detected: <strong>${langObj.name} (${langObj.nativeName})</strong></span>
        <span class="badge-auto-tag">Auto</span>
      `;
      this.detectedBadge.className = 'auto-lang-badge badge-detected';
    }

    localizeButtons(langObj) {
      const analyzeBtnText = document.getElementById('analyze-btn-text');
      if (analyzeBtnText && langObj.labels?.analyzeBtn) {
        analyzeBtnText.textContent = langObj.labels.analyzeBtn;
      }

      const clearBtnText = document.getElementById('clear-btn-text');
      if (clearBtnText && langObj.labels?.clearBtn) {
        clearBtnText.textContent = langObj.labels.clearBtn;
      }
    }

    getCurrentLanguage() {
      return this.currentLanguage;
    }
  }

  // Instantiate and expose globally
  document.addEventListener('DOMContentLoaded', () => {
    window.languageDetector = new LanguageDetectorController();
  });

  window.LanguageDetectorController = LanguageDetectorController;
  window.FIRSTAID_SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;

})(window);
