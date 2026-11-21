/**
 * FirstAid+ Emergency & Clinical Symptom Knowledge Base
 * Medically-grounded protocols aligned with Red Cross, WHO, and Indian First Aid guidelines.
 * Features comprehensive coverage of emergencies, acute illnesses, everyday health complaints,
 * intelligent typo-tolerant symptom recognition, red-flag emergency detection,
 * and unknown-problem safety handling with doctor consultation recommendations.
 */

const EMERGENCY_GUIDES = {
  // ==========================================
  // SECTION 1: CRITICAL TRAUMA & EMERGENCIES
  // ==========================================

  bleeding_severe: {
    id: "bleeding_severe",
    title: "Severe Bleeding / Arterial Hemorrhage",
    category: "Trauma & Wounds",
    severity: "Critical",
    confidenceTier: "emergency",
    isLifeThreatening: true,
    possibleEmergency: "Possible severe laceration or arterial bleeding injury",
    keywords: [
      "severe bleeding", "blood gushing", "spurting blood", "heavy bleeding", "deep cut",
      "artery", "wound bleeding heavily", "slit wrist", "stab", "puncture deep",
      "blood soaking", "blood pool", "hemorrhage", "bleeding wont stop", "bleeding heavily",
      "bleding", "blod gushing", "arterial bleed"
    ],
    whatHappened: "A deep wound has severed major blood vessels or an artery, causing rapid blood loss. This requires immediate, forceful intervention to prevent hemorrhagic shock.",
    warningSigns: [
      "Blood is spurting or pulsating from the wound",
      "Blood is pooling rapidly on the ground or soaking through thick cloth in seconds",
      "Victim appears pale, cold, clammy, dizzy, confused, or loses consciousness",
      "Rapid, weak pulse and shallow breathing"
    ],
    immediateFirstAid: [
      "CALL 112 (or 108) IMMEDIATELY for an ambulance. Every second counts.",
      "Apply direct, firm pressure on the wound using a clean cloth, sterile gauze, or your bare hands if nothing else is available.",
      "Do NOT remove the pressure cloth if blood soaks through. Add more layers of cloth on top and maintain constant heavy pressure.",
      "If bleeding is on an arm or leg and direct pressure fails to stop life-threatening spurting blood, apply a commercial tourniquet 2-3 inches above the wound (never over a joint) and note the time applied.",
      "Keep the person lying down, elevate legs if possible (unless head/neck injury suspected), and cover them with a blanket to keep warm."
    ],
    whatNotToDo: [
      "DO NOT remove the initial cloth or bandage once placed — this disturbs clotting.",
      "DO NOT wash or rinse a heavily bleeding deep wound with water.",
      "DO NOT remove embedded objects (e.g. knife, glass shard). Stabilize the object with bulky dressings around it.",
      "DO NOT apply a tourniquet directly over a joint (elbow, knee).",
      "DO NOT give the person anything to eat or drink (they may require emergency surgery)."
    ],
    whenToGetHelp: "Immediate emergency: Call 112 right away. Do not attempt to drive if the person is dizzy, confused, or losing consciousness.",
    emergencyCallRequired: true
  },

  bleeding_minor: {
    id: "bleeding_minor",
    title: "Minor Cut / Superficial Bleeding",
    category: "Trauma & Wounds",
    severity: "Low",
    confidenceTier: "high",
    possibleEmergency: "Possible superficial cut, scrape, or minor laceration",
    keywords: [
      "cut", "paper cut", "scrape", "scratched", "minor cut", "grazed", "skinned knee",
      "small wound", "finger cut", "kitchen knife cut", "minor bleeding", "abrasion",
      "small cut", "scraped knee", "grazing", "nick"
    ],
    whatHappened: "A superficial break in the skin has damaged small capillary vessels. Blood loss is minimal and can typically be managed with standard first aid.",
    warningSigns: [
      "Bleeding continues after 10 minutes of direct pressure",
      "Wound edges are gaping or fat/muscle tissue is visible",
      "Object remains embedded inside the cut",
      "Redness, heat, swelling, or yellow pus develops over the next 24-48 hours",
      "Tetanus vaccine was last taken more than 5-10 years ago"
    ],
    immediateFirstAid: [
      "Wash your hands thoroughly with soap and water before touching the wound.",
      "Apply gentle, direct pressure using a clean tissue or sterile gauze for 3-5 minutes until bleeding stops.",
      "Rinse the wound thoroughly under clean running tap water for 2-3 minutes to remove dirt and debris.",
      "Gently pat the area dry with a sterile pad and apply a thin layer of antiseptic cream or petroleum jelly.",
      "Cover with a sterile adhesive bandage or gauze. Change the dressing daily or whenever it becomes wet or dirty."
    ],
    whatNotToDo: [
      "DO NOT use hydrogen peroxide, rubbing alcohol, or harsh iodine directly in deep cuts as it damages healthy healing cells.",
      "DO NOT blow on the wound or touch it with dirty fingers.",
      "DO NOT pick at scabs as they form.",
      "DO NOT leave an open wound exposed to dust or soil."
    ],
    whenToGetHelp: "Consult a doctor if the wound is deeper than 1/4 inch, gaping, caused by a rusty or dirty object, or if signs of infection (fever, throbbing pain, spreading redness) appear.",
    emergencyCallRequired: false
  },

  burns: {
    id: "burns",
    title: "Thermal & Scald Burns",
    category: "Burns & Environmental",
    severity: "Moderate",
    confidenceTier: "high",
    possibleEmergency: "Possible thermal burn or scald injury",
    keywords: [
      "burn", "hot water", "boiling water", "steam", "scalding", "flame", "fire",
      "hot oil", "stove", "iron", "hot pan", "blister", "charred skin", "peeling skin",
      "burnt hand", "oil splash", "boiling tea", "hot milk burn", "scald"
    ],
    whatHappened: "Skin tissue has been damaged by exposure to high temperature (liquid, steam, contact, or flame). The severity depends on the depth and surface area affected.",
    warningSigns: [
      "Burn covers a large area (larger than the victim's palm)",
      "Burn is located on the face, hands, feet, groin, buttocks, or over a major joint",
      "Skin appears white, leathery, charred, or blackened (3rd-degree burn)",
      "Victim is an infant, elderly, or inhaled smoke/hot steam",
      "Blisters are bursting or skin is peeling off"
    ],
    immediateFirstAid: [
      "Cool the burn IMMEDIATELY under cool running tap water for a full 20 minutes. Do this right away.",
      "Gently remove tight items, jewelry, rings, or belts near the affected area BEFORE swelling begins, provided they are not stuck to the burn.",
      "Cover the burn loosely with clean plastic cling wrap or a sterile non-stick dressing.",
      "Keep the person warm with a jacket or blanket over unaffected areas (cooling burns can induce hypothermia).",
      "Give over-the-counter pain relievers (paracetamol/ibuprofen) if conscious and appropriate."
    ],
    whatNotToDo: [
      "DO NOT apply ice, ice water, butter, toothpaste, oil, egg whites, or turmeric to the burn.",
      "DO NOT burst blisters — intact skin protects against lethal infections.",
      "DO NOT peel away clothing that is melted or stuck to the burn tissue.",
      "DO NOT use fluffy cotton wool directly on burned skin as fibers will stick.",
      "DO NOT delay cooling — running cool water within the first 3 hours significantly reduces tissue destruction."
    ],
    whenToGetHelp: "Seek urgent medical attention at a hospital burns unit if the burn is larger than 3 inches, blistered on face/hands/joints, chemical/electrical, or in young children.",
    emergencyCallRequired: false
  },

  choking: {
    id: "choking",
    title: "Choking / Acute Airway Obstruction",
    category: "Respiratory",
    severity: "Critical",
    confidenceTier: "emergency",
    isLifeThreatening: true,
    possibleEmergency: "Possible foreign body airway obstruction (Choking)",
    keywords: [
      "choking", "cant breathe", "cannot breathe", "food stuck", "throat stuck",
      "gasping", "hands on neck", "blue lips", "coughing weakly", "silent cough",
      "swallowed coin", "choked on toy", "airway blocked", "strangling", "choke"
    ],
    whatHappened: "A foreign object, food morsel, or fluid has lodged in the trachea (windpipe), blocking airflow to the lungs. Oxygen deprivation leads to unconsciousness within minutes.",
    warningSigns: [
      "Universal choking sign: hands clutching the neck/throat",
      "Inability to speak, cry, or cough forcefully",
      "High-pitched wheezing sounds when inhaling (stridor)",
      "Cyanosis: skin, lips, or fingernails turning blue/grey",
      "Loss of consciousness"
    ],
    immediateFirstAid: [
      "Ask: 'Are you choking? Can you speak?' If they can cough forcefully, encourage them to keep coughing.",
      "If they CANNOT speak or cough: Call 112 immediately or have a bystander call.",
      "Give 5 BACK BLOWS: Lean the person forward, support their chest with one hand, and strike firmly between the shoulder blades with the heel of your hand.",
      "Give 5 ABDOMINAL THRUSTS (Heimlich Maneuver): Stand behind them, wrap your arms around their waist. Make a fist just above the navel, grasp your fist with your other hand, and pull sharply upward and inward.",
      "Alternate 5 back blows and 5 abdominal thrusts until the object is expelled.",
      "If the person collapses unconscious: Lower them gently to the floor, call 112, and begin CPR compressions immediately."
    ],
    whatNotToDo: [
      "DO NOT perform abdominal thrusts on infants under 1 year (use back blows and 2-finger chest thrusts instead).",
      "DO NOT perform blind finger sweeps in the mouth — you could push the object deeper.",
      "DO NOT give them water to drink while they are choking.",
      "DO NOT slap the back while the person is standing upright (lean them forward first so the object falls out)."
    ],
    whenToGetHelp: "Always seek medical evaluation even if the object is coughed out, as abdominal thrusts can cause internal bruising or airway swelling.",
    emergencyCallRequired: true
  },

  cpr_unconscious: {
    id: "cpr_unconscious",
    title: "Unconsciousness / Sudden Cardiac Arrest",
    category: "Cardiovascular",
    severity: "Critical",
    confidenceTier: "emergency",
    isLifeThreatening: true,
    possibleEmergency: "Possible sudden cardiac arrest or profound unconsciousness",
    keywords: [
      "unconscious", "not responding", "passed out", "collapsed", "no pulse",
      "not breathing", "stopped breathing", "fainted cold", "cardiac arrest",
      "unresponsive", "gasping for air", "agonal breathing", "dead faint", "fainted"
    ],
    whatHappened: "The person is unresponsive and either not breathing or only making irregular agonal gasps. In cardiac arrest, blood circulation to the brain has stopped.",
    warningSigns: [
      "No response to loud shouting and firm tapping on the shoulders",
      "No normal breathing (only gasping, snoring, or complete silence)",
      "Pale, bluish, or mottled skin tone",
      "Absence of carotid pulse within 10 seconds"
    ],
    immediateFirstAid: [
      "CHECK RESPONSE: Shout 'Are you okay?' and tap their collarbones firmly.",
      "CALL 112 IMMEDIATELY. Put the phone on speaker. Ask a bystander to find an Automated External Defibrillator (AED).",
      "CHECK BREATHING: Tilt head back, lift chin, look at chest for 5-10 seconds. If not breathing normally, begin CPR.",
      "START CHEST COMPRESSIONS: Place heel of one hand in the center of the chest, interlock the other hand. Push hard and fast at 100-120 beats per minute (depth of 2 to 2.4 inches / 5-6 cm). Allow chest to recoil completely.",
      "GIVE 30 COMPRESSIONS followed by 2 RESCUE BREATHS (or continuous Hands-Only CPR if untrained).",
      "Continue CPR without stopping until emergency services arrive, an AED prompts you to stop, or the person wakes up."
    ],
    whatNotToDo: [
      "DO NOT delay CPR to check for a pulse if you are unsure — compressions do no harm to a living person.",
      "DO NOT shake an unconscious infant or child violently.",
      "DO NOT throw water on their face or try to make them drink.",
      "DO NOT leave the person alone unless you have to call 112 yourself."
    ],
    whenToGetHelp: "Emergency call 112 is mandatory right now.",
    emergencyCallRequired: true
  },

  heart_attack: {
    id: "heart_attack",
    title: "Heart Attack / Acute Coronary Syndrome",
    category: "Cardiovascular",
    severity: "Critical",
    confidenceTier: "emergency",
    isLifeThreatening: true,
    possibleEmergency: "Possible acute myocardial infarction (Heart Attack)",
    keywords: [
      "chest pain", "chest pressure", "heart attack", "pain in left arm",
      "heavy chest", "tight chest", "crushing pain", "jaw pain", "cold sweat nausea",
      "shortness of breath chest", "elephant on chest", "chest squeezing", "angina"
    ],
    whatHappened: "A coronary artery supplying oxygenated blood to the heart muscle has become blocked. Heart muscle cells begin to suffer irreversible damage within minutes.",
    warningSigns: [
      "Discomfort, pressure, squeezing, or aching in the center of the chest lasting more than a few minutes",
      "Pain radiating to the left shoulder, arm, back, neck, jaw, or stomach",
      "Shortness of breath accompanied by cold sweat, dizziness, or nausea",
      "Unexplained extreme fatigue or lightheadedness (frequently seen in women and diabetics)"
    ],
    immediateFirstAid: [
      "CALL 112 IMMEDIATELY. State clearly that you suspect a heart attack.",
      "Help the person sit down in a comfortable position (W-position: semi-reclined with knees bent and back supported).",
      "Loosen all tight clothing around the neck, chest, and waist.",
      "If the person is conscious and not allergic to aspirin, ask them to CHEW one 300mg soluble aspirin tablet (or two 75mg tablets). Chewing speeds absorption.",
      "If they have prescribed nitroglycerin tablets/spray for known angina, assist them in taking it.",
      "Monitor breathing continuously. If they lose consciousness, begin CPR immediately."
    ],
    whatNotToDo: [
      "DO NOT let the person walk, exercise, or drive themselves to the hospital.",
      "DO NOT give aspirin if they have a known aspirin allergy, severe bleeding disorder, or recent stroke.",
      "DO NOT give them anything to eat or drink except the aspirin.",
      "DO NOT wait to see if chest pain goes away — early thrombolytic treatment saves lives."
    ],
    whenToGetHelp: "Immediate 112 call required. Every minute without hospital care increases permanent heart muscle necrosis.",
    emergencyCallRequired: true
  },

  stroke: {
    id: "stroke",
    title: "Stroke / Cerebrovascular Accident (FAST)",
    category: "Neurological",
    severity: "Critical",
    confidenceTier: "emergency",
    isLifeThreatening: true,
    possibleEmergency: "Possible acute stroke (Brain attack)",
    keywords: [
      "stroke", "face drooping", "slurred speech", "cant talk", "arm weakness",
      "one side numb", "facial palsy", "mouth tilted", "sudden paralysis",
      "cant lift arm", "sudden confusion", "severe sudden headache", "brain stroke"
    ],
    whatHappened: "Blood supply to a portion of the brain is interrupted either by a clot (ischemic) or bleeding (hemorrhagic), depriving brain cells of oxygen.",
    warningSigns: [
      "FAST TEST:",
      "F - FACE: Ask the person to smile. Does one side of the face droop?",
      "A - ARMS: Ask the person to raise both arms. Does one arm drift downward or feel numb?",
      "S - SPEECH: Ask them to repeat a simple sentence. Is their speech slurred, strange, or unable to speak?",
      "T - TIME: If you see ANY of these signs, call 112 immediately."
    ],
    immediateFirstAid: [
      "CALL 112 IMMEDIATELY. Note the EXACT TIME symptoms were first noticed — thrombolytic clot-busting drugs must be given within 4.5 hours of onset.",
      "Place the person in a safe, comfortable position. If unconscious but breathing, place them in the RECOVERY POSITION (on their side) with the paralyzed side uppermost.",
      "Loosen tight clothing around the neck to maintain an open airway.",
      "Keep them calm and reassure them.",
      "Do NOT administer aspirin — if the stroke is hemorrhagic (bleeding in the brain), aspirin can be fatal."
    ],
    whatNotToDo: [
      "DO NOT give aspirin or blood thinners (only hospital CT scan can distinguish clot from bleed).",
      "DO NOT give them food, water, or medication by mouth (swallowing muscles may be paralyzed, causing choking).",
      "DO NOT allow the person to sleep or 'wait it out'.",
      "DO NOT drive to the clinic yourself if an ambulance with paramedics is available."
    ],
    whenToGetHelp: "Immediate emergency: Call 112 right now. Hospital CT scan and emergency neurology team required.",
    emergencyCallRequired: true
  },

  seizure: {
    id: "seizure",
    title: "Seizure / Convulsions / Epilepsy",
    category: "Neurological",
    severity: "High",
    confidenceTier: "emergency",
    possibleEmergency: "Possible epileptic seizure or convulsive episode",
    keywords: [
      "seizure", "convulsions", "shaking", "fits", "epilepsy", "jerking",
      "foaming mouth", "eyes rolled back", "trembling violently", "spasms", "rigidity",
      "fit", "convulsion", "seizures"
    ],
    whatHappened: "A sudden burst of abnormal electrical activity in the brain causing violent involuntary muscle contractions, loss of awareness, or stiffening.",
    warningSigns: [
      "Sudden collapse with body stiffening followed by rhythmic jerking of limbs",
      "Frothing at the mouth, clenched jaw, or biting of the tongue",
      "Loss of bladder or bowel control",
      "Brief cessation of breathing or bluish tint around lips",
      "Post-ictal state: deep sleep, confusion, or headache upon waking"
    ],
    immediateFirstAid: [
      "STAY CALM and time the seizure with your watch or phone.",
      "PROTECT FROM INJURY: Clear hard, sharp, or hot objects away from the person. Cushion their head with a folded jacket or pillow.",
      "Loosen tight neckties, collars, or scarves.",
      "Do NOT restrain their movements or hold them down.",
      "When the jerking stops, gently roll the person onto their side into the RECOVERY POSITION to keep the airway clear.",
      "Stay with the person until they are fully conscious, oriented, and breathing normally."
    ],
    whatNotToDo: [
      "DO NOT put ANYTHING inside their mouth (no spoons, fingers, keys, water, or cloth) — this is a dangerous myth and causes choking or fractured teeth.",
      "DO NOT make them smell an onion, leather shoe, or metal (ineffective and dangerous).",
      "DO NOT hold down or restrain the person during active convulsions.",
      "DO NOT offer water or food until they are completely alert."
    ],
    whenToGetHelp: "Call 112 if: the seizure lasts longer than 5 minutes; a second seizure begins immediately; the person is injured, pregnant, diabetic, or does not regain consciousness after 10 minutes.",
    emergencyCallRequired: false
  },

  fracture_sprain: {
    id: "fracture_sprain",
    title: "Fracture, Sprain & Dislocation",
    category: "Musculoskeletal",
    severity: "Moderate",
    confidenceTier: "high",
    possibleEmergency: "Possible bone fracture, joint dislocation, or severe sprain",
    keywords: [
      "fracture", "broken bone", "twisted ankle", "sprain", "fell down", "swollen ankle",
      "deformed bone", "snapped", "cant put weight", "bone sticking out", "dislocated shoulder",
      "wrist swollen", "cracking sound", "broken leg", "broken arm", "ankle sprain"
    ],
    whatHappened: "A traumatic impact or sudden twist has torn ligaments (sprain), dislocated a joint, or cracked/snapped a bone (fracture).",
    warningSigns: [
      "Visible deformity, unnatural angle, or bone penetrating through the skin (compound fracture)",
      "Inability to move the limb or bear any weight",
      "Rapid, severe swelling and deep purple bruising",
      "Numbness, tingling, or cold pale fingers/toes beyond the injury",
      "Grating or grinding sensation (crepitus) on movement"
    ],
    immediateFirstAid: [
      "Immobilize the injured area immediately. Do NOT attempt to straighten, realign, or push back any bone.",
      "If bone is protruding through the skin, cover gently with a clean sterile dressing. Do not touch or push it.",
      "For sprains without bone deformity, use the R.I.C.E protocol:",
      "• REST: Stop using the injured limb immediately.",
      "• ICE: Apply a cold pack wrapped in a cloth for 15-20 minutes every 2-3 hours (never ice directly on skin).",
      "• COMPRESSION: Wrap with an elastic crepe bandage snugly, but not so tight that it cuts off blood circulation.",
      "• ELEVATION: Prop the injured limb higher than heart level to reduce painful swelling.",
      "Support a suspected arm fracture with an improvised sling using a scarf or triangular bandage."
    ],
    whatNotToDo: [
      "DO NOT massage, vigorously rub, or pull the injured joint or bone.",
      "DO NOT apply heat packs or hot water fermentation in the first 48 hours (increases swelling and internal bleeding).",
      "DO NOT force the person to walk or bear weight to 'test' the joint.",
      "DO NOT try to reset a dislocated bone yourself."
    ],
    whenToGetHelp: "Visit the emergency room or orthopedic clinic immediately if there is deformity, unbearable pain, loss of feeling in toes/fingers, or open skin breaks.",
    emergencyCallRequired: false
  },

  snakebite: {
    id: "snakebite",
    title: "Snakebite Emergency",
    category: "Bites & Envenomation",
    severity: "Critical",
    confidenceTier: "emergency",
    isLifeThreatening: true,
    possibleEmergency: "Possible venomous snakebite envenomation",
    keywords: [
      "snake bite", "snakebite", "bitten by snake", "cobra", "viper", "krait",
      "fang marks", "two puncture marks", "snake venom", "swelling after snake", "snake"
    ],
    whatHappened: "A venomous snake (e.g. Russell's viper, Spectacled cobra, Common krait, Saw-scaled viper in India) has injected venom causing neurotoxicity, tissue necrosis, or bleeding disorders.",
    warningSigns: [
      "Pair of distinct puncture fang marks with bleeding or swelling",
      "Severe burning pain spreading rapidly from the bite site",
      "Drooping eyelids (ptosis), blurred vision, difficulty swallowing or speaking",
      "Unusual bleeding from gums or the bite wound",
      "Difficulty breathing, generalized paralysis, or vomiting"
    ],
    immediateFirstAid: [
      "CALL 112 OR RUSH TO THE NEAREST HOSPITAL EQUIPPED WITH ANTI-SNAKE VENOM (ASV).",
      "Keep the victim ABSOLUTELY CALM and still. Movement accelerates venom spread through the lymphatic system.",
      "IMMOBILIZE the bitten limb with a rigid splint and keep it AT OR SLIGHTLY BELOW heart level.",
      "Remove rings, bracelets, watches, and tight clothing before severe swelling occurs.",
      "Remember or take a photo of the snake from a SAFE distance if possible to help doctors choose monovalent vs polyvalent ASV, but do not risk another bite or waste time."
    ],
    whatNotToDo: [
      "DO NOT CUT the bite wound with a razor or knife.",
      "DO NOT attempt to SUCK out venom by mouth or with suction gadgets.",
      "DO NOT apply a tight arterial tourniquet — this causes severe gangrene and limb loss.",
      "DO NOT apply ice, potassium permanganate, electrical shocks, or herbal pastes.",
      "DO NOT give the victim alcohol, caffeine, or pain medicines that thin blood (like aspirin)."
    ],
    whenToGetHelp: "Every snakebite in India must be treated as a medical emergency. Go directly to a government or tertiary hospital stocking Anti-Snake Venom (ASV).",
    emergencyCallRequired: true
  },

  poisoning: {
    id: "poisoning",
    title: "Poisoning & Chemical Ingestion",
    category: "Toxicology",
    severity: "Critical",
    confidenceTier: "emergency",
    isLifeThreatening: true,
    possibleEmergency: "Possible acute poisoning, chemical ingestion, or overdose",
    keywords: [
      "poison", "drank pesticide", "swallowed bleach", "chemical swallow",
      "rat poison", "overdose", "medicine overdose", "ingested detergent",
      "toxic ingestion", "phenyl", "acid attack", "swallowed pills"
    ],
    whatHappened: "Harmful chemical, cleaning product, agricultural pesticide, or excessive medication has been ingested or absorbed into the systemic circulation.",
    warningSigns: [
      "Burns, chemical odors, or redness around the lips and mouth",
      "Sudden nausea, severe abdominal cramps, or uncontrollable vomiting",
      "Extreme drowsiness, confusion, hallucinations, or unconsciousness",
      "Dilated or pinpoint pupils, irregular breathing",
      "Seizures or drooling"
    ],
    immediateFirstAid: [
      "CALL 112 OR NATIONAL POISON INFORMATION CENTRE (1800-116-117 in India) IMMEDIATELY.",
      "If the person is conscious, check what substance was swallowed, the container label, and the estimated amount and time.",
      "If the substance is on skin or clothing, strip contaminated clothes and flush skin with clean running water for 15-20 minutes.",
      "If they collapse and stop breathing, begin CPR. Use a barrier device / chest compressions only to avoid poisoning yourself.",
      "Bring the exact container, bottle, or packaging with you to the hospital emergency room."
    ],
    whatNotToDo: [
      "DO NOT INDUCE VOMITING unless explicitly directed by a poison center — corrosive acids/alkalis cause double burning of the esophagus.",
      "DO NOT give milk, raw eggs, saltwater, or activated charcoal without medical authorization.",
      "DO NOT try to 'neutralize' acid with alkaline chemicals."
    ],
    whenToGetHelp: "Immediate 112 emergency call required.",
    emergencyCallRequired: true
  },

  anaphylaxis: {
    id: "anaphylaxis",
    title: "Severe Allergic Reaction (Anaphylaxis)",
    category: "Immunology",
    severity: "Critical",
    confidenceTier: "emergency",
    isLifeThreatening: true,
    possibleEmergency: "Possible life-threatening allergic reaction (Anaphylaxis)",
    keywords: [
      "allergic reaction", "anaphylaxis", "bee sting swollen", "swollen lips",
      "tongue swollen", "throat closing", "peanut allergy", "hives all over",
      "cant swallow allergy", "medicine allergy rash", "severe allergy"
    ],
    whatHappened: "A severe, rapid systemic immune response to an allergen (insect sting, peanut, shellfish, medication), causing airway constriction and vascular collapse.",
    warningSigns: [
      "Swelling of the tongue, lips, throat, or uvula",
      "Difficulty breathing, hoarse voice, stridor, or severe wheezing",
      "Widespread itchy red hives, flushed skin, or severe itching",
      "Dizziness, lightheadedness, feeling of impending doom, or fainting"
    ],
    immediateFirstAid: [
      "CALL 112 IMMEDIATELY. State clearly that the person has anaphylaxis.",
      "If the person has an Epinephrine Auto-Injector (EpiPen), assist them in using it IMMEDIATELY in the outer mid-thigh. Hold firmly in place for 3-10 seconds.",
      "Have the person lie flat with legs elevated. If breathing is difficult, allow them to sit up slightly, but avoid sudden standing.",
      "Loosen tight collars and clothing.",
      "If symptoms do not improve within 5-15 minutes, a second epinephrine dose can be administered if available.",
      "If the person becomes unresponsive and stops breathing, initiate CPR immediately."
    ],
    whatNotToDo: [
      "DO NOT have the person stand up or walk — sudden postural change can cause fatal blood pressure drop.",
      "DO NOT rely solely on oral antihistamines (e.g. cetirizine) for severe airway swelling — only epinephrine reverses anaphylaxis.",
      "DO NOT leave the person alone."
    ],
    whenToGetHelp: "Immediate 112 call. Even if epinephrine brings relief, hospital monitoring is essential for delayed rebound reactions.",
    emergencyCallRequired: true
  },

  heat_stroke: {
    id: "heat_stroke",
    title: "Heat Stroke & Hyperthermia",
    category: "Environmental",
    severity: "High",
    confidenceTier: "emergency",
    possibleEmergency: "Possible life-threatening heat stroke",
    keywords: [
      "heat stroke", "sunstroke", "too hot", "collapsed in sun", "high fever hot skin",
      "not sweating hot", "heat exhaustion", "dehydrated dizzy hot", "delirious in heat"
    ],
    whatHappened: "The body's thermoregulation mechanisms have failed after prolonged exposure to extreme ambient heat, driving core temperature above 40°C (104°F).",
    warningSigns: [
      "High core body temperature (>40°C / 104°F)",
      "Hot, red, dry skin (or heavy sweating in exertional heat stroke)",
      "Confusion, slurred speech, agitation, hallucinations, or seizures",
      "Rapid, strong pulse and rapid shallow breathing",
      "Loss of consciousness"
    ],
    immediateFirstAid: [
      "CALL 112 IMMEDIATELY — Heat stroke is a medical emergency that can cause brain and organ damage.",
      "Move the person into an air-conditioned room or cool shaded area immediately.",
      "COOL RAPIDLY: Spray or sponge their body with cool water and fan them vigorously.",
      "Place ice packs or cold wet cloths on neck, armpits, and groin where major blood vessels pass.",
      "Loosen or remove excess outer clothing.",
      "If conscious and alert, offer sips of cool water or oral rehydration salts (ORS)."
    ],
    whatNotToDo: [
      "DO NOT give paracetamol or aspirin — they do NOT work on environmental heat stroke and can damage liver/kidneys.",
      "DO NOT force fluids if the person is confused, drowsy, or vomiting.",
      "DO NOT immerse an unconscious person in a cold water bathtub without medical supervision."
    ],
    whenToGetHelp: "Call 112 immediately. Rapid hospital cooling and IV fluids are required.",
    emergencyCallRequired: true
  },

  head_injury: {
    id: "head_injury",
    title: "Head Injury & Concussion",
    category: "Trauma & Wounds",
    severity: "High",
    confidenceTier: "high",
    possibleEmergency: "Possible traumatic brain injury or skull fracture",
    keywords: [
      "head injury", "hit head", "bump on head", "concussion", "headache vomiting after fall",
      "skull fracture", "knocked out cold", "amnesia after hit", "ear bleeding after hit"
    ],
    whatHappened: "Blunt force trauma to the cranium has jarred the brain within the skull or fractured bone structures, with risk of intracranial hemorrhage.",
    warningSigns: [
      "Loss of consciousness, even for a few seconds",
      "Repeated vomiting or persistent worsening headache",
      "Clear fluid or blood draining from ears or nose",
      "Unequal pupil sizes or double vision",
      "Confusion, memory loss about the accident, or slurred speech",
      "Seizures or progressive weakness in arms or legs"
    ],
    immediateFirstAid: [
      "Keep the person completely still. Stabilize the head and neck in the neutral position with your hands to prevent cervical spine injury.",
      "CALL 112 if any warning signs are present or if they lost consciousness.",
      "If there is bleeding from a scalp wound, apply gentle pressure with a sterile pad (unless a depressed skull fracture is suspected).",
      "If the person is vomiting and you must turn them, log-roll their entire body as a single unit without twisting the neck.",
      "Apply a cold compress wrapped in a towel to scalp lumps to reduce swelling."
    ],
    whatNotToDo: [
      "DO NOT move the person's neck if spinal injury is possible (e.g. falls, vehicle crash).",
      "DO NOT apply direct hard pressure if you feel a sunken bone or skull fracture.",
      "DO NOT remove helmets unless the airway is obstructed.",
      "DO NOT give aspirin or ibuprofen (these increase risk of brain bleeding)."
    ],
    whenToGetHelp: "Urgent hospital CT scan required for loss of consciousness, vomiting, clear fluid from ears/nose, or memory loss.",
    emergencyCallRequired: true
  },

  electric_shock: {
    id: "electric_shock",
    title: "Electrical Shock & Electrocution",
    category: "Environmental",
    severity: "Critical",
    confidenceTier: "emergency",
    isLifeThreatening: true,
    possibleEmergency: "Possible high-voltage electrical shock injury",
    keywords: [
      "electric shock", "electrocuted", "touch live wire", "current shock",
      "lightning strike", "plug shock", "wire burning"
    ],
    whatHappened: "Electric current passed through the body, potentially disrupting the heart's natural rhythm (ventricular fibrillation) and causing severe internal tissue burns.",
    warningSigns: [
      "Loss of consciousness or lack of breathing",
      "Visible entry and exit burn marks on hands/feet",
      "Muscle spasms, paralysis, or inability to let go of the wire",
      "Irregular or undetectable pulse"
    ],
    immediateFirstAid: [
      "DO NOT TOUCH THE VICTIM DIRECTLY IF STILL IN CONTACT WITH THE POWER SOURCE.",
      "Turn off the power source immediately at the main circuit breaker / switchboard.",
      "If unable to turn off power, stand on dry non-conductive material (wood, rubber mat) and separate the victim from the wire using a dry wooden stick or plastic broom handle.",
      "Once clear of the source, CALL 112 IMMEDIATELY.",
      "Check breathing. If not breathing, begin CPR compressions immediately.",
      "Treat entry and exit burns with clean cool dressings."
    ],
    whatNotToDo: [
      "DO NOT touch the person with bare hands while current is active.",
      "DO NOT use a damp or metallic object to push away the wire.",
      "DO NOT approach a downed high-voltage power line (maintain at least 30 feet distance)."
    ],
    whenToGetHelp: "All electrical shock victims require an emergency hospital ECG to rule out delayed fatal cardiac arrhythmias.",
    emergencyCallRequired: true
  },

  eye_injury: {
    id: "eye_injury",
    title: "Eye Trauma & Chemical Splash",
    category: "Trauma & Wounds",
    severity: "High",
    confidenceTier: "high",
    possibleEmergency: "Possible eye chemical burn or penetrating trauma",
    keywords: [
      "eye chemical", "acid in eye", "soap in eye", "object in eye",
      "poked eye", "eye bleeding", "foreign object eye", "scratched cornea"
    ],
    whatHappened: "Corrosive chemical liquid or solid particulate has contacted the ocular surface, or a penetrating object has breached the globe.",
    warningSigns: [
      "Severe eye pain, intense burning, or inability to open the eye",
      "Sudden loss or blurriness of vision",
      "Visible chemical exposure or pupil distortion",
      "Blood inside the iris or globe"
    ],
    immediateFirstAid: [
      "FOR CHEMICAL SPLASH: Flush the eye IMMEDIATELY with clean running water or saline for a full 15-20 minutes. Hold eyelids wide open.",
      "Tilt the head so contaminated water runs away from the unaffected eye.",
      "FOR PENETRATING OBJECT: Do NOT touch or remove the object. Place a rigid protective cup (or paper cup bottom) over the eye and tape it to the face.",
      "Cover the unaffected eye as well with a loose pad (eyes move synchronously; covering both limits eye movements).",
      "Rush to an ophthalmology emergency facility."
    ],
    whatNotToDo: [
      "DO NOT rub the eye under any circumstances.",
      "DO NOT attempt to remove an embedded object or metal fragment.",
      "DO NOT use eye drops, ointments, or neutralizers unless prescribed by an eye surgeon."
    ],
    whenToGetHelp: "Seek immediate emergency ophthalmic care. Chemical burns can cause irreversible corneal scarring within minutes.",
    emergencyCallRequired: false
  },

  asthma_attack: {
    id: "asthma_attack",
    title: "Asthma Attack / Acute Bronchospasm",
    category: "Respiratory",
    severity: "High",
    confidenceTier: "emergency",
    possibleEmergency: "Possible severe acute asthma attack",
    keywords: [
      "asthma", "wheezing", "cant breathe asthma", "inhaler not working",
      "chest tight asthma", "breathing fast struggle", "blue fingernails breathing"
    ],
    whatHappened: "Inflammation and constriction of bronchial airways causing severe limitation of exhaled airflow.",
    warningSigns: [
      "Inability to complete a short sentence in one breath",
      "Loud continuous wheezing sound during exhalation",
      "Neck and chest muscles straining noticeably to draw air (retractions)",
      "Inhaler provides no relief after 4-10 puffs",
      "Drowsiness, exhaustion, or lips turning grey/blue"
    ],
    immediateFirstAid: [
      "Help the person sit upright in a comfortable position. Leaning forward slightly with elbows on knees often helps.",
      "Reassure them calmly — panic worsens bronchoconstriction.",
      "Help them use their blue reliever inhaler (Salbutamol/Albuterol) with a spacer if available: Give 1 puff every 30-60 seconds, up to 10 puffs.",
      "If there is no improvement after 10 puffs, or if the person is worsening, CALL 112 IMMEDIATELY.",
      "If the ambulance has not arrived after 10 minutes and symptoms persist, repeat the 10 puffs cycle."
    ],
    whatNotToDo: [
      "DO NOT make the person lie flat on their back — this further restricts lung expansion.",
      "DO NOT crowd around them; ensure fresh airflow.",
      "DO NOT put them in cold air."
    ],
    whenToGetHelp: "Call 112 immediately if reliever inhaler does not help, if lips turn blue, or if speech becomes fragmented.",
    emergencyCallRequired: true
  },

  dog_bite: {
    id: "dog_bite",
    title: "Animal Bite / Rabies Prevention",
    category: "Bites & Envenomation",
    severity: "Moderate",
    confidenceTier: "high",
    possibleEmergency: "Possible animal bite with risk of Rabies and bacterial infection",
    keywords: [
      "dog bite", "cat bite", "monkey bite", "bitten by dog", "animal scratch",
      "rabies", "stray dog attack", "bite marks blood"
    ],
    whatHappened: "An animal bite or scratch has punctured the skin, introducing oral bacteria and potentially the fatal Rabies virus (Lyssavirus) in endemic regions.",
    warningSigns: [
      "Punctures, tearing of skin, or deep lacerations",
      "Bite was unprovoked or from a stray/wild animal behaving abnormally",
      "Bleeding from multiple punctures",
      "History of delayed rabies vaccination in the region"
    ],
    immediateFirstAid: [
      "WASH IMMEDIATELY: Flush and scrub the bite wound vigorously under clean running tap water with regular soap for a full 15 MINUTES. This removes up to 90% of the rabies virus.",
      "Apply antiseptic solution (povidone-iodine or chlorhexidine) over the wound.",
      "Apply a loose sterile dressing to control minor bleeding.",
      "Go to the nearest hospital or anti-rabies vaccination clinic ON THE SAME DAY.",
      "Start Post-Exposure Prophylaxis (PEP): Anti-Rabies Vaccine (ARV) course (Days 0, 3, 7, 28) and Rabies Immunoglobulin (RIG) for Category III bites."
    ],
    whatNotToDo: [
      "DO NOT apply chili powder, lime, soil, or leaves to the bite wound.",
      "DO NOT suture or stitch the bite wound immediately (suturing traps the rabies virus in tissue).",
      "DO NOT delay vaccination hoping to observe the animal."
    ],
    whenToGetHelp: "Seek hospital care today. Rabies has a 100% case fatality rate once neurological symptoms manifest; early PEP saves lives.",
    emergencyCallRequired: false
  },

  nosebleed: {
    id: "nosebleed",
    title: "Nosebleed (Epistaxis)",
    category: "Trauma & Wounds",
    severity: "Low",
    confidenceTier: "high",
    possibleEmergency: "Possible anterior or posterior epistaxis",
    keywords: [
      "nosebleed", "nose bleeding", "blood from nose", "bloody nose", "hit on nose", "dry nose bleed"
    ],
    whatHappened: "Fragile blood vessels in Kiesselbach's plexus on the nasal septum have ruptured due to dry air, nose picking, trauma, or hypertension.",
    warningSigns: [
      "Bleeding continues continuously for more than 20 minutes despite firm pinching",
      "Blood is flowing heavily down the back of the throat even when leaning forward",
      "Caused by a violent blow to the head or face",
      "Victim is on blood thinners or has very high blood pressure"
    ],
    immediateFirstAid: [
      "Sit upright and lean forward slightly. Leaning forward prevents blood from draining down the throat and stomach.",
      "PINCH THE SOFT PART of the nose firmly against the facial bone just below the nasal bridge.",
      "Maintain uninterrupted pressure with thumb and index finger for a FULL 10-15 MINUTES without letting go to check.",
      "Breathe through your mouth and spit out any blood that enters the mouth.",
      "Apply an ice pack or cold cloth to the bridge of the nose and back of the neck."
    ],
    whatNotToDo: [
      "DO NOT tilt the head backward — this causes swallowing of blood, leading to coughing, choking, and vomiting.",
      "DO NOT pack the nose with dirty tissues or cloth.",
      "DO NOT blow your nose or pick at clots for several hours after bleeding stops."
    ],
    whenToGetHelp: "Go to emergency care if bleeding exceeds 20 minutes, is extremely heavy, or follows severe head trauma.",
    emergencyCallRequired: false
  },

  // ==========================================
  // SECTION 2: EVERYDAY HEALTH COMPLAINTS
  // ==========================================

  headache_migraine: {
    id: "headache_migraine",
    title: "Headache & Migraine Support",
    category: "Head & Neurological",
    severity: "Low",
    confidenceTier: "high",
    possibleEmergency: "Possible tension headache, migraine, or sinus pressure",
    keywords: [
      "headache", "head pain", "migraine", "throbbing head", "temple pain",
      "forehead pain", "sinus headache", "head ache", "head hurts", "headake",
      "hedache", "heavy head", "throbbing forehead"
    ],
    whatHappened: "Head pain commonly stems from muscle contraction/tension in the neck and scalp, vascular migraine mechanisms, eye strain, dehydration, or sinus congestion.",
    warningSigns: [
      "Sudden, explosive severe headache ('thunderclap' headache — worst headache of your life)",
      "Headache accompanied by stiff neck, high fever, confusion, or altered mental status",
      "Headache with one-sided numbness, speech slurring, or vision loss (RED FLAG: Stroke)",
      "Headache following a recent head trauma, fall, or accident",
      "Progressively worsening morning headache with projectile vomiting"
    ],
    immediateFirstAid: [
      "Rest in a quiet, dark, and cool room with your eyes closed.",
      "Apply a cold compress or ice pack wrapped in a clean cloth to your forehead or back of the neck for 15 minutes.",
      "Gently massage the back of your neck and temples in slow circular motions to relieve muscle tension.",
      "Drink a large glass of clean water — mild dehydration is one of the most common acute headache triggers.",
      "Consider an over-the-counter pain reliever (e.g., Paracetamol) if safe for you, strictly adhering to package directions."
    ],
    whatNotToDo: [
      "DO NOT stare at bright phone, laptop, or television screens.",
      "DO NOT skip meals or consume heavy caffeine, alcohol, or aged cheeses if prone to migraines.",
      "DO NOT exceed recommended doses of pain relievers (risk of medication-overuse rebound headaches).",
      "DO NOT ignore sudden severe headaches accompanied by neck stiffness or high fever."
    ],
    whenToGetHelp: "Seek immediate emergency care (Call 112) if the headache is sudden and explosive ('thunderclap'), or accompanied by stiff neck, fever, confusion, or difficulty speaking. Consult a doctor if headaches occur frequently or disrupt your routine.",
    emergencyCallRequired: false
  },

  fever_cold_flu: {
    id: "fever_cold_flu",
    title: "Fever & Viral Flu Support",
    category: "Infections & Systemic",
    severity: "Moderate",
    confidenceTier: "high",
    possibleEmergency: "Possible viral fever, flu, or acute febrile illness",
    keywords: [
      "fever", "high temperature", "chills", "shivering", "body hot", "feever",
      "feverish", "flu", "viral fever", "mild fever", "running temperature",
      "burning up", "hot body", "pyrexia"
    ],
    whatHappened: "Fever is the immune system's natural physiological defense mechanism to fight off viral or bacterial infections by elevating core body temperature.",
    warningSigns: [
      "Temperature exceeding 103°F (39.4°C) or not reducing with antipyretics",
      "Fever accompanied by a stiff neck, light sensitivity, or extreme lethargy/confusion",
      "Difficulty breathing, chest tightness, or rapid shallow panting",
      "Fever in infants under 3 months old (requires immediate emergency pediatric care)",
      "New unexplained dark red/purple skin rash that does not fade when pressed",
      "Persistent high fever lasting more than 3 consecutive days"
    ],
    immediateFirstAid: [
      "Rest thoroughly — physical exertion increases metabolic heat production.",
      "Hydrate actively: Drink clean water, clear soups, coconut water, or Oral Rehydration Salts (ORS) to prevent dehydration.",
      "Wear light, breathable cotton clothing and maintain a well-ventilated, comfortable room temperature.",
      "Apply lukewarm (NOT ice-cold) water sponge baths to forehead, neck, and armpits if uncomfortably hot.",
      "Consider over-the-counter paracetamol for fever reduction, adhering strictly to age and weight dosage limits."
    ],
    whatNotToDo: [
      "DO NOT use ice-cold water or alcohol rubs for sponging — this induces shivering which spikes internal core temperature.",
      "DO NOT bundle up in heavy blankets or thick woolens when fever is high.",
      "DO NOT give Aspirin to children or teenagers with fever (risk of life-threatening Reye's syndrome).",
      "DO NOT start unprescribed antibiotics on your own — antibiotics do not cure viral infections."
    ],
    whenToGetHelp: "Consult a doctor immediately if fever exceeds 103°F (39.4°C), lasts over 3 days, or is accompanied by stiff neck, rash, breathing trouble, or extreme weakness.",
    emergencyCallRequired: false
  },

  cough_sore_throat: {
    id: "cough_sore_throat",
    title: "Cough & Sore Throat Care",
    category: "Respiratory",
    severity: "Low",
    confidenceTier: "high",
    possibleEmergency: "Possible upper respiratory tract irritation, pharyngitis, or acute cough",
    keywords: [
      "cough", "sore throat", "throat pain", "dry cough", "coughing", "throat irritation",
      "pain swallowing", "itchy throat", "hoarse voice", "phlegm", "couph", "throat hurts",
      "swallowing hurts", "scratchy throat"
    ],
    whatHappened: "Inflammation or viral irritation of the pharynx, larynx, or bronchial tubes causing painful swallowing, dry tickling, or protective coughing.",
    warningSigns: [
      "Inability to swallow your own saliva or drooling",
      "Difficulty breathing, noisy whistling inhale (stridor), or wheezing",
      "Coughing up significant bright red blood or rust-colored sputum",
      "Inability to open mouth widely (trismus — possible peritonsillar abscess)",
      "Severe throat pain on only one side with muffled 'hot potato' voice"
    ],
    immediateFirstAid: [
      "Gargle with warm salt water (1/2 teaspoon of salt in a glass of warm water) 3-4 times daily to reduce swelling and clear mucus.",
      "Sip warm liquids: warm water with honey and lemon, herbal decaf teas, or clear warm broths.",
      "Inhale warm steam from a bowl of hot water or take a warm shower to moisten dry airways.",
      "Suck on throat lozenges or hard candies to stimulate saliva and coat irritated throat tissues.",
      "Rest your voice and sleep with head slightly elevated to minimize nighttime coughing fits."
    ],
    whatNotToDo: [
      "DO NOT give honey to infants under 1 year of age (risk of infant botulism).",
      "DO NOT smoke or expose yourself to secondhand smoke, dust, or harsh chemical fumes.",
      "DO NOT whisper excessively (whispering strains vocal cords more than gentle speaking).",
      "DO NOT start leftover antibiotics without a doctor diagnosing bacterial infection."
    ],
    whenToGetHelp: "Seek prompt medical care if you have difficulty swallowing saliva, breathing distress, coughing up blood, or if sore throat lasts over 7 days.",
    emergencyCallRequired: false
  },

  stomach_pain_gastric: {
    id: "stomach_pain_gastric",
    title: "Stomach Ache & Abdominal Discomfort",
    category: "Gastrointestinal",
    severity: "Moderate",
    confidenceTier: "high",
    possibleEmergency: "Possible stomach upset, acute gastritis, indigestion, or abdominal colic",
    keywords: [
      "stomach pain", "stomach ache", "belly pain", "abdominal pain", "tummy ache",
      "gas pain", "indigestion", "acidity", "heartburn", "bloating", "cramps in stomach",
      "stomac pain", "stomach cramps", "gastric pain", "belly hurts"
    ],
    whatHappened: "Irritation of the gastric mucosal lining, intestinal gas trapping, muscle spasm, or dietary indigestion causing crampy or aching abdominal pain.",
    warningSigns: [
      "Severe, sharp, agonizing pain localized in the lower right abdomen (possible acute appendicitis)",
      "Abdomen feels hard, rigid, board-like, or excruciatingly tender to light touch",
      "Vomiting blood or dark material resembling coffee grounds",
      "Black, tarry, or visibly bloody bowel movements",
      "Sudden severe pain in a pregnant woman",
      "Inability to pass stool or gas accompanied by severe distension and vomiting"
    ],
    immediateFirstAid: [
      "Rest in a comfortable position, often lying on your side with knees curled towards your chest (fetal position) to relax abdominal muscles.",
      "Apply a warm water bottle or heating pad wrapped in a towel across the abdomen for 15-20 minutes.",
      "Sip small amounts of clear water, warm peppermint tea, or electrolyte fluids; avoid large gulps.",
      "Refrain from solid, greasy, spicy, or heavy foods for a few hours until the stomach settles.",
      "For mild hyperacidity, consider an over-the-counter antacid suspension if appropriate."
    ],
    whatNotToDo: [
      "DO NOT take NSAID painkillers like Ibuprofen, Aspirin, or Diclofenac (they irritate the stomach lining and worsen ulcers or internal bleeding).",
      "DO NOT apply intense heat directly to bare skin.",
      "DO NOT force yourself to eat heavy meals when in pain.",
      "DO NOT ignore localized lower right abdomen pain that worsens when coughing or walking."
    ],
    whenToGetHelp: "Seek immediate emergency hospital care (Call 112 / 108) if the pain is severe and sudden, the belly is rock hard, or you vomit blood. Consult a doctor for pain lasting more than 24 hours.",
    emergencyCallRequired: false
  },

  vomiting_nausea: {
    id: "vomiting_nausea",
    title: "Nausea & Vomiting Management",
    category: "Gastrointestinal",
    severity: "Moderate",
    confidenceTier: "high",
    possibleEmergency: "Possible acute gastroenteritis, food poisoning, or gastric upset",
    keywords: [
      "vomiting", "nausea", "throwing up", "puking", "vomit", "upset stomach",
      "feeling sick", "vomting", "nauseous", "heaving", "puke", "food poisoning vomiting"
    ],
    whatHappened: "A protective reflex triggered by digestive irritation, food toxicity, viral infection, or motion sickness to expel irritants from the stomach.",
    warningSigns: [
      "Vomiting blood or dark fluid resembling coffee grounds",
      "Inability to keep any fluids down for more than 12-24 hours",
      "Signs of severe dehydration: sunken eyes, extreme dry mouth, dizziness upon standing, little or no urine for >8 hours",
      "Vomiting accompanied by a severe stiff neck and high fever (meningitis sign)",
      "Vomiting after a recent head injury or blow to the head"
    ],
    immediateFirstAid: [
      "Do not eat or drink for 30-60 minutes immediately following an episode of vomiting to allow the stomach to rest.",
      "Start small sips: Take 1-2 teaspoons of Oral Rehydration Solution (ORS), clear water, or diluted apple juice every 5-10 minutes.",
      "Gradually increase fluid intake as tolerated; staying hydrated is the primary clinical priority.",
      "Once vomiting has ceased for 6-8 hours, introduce bland foods (BRAT diet: Bananas, Rice, Applesauce, Toast, or plain khichdi/curd rice in India).",
      "Rest with head elevated to prevent acid reflux or accidental aspiration."
    ],
    whatNotToDo: [
      "DO NOT gulp large amounts of liquid at once — this stretches the stomach and triggers repeat vomiting.",
      "DO NOT consume dairy, spicy curries, fried foods, caffeine, or carbonated beverages.",
      "DO NOT give anti-emetic medications to children without a doctor's explicit prescription.",
      "DO NOT ignore signs of severe dehydration."
    ],
    whenToGetHelp: "Go to an emergency clinic if fluids cannot be retained for over 24 hours, if there is blood in vomit, extreme dizziness, or if a child or elderly person shows signs of dehydration.",
    emergencyCallRequired: false
  },

  diarrhea_loose_motion: {
    id: "diarrhea_loose_motion",
    title: "Diarrhea & Loose Motions Protocol",
    category: "Gastrointestinal",
    severity: "Moderate",
    confidenceTier: "high",
    possibleEmergency: "Possible acute infectious diarrhea, foodborne gastroenteritis, or traveler's diarrhea",
    keywords: [
      "diarrhea", "loose motion", "loose motions", "watery stool", "frequent motions",
      "stomach infection", "loose stools", "diarhea", "diahrea", "dysentery", "stomach upset motions"
    ],
    whatHappened: "Rapid transit of unabsorbed fluid through the intestines due to viral, bacterial, or dietary irritation, causing frequent watery evacuations.",
    warningSigns: [
      "Stools contain visible blood, black tarry substance, or thick mucus (dysentery)",
      "High fever (>102°F / 39°C) accompanying diarrhea",
      "Severe dehydration: dry cracked lips, no urination for 8+ hours, lightheadedness, sunken eyes",
      "Diarrhea persisting for more than 48 hours without slowing down",
      "Extreme lethargy, confusion, or weakness"
    ],
    immediateFirstAid: [
      "PREVENT DEHYDRATION (Most Critical): Drink WHO-standard Oral Rehydration Salts (ORS) solution after every loose motion (1 packet mixed in 1 liter of clean drinking water).",
      "If ORS is not immediately available, prepare homemade solution: 1 liter boiled/clean water + 6 level teaspoons sugar + 1/2 level teaspoon salt.",
      "Consume light, easily digestible foods: curd/yogurt (provides natural probiotics), boiled rice, bananas, coconut water, and clear lentil soup (dal pani).",
      "Wash hands thoroughly with soap and water after every bathroom visit to prevent spreading infection.",
      "Continue drinking clean fluids continuously throughout the day."
    ],
    whatNotToDo: [
      "DO NOT take anti-motility drugs (like loperamide) if you have high fever or bloody stools — trapping bacteria inside can worsen toxic infection.",
      "DO NOT drink untreated tap water, unpasteurized milk, or sugary sodas (high sugar draws water into gut, worsening diarrhea).",
      "DO NOT skip fluids hoping it will reduce watery stools — dehydration can be life-threatening.",
      "DO NOT take unprescribed antibiotics."
    ],
    whenToGetHelp: "Consult a doctor if diarrhea exceeds 2 days, contains blood or mucus, or if the person is an infant/elderly exhibiting dehydration symptoms.",
    emergencyCallRequired: false
  },

  toothache_oral_pain: {
    id: "toothache_oral_pain",
    title: "Toothache & Dental Emergency First Aid",
    category: "Dental & Facial",
    severity: "Low",
    confidenceTier: "high",
    possibleEmergency: "Possible dental caries, tooth nerve inflammation (pulpitis), or dental abscess",
    keywords: [
      "toothache", "tooth pain", "teeth pain", "gum swelling", "swollen gum",
      "tooth ache", "molar pain", "bleeding gums", "tooth broken", "cavity pain",
      "toothake", "dental pain", "jaw tooth pain"
    ],
    whatHappened: "Infection or decay has penetrated dental enamel to reach the sensitive inner pulp and nerve fibers, or inflamed periodontal tissues surrounding the tooth.",
    warningSigns: [
      "Swelling spreading rapidly to the cheek, eye, jawline, or neck",
      "Difficulty opening the mouth, swallowing, or breathing (signs of spreading deep space neck infection)",
      "High fever accompanying facial swelling",
      "Foul-tasting pus discharging continuously from around the tooth root",
      "Tooth knocked completely out of socket due to physical impact (dental avulsion)"
    ],
    immediateFirstAid: [
      "Rinse your mouth gently with warm salt water (1/2 teaspoon salt in a glass of warm water) to clean debris and soothe tissues.",
      "Gently floss around the painful tooth to remove any trapped food particles that may be exerting pressure.",
      "Apply a cold compress against the outside of your cheek for 15 minutes at a time to reduce swelling and dull throbbing pain.",
      "Apply a drop of clove oil (diluted on a clean cotton swab) gently to the affected tooth for temporary numbing.",
      "If a permanent tooth was knocked out in an accident: Pick it up by the crown (never touch root), rinse gently in milk or saline without scrubbing, and place it in a cup of cold milk or inside the cheek. Rush to a dentist within 30-60 minutes for reimplantation."
    ],
    whatNotToDo: [
      "DO NOT place an aspirin tablet directly against the aching tooth or gums (this causes severe chemical burn of the gum tissue).",
      "DO NOT apply hot compresses to facial swellings (heat accelerates bacterial abscess expansion).",
      "DO NOT poke around the tooth with sharp needles, pins, or toothpicks.",
      "DO NOT ignore toothaches that suddenly stop hurting (the nerve may have died, while infection continues spreading into the jawbone)."
    ],
    whenToGetHelp: "Visit a dental clinic as soon as possible. Seek emergency medical care immediately if swelling spreads to your eye or neck or causes breathing or swallowing trouble.",
    emergencyCallRequired: false
  },

  earache_ear_pain: {
    id: "earache_ear_pain",
    title: "Ear Pain & Earache First Aid",
    category: "Head & Neurological",
    severity: "Low",
    confidenceTier: "high",
    possibleEmergency: "Possible middle ear infection (otitis media), outer ear canal irritation (swimmer's ear), or pressure barotrauma",
    keywords: [
      "earache", "ear pain", "ear ache", "pain in ear", "blocked ear",
      "ear discharge", "throbbing ear", "swimmers ear", "ear pressure", "ear hurts"
    ],
    whatHappened: "Fluid accumulation, Eustachian tube dysfunction, or bacterial/fungal infection of the tympanic membrane or external auditory canal.",
    warningSigns: [
      "Fluid, pus, or blood draining from the ear canal",
      "Sudden hearing loss or severe ringing/dizziness (vertigo)",
      "Swelling, redness, or severe tenderness on the mastoid bone directly behind the ear",
      "Ear pain following direct head trauma or deep diving",
      "High fever and stiff neck"
    ],
    immediateFirstAid: [
      "Hold a warm (not hot) washcloth or warm water compress over the affected ear for 15-20 minutes to relieve aching.",
      "Keep your head elevated while resting to reduce pressure in the middle ear.",
      "Keep the ear canal completely dry: avoid swimming or getting water in the ear while showering.",
      "Take over-the-counter paracetamol or ibuprofen if appropriate for pain relief.",
      "For altitude/flying pressure ear pain: Yawn, swallow repeatedly, or chew gum to equalize Eustachian tube pressures."
    ],
    whatNotToDo: [
      "DO NOT insert cotton swabs (Q-tips), hairpins, keys, or pencils into the ear canal (risk of perforating the eardrum).",
      "DO NOT use unprescribed ear drops if there is discharge, blood, or suspected eardrum rupture.",
      "DO NOT submerge head in water.",
      "DO NOT attempt to dig out an embedded foreign object or insect yourself (visit an ENT specialist)."
    ],
    whenToGetHelp: "Consult a doctor or ENT specialist if pain is severe, lasts more than 2-3 days, or if there is drainage of pus or blood, hearing loss, or swelling behind the ear.",
    emergencyCallRequired: false
  },

  back_pain_muscle_strain: {
    id: "back_pain_muscle_strain",
    title: "Acute Back Pain & Muscle Strain",
    category: "Musculoskeletal",
    severity: "Low",
    confidenceTier: "high",
    possibleEmergency: "Possible lumbar muscle strain, ligament sprain, or postural spasm",
    keywords: [
      "back pain", "lower back pain", "back ache", "back hurt", "pulled back",
      "lumbago", "spine pain", "back spasm", "stiff back", "sciatica", "pain bending back",
      "backache", "lower back hurt"
    ],
    whatHappened: "Overstretching or microscopic tearing of back muscle fibers or lumbar ligaments caused by improper heavy lifting, sudden twisting, or prolonged poor posture.",
    warningSigns: [
      "Sudden loss of bowel or bladder control (RED FLAG: Cauda Equina Syndrome — requires immediate emergency spine surgery)",
      "Numbness, loss of sensation in groin, buttocks, or genital area ('saddle anesthesia')",
      "Progressive weakness in legs or 'foot drop' (inability to lift the front of foot)",
      "Back pain accompanied by unexplained fever or history of cancer",
      "Severe pain following a high-impact fall or vehicle crash"
    ],
    immediateFirstAid: [
      "Apply cold packs wrapped in a towel for 15-20 minutes every 2-3 hours during the first 48 hours to minimize inflammation.",
      "Rest in a neutral spinal posture: lie on a firm mattress with pillows under your knees, or on your side with a pillow between your knees.",
      "Avoid strict prolonged bed rest: gentle short walks and light movement prevent back stiffness and speed recovery.",
      "After 48 hours, switch to mild moist heat (warm compress or warm bath) to relax tight muscular spasms.",
      "Maintain proper posture and avoid sudden bending or heavy lifting."
    ],
    whatNotToDo: [
      "DO NOT remain in strict bed rest for days — inactivity weakens core muscles and prolongs recovery.",
      "DO NOT lift heavy objects, twist while bending, or perform strenuous high-impact exercises.",
      "DO NOT undergo violent spinal cracking or aggressive manipulation during acute muscle tear.",
      "DO NOT ignore numbness spreading down legs or urinary dysfunction."
    ],
    whenToGetHelp: "Seek immediate emergency hospital care if you experience numbness in groin/buttocks or bladder/bowel incontinence. Consult an orthopedic doctor if pain radiates down past your knee or does not improve in 1-2 weeks.",
    emergencyCallRequired: false
  },

  joint_pain_cramps: {
    id: "joint_pain_cramps",
    title: "Joint Pain & Acute Muscle Cramps",
    category: "Musculoskeletal",
    severity: "Low",
    confidenceTier: "high",
    possibleEmergency: "Possible acute muscle spasm, benign joint arthralgia, or exercise cramps",
    keywords: [
      "joint pain", "knee pain", "muscle cramps", "cramping", "charley horse",
      "leg cramp", "stiff joints", "shoulder pain", "elbow pain", "calf cramp",
      "muscle spasm", "cramps in leg", "joint ache"
    ],
    whatHappened: "Involuntary, sudden, painful muscle contractions triggered by dehydration or electrolyte imbalance, or joint capsule irritation from repetitive strain or mild arthritis.",
    warningSigns: [
      "Joint is hot, intensely red, severely swollen, and accompanied by fever (RED FLAG: Septic / infected joint)",
      "Total inability to bear any weight on the leg or joint",
      "Visible bone dislocation or gross deformity",
      "Calf is swollen, warm, red, and painful to touch (RED FLAG: Deep Vein Thrombosis clot risk)"
    ],
    immediateFirstAid: [
      "FOR ACUTE MUSCLE CRAMPS (e.g. calf cramp): Gently stretch the cramped muscle. For calf cramp, straighten leg and pull toes upward toward your knee.",
      "Massage the tight knot firmly with your palms to encourage blood flow and relaxation.",
      "Apply a warm towel or heating pad to tight muscles, or take a warm shower.",
      "Hydrate with electrolyte-rich fluids (coconut water, ORS, or sports drink) to replenish potassium, sodium, and magnesium.",
      "FOR CHRONIC JOINT ACHES: Rest the affected joint, apply cold packs for acute swelling or warm compresses for morning stiffness."
    ],
    whatNotToDo: [
      "DO NOT violently yank or force a contracted joint against resistance.",
      "DO NOT perform intense weight-bearing exercises on an inflamed painful joint.",
      "DO NOT massage a calf that is swollen, hot, and tender without ruling out deep vein thrombosis (DVT)."
    ],
    whenToGetHelp: "Consult a doctor if joint is red, hot, and accompanied by fever, if there is a visible deformity, or if cramps are severe and frequent.",
    emergencyCallRequired: false
  },

  skin_rash_itching: {
    id: "skin_rash_itching",
    title: "Skin Rash, Itching & Hives (Urticaria)",
    category: "Dermatology & Allergy",
    severity: "Low",
    confidenceTier: "high",
    possibleEmergency: "Possible contact dermatitis, mild allergic urticaria (hives), or eczema flare",
    keywords: [
      "skin rash", "rash", "itching", "itchy skin", "hives", "red spots",
      "skin allergy", "welts", "rashes", "dry itchy", "red patches on skin",
      "allergic rash", "prickly heat", "skin itching"
    ],
    whatHappened: "Histamine release and dermal capillary dilation caused by contact with an allergen (plants, soaps, detergents, cosmetics), mild food reaction, insect bite, or viral illness.",
    warningSigns: [
      "Rash accompanied by facial swelling, lip or tongue swelling, or difficulty breathing (RED FLAG: Life-threatening Anaphylaxis — Call 112)",
      "Tiny purple/red spots that DO NOT fade or turn white when pressed firmly with a clear glass tumbler (RED FLAG: Non-blanching petechial/purpura rash — potential meningitis or sepsis)",
      "Skin is blistering, peeling extensively, or sloughing off with fever (Stevens-Johnson syndrome emergency)",
      "Spreading warm red streaking with severe pain and high fever (cellulitis)"
    ],
    immediateFirstAid: [
      "Wash the skin gently with cool water and mild, fragrance-free soap to remove residual allergens or irritants.",
      "Apply cool, damp washcloths to itchy areas for 10-15 minutes to reduce inflammation and soothe nerve endings.",
      "Apply plain calamine lotion or an over-the-counter 1% hydrocortisone cream to small localized itchy patches.",
      "Wear loose, smooth, soft cotton clothing; avoid tight, scratchy woolen or synthetic fabrics.",
      "Consider an over-the-counter oral antihistamine (e.g. Cetirizine) to reduce histamine-mediated itching."
    ],
    whatNotToDo: [
      "DO NOT scratch the rash (scratching damages skin barrier, causing secondary bacterial infections and scars).",
      "DO NOT take hot showers or baths (hot water releases more histamine, worsening itching).",
      "DO NOT apply harsh home remedies like bleach, toothpaste, or unverified herbal pastes.",
      "DO NOT ignore breathing difficulty or facial swelling."
    ],
    whenToGetHelp: "CALL 112 IMMEDIATELY if rash is accompanied by breathing trouble, swelling of lips/throat, or fainting. Consult a dermatologist if rash is blistering, painful, spreading rapidly, or does not improve in a few days.",
    emergencyCallRequired: false
  },

  weakness_fatigue_dehydration: {
    id: "weakness_fatigue_dehydration",
    title: "General Weakness, Fatigue & Dehydration",
    category: "General & Systemic",
    severity: "Low",
    confidenceTier: "high",
    possibleEmergency: "Possible physical exhaustion, mild dehydration, or viral convalescence",
    keywords: [
      "weakness", "feeling weak", "fatigue", "exhaustion", "tiredness", "dehydrated",
      "dry mouth", "thirsty", "low energy", "body weak", "feeling faint", "run down",
      "lethargy", "drained"
    ],
    whatHappened: "Depletion of body fluids and electrolytes from sweating, inadequate fluid intake, recent illness, lack of restful sleep, or nutritional deficits.",
    warningSigns: [
      "Sudden weakness or numbness localized to one side of the body or face (RED FLAG: Stroke — Call 112)",
      "Extreme dizziness, confusion, disorientation, or fainting cold",
      "Rapid, weak, thready pulse with clammy pale skin",
      "No urine output for more than 8 hours, or dark amber-brown urine",
      "Chest pressure or shortness of breath with weakness"
    ],
    immediateFirstAid: [
      "Sit or lie down in a cool, well-ventilated space immediately to prevent falls.",
      "Hydrate with balanced fluids: Sip Oral Rehydration Salts (ORS), fresh coconut water, or clean water with a pinch of salt and lemon.",
      "If feeling lightheaded, elevate your legs about 12 inches above heart level to assist blood return to the brain.",
      "Eat a small, easily digestible snack containing complex carbohydrates (e.g., banana, toast, or glucose biscuit) if hypoglycemia is suspected.",
      "Loosen tight collars, belts, and restrictive clothing."
    ],
    whatNotToDo: [
      "DO NOT stand up abruptly from sitting or lying down (causes orthostatic blood pressure drop and fainting).",
      "DO NOT consume alcohol or energy drinks loaded with excessive caffeine.",
      "DO NOT attempt strenuous physical exertion while feeling significantly weak.",
      "DO NOT ignore sudden one-sided body weakness."
    ],
    whenToGetHelp: "Seek emergency care if weakness is sudden, localized to one side of face/body, or accompanied by chest pain or confusion. Consult a doctor for persistent fatigue lasting weeks.",
    emergencyCallRequired: false
  },

  dizziness_vertigo: {
    id: "dizziness_vertigo",
    title: "Dizziness, Lightheadedness & Vertigo",
    category: "Head & Neurological",
    severity: "Moderate",
    confidenceTier: "high",
    possibleEmergency: "Possible postural hypotension, inner ear vestibular disturbance (vertigo), or mild dehydration",
    keywords: [
      "dizziness", "dizzy", "lightheaded", "room spinning", "vertigo", "unsteady",
      "feeling dizzy", "loss of balance", "dizzi", "woozy", "giddiness", "head spinning"
    ],
    whatHappened: "Transient reduction in cerebral blood flow when standing, inner ear fluid disturbance (vestibular vertigo), dehydration, or low blood sugar.",
    warningSigns: [
      "Dizziness accompanied by sudden weakness in arms/legs, slurred speech, or facial drooping (RED FLAG: Stroke — Call 112)",
      "Sudden chest pain, palpitations, or shortness of breath",
      "Loss of consciousness, even for a brief moment",
      "Double vision, sudden blindness, or difficulty walking/coordinating limbs",
      "Severe sudden headache and continuous vomiting"
    ],
    immediateFirstAid: [
      "Sit or lie down immediately to avoid falling and sustaining secondary injury.",
      "If lying down, keep your head still and avoid sudden head turns.",
      "Sip a glass of cool water or electrolyte solution slowly.",
      "Focus your eyes on a fixed, non-moving object in the distance.",
      "When getting up, transition very slowly: lie to sit for 1 minute, sit to stand for 1 minute."
    ],
    whatNotToDo: [
      "DO NOT drive, ride a bicycle, or operate heavy machinery while dizzy.",
      "DO NOT make sudden jerky head movements or change body posture rapidly.",
      "DO NOT walk in the dark without adequate lighting and handrail support."
    ],
    whenToGetHelp: "Call 112 immediately if dizziness occurs with weakness, speech changes, chest pain, or fainting. See an ENT specialist or doctor if spinning sensations (vertigo) recur frequently.",
    emergencyCallRequired: false
  },

  tablet_usage_guidelines: {
    id: "tablet_usage_guidelines",
    title: "Safe Tablet Usage, Meal Timing & Course Duration",
    category: "Medication & Clinical Safety",
    severity: "Low",
    confidenceTier: "high",
    possibleEmergency: "Medication administration, meal timing, and safe tablet duration guidelines",
    keywords: [
      "tablet", "tablets", "pill", "pills", "medicine duration", "how to take tablet", "when to take tablet",
      "how many days", "how many days tablet", "empty stomach", "after food", "crush tablet", "chew tablet",
      "missed dose", "antibiotic course", "paracetamol days", "dolo duration", "combiflam duration", "tablet guide"
    ],
    whatHappened: "Guidance on how to safely take oral tablets (swallowing posture, water volume, formulation rules), when to take them in relation to meals, how many days to take them, and critical safety rules.",
    warningSigns: [
      "Tablet lodged in throat or intense burning chest pain after swallowing a dry pill (pill-induced esophagitis)",
      "Severe stomach pain, dark black stool, or vomiting blood after taking painkillers on an empty stomach",
      "Fever persisting more than 3 consecutive days despite taking fever medication (risk of tropical infections)",
      "Severe itching, facial/lip swelling, or breathing difficulty after taking any tablet (anaphylaxis - Call 112)"
    ],
    immediateFirstAid: [
      "SWALLOWING POSTURE & WATER: Always swallow tablets sitting upright or standing with a full 200–250 ml glass of plain room-temperature water. Remain upright for at least 15–30 minutes to prevent pill-induced esophageal ulceration.",
      "FOOD TIMING RULES: Take acidity PPIs (Pantoprazole, Omeprazole) on an EMPTY STOMACH 30–60 minutes before breakfast. Take NSAIDs (Combiflam, Ibuprofen) strictly AFTER FOOD or with milk to protect stomach lining. Take Cetirizine at BEDTIME.",
      "DURATION LIMITS: Never take OTC painkillers/fever reducers (Paracetamol, Dolo 650) for more than 2 to 3 days without doctor evaluation. Limit Combiflam to 1 to 2 days for acute pain. Use antacids for max 1 to 2 days SOS.",
      "ANTIBIOTIC MANDATE: If prescribed antibiotics by a doctor, MUST complete the FULL 3, 5, or 7-day course even if you feel 100% healthy. Never stop early (prevents Antimicrobial Resistance).",
      "NEVER CRUSH COATED PILLS: Never crush, chew, or split Enteric-Coated (EC) or Sustained-Release (SR/ER/XL) tablets. Chewable tablets (Digene) must be thoroughly chewed before swallowing."
    ],
    whatNotToDo: [
      "DO NOT swallow tablets dry or with just a tiny sip of water.",
      "DO NOT lie down flat immediately after taking a tablet (prevents esophageal erosion).",
      "DO NOT take tablets with hot tea, coffee, milk (chelates antibiotics), fruit juices, or alcohol.",
      "DO NOT double the dose if you miss a scheduled tablet — resume regular schedule.",
      "DO NOT combine multiple cold/flu syrups with Paracetamol (prevents liver-toxic overdose)."
    ],
    whenToGetHelp: "Consult a doctor immediately if fever lasts >3 days, symptoms worsen, or if you develop an allergic skin rash, facial swelling, or severe abdominal pain.",
    emergencyCallRequired: false
  }
};

