/**
 * FirstAid+ Module 1: Smart Symptom History Controller (Feature 19)
 * Stores, organizes, searches, and exports the user's previous health-related
 * queries and AI first-aid assistance sessions privately in local storage.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'firstaid_symptom_history_v1';
  const MAX_HISTORY_ITEMS = 80;

  class SymptomHistoryController {
    constructor() {
      this.history = this.loadHistory();
      this.currentFilter = 'all'; // 'all', 'today', 'week', 'month'
      this.searchQuery = '';
      this.selectedItem = null;

      // DOM Elements
      this.container = document.getElementById('view-history');
      this.cardsContainer = document.getElementById('history-cards-container');
      this.searchInput = document.getElementById('history-search-input');
      this.filterChips = document.querySelectorAll('.history-filter-chip');
      this.clearAllBtn = document.getElementById('btn-clear-history-all');
      this.exportAllBtn = document.getElementById('btn-export-history-summary');
      this.statsTotalBadge = document.getElementById('history-stat-total');
      this.statsCriticalBadge = document.getElementById('history-stat-critical');
      this.modal = document.getElementById('history-detail-modal');
      this.modalContent = document.getElementById('history-modal-body');
      this.modalCloseBtn = document.getElementById('btn-close-history-modal');

      this.init();
    }

    init() {
      if (!this.container) return;
      this.bindEvents();
      this.render();
    }

    bindEvents() {
      // Search Input
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.render();
        });
      }

      // Filter Chips
      if (this.filterChips) {
        this.filterChips.forEach(chip => {
          chip.addEventListener('click', () => {
            this.filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            this.currentFilter = chip.getAttribute('data-filter') || 'all';
            this.render();
          });
        });
      }

      // Clear All
      if (this.clearAllBtn) {
        this.clearAllBtn.addEventListener('click', () => {
          this.promptClearAll();
        });
      }

      // Export Summary for Doctor
      if (this.exportAllBtn) {
        this.exportAllBtn.addEventListener('click', () => {
          this.exportDoctorSummary();
        });
      }

      // Modal Close
      if (this.modalCloseBtn) {
        this.modalCloseBtn.addEventListener('click', () => {
          this.closeModal();
        });
      }

      // Close modal on backdrop click
      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.closeModal();
        });
      }

      // Global keyboard ESC to close modal
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
          this.closeModal();
        }
      });
    }

    loadHistory() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (err) {
        console.warn('Failed to parse symptom history from storage:', err);
      }
      return [];
    }

    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
      } catch (err) {
        console.warn('Failed to save symptom history to storage:', err);
      }
    }

    /**
     * Save an AI analysis session to history
     */
    saveSession(result, originalPrompt = '', source = 'text_analyzer') {
      if (!result || typeof result !== 'object') return;

      const symptomText = originalPrompt || result.possibleEmergency || 'Reported Health Concern';
      const now = new Date();

      const item = {
        id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        timestamp: now.getTime(),
        dateFormatted: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        timeFormatted: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        symptomText: symptomText.trim(),
        conditionTitle: result.possibleEmergency || 'First Aid Assessment',
        whatHappened: result.whatHappened || '',
        severity: (result.severity || 'Moderate').toUpperCase(),
        isEmergency: Boolean(result.isEmergency || result.severity === 'Critical'),
        immediateFirstAid: Array.isArray(result.immediateFirstAid) ? result.immediateFirstAid : [],
        whatNotToDo: Array.isArray(result.whatNotToDo) ? result.whatNotToDo : [],
        otcMedicines: Array.isArray(result.otcMedicines) ? result.otcMedicines : [],
        firstAidItems: Array.isArray(result.firstAidItems) ? result.firstAidItems : [],
        source: source,
        language: result.language || (window.speechEngine ? window.speechEngine.settings.selectedLanguage : 'en-IN')
      };

      // Add to beginning of array
      this.history.unshift(item);

      // Cap size
      if (this.history.length > MAX_HISTORY_ITEMS) {
        this.history = this.history.slice(0, MAX_HISTORY_ITEMS);
      }

      this.saveToStorage();
      this.render();
    }

    /**
     * Delete individual history entry
     */
    deleteEntry(id, e) {
      if (e) e.stopPropagation();
      this.history = this.history.filter(h => h.id !== id);
      this.saveToStorage();
      this.render();
    }

    deleteItem(id, e) {
      return this.deleteEntry(id, e);
    }

    /**
     * Prompt Clear All History with Confirmation
     */
    promptClearAll() {
      if (this.history.length === 0) return;
      const confirmed = window.confirm(
        '⚠️ Are you sure you want to clear your entire medical symptom history?\n\nThis will remove all saved sessions from this browser permanently.'
      );
      if (confirmed) {
        this.history = [];
        this.saveToStorage();
        this.render();
      }
    }

    clearAll() {
      return this.promptClearAll();
    }

    /**
     * Filter history by time range and search query
     */
    getFilteredHistory() {
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      return this.history.filter(item => {
        // Time filter
        if (this.currentFilter === 'today') {
          const itemDate = new Date(item.timestamp).toDateString();
          const todayDate = new Date().toDateString();
          if (itemDate !== todayDate) return false;
        } else if (this.currentFilter === 'week') {
          if (now - item.timestamp > 7 * ONE_DAY) return false;
        } else if (this.currentFilter === 'month') {
          if (now - item.timestamp > 30 * ONE_DAY) return false;
        }

        // Search Query filter
        if (this.searchQuery) {
          const fullText = [
            item.symptomText,
            item.conditionTitle,
            item.whatHappened,
            item.severity,
            item.dateFormatted
          ].join(' ').toLowerCase();

          if (!fullText.includes(this.searchQuery)) {
            return false;
          }
        }

        return true;
      });
    }

    /**
     * Render History Cards & Timeline
     */
    renderTimeline() {
      return this.render();
    }

    render() {
      if (!this.cardsContainer) return;

      const filtered = this.getFilteredHistory();

      // Update Top Badges
      if (this.statsTotalBadge) {
        this.statsTotalBadge.textContent = `${this.history.length} Saved Sessions`;
      }
      if (this.statsCriticalBadge) {
        const criticalCount = this.history.filter(h => h.isEmergency || h.severity === 'CRITICAL').length;
        this.statsCriticalBadge.textContent = `${criticalCount} Critical / 112`;
      }

      if (filtered.length === 0) {
        this.renderEmptyState();
        return;
      }

      this.cardsContainer.innerHTML = filtered.map(item => {
        const isCritical = item.isEmergency || item.severity === 'CRITICAL';
        const sevClass = item.severity.toLowerCase();

        return `
          <div class="history-item-card ${isCritical ? 'critical-history-card' : ''}" onclick="window.symptomHistory.openDetail('${item.id}')">
            <div class="hist-card-header">
              <div class="hist-time-group">
                <span class="hist-date-pill">📅 ${item.dateFormatted}</span>
                <span class="hist-time-pill">🕒 ${item.timeFormatted}</span>
                ${item.source === 'voice_assistant' ? '<span class="hist-source-tag">🎙️ Voice Query</span>' : ''}
                ${item.source === 'photo' ? '<span class="hist-source-tag">📷 Photo Scan</span>' : ''}
              </div>
              <div class="hist-badge-group">
                <span class="hist-sev-badge sev-${sevClass}">
                  ${isCritical ? '🚨 ' : ''}${item.severity}
                </span>
                <button type="button" class="btn-delete-hist-item" title="Delete Entry" onclick="window.symptomHistory.deleteEntry('${item.id}', event)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>

            <div class="hist-prompt-box">
              <span class="prompt-icon">💬</span>
              <p class="prompt-text">"${item.symptomText}"</p>
            </div>

            <div class="hist-condition-row">
              <h4 class="hist-cond-title">${item.conditionTitle}</h4>
            </div>

            ${item.immediateFirstAid.length > 0 ? `
              <div class="hist-steps-preview">
                <strong>First-aid highlights:</strong>
                <ul>
                  ${item.immediateFirstAid.slice(0, 2).map(s => `<li>${s}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <div class="hist-card-footer">
              <span class="hist-view-details">Click to view full emergency instructions & dosage →</span>
              <button type="button" class="btn-hist-reanalyze" onclick="window.symptomHistory.reAnalyze('${item.id}', event)">
                🔄 Re-Analyze
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    renderEmptyState() {
      const hasQuery = Boolean(this.searchQuery || this.currentFilter !== 'all');
      this.cardsContainer.innerHTML = `
        <div class="history-empty-state">
          <div class="empty-icon">📋</div>
          <h3>${hasQuery ? 'No matching health sessions found' : 'No Symptom History Yet'}</h3>
          <p>${hasQuery 
            ? 'Try clearing your search keyword or changing the filter chip above.' 
            : 'Whenever you describe a symptom or upload an injury photo, FirstAid+ saves your session privately here so you can review instructions or show them to your doctor.'}
          </p>
          ${hasQuery ? `
            <button type="button" class="btn-clear-hist-filter" onclick="document.getElementById('history-search-input').value=''; window.symptomHistory.resetFilters();">
              Reset Filters
            </button>
          ` : `
            <button type="button" class="btn-start-first-analysis" onclick="window.switchView('analyzer')">
              🩺 Start New First Aid Analysis
            </button>
          `}
        </div>
      `;
    }

    resetFilters() {
      this.searchQuery = '';
      this.currentFilter = 'all';
      if (this.filterChips) {
        this.filterChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-filter') === 'all'));
      }
      this.render();
    }

    /**
     * Open Full Detail Modal for a specific session
     */
    openDetail(id) {
      const item = this.history.find(h => h.id === id);
      if (!item || !this.modal || !this.modalContent) return;

      this.selectedItem = item;

      this.modalContent.innerHTML = `
        <div class="history-detail-header">
          <div class="detail-header-left">
            <span class="hist-modal-date">📅 ${item.dateFormatted} at ${item.timeFormatted}</span>
            <span class="hist-modal-sev sev-${item.severity.toLowerCase()}">${item.severity}</span>
            ${item.isEmergency ? '<span class="hist-modal-er-tag">🚨 112 Mandatory Emergency</span>' : ''}
          </div>
          <button type="button" class="btn-modal-copy-doctor" onclick="window.symptomHistory.copySingleForDoctor('${item.id}')">
            📋 Copy for Doctor
          </button>
        </div>

        <div class="history-modal-section">
          <label>Reported Symptoms / Concern:</label>
          <div class="modal-symptom-quote">"${item.symptomText}"</div>
        </div>

        <div class="history-modal-section">
          <label>Identified Condition:</label>
          <h3 class="modal-condition-heading">${item.conditionTitle}</h3>
          ${item.whatHappened ? `<p class="modal-condition-desc">${item.whatHappened}</p>` : ''}
        </div>

        ${item.immediateFirstAid && item.immediateFirstAid.length > 0 ? `
          <div class="history-modal-section">
            <label class="steps-label">✅ Immediate First-Aid Steps:</label>
            <ol class="modal-steps-list">
              ${item.immediateFirstAid.map(s => `<li>${s}</li>`).join('')}
            </ol>
          </div>
        ` : ''}

        ${item.whatNotToDo && item.whatNotToDo.length > 0 ? `
          <div class="history-modal-section danger-section">
            <label class="danger-label">❌ What NOT To Do:</label>
            <ul class="modal-not-to-do-list">
              ${item.whatNotToDo.map(w => `<li>${w}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="history-modal-actions">
          <button type="button" class="btn-modal-reanalyze" onclick="window.symptomHistory.reAnalyze('${item.id}', null)">
            🔄 Re-Analyze This Problem
          </button>
          <button type="button" class="btn-modal-delete" onclick="window.symptomHistory.deleteEntry('${item.id}', null); window.symptomHistory.closeModal();">
            🗑️ Delete Session
          </button>
        </div>
      `;

      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    closeModal() {
      if (this.modal) {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    /**
     * Pre-fills the symptom text into Smart Analyzer and navigates there
     */
    reAnalyze(id, e) {
      if (e) e.stopPropagation();
      const item = this.history.find(h => h.id === id);
      if (!item) return;

      this.closeModal();

      const textarea = document.getElementById('problem-description-input');
      if (textarea) {
        textarea.value = item.symptomText;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (typeof window.switchView === 'function') {
        window.switchView('analyzer');
      }

      if (textarea) {
        textarea.focus();
      }
    }

    /**
     * Copy single session report formatted for physician
     */
    copySingleForDoctor(id) {
      const item = this.history.find(h => h.id === id);
      if (!item) return;

      const report = [
        '=======================================================',
        '🏥 FIRSTAID+ PATIENT SYMPTOM & FIRST AID REPORT',
        '=======================================================',
        `Date & Time: ${item.dateFormatted}, ${item.timeFormatted}`,
        `Reported Symptoms: ${item.symptomText}`,
        `Condition Evaluated: ${item.conditionTitle}`,
        `Clinical Severity: ${item.severity}`,
        '',
        'IMMEDIATE FIRST-AID RECORDED:',
        ...item.immediateFirstAid.map((s, idx) => `  ${idx + 1}. ${s}`),
        '',
        item.whatNotToDo.length > 0 ? 'WHAT NOT TO DO / CONTRAINDICATIONS:' : '',
        ...item.whatNotToDo.map((w, idx) => `  • ${w}`),
        '',
        'Generated via FirstAid+ Smart Emergency Assistance Platform',
        'Disclaimer: Routine AI advice is for supportive emergency guidance only. Consult a physician.'
      ].filter(Boolean).join('\n');

      navigator.clipboard.writeText(report).then(() => {
        alert('✅ Patient clinical summary copied to clipboard! You can paste this in WhatsApp, SMS, or an email to your doctor.');
      }).catch(() => {
        prompt('Copy the report below for your doctor:', report);
      });
    }

    /**
     * Export complete symptom history summary for doctor
     */
    exportDoctorSummary() {
      if (this.history.length === 0) {
        alert('No symptom history available to export.');
        return;
      }

      const report = [
        '=======================================================',
        '🏥 FIRSTAID+ COMPLETE MEDICAL SYMPTOM TIMELINE',
        '=======================================================',
        `Total Sessions Logged: ${this.history.length}`,
        `Export Generated: ${new Date().toLocaleString('en-IN')}`,
        '-------------------------------------------------------',
        '',
        ...this.history.map((item, idx) => [
          `#${idx + 1} [${item.dateFormatted} - ${item.timeFormatted}] Severity: ${item.severity}`,
          `  • Symptoms: "${item.symptomText}"`,
          `  • Assessed Condition: ${item.conditionTitle}`,
          `  • Primary Action: ${item.immediateFirstAid[0] || 'Supportive care advised'}`,
          ''
        ].join('\n')),
        '=======================================================',
        'Generated by FirstAid+ Smart Emergency Assistance Platform'
      ].join('\n');

      navigator.clipboard.writeText(report).then(() => {
        alert('✅ Complete medical symptom timeline copied to clipboard! Ready to share with your healthcare provider.');
      }).catch(() => {
        prompt('Copy your complete medical history timeline:', report);
      });
    }
  }

  // Instantiate and expose globally
  document.addEventListener('DOMContentLoaded', () => {
    window.symptomHistory = new SymptomHistoryController();
  });

  window.SymptomHistoryController = SymptomHistoryController;

})(window);
