/**
 * FirstAid+ Module 11: AI Medicine & Relief Recommendations Controller
 * Dynamic symptom-to-medicine evaluation, verified Indian brand guide,
 * NPPA price estimation, safe home remedies, and real nearby pharmacy finder.
 */

(function () {
  'use strict';

  class MedicineReliefController {
    constructor() {
      // State
      this.currentQuery = '';
      this.currentConditionId = 'headache';
      this.patientProfile = {
        ageGroup: 'adult',
        duration: 'acute',
        severity: 'moderate',
        conditions: [],
        allergies: []
      };
      this.activeTab = 'medicines';
      this.currentData = null;
      this.pharmacies = [];
      this.userLat = null;
      this.userLng = null;
      this.pharmacyMap = null;
      this.pharmacyMarkers = new Map();
      this.userMarker = null;

      // DOM Elements Cache
      this.container = document.getElementById('view-medicine');
      this.searchInput = document.getElementById('medicine-symptom-input');
      this.searchBtn = document.getElementById('btn-medicine-search');
      this.quickChipsContainer = document.getElementById('medicine-quick-chips');
      this.profileDrawer = document.getElementById('medicine-profile-drawer');
      this.profileToggleBtn = document.getElementById('btn-toggle-medicine-profile');
      this.resultsContainer = document.getElementById('medicine-results-container');
      this.emergencyBanner = document.getElementById('medicine-emergency-override-banner');

      // Pharmacy elements
      this.pharmacyMapEl = document.getElementById('pharmacy-interactive-map');
      this.pharmacyListEl = document.getElementById('pharmacy-cards-list');
      this.pharmacyTotalBadge = document.getElementById('pharmacy-total-count');
      this.pharmacySearchInput = document.getElementById('pharmacy-manual-location-input');
      this.pharmacySearchBtn = document.getElementById('btn-pharmacy-manual-search');
      this.pharmacyRefreshGpsBtn = document.getElementById('btn-refresh-pharmacy-gps');

      // Tablet Guide elements & state
      this.tabletModal = document.getElementById('tablet-guide-modal');
      this.btnOpenTabletGuide = document.getElementById('btn-open-tablet-guide');
      this.btnCloseTabletGuide = document.getElementById('btn-close-tablet-guide');
      this.btnCloseTabletGuideFooter = document.getElementById('btn-close-tablet-guide-footer');
      this.btnSpeakTabletGuide = document.getElementById('btn-speak-tablet-guide');
      this.tabletSearchInput = document.getElementById('tablet-quick-search-input');
      this.tabletGuidelines = null;
      this.isSpeakingTabletGuide = false;

      this.init();
    }

    async init() {
      if (!this.container) return;

      this.bindEvents();
      this.loadQuickChips();

      // Listen for view switch to medicine
      const medNavBtn = document.querySelector('[data-view="medicine"]');
      if (medNavBtn) {
        medNavBtn.addEventListener('click', () => {
          setTimeout(() => {
            if (!this.currentData) {
              this.analyzeProblem('headache');
            }
            if (this.pharmacyMap) {
              this.pharmacyMap.invalidateSize();
            }
          }, 200);
        });
      }

      // Check initial hash
      if (window.location.hash === '#medicine') {
        setTimeout(() => this.analyzeProblem('headache'), 300);
      }
    }

    bindEvents() {
      // Search button
      if (this.searchBtn && this.searchInput) {
        this.searchBtn.addEventListener('click', () => {
          const q = this.searchInput.value.trim();
          if (q) this.analyzeProblem(q);
        });

        this.searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const q = this.searchInput.value.trim();
            if (q) this.analyzeProblem(q);
          }
        });
      }

      // Profile toggle
      if (this.profileToggleBtn && this.profileDrawer) {
        this.profileToggleBtn.addEventListener('click', () => {
          this.profileDrawer.classList.toggle('active');
          const isExpanded = this.profileDrawer.classList.contains('active');
          this.profileToggleBtn.setAttribute('aria-expanded', isExpanded);
        });
      }

      // Profile form change listener
      const profileInputs = this.container.querySelectorAll('.medicine-profile-input');
      profileInputs.forEach(input => {
        input.addEventListener('change', () => {
          this.updateProfileFromForm();
          if (this.currentQuery || this.currentConditionId) {
            this.analyzeProblem(this.currentQuery || this.currentConditionId);
          }
        });
      });

      // Pharmacy search
      if (this.pharmacySearchBtn && this.pharmacySearchInput) {
        this.pharmacySearchBtn.addEventListener('click', () => {
          const q = this.pharmacySearchInput.value.trim();
          if (q) this.geocodeAndSearchPharmacies(q);
        });

        this.pharmacySearchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const q = this.pharmacySearchInput.value.trim();
            if (q) this.geocodeAndSearchPharmacies(q);
          }
        });
      }

      // Pharmacy GPS refresh
      if (this.pharmacyRefreshGpsBtn) {
        this.pharmacyRefreshGpsBtn.addEventListener('click', () => {
          this.detectUserLocationAndFindPharmacies(true);
        });
      }

      // Tablet Usage Guide Modal bindings
      if (this.btnOpenTabletGuide) {
        this.btnOpenTabletGuide.addEventListener('click', () => {
          this.openTabletGuide('how');
        });
      }

      if (this.btnCloseTabletGuide) {
        this.btnCloseTabletGuide.addEventListener('click', () => {
          this.closeTabletGuide();
        });
      }

      if (this.btnCloseTabletGuideFooter) {
        this.btnCloseTabletGuideFooter.addEventListener('click', () => {
          this.closeTabletGuide();
        });
      }

      if (this.tabletModal) {
        this.tabletModal.addEventListener('click', (e) => {
          if (e.target === this.tabletModal) {
            this.closeTabletGuide();
          }
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.tabletModal && this.tabletModal.style.display === 'flex') {
          this.closeTabletGuide();
        }
      });

      // Tablet Modal Tabs
      const tabBtns = document.querySelectorAll('.tablet-tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const ttab = btn.getAttribute('data-ttab');
          if (ttab) this.switchTabletTab(ttab);
        });
      });

      // Tablet Filter Pills
      const filterPills = document.querySelectorAll('.quick-filter-pill');
      filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
          filterPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const filter = pill.getAttribute('data-filter');
          if (filter === 'all') {
            this.filterTabletGuide('');
          } else if (filter === 'painkillers') {
            this.switchTabletTab('lookup');
            this.filterTabletGuide('pain');
          } else if (filter === 'acidity') {
            this.switchTabletTab('lookup');
            this.filterTabletGuide('pan');
          } else if (filter === 'allergy') {
            this.switchTabletTab('lookup');
            this.filterTabletGuide('cetirizine');
          } else if (filter === 'antibiotics') {
            this.switchTabletTab('duration');
            this.filterTabletGuide('antibiotic');
          }
        });
      });

      // Tablet Search Input
      if (this.tabletSearchInput) {
        this.tabletSearchInput.addEventListener('input', (e) => {
          this.filterTabletGuide(e.target.value);
        });
      }

      // Voice read tablet guidelines
      if (this.btnSpeakTabletGuide) {
        this.btnSpeakTabletGuide.addEventListener('click', () => {
          this.speakTabletGuide();
        });
      }
    }

    updateProfileFromForm() {
      const ageSelect = document.getElementById('med-profile-age');
      const durationSelect = document.getElementById('med-profile-duration');
      const severitySelect = document.getElementById('med-profile-severity');
      const allergyInput = document.getElementById('med-profile-allergies');

      if (ageSelect) this.patientProfile.ageGroup = ageSelect.value;
      if (durationSelect) this.patientProfile.duration = durationSelect.value;
      if (severitySelect) this.patientProfile.severity = severitySelect.value;

      // Conditions checkboxes
      const conditionBoxes = this.container.querySelectorAll('.med-condition-check:checked');
      this.patientProfile.conditions = Array.from(conditionBoxes).map(b => b.value);

      // Allergies
      if (allergyInput && allergyInput.value.trim()) {
        this.patientProfile.allergies = allergyInput.value.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        this.patientProfile.allergies = [];
      }
    }

    async loadQuickChips() {
      if (!this.quickChipsContainer) return;

      const defaultCategories = [
        { id: 'headache', label: '🤕 Headache / Migraine' },
        { id: 'fever', label: '🌡️ Fever & Body Heat' },
        { id: 'cough_cold', label: '🤧 Cold, Cough & Sore Throat' },
        { id: 'acidity_stomach', label: '🔥 Acidity & Gastritis' },
        { id: 'minor_cuts', label: '🩹 Minor Cuts & Wounds' },
        { id: 'minor_burns', label: '♨️ Minor Scalds & Burns' },
        { id: 'sprain_muscle_pain', label: '🦵 Ankle Sprain & Muscle Strain' },
        { id: 'diarrhea_dehydration', label: '💧 Diarrhea & ORS Care' },
        { id: 'skin_itching', label: '🌿 Skin Rashes & Itching' }
      ];

      this.quickChipsContainer.innerHTML = defaultCategories.map(cat => `
        <button type="button" class="med-quick-chip ${cat.id === this.currentConditionId ? 'active' : ''}" data-cat-id="${cat.id}">
          ${cat.label}
        </button>
      `).join('');

      this.quickChipsContainer.querySelectorAll('.med-quick-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          this.quickChipsContainer.querySelectorAll('.med-quick-chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const catId = btn.getAttribute('data-cat-id');
          this.analyzeProblem(catId);
        });
      });
    }

    async analyzeProblem(queryOrId) {
      if (!queryOrId) return;
      this.currentQuery = queryOrId;

      if (this.searchInput) {
        this.searchInput.value = queryOrId;
      }

      this.renderLoading();

      try {
        const resp = await fetch('/api/medicine/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: queryOrId,
            conditionId: queryOrId,
            ageGroup: this.patientProfile.ageGroup,
            duration: this.patientProfile.duration,
            severity: this.patientProfile.severity,
            conditions: this.patientProfile.conditions,
            allergies: this.patientProfile.allergies
          })
        });

        if (!resp.ok) {
          throw new Error(`Server returned HTTP ${resp.status}`);
        }

        const data = await resp.json();
        this.currentData = data;
        this.renderResults(data);

        // Auto trigger pharmacy search if in pharmacy tab or on first load
        if (!this.pharmacies || this.pharmacies.length === 0) {
          this.detectUserLocationAndFindPharmacies(false);
        }
      } catch (err) {
        console.error('Failed to get medicine recommendations:', err);
        this.renderError('Unable to analyze symptoms. Please check network connectivity or try another symptom.');
      }
    }

    renderLoading() {
      if (!this.resultsContainer) return;
      this.resultsContainer.innerHTML = `
        <div class="med-loading-card">
          <div class="med-scanner-ring"></div>
          <h3>Analyzing Symptom & Checking Safety Guidelines...</h3>
          <p>Evaluating clinical contraindications, verified Indian brand names, NPPA pricing, and evidence-based relief.</p>
        </div>
      `;
    }

    renderError(msg) {
      if (!this.resultsContainer) return;
      this.resultsContainer.innerHTML = `
        <div class="med-error-card">
          <div class="med-error-icon">⚠️</div>
          <h3>Clinical Assistance Notice</h3>
          <p>${msg}</p>
          <button type="button" class="btn btn-primary" onclick="window.medicineRelief.analyzeProblem('headache')">
            Reset to Standard Headache Guide
          </button>
        </div>
      `;
    }

    renderResults(data) {
      if (!this.resultsContainer) return;

      // Handle Emergency Override
      if (data.status === 'emergency_override' || data.isEmergency) {
        this.renderEmergencyOverride(data);
        return;
      }

      // Handle Unknown Condition
      if (data.status === 'unknown_condition') {
        this.renderUnknownCondition(data);
        return;
      }

      this.currentConditionId = data.conditionId;

      // Render Full 8-Tab Layout
      this.resultsContainer.innerHTML = `
        <!-- Condition Header Banner -->
        <div class="med-result-header-card">
          <div class="med-header-left">
            <span class="med-category-badge">${data.category || 'Clinical OTC Relief'}</span>
            <h2 class="med-condition-title">${data.conditionTitle}</h2>
            <p class="med-disclaimer-sub">
              <strong>Medical Safety Standard:</strong> Over-the-counter advice for mild-to-moderate symptoms. Never replace emergency medical evaluation.
            </p>
          </div>
          <div class="med-header-actions">
            <button type="button" class="btn-voice-listen" onclick="window.medicineRelief.speakReliefSummary()" title="Listen to Voice Guidance">
              <span>🔊 Listen (Female Voice)</span>
            </button>
            <button type="button" class="btn-find-pharmacies-top" onclick="window.medicineRelief.switchTab('pharmacies')">
              <span>📍 Find Nearby Pharmacies</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Safety Red Flags Bar -->
        ${data.redFlags && data.redFlags.length > 0 ? `
          <div class="med-red-flags-alert">
            <div class="alert-header">
              <span class="alert-icon">🚨</span>
              <strong>WHEN TO STOP SELF-CARE & CALL 112 / 108:</strong>
            </div>
            <ul class="red-flags-list">
              ${data.redFlags.slice(0, 3).map(rf => `<li>⚠️ ${rf}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- 8 Navigation Tabs -->
        <div class="med-tabs-nav" role="tablist">
          <button class="med-tab-btn ${this.activeTab === 'medicines' ? 'active' : ''}" data-tab="medicines">
            💊 Recommended OTC Medicines
          </button>
          <button class="med-tab-btn ${this.activeTab === 'brands' ? 'active' : ''}" data-tab="brands">
            🏷️ India Brand Guide & Prices
          </button>
          <button class="med-tab-btn ${this.activeTab === 'compare' ? 'active' : ''}" data-tab="compare">
            ⚖️ Medicine Comparison
          </button>
          <button class="med-tab-btn ${this.activeTab === 'firstaid' ? 'active' : ''}" data-tab="firstaid">
            🩹 First-Aid Supplies
          </button>
          <button class="med-tab-btn ${this.activeTab === 'home' ? 'active' : ''}" data-tab="home">
            🍵 Safe Home Remedies
          </button>
          <button class="med-tab-btn ${this.activeTab === 'pharmacies' ? 'active' : ''}" data-tab="pharmacies">
            🏬 Nearby Pharmacies <span class="badge-tab-count" id="tab-pharmacy-badge">${this.pharmacies.length || '•'}</span>
          </button>
          <button class="med-tab-btn ${this.activeTab === 'warnings' ? 'active' : ''}" data-tab="warnings">
            ⚠️ Safety Warnings & Doctor Visit
          </button>
        </div>

        <!-- Tab Content Panes -->
        <div class="med-tab-content">
          <!-- TAB 1: OTC MEDICINES -->
          <div class="med-tab-pane ${this.activeTab === 'medicines' ? 'active' : ''}" id="pane-medicines">
            ${this.renderMedicinesPane(data.otcMedicines)}
          </div>

          <!-- TAB 2: INDIA BRAND GUIDE & PRICING -->
          <div class="med-tab-pane ${this.activeTab === 'brands' ? 'active' : ''}" id="pane-brands">
            ${this.renderBrandsAndPricingPane(data.otcMedicines, data.brandDisclaimer, data.priceDisclaimer)}
          </div>

          <!-- TAB 3: MEDICINE COMPARISON TABLE -->
          <div class="med-tab-pane ${this.activeTab === 'compare' ? 'active' : ''}" id="pane-compare">
            ${this.renderComparisonTable(data.comparisonMatrix)}
          </div>

          <!-- TAB 4: FIRST AID SUPPLIES -->
          <div class="med-tab-pane ${this.activeTab === 'firstaid' ? 'active' : ''}" id="pane-firstaid">
            ${this.renderFirstAidItemsPane(data.firstAidItems)}
          </div>

          <!-- TAB 5: SAFE HOME REMEDIES & DANGEROUS HABITS -->
          <div class="med-tab-pane ${this.activeTab === 'home' ? 'active' : ''}" id="pane-home">
            ${this.renderHomeRemediesPane(data.homeRemedies)}
          </div>

          <!-- TAB 6: NEARBY PHARMACY FINDER -->
          <div class="med-tab-pane ${this.activeTab === 'pharmacies' ? 'active' : ''}" id="pane-pharmacies">
            ${this.renderPharmaciesPane()}
          </div>

          <!-- TAB 7: SAFETY WARNINGS & DOCTOR VISIT -->
          <div class="med-tab-pane ${this.activeTab === 'warnings' ? 'active' : ''}" id="pane-warnings">
            ${this.renderWarningsPane(data)}
          </div>
        </div>
      `;

      // Bind Tab Switching Events
      this.resultsContainer.querySelectorAll('.med-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tabId = btn.getAttribute('data-tab');
          this.switchTab(tabId);
        });
      });

      // If pharmacies tab is already selected, initialize map
      if (this.activeTab === 'pharmacies') {
        setTimeout(() => this.initPharmacyMap(), 150);
      }
    }

    switchTab(tabId) {
      this.activeTab = tabId;
      this.container.querySelectorAll('.med-tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
      });
      this.container.querySelectorAll('.med-tab-pane').forEach(p => {
        p.classList.toggle('active', p.id === `pane-${tabId}`);
      });

      if (tabId === 'pharmacies') {
        setTimeout(() => {
          this.initPharmacyMap();
        }, 150);
      }
    }

    renderMedicinesPane(medicines) {
      if (!medicines || medicines.length === 0) {
        return `<div class="med-empty-box">No routine OTC medicines recommended for this condition. Please consult a doctor.</div>`;
      }

      return `
        <div class="med-cards-grid">
          ${medicines.map((m, idx) => `
            <div class="medicine-item-card">
              <div class="med-card-badge-row">
                <span class="med-otc-badge">${m.scheduleStatus}</span>
                <span class="med-form-badge">${m.formulation}</span>
              </div>

              <h3 class="med-card-generic-name">${m.genericName}</h3>
              
              <div class="med-brands-chip-row">
                <span class="chip-label">Verified Indian Brands:</span>
                ${m.brandExamples.map(b => `<span class="med-brand-pill">${b}</span>`).join('')}
              </div>

              <div class="med-card-section">
                <strong>Why it helps:</strong>
                <p>${m.whyItHelps}</p>
              </div>

              <div class="med-card-section">
                <strong>What it is used for:</strong>
                <p>${m.whatItIsUsedFor}</p>
              </div>

              <!-- Tablet Administration, Timing & Duration Guidelines -->
              <div class="med-tablet-guidelines-box">
                <div class="med-guide-pill-item med-guide-how">
                  <div class="pill-icon">💧</div>
                  <div class="pill-content">
                    <span class="pill-label">How to Take:</span>
                    <span class="pill-text">${m.howToUse || 'Swallow whole with a full 200–250 ml glass of plain water while upright. Do not crush.'}</span>
                  </div>
                </div>

                <div class="med-guide-pill-item med-guide-timing">
                  <div class="pill-icon">🕒</div>
                  <div class="pill-content">
                    <span class="pill-label">When to Take:</span>
                    <span class="pill-text">${m.whenToUse || 'Take after meals or as indicated on packaging.'}</span>
                  </div>
                </div>

                <div class="med-guide-pill-item med-guide-duration">
                  <div class="pill-icon">📅</div>
                  <div class="pill-content">
                    <span class="pill-label">Max Safe Days:</span>
                    <span class="pill-text">${m.maxDaysSafe || 'Max 2–3 days without doctor consultation.'}</span>
                  </div>
                </div>
              </div>

              <!-- Profile-Specific Dynamic Warnings -->
              ${m.profileWarnings && m.profileWarnings.length > 0 ? `
                <div class="med-profile-warning-box">
                  ${m.profileWarnings.map(w => `<div>⚠️ ${w}</div>`).join('')}
                </div>
              ` : ''}

              <div class="med-card-grid-details">
                <div class="detail-col">
                  <strong>Side Effects:</strong>
                  <span>${m.commonSideEffects}</span>
                </div>
                <div class="detail-col">
                  <strong>Who Should Avoid:</strong>
                  <span>${m.whoShouldAvoid}</span>
                </div>
              </div>

              <div class="med-card-warning-strip">
                <strong>Important Warning:</strong> ${m.importantWarnings}
              </div>

              <div class="med-card-footer">
                <div class="med-price-tag">
                  <span class="price-val">${m.priceEstimate.formatted}</span>
                  <span class="price-unit">(${m.priceEstimate.packSize})</span>
                </div>
                <div class="med-card-footer-btns">
                  <button type="button" class="btn-card-tablet-guide" onclick="window.medicineRelief.openTabletGuide('lookup', '${(m.brandExamples && m.brandExamples[0]) || ''}')">
                    📖 Tablet Guide
                  </button>
                  <button type="button" class="btn-check-pharmacy" onclick="window.medicineRelief.switchTab('pharmacies')">
                    Find in Pharmacy
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    renderBrandsAndPricingPane(medicines, brandDisclaimer, priceDisclaimer) {
      return `
        <div class="med-brands-view">
          <div class="med-disclaimer-box">
            <p><strong>🏷️ Brand Reference Notice:</strong> ${brandDisclaimer}</p>
            <p><strong>💰 Price Estimation Source:</strong> ${priceDisclaimer}</p>
          </div>

          <div class="brand-pricing-table-wrapper">
            <table class="brand-pricing-table">
              <thead>
                <tr>
                  <th>Generic Active Drug</th>
                  <th>Verified Indian Brand Examples</th>
                  <th>Standard Pack Size</th>
                  <th>Estimated Price Range (₹)</th>
                  <th>Price Source & Benchmark</th>
                  <th>Availability Status</th>
                </tr>
              </thead>
              <tbody>
                ${medicines.map(m => `
                  <tr>
                    <td><strong>${m.genericName}</strong><br><small style="color:#64748b;">${m.formulation}</small></td>
                    <td>
                      <div class="table-brand-pills">
                        ${m.brandExamples.map(b => `<span class="table-pill">${b}</span>`).join('')}
                      </div>
                    </td>
                    <td>${m.priceEstimate.packSize}</td>
                    <td><strong style="color:#059669; font-size:1.05rem;">${m.priceEstimate.formatted}</strong></td>
                    <td><small style="color:#64748b;">${m.priceEstimate.source}</small></td>
                    <td><span class="avail-badge">${m.priceEstimate.availability.split('(')[0].trim()}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    renderComparisonTable(matrix) {
      if (!matrix || matrix.length === 0) {
        return `<div class="med-empty-box">No comparison data available.</div>`;
      }

      return `
        <div class="med-comparison-wrapper">
          <div class="comparison-note">
            ⚖️ <strong>Comparative Assessment:</strong> Compare appropriate OTC alternatives for this symptom based on formulation, speed, price, and clinical warnings. Never choose a medication solely based on price.
          </div>
          <table class="med-comparison-table">
            <thead>
              <tr>
                <th>Generic Drug</th>
                <th>Example Indian Brands</th>
                <th>Formulation</th>
                <th>When to Take</th>
                <th>Safe Duration</th>
                <th>Pack Size</th>
                <th>Estimated Price</th>
                <th>Best Suited For</th>
                <th>Key Safety Caution</th>
              </tr>
            </thead>
            <tbody>
              ${matrix.map(row => `
                <tr>
                  <td><strong>${row.genericName}</strong></td>
                  <td>${row.brandExamples}</td>
                  <td>${row.formulation}</td>
                  <td><span class="compare-timing-tag">${row.whenToUse || 'After food / As directed'}</span></td>
                  <td><span class="compare-duration-tag">${row.maxDaysSafe || '2–3 days max'}</span></td>
                  <td>${row.packSize}</td>
                  <td><span class="compare-price">${row.priceEstimate}</span></td>
                  <td>${row.bestSuitedFor}</td>
                  <td><small style="color:#b91c1c; font-weight:600;">${row.keyWarning}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    renderFirstAidItemsPane(items) {
      if (!items || items.length === 0) {
        return `<div class="med-empty-box">No specialized non-medicine supplies required.</div>`;
      }

      return `
        <div class="firstaid-items-grid">
          ${items.map(item => `
            <div class="firstaid-product-card">
              <div class="product-icon">📦</div>
              <h4 class="product-name">${item.name}</h4>
              <p class="product-why"><strong>Why needed:</strong> ${item.whyNeeded}</p>
              <div class="product-use"><strong>How to use safely:</strong> ${item.howToUse}</div>
              <div class="product-footer">
                <span class="product-price">${item.priceEstimate}</span>
                <span class="product-avail">${item.availability}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    renderHomeRemediesPane(remedies) {
      if (!remedies) return '';

      return `
        <div class="home-remedies-container">
          <!-- Green Box: Safe Evidence-Based Measures -->
          <div class="remedies-card safe-remedies-card">
            <div class="remedy-card-header">
              <span class="header-icon">🌿</span>
              <h3>Safe, Evidence-Supported Home Measures</h3>
            </div>
            <ul class="safe-remedies-list">
              ${remedies.safeRemedies.map(r => `<li><span class="check-icon">✓</span> <div>${r}</div></li>`).join('')}
            </ul>
          </div>

          <!-- Red Box: Dangerous Folk Practices to Avoid -->
          <div class="remedies-card danger-remedies-card">
            <div class="remedy-card-header">
              <span class="header-icon">🚫</span>
              <h3>DANGEROUS PRACTICES TO AVOID (HIGH RISK)</h3>
            </div>
            <ul class="danger-remedies-list">
              ${remedies.dangerousPracticesToAvoid.map(d => `<li><span class="cross-icon">✕</span> <div>${d}</div></li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    }

    renderPharmaciesPane() {
      return `
        <div class="pharmacy-finder-layout">
          <!-- Top Bar: GPS status & manual search -->
          <div class="pharmacy-finder-toolbar">
            <div class="pharmacy-search-box">
              <input type="text" id="pharmacy-manual-location-input" placeholder="Search area, landmark, or PIN code (e.g. Indiranagar, 560001)...">
              <button type="button" id="btn-pharmacy-manual-search" class="btn btn-primary" onclick="window.medicineRelief.searchPharmaciesByInput()">
                Find Pharmacies
              </button>
            </div>
            <button type="button" class="btn-refresh-gps" onclick="window.medicineRelief.detectUserLocationAndFindPharmacies(true)">
              🔄 Use Current GPS
            </button>
          </div>

          <!-- Split View: Leaflet Map + Pharmacy Cards -->
          <div class="pharmacy-split-view">
            <div class="pharmacy-map-container">
              <div class="hospital-map-helper-tip">
                💡 <strong>Exact Location:</strong> Click anywhere on the map or drag the blue pin to search pharmacies near that spot.
              </div>
              <div id="pharmacy-interactive-map" class="pharmacy-map-canvas"></div>
            </div>

            <div class="pharmacy-cards-container">
              <div class="pharmacy-status-bar">
                <span id="pharmacy-total-count">Searching nearby verified chemists...</span>
                <span class="pharmacy-sort-tag">Ranked Nearest First</span>
              </div>
              <div id="pharmacy-cards-list" class="pharmacy-cards-list">
                <div class="pharmacy-skeleton">Locating pharmacies near your position...</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    renderWarningsPane(data) {
      return `
        <div class="med-warnings-pane">
          <div class="warning-callout-card">
            <h3>⚠️ Clinical Red Flags Requiring Immediate Emergency Attention</h3>
            <p>If you or the patient experience any of the following symptoms, stop all self-care immediately:</p>
            <ul>
              ${data.redFlags ? data.redFlags.map(rf => `<li><strong>${rf}</strong></li>`).join('') : ''}
            </ul>
          </div>

          <div class="doctor-advice-card">
            <h4>📋 When to Consult a Qualified Doctor or Pharmacist:</h4>
            <p>${data.whenToSeeDoctor}</p>
            <div class="advice-action-buttons">
              <a href="tel:112" class="btn-emergency-call">🚨 CALL 112 (EMERGENCY)</a>
              <button type="button" class="btn-hospital-radar" onclick="window.openHospitalRadar()">🏥 Open Hospital Radar</button>
            </div>
          </div>
        </div>
      `;
    }

    renderEmergencyOverride(data) {
      this.resultsContainer.innerHTML = `
        <div class="med-emergency-override-card" role="alert">
          <div class="override-siren">🚨</div>
          <h2>EMERGENCY WARNING: SELF-CARE MEDICATION SUSPENDED</h2>
          <p class="override-reason"><strong>Trigger:</strong> ${data.emergencyReason || 'Potential acute life-threatening medical emergency detected.'}</p>
          <p class="override-text">
            Routine over-the-counter medicines must NEVER be used as a substitute for emergency medical care. Taking painkillers or antacids during acute emergencies can mask vital clinical symptoms and cause dangerous delays.
          </p>

          <div class="override-actions">
            <a href="tel:112" class="btn-call-112-giant">
              <span>🚨 CALL 112 (INDIA NATIONAL EMERGENCY)</span>
            </a>
            <a href="tel:108" class="btn-call-108-giant">
              <span>🚑 CALL 108 (AMBULANCE)</span>
            </a>
            <button type="button" class="btn-launch-hospital-radar" onclick="window.openHospitalRadar('critical')">
              <span>🏥 Navigate to Nearest Emergency Hospital</span>
            </button>
          </div>
        </div>
      `;
    }

    renderUnknownCondition(data) {
      this.resultsContainer.innerHTML = `
        <div class="med-unknown-card">
          <div class="unknown-icon">🩺</div>
          <h2>Doctor Consultation Recommended</h2>
          <p>${data.message}</p>
          <p style="color: #64748b;">${data.safetyAdvice}</p>
          <div class="quick-category-suggestions">
            <strong>Or select one of our verified clinical OTC topics:</strong>
            <div class="category-buttons-row">
              ${(data.availableCategories || []).map(c => `
                <button type="button" class="btn-category-suggest" onclick="window.medicineRelief.analyzeProblem('${c.id}')">${c.title}</button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // ========================================================================
    // PHARMACY FINDER ENGINE (Leaflet + Geospatial Service)
    // ========================================================================

    async detectUserLocationAndFindPharmacies(forceRefresh = false) {
      if (!navigator.geolocation) {
        this.fallbackToIpPharmacies('Geolocation not supported on device.');
        return;
      }

      // Stage 1: High-Accuracy GPS (4500ms timeout)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;
          this.fetchPharmacies(this.userLat, this.userLng);
        },
        (gpsErr) => {
          console.warn('Pharmacy GPS high accuracy failed, attempting network triangulation...', gpsErr);
          if (gpsErr.code === gpsErr.PERMISSION_DENIED) {
            this.fallbackToIpPharmacies('Location permission denied.');
            return;
          }

          // Stage 2: Fast Wi-Fi / Network Triangulation (enableHighAccuracy: false)
          navigator.geolocation.getCurrentPosition(
            (netPos) => {
              this.userLat = netPos.coords.latitude;
              this.userLng = netPos.coords.longitude;
              this.fetchPharmacies(this.userLat, this.userLng);
            },
            (netErr) => {
              console.warn('Network location unavailable, falling back to IP...', netErr);
              this.fallbackToIpPharmacies(netErr.message || 'Signal unavailable');
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: forceRefresh ? 0 : 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: forceRefresh ? 0 : 300000 }
      );
    }

    async fallbackToIpPharmacies(reason = '') {
      let lat = 12.9716;
      let lng = 77.5946;
      let addr = 'Bengaluru Center (Fallback)';

      try {
        const res = await fetch('/api/location/ip');
        if (res.ok) {
          const data = await res.json();
          if (data && data.lat && data.lng && !data.isDefault) {
            lat = data.lat;
            lng = data.lng;
            addr = data.formattedAddress;
          }
        }
      } catch (e) {}

      if (lat === 12.9716) {
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              lat = parseFloat(data.latitude);
              lng = parseFloat(data.longitude);
              addr = `${data.city || ''}, ${data.region || ''}, ${data.country_name || 'India'}`.replace(/^, /, '');
            }
          }
        } catch (e) {}
      }

      this.fetchPharmacies(lat, lng, addr);
    }

    setPharmacyUserLocation(lat, lng) {
      const validLat = parseFloat(lat);
      const validLng = parseFloat(lng);
      if (isNaN(validLat) || isNaN(validLng)) return;

      this.userLat = validLat;
      this.userLng = validLng;
      this.fetchPharmacies(validLat, validLng, 'Exact Location Pinned on Map');
    }

    searchPharmaciesByInput() {
      const input = document.getElementById('pharmacy-manual-location-input');
      if (!input || !input.value.trim()) return;
      this.geocodeAndSearchPharmacies(input.value.trim());
    }

    async geocodeAndSearchPharmacies(query) {
      try {
        const resp = await fetch(`/api/pharmacies/geocode?query=${encodeURIComponent(query)}`);
        if (!resp.ok) throw new Error('Location search failed');
        const data = await resp.json();
        this.userLat = data.lat;
        this.userLng = data.lng;
        this.fetchPharmacies(data.lat, data.lng, data.formattedAddress);
      } catch (err) {
        alert(`Could not resolve location: "${query}". Please enter a valid city or PIN code.`);
      }
    }

    async fetchPharmacies(lat, lng, addressLabel = null) {
      this.userLat = lat;
      this.userLng = lng;

      const listContainer = document.getElementById('pharmacy-cards-list');
      const countBadge = document.getElementById('pharmacy-total-count');

      if (listContainer) {
        listContainer.innerHTML = `<div class="pharmacy-skeleton">Scanning area for verified medical stores & chemists...</div>`;
      }

      try {
        const resp = await fetch(`/api/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=5000&sort=nearest`);
        if (!resp.ok) throw new Error('Pharmacy search failed');
        const data = await resp.json();
        this.pharmacies = data.pharmacies || [];

        if (countBadge) {
          countBadge.textContent = `${this.pharmacies.length} Verified Pharmacies Discovered Nearby`;
        }

        const tabBadge = document.getElementById('tab-pharmacy-badge');
        if (tabBadge) {
          tabBadge.textContent = this.pharmacies.length;
        }

        this.renderPharmacyCards(this.pharmacies);
        this.initPharmacyMap();
      } catch (err) {
        console.error('Error fetching pharmacies:', err);
        if (listContainer) {
          listContainer.innerHTML = `<div class="med-empty-box">Unable to retrieve nearby pharmacies. Please try again.</div>`;
        }
      }
    }

    renderPharmacyCards(pharmacies) {
      const listContainer = document.getElementById('pharmacy-cards-list');
      if (!listContainer) return;

      if (!pharmacies || pharmacies.length === 0) {
        listContainer.innerHTML = `
          <div class="med-empty-box">
            No pharmacies found within 5 km. Try expanding the search radius or enter a nearby landmark above.
          </div>
        `;
        return;
      }

      listContainer.innerHTML = pharmacies.map((p, idx) => {
        const isNearest = idx === 0;
        const rankStr = String(idx + 1).padStart(2, '0');
        const phone = p.phone || '+91 80 2222 1111';

        return `
          <div class="pharmacy-item-card ${isNearest ? 'nearest-pharmacy-card' : ''}" id="pharm-card-${p.id}">
            <div class="pharm-card-top">
              <span class="pharm-rank-badge ${isNearest ? 'nearest-badge' : ''}">#${rankStr} ${isNearest ? 'NEAREST PHARMACY' : ''}</span>
              <span class="pharm-dist-tag">📏 ${p.distanceFormatted || 'Nearby'}</span>
            </div>

            <h4 class="pharm-name">${p.name}</h4>
            <p class="pharm-address">📍 ${p.address || 'Address unavailable'}</p>

            ${p.distanceDiffText ? `
              <div class="pharm-dist-diff">
                ↔️ ${p.distanceDiffText}
              </div>
            ` : ''}

            <div class="pharm-stock-banner">
              💊 <strong>Stock Indicator:</strong> Standard OTC medicines (ORS, Paracetamol, Antacids, Bandages) typically stocked. Call chemist to confirm specific brand.
            </div>

            <div class="pharm-card-actions">
              <a href="tel:${phone.replace(/[^0-9+]/g, '')}" class="btn-pharm-call">
                📞 Call Pharmacy
              </a>
              <a href="${p.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn-pharm-directions">
                🗺️ Get Directions
              </a>
              <button type="button" class="btn-pharm-highlight" onclick="window.medicineRelief.highlightPharmacyPin('${p.id}')">
                🎯 View on Map
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    initPharmacyMap() {
      const mapContainer = document.getElementById('pharmacy-interactive-map');
      if (!mapContainer || typeof L === 'undefined') return;

      if (!this.pharmacyMap) {
        const centerLat = this.userLat || 12.9716;
        const centerLng = this.userLng || 77.5946;

        this.pharmacyMap = L.map(mapContainer, {
          center: [centerLat, centerLng],
          zoom: 14,
          zoomControl: true,
          attributionControl: true
        });

        const osmUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        const maptilerUrl = 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=kK2q4Z1TzaZWiJ6A6WGZ';

        const tileLayer = L.tileLayer(osmUrl, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
          maxZoom: 19
        });

        let fallbackUsed = false;
        tileLayer.on('tileerror', () => {
          if (!fallbackUsed && this.pharmacyMap) {
            fallbackUsed = true;
            this.pharmacyMap.removeLayer(tileLayer);
            L.tileLayer(maptilerUrl, {
              attribution: '&copy; MapTiler &copy; OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(this.pharmacyMap);
          }
        });

        tileLayer.addTo(this.pharmacyMap);

        // Click on map to place exact pin
        this.pharmacyMap.on('click', (e) => {
          this.setPharmacyUserLocation(e.latlng.lat, e.latlng.lng);
        });
      }

      this.pharmacyMap.invalidateSize();
      this.updatePharmacyMarkers();
    }

    updatePharmacyMarkers() {
      if (!this.pharmacyMap || typeof L === 'undefined') return;

      // Clear existing markers
      this.pharmacyMarkers.forEach(m => this.pharmacyMap.removeLayer(m));
      this.pharmacyMarkers.clear();

      if (this.userMarker) {
        this.pharmacyMap.removeLayer(this.userMarker);
        this.userMarker = null;
      }

      // Add User Location Pin (Draggable)
      if (this.userLat && this.userLng) {
        const userIcon = L.divIcon({
          className: 'user-gps-marker',
          html: `<div class="user-gps-radar-pin"><div class="pulse-ring"></div><div class="center-dot"></div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        this.userMarker = L.marker([this.userLat, this.userLng], { 
          icon: userIcon,
          draggable: true,
          autoPan: true
        })
          .addTo(this.pharmacyMap)
          .bindPopup('<strong>📍 Your Location</strong><br><small style="color:#0284c7; font-weight:600;">👆 Drag pin or click map to set exact spot</small>');

        this.userMarker.on('dragend', (e) => {
          const pt = e.target.getLatLng();
          this.setPharmacyUserLocation(pt.lat, pt.lng);
        });
      }

      // Add Pharmacy Pins
      const bounds = [];
      if (this.userLat && this.userLng) bounds.push([this.userLat, this.userLng]);

      this.pharmacies.forEach((p, idx) => {
        if (!p.lat || !p.lng) return;
        const isNearest = idx === 0;
        const rankStr = String(idx + 1).padStart(2, '0');

        const pinIcon = L.divIcon({
          className: 'pharm-leaflet-pin',
          html: `
            <div class="pharm-map-pin ${isNearest ? 'nearest-pharm-pin' : ''}">
              <div class="pin-bubble">#${rankStr}</div>
              <div class="pin-pointer"></div>
            </div>
          `,
          iconSize: [42, 32],
          iconAnchor: [21, 32]
        });

        const marker = L.marker([p.lat, p.lng], { icon: pinIcon })
          .addTo(this.pharmacyMap)
          .bindPopup(`
            <div style="font-family: inherit; font-size: 0.88rem;">
              <strong style="color: #0284c7;">#${rankStr} ${p.name}</strong><br>
              <span style="color: #64748b; font-size: 0.8rem;">${p.address}</span><br>
              <div style="margin-top: 6px; font-weight: 700; color: #059669;">📏 ${p.distanceFormatted || ''}</div>
              <div style="margin-top: 8px;">
                <a href="${p.directionsUrl}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Get Directions &rarr;</a>
              </div>
            </div>
          `);

        this.pharmacyMarkers.set(p.id, marker);
        bounds.push([p.lat, p.lng]);
      });

      if (bounds.length > 0) {
        this.pharmacyMap.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
      }
    }

    highlightPharmacyPin(pharmId) {
      const marker = this.pharmacyMarkers.get(pharmId);
      if (marker && this.pharmacyMap) {
        this.pharmacyMap.setView(marker.getLatLng(), 16, { animate: true });
        marker.openPopup();
      }
    }

    speakReliefSummary() {
      if (!this.currentData) return;
      const text = `Symptom guidance for ${this.currentData.conditionTitle}. Primary medicine: ${this.currentData.otcMedicines[0]?.genericName || 'Supportive care'}. Remember, brand names like ${this.currentData.otcMedicines[0]?.brandExamples?.slice(0, 2).join(' or ') || ''} are examples. Never exceed recommended doses.`;
      if (window.speakText) {
        window.speakText(text);
      }
    }

    async loadTabletGuidelines() {
      if (this.tabletGuidelines) return this.tabletGuidelines;
      try {
        const res = await fetch('/api/medicine/tablet-guidelines');
        if (res.ok) {
          this.tabletGuidelines = await res.json();
          this.populateTabletLookup(this.tabletGuidelines);
        }
      } catch (e) {
        console.warn('Could not load tablet guidelines endpoint:', e);
      }
      return this.tabletGuidelines;
    }

    openTabletGuide(focusTab = 'how', searchQuery = '') {
      const modal = document.getElementById('tablet-guide-modal');
      if (!modal) return;
      modal.style.display = 'flex';
      document.body.classList.add('modal-open');

      this.loadTabletGuidelines().then(() => {
        if (focusTab) {
          this.switchTabletTab(focusTab);
        }
        if (searchQuery) {
          const input = document.getElementById('tablet-quick-search-input');
          if (input) {
            input.value = searchQuery;
            this.filterTabletGuide(searchQuery);
          }
        }
      });

      if (focusTab) {
        this.switchTabletTab(focusTab);
      }
      if (searchQuery) {
        const input = document.getElementById('tablet-quick-search-input');
        if (input) {
          input.value = searchQuery;
          this.filterTabletGuide(searchQuery);
        }
      }
    }

    closeTabletGuide() {
      const modal = document.getElementById('tablet-guide-modal');
      if (!modal) return;
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      this.stopSpeakingTabletGuide();
    }

    switchTabletTab(tabId) {
      const tabBtns = document.querySelectorAll('.tablet-tab-btn');
      const panes = document.querySelectorAll('.tablet-pane');

      tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-ttab') === tabId);
      });

      panes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `tpane-${tabId}`);
      });
    }

    populateTabletLookup(data) {
      const tbody = document.getElementById('tablet-quick-lookup-tbody');
      if (!tbody) return;
      const list = (data && data.quickLookup) ? data.quickLookup : [];
      if (list.length === 0) return;

      tbody.innerHTML = list.map(item => `
        <tr class="lookup-row" data-name="${item.name.toLowerCase()}" data-cat="${item.category.toLowerCase()}">
          <td><strong>${item.name}</strong></td>
          <td><span class="lookup-cat-badge">${item.category}</span></td>
          <td>${item.howToTake}</td>
          <td><span class="lookup-timing-tag">${item.mealTiming}</span></td>
          <td><span class="lookup-duration-pill">${item.safeDuration}</span></td>
          <td><small style="color:#b91c1c; font-weight:600;">${item.warning}</small></td>
        </tr>
      `).join('');
    }

    filterTabletGuide(query) {
      const q = (query || '').toLowerCase().trim();
      const rows = document.querySelectorAll('#tablet-quick-lookup-tbody .lookup-row');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = (!q || text.includes(q)) ? '' : 'none';
      });

      // Also filter duration cards
      const durationCards = document.querySelectorAll('.duration-item-card');
      durationCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
    }

    speakTabletGuide() {
      const btn = document.getElementById('btn-speak-tablet-guide');
      if (this.isSpeakingTabletGuide) {
        this.stopSpeakingTabletGuide();
        return;
      }

      const textToSpeak = (this.tabletGuidelines && this.tabletGuidelines.speechSummary)
        ? this.tabletGuidelines.speechSummary
        : 'Here are the essential tablet guidelines. Always swallow tablets sitting upright with a full glass of plain room temperature water. Never take pills lying down or with hot tea, milk, or alcohol. Take acidity medicines on an empty stomach before breakfast, and take painkillers after food. Never take painkillers or fever medicines for more than two to three days without a doctor.';

      if (window.speakText) {
        window.speakText(textToSpeak, 'en-IN');
      } else if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(textToSpeak);
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
      }

      this.isSpeakingTabletGuide = true;
      if (btn) {
        btn.classList.add('speaking');
        const icon = btn.querySelector('.audio-icon');
        const label = btn.querySelector('.audio-text');
        if (icon) icon.textContent = '⏹️';
        if (label) label.textContent = 'Stop Audio';
      }
    }

    stopSpeakingTabletGuide() {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      this.isSpeakingTabletGuide = false;
      const btn = document.getElementById('btn-speak-tablet-guide');
      if (btn) {
        btn.classList.remove('speaking');
        const icon = btn.querySelector('.audio-icon');
        const label = btn.querySelector('.audio-text');
        if (icon) icon.textContent = '🔊';
        if (label) label.textContent = 'Listen Audio Guide';
      }
    }
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.medicineRelief = new MedicineReliefController();
    });
  } else {
    window.medicineRelief = new MedicineReliefController();
  }

  // Global helper to open medicine relief from analyzer
  window.openMedicineRelief = function (conditionId = null, queryText = null) {
    const medNavBtn = document.querySelector('[data-view="medicine"]');
    if (medNavBtn) medNavBtn.click();

    setTimeout(() => {
      if (window.medicineRelief) {
        const target = conditionId || queryText || 'headache';
        window.medicineRelief.analyzeProblem(target);
      }
    }, 250);
  };
})();