/**
 * Standard Unknown Problem & Uncertainty Handling Protocol
 * Displayed when the system does not recognize a symptom, has unreliable information,
 * or when safe home first aid does not exist.
 */
const UNKNOWN_GUIDANCE = {
  id: "unknown_problem",
  title: "Medical Consultation Recommended",
  category: "Professional Medical Care",
  severity: "Moderate",
  confidenceTier: "unknown",
  isUnknownProblem: true,
  possibleEmergency: "Unrecognized or Complex Health Problem",
  primaryMessage: "We're unable to provide reliable guidance for this problem. It's better to consult a doctor for proper medical advice.",
  secondaryMessage: "Your health is important. Please don't rely on uncertain information or self-medicate based on guesses.",
  consultDoctorButton: true,
  whatHappened: "The symptoms or health concern you described cannot be safely or reliably matched to an approved first-aid protocol. Proper evaluation requires clinical examination, physical tests, or prescription by a doctor.",
  warningSigns: [
    "Sudden worsening or intensifying of your symptoms",
    "High fever (>102°F / 39°C) or severe chills",
    "Severe, localized, or spreading pain",
    "Shortness of breath, chest pressure, or difficulty breathing",
    "Dizziness, confusion, fainting, or loss of balance",
    "Symptoms that persist or recur over multiple days"
  ],
  immediateFirstAid: [
    "Rest in a comfortable, quiet, well-ventilated space.",
    "Do NOT take unprescribed prescription medicines, strong painkillers, or leftover antibiotics.",
    "Stay hydrated with clean drinking water or electrolyte solution (unless vomiting severely).",
    "Schedule an in-person or teleconsultation appointment with a qualified doctor (General Physician).",
    "If any life-threatening signs appear (chest pain, breathing trouble, unconsciousness), call 112 immediately."
  ],
  whatNotToDo: [
    "DO NOT self-medicate or take random medications based on unverified guesses.",
    "DO NOT attempt aggressive, unverified home remedies or herbal concoctions.",
    "DO NOT delay visiting a clinic if the problem causes significant pain or distress.",
    "DO NOT ignore worsening symptoms or unusual body changes."
  ],
  whenToGetHelp: "Please consult a healthcare professional at your local clinic, hospital outpatient department, or via the National Health Helpline (104).",
  emergencyCallRequired: false
};

