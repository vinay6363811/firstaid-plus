/**
 * FirstAid+ Module 11: AI Medicine & Relief Recommendations Engine
 * Clinical pharmacology, verified Indian OTC brand guide, NPPA price estimation,
 * safe home remedies, and nearby pharmacy discovery.
 *
 * Grounded in Central Drugs Standard Control Organisation (CDSCO),
 * National Pharmaceutical Pricing Authority (NPPA), and WHO Essential Medicines list.
 */

'use strict';

// ============================================================================
// 1. SYMPTOM CATEGORIES & OTC PHARMACOLOGICAL KNOWLEDGE BASE
// ============================================================================

const MEDICINE_KNOWLEDGE_BASE = {
  headache: {
    id: 'headache',
    title: 'Headache & Migraine Relief',
    category: 'Neurological & Pain Relief',
    synonyms: ['headache', 'head ache', 'migraine', 'throbbing head', 'tension headache', 'sir dard', 'sar dard', 'tale novu', 'thale novu', 'thalai vali', 'tala noppi'],
    isSelfCareAppropriate: true,
    redFlags: [
      'Sudden, explosive "thunderclap" headache reaching maximum severity in seconds',
      'Headache accompanied by stiff neck, high fever, or confusion',
      'Headache following a head strike, fall, or trauma with vomiting',
      'Sudden weakness, facial numbness, or slurred speech (suspected stroke)',
      'New visual loss, double vision, or aura lasting over 60 minutes'
    ],
    followUpQuestions: [
      { id: 'age', question: 'Patient age group?', options: ['Child (<12 years)', 'Teen / Adult (12-65)', 'Senior (>65 years)', 'Pregnant / Nursing'] },
      { id: 'duration', question: 'How long has the headache lasted?', options: ['Less than 4 hours', '1 - 2 days', 'More than 3 days recurring'] },
      { id: 'severity', question: 'Pain severity?', options: ['Mild (dull ache)', 'Moderate (interferes with work)', 'Severe / Incapacitating'] },
      { id: 'conditions', question: 'Pre-existing health conditions?', options: ['None', 'Acidity / Stomach Ulcer', 'Liver Disease', 'Kidney Disease', 'High Blood Pressure'] }
    ],
    otcMedicines: [
      {
        id: 'med_paracetamol',
        genericName: 'Paracetamol (Acetaminophen) 500mg / 650mg',
        brandExamples: ['Dolo 650', 'Calpol 650', 'Crocin 650', 'Pacimol 650'],
        formulation: 'Oral Tablets / Syrups / Drops',
        whatItIsUsedFor: 'First-line relief for mild to moderate headaches, tension headaches, and fever.',
        whyItHelps: 'Selectively inhibits prostaglandin synthesis in the central nervous system, raising the pain threshold without irritating the gastric lining.',
        commonSideEffects: 'Generally very well tolerated at standard dosages. Rare allergic skin rash, mild nausea.',
        importantWarnings: 'Never exceed 4,000 mg in 24 hours (maximum 4-6 tablets of 650mg per day, spaced at least 4-6 hours apart). Avoid alcohol. Do not combine with other paracetamol-containing cough/cold medicines.',
        whoShouldAvoid: 'Severe active liver disease, chronic heavy alcohol consumption, or known paracetamol hypersensitivity.',
        drugInteractions: 'Warfarin (with prolonged daily high doses), Isoniazid.',
        scheduleStatus: 'OTC in India (Standard non-prescription pain reliever)',
        consultDoctorFirst: 'If headache persists beyond 48 hours or is accompanied by nausea and light sensitivity.',
        priceEstimate: {
          min: 22,
          max: 34,
          formatted: '₹22 – ₹34',
          packSize: 'Strip of 15 tablets',
          source: 'NPPA DPCO ceiling price & National Retail Chemist benchmark',
          availability: 'Widely available across all retail pharmacies & Jan Aushadhi Kendras (Generic: ~₹10-15 per strip)',
          lastUpdated: 'November 2026'
        }
      },
      {
        id: 'med_ibuprofen_paracetamol',
        genericName: 'Ibuprofen 400mg + Paracetamol 325mg Combination',
        brandExamples: ['Combiflam', 'Ibugesic Plus', 'Flexon'],
        formulation: 'Film-coated Tablets',
        whatItIsUsedFor: 'Moderate to severe tension headache or inflammatory headache when paracetamol alone is insufficient.',
        whyItHelps: 'Dual-action: Ibuprofen suppresses peripheral inflammatory prostaglandins (COX-1/COX-2), while paracetamol modulates central pain pathways.',
        commonSideEffects: 'Gastric discomfort, heartburn, mild nausea, dizziness.',
        importantWarnings: 'Always take after food or with milk. Do not take on an empty stomach. Avoid if dehydration is present.',
        whoShouldAvoid: 'Active stomach ulcer, history of GI bleeding, severe kidney or heart disease, third trimester of pregnancy, or aspirin-induced asthma.',
        drugInteractions: 'Aspirin, blood thinners (anticoagulants), ACE inhibitors, diuretics.',
        scheduleStatus: 'OTC in India for standard packaging (Take with caution)',
        consultDoctorFirst: 'Patients over 65, those with high blood pressure, or preexisting acid reflux.',
        priceEstimate: {
          min: 35,
          max: 50,
          formatted: '₹35 – ₹50',
          packSize: 'Strip of 20 tablets',
          source: 'Retail Pharmacy Average (India)',
          availability: 'Widely stocked across India',
          lastUpdated: 'November 2026'
        }
      }
    ],
    firstAidItems: [
      {
        name: 'Reusable Cold / Gel Ice Pack',
        whyNeeded: 'Applying cold to temples or forehead constricts dilated blood vessels, providing drug-free migraine and tension relief.',
        howToUse: 'Wrap gel pack in a clean cloth (never apply ice directly to bare skin) and place on forehead or neck for 15 minutes.',
        priceEstimate: '₹120 – ₹220',
        availability: 'Available at pharmacies & medical supply shops'
      },
      {
        name: 'Mentholated Topical Headache Balm (Ayurvedic/Herbal)',
        whyNeeded: 'Menthol and eucalyptus stimulate cold-sensitive cutaneous receptors, blocking nociceptive pain signals.',
        howToUse: 'Gently rub a pea-sized amount onto temples and forehead, keeping away from eyes.',
        priceEstimate: '₹40 – ₹90 (10g - 25g tin)',
        availability: 'Available at all chemist shops (e.g. Amrutanjan, Tiger Balm, Zandu Balm)'
      }
    ],
    homeRemedies: {
      safeRemedies: [
        'Rest in a quiet, dark, well-ventilated room with eyes closed for 30–45 minutes.',
        'Hydrate immediately: Drink 1-2 tall glasses (300-500 ml) of room-temperature water, as mild dehydration is a very common headache trigger.',
        'Gentle neck, shoulder, and temple acupressure massage using circular finger motions.',
        'Limit screen time: Turn off smartphones, computers, and bright fluorescent lighting.'
      ],
      dangerousPracticesToAvoid: [
        'DO NOT take combination pain relievers (caffeine/codeine) daily for >10 days (causes Medication Overuse Rebound Headache).',
        'DO NOT take aspirin or NSAIDs on an empty stomach or with alcohol (severe gastric erosion risk).',
        'DO NOT ignore sudden severe headaches with neurological signs like speech changes or confusion.'
      ]
    },
    whenToSeeDoctor: 'Consult a physician if headaches occur more than twice weekly, awaken you from sleep, fail to respond to standard OTC analgesics, or worsen steadily over time.'
  },

  fever: {
    id: 'fever',
    title: 'Fever & Elevated Temperature Care',
    category: 'Infectious & General Illness',
    synonyms: ['fever', 'high temp', 'temperature', 'bukhar', 'jwara', 'jvara', 'kaichal', 'jwaram', 'chills', 'pyrexia', 'hot body'],
    isSelfCareAppropriate: true,
    redFlags: [
      'Body temperature exceeding 103°F (39.4°C) in adults or 101°F in infants under 3 months',
      'Fever accompanied by purple/red skin rash that does not fade under pressure',
      'Convulsions, tremors, or febrile seizures',
      'Difficulty breathing, chest pain, or bluish lips/fingertips',
      'Stiff neck, severe photophobia, or extreme drowsiness/confusion',
      'Continuous fever lasting more than 3 consecutive days in India (suspected Dengue, Malaria, or Typhoid)'
    ],
    followUpQuestions: [
      { id: 'age', question: 'Patient age?', options: ['Infant (<6 months)', 'Child (6m-12y)', 'Adult (12-65)', 'Elderly (>65)'] },
      { id: 'duration', question: 'How many days of fever?', options: ['Day 1 (under 24h)', '2 to 3 days', 'More than 3 days'] },
      { id: 'highestTemp', question: 'Highest recorded temperature?', options: ['Below 100°F (Mild)', '100°F - 102°F (Moderate)', 'Above 102°F (High)'] }
    ],
    otcMedicines: [
      {
        id: 'med_paracetamol_fever',
        genericName: 'Paracetamol (Acetaminophen) 500mg / 650mg',
        brandExamples: ['Dolo 650', 'Calpol 650 / 500', 'Crocin 650', 'Sumo L 650'],
        formulation: 'Tablets / Drops (100mg/ml for infants) / Suspension (120mg/5ml or 250mg/5ml for kids)',
        whatItIsUsedFor: 'Gold-standard, safest antipyretic for lowering elevated body temperature in viral fevers, flu, and post-vaccination fever.',
        whyItHelps: 'Acts on the preoptic hypothalamic heat-regulating center to produce peripheral vasodilation, sweating, and rapid heat dissipation.',
        commonSideEffects: 'Extremely safe when taken within therapeutic dose. Mild sweating as fever breaks.',
        importantWarnings: 'Wait at least 4 to 6 hours between doses. Never take more than 4,000 mg in 24 hours. In India, if Dengue is prevalent, Paracetamol is the ONLY safe fever medication — NEVER use Aspirin or Ibuprofen.',
        whoShouldAvoid: 'Severe liver impairment. For infants under 3 months, consult a pediatrician before administering any antipyretic.',
        drugInteractions: 'Alcohol, Barbiturates.',
        scheduleStatus: 'OTC in India',
        consultDoctorFirst: 'If fever does not drop after 48 hours or if accompanied by chills and joint pain.',
        priceEstimate: {
          min: 20,
          max: 32,
          formatted: '₹20 – ₹32',
          packSize: 'Strip of 15 tablets',
          source: 'NPPA / Retail Chemist Average (India)',
          availability: 'Universal availability across every medical store in India',
          lastUpdated: 'November 2026'
        }
      }
    ],
    firstAidItems: [
      {
        name: 'Digital Clinical Thermometer',
        whyNeeded: 'Accurate temperature monitoring is essential to distinguish mild fevers (99-100.4°F) from clinically significant fevers (>101°F).',
        howToUse: 'Place tip under tongue or in armpit for 60 seconds until audio beep sounds. Clean tip with antiseptic wipe after use.',
        priceEstimate: '₹140 – ₹250',
        availability: 'Available at all pharmacies (e.g. Dr. Morepen, Omron, Hicks)'
      },
      {
        name: 'Oral Rehydration Salts (ORS WHO Formula)',
        whyNeeded: 'Fever accelerates respiratory and sweat water loss, leading to rapid electrolyte depletion and fatigue.',
        howToUse: 'Dissolve entire 21.8g packet in exactly 1 litre of clean drinking water. Sip steadily throughout the day.',
        priceEstimate: '₹18 – ₹22 per sachet',
        availability: 'Available everywhere (Electral, Prolyte, ORS-L)'
      }
    ],
    homeRemedies: {
      safeRemedies: [
        'Lukewarm Sponge Bath: Sponge the forehead, neck, armpits, and groin with lukewarm (room temperature) tap water. Evaporation lowers skin temperature gently.',
        'Aggressive Fluid Intake: Sip warm water, clear vegetable broth, tender coconut water, or diluted fruit juices to replace perspiration losses.',
        'Wear light, breathable cotton clothing and sleep under a single thin bedsheet — do not bundle up in heavy blankets (which traps heat inside the body).'
      ],
      dangerousPracticesToAvoid: [
        'DO NOT use ice-cold water, ice cubes, or alcohol sponges (causes violent shivering, blood vessel constriction, and can spike core body temperature dangerously).',
        'DO NOT give Aspirin (Disprin) to children or teenagers (risk of fatal Reye\'s Syndrome liver/brain damage).',
        'DO NOT give Ibuprofen or Diclofenac if Dengue is possible (drastically worsens platelet drop and internal hemorrhage risk).'
      ]
    },
    whenToSeeDoctor: 'Immediately see a doctor if fever lasts >72 hours, does not respond to paracetamol, or if accompanied by intense joint/eye pain (Dengue symptoms), or rigors/shivering (Malaria).'
  },

  cough_cold: {
    id: 'cough_cold',
    title: 'Cold, Cough & Sore Throat Relief',
    category: 'Respiratory & ENT Care',
    synonyms: ['cold', 'cough', 'sore throat', 'khansi', 'jukam', 'gala kharab', 'kemmu', 'gondu novu', 'irumal', 'daggulu', 'runny nose', 'congestion'],
    isSelfCareAppropriate: true,
    redFlags: [
      'Inability to swallow saliva, drooling, or severe stridor (high-pitched breathing noise)',
      'Shortness of breath, wheezing, or chest tightness',
      'Coughing up significant quantities of bright red blood',
      'High fever lasting longer than 4 consecutive days with purulent yellow/green phlegm',
      'Swelling in the neck or inability to open mouth fully (trismus)'
    ],
    followUpQuestions: [
      { id: 'coughType', question: 'What type of cough?', options: ['Dry, tickly, hacking cough', 'Wet, productive with mucus/phlegm', 'Sore scratchy throat only'] },
      { id: 'age', question: 'Age of patient?', options: ['Under 6 years', '6 to 12 years', 'Adult / Senior'] },
      { id: 'duration', question: 'Duration of cold?', options: ['1 - 3 days', '4 - 7 days', 'Over 10 days'] }
    ],
    otcMedicines: [
      {
        id: 'med_cetirizine',
        genericName: 'Cetirizine Hydrochloride 10mg',
        brandExamples: ['Cetzine', 'Alerid', 'Okacet', 'Zyrtec'],
        formulation: 'Film-coated Tablets / 5mg Syrup',
        whatItIsUsedFor: 'Relief of sneezing, runny nose, allergic rhinitis, watery itchy eyes, and throat tickle.',
        whyItHelps: 'Second-generation non-sedating H1-antihistamine that blocks histamine-mediated capillary permeability and nasal secretions.',
        commonSideEffects: 'Mild drowsiness in sensitive individuals, dry mouth, mild headache.',
        importantWarnings: 'Take once daily, preferably at bedtime. Do not drive or operate machinery until you know how it affects you. Avoid alcohol.',
        whoShouldAvoid: 'Severe renal failure (CrCl < 10 ml/min), children under 2 years without pediatrician guidance.',
        drugInteractions: 'CNS depressants, sedatives, alcohol.',
        scheduleStatus: 'OTC in India for standard 10mg pack',
        consultDoctorFirst: 'If nasal discharge becomes thick, foul-smelling, or unilateral.',
        priceEstimate: {
          min: 28,
          max: 45,
          formatted: '₹28 – ₹45',
          packSize: 'Strip of 10 tablets',
          source: 'Retail Pharmacy Average (India)',
          availability: 'Universal availability in all Indian medical stores',
          lastUpdated: 'November 2026'
        }
      },
      {
        id: 'med_cough_syrup',
        genericName: 'Dextromethorphan HBr 10mg + Chlorpheniramine 2mg (Dry Cough)',
        brandExamples: ['Benadryl DR', 'Ascoril D Plus', 'Zedex Dry Cough'],
        formulation: 'Oral Syrup (100 ml bottle)',
        whatItIsUsedFor: 'Symptomatic suppression of non-productive, dry, tickly, sleep-disrupting cough.',
        whyItHelps: 'Dextromethorphan acts centrally on the medullary cough center to elevate the threshold for coughing without suppressing normal ciliary clearance.',
        commonSideEffects: 'Drowsiness, mild dizziness, nausea, dry mouth.',
        importantWarnings: 'Never use for productive wet chest cough (where mucus needs to be cleared from airways). Not recommended for children under 4 years.',
        whoShouldAvoid: 'Chronic asthma, severe COPD, respiratory depression, patients on MAO inhibitors or SSRIs.',
        drugInteractions: 'Antidepressants (MAOIs, SSRIs - risk of serotonin syndrome).',
        scheduleStatus: 'OTC / Schedule G/H in India (Ensure adult supervision)',
        consultDoctorFirst: 'If cough is accompanied by wheezing or shortness of breath.',
        priceEstimate: {
          min: 95,
          max: 145,
          formatted: '₹95 – ₹145',
          packSize: '100 ml bottle',
          source: 'Retail Pharmacy Benchmark (India)',
          availability: 'Widely stocked in Indian retail chemists',
          lastUpdated: 'November 2026'
        }
      },
      {
        id: 'med_saline_spray',
        genericName: 'Isotonic Sodium Chloride (0.9% Normal Saline Nasal Spray)',
        brandExamples: ['Nasoclear', 'Otrivin S', 'Solspre', 'Salin'],
        formulation: 'Nasal Spray / Drops',
        whatItIsUsedFor: 'Safe nasal decongestion, thinning thick mucus, and moisturising dry, inflamed nasal passages.',
        whyItHelps: 'Completely drug-free physiological saline gently thins mucous crusts, washes out allergens and viral particles, and restores ciliary function.',
        commonSideEffects: 'None. Safe for all ages including newborns and pregnant women.',
        importantWarnings: 'Do not share the spray nozzle with others to prevent cross-infection.',
        whoShouldAvoid: 'Safe for everyone. Zero contraindications.',
        drugInteractions: 'None.',
        scheduleStatus: 'OTC / Non-drug physiological solution',
        consultDoctorFirst: 'Not required.',
        priceEstimate: {
          min: 45,
          max: 75,
          formatted: '₹45 – ₹75',
          packSize: '20 ml - 30 ml bottle with nasal applicator',
          source: 'Retail Pharmacy Average (India)',
          availability: 'Available at all pharmacies',
          lastUpdated: 'November 2026'
        }
      }
    ],
    firstAidItems: [
      {
        name: 'Warm Salt Water Gargle Cup & Dispenser',
        whyNeeded: 'Hypertonic saline draws inflammatory fluid out of swollen pharyngeal tissues through osmosis, immediately easing swallowing pain.',
        howToUse: 'Dissolve 1/2 teaspoon of table salt in 1 glass (200 ml) of warm water. Gargle for 30 seconds and spit out (do not swallow). Repeat 3-4 times daily.',
        priceEstimate: '₹0 (Kitchen standard salt)',
        availability: 'Standard home item'
      },
      {
        name: 'Antiseptic Sore Throat Lozenges',
        whyNeeded: 'Contains amylmetacresol and dichlorobenzyl alcohol to provide topical antiseptic action and soothe raw mucosal nerves.',
        howToUse: 'Dissolve 1 lozenge slowly in the mouth every 3-4 hours as needed (e.g. Strepsils, Cofsils, Vicks).',
        priceEstimate: '₹35 – ₹55 per pack of 8-10 lozenges',
        availability: 'Available at all grocery and pharmacy counters'
      }
    ],
    homeRemedies: {
      safeRemedies: [
        'Warm Honey & Ginger Infusion: Mix 1 tablespoon of pure honey with 1/2 teaspoon fresh ginger juice in warm water. Honey coats the throat mucosa and is clinically proven to reduce nocturnal cough in children over 1 year.',
        'Steam Inhalation: Inhale steam from a bowl of hot water with a towel over your head for 8-10 minutes twice daily to loosen nasal and bronchial secretions.',
        'Hydration: Drink warm fluids like decaffeinated herbal tea, warm water, and clear soups to thin mucus secretions.'
      ],
      dangerousPracticesToAvoid: [
        'DO NOT give honey to infants under 1 year of age (high risk of fatal Infant Botulism from Clostridium botulinum spores).',
        'DO NOT demand or self-medicate with Antibiotics (e.g. Azithromycin, Amoxicillin) for common colds — 95% of colds and sore throats are VIRAL and antibiotics are useless and dangerous.',
        'DO NOT use topical medicated decongestant nasal sprays (like Xylometazoline / Otrivin) for more than 3 consecutive days (causes severe rebound Rhinitis Medicamentosa).'
      ]
    },
    whenToSeeDoctor: 'Consult an ENT specialist or physician if sore throat persists >5 days with white patches on tonsils, if you experience difficulty breathing, or if ear pain develops.'
  },

  acidity_stomach: {
    id: 'acidity_stomach',
    title: 'Acidity, Gastritis & Stomach Discomfort',
    category: 'Gastrointestinal Relief',
    synonyms: ['acidity', 'gas', 'heartburn', 'stomach pain', 'gastric', 'pet dard', 'pet me jalan', 'hotte novu', 'vayiru vali', 'kadupu noppi', 'indigestion', 'bloating'],
    isSelfCareAppropriate: true,
    redFlags: [
      'Severe, sudden stabbing abdominal pain that is rigid and tender to the touch (surgical acute abdomen)',
      'Vomiting blood or "coffee-ground" dark emesis',
      'Black, tarry, foul-smelling stools (Melena - indicates internal upper GI bleeding)',
      'Chest burning radiating to jaw, left arm, or accompanied by cold sweats (suspected Myocardial Infarction / Heart Attack)',
      'Pain localized to the lower right abdomen accompanied by nausea and fever (suspected Appendicitis)'
    ],
    followUpQuestions: [
      { id: 'painType', question: 'Primary symptom description?', options: ['Burning sensation behind breastbone (Acid reflux)', 'Upper stomach bloating / gas fullness', 'Cramping / griping lower abdominal pain'] },
      { id: 'mealRelation', question: 'When does it worsen?', options: ['Immediately after spicy/heavy meals', 'On an empty stomach / early morning', 'Continuous regardless of food'] },
      { id: 'duration', question: 'Duration of complaints?', options: ['Recent episode (<1 day)', 'Occasional over past weeks', 'Chronic daily heartburn'] }
    ],
    otcMedicines: [
      {
        id: 'med_antacid_gel',
        genericName: 'Aluminium Hydroxide + Magnesium Hydroxide + Simethicone Gel',
        brandExamples: ['Digene Gel', 'Gelusil Liquid', 'Mucaine Gel', 'Polycrol'],
        formulation: 'Oral Liquid Suspension (Mint / Orange flavour, 200 ml bottle) or Chewable Tablets',
        whatItIsUsedFor: 'Rapid symptomatic relief of acute heartburn, acid indigestion, sour stomach, and painful gas bloating.',
        whyItHelps: 'Direct chemical neutralization: Aluminium and Magnesium salts neutralize excess hydrochloric acid in the stomach lumen, raising pH. Simethicone reduces surface tension of gas bubbles so they can be expelled comfortably.',
        commonSideEffects: 'Minimal. Balanced aluminium (mildly constipating) and magnesium (mildly laxative) formula maintains normal bowel function.',
        importantWarnings: 'Take 10–15 ml after meals and at bedtime. Do not take within 2 hours of other oral medications (antacids impair drug absorption).',
        whoShouldAvoid: 'Severe renal failure (risk of aluminium/magnesium accumulation).',
        drugInteractions: 'Tetracyclines, Ciprofloxacin, Iron supplements, Digoxin (reduces absorption).',
        scheduleStatus: 'OTC in India (Standard non-prescription antacid)',
        consultDoctorFirst: 'If antacids are required daily for more than 2 weeks.',
        priceEstimate: {
          min: 110,
          max: 165,
          formatted: '₹110 – ₹165',
          packSize: '200 ml bottle',
          source: 'Retail Chemist Benchmark (India)',
          availability: 'Available in all pharmacies and supermarkets across India',
          lastUpdated: 'November 2026'
        }
      },
      {
        id: 'med_pantoprazole_otc',
        genericName: 'Pantoprazole 20mg / 40mg or Omeprazole 20mg (Proton Pump Inhibitor)',
        brandExamples: ['Pan 20 / 40', 'Pantocid 20', 'Omez 20', 'Pantop 20'],
        formulation: 'Enteric-coated Gastro-resistant Tablets',
        whatItIsUsedFor: 'Short-term relief of frequent heartburn, acid hypersecretion, and gastroesophageal reflux disease (GERD).',
        whyItHelps: 'Irreversibly inhibits the $H^+/K^+$ ATPase enzyme system (proton pump) of gastric parietal cells, blocking the final step of acid secretion for 24 hours.',
        commonSideEffects: 'Mild headache, diarrhea, abdominal flatulence, constipation.',
        importantWarnings: 'Take once daily in the morning 30–60 minutes BEFORE breakfast with a full glass of water. Swallow whole (do NOT crush or chew enteric coating).',
        whoShouldAvoid: 'Known hypersensitivity to PPIs, osteoporosis/bone fractures with long-term unmonitored use.',
        drugInteractions: 'Ketoconazole, Methotrexate, Clopidogrel.',
        scheduleStatus: 'Schedule H in India (Consult doctor/pharmacist for appropriate strength & duration)',
        consultDoctorFirst: 'Mandatory if symptoms include weight loss, swallowing difficulty, or anemia.',
        priceEstimate: {
          min: 75,
          max: 130,
          formatted: '₹75 – ₹130',
          packSize: 'Strip of 15 tablets',
          source: 'Retail Pharmacy Average (India)',
          availability: 'Widely stocked in all retail chemists',
          lastUpdated: 'November 2026'
        }
      }
    ],
    firstAidItems: [
      {
        name: 'Effervescent Soda / Acidity Sachet (Sodium Bicarbonate + Citric Acid)',
        whyNeeded: 'Rapid fizzing antacid providing quick neutralization of gastric acid within 3-5 minutes.',
        howToUse: 'Dissolve 1 sachet (5g) in a glass of water and drink immediately while effervescing (e.g. Eno).',
        priceEstimate: '₹8 – ₹10 per sachet',
        availability: 'Available at all chemist shops and local convenience stores'
      }
    ],
    homeRemedies: {
      safeRemedies: [
        'Cold Milk: Sip 1/2 glass of chilled, low-fat milk. The calcium and protein buffer gastric acid, while cold temperature soothes the burning esophagus.',
        'Fennel (Saunf) & Cumin (Jeera) Water: Boil 1 teaspoon of fennel and cumin seeds in water, strain, and sip warm. Relieves gas and stimulates digestive enzymes.',
        'Elevate Bed Head: Raise the head of your bed by 6 inches or use a wedge pillow to prevent nocturnal acid backflow into the food pipe.',
        'Eat smaller, frequent meals and avoid lying down flat for at least 2 hours after eating.'
      ],
      dangerousPracticesToAvoid: [
        'DO NOT mistake cardiac angina for "mere gas". If burning chest pressure is accompanied by heaviness, sweating, or radiation to the arm, CALL 112 IMMEDIATELY.',
        'DO NOT drink vinegar, lime juice, or spicy concoctions during acute gastritis (worsens mucosal burns).',
        'DO NOT take NSAID pain relievers (Brufen, Diclofenac, Aspirin) for stomach ache — they directly induce gastric ulcers.'
      ]
    },
    whenToSeeDoctor: 'Consult a gastroenterologist if acid reflux occurs more than 3 times a week, fails to resolve with OTC antacids, causes food to stick in the throat, or results in unexplained weight loss.'
  },

  minor_cuts: {
    id: 'minor_cuts',
    title: 'Minor Cuts, Abrasions & Wound Care',
    category: 'Trauma & Wound Care',
    synonyms: ['cut', 'minor cut', 'wound', 'scrape', 'scratch', 'gaya', 'chot', 'abrasion', 'bleeding finger', 'scraped knee'],
    isSelfCareAppropriate: true,
    redFlags: [
      'Pulsatile or spurting bright red blood that does not stop after 10 minutes of continuous direct pressure',
      'Deep gaping wound where yellow fat tissue or red muscle fibers are visible (requires surgical stitches within 6 hours)',
      'Wound caused by rusty metal, animal bite, or soil contamination if tetanus shot >5 years old',
      'Numbness or loss of sensation distal to the cut (nerve injury)',
      'Spreading red streaks, warmth, swelling, or foul-smelling yellow pus developing after 24 hours'
    ],
    followUpQuestions: [
      { id: 'bleedingStopped', question: 'Has bleeding stopped with pressure?', options: ['Yes, fully stopped', 'Still oozing slightly', 'No, bleeding continuously'] },
      { id: 'cleanliness', question: 'Is there dirt or glass in the wound?', options: ['Clean kitchen/paper cut', 'Dirty road/soil contact', 'Glass shard / foreign body embedded'] },
      { id: 'tetanusStatus', question: 'When was your last Tetanus Toxoid (TT) shot?', options: ['Within last 5 years', 'More than 5 years ago', 'Cannot remember / Unsure'] }
    ],
    otcMedicines: [
      {
        id: 'med_povidone_iodine',
        genericName: 'Povidone Iodine 5% / 10% Antiseptic Solution & Ointment',
        brandExamples: ['Betadine 5% / 10%', 'Cipladine', 'Wokadine', 'Povin'],
        formulation: 'Topical Solution (100 ml) / Ointment (15g - 20g tube)',
        whatItIsUsedFor: 'Gold-standard broad-spectrum antiseptic for disinfecting superficial cuts, grazes, scrapes, and preventing bacterial infection.',
        whyItHelps: 'Gradually releases free elemental iodine, which oxidizes microbial proteins and fatty acids, destroying bacteria, fungi, viruses, and spores within seconds.',
        commonSideEffects: 'Mild temporary skin staining (washes off with water), local stinging on open raw dermis.',
        importantWarnings: 'For external topical use ONLY. Do not use over large burned or ulcerated areas for prolonged periods.',
        whoShouldAvoid: 'Known hypersensitivity to iodine, thyroid dysfunction patients (long-term use).',
        drugInteractions: 'Hydrogen peroxide (antagonistic effect), silver sulfadiazine.',
        scheduleStatus: 'OTC in India (Universal first-aid antiseptic)',
        consultDoctorFirst: 'If wound has deep foreign matter or is gaping.',
        priceEstimate: {
          min: 45,
          max: 95,
          formatted: '₹45 – ₹95',
          packSize: '15g - 20g tube or 100ml liquid',
          source: 'Retail Chemist Benchmark (India)',
          availability: 'Available at every single pharmacy in India',
          lastUpdated: 'November 2026'
        }
      },
      {
        id: 'med_antibacterial_cream',
        genericName: 'Framycetin Skin Cream 1% or Neomycin + Polymyxin B',
        brandExamples: ['Soframycin Skin Cream', 'Neosporin Ointment'],
        formulation: 'Topical Cream / Ointment (30g tube)',
        whatItIsUsedFor: 'Topical prevention and treatment of superficial bacterial infection in minor abrasions and cuts.',
        whyItHelps: 'Aminoglycoside antibiotic that binds to bacterial 30S ribosomal subunits, inhibiting bacterial protein synthesis at the wound surface.',
        commonSideEffects: 'Rare contact dermatitis, local itching.',
        importantWarnings: 'Apply a very thin layer only 1-2 times daily after gentle cleaning. Do not use for more than 7 consecutive days.',
        whoShouldAvoid: 'Hypersensitivity to framycetin/neomycin. Do not apply into eyes.',
        drugInteractions: 'None significant for topical application.',
        scheduleStatus: 'Schedule H / OTC in common chemist practice',
        consultDoctorFirst: 'If cut does not begin healing within 3-4 days.',
        priceEstimate: {
          min: 55,
          max: 85,
          formatted: '₹55 – ₹85',
          packSize: '30g tube',
          source: 'Retail Pharmacy Average (India)',
          availability: 'Widely stocked in all Indian medical stores',
          lastUpdated: 'November 2026'
        }
      }
    ],
    firstAidItems: [
      {
        name: 'Adhesive First Aid Bandages (Washproof)',
        whyNeeded: 'Protects the clean wound from ambient dust, bacteria, and mechanical friction while allowing oxygen exchange.',
        howToUse: 'Peel sterile backing and center the non-stick absorbent pad over the cut. Change daily or whenever wet.',
        priceEstimate: '₹20 – ₹45 per box of 10-20 strips',
        availability: 'Available everywhere (Band-Aid, Hansaplast)'
      },
      {
        name: 'Sterile Gauze Swabs (7.5 cm x 7.5 cm, 12-ply)',
        whyNeeded: 'Essential for applying firm, sterile pressure to stop capillary bleeding without shedding fibers into the wound.',
        howToUse: 'Press directly over the bleeding site for 3-5 minutes. Tape in place with micropore surgical tape.',
        priceEstimate: '₹25 – ₹40 per sterile pack',
        availability: 'Available at all chemist shops'
      },
      {
        name: 'Micropore Surgical Paper Tape (1 inch)',
        whyNeeded: 'Hypoallergenic, breathable medical tape that securely anchors gauze dressings without tearing fragile skin.',
        howToUse: 'Tear required strip length and press onto dry skin bordering the gauze pad.',
        priceEstimate: '₹35 – ₹60 per roll',
        availability: 'Available at all pharmacies (3M Micropore)'
      }
    ],
    homeRemedies: {
      safeRemedies: [
        'Clean Running Tap Water: Thoroughly wash the cut under clean, cool running water for 2-3 minutes. This removes 95% of bacteria and physical particulate dirt — more effective than harsh disinfectants.',
        'Gentle Direct Pressure: Use a clean cloth or gauze pad to press firmly for 3-5 full minutes without repeatedly lifting the pad.',
        'Keep Clean & Dry: Once bleeding has stopped and antiseptic applied, keep the area clean and covered.'
      ],
      dangerousPracticesToAvoid: [
        'DO NOT apply coffee powder, turmeric, mud, cow dung, or burnt paper on bleeding cuts (extremely high risk of Tetanus and severe systemic bacterial infection).',
        'DO NOT wash wounds with Dettol/Savlon concentrate or pure Hydrogen Peroxide — it chemically destroys healthy healing dermis cells and causes scarring.',
        'DO NOT remove deeply embedded glass shards or knives yourself (stabilize and go immediately to the emergency room).'
      ]
    },
    whenToSeeDoctor: 'Seek medical attention within 6 hours if the wound is gaping, requires stitches, is contaminated with soil/rust, or if you need a Tetanus Toxoid (TT) booster vaccine.'
  },

  minor_burns: {
    id: 'minor_burns',
    title: 'Minor First & Superficial Second-Degree Burns',
    category: 'Trauma & Burn Care',
    synonyms: ['burn', 'minor burn', 'scald', 'hot water burn', 'oil burn', 'sutta gaya', 'jal gaya', 'bisi neeru sutta', 'theekkayam', 'kalindi'],
    isSelfCareAppropriate: true,
    redFlags: [
      'Full-thickness third-degree burns (charred black, leathery, white, or completely painless)',
      'Burns covering an area larger than the palm of the patient\'s hand (>2-3% Total Body Surface Area)',
      'Any burn involving the face, eyes, hands, feet, groin, or major joints',
      'Electrical burns or chemical burns (battery acid, industrial solvent)',
      'Inhalation of smoke or hot steam with singed nasal hairs or hoarse voice',
      'Infection signs: cloudy pus in blister, red spreading borders, high fever'
    ],
    followUpQuestions: [
      { id: 'burnType', question: 'What caused the burn?', options: ['Hot liquid / steam (Scald)', 'Hot utensil / iron / flame', 'Hot cooking oil / grease', 'Chemical / Electrical'] },
      { id: 'blisters', question: 'Are blisters present?', options: ['Redness & pain only (1st degree)', 'Small closed blisters (<1 inch)', 'Large broken open blisters'] },
      { id: 'area', question: 'Size and location?', options: ['Small spot on arm/leg (<2 inches)', 'Hand, face, or foot', 'Large area > palm size'] }
    ],
    otcMedicines: [
      {
        id: 'med_silver_sulfadiazine',
        genericName: 'Silver Sulfadiazine 1% Skin Cream',
        brandExamples: ['SilvrSTAT', 'Silverex Ionic', 'Burnol (Old/New formula)', 'Megaheal'],
        formulation: 'Topical Cream (15g - 30g tube)',
        whatItIsUsedFor: 'Prevention and treatment of wound sepsis in superficial partial-thickness burns after cooling.',
        whyItHelps: 'Combines silver ions (which damage bacterial cell walls and DNA) and sulfadiazine, providing broad-spectrum coverage against Pseudomonas aeruginosa and common burn pathogens.',
        commonSideEffects: 'Transient burning sensation, rare skin discoloration.',
        importantWarnings: 'Apply AFTER at least 15-20 minutes of water cooling. Never apply directly to raw bleeding tissue. Do not break blisters.',
        whoShouldAvoid: 'Known sulfonamide (sulfa) allergy, pregnant women near term, newborns under 2 months.',
        drugInteractions: 'Topical proteolytic enzymes (papain, collagenase).',
        scheduleStatus: 'OTC / Pharmacist dispensed in India',
        consultDoctorFirst: 'If burn covers face, hand, or joints.',
        priceEstimate: {
          min: 60,
          max: 120,
          formatted: '₹60 – ₹120',
          packSize: '20g - 30g tube',
          source: 'Retail Pharmacy Benchmark (India)',
          availability: 'Widely stocked in Indian medical stores',
          lastUpdated: 'November 2026'
        }
      },
      {
        id: 'med_paracetamol_burn_pain',
        genericName: 'Paracetamol (Acetaminophen) 500mg / 650mg',
        brandExamples: ['Dolo 650', 'Calpol 650', 'Crocin 650'],
        formulation: 'Oral Tablets',
        whatItIsUsedFor: 'Oral pain management for continuous burning sensations from first and second-degree burns.',
        whyItHelps: 'Centrally reduces prostaglandin-mediated pain receptor sensitization without blood thinning properties.',
        commonSideEffects: 'Rare at therapeutic doses.',
        importantWarnings: 'Space doses by 4-6 hours. Max 4,000 mg/day.',
        whoShouldAvoid: 'Severe liver disease.',
        drugInteractions: 'Alcohol.',
        scheduleStatus: 'OTC in India',
        consultDoctorFirst: 'If pain is unmanageable with standard analgesics.',
        priceEstimate: {
          min: 22,
          max: 32,
          formatted: '₹22 – ₹32',
          packSize: 'Strip of 15 tablets',
          source: 'NPPA / Retail Average',
          availability: 'Available everywhere',
          lastUpdated: 'November 2026'
        }
      }
    ],
    firstAidItems: [
      {
        name: 'Non-Adherent Sterile Paraffin Gauze Dressing',
        whyNeeded: 'Paraffin-impregnated tulle gras mesh prevents dressings from sticking to raw, delicate healing burn tissue.',
        howToUse: 'Place sterile tulle gras directly over the burn, then wrap lightly with dry sterile gauze (e.g. Jelonet, Bactigras).',
        priceEstimate: '₹40 – ₹70 per sterile pouch',
        availability: 'Available at medical supply stores and pharmacies'
      },
      {
        name: 'Pure Aloe Vera Soothing Gel (Cosmetic/Medical grade)',
        whyNeeded: 'Contains acemannan and polysaccharides that hydrate, reduce erythema, and stimulate epithelial regeneration in minor first-degree sunburns.',
        howToUse: 'Apply gently to unbroken, cooled, red skin 2-3 times daily.',
        priceEstimate: '₹80 – ₹160 (100ml)',
        availability: 'Available in pharmacies and personal care stores'
      }
    ],
    homeRemedies: {
      safeRemedies: [
        'IMMEDIATE COOL RUNNING WATER (RULE OF 20): Place the burned area under gentle, cool running tap water for AT LEAST 20 CONTINUOUS MINUTES. This arrests deep thermal penetration into underlying dermis layers and halves healing time.',
        'Remove Constricting Items: Promptly remove rings, watches, bangles, and tight clothing from the burned limb BEFORE swelling begins.',
        'Cover Loosely: After 20 minutes of cooling, cover loosely with clean plastic cling wrap or sterile non-stick cloth.'
      ],
      dangerousPracticesToAvoid: [
        'DO NOT apply toothpaste, butter, ghee, turmeric, cooking oil, or flour — this is DANGEROUS! It traps intense heat inside the tissue, guarantees bacterial infection, and must be painfully scrubbed off at the hospital.',
        'DO NOT apply ice or ice-cold water (causes thermal shock, severe vasoconstriction, and frostbite tissue necrosis).',
        'DO NOT POP BLISTERS! The blister roof is the body\'s natural sterile biological bandage. Popping it creates an open entry for lethal bacterial infection.'
      ]
    },
    whenToSeeDoctor: 'Immediately visit a hospital burn unit if the burn is larger than 2-3 inches, involves the face, hands, feet, or genitals, is painless/charred, or shows signs of infection.'
  },

  diarrhea_dehydration: {
    id: 'diarrhea_dehydration',
    title: 'Diarrhea, Loose Motions & Dehydration',
    category: 'Gastrointestinal & Fluid Balance',
    synonyms: ['diarrhea', 'diarrhoea', 'loose motion', 'motions', 'dast', 'patla dast', 'behedhagi', 'neeru bedhi', 'bedhi', 'kadupu thippi', 'vayiru pokku', 'dehydration'],
    isSelfCareAppropriate: true,
    redFlags: [
      'Stools containing visible blood, dark maroon clots, or excessive mucus (Dysentery)',
      'Severe dehydration signs: sunken eyes, dry tongue/mouth, no urination for >6-8 hours, extreme lethargy or confusion',
      'High continuous fever (>102°F) accompanied by severe abdominal cramping',
      'Persistent vomiting where patient cannot keep even small sips of fluid down for >6 hours',
      'Diarrhea lasting more than 48 hours without any improvement in frequency'
    ],
    followUpQuestions: [
      { id: 'age', question: 'Patient age?', options: ['Infant (<1 year)', 'Child (1-10 years)', 'Adult (11-65)', 'Senior (>65)'] },
      { id: 'frequency', question: 'How many loose stools in last 24 hours?', options: ['1 - 3 episodes', '4 - 7 episodes', 'More than 8 watery episodes'] },
      { id: 'bloodPresence', question: 'Is there blood in stools?', options: ['No blood (Watery/semi-solid)', 'Yes, visible red blood or mucus', 'Unsure'] }
    ],
    otcMedicines: [
      {
        id: 'med_ors_who',
        genericName: 'Oral Rehydration Salts (WHO Recommended Low-Osmolarity Formula)',
        brandExamples: ['Electral (FDC)', 'Prolyte ORS (Cipla)', 'ORS-L', 'Walyte'],
        formulation: 'Powder Sachet (21.8g for 1 litre water / 4.35g for 200ml)',
        whatItIsUsedFor: 'THE SINGLE MOST IMPORTANT LIFESAVING TREATMENT for acute diarrhea, gastroenteritis, and dehydration in all age groups.',
        whyItHelps: 'Employs sodium-glucose cotransport mechanism in intestinal epithelial cells: glucose actively transports sodium and water across the inflamed gut wall even during severe cholera or viral diarrhea.',
        commonSideEffects: 'None when mixed with correct water volume. Rare vomiting if gulped too rapidly.',
        importantWarnings: 'MUST be mixed in EXACTLY the specified amount of clean drinking water (typically 1 packet of 21.8g into exactly 1 litre water). Never mix with milk, juice, or soda. Do not add extra sugar or salt.',
        whoShouldAvoid: 'Severe intractable vomiting requiring IV fluids, paralytic ileus, severe kidney failure (anuria).',
        drugInteractions: 'None.',
        scheduleStatus: 'OTC in India (WHO Essential Medicine)',
        consultDoctorFirst: 'If patient cannot keep sips down or shows sunken eyes.',
        priceEstimate: {
          min: 18,
          max: 24,
          formatted: '₹18 – ₹24',
          packSize: '21.8g sachet (for 1 litre water)',
          source: 'NPPA DPCO ceiling price & Retail Chemist Average (India)',
          availability: 'Universal availability across every chemist, clinic, and sub-center in India',
          lastUpdated: 'November 2026'
        }
      },
      {
        id: 'med_probiotics',
        genericName: 'Probiotic Spores (Bacillus clausii or Saccharomyces boulardii)',
        brandExamples: ['Enterogermina Oral Suspension', 'Econorm Sachet', 'Darolac', 'Sporlac'],
        formulation: 'Mini Oral Vials (5 ml) / Capsules / Sachets',
        whatItIsUsedFor: 'Restoration of normal gut microflora, reducing duration and stool frequency in acute infectious diarrhea.',
        whyItHelps: 'Competitive inhibition of enteropathogens, synthesis of antimicrobial bacteriocins, and reinforcement of the gut mucosal barrier.',
        commonSideEffects: 'Extremely safe. Mild temporary gas or bloating.',
        importantWarnings: 'Can be taken directly from vial or mixed with water/milk. Safe for children and adults.',
        whoShouldAvoid: 'Severe immunocompromised states, central venous catheter patients (rare fungemia risk with boulardii).',
        drugInteractions: 'Take at least 2 hours apart from any oral antibiotics.',
        scheduleStatus: 'OTC in India',
        consultDoctorFirst: 'If diarrhea fails to improve after 48 hours.',
        priceEstimate: {
          min: 48,
          max: 75,
          formatted: '₹48 – ₹75',
          packSize: 'Single 5ml vial / sachet (Pack of 10: ~₹500)',
          source: 'Retail Pharmacy Average (India)',
          availability: 'Widely stocked in retail chemists',
          lastUpdated: 'November 2026'
        }
      },
      {
        id: 'med_zinc_supplement',
        genericName: 'Zinc Sulfate / Zinc Gluconate 20mg (Pediatric/Adult)',
        brandExamples: ['Zinconia', 'Zinconia 20', 'Becozinc G', 'Zincovit'],
        formulation: 'Dispersible Tablets / Syrup',
        whatItIsUsedFor: 'WHO-mandated adjuvant therapy for acute diarrhea in children and adults; significantly reduces severity, duration, and recurrence.',
        whyItHelps: 'Enhances intestinal mucosal regeneration, brush-border enzyme activity, and cellular immunity.',
        commonSideEffects: 'Mild metallic taste, transient nausea if taken on an empty stomach.',
        importantWarnings: 'Take once daily for 10-14 days continuously even after diarrhea stops.',
        whoShouldAvoid: 'Severe copper deficiency.',
        drugInteractions: 'Tetracyclines, Quinolones (space doses by 2 hours).',
        scheduleStatus: 'OTC in India',
        consultDoctorFirst: 'For exact pediatric dosing.',
        priceEstimate: {
          min: 35,
          max: 60,
          formatted: '₹35 – ₹60',
          packSize: 'Strip of 10-15 tablets',
          source: 'Retail Chemist Benchmark (India)',
          availability: 'Widely available in pharmacies',
          lastUpdated: 'November 2026'
        }
      }
    ],
    firstAidItems: [
      {
        name: 'Packaged Sterile Measuring Bottle / 1L Pitcher',
        whyNeeded: 'Ensures exact 1000 ml water volume for mixing ORS (incorrect concentration can worsen diarrhea or cause salt toxicity).',
        howToUse: 'Fill with boiled and cooled water up to the 1-litre mark, add entire 21.8g ORS packet, stir thoroughly.',
        priceEstimate: '₹30 – ₹70',
        availability: 'Common household / pharmacy item'
      }
    ],
    homeRemedies: {
      safeRemedies: [
        'Continuous Small Sips of ORS: Drink 100–200 ml of prepared ORS after every single loose bowel movement. For children, give 1 teaspoon every 1-2 minutes.',
        'Rice Kanji / Congee Water with pinch of salt: Boiled starch water provides easily absorbable electrolytes and calories.',
        'Tender Coconut Water: Natural source of potassium, sodium, and magnesium.',
        'BRAT Diet: Bananas, Rice, Applesauce, and Toast. Potassium-rich bananas replenish electrolyte losses and pectin helps firm stools.'
      ],
      dangerousPracticesToAvoid: [
        'DO NOT take anti-motility drugs like Loperamide (Imodium/Lopamide) if you have fever or blood in stool (it paralyses the gut, trapping lethal toxins inside, leading to Toxic Megacolon).',
        'DO NOT drink commercial energy drinks, high-sugar sodas, or concentrated commercial fruit juices (high osmolarity draws more water into the intestine, worsening diarrhea).',
        'DO NOT starve the patient. Early feeding with light, non-greasy foods accelerates intestinal villi healing.'
      ]
    },
    whenToSeeDoctor: 'Seek emergency hospital care if the patient cannot produce urine, has sunken dry eyes, vomits constantly, passes bloody stools, or exhibits confusion and extreme dizziness.'
  },

  sprain_muscle_pain: {
    id: 'sprain_muscle_pain',
    title: 'Muscle Pain, Strains & Ankle/Joint Sprains',
    category: 'Musculoskeletal & Orthopedic Relief',
    synonyms: ['sprain', 'strain', 'muscle pain', 'ankle sprain', 'twisted ankle', 'back pain', 'joint pain', 'body ache', 'moch', 'badan dard', 'nara hidita', 'kalu uluva', 'kaal vali', 'kalu noppi'],
    isSelfCareAppropriate: true,
    redFlags: [
      'Complete inability to bear weight on the injured limb or take 4 steps immediately after injury',
      'Visible gross bone deformity, abnormal limb angle, or bone protruding through skin (Fracture)',
      'Severe, rapid swelling within 30 minutes accompanied by extensive dark purple bruising',
      'Direct, sharp tenderness over the bony malleolus (ankle bone) or navicular bone (Ottawa Ankle Rules positive)',
      'Numbness, tingling, or cold pale toes/fingers (compromised neurovascular blood supply)'
    ],
    followUpQuestions: [
      { id: 'injuryMechanism', question: 'How did it happen?', options: ['Twisted ankle / foot roll', 'Heavy lifting / back pull', 'Overuse / exercise soreness', 'Direct hard blow / fall'] },
      { id: 'weightBearing', question: 'Can the patient walk on it?', options: ['Yes, with mild limp', 'Painful but can take 4 steps', 'Cannot bear any weight at all'] },
      { id: 'swellingLevel', question: 'Swelling severity?', options: ['Mild / No swelling', 'Moderate swelling after hours', 'Severe rapid swelling / deformity'] }
    ],
    otcMedicines: [
      {
        id: 'med_topical_pain_gel',
        genericName: 'Diclofenac Diethylamine 1.16% + Methyl Salicylate + Linseed Oil + Menthol Gel',
        brandExamples: ['Volini Gel / Spray', 'Moov Gel / Spray', 'Omnigel', 'Relispray'],
        formulation: 'Topical Pain Relief Gel (30g - 50g tube) / Aerosol Spray',
        whatItIsUsedFor: 'First-line local relief for acute ankle sprains, neck/back muscle pulls, and joint stiffness.',
        whyItHelps: 'Delivers high local NSAID concentrations directly to inflamed periarticular ligaments and muscle fibers with minimal systemic gastrointestinal absorption.',
        commonSideEffects: 'Mild local skin redness, tingling warmth.',
        importantWarnings: 'Gently spread over painful area 3-4 times daily. DO NOT massage vigorously on acute fresh sprains (causes more internal capillary bleeding). Wash hands after application.',
        whoShouldAvoid: 'Do not apply on broken skin, cuts, open wounds, or near eyes/mucosa.',
        drugInteractions: 'Minimal systemic interaction.',
        scheduleStatus: 'OTC in India (Standard topical pain reliever)',
        consultDoctorFirst: 'If no improvement after 72 hours.',
        priceEstimate: {
          min: 85,
          max: 145,
          formatted: '₹85 – ₹145',
          packSize: '30g - 50g tube',
          source: 'Retail Pharmacy Average (India)',
          availability: 'Widely available in all pharmacies and supermarkets',
          lastUpdated: 'November 2026'
        }
      },
      {
        id: 'med_paracetamol_sprain',
        genericName: 'Paracetamol (Acetaminophen) 650mg',
        brandExamples: ['Dolo 650', 'Calpol 650', 'Crocin 650'],
        formulation: 'Oral Tablets',
        whatItIsUsedFor: 'Oral baseline pain management for mild-to-moderate ligament sprain or muscle strain.',
        whyItHelps: 'Controls resting and movement-associated throbbing without interfering with natural tendon remodeling.',
        commonSideEffects: 'Minimal.',
        importantWarnings: 'Take 1 tablet every 6 hours as needed. Max 4,000 mg/day.',
        whoShouldAvoid: 'Liver disease.',
        drugInteractions: 'Alcohol.',
        scheduleStatus: 'OTC in India',
        consultDoctorFirst: 'If pain requires combination narcotics.',
        priceEstimate: {
          min: 22,
          max: 32,
          formatted: '₹22 – ₹32',
          packSize: 'Strip of 15 tablets',
          source: 'NPPA / Retail Benchmark',
          availability: 'Universal availability',
          lastUpdated: 'November 2026'
        }
      }
    ],
    firstAidItems: [
      {
        name: 'Elastic Crepe Bandage (7.5 cm or 10 cm width)',
        whyNeeded: 'Provides supportive mechanical compression, prevents excessive edema accumulation, and stabilizes injured ligament fibers.',
        howToUse: 'Wrap firmly in a figure-of-eight pattern starting from base of toes moving upwards. Ensure wrap is snug but not tight enough to turn toes pale or numb.',
        priceEstimate: '₹60 – ₹110',
        availability: 'Available at all chemist shops'
      },
      {
        name: 'Reusable Cold Ice / Gel Compression Pack',
        whyNeeded: 'Vasoconstricts broken capillaries, reduces inflammatory swelling, and numbs pain nerve conduction.',
        howToUse: 'Apply over a cloth for 15-20 minutes every 2-3 hours during the first 48 hours.',
        priceEstimate: '₹120 – ₹220',
        availability: 'Available at pharmacies'
      }
    ],
    homeRemedies: {
      safeRemedies: [
        'THE P.R.I.C.E. PROTOCOL (FIRST 48 HOURS):',
        '• PROTECT: Shield the injured joint from further stress; use a cane or support.',
        '• REST: Avoid bearing weight on the injured limb for 24-48 hours.',
        '• ICE: Apply a cold pack for 15-20 minutes every 2-3 hours (never directly on skin).',
        '• COMPRESS: Wrap with an elastic crepe bandage firmly to limit fluid accumulation.',
        '• ELEVATE: Prop the leg up on pillows ABOVE heart level to let gravity drain inflammatory edema.'
      ],
      dangerousPracticesToAvoid: [
        'DO NOT apply hot water bags, heating pads, or deep heat rubs during the first 48 hours (HEAT increases blood flow, drastically worsening internal bleeding and swelling).',
        'DO NOT undergo vigorous manual "bone setting" or aggressive twisting by uncertified bonesetters (can turn a simple partial tear into a full rupture or displace an undisplaced hairline fracture).',
        'DO NOT walk or run through severe pain.'
      ]
    },
    whenToSeeDoctor: 'Consult an orthopedic surgeon or get an X-ray if you cannot take 4 steps, if there is direct bone tenderness over the ankle bones, or if swelling does not reduce after 72 hours.'
  },

  skin_itching: {
    id: 'skin_itching',
    title: 'Skin Itching, Rashes & Minor Allergic Irritation',
    category: 'Dermatological & Allergy Relief',
    synonyms: ['itching', 'skin rash', 'hives', 'urticaria', 'insect bite', 'mosquito bite', 'allergy', 'khujli', 'kandu', 'dinate', 'namachil', 'thumpu', 'dermatitis'],
    isSelfCareAppropriate: true,
    redFlags: [
      'Swelling of the lips, tongue, uvula, or throat (Angioedema / Anaphylaxis - CALL 112)',
      'Difficulty breathing, wheezing, or feeling of throat closing',
      'Sudden widespread hives accompanied by dizziness, fainting, or rapid pulse',
      'Rash covering a large portion of the body with skin peeling, blisters, or oral mucosal ulcers (suspected Stevens-Johnson Syndrome)',
      'Signs of secondary bacterial infection: yellow crusting, pus oozing, intense warmth'
    ],
    followUpQuestions: [
      { id: 'rashType', question: 'What does the rash look like?', options: ['Raised red itchy welts (Hives)', 'Isolated small red bumps / insect bites', 'Dry, red, flaking, scaly patches'] },
      { id: 'triggers', question: 'Any recent suspected exposure?', options: ['New food / seafood / nuts', 'New medication / antibiotic', 'Insect bite / plant contact', 'New soap / cosmetic / detergent'] },
      { id: 'facialSwelling', question: 'Any swelling on face, lips, or tongue?', options: ['No facial swelling', 'Mild lip swelling (SEEK MEDICAL HELP)', 'Yes, throat/breathing tight (EMERGENCY)'] }
    ],
    otcMedicines: [
      {
        id: 'med_cetirizine_itching',
        genericName: 'Cetirizine Hydrochloride 10mg',
        brandExamples: ['Cetzine', 'Alerid', 'Okacet'],
        formulation: 'Film-coated Tablets',
        whatItIsUsedFor: 'Systemic relief of acute allergic hives (urticaria), widespread itching, and insect bite reactions.',
        whyItHelps: 'Rapidly blocks histamine H1-receptors on peripheral cutaneous capillaries, stopping vascular leakage and itching impulses within 30-60 minutes.',
        commonSideEffects: 'Mild drowsiness in some individuals, dry mouth.',
        importantWarnings: 'Take 1 tablet once daily, preferably in the evening. Avoid alcohol.',
        whoShouldAvoid: 'Severe kidney failure.',
        drugInteractions: 'Sedatives, alcohol.',
        scheduleStatus: 'OTC in India',
        consultDoctorFirst: 'If hives recur daily for over 2 weeks.',
        priceEstimate: {
          min: 28,
          max: 45,
          formatted: '₹28 – ₹45',
          packSize: 'Strip of 10 tablets',
          source: 'Retail Chemist Benchmark (India)',
          availability: 'Available everywhere',
          lastUpdated: 'November 2026'
        }
      },
      {
        id: 'med_calamine_lotion',
        genericName: 'Calamine (Zinc Oxide + Ferric Oxide) + Diphenhydramine / Aloe Lotion',
        brandExamples: ['Caladryl Lotion', 'Lacto Calamine', 'Calamine Lotion IP'],
        formulation: 'Topical Lotion (100 ml bottle)',
        whatItIsUsedFor: 'Soothing local itch, insect bites, sunburn, prickly heat, and contact dermatitis.',
        whyItHelps: 'Zinc oxide acts as a mild astringent and protective barrier, evaporating to produce a pleasant cooling sensation that dulls itch receptors.',
        commonSideEffects: 'Mild temporary skin dryness.',
        importantWarnings: 'Shake well before use. Apply with clean cotton ball. External use only.',
        whoShouldAvoid: 'Open, weeping, infected skin wounds.',
        drugInteractions: 'None.',
        scheduleStatus: 'OTC in India (Universal soothing lotion)',
        consultDoctorFirst: 'If rash develops pus or blisters.',
        priceEstimate: {
          min: 75,
          max: 130,
          formatted: '₹75 – ₹130',
          packSize: '100 ml bottle',
          source: 'Retail Pharmacy Average (India)',
          availability: 'Widely stocked in all chemist stores',
          lastUpdated: 'November 2026'
        }
      }
    ],
    firstAidItems: [
      {
        name: 'Cooling Cold Compress / Gel Pack',
        whyNeeded: 'Cool temperatures temporarily numb C-nerve fibers responsible for the itch reflex.',
        howToUse: 'Apply wrapped in a cloth over the itchy skin for 10-15 minutes.',
        priceEstimate: '₹120 – ₹220',
        availability: 'Available at pharmacies'
      }
    ],
    homeRemedies: {
      safeRemedies: [
        'Cool Compress: Apply a clean cloth soaked in cool water to calm intense itching without scratching.',
        'Oatmeal or Baking Soda Bath: Soak in lukewarm water mixed with finely ground colloidal oatmeal or 2 tablespoons baking soda.',
        'Loose Cotton Clothing: Wear loose-fitting, soft cotton clothes to minimize skin friction and sweat accumulation.',
        'Trim Nails Short: Prevents secondary bacterial skin excoriations and infections during accidental sleep scratching.'
      ],
      dangerousPracticesToAvoid: [
        'DO NOT self-medicate with high-potency oral Steroids (e.g. Dexamethasone/Prednisolone) without a physician\'s prescription.',
        'DO NOT apply strong steroid-antibiotic-antifungal combination creams (e.g. Quadriderm, Betnovate-GM, Panderm) indiscriminately — chronic use thins facial skin, causes steroid addiction, and worsens fungal infections (Tinea incognito).',
        'DO NOT vigorously scratch itchy hives (releases more histamine, spreading the rash).'
      ]
    },
    whenToSeeDoctor: 'IMMEDIATELY call 112 or visit an emergency room if itching is accompanied by lip/tongue swelling, voice change, or shortness of breath (Anaphylaxis). See a dermatologist if the rash lasts >1 week.'
  }
};

