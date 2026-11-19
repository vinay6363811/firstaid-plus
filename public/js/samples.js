/**
 * FirstAid+ Sample Injury Images for Instant Visual Analysis Testing
 * Provides 4 realistic illustrative vectors in SVG/Base64 format.
 */

// 1. Minor Thermal Burn with surface erythema (redness)
const SAMPLE_BURN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <radialGradient id="skin" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8d7b8"/>
      <stop offset="100%" stop-color="#e2b992"/>
    </radialGradient>
    <radialGradient id="burnRedness" cx="48%" cy="52%" r="45%">
      <stop offset="0%" stop-color="#e63946" stop-opacity="0.85"/>
      <stop offset="40%" stop-color="#f46036" stop-opacity="0.6"/>
      <stop offset="75%" stop-color="#f77f00" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#f8d7b8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blister" cx="40%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#fff3b0" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="#f3c053" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#e63946" stop-opacity="0.4"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <!-- Arm/Hand Background Surface -->
  <path d="M50 150 C 90 90, 250 80, 350 110 C 370 180, 340 260, 260 270 C 140 280, 70 230, 50 150 Z" fill="url(#skin)" stroke="#c59b73" stroke-width="2"/>
  <!-- Erythema (Burn Area) -->
  <ellipse cx="200" cy="175" rx="75" ry="55" fill="url(#burnRedness)"/>
  <ellipse cx="215" cy="165" rx="45" ry="35" fill="url(#burnRedness)"/>
  <!-- Blisters -->
  <ellipse cx="185" cy="160" rx="14" ry="10" fill="url(#blister)" stroke="#d90429" stroke-width="1"/>
  <ellipse cx="225" cy="180" rx="18" ry="12" fill="url(#blister)" stroke="#d90429" stroke-width="1"/>
  <ellipse cx="205" cy="195" rx="10" ry="7" fill="url(#blister)" stroke="#d90429" stroke-width="1"/>
  <!-- Text Label -->
  <rect x="20" y="20" width="220" height="30" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <text x="30" y="40" font-family="sans-serif" font-size="12" font-weight="bold" fill="#b91c1c">FIG 1. Thermal Scald / Burn</text>
</svg>`;

// 2. Bleeding Laceration / Superficial Cut
const SAMPLE_CUT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <radialGradient id="armSkin" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f5d0b0"/>
      <stop offset="100%" stop-color="#dba885"/>
    </radialGradient>
    <filter id="shadow">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#7f1d1d" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <!-- Forearm skin area -->
  <path d="M40 100 Q 200 80 360 90 L 370 240 Q 200 250 40 230 Z" fill="url(#armSkin)" stroke="#c28e67" stroke-width="2"/>
  <!-- Surrounding redness -->
  <path d="M 140 160 Q 200 140 260 155 Q 230 190 150 185 Z" fill="#ef4444" opacity="0.3"/>
  <!-- Linear laceration wound -->
  <path d="M 150 170 Q 185 158 245 162" stroke="#7f1d1d" stroke-width="7" stroke-linecap="round" fill="none" filter="url(#shadow)"/>
  <path d="M 155 170 Q 185 160 240 163" stroke="#b91c1c" stroke-width="4" stroke-linecap="round" fill="none"/>
  <!-- Fresh blood drops -->
  <circle cx="210" cy="180" r="5" fill="#dc2626"/>
  <circle cx="213" cy="195" r="4" fill="#991b1b"/>
  <path d="M 213 192 Q 215 208 212 216 Q 208 208 213 192 Z" fill="#991b1b"/>
  <!-- Text Label -->
  <rect x="20" y="20" width="220" height="30" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <text x="30" y="40" font-family="sans-serif" font-size="12" font-weight="bold" fill="#b91c1c">FIG 2. Bleeding Laceration</text>
</svg>`;