/**
 * Serious Emergency Red-Flag Evaluator
 * High-priority clinical safety checks that override minor assessments
 */
const SERIOUS_RED_FLAGS = [
  {
    pattern: /(chest pain|chest pressure|tight chest|crushing pain|elephant on chest|heart attack|pain in left arm)/i,
    guideId: "heart_attack",
    label: "Possible Acute Cardiac Emergency"
  },
  {
    pattern: /(cant breathe|cannot breathe|difficulty breathing|struggling to breathe|gasping|blue lips|airway blocked|choking)/i,
    guideId: "choking",
    label: "Acute Airway / Breathing Emergency"
  },
  {
    pattern: /(unconscious|passed out|not responding|unresponsive|collapsed cold|no pulse|not breathing)/i,
    guideId: "cpr_unconscious",
    label: "Unconsciousness / Possible Cardiac Arrest"
  },
  {
    pattern: /(face drooping|slurred speech|cant talk|arm weakness|facial palsy|one side numb|sudden paralysis)/i,
    guideId: "stroke",
    label: "Possible Acute Stroke (FAST Emergency)"
  },
  {
    pattern: /(seizure|convulsions|shaking violently|epilepsy fit|foaming mouth)/i,
    guideId: "seizure",
    label: "Active Seizure / Convulsions"
  },
  {
    pattern: /(severe bleeding|blood gushing|spurting blood|artery bleeding|heavy bleeding wont stop)/i,
    guideId: "bleeding_severe",
    label: "Severe Arterial Hemorrhage"
  },
  {
    pattern: /(snake bite|snakebite|cobra|viper|krait|fang marks)/i,
    guideId: "snakebite",
    label: "Venomous Snakebite Emergency"
  },
  {
    pattern: /(drank poison|swallowed chemical|pesticide ingestion|swallowed bleach|acid attack|medicine overdose)/i,
    guideId: "poisoning",
    label: "Acute Chemical or Poison Ingestion"
  },
  {
    pattern: /(electric shock|electrocuted|live wire shock)/i,
    guideId: "electric_shock",
    label: "High-Voltage Electrical Shock"
  },
  {
    pattern: /(anaphylaxis|throat closing|tongue swollen|lips swelling allergy|epipen)/i,
    guideId: "anaphylaxis",
    label: "Life-Threatening Anaphylaxis"
  },
  {
    pattern: /(thunderclap headache|worst headache of my life|sudden severe explosive headache)/i,
    guideId: "head_injury",
    label: "Severe Neurological Red Flag"
  },
  {
    pattern: /(coughing blood|vomiting blood|black tarry stool)/i,
    guideId: "bleeding_severe",
    label: "Possible Internal Hemorrhage"
  }
];

