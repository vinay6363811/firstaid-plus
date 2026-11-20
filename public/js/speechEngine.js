/**
 * FirstAid+ Intelligent Female Speech & Language Synthesis Engine
 * Provides empathetic, reassuring, natural female voice guidance in English
 * and 7 Indian languages (Kannada, Hindi, Telugu, Tamil, Malayalam, Bengali, Marathi).
 */

(function (window) {
  'use strict';

  const SETTINGS_STORAGE_KEY = 'firstaid_voice_settings_v1';

  // Supported Indian & Regional Languages
  const SUPPORTED_LANGUAGES = {
    'kn-IN': { code: 'kn-IN', prefix: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    'hi-IN': { code: 'hi-IN', prefix: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    'te-IN': { code: 'te-IN', prefix: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    'ta-IN': { code: 'ta-IN', prefix: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    'ml-IN': { code: 'ml-IN', prefix: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    'bn-IN': { code: 'bn-IN', prefix: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    'mr-IN': { code: 'mr-IN', prefix: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    'en-IN': { code: 'en-IN', prefix: 'en', name: 'English (India)', nativeName: 'Indian English', flag: '🇮🇳' }
  };

  // Female voice identifier markers
  const FEMALE_MARKERS = [
    // Indic names (Google, Microsoft, Android Neural)
    'neerja', 'heera', 'swara', 'kalpana', 'shruti', 'pallavi', 'kavya', 'sapna',
    'sangeeta', 'sobhana', 'tanishaa', 'aarohi', 'ananya', 'priya', 'radha', 'geeta',
    'vani', 'deepa', 'leela', 'anita', 'meera', 'pooja',
    // Google Indic Voices (Chrome / Android default high-quality female TTS)
    'google हिन्दी', 'google ಕನ್ನಡ', 'google తెలుగు', 'google தமிழ்', 'google മലയാളം',
    'google বাংলা', 'google मराठी', 'google english (india)',
    // Global Natural & High-Quality Female Voices
    'zira', 'aria', 'jenny', 'samantha', 'victoria', 'karen', 'moira', 'fiona',
    'tessa', 'susan', 'hazel', 'ava', 'emma', 'sonia', 'natasha', 'katrina',
    'stephanie', 'linda', 'female', 'woman', 'girl', 'lady', 'google uk english female'
  ];

  // Explicit male voice markers to actively avoid
  const MALE_MARKERS = [
    'male', 'man', 'boy', 'david', 'mark', 'george', 'ravi', 'hemant', 'prabhat',
    'valluvar', 'guy', 'stefan', 'richard', 'james', 'john', 'paul', 'alex',
    'fred', 'daniel', 'oliver', 'tom', 'bruce', 'ralph'
  ];

  class SpeechEngine {
    constructor() {
      this.supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
      this.voices = [];
      this.currentUtterance = null;
      this.isSpeaking = false;
      this.isPaused = false;
      this.settings = this.loadSettings();
      this.supportedLanguages = SUPPORTED_LANGUAGES;

      if (this.supported) {
        this.loadVoices();
        if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
          window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
      }
    }

    loadSettings() {
      const defaults = {
        gender: 'female',            // 'female' (default), 'male', 'any'
        style: 'calm',                // 'calm' (default), 'natural', 'friendly'
        speed: 'normal',              // 'slow', 'normal' (default), 'fast'
        volume: 1.0,                  // 0.0 - 1.0
        autoSpeak: false,              // true / false
        selectedLanguage: 'auto'      // 'auto', 'en-IN', 'kn-IN', 'hi-IN', etc.
      };

      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          return Object.assign({}, defaults, JSON.parse(stored));
        }
      } catch (e) {}
      return defaults;
    }

    setLanguage(langCode) {
      this.settings.selectedLanguage = langCode || 'auto';
      this.saveSettings({ selectedLanguage: this.settings.selectedLanguage });
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('firstaid-language-changed', {
          detail: { 
            langCode: this.settings.selectedLanguage,
            language: SUPPORTED_LANGUAGES[this.settings.selectedLanguage] || null
          }
        }));
      }
    }

    getActiveLanguage(text) {
      if (this.settings.selectedLanguage && this.settings.selectedLanguage !== 'auto') {
        return SUPPORTED_LANGUAGES[this.settings.selectedLanguage] || SUPPORTED_LANGUAGES['en-IN'];
      }
      return this.detectLanguage(text);
    }

    saveSettings(newSettings) {
      this.settings = Object.assign({}, this.settings, newSettings);
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
      } catch (e) {}
    }

    loadVoices() {
      if (!this.supported) return;
      this.voices = window.speechSynthesis.getVoices() || [];
    }

    /**
     * Detects input language from script and vocabulary
     */
    detectLanguage(text) {
      if (!text || typeof text !== 'string') {
        return SUPPORTED_LANGUAGES['en-IN'];
      }

      const clean = text.trim();

      // 1. Unicode Script Matching
      if (/[\u0C80-\u0CFF]/.test(clean)) return SUPPORTED_LANGUAGES['kn-IN']; // Kannada
      if (/[\u0C00-\u0C7F]/.test(clean)) return SUPPORTED_LANGUAGES['te-IN']; // Telugu
      if (/[\u0B80-\u0BFF]/.test(clean)) return SUPPORTED_LANGUAGES['ta-IN']; // Tamil
      if (/[\u0D00-\u0D7F]/.test(clean)) return SUPPORTED_LANGUAGES['ml-IN']; // Malayalam
      if (/[\u0980-\u09FF]/.test(clean)) return SUPPORTED_LANGUAGES['bn-IN']; // Bengali
      if (/[\u0900-\u097F]/.test(clean)) {
        // Marathi check
        if (/\b(डोके|पोट|ताप|खोकला|माझे|त्रास|आहे|नाही|हात|पाय|जळजळ)\b/i.test(clean)) {
          return SUPPORTED_LANGUAGES['mr-IN'];
        }
        return SUPPORTED_LANGUAGES['hi-IN']; // Hindi default Devanagari
      }

      // 2. Transliteration / Romanized Indian Language Words
      const lower = clean.toLowerCase();
      if (/\b(tale\s*novu|hotte\s*novu|jwara|kalu\s*novu|kai\s*novu|kannada|nanna|ellige|hege|beku|agide)\b/i.test(lower)) {
        return SUPPORTED_LANGUAGES['kn-IN'];
      }
      if (/\b(sar\s*dard|sir\s*dard|pet\s*dard|bukhar|khansi|chot|khoon|chakkar|seene\s*me|saas|jalan|soojan)\b/i.test(lower)) {
        return SUPPORTED_LANGUAGES['hi-IN'];
      }
      if (/\b(thala\s*noppi|tala\s*noppi|kadupu\s*noppi|jwaram|gunde\s*noppi|daggulu|telugu|naaku)\b/i.test(lower)) {
        return SUPPORTED_LANGUAGES['te-IN'];
      }
      if (/\b(thalai\s*vali|vayiru\s*vali|kaichal|irumal|nenju\s*vali|tamil|enakku)\b/i.test(lower)) {
        return SUPPORTED_LANGUAGES['ta-IN'];
      }
      if (/\b(thala\s*vedana|vayar\s*vedana|pani|chuma|malayalam|enikku)\b/i.test(lower)) {
        return SUPPORTED_LANGUAGES['ml-IN'];
      }
      if (/\b(matha\s*betha|pet\s*betha|jor|kashi|bangla|amar)\b/i.test(lower)) {
        return SUPPORTED_LANGUAGES['bn-IN'];
      }
      if (/\b(doke\s*dukhi|pot\s*dukhi|taap|khokla|marathi|majhe)\b/i.test(lower)) {
        return SUPPORTED_LANGUAGES['mr-IN'];
      }

      return SUPPORTED_LANGUAGES['en-IN'];
    }

    /**
     * Selects the highest quality female voice matching the language priority.
     */
    getBestVoice(targetLangCode = 'en-IN', preferredGender = 'female') {
      if (!this.supported) return { voice: null, isFemale: false, languageSupported: false };

      if (!this.voices || this.voices.length === 0) {
        this.loadVoices();
      }

      const targetLang = targetLangCode.toLowerCase().replace('_', '-');
      const targetPrefix = targetLang.split('-')[0];

      // Voice scoring engine
      let scoredVoices = this.voices.map(voice => {
        const vName = (voice.name || '').toLowerCase();
        const vLang = (voice.lang || '').toLowerCase().replace('_', '-');
        const vPrefix = vLang.split('-')[0];

        let score = 0;
        let isFemaleDetected = false;
        let isMaleDetected = false;

        // Check gender indicators in name
        for (const marker of FEMALE_MARKERS) {
          if (vName.includes(marker)) {
            isFemaleDetected = true;
            break;
          }
        }
        for (const marker of MALE_MARKERS) {
          if (vName.includes(marker)) {
            isMaleDetected = true;
            break;
          }
        }

        // 1. Language Match Scoring
        if (vLang === targetLang) {
          score += 120;
        } else if (vPrefix === targetPrefix) {
          score += 80;
        } else if (targetPrefix === 'en') {
          // General English fallback
          if (vLang.includes('in')) score += 50;
          else if (vLang.includes('gb') || vLang.includes('us')) score += 30;
          else if (vPrefix === 'en') score += 20;
        }

        // 2. Gender Preference Scoring
        if (preferredGender === 'female') {
          if (isFemaleDetected) score += 90;
          else if (isMaleDetected) score -= 160; // Strongly avoid male voices
          else score += 15; // Unknown voice
        } else if (preferredGender === 'male') {
          if (isMaleDetected) score += 90;
          else if (isFemaleDetected) score -= 160;
        }

        // 3. Natural / Neural High-Quality Indicator
        if (vName.includes('natural') || vName.includes('neural') || vName.includes('google') || vName.includes('online')) {
          score += 35;
        }

        // 4. Indian accent preference for English
        if (targetPrefix === 'en' && (vLang.includes('in') || vName.includes('india'))) {
          score += 40;
        }

        return {
          voice,
          score,
          isFemale: isFemaleDetected,
          lang: vLang
        };
      });

      scoredVoices.sort((a, b) => b.score - a.score);

      // Best match in requested language
      const bestTargetVoice = scoredVoices.find(v => {
        const p = v.lang.split('-')[0];
        return p === targetPrefix && v.score > 0;
      });

      if (bestTargetVoice) {
        return {
          voice: bestTargetVoice.voice,
          isFemale: bestTargetVoice.isFemale || preferredGender === 'female',
          languageSupported: true,
          fallbackUsed: false,
          langCode: targetLangCode
        };
      }

      // Fallback: If device lacks voices in target Indian language, use high-quality Indian English female voice
      const englishFallback = scoredVoices.find(v => v.lang.startsWith('en') && v.score > 0);
      return {
        voice: englishFallback ? englishFallback.voice : (this.voices[0] || null),
        isFemale: englishFallback ? englishFallback.isFemale : true,
        languageSupported: false,
        fallbackUsed: true,
        langCode: 'en-IN'
      };
    }

    /**
     * Constructs reassuring first-aid narrative in the detected language.
     */
    buildNarrative(analysisResult, detectedLang) {
      if (!analysisResult) return '';

      const r = analysisResult;
      const lang = detectedLang ? detectedLang.code : 'en-IN';

      // 1. Unknown Problem Guidance
      if (r.isUnknownProblem) {
        if (lang.startsWith('kn')) {
          return "ವೈದ್ಯಕೀಯ ಸಲಹೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ. ಈ ಸಮಸ್ಯೆಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ನಮಗೆ ಸಾಧ್ಯವಿಲ್ಲ. ಸೂಕ್ತ ವೈದ್ಯಕೀಯ ಸಲಹೆಗಾಗಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸುವುದು ಉತ್ತಮ. ನಿಮ್ಮ ಆರೋಗ್ಯ ಮುಖ್ಯ. ದಯವಿಟ್ಟು ಅನಿಶ್ಚಿತ ಮಾಹಿತಿಯ ಮೇಲೆ ಅವಲಂಬಿಸಬೇಡಿ ಅಥವಾ ಊಹೆಗಳ ಆಧಾರದ ಮೇಲೆ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ. ಶಾಂತವಾಗಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಮತ್ತು ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ. ತುರ್ತು ಸಹಾಯಕ್ಕಾಗಿ 112 ಕರೆ ಮಾಡಿ.";
        }
        if (lang.startsWith('hi')) {
          return "चिकित्सा परामर्श की सिफारिश की जाती है। हम इस समस्या के लिए विश्वसनीय मार्गदर्शन प्रदान करने में असमर्थ हैं। उचित चिकित्सा सलाह के लिए डॉक्टर से परामर्श करना बेहतर है। आपका स्वास्थ्य महत्वपूर्ण है। कृपया अनिश्चित जानकारी पर भरोसा न करें या अनुमान के आधार पर दवा न लें। शांत होकर आराम करें। आपात स्थिति में तुरंत 112 पर कॉल करें।";
        }
        if (lang.startsWith('te')) {
          return "వైద్య సంప్రదింపు సిఫార్సు చేయబడింది. ఈ సమస్యకు నమ్మదగిన మార్గదర్శకత్వం ఇవ్వలేము. సరైన వైద్య సలహా కోసం వైద్యుడిని సంప్రదించడం మంచిది. మీ ఆరోగ్యం ముఖ్యం. దయచేసి స్వంతంగా మందులు వాడవద్దు. అత్యవసర సహాయం కోసం 112 కి కాల్ చేయండి.";
        }
        if (lang.startsWith('ta')) {
          return "மருத்துவ ஆலோசனையை நாடுவது நல்லது. இந்த பிரச்சனைக்கு நம்பகமான முதலுதவி வழிகாட்டுதலை வழங்க முடியவில்லை. தகுந்த மருத்துவ ஆலோசனைக்கு மருத்துவரை அணுகுவது சிறந்தது. உங்கள் உடல்நலம் முக்கியமானது. அவசர உதவிக்கு 112 ஐ அழைக்கவும்.";
        }
        if (lang.startsWith('ml')) {
          return "വൈദ്യോപദേശം തേടാൻ ശുപാർശ ചെയ്യുന്നു. ഈ പ്രശ്നത്തിന് വിശ്വസനീയമായ മാർഗ്ഗനിർദ്ദേശം നൽകാൻ കഴിയില്ല. ശരിയായ ചികിത്സയ്ക്കായി ഡോക്ടറെ കാണുക. നിങ്ങളുടെ ആരോഗ്യം പ്രധാനമാണ്. അടിയന്തര സഹായത്തിന് 112 വിളിക്കുക.";
        }
        if (lang.startsWith('bn')) {
          return "ডাক্তারের পরামর্শ নেওয়ার অনুরোধ করা হচ্ছে। এই সমস্যার জন্য নির্ভরযোগ্য নির্দেশিকা প্রদান করা সম্ভব নয়। উপযুক্ত চিকিৎসার জন্য ডাক্তারের সাথে পরামর্শ করাই শ্রেয়। আপনার স্বাস্থ্য মূল্যবান। জরুরি প্রয়োজনে 112 নম্বরে কল করুন।";
        }
        if (lang.startsWith('mr')) {
          return "वैद्यकीय सल्ला घेण्याची शिफारस केली जाते. या समस्येसाठी आम्ही खात्रीशीर मार्गदर्शन देऊ शकत नाही. योग्य उपचारांसाठी डॉक्टरांचा सल्ला घेणे चांगले. तुमचे आरोग्य महत्त्वाचे आहे. आपत्कालीन मदतीसाठी 112 वर कॉल करा.";
        }
        return "Medical consultation recommended. We're unable to provide reliable guidance for this problem. It's better to consult a doctor for proper medical advice. Your health is important. Please don't rely on uncertain information or self-medicate based on guesses. Rest quietly and please consult a physician. If you are experiencing danger signs, call 112 immediately.";
      }

      // 2. Reassuring Indian Language Specific Emergency Narratives
      if (lang.startsWith('kn')) {
        let knSpeech = `ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಮಾರ್ಗದರ್ಶನ: ${r.possibleEmergency || 'ಆರೋಗ್ಯ ಸಮಸ್ಯೆ'}. `;
        knSpeech += `ಸ್ಥಿತಿ ಮಟ್ಟ: ${r.severity || 'ಸಾಧಾರಣ'}. `;
        knSpeech += `ತಕ್ಷಣದ ಕ್ರಮಗಳು: `;
        (r.immediateFirstAid || []).forEach((step, i) => {
          knSpeech += `ಹಂತ ${i + 1}: ${step}. `;
        });
        if (r.whatNotToDo && r.whatNotToDo.length) {
          knSpeech += `ಮಾಡಬಾರದ ತಪ್ಪುಗಳು: `;
          r.whatNotToDo.forEach(d => { knSpeech += `${d}. `; });
        }
        knSpeech += `ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಾಗಿ 112 ಗೆ ಕರೆ ಮಾಡಿ.`;
        return knSpeech;
      }

      if (lang.startsWith('hi')) {
        let hiSpeech = `प्राथमिक चिकित्सा मार्गदर्शन: ${r.possibleEmergency || 'स्वास्थ्य समस्या'}. `;
        hiSpeech += `तीव्रता स्तर: ${r.severity || 'मध्यम'}. `;
        hiSpeech += `तत्काल प्राथमिक कदम: `;
        (r.immediateFirstAid || []).forEach((step, i) => {
          hiSpeech += `कदम ${i + 1}: ${step}. `;
        });
        if (r.whatNotToDo && r.whatNotToDo.length) {
          hiSpeech += `क्या न करें: `;
          r.whatNotToDo.forEach(d => { hiSpeech += `${d}. `; });
        }
        hiSpeech += `आपातकालीन सहायता के लिए 112 पर कॉल करें।`;
        return hiSpeech;
      }

      if (lang.startsWith('te')) {
        let teSpeech = `ప్రథమ చికిత్స మార్గదర్శకత్వం: ${r.possibleEmergency || 'ఆరోగ్య సమస్య'}. `;
        (r.immediateFirstAid || []).forEach((step, i) => { teSpeech += `దశ ${i + 1}: ${step}. `; });
        if (r.whatNotToDo && r.whatNotToDo.length) {
          teSpeech += `చేయకూడనివి: `;
          r.whatNotToDo.forEach(d => { teSpeech += `${d}. `; });
        }
        teSpeech += `అత్యవసర సహాయం కోసం 112 కు కాల్ చేయండి.`;
        return teSpeech;
      }

      if (lang.startsWith('ta')) {
        let taSpeech = `முதலுதவி வழிகாட்டுதல்: ${r.possibleEmergency || 'சுகாதார பிரச்சனை'}. `;
        (r.immediateFirstAid || []).forEach((step, i) => { taSpeech += `படி ${i + 1}: ${step}. `; });
        if (r.whatNotToDo && r.whatNotToDo.length) {
          taSpeech += `செய்யக்கூடாதவை: `;
          r.whatNotToDo.forEach(d => { taSpeech += `${d}. `; });
        }
        taSpeech += `அவசர உதவிக்கு 112-ஐ அழைக்கவும்.`;
        return taSpeech;
      }

      if (lang.startsWith('ml')) {
        let mlSpeech = `പ്രഥമശുശ്രൂഷാ മാർഗ്ഗനിർദ്ദേശം: ${r.possibleEmergency || 'ആരോഗ്യ പ്രശ്നം'}. `;
        (r.immediateFirstAid || []).forEach((step, i) => { mlSpeech += `ഘട്ടം ${i + 1}: ${step}. `; });
        if (r.whatNotToDo && r.whatNotToDo.length) {
          mlSpeech += `ചെയ്യാൻ പാടില്ലാത്തവ: `;
          r.whatNotToDo.forEach(d => { mlSpeech += `${d}. `; });
        }
        mlSpeech += `അടിയന്തര സഹായത്തിന് 112-ലേക്ക് വിളിക്കുക.`;
        return mlSpeech;
      }

      if (lang.startsWith('bn')) {
        let bnSpeech = `প্রাথমিক চিকিৎসা নির্দেশিকা: ${r.possibleEmergency || 'স্বাস্থ্য সমস্যা'}. `;
        (r.immediateFirstAid || []).forEach((step, i) => { bnSpeech += `ধাপ ${i + 1}: ${step}. `; });
        if (r.whatNotToDo && r.whatNotToDo.length) {
          bnSpeech += `কী করবেন না: `;
          r.whatNotToDo.forEach(d => { bnSpeech += `${d}. `; });
        }
        bnSpeech += `জরুরি সহায়তার জন্য ১১২ এ কল করুন।`;
        return bnSpeech;
      }

      if (lang.startsWith('mr')) {
        let mrSpeech = `प्रथमोपचार मार्गदर्शन: ${r.possibleEmergency || 'आरोग्य समस्या'}. `;
        (r.immediateFirstAid || []).forEach((step, i) => { mrSpeech += `पायरी ${i + 1}: ${step}. `; });
        if (r.whatNotToDo && r.whatNotToDo.length) {
          mrSpeech += `काय करू नये: `;
          r.whatNotToDo.forEach(d => { mrSpeech += `${d}. `; });
        }
        mrSpeech += `आपत्कालीन मदतीसाठी ११२ वर कॉल करा.`;
        return mrSpeech;
      }

      // 3. Caring, Reassuring Female English Narrative
      let speech = `Hello, I am your FirstAid+ assistant. Here is your first aid guidance for ${r.possibleEmergency || 'the condition'}. `;
      speech += `Triage severity is classified as ${r.severity || 'moderate'}. `;
      if (r.whatHappened) {
        speech += `What might have happened: ${r.whatHappened}. `;
      }
      speech += `Here are the immediate first aid steps to follow: `;
      (r.immediateFirstAid || []).forEach((step, i) => {
        speech += `Step ${i + 1}. ${step}. `;
      });
      if (r.whatNotToDo && r.whatNotToDo.length) {
        speech += `Important things you must avoid doing: `;
        r.whatNotToDo.forEach(d => {
          speech += `${d}. `;
        });
      }
      if (r.whenToGetHelp) {
        speech += `When to get medical help: ${r.whenToGetHelp}. `;
      }
      speech += `For immediate emergency help in India, please dial 112.`;
      return speech;
    }

    /**
     * Speaks narrative using optimal female voice and user acoustic preferences.
     */
    speak(options = {}) {
      if (!this.supported) {
        if (options.onError) options.onError('Speech synthesis not supported');
        return;
      }

      this.stop();

      const text = options.text || options.narrative || '';
      if (!text) return;

      const langObj = options.lang ? (typeof options.lang === 'string' ? (SUPPORTED_LANGUAGES[options.lang] || { code: options.lang }) : options.lang) : this.detectLanguage(text);
      const voiceMatch = this.getBestVoice(langObj.code, this.settings.gender);

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      if (voiceMatch.voice && !voiceMatch.fallbackUsed) {
        utterance.voice = voiceMatch.voice;
        utterance.lang = voiceMatch.voice.lang || langObj.code;
      } else {
        // If device has no local voice object matching this language (fallbackUsed is true),
        // do not force an English synthesizer to pronounce Indic scripts.
        // Leaving utterance.voice unset allows browsers (like Chrome/Edge) to route the utterance
        // to their native regional online speech synthesizer matching utterance.lang.
        utterance.lang = langObj.code;
      }

      // Apply Voice Style Persona & Speaking Speed
      let baseRate = 0.94; // Calm reassuring baseline pace
      let pitch = 1.05;    // Warm, gentle female pitch

      if (this.settings.style === 'natural') {
        baseRate = 1.0;
        pitch = 1.0;
      } else if (this.settings.style === 'friendly') {
        baseRate = 1.02;
        pitch = 1.1;
      }

      let speedFactor = 1.0;
      if (this.settings.speed === 'slow') speedFactor = 0.85;
      else if (this.settings.speed === 'fast') speedFactor = 1.2;

      utterance.rate = Math.max(0.6, Math.min(1.8, baseRate * speedFactor));
      utterance.pitch = Math.max(0.8, Math.min(1.4, pitch));
      utterance.volume = typeof this.settings.volume === 'number' ? Math.max(0, Math.min(1, this.settings.volume)) : 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        if (options.onStart) options.onStart(voiceMatch);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (err) => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        if (options.onError) options.onError(err);
      };

      window.speechSynthesis.speak(utterance);
      return voiceMatch;
    }

    pause() {
      if (this.supported && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        this.isPaused = true;
        this.isSpeaking = false;
      }
    }

    resume() {
      if (this.supported && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.isPaused = false;
        this.isSpeaking = true;
      }
    }

    stop() {
      if (this.supported) {
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
      }
    }

    previewVoice(customLang) {
      const activeCode = customLang || (this.settings.selectedLanguage !== 'auto' ? this.settings.selectedLanguage : 'en-IN');
      const langObj = SUPPORTED_LANGUAGES[activeCode] || SUPPORTED_LANGUAGES['en-IN'];
      let previewText = "Hello! I am your FirstAid+ medical assistant. Stay calm, take a deep breath, and let's follow the first aid steps together.";
      
      if (activeCode.startsWith('kn')) {
        previewText = "ನಮಸ್ಕಾರ, ನಾನು ನಿಮ್ಮ ಫಸ್ಟ್‌ಏಡ್ ಪ್ಲಸ್ ವೈದ್ಯಕೀಯ ಸಹಾಯಕ. ಶಾಂತರಾಗಿರಿ, ನಿಮ್ಮ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆಗೆ ನಾನು ಇಲ್ಲಿದ್ದೇನೆ.";
      } else if (activeCode.startsWith('hi')) {
        previewText = "नमस्ते! मैं आपकी फर्स्टएड प्लस मेडिकल सहायक हूँ। शांत रहें, मैं आपकी सहायता के लिए तैयार हूँ।";
      } else if (activeCode.startsWith('te')) {
        previewText = "నమస్కారం! నేను మీ ఫస్ట్‌ఎయిడ్ ప్లస్ వైద్య సహాయకురాలిని. ప్రశాంతంగా ఉండండి, నేను మీకు సహాయం చేస్తాను.";
      } else if (activeCode.startsWith('ta')) {
        previewText = "வணக்கம்! நான் உங்கள் ஃபர்ஸ்ட் எய்ட் பிளஸ் மருத்துவ உதவியாளர். அமைதியாக இருங்கள், உங்களுக்கு உதவ நான் தயாராக உள்ளேன்.";
      } else if (activeCode.startsWith('ml')) {
        previewText = "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ഫസ്റ്റ് എയ്ഡ് പ്ലസ് മെഡിക്കൽ അസിസ്റ്റന്റാണ്. ശാന്തരായിരിക്കുക, സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്.";
      } else if (activeCode.startsWith('bn')) {
        previewText = "নমস্কার! আমি আপনার ফার্স্টএইড প্লাস চিকিৎসা সহায়িকা। শান্ত থাকুন, আমি আপনাকে সাহায্য করতে প্রস্তুত।";
      } else if (activeCode.startsWith('mr')) {
        previewText = "नमस्कार! मी आपली फर्स्टएड प्लस वैद्यकीय सहाय्यक आहे. शांत राहा, मी आपल्या मदतीसाठी उपस्थित आहे.";
      }

      return this.speak({
        text: previewText,
        lang: langObj
      });
    }
  }

  // Expose singleton engine globally
  window.speechEngine = new SpeechEngine();

})(window);
