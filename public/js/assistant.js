/**
 * FirstAid+ Conversational Emergency Assistant (Section 6)
 */

class SmartAssistantController {
  constructor() {
    this.messagesContainer = document.getElementById("chat-messages-container");
    this.inputField = document.getElementById("chat-user-input");
    this.sendBtn = document.getElementById("chat-send-btn");
    this.history = [];

    this.bindEvents();
    this.addWelcomeMessage();
  }

  bindEvents() {
    if (this.sendBtn) {
      this.sendBtn.addEventListener("click", () => this.sendMessage());
    }
    if (this.inputField) {
      this.inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
  }

  addWelcomeMessage() {
    const welcomeHtml = `
      <p>👋 Hello! I am your <strong>FirstAid+ Emergency Assistant</strong>.</p>
      <p style="margin-top: 6px; color: #64748b; font-size: 0.9rem;">
        Describe what just happened in plain words (e.g. <em>"My friend accidentally spilled boiling water on his hand"</em> or <em>"Person collapsed and is unresponsive"</em>).
      </p>
    `;
    this.renderMessageBubble("assistant", welcomeHtml);
  }

  async sendMessage() {
    const text = this.inputField.value.trim();
    if (!text) return;

    // Render user bubble
    this.renderMessageBubble("user", this.escapeHtml(text));
    this.inputField.value = "";
    this.history.push({ role: "user", text: text });

    // Render loading typing bubble
    const typingId = "typing-" + Date.now();
    this.renderTypingIndicator(typingId);

    try {
      const response = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: this.history })
      });

      const data = await response.json();
      this.removeTypingIndicator(typingId);

      if (data.error) {
        this.renderMessageBubble("assistant", `<p style="color: #ef4444;">Error: ${data.error}</p>`);
        return;
      }

      this.renderAssistantResponse(data);
    } catch (err) {
      this.removeTypingIndicator(typingId);
      this.renderMessageBubble("assistant", `<p style="color: #ef4444;">Could not reach assistant server: ${err.message}</p>`);
    }
  }

  renderAssistantResponse(data) {
    const guide = data.structuredGuide;
    const detectedName = data.detectedEmergency || "Emergency Condition";
    const isUnknown = Boolean(data.isUnknownProblem || guide?.isUnknownProblem);
    const isEmergency = Boolean(data.isLifeThreatening || data.confidenceTier === "emergency" || guide?.confidenceTier === "emergency");

    let badgeClass = "detected-emergency-badge";
    let badgeText = `⚠️ Possible ${this.escapeHtml(detectedName)} detected`;

    if (isUnknown) {
      badgeClass = "detected-emergency-badge";
      badgeText = `🩺 Medical Consultation Recommended`;
    } else if (isEmergency) {
      badgeClass = "detected-emergency-badge";
      badgeText = `🚨 POTENTIAL EMERGENCY: ${this.escapeHtml(detectedName)}`;
    }

    let html = `
      <div class="${badgeClass}" style="${isEmergency ? 'background: #fef2f2; border-color: #fca5a5; color: #991b1b; font-weight: 800;' : (isUnknown ? 'background: #eff6ff; border-color: #93c5fd; color: #1e40af; font-weight: 700;' : '')}">
        ${badgeText}
      </div>
      <div style="margin: 8px 0; font-size: 0.95rem; line-height: 1.5; color: #334155;">
        ${this.formatMarkdownToHtml(data.reply)}
      </div>
    `;

    // Add action buttons
    if (isUnknown) {
      html += `
        <div class="chat-quick-actions">
          <button class="chat-action-btn consult-doctor" onclick="window.openDoctorConsultModal()">
            🩺 Better to Consult a Doctor
          </button>
          <a class="chat-action-btn" href="tel:104" style="background: #ffffff; border-color: #2563eb; color: #1e40af;">
            📞 Call 104 (Free Health Advice)
          </a>
          <a class="chat-action-btn call" href="tel:112">
            Call 112
          </a>
        </div>
      `;
    } else if (guide) {
      html += `
        <div class="chat-quick-actions">
          <button class="chat-action-btn guide" onclick="window.launchStepGuideFromChat('${guide.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Start Step-by-Step Guide
          </button>
          <button class="chat-action-btn voice" onclick="window.readGuideAloud('${guide.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            Read Instructions
          </button>
          <a class="chat-action-btn call" href="tel:112">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Call 112
          </a>
          <button class="chat-action-btn consult-doctor" onclick="window.openDoctorConsultModal()" style="font-size: 0.8rem;">
            🩺 Consult Doctor
          </button>
        </div>
      `;
    }

    this.renderMessageBubble("assistant", html);
  }

  renderMessageBubble(role, htmlContent) {
    if (!this.messagesContainer) return;
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = htmlContent;
    this.messagesContainer.appendChild(bubble);
    this.scrollToBottom();
  }

  renderTypingIndicator(id) {
    if (!this.messagesContainer) return;
    const typing = document.createElement("div");
    typing.id = id;
    typing.className = "chat-bubble assistant";
    typing.innerHTML = `<span style="color: #64748b; font-style: italic;">Analyzing symptoms...</span>`;
    this.messagesContainer.appendChild(typing);
    this.scrollToBottom();
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  formatMarkdownToHtml(text) {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/• (.*)/g, "<li style='margin-left: 18px;'>$1</li>")
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>");
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

window.SmartAssistantController = SmartAssistantController;