/**
 * Common Spelling Typos & Colloquial Symptom Map
 */
const COMMON_TYPOS = {
  "headake": "headache", "head ache": "headache", "hedache": "headache", "headahe": "headache",
  "stomache": "stomach", "stomac": "stomach", "stomachache": "stomach ache", "stomack": "stomach",
  "vomting": "vomiting", "vomitng": "vomiting", "puking": "vomiting", "puke": "vomiting", "naucea": "nausea",
  "diahrea": "diarrhea", "diarhea": "diarrhea", "diarrhoea": "diarrhea", "loose motion": "diarrhea", "loose motions": "diarrhea",
  "feever": "fever", "temparature": "fever", "tempreture": "fever", "fevr": "fever",
  "couph": "cough", "cof": "cough", "caugh": "cough",
  "breeth": "breathe", "dificult": "difficult",
  "dizynes": "dizziness", "dizzi": "dizziness", "drowzy": "drowsiness",
  "bleding": "bleeding", "blod": "blood", "bleedng": "bleeding",
  "burnd": "burn", "bernt": "burn", "burnt": "burn",
  "alergic": "allergic", "alergy": "allergy",
  "sholder": "shoulder", "anckle": "ankle", "elbo": "elbow",
  "toothe": "tooth", "toothake": "toothache", "tooth ache": "toothache",
  "ear pain": "earache", "ear ache": "earache",
  "body pain": "body ache", "tierd": "tired", "fatique": "fatigue", "fatiqe": "fatigue"
};

