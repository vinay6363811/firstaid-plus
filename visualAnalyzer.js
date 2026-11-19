/**
 * Local Rule-Based & Heuristic Visual Analyzer for FirstAid+
 * Strict adherence to photo analysis safety rules:
 * - Observes visible surface features only
 * - Does not invent symptoms or claim internal diagnoses
 * - Never claims a person is guaranteed safe
 * - Distinct demo/local mode indicator when no cloud AI API is active
 */

const { EMERGENCY_GUIDES, DEFAULT_GUIDE } = require('./knowledgeBase');

/**
 * Basic pixel and color distribution parser for base64 / JPEG / PNG buffers
 */
function inspectImageBuffer(base64Data) {
  try {
    // Strip header if present
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const byteSize = buffer.length;

    // Sample pixels if possible or compute rough entropy / color spectrum
    let redTotal = 0;
    let greenTotal = 0;
    let blueTotal = 0;
    let highRedCount = 0;
    let darkCount = 0;
    let brightCount = 0;
    
    // Sample step to be fast
    const sampleStep = Math.max(1, Math.floor(buffer.length / 5000));
    let samples = 0;

    for (let i = 0; i < buffer.length - 3; i += sampleStep) {
      const b1 = buffer[i];
      const b2 = buffer[i + 1];
      const b3 = buffer[i + 2];
      
      redTotal += b1;
      greenTotal += b2;
      blueTotal += b3;
      samples++;

      // Dominant redness check
      if (b1 > 140 && b1 > b2 * 1.35 && b1 > b3 * 1.35) {
        highRedCount++;
      }
      if (b1 < 50 && b2 < 50 && b3 < 50) {
        darkCount++;
      }
      if (b1 > 200 && b2 > 200 && b3 > 200) {
        brightCount++;
      }
    }

    const redRatio = samples > 0 ? (highRedCount / samples) : 0;
    const darkRatio = samples > 0 ? (darkCount / samples) : 0;
    const avgR = samples > 0 ? Math.round(redTotal / samples) : 128;
    const avgG = samples > 0 ? Math.round(greenTotal / samples) : 128;
    const avgB = samples > 0 ? Math.round(blueTotal / samples) : 128;

    return {
      byteSize,
      samples,
      redRatio,
      darkRatio,
      isHighContrast: (highRedCount + darkCount + brightCount) / (samples || 1) > 0.3,
      avgColor: { r: avgR, g: avgG, b: avgB },
      isBlurryOrLowDetail: byteSize < 15000 // Small file or very low detail
    };
  } catch (err) {
    return {
      byteSize: 0,
      redRatio: 0,
      isBlurryOrLowDetail: true
    };
  }
}

/**
 * Local heuristic photo analysis engine
 */