// ============================================================================
// 2. MEDICINE RECOMMENDATION & PROFILE ADJUSTMENT ENGINE
// ============================================================================

/**
 * Identify condition from user query
 */
function identifyCondition(queryText, conditionIdHint = null) {
  if (conditionIdHint && MEDICINE_KNOWLEDGE_BASE[conditionIdHint]) {
    return MEDICINE_KNOWLEDGE_BASE[conditionIdHint];
  }

  const clean = (queryText || '').toLowerCase().trim();
  if (!clean) return null;

  // Direct keyword matching across synonyms
  for (const [key, data] of Object.entries(MEDICINE_KNOWLEDGE_BASE)) {
    for (const syn of data.synonyms) {
      if (clean.includes(syn.toLowerCase())) {
        return data;
      }
    }
  }

  // Fallback heuristic keyword scoring
  if (/head|migraine|headache|sir\s*dard|tale\s*novu/i.test(clean)) return MEDICINE_KNOWLEDGE_BASE.headache;
  if (/fever|temp|temperature|bukhar|jwara|jvara|chills/i.test(clean)) return MEDICINE_KNOWLEDGE_BASE.fever;
  if (/cough|cold|throat|sore|khansi|gala|irumal|daggulu/i.test(clean)) return MEDICINE_KNOWLEDGE_BASE.cough_cold;
  if (/acid|gastric|heartburn|acidity|gas|pet\s*dard|stomach\s*pain/i.test(clean)) return MEDICINE_KNOWLEDGE_BASE.acidity_stomach;
  if (/cut|wound|bleed|scrape|scratch|gaya|chot/i.test(clean)) return MEDICINE_KNOWLEDGE_BASE.minor_cuts;
  if (/burn|scald|blister|jal\s*gaya|sutta/i.test(clean)) return MEDICINE_KNOWLEDGE_BASE.minor_burns;
  if (/diarrhea|motion|loose|dast|bedhi/i.test(clean)) return MEDICINE_KNOWLEDGE_BASE.diarrhea_dehydration;
  if (/sprain|twist|muscle|cramp|ankle|strain|back\s*pain|badan\s*dard/i.test(clean)) return MEDICINE_KNOWLEDGE_BASE.sprain_muscle_pain;
  if (/itch|rash|hive|allergy|khujli|kandu|bite/i.test(clean)) return MEDICINE_KNOWLEDGE_BASE.skin_itching;

  return null;
}

