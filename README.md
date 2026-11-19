# FirstAid+ Smart Text & Photo Emergency Analyzer

FirstAid+ is an educational emergency first-aid assistant and triage system. It incorporates intelligent natural-language symptom matching, visual injury photo inspection, interactive step-by-step guidance, CPR assistance, and India-specific emergency hotline integration (112, 108).

---

## 🌟 Key Features

### 1. Smart First Aid Analyzer (Flagship Upgrade)
- **Natural Language Text Analysis**:
  - Large text area with prompt placeholder: `"Describe what happened... Example: A person fell down and is bleeding from their knee."`
  - Instant example prompt chips (e.g., *Boiling water on hand*, *Deep bleeding knee cut*, *Choking & cannot breathe*, *Face drooping & slurred speech*, *Crushing chest pain*, *Snakebite*).
  - Triage matching across 25+ medical emergency protocols.
  - Multi-stage loading animation.
- **Photograph & Camera Analysis**:
  - Drag-and-drop file upload zone supporting JPG, JPEG, PNG, and WEBP.
  - Mobile camera capture (`capture="environment"`) & desktop live webcam modal.
  - Instant demonstration injury samples (Burn, Cut, Sprained Ankle, Bee Sting).
  - High-tech **laser scanner beam animation** across the preview frame during analysis.
  - Strict photo analysis rules: only observable visual characteristics are reported; non-diagnostic; clearly flags uncertain images.
- **Smart Conversational Assistant (Chat)**:
  - Interactive triage chat interface (`App: "Possible burn injury detected."` -> immediate actions, dos, don'ts, quick action buttons).

### 2. Clinical Analysis Results Engine
- **Possible Emergency** identification.
- **Visual Severity Indicator**:
  - 🟢 **Low** — Basic first aid may be sufficient, but monitor the condition.
  - 🟡 **Moderate** — Medical evaluation may be needed.
  - 🟠 **High** — Seek urgent medical care.
  - 🔴 **Critical** — Call emergency services immediately.
- **Structured Sections**:
  - **A. What Might Have Happened?**
  - **B. Warning Signs to Look For**
  - **C. Immediate First Aid** (Numbered actionable steps)
  - **D. What NOT to Do** (Dangerous myths & harmful actions)
  - **E. When to Get Medical Help**
  - **F. Emergency Action**: Prominent **Call 112** button.
  - **G. Voice Guidance**: Integrated text-to-speech engine with Play, Pause, and Stop.
  - **Interactive Step-by-Step Guide Launcher** with countdown timers.

### 3. Core Preserved FirstAid+ App Features
- **Unified Emergency Hotlines Bar**: Direct dialing for 112 (National Emergency), 108 (Ambulance), 102 (Infant/Maternity), 101 (Fire), 100 (Police), 1800-116-117 (Poison Control AIIMS).
- **Comprehensive First Aid Guides Library**: 25+ standardized clinical emergency protocols with real-time keyword search.
- **CPR Metronome**: Audio-visual metronome paced at 100-120 BPM with pulsing heart animation, audio clicks, and 30:2 compression-breath cycle counter.
- **First Aid Kit Inventory**: Interactive checklist tracking essential dressings, antiseptics, equipment, and medications.
- **Backend AI Configuration**: Optional Google Gemini 2.5 Flash API key integration stored securely on backend (zero frontend exposure).

---

## 🔒 Mandatory Safety Disclaimer
> "FirstAid+ is an educational first-aid assistant. Text and photo analysis may be inaccurate and cannot diagnose injuries. Do not delay emergency care to use this app. If the person is in immediate danger, call 112 in India."

---

## 🚀 Running the Application

```bash
cd C:\Users\vinay\.gemini\antigravity\scratch\firstaid-plus
node server.js
```

Open your browser at: **`http://localhost:3000`**