/**
 * Intelligent Symptom Understanding & Analysis Engine
 * Evaluates any user input across:
 * 1. Serious Red Flags (Emergency triage)
 * 2. Typo-tolerant normalization
 * 3. Broad symptom recognition
 * 4. Confidence-based classification (emergency, high, partial, unknown)
 * 5. Unknown problem safety handling (doctor consultation)
 */
function analyzeTextSymptoms(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return {
      ...UNKNOWN_GUIDANCE,
      analysisNote: "No symptom description was provided."
    };
  }

  const rawClean = text.trim();
  let normalized = rawClean.toLowerCase();

  // Replace common typos and colloquialisms
  for (const [typo, replacement] of Object.entries(COMMON_TYPOS)) {
    if (normalized.includes(typo)) {
      normalized = normalized.split(typo).join(replacement);
    }
  }

  // 1. Serious Red Flag Emergency Evaluation (Requirement 4)
  for (const redFlag of SERIOUS_RED_FLAGS) {
    if (redFlag.pattern.test(normalized) || redFlag.pattern.test(rawClean)) {
      const emergencyGuide = EMERGENCY_GUIDES[redFlag.guideId];
      if (emergencyGuide) {
        return {
          ...emergencyGuide,
          severity: emergencyGuide.severity === "Critical" ? "Critical" : "High",
          confidenceTier: "emergency",
          isLifeThreatening: true,
          emergencyCallRequired: true,
          possibleEmergency: `EMERGENCY ALERT: ${redFlag.label}`,
          safetyWarning: "POTENTIAL MEDICAL EMERGENCY DETECTED. Do not delay seeking professional emergency assistance.",
          analysisNote: "Life-threatening red-flag indicators identified. Immediate emergency action prioritized."
        };
      }
    }
  }

  // Check for complex non-first-aid medical queries (chronic illnesses, cancer, prescription dosage, etc.)
  const complexMedicalPattern = /(cancer|chemotherapy|creatinine|dialysis|hepatitis|lupus|antibiotic dose|which antibiotic|sleeping pill|steroid dose|metformin dose|insulin unit|surgery for)/i;
  if (complexMedicalPattern.test(normalized)) {
    return {
      ...UNKNOWN_GUIDANCE,
      possibleEmergency: "Complex Medical Condition / Prescription Inquiry",
      primaryMessage: "We're unable to provide reliable guidance for this problem. It's better to consult a doctor for proper medical advice.",
      secondaryMessage: "Your health is important. Please don't rely on uncertain information or self-medicate based on guesses.",
      analysisNote: "Condition requires direct clinical evaluation or licensed physician prescription."
    };
  }

  // 2. Multi-Keyword Scoring across all Knowledge Base entries
  let bestMatch = null;
  let highestScore = 0;
  let matchedWords = [];

  // Check Indic multilingual keywords (Kannada, Hindi, Telugu, Tamil, Malayalam, Bengali, Marathi)
  try {
    const { INDIC_SYMPTOM_KEYWORDS } = require('./multilingualService');
    for (const item of INDIC_SYMPTOM_KEYWORDS) {
      for (const kw of item.keywords) {
        if (rawClean.includes(kw) || normalized.includes(kw)) {
          const matchedGuide = EMERGENCY_GUIDES[item.guideId];
          if (matchedGuide) {
            let indicScore = kw.length >= 4 ? 6 : 4;
            if (matchedGuide.severity === 'Critical') indicScore += 3;
            if (indicScore > highestScore) {
              highestScore = indicScore;
              bestMatch = matchedGuide;
              matchedWords = [kw];
            }
          }
        }
      }
    }
  } catch (err) {}

  for (const [key, guide] of Object.entries(EMERGENCY_GUIDES)) {
    let score = 0;
    const matched = [];

    for (const kw of guide.keywords) {
      if (normalized.includes(kw)) {
        // Longer matching phrases have higher clinical specificity
        const weight = kw.split(" ").length * 2 + 1;
        score += weight;
        matched.push(kw);
      }
    }

    // Contextual relevance boosters
    if (key === "burns" && (normalized.includes("water") || normalized.includes("oil") || normalized.includes("steam") || normalized.includes("stove"))) {
      score += 3;
    }
    if (key === "headache_migraine" && (normalized.includes("head") && (normalized.includes("pain") || normalized.includes("ache") || normalized.includes("throbbing")))) {
      score += 4;
    }
    if (key === "fever_cold_flu" && (normalized.includes("temperature") || normalized.includes("chills") || normalized.includes("shivering"))) {
      score += 4;
    }
    if (key === "stomach_pain_gastric" && (normalized.includes("stomach") || normalized.includes("belly") || normalized.includes("abdomen"))) {
      score += 4;
    }
    if (key === "diarrhea_loose_motion" && (normalized.includes("motion") || normalized.includes("stool") || normalized.includes("toilet"))) {
      score += 4;
    }
    if (key === "toothache_oral_pain" && (normalized.includes("tooth") || normalized.includes("teeth") || normalized.includes("gum"))) {
      score += 4;
    }
    if (key === "back_pain_muscle_strain" && (normalized.includes("back") && (normalized.includes("pain") || normalized.includes("hurt") || normalized.includes("strain")))) {
      score += 4;
    }
    if (key === "joint_pain_cramps" && (normalized.includes("cramp") || normalized.includes("joint") || normalized.includes("knee"))) {
      score += 4;
    }
    if (key === "skin_rash_itching" && (normalized.includes("rash") || normalized.includes("itch") || normalized.includes("spots"))) {
      score += 4;
    }
    if (key === "dizziness_vertigo" && (normalized.includes("dizzy") || normalized.includes("spinning") || normalized.includes("balance"))) {
      score += 4;
    }
    if (key === "tablet_usage_guidelines" && (normalized.includes("tablet") || normalized.includes("pill") || normalized.includes("how many days") || normalized.includes("how to take"))) {
      score += 5;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = guide;
      matchedWords = matched;
    }
  }

  // 3. Unknown Problem & Uncertainty Handling (Requirement 3 & 5)
  // If score is 0 or less than 2, do NOT invent advice or guess!
  if (!bestMatch || highestScore < 2) {
    return {
      ...UNKNOWN_GUIDANCE,
      matchedKeywords: [],
      analysisNote: "Input did not match recognized first-aid emergency categories with sufficient confidence."
    };
  }

  // 4. Confidence Tiering (Requirement 5)
  // High confidence vs Partial confidence
  if (highestScore >= 4) {
    return {
      ...bestMatch,
      confidenceTier: "high",
      matchedKeywords: Array.from(new Set(matchedWords)),
      analysisNote: `Recognized symptom pattern for ${bestMatch.title} with high clinical correlation.`
    };
  } else {
    // Partial confidence (Score 2-3)
    return {
      ...bestMatch,
      confidenceTier: "partial",
      uncertaintyNotice: "Partial symptom match: Your description provides limited detail. General supportive care is provided below, but a doctor's evaluation is recommended.",
      matchedKeywords: Array.from(new Set(matchedWords)),
      analysisNote: "Partial confidence match. Safe supportive care provided with doctor evaluation recommended."
    };
  }
}

module.exports = {
  EMERGENCY_GUIDES,
  UNKNOWN_GUIDANCE,
  DEFAULT_GUIDE: UNKNOWN_GUIDANCE,
  SERIOUS_RED_FLAGS,
  analyzeTextSymptoms
};