/**
 * Check if the user query contains dangerous red-flag emergency keywords
 */
function checkEmergencyOverride(queryText) {
  const clean = (queryText || '').toLowerCase();
  const EMERGENCY_TRIGGERS = [
    { pattern: /chest\s*pain|heart\s*attack|gunde\s*noppi|ede\s*novu|chhati\s*dard/i, reason: 'Possible cardiac emergency / acute chest syndrome' },
    { pattern: /cannot\s*breathe|severe\s*shortness\s*of\s*breath|saans\s*nahi|usirata/i, reason: 'Acute respiratory distress / respiratory failure' },
    { pattern: /vomiting\s*blood|blood\s*vomit|khoon\s*ulti|rakta\s*vanti/i, reason: 'Upper gastrointestinal hemorrhage' },
    { pattern: /black\s*stool|bloody\s*stool|tari\s*stool/i, reason: 'Severe internal gastrointestinal bleeding' },
    { pattern: /unconscious|fainted|passed\s*out|behosh/i, reason: 'Loss of consciousness / syncope' },
    { pattern: /seizure|convulsion|fits|murccha/i, reason: 'Active seizure / neurological emergency' },
    { pattern: /slurred\s*speech|face\s*droop|arm\s*weakness|stroke/i, reason: 'Acute cerebrovascular stroke symptoms (FAST)' },
    { pattern: /lip\s*swelling|throat\s*closing|anaphylaxis|swollen\s*tongue/i, reason: 'Severe systemic anaphylactic shock' }
  ];

  for (const trigger of EMERGENCY_TRIGGERS) {
    if (trigger.pattern.test(clean)) {
      return {
        isEmergency: true,
        reason: trigger.reason,
        emergencyHelpline: '112',
        ambulanceHelpline: '108'
      };
    }
  }

  return { isEmergency: false };
}