// 3. Sprained Ankle / Joint Swelling with Bruising
const SAMPLE_SPRAIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <radialGradient id="ankleSkin" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fae1c9"/>
      <stop offset="100%" stop-color="#e0b48c"/>
    </radialGradient>
    <radialGradient id="bruise" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#581c87" stop-opacity="0.7"/>
      <stop offset="45%" stop-color="#1e3a8a" stop-opacity="0.5"/>
      <stop offset="80%" stop-color="#ca8a04" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#fae1c9" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <!-- Ankle and Foot Outline showing lateral bulbous swelling -->
  <path d="M 150 40 L 155 140 C 120 180, 80 210, 60 250 L 260 250 C 270 230, 260 190, 240 180 C 280 150, 250 120, 220 120 L 210 40 Z" fill="url(#ankleSkin)" stroke="#caa178" stroke-width="2"/>
  <!-- Swollen bulging area -->
  <ellipse cx="230" cy="165" rx="38" ry="28" fill="#f87171" opacity="0.4"/>
  <!-- Deep purple/blue subcutaneous hematoma (ecchymosis) -->
  <ellipse cx="225" cy="168" rx="26" ry="18" fill="url(#bruise)"/>
  <!-- Text Label -->
  <rect x="20" y="20" width="240" height="30" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <text x="30" y="40" font-family="sans-serif" font-size="12" font-weight="bold" fill="#b45309">FIG 3. Sprained Ankle Swelling</text>
</svg>`;

// 4. Bee Sting / Allergic Wheal & Flare
const SAMPLE_RASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <radialGradient id="rashSkin" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="100%" stop-color="#fbd0a0"/>
    </radialGradient>
    <radialGradient id="erythema" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.85"/>
      <stop offset="60%" stop-color="#fb7185" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#fed7aa" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <!-- Skin base -->
  <rect x="30" y="60" width="340" height="200" rx="20" fill="url(#rashSkin)" stroke="#d99f70" stroke-width="2"/>
  <!-- Flare redness -->
  <circle cx="200" cy="160" r="65" fill="url(#erythema)"/>
  <!-- Central raised white wheal -->
  <circle cx="200" cy="160" r="22" fill="#fff1f2" stroke="#e11d48" stroke-width="1.5"/>
  <!-- Puncture stinger dot -->
  <circle cx="200" cy="160" r="3" fill="#881337"/>
  <!-- Text Label -->
  <rect x="20" y="20" width="230" height="30" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <text x="30" y="40" font-family="sans-serif" font-size="12" font-weight="bold" fill="#b91c1c">FIG 4. Insect Sting Wheal</text>
</svg>`;

function svgToDataUrl(svgString) {
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
}

const SAMPLE_IMAGES = [
  {
    id: "sample-burn",
    name: "Thermal Burn / Scald",
    context: "Hot boiling water splashed on hand, visible erythema and blisters forming",
    filename: "thermal_scald_burn_sample.svg",
    mimeType: "image/svg+xml",
    dataUrl: svgToDataUrl(SAMPLE_BURN_SVG)
  },
  {
    id: "sample-cut",
    name: "Bleeding Laceration",
    context: "Kitchen knife slipped, deep superficial cut bleeding on forearm",
    filename: "laceration_cut_sample.svg",
    mimeType: "image/svg+xml",
    dataUrl: svgToDataUrl(SAMPLE_CUT_SVG)
  },
  {
    id: "sample-sprain",
    name: "Sprained Ankle",
    context: "Tripped on stairs, rapid swelling and lateral ankle bruising",
    filename: "ankle_sprain_swelling_sample.svg",
    mimeType: "image/svg+xml",
    dataUrl: svgToDataUrl(SAMPLE_SPRAIN_SVG)
  },
  {
    id: "sample-rash",
    name: "Bee Sting / Wheal",
    context: "Wasp/bee sting, raised itchy wheal with intense surrounding redness",
    filename: "insect_sting_rash_sample.svg",
    mimeType: "image/svg+xml",
    dataUrl: svgToDataUrl(SAMPLE_RASH_SVG)
  }
];

if (typeof window !== "undefined") {
  window.SAMPLE_IMAGES = SAMPLE_IMAGES;
}

