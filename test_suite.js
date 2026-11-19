/**
 * Comprehensive Automated Test Suite for FirstAid+
 */

const { spawn } = require('child_process');
const path = require('path');

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

    console.log('\n🎉 ALL 20 UNIT & INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🎉\n');
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