/**
 * Generate full tailored medicine recommendation & relief guidance
 */
function getMedicineRecommendations(queryText, options = {}) {
  const {
    conditionId = null,
    ageGroup = 'adult', // 'child', 'adult', 'senior', 'pregnant'
    duration = 'acute',
    severity = 'moderate',
    conditions = [],
    allergies = [],
    language = 'en-IN'
  } = options;

  // 1. Safety First: Check for Emergency Override
  const emergencyCheck = checkEmergencyOverride(queryText);
  if (emergencyCheck.isEmergency) {
    return {
      status: 'emergency_override',
      isEmergency: true,
      emergencyReason: emergencyCheck.reason,
      emergencyHelplines: ['112 (National Emergency)', '108 (Ambulance)'],
      safetyWarning: 'EMERGENCY DETECTED: Standard over-the-counter medicine advice is suspended. Immediate medical evaluation is required.',
      actionInstructions: [
        'Call 112 (National Emergency) or 108 (Ambulance) immediately.',
        'Keep the patient resting comfortably and do not administer food, water, or oral tablets.',
        'Launch FirstAid+ Nearby Hospitals Radar to navigate to the nearest 24/7 Emergency Trauma Department.'
      ],
      openHospitalRadar: true,
      refreshedAt: new Date().toISOString()
    };
  }

  // 2. Identify Condition
  const condition = identifyCondition(queryText, conditionId);
  if (!condition) {
    return {
      status: 'unknown_condition',
      isSelfCareAppropriate: false,
      message: 'We cannot safely recommend a specific medicine for this description without a doctor\'s evaluation.',
      safetyAdvice: 'Health conditions with unclear symptoms should always be evaluated by a certified doctor or registered pharmacist. Never guess prescription drugs or dosages.',
      consultDoctorRequired: true,
      generalGuidance: [
        'Consult a certified General Physician or visit a nearby registered pharmacy for clinical evaluation.',
        'If pain or symptoms suddenly escalate, call 112 or visit an emergency department.',
        'Stay well hydrated with clean drinking water and rest.'
      ],
      availableCategories: Object.values(MEDICINE_KNOWLEDGE_BASE).map(c => ({ id: c.id, title: c.title })),
      refreshedAt: new Date().toISOString()
    };
  }

  // 3. Profile-Specific Tailoring & Safety Warnings
  const tailoredMedicines = condition.otcMedicines.map(med => {
    const medCopy = JSON.parse(JSON.stringify(med));
    const dynamicWarnings = [];

    // Condition contraindication: Liver disease
    if (conditions.includes('liver') || conditions.includes('Liver Disease')) {
      if (/paracetamol/i.test(medCopy.genericName)) {
        dynamicWarnings.push('PATIENT PROFILE ALERT: Reduce Paracetamol dosage or consult physician due to preexisting Liver Disease.');
      }
    }

    // Condition contraindication: Acidity / Stomach Ulcer
    if (conditions.includes('ulcer') || conditions.includes('Acidity / Stomach Ulcer')) {
      if (/ibuprofen|aspirin|diclofenac/i.test(medCopy.genericName)) {
        dynamicWarnings.push('PATIENT PROFILE ALERT: NSAIDs (Ibuprofen/Diclofenac) can trigger severe gastric mucosal bleeding. Take Paracetamol instead or consult a physician.');
      }
    }

    // Condition contraindication: High Blood Pressure
    if (conditions.includes('hypertension') || conditions.includes('High Blood Pressure')) {
      if (/ibuprofen|phenylephrine|pseudoephedrine/i.test(medCopy.genericName)) {
        dynamicWarnings.push('PATIENT PROFILE ALERT: May elevate blood pressure or interfere with antihypertensive medications.');
      }
    }

    // Age Group Adjustments
    if (ageGroup === 'child' || ageGroup === 'Child (<12 years)') {
      dynamicWarnings.push('PEDIATRIC SAFETY: Do NOT use adult tablet strengths. Use pediatric oral drops/suspension with exact dosage calculated strictly by child body weight by a pediatrician.');
      if (/aspirin/i.test(medCopy.genericName)) {
        dynamicWarnings.push('CRITICAL CONTRAINDICATION: Never administer Aspirin to children (risk of fatal Reye\'s syndrome).');
      }
    } else if (ageGroup === 'pregnant' || ageGroup === 'Pregnant / Nursing') {
      dynamicWarnings.push('PREGNANCY CAUTION: Always verify with your obstetrician. Avoid NSAIDs especially in the third trimester.');
    }

    // Allergies Check
    if (allergies.length > 0) {
      allergies.forEach(allg => {
        if (allg.toLowerCase().includes('paracetamol') && /paracetamol/i.test(medCopy.genericName)) {
          dynamicWarnings.push(`ALLERGY WARNING: Patient has reported allergy to ${allg}. DO NOT TAKE THIS MEDICINE.`);
        }
        if ((allg.toLowerCase().includes('nsaid') || allg.toLowerCase().includes('aspirin') || allg.toLowerCase().includes('ibuprofen')) && /ibuprofen|diclofenac|aspirin/i.test(medCopy.genericName)) {
          dynamicWarnings.push(`ALLERGY WARNING: Patient has reported allergy to ${allg}. AVOID ALL NSAIDS.`);
        }
      });
    }

    medCopy.profileWarnings = dynamicWarnings;
    return medCopy;
  });

  // 4. Generate Medicine Comparison Matrix
  const comparisonMatrix = condition.otcMedicines.map(m => ({
    genericName: m.genericName.split('/')[0].trim(),
    brandExamples: m.brandExamples.slice(0, 3).join(', '),
    formulation: m.formulation,
    packSize: m.priceEstimate.packSize,
    priceEstimate: m.priceEstimate.formatted,
    keyWarning: m.importantWarnings.split('.')[0] + '.',
    bestSuitedFor: m.whatItIsUsedFor
  }));

  // 5. Structure Complete Result
  return {
    status: 'success',
    conditionId: condition.id,
    conditionTitle: condition.title,
    category: condition.category,
    isSelfCareAppropriate: condition.isSelfCareAppropriate,
    userQuery: queryText,
    patientProfile: {
      ageGroup,
      duration,
      severity,
      conditions,
      allergies
    },
    redFlags: condition.redFlags,
    followUpQuestions: condition.followUpQuestions,
    otcMedicines: tailoredMedicines,
    firstAidItems: condition.firstAidItems,
    homeRemedies: condition.homeRemedies,
    comparisonMatrix,
    whenToSeeDoctor: condition.whenToSeeDoctor,
    brandDisclaimer: 'Brand names shown (e.g. Dolo, Calpol, Electral, Digene) are verified common Indian market examples for consumer identification only, not commercial endorsements.',
    priceDisclaimer: 'Prices are estimated ranges based on standard NPPA ceiling guidelines and average retail pharmacy pricing in India (November 2026). Actual chemist pricing may vary slightly.',
    refreshedAt: new Date().toISOString()
  };
}

/**
 * Return all categories for UI chips
 */
function getAllCategories() {
  return Object.values(MEDICINE_KNOWLEDGE_BASE).map(c => ({
    id: c.id,
    title: c.title,
    category: c.category,
    synonyms: c.synonyms
  }));
}

module.exports = {
  MEDICINE_KNOWLEDGE_BASE,
  identifyCondition,
  checkEmergencyOverride,
  getMedicineRecommendations,
  getAllCategories
};