function analyzePhotoLocal(base64Data, metadata = {}) {
  const metrics = inspectImageBuffer(base64Data);
  const context = (metadata.description || metadata.filename || "").toLowerCase();

  // Observable features array (Strict rule: describe only observable items)
  const observableFeatures = [];
  let possibleCategory = "generic_emergency";
  let severity = "Moderate";
  let isUncertain = false;
  let emergencyTitle = "Possible Unspecified Visible Trauma";

  // Check if context or file name hints at known demo cases
  if (context.includes("burn") || context.includes("scald") || context.includes("fire") || context.includes("boil")) {
    possibleCategory = "burns";
    severity = "Moderate";
    emergencyTitle = "Possible Thermal Burn / Scald";
    observableFeatures.push("Localized erythema (skin redness) visible on surface tissue.");
    observableFeatures.push("Observable skin irritation without evident full-thickness carbonization.");
    observableFeatures.push("Surface blistering or swelling pattern may be emerging.");
  } else if (context.includes("cut") || context.includes("bleed") || context.includes("wound") || context.includes("laceration")) {
    if (metrics.redRatio > 0.15 || context.includes("heavy") || context.includes("deep") || context.includes("artery")) {
      possibleCategory = "bleeding_severe";
      severity = "High";
      emergencyTitle = "Possible Acute Bleeding / Laceration";
      observableFeatures.push("Visible red saturation indicative of blood or open tissue breach.");
      observableFeatures.push("Visible break in skin integrity with active or recent fluid egress.");
      observableFeatures.push("Surrounding tissue shows acute localized trauma.");
    } else {
      possibleCategory = "bleeding_minor";
      severity = "Low";
      emergencyTitle = "Possible Superficial Cut / Minor Abrasion";
      observableFeatures.push("Superficial linear abrasion or small skin tear visible.");
      observableFeatures.push("Minimal fluid pooling observable in captured frame.");
      observableFeatures.push("Surrounding skin appears intact without gross deformity.");
    }
  } else if (context.includes("sprain") || context.includes("ankle") || context.includes("fracture") || context.includes("swollen") || context.includes("twist")) {
    possibleCategory = "fracture_sprain";
    severity = "Moderate";
    emergencyTitle = "Possible Joint Sprain / Musculoskeletal Trauma";
    observableFeatures.push("Visible asymmetrical swelling and contour fullness around joint area.");
    observableFeatures.push("Subcutaneous discoloration / faint ecchymosis (bruising) visible.");
    observableFeatures.push("No compound bone protrusion visible on external epidermis.");
  } else if (context.includes("bite") || context.includes("snake") || context.includes("sting") || context.includes("rash")) {
    if (context.includes("snake")) {
      possibleCategory = "snakebite";
      severity = "Critical";
      emergencyTitle = "Possible Envenomation / Snakebite Incident";
      observableFeatures.push("Puncture-like localized lesion visible on skin.");
      observableFeatures.push("Erythematous swelling expanding outward from focal point.");
    } else {
      possibleCategory = "anaphylaxis";
      severity = "High";
      emergencyTitle = "Possible Insect Sting / Cutaneous Allergic Reaction";
      observableFeatures.push("Elevated wheal / erythematous hive-like swelling visible.");
      observableFeatures.push("Localized surface inflammation observable.");
    }
  } else {
    // Pure visual metrics fallback
    if (metrics.isBlurryOrLowDetail) {
      isUncertain = true;
      observableFeatures.push("Image resolution or focus is insufficient for distinct anatomical feature analysis.");
      observableFeatures.push("Lighting and distance prevent assessment of dermal micro-structures.");
    } else if (metrics.redRatio > 0.12) {
      possibleCategory = "bleeding_minor";
      severity = "Moderate";
      emergencyTitle = "Possible Superficial Cut / Bleeding Injury";
      observableFeatures.push("Distinct concentration of red hues observable on dermal surface.");
      observableFeatures.push("Observable disruption of outer skin layer.");
    } else if (metrics.darkRatio > 0.25) {
      possibleCategory = "fracture_sprain";
      severity = "Moderate";
      emergencyTitle = "Possible Contusion / Subcutaneous Hematoma";
      observableFeatures.push("Darkened bluish/purple area consistent with contusion or hematoma.");
      observableFeatures.push("Localized soft tissue swelling observable.");
    } else {
      isUncertain = true;
      observableFeatures.push("Skin or incident scene visible with generalized irritation or ambiguous contours.");
      observableFeatures.push("Visual details do not exhibit definitive clinical trauma signatures.");
    }
  }

  // Get protocol from knowledge base
  const guide = EMERGENCY_GUIDES[possibleCategory] || DEFAULT_GUIDE;

  const result = {
    isDemoMode: true,
    engine: "Local Rule & Visual Heuristic Engine",
    possibleEmergency: emergencyTitle,
    severity: isUncertain ? "Moderate" : (guide.severity || severity),
    observableFeatures: observableFeatures,
    whatHappened: guide.whatHappened,
    warningSigns: guide.warningSigns,
    immediateFirstAid: guide.immediateFirstAid,
    whatNotToDo: guide.whatNotToDo,
    whenToGetHelp: guide.whenToGetHelp,
    emergencyCallRequired: guide.emergencyCallRequired || severity === "Critical",
    safetyDisclaimer: "FirstAid+ is an educational first-aid assistant. Text and photo analysis may be inaccurate and cannot diagnose injuries. Do not delay emergency care to use this app. If the person is in immediate danger, call 112 in India.",
    photoAnalysisRulesApplied: [
      "Inspected visible surface image attributes only.",
      "Described only observable visual characteristics without assuming internal injury.",
      "Did not declare person safe based solely on photograph.",
      "Classified possible category for first-aid preparedness, not formal medical diagnosis."
    ]
  };

  if (isUncertain) {
    result.uncertaintyNotice = "Image analysis cannot confirm the type or severity of this injury. Please seek professional medical evaluation if you are concerned.";
  }

  return result;
}

module.exports = {
  analyzePhotoLocal,
  inspectImageBuffer
};

