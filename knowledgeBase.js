/**
 * FirstAid+ Emergency Knowledge Base & Clinical Rule Engine
 * Medically-grounded protocols aligned with Red Cross, WHO, and Indian First Aid guidelines.
 */

const EMERGENCY_GUIDES = {
  bleeding_severe: {
    id: "bleeding_severe",
    title: "Severe Bleeding / Arterial Hemorrhage",
    category: "Trauma & Wounds",
    severity: "Critical", // Low, Moderate, High, Critical
    possibleEmergency: "Possible severe laceration or arterial bleeding injury",
    keywords: [
      "severe bleeding", "blood gushing", "spurting blood", "heavy bleeding", "deep cut", 
      "artery", "wound bleeding heavily", "slit wrist", "stab", "puncture deep", 
      "blood soaking", "blood pool", "hemorrhage", "bleeding wont stop"
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
    possibleEmergency: "Possible superficial cut, scrape, or minor laceration",
    keywords: [
      "cut", "paper cut", "scrape", "scratched", "minor cut", "grazed", "skinned knee", 
      "small wound", "finger cut", "kitchen knife cut", "minor bleeding", "abrasion"
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
      "Wash your hands with soap and water before touching the wound.",
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
    possibleEmergency: "Possible thermal burn or scald injury",
    keywords: [
      "burn", "hot water", "boiling water", "steam", "scalding", "flame", "fire", 
      "hot oil", "stove", "iron", "hot pan", "blister", "charred skin", "peeling skin"
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
    possibleEmergency: "Possible foreign body airway obstruction (Choking)",
    keywords: [
      "choking", "cant breathe", "cannot breathe", "food stuck", "throat stuck", 
      "gasping", "hands on neck", "blue lips", "coughing weakly", "silent cough", 
      "swallowed coin", "choked on toy", "airway blocked", "strangling"
    ],
    whatHappened: "A foreign object, food morsel, or fluid has lodged in the trachea (windpipe), blocking airflow to the lungs. Oxygen deprivation leads to unconsciousness within minutes.",
    warningSigns: [
      "Universal choking sign: hands clutching the neck/throat",
      "Inability to speak, cry, or cough forcefully",
      "High-pitched wheezing sounds when inhaling",
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
    possibleEmergency: "Possible sudden cardiac arrest or profound unconsciousness",
    keywords: [
      "unconscious", "not responding", "passed out", "collapsed", "no pulse", 
      "not breathing", "stopped breathing", "fainted cold", "cardiac arrest", 
      "unresponsive", "gasping for air", "agonal breathing", "dead faint"
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
    possibleEmergency: "Possible acute myocardial infarction (Heart Attack)",
    keywords: [
      "chest pain", "chest pressure", "heart attack", "pain in left arm", 
      "heavy chest", "tight chest", "crushing pain", "jaw pain", "cold sweat nausea", 
      "shortness of breath chest", "elephant on chest"
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
    possibleEmergency: "Possible acute stroke (Brain attack)",
    keywords: [
      "stroke", "face drooping", "slurred speech", "cant talk", "arm weakness", 
      "one side numb", "facial palsy", "mouth tilted", "sudden paralysis", 
      "cant lift arm", "sudden confusion", "severe sudden headache"
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
    possibleEmergency: "Possible epileptic seizure or convulsive episode",
    keywords: [
      "seizure", "convulsions", "shaking", "fits", "epilepsy", "jerking", 
      "foaming mouth", "eyes rolled back", "trembling violently", "spasms", "rigidity"
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
    possibleEmergency: "Possible bone fracture, joint dislocation, or severe sprain",
    keywords: [
      "fracture", "broken bone", "twisted ankle", "sprain", "fell down", "swollen ankle", 
      "deformed bone", "snapped", "cant put weight", "bone sticking out", "dislocated shoulder", 
      "wrist swollen", "cracking sound"
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
    possibleEmergency: "Possible venomous snakebite envenomation",
    keywords: [
      "snake bite", "snakebite", "bitten by snake", "cobra", "viper", "krait", 
      "fang marks", "two puncture marks", "snake venom", "swelling after snake"
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
    possibleEmergency: "Possible acute poisoning, chemical ingestion, or overdose",
    keywords: [
      "poison", "drank pesticide", "swallowed bleach", "chemical swallow", 
      "rat poison", "overdose", "medicine overdose", "ingested detergent", 
      "toxic ingestion", "phenyl", "acid attack"
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
    possibleEmergency: "Possible life-threatening allergic reaction (Anaphylaxis)",
    keywords: [
      "allergic reaction", "anaphylaxis", "bee sting swollen", "swollen lips", 
      "tongue swollen", "throat closing", "peanut allergy", "hives all over", 
      "cant swallow allergy", "medicine allergy rash"
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
  }
};

/**
 * Fallback guide for generic or unclassified emergencies
 */
const DEFAULT_GUIDE = {
  id: "generic_emergency",
  title: "General First Aid & Triage Guidance",
  category: "General Emergency",
  severity: "Moderate",
  possibleEmergency: "Unspecified medical incident requiring observation and first aid",
  whatHappened: "The described signs suggest a physical trauma or sudden acute illness. While immediate specific emergency markers were inconclusive, systematic first-aid principles apply.",
  warningSigns: [
    "Difficulty breathing, choking, or gasping",
    "Loss of consciousness or altered mental alertness",
    "Severe, uncontrolled bleeding",
    "Crushing chest pressure or sudden weakness on one side",
    "Severe or worsening unbearable pain"
  ],
  immediateFirstAid: [
    "Assess scene safety: ensure you and the victim are safe from traffic, fire, electricity, or continuing hazards.",
    "Check responsiveness and breathing: Shout and tap collarbones. If unresponsive and not breathing, begin CPR and call 112 immediately.",
    "If breathing normally, place the person in a comfortable resting position. If fainting or shock suspected, elevate legs slightly.",
    "Control any visible bleeding with direct manual pressure using clean dressings.",
    "Keep the person warm, calm, and continuously monitored."
  ],
  whatNotToDo: [
    "DO NOT move the person if spinal or neck injury is suspected (e.g. falls, traffic accidents).",
    "DO NOT give food, drink, or medications to an altered or drowsy person.",
    "DO NOT leave an unstable casualty unattended."
  ],
  whenToGetHelp: "Seek immediate medical care at the nearest hospital if condition deteriorates or if any warning signs develop.",
  emergencyCallRequired: false
};

/**
 * Smart Clinical Rule Matcher for Natural Language Text
 */
function analyzeTextSymptoms(text) {
  if (!text || typeof text !== "string") {
    return { ...DEFAULT_GUIDE, confidence: 0, matchedKeywords: [] };
  }

  const clean = text.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;
  let matchedWords = [];

  for (const [key, guide] of Object.entries(EMERGENCY_GUIDES)) {
    let score = 0;
    const matched = [];

    for (const kw of guide.keywords) {
      if (clean.includes(kw)) {
        // Longer matching phrases have higher clinical specificity
        const weight = kw.split(" ").length * 2 + 1;
        score += weight;
        matched.push(kw);
      }
    }

    // Context boosters
    if (key === "burns" && (clean.includes("hot") || clean.includes("water") || clean.includes("oil") || clean.includes("fire") || clean.includes("steam"))) {
      score += 3;
    }
    if (key === "bleeding_severe" && (clean.includes("gushing") || clean.includes("soaking") || clean.includes("artery") || clean.includes("knife"))) {
      score += 4;
    }
    if (key === "stroke" && (clean.includes("face") || clean.includes("speech") || clean.includes("arm") || clean.includes("paralysis"))) {
      score += 4;
    }
    if (key === "cpr_unconscious" && (clean.includes("unconscious") || clean.includes("not breathing") || clean.includes("collapsed"))) {
      score += 5;
    }
    if (key === "choking" && (clean.includes("cant breathe") || clean.includes("stuck") || clean.includes("throat"))) {
      score += 4;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = guide;
      matchedWords = matched;
    }
  }

  if (!bestMatch || highestScore < 1) {
    return {
      ...DEFAULT_GUIDE,
      confidence: 0.35,
      matchedKeywords: [],
      analysisNote: "Input did not match a specific emergency pattern with high certainty. General first-aid guidance provided."
    };
  }

  return {
    ...bestMatch,
    confidence: Math.min(0.95, 0.45 + highestScore * 0.1),
    matchedKeywords: Array.from(new Set(matchedWords)),
    analysisNote: `Matched ${matchedWords.length} clinical indicators with high correlation.`
  };
}

module.exports = {
  EMERGENCY_GUIDES,
  DEFAULT_GUIDE,
  analyzeTextSymptoms
};

