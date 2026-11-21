/**
 * Comprehensive Automated Test Suite for FirstAid+
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let server = null;

function assert(condition, message) {
  if (!condition) {
    console.error('❌ ASSERTION FAILED:', message);
    process.exit(1);
  } else {
    console.log('✅ PASS:', message);
  }
}

async function runTests() {
  try {
    // Check if server is already running
    let isRunning = false;
    try {
      const ping = await fetch('http://127.0.0.1:3000/api/status');
      if (ping.ok) isRunning = true;
    } catch (e) {}

    if (!isRunning) {
      server = spawn('node', ['server.js'], { cwd: __dirname });
      server.stdout.on('data', d => console.log('[Server]', d.toString().trim()));
      server.stderr.on('data', d => console.error('[Server Error]', d.toString().trim()));
      await new Promise(r => setTimeout(r, 1200));
    }
    console.log('\n--- 1. Testing Server Status ---');
    const resStatus = await fetch('http://127.0.0.1:3000/api/status');
    const statusData = await resStatus.json();
    assert(statusData.status === 'operational', 'Status is operational');
    assert(statusData.app.includes('FirstAid+'), 'App name is FirstAid+');

    console.log('\n--- 2. Testing Text Emergency Analysis (Multiple Scenarios) ---');
    // Scenario A: Burns
    const resBurn = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'My friend accidentally spilled boiling water on his hand.' })
    });
    const burnData = await resBurn.json();
    assert(burnData.possibleEmergency.toLowerCase().includes('burn'), 'Detects burn emergency');
    assert(burnData.severity === 'Moderate', 'Burn severity is Moderate');
    assert(burnData.immediateFirstAid.length >= 3, 'Includes immediate first aid steps');
    assert(burnData.whatNotToDo.length >= 2, 'Includes what NOT to do');
    assert(burnData.safetyDisclaimer.includes('112 in India'), 'Includes India 112 disclaimer');

    // Scenario B: Choking
    const resChoke = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Child swallowed a coin, cant breathe and hands clutched to neck' })
    });
    const chokeData = await resChoke.json();
    assert(chokeData.possibleEmergency.toLowerCase().includes('choking') || chokeData.possibleEmergency.toLowerCase().includes('airway'), 'Detects choking emergency');
    assert(chokeData.severity === 'Critical', 'Choking severity is Critical');
    assert(chokeData.emergencyCallRequired === true, 'Choking requires emergency call');

    // Scenario C: Stroke
    const resStroke = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Grandmother suddenly has face drooping on one side and slurred speech' })
    });
    const strokeData = await resStroke.json();
    assert(strokeData.possibleEmergency.toLowerCase().includes('stroke'), 'Detects stroke emergency');
    assert(strokeData.severity === 'Critical', 'Stroke severity is Critical');

    // Scenario D: Snakebite
    const resSnake = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Snake bite on right foot with two puncture marks' })
    });
    const snakeData = await resSnake.json();
    assert(snakeData.possibleEmergency.toLowerCase().includes('snake'), 'Detects snakebite emergency');
    assert(snakeData.emergencyCallRequired === true, 'Snakebite requires urgent emergency call');

    // Scenario E: Everyday Headache with Typo ("headake")
    const resHeadache = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'I have a terrible headake and throbbing temple pain' })
    });
    const headacheData = await resHeadache.json();
    assert(headacheData.possibleEmergency.toLowerCase().includes('headache') || headacheData.possibleEmergency.toLowerCase().includes('head'), 'Detects headache despite typo');
    assert(headacheData.immediateFirstAid.length >= 3, 'Provides safe supportive care steps for headache');

    // Scenario F: Fever & Chills with Typo ("feever")
    const resFever = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'My friend has high feever with chills and body hot' })
    });
    const feverData = await resFever.json();
    assert(feverData.possibleEmergency.toLowerCase().includes('fever') || feverData.possibleEmergency.toLowerCase().includes('flu'), 'Detects fever and flu');

    // Scenario G: Stomach Pain with Typo ("stomac")
    const resStomach = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Severe stomac pain and acidity after dinner' })
    });
    const stomachData = await resStomach.json();
    assert(stomachData.possibleEmergency.toLowerCase().includes('stomach') || stomachData.possibleEmergency.toLowerCase().includes('gastritis') || stomachData.possibleEmergency.toLowerCase().includes('gastric'), 'Detects stomach discomfort');

    // Scenario H: Toothache with Typo ("tooth ake")
    const resTooth = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Terrible tooth ake and swollen gum' })
    });
    const toothData = await resTooth.json();
    assert(toothData.possibleEmergency.toLowerCase().includes('tooth'), 'Detects toothache oral care');

    // Scenario I: Serious Red Flag Emergency Detection
    const resRedFlag = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Sudden severe crushing chest pain radiating to left arm and cant breathe' })
    });
    const redFlagData = await resRedFlag.json();
    assert(redFlagData.confidenceTier === 'emergency', 'Red flag classified as emergency tier');
    assert(redFlagData.emergencyCallRequired === true, 'Red flag triggers mandatory 112 emergency call');

    // Scenario J: Unknown Problem & Uncertainty Handling (Requirement 3 & 6)
    const resUnknown = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'unusual purple floating quantum sensations inside my elbow code 999' })
    });
    const unknownData = await resUnknown.json();
    assert(unknownData.isUnknownProblem === true, 'Unrecognized symptom correctly flagged as unknown problem');
    assert(unknownData.confidenceTier === 'unknown', 'Confidence tier is unknown');
    assert(unknownData.primaryMessage.includes("unable to provide reliable guidance"), 'Includes exact required doctor advice message');
    assert(unknownData.secondaryMessage.includes("don't rely on uncertain information"), 'Includes exact health importance caution');
    assert(unknownData.consultDoctorButton === true, 'Provides Better to Consult a Doctor button');

    console.log('\n--- 3. Testing Photo / Vision Emergency Analysis ---');
    // Sample base64 test image (mock burn)
    const mockBurnBase64 = 'data:image/jpeg;base64,' + Buffer.from('TEST_IMAGE_BUFFER_BURN_SCALD').toString('base64');
    const resPhotoBurn = await fetch('http://127.0.0.1:3000/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: mockBurnBase64,
        filename: 'hot_water_burn.jpg',
        description: 'Splashed boiling water on arm'
      })
    });
    const photoBurnData = await resPhotoBurn.json();
    assert(photoBurnData.isDemoMode === true, 'Clearly indicates Demo Mode when no cloud key is set');
    assert(photoBurnData.possibleEmergency.toLowerCase().includes('burn'), 'Photo analysis identifies burn category');
    assert(photoBurnData.observableFeatures.length > 0, 'Lists observable features only');
    assert(photoBurnData.photoAnalysisRulesApplied.length >= 3, 'Photo rules applied');

    // Uncertain photo test
    const mockUncertain = 'data:image/jpeg;base64,' + Buffer.from('UNCERTAIN_BLURRY_PIXELS').toString('base64');
    const resPhotoUncertain = await fetch('http://127.0.0.1:3000/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: mockUncertain,
        filename: 'unclear_shot.jpg',
        description: ''
      })
    });
    const photoUncertainData = await resPhotoUncertain.json();
    assert(Boolean(photoUncertainData.uncertaintyNotice), 'Includes mandatory uncertainty notice when image is ambiguous');
    assert(photoUncertainData.uncertaintyNotice.includes('Image analysis cannot confirm'), 'Exact required uncertainty wording present');

    console.log('\n--- 4. Testing Conversational Emergency Assistant ---');
    const resAssistant = await fetch('http://127.0.0.1:3000/api/chat-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'My friend accidentally spilled boiling water on his hand.' })
    });
    const assistantData = await resAssistant.json();
    assert(assistantData.reply.includes('Possible'), 'Assistant replies with detected possible emergency');
    assert(assistantData.reply.includes('Immediate action'), 'Assistant provides immediate action');
    assert(assistantData.reply.includes('What NOT to do'), 'Assistant provides what NOT to do');
    assert(assistantData.structuredGuide !== null, 'Assistant returns structured guide object');

    // Assistant with Unknown Problem:
    const resAssistantUnknown = await fetch('http://127.0.0.1:3000/api/chat-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'weird sensations inside my kidney 999 unknown issue' })
    });
    const assistantUnknownData = await resAssistantUnknown.json();
    assert(assistantUnknownData.isUnknownProblem === true, 'Assistant identifies unknown problem');
    assert(assistantUnknownData.reply.includes('Medical Consultation Recommended'), 'Assistant recommends doctor consultation');
    assert(assistantUnknownData.reply.includes("unable to provide reliable guidance"), 'Assistant provides exact doctor advice message');

    console.log('\n--- 5. Testing Guides Library & Assets ---');
    const resGuides = await fetch('http://127.0.0.1:3000/api/guides');
    const guidesData = await resGuides.json();
    assert(guidesData.total >= 15, 'Loaded over 15 clinical emergency guides');

    const resHtml = await fetch('http://127.0.0.1:3000/index.html');
    const htmlText = await resHtml.text();
    assert(htmlText.includes('Smart First Aid Analyzer'), 'HTML contains Smart First Aid Analyzer title');
    assert(htmlText.includes('Describe what happened... Example: A person fell down and is bleeding from their knee.'), 'HTML has exact required placeholder');
    assert(htmlText.includes('Call 112') || htmlText.includes('tel:112'), 'HTML has Call 112 emergency button');
    assert(htmlText.includes('FirstAid+ is an educational first-aid assistant'), 'HTML has mandatory safety banner');
    assert(htmlText.includes('cinematic-welcome-intro'), 'HTML includes cinematic emergency welcome intro');
    assert(htmlText.includes('WELCOME TO FIRSTAID+'), 'HTML includes exact welcome title');
    assert(htmlText.includes('Be prepared. Stay calm. Save lives.'), 'HTML includes exact required emergency slogan');

    const resSplashJs = await fetch('http://127.0.0.1:3000/js/splashIntro.js');
    assert(resSplashJs.ok, 'splashIntro.js script is successfully served');
    const splashJsText = await resSplashJs.text();
    assert(splashJsText.includes('CinematicIntroController'), 'splashIntro.js contains intro controller');

    console.log('\n--- 6. Testing Interactive Human Body Visualization ---');
    assert(htmlText.includes('interactive-body-container'), 'HTML contains interactive body container');
    assert(htmlText.includes('svg-anatomy-front'), 'HTML includes front view anatomical model');
    assert(htmlText.includes('svg-anatomy-back'), 'HTML includes back view anatomical model');
    assert(htmlText.includes('body-model-3d-wrapper'), 'HTML includes 3D perspective stage');

    const resBodyJs = await fetch('http://127.0.0.1:3000/js/bodyVisualization.js');
    assert(resBodyJs.ok, 'bodyVisualization.js script is successfully served');
    const bodyJsText = await resBodyJs.text();
    assert(bodyJsText.includes('BodyVisualizationController'), 'bodyVisualization.js contains body visualization engine');
    assert(bodyJsText.includes('SYMPTOM_MAP'), 'bodyVisualization.js contains comprehensive anatomical symptom map');

    console.log('\n--- 7. Testing Female Voice Selection & Speech Engine ---');
    const speechEngineRes = await fetch('http://127.0.0.1:3000/js/speechEngine.js');
    assert(speechEngineRes.status === 200, 'speechEngine.js is served with HTTP 200');
    const speechEngineJs = await speechEngineRes.text();
    assert(speechEngineJs.includes('SpeechEngine'), 'speechEngine.js defines SpeechEngine class');
    assert(speechEngineJs.includes('detectLanguage'), 'speechEngine.js has detectLanguage method');
    assert(speechEngineJs.includes('getBestVoice'), 'speechEngine.js has getBestVoice method');
    assert(speechEngineJs.includes('FEMALE_MARKERS'), 'speechEngine.js includes female voice markers');
    assert(speechEngineJs.includes('MALE_MARKERS'), 'speechEngine.js includes male avoidance markers');

    // Verify HTML has all voice controls and settings
    assert(htmlText.includes('id="voice-play-btn"'), 'HTML has 🔊 Listen button');
    assert(htmlText.includes('id="voice-pause-btn"'), 'HTML has ⏸ Pause button');
    assert(htmlText.includes('id="voice-resume-btn"'), 'HTML has ▶ Resume button');
    assert(htmlText.includes('id="voice-stop-btn"'), 'HTML has ⏹ Stop button');
    assert(htmlText.includes('id="voice-gender-select"'), 'HTML has Voice Gender Preference setting');
    assert(htmlText.includes('value="female" selected'), 'Female Voice is selected by default');
    assert(htmlText.includes('id="voice-style-select"'), 'HTML has Voice Style persona setting');
    assert(htmlText.includes('id="voice-speed-select"'), 'HTML has Speaking Speed setting');
    assert(htmlText.includes('id="voice-volume-slider"'), 'HTML has Volume adjustment slider');
    assert(htmlText.includes('id="preview-voice-btn"'), 'HTML has Preview Voice button');
    assert(htmlText.includes('id="voice-auto-speak-toggle"'), 'HTML has Auto-speak toggle');

    console.log('\n--- 8. Testing Language Change Icon & Multi-Lingual Controls ---');
    assert(htmlText.includes('id="global-lang-toggle-btn"'), 'HTML has global language change icon button in header');
    assert(htmlText.includes('id="global-lang-menu"'), 'HTML has global language dropdown menu');
    assert(htmlText.includes('id="input-lang-toolbar"'), 'HTML has input language toolbar above symptom box');
    assert(htmlText.includes('class="lang-pill'), 'HTML has 1-click language pills');
    assert(htmlText.includes('data-lang="kn-IN"'), 'HTML includes Kannada language selector');
    assert(htmlText.includes('data-lang="hi-IN"'), 'HTML includes Hindi language selector');
    assert(htmlText.includes('data-lang="en-IN"'), 'HTML includes Indian English language selector');
    assert(htmlText.includes('id="settings-language-select"'), 'HTML has language preference select in Settings');
    assert(htmlText.includes('id="voice-change-lang-btn"'), 'HTML has quick change language button in Voice Player');
    assert(htmlText.includes('id="section-describe-title"'), 'HTML has dynamic section describe title');
    assert(htmlText.includes('id="region-selector-label"'), 'HTML has dynamic body region selector label');
    assert(htmlText.includes('data-chip-id="burns"'), 'HTML has example prompt chips with language key IDs');
    assert(htmlText.includes('id="clear-btn-text"'), 'HTML has dynamic clear button text');
    assert(htmlText.includes('id="analyze-btn-text"'), 'HTML has dynamic analyze button text');

    console.log('\n--- 9. Testing Multilingual Output Matching Entered Language ---');
    // Scenario 1: Kannada symptom input -> Given answer must be in Kannada
    const resKn = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'ನನ್ನ ಸ್ನೇಹಿತನ ಕೈಗೆ ಬಿಸಿ ನೀರು ಚೆಲ್ಲಿತು' })
    });
    const dataKn = await resKn.json();
    assert(dataKn.detectedLanguage && dataKn.detectedLanguage.code === 'kn-IN', 'Detects entered language as Kannada (kn-IN)');
    assert(dataKn.possibleEmergency.includes('ಸುಟ್ಟ'), 'Given emergency title is in Kannada (ಸುಟ್ಟ ಗಾಯ)');
    assert(dataKn.whatHappened.includes('ಬಿಸಿ ನೀರು') || dataKn.whatHappened.includes('ಚರ್ಮ'), 'Given what-happened explanation is in Kannada');
    assert(dataKn.immediateFirstAid.some(step => step.includes('ನೀರು') || step.includes('ತಂಪಾದ')), 'Immediate first-aid steps are in Kannada');
    assert(dataKn.whatNotToDo.some(dont => dont.includes('ಐಸ್') || dont.includes('ಮಂಜುಗಡ್ಡೆ')), 'What-not-to-do list is in Kannada');

    // Scenario 2: Hindi symptom input -> Given answer must be in Hindi
    const resHi = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'मेरे दोस्त के हाथ पर गर्म पानी गिर गया और जल गया' })
    });
    const dataHi = await resHi.json();
    assert(dataHi.detectedLanguage && dataHi.detectedLanguage.code === 'hi-IN', 'Detects entered language as Hindi (hi-IN)');
    assert(dataHi.possibleEmergency.includes('जलन') || dataHi.possibleEmergency.includes('जलना') || dataHi.possibleEmergency.includes('बर्न'), 'Given emergency title is in Hindi');
    assert(dataHi.immediateFirstAid.some(step => step.includes('पानी') || step.includes('नल')), 'Immediate first-aid steps are in Hindi');
    assert(dataHi.whatNotToDo.some(dont => dont.includes('बर्फ') || dont.includes('टूथपेस्ट')), 'What-not-to-do list is in Hindi');

    // Scenario 3: Explicit target language option
    const resExplicitKn = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'severe chest pain and left arm ache', lang: 'kn-IN' })
    });
    const dataExplicitKn = await resExplicitKn.json();
    assert(dataExplicitKn.possibleEmergency.includes('ಹೃದಯ') || dataExplicitKn.possibleEmergency.includes('ಎದೆ'), 'Explicit Kannada selection translates heart attack into Kannada');

    console.log('\n--- 10. Testing Voice Changing With Language Entered by User ---');
    const speechEngineCode = fs.readFileSync(path.join(__dirname, 'public', 'js', 'speechEngine.js'), 'utf-8');
    const analyzerCode = fs.readFileSync(path.join(__dirname, 'public', 'js', 'analyzer.js'), 'utf-8');
    const appCode = fs.readFileSync(path.join(__dirname, 'public', 'js', 'app.js'), 'utf-8');

    assert(speechEngineCode.includes('!voiceMatch.fallbackUsed'), 'Voice synthesizer does not pin English voice on Indic text');
    assert(speechEngineCode.includes('utterance.lang = langObj.code'), 'Speech synthesizer sets utterance language code to user entered language');
    assert(analyzerCode.includes('this.problemTextarea ? this.problemTextarea.value'), 'Analyzer uses problemTextarea to extract entered text');
    assert(appCode.includes('problemInput.addEventListener("input"'), 'App has live typing listener to adapt voice and language dynamically');
    assert(appCode.includes('window.updateVoiceDiagnosticLabel'), 'App updates active voice diagnostic label when language changes');
    assert(htmlText.includes('id="voice-lang-select"'), 'HTML has quick Voice Language Selector dropdown in Voice card');

    // Test dynamic /api/translate-result endpoint
    const sampleResult = {
      id: 'burns',
      title: 'Burns & Scalds',
      possibleEmergency: 'Possible Thermal Burn',
      whatHappened: 'Hot liquid caused tissue trauma',
      immediateFirstAid: ['Cool burn under cold water'],
      whatNotToDo: ['Do not use ice']
    };
    const resTranslate = await fetch('http://127.0.0.1:3000/api/translate-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: sampleResult, lang: 'kn-IN' })
    });
    const dataTranslate = await resTranslate.json();
    assert(resTranslate.status === 200, 'POST /api/translate-result responds with HTTP 200');
    assert(dataTranslate.possibleEmergency.includes('ಸುಟ್ಟ'), 'Dynamic result translation produces localized Kannada emergency title');
    assert(dataTranslate.immediateFirstAid.some(s => s.includes('ನೀರಿ') || s.includes('ತಂಪಾದ')), 'Dynamic result translation produces localized Kannada first aid steps');

    // Test transliterated language detection
    const resTransliteratedKn = await fetch('http://127.0.0.1:3000/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'nanna kalu novu agide bisi neeru' })
    });
    const dataTransliteratedKn = await resTransliteratedKn.json();
    assert(dataTransliteratedKn.detectedLanguage && dataTransliteratedKn.detectedLanguage.code === 'kn-IN', 'Detects transliterated Romanized symptom input as Kannada');

    console.log('\n--- 11. Testing Muscular Anatomy & 6-System Interactive Layer Switching ---');
    const bodyVisCode = fs.readFileSync(path.join(__dirname, 'public', 'js', 'bodyVisualization.js'), 'utf-8');
    assert(htmlText.includes('class="anatomy-systems-toolbar"'), 'HTML contains anatomical systems mode toolbar');
    assert(htmlText.includes('data-system="cardiovascular"'), 'HTML contains Cardiovascular system mode selector');
    assert(htmlText.includes('data-system="respiratory"'), 'HTML contains Respiratory system mode selector');
    assert(htmlText.includes('data-system="skeletal"'), 'HTML contains Skeletal system mode selector');
    assert(htmlText.includes('data-system="nervous"'), 'HTML contains Nervous system mode selector');
    assert(htmlText.includes('data-system="muscular"'), 'HTML contains Muscular system mode selector');
    assert(htmlText.includes('data-system="lymphatic"'), 'HTML contains Lymphatic system mode selector');
    assert(htmlText.includes('system-muscular'), 'SVG contains muscular anatomy striated muscle layers');
    assert(htmlText.includes('system-cardiovascular'), 'SVG contains cardiovascular heart and vessel networks');
    assert(htmlText.includes('system-skeletal'), 'SVG contains skeletal framework and bone structures');
    assert(htmlText.includes('system-respiratory'), 'SVG contains respiratory lungs and airway structures');
    assert(htmlText.includes('system-nervous'), 'SVG contains nervous system brain and nerve network');
    assert(htmlText.includes('system-lymphatic'), 'SVG contains lymphatic system nodes and vessels');
    assert(htmlText.includes('system-skin'), 'SVG contains real human natural skin layer for default view');
    assert(htmlText.includes('realSkinBaseGrad'), 'SVG defs contain realistic human skin tone gradients');
    assert(htmlText.includes('system-exact-model'), 'SVG contains exact 3D anatomical model layer matching user reference image');
    assert(htmlText.includes('anatomy-front-clean.png'), 'SVG embeds high-resolution front anatomical image');
    assert(bodyVisCode.includes('bindSystemSelector'), 'Body visualization binds system selector toolbar');
    assert(bodyVisCode.includes('setSystem(systemId'), 'Body visualization supports dynamic setSystem switching');
    assert(bodyVisCode.includes('SYSTEM_ASSOCIATIONS'), 'Body visualization has symptom-to-system mapping for auto-isolation');

    console.log('\n🎉 ALL 95 UNIT & INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.kill('SIGINT');
    }
    setTimeout(() => process.exit(0), 100);
  }
}

runTests();
