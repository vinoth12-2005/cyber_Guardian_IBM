/**
 * admin.js — FlotBot Admin Console Renderer
 * Handles: login gate, tab switching, baseline review, alert history,
 *          whitelist, blocked IPs, AI settings, endpoint isolation.
 */

const loginGate = document.getElementById("login-gate");
const adminBody = document.getElementById("admin-body");
const loginCard = document.getElementById("login-card");
const passcodeIn = document.getElementById("passcode-input");
const loginError = document.getElementById("login-error");
const btnContinue = document.getElementById("btn-continue");

function attemptLogin() {
    const code = passcodeIn.value.trim();
    if (code === "flotbot2026") {
        // Success: Unlock Console with transition
        loginError.style.display = "none";
        loginGate.style.opacity = "0";
        loginGate.style.transform = "scale(0.95)";
        setTimeout(() => {
            loginGate.style.display = "none";
            adminBody.style.display = "flex";
            // Force reflow
            adminBody.offsetHeight;
            adminBody.classList.add("unlocked");
            initAdmin();
        }, 300);
    } else {
        // Fail: Shake card & show warning
        loginError.style.display = "block";
        loginCard.classList.add("shake");
        passcodeIn.style.borderColor = "var(--c-red)";
        passcodeIn.focus();
        setTimeout(() => {
            loginCard.classList.remove("shake");
        }, 400);
    }
}

btnContinue.addEventListener("click", attemptLogin);

passcodeIn.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        attemptLogin();
    }
});

// ── Tab Switching ────────────────────────────────────────────────────────────

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

// ── Init ─────────────────────────────────────────────────────────────────────

async function initAdmin() {
    await Promise.all([
        loadPrivacyModeSetting(),
        loadBaseline(),
        loadAlertHistory(),
        loadWhitelist(),
        loadBlockedIps()
    ]);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function escHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function severityPill(s) {
    const cls = s === "CRITICAL" ? "pill-critical" : s === "HIGH" ? "pill-high" : "pill-pending";
    return `<span class="pill ${cls}">${escHtml(s)}</span>`;
}

function formatDate(ts) {
    if (!ts) return "—";
    try { return new Date(ts).toLocaleString(); } catch { return ts; }
}

// ── AI Settings ──────────────────────────────────────────────────────────────

async function loadPrivacyModeSetting() {
    try {
        const settings = await window.flotbotAdmin.getSettings();
        const privacyOn = settings && settings.aiPrivacyMode === "true";
        const toggle = document.getElementById("toggle-privacy-mode");
        toggle.checked = privacyOn;
        updatePrivacyBadge(privacyOn);
    } catch (err) {
        console.error("loadPrivacyModeSetting:", err);
    }
}

function updatePrivacyBadge(privacyOn) {
    const badge = document.getElementById("privacy-badge");
    if (privacyOn) {
        badge.textContent  = "🔒 Offline Mode";
        badge.className    = "badge-privacy offline";
    } else {
        badge.textContent  = "☁️ Cloud AI Mode";
        badge.className    = "badge-privacy";
    }
}

document.getElementById("btn-save-ai-mode").addEventListener("click", async () => {
    const privacyMode = document.getElementById("toggle-privacy-mode").checked;
    const statusEl    = document.getElementById("ai-mode-status");
    statusEl.textContent = "Saving...";
    try {
        const res = await window.flotbotAdmin.setAiMode(privacyMode);
        if (res && res.success) {
            statusEl.textContent = `✅ Saved — ${privacyMode ? "Offline (Ollama)" : "Cloud (Gemini)"} mode active.`;
            updatePrivacyBadge(privacyMode);
        } else {
            statusEl.textContent = `❌ Error: ${res.error || "unknown"}`;
        }
    } catch (err) {
        statusEl.textContent = `❌ ${err.message}`;
    }
});

document.getElementById("btn-isolate").addEventListener("click", async () => {
    const statusEl = document.getElementById("isolation-status");
    statusEl.textContent = "Applying isolation...";
    try {
        const res = await window.flotbotAdmin.isolateEndpoint(true);
        statusEl.textContent = res && res.success ? "🔌 Endpoint ISOLATED" : `❌ Failed`;
        statusEl.style.color = "#ff7b72";
    } catch (err) {
        statusEl.textContent = `❌ ${err.message}`;
    }
});

document.getElementById("btn-deisolate").addEventListener("click", async () => {
    const statusEl = document.getElementById("isolation-status");
    try {
        const res = await window.flotbotAdmin.isolateEndpoint(false);
        statusEl.textContent = res && res.success ? "✅ Isolation removed" : `❌ Failed`;
        statusEl.style.color = "#56d364";
    } catch (err) {
        statusEl.textContent = `❌ ${err.message}`;
    }
});

// ── Baseline Review ──────────────────────────────────────────────────────────

async function loadBaseline() {
    const container = document.getElementById("baseline-container");
    container.innerHTML = '<div class="spinner">Loading...</div>';
    try {
        const records = await window.flotbotAdmin.getBaselineRecords();
        if (!records || records.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div>No baseline records yet. Learning Mode records observations over the first 24–48 hours.</div>`;
            return;
        }
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Value</th>
                        <th>First Seen</th>
                        <th>Observations</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map(r => `
                        <tr id="baseline-row-${r.id}">
                            <td><span class="pill pill-pending">${escHtml(r.type)}</span></td>
                            <td style="font-family:monospace;font-size:11px;">${escHtml(r.value)}</td>
                            <td>${formatDate(r.first_seen)}</td>
                            <td>${r.observation_count}</td>
                            <td>${r.approved ? '<span class="pill pill-approved">Approved</span>' : '<span class="pill pill-pending">Pending</span>'}</td>
                            <td class="action-cell">
                                ${!r.approved ? `<button class="btn btn-primary" onclick="approveBaseline(${r.id})" style="padding:4px 10px;font-size:11px;">✅ Approve</button>` : ""}
                                <button class="btn btn-danger" onclick="rejectBaseline(${r.id})" style="padding:4px 10px;font-size:11px;">✕ Reject</button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>`;
    } catch (err) {
        container.innerHTML = `<div class="empty-state">❌ Error loading baseline: ${escHtml(err.message)}</div>`;
    }
}

async function approveBaseline(id) {
    try {
        await window.flotbotAdmin.approveBaseline(id);
        const row = document.getElementById(`baseline-row-${id}`);
        if (row) row.querySelector("td:nth-child(5)").innerHTML = '<span class="pill pill-approved">Approved</span>';
    } catch (err) { alert("Error: " + err.message); }
}

async function rejectBaseline(id) {
    try {
        await window.flotbotAdmin.rejectBaseline(id);
        const row = document.getElementById(`baseline-row-${id}`);
        if (row) row.remove();
    } catch (err) { alert("Error: " + err.message); }
}

document.getElementById("btn-approve-all-baseline").addEventListener("click", async () => {
    if (!confirm("Approve ALL pending baseline records? This will suppress alerts for all observed items.")) return;
    const rows = document.querySelectorAll("[id^='baseline-row-']");
    for (const row of rows) {
        const id = parseInt(row.id.replace("baseline-row-", ""), 10);
        await window.flotbotAdmin.approveBaseline(id).catch(() => {});
    }
    await loadBaseline();
});

document.getElementById("btn-reset-learning").addEventListener("click", async () => {
    if (!confirm("Reset Learning Mode? This will DELETE all baseline records and restart the observation window.")) return;
    try {
        await window.flotbotAdmin.resetLearningMode();
        alert("Learning Mode reset. Observation window restarted.");
        await loadBaseline();
    } catch (err) { alert("Error: " + err.message); }
});

document.getElementById("btn-refresh-baseline").addEventListener("click", loadBaseline);

// ── Alert History ────────────────────────────────────────────────────────────

async function loadAlertHistory() {
    const container = document.getElementById("history-container");
    container.innerHTML = '<div class="spinner">Loading...</div>';
    try {
        const records = await window.flotbotAdmin.getAlertHistory();
        if (!records || records.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div>No alert history yet. History is recorded as users interact with alerts.</div>`;
            return;
        }
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Severity</th>
                        <th>Rule</th>
                        <th>PID</th>
                        <th>Exe Path</th>
                        <th>Remote IP</th>
                        <th>Action</th>
                        <th>Response</th>
                        <th>Controls</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map(r => `
                        <tr>
                            <td style="white-space:nowrap;">${formatDate(r.timestamp)}</td>
                            <td>${severityPill(r.severity)}</td>
                            <td style="font-size:11px;">${escHtml(r.rule_triggered || "—")}</td>
                            <td>${escHtml(r.pid || "—")}</td>
                            <td style="font-size:10px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escHtml(r.exe_path || "")}">${escHtml(r.exe_path || "—")}</td>
                            <td style="font-family:monospace;font-size:11px;">${escHtml(r.remote_ip || "—")}</td>
                            <td><span class="pill ${r.action_taken === "TERMINATED" ? "pill-critical" : "pill-pending"}">${escHtml(r.action_taken || "—")}</span></td>
                            <td>${r.response_time_ms ? r.response_time_ms + "ms" : "—"}</td>
                            <td class="action-cell">
                                ${r.exe_path ? `<button class="btn btn-secondary" onclick="whitelistFromHistory('${escHtml(r.exe_path)}')" style="padding:3px 8px;font-size:10px;" title="Whitelist this executable">✅ Whitelist</button>` : ""}
                                ${r.remote_ip ? `<button class="btn btn-danger" onclick="blockIpFromHistory('${escHtml(r.remote_ip)}')" style="padding:3px 8px;font-size:10px;" title="Block this IP globally">🚫 Block IP</button>` : ""}
                                ${r.chat_transcript ? `<button class="btn btn-secondary" onclick="showTranscript(this)" data-transcript="${escHtml(r.chat_transcript)}" style="padding:3px 8px;font-size:10px;">💬 Log</button>` : ""}
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>`;
    } catch (err) {
        container.innerHTML = `<div class="empty-state">❌ Error loading alert history: ${escHtml(err.message)}</div>`;
    }
}

function showTranscript(btn) {
    const existing = btn.parentElement.nextSibling;
    if (existing && existing.classList && existing.classList.contains("transcript-row")) {
        existing.remove(); return;
    }
    const tr = document.createElement("tr");
    tr.className = "transcript-row";
    tr.innerHTML = `<td colspan="9"><div class="transcript-box">${escHtml(btn.dataset.transcript)}</div></td>`;
    btn.closest("tr").insertAdjacentElement("afterend", tr);
}

async function whitelistFromHistory(exePath) {
    if (!confirm(`Whitelist: ${exePath}?`)) return;
    try {
        await window.flotbotAdmin.addWhitelist({ type: "path", value: exePath, reason: "Approved from alert history" });
        alert("Added to whitelist.");
        await loadWhitelist();
    } catch (err) { alert("Error: " + err.message); }
}

async function blockIpFromHistory(ip) {
    if (!confirm(`Block IP globally: ${ip}?`)) return;
    try {
        await window.flotbotAdmin.blockIpGlobal(ip, "Blocked from alert history");
        alert(`IP ${ip} blocked.`);
        await loadBlockedIps();
    } catch (err) { alert("Error: " + err.message); }
}

document.getElementById("btn-refresh-history").addEventListener("click", loadAlertHistory);

// ── Whitelist ────────────────────────────────────────────────────────────────

async function loadWhitelist() {
    const container = document.getElementById("whitelist-container");
    container.innerHTML = '<div class="spinner">Loading...</div>';
    try {
        const records = await window.flotbotAdmin.getWhitelist();
        if (!records || records.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div>Whitelist is empty.</div>`;
            return;
        }
        container.innerHTML = `
            <table class="data-table">
                <thead><tr><th>Type</th><th>Value</th><th>Added</th><th>Reason</th><th>Action</th></tr></thead>
                <tbody>
                    ${records.map(r => `
                        <tr>
                            <td><span class="pill pill-approved">${escHtml(r.type)}</span></td>
                            <td style="font-family:monospace;font-size:11px;">${escHtml(r.value)}</td>
                            <td>${formatDate(r.created_at)}</td>
                            <td style="font-size:11px;color:#8b949e;">${escHtml(r.reason || "—")}</td>
                            <td><button class="btn btn-danger" onclick="removeWhitelist(${r.id})" style="padding:3px 8px;font-size:10px;">Remove</button></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>`;
    } catch (err) {
        container.innerHTML = `<div class="empty-state">❌ Error: ${escHtml(err.message)}</div>`;
    }
}

document.getElementById("btn-add-whitelist").addEventListener("click", async () => {
    const value = document.getElementById("whitelist-input").value.trim();
    const type  = document.getElementById("whitelist-type").value;
    if (!value) return;
    try {
        await window.flotbotAdmin.addWhitelist({ type, value, reason: "Added manually via Admin Console" });
        document.getElementById("whitelist-input").value = "";
        await loadWhitelist();
    } catch (err) { alert("Error: " + err.message); }
});

async function removeWhitelist(id) {
    if (!confirm("Remove from whitelist?")) return;
    try {
        await window.flotbotAdmin.removeWhitelist(id);
        await loadWhitelist();
    } catch (err) { alert("Error: " + err.message); }
}

document.getElementById("btn-refresh-whitelist").addEventListener("click", loadWhitelist);

// ── Blocked IPs ──────────────────────────────────────────────────────────────

async function loadBlockedIps() {
    const container = document.getElementById("blocklist-container");
    container.innerHTML = '<div class="spinner">Loading...</div>';
    try {
        const records = await window.flotbotAdmin.getBlockedIps();
        if (!records || records.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="empty-icon">🚫</div>No IPs blocked.</div>`;
            return;
        }
        container.innerHTML = `
            <table class="data-table">
                <thead><tr><th>IP Address</th><th>Blocked At</th><th>By</th><th>Note</th><th>Action</th></tr></thead>
                <tbody>
                    ${records.map(r => `
                        <tr>
                            <td style="font-family:monospace;">${escHtml(r.ip)}</td>
                            <td>${formatDate(r.added_at)}</td>
                            <td>${escHtml(r.added_by || "admin")}</td>
                            <td style="font-size:11px;color:#8b949e;">${escHtml(r.note || "—")}</td>
                            <td><button class="btn btn-secondary" onclick="removeBlockedIp(${r.id})" style="padding:3px 8px;font-size:10px;">Unblock</button></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>`;
    } catch (err) {
        container.innerHTML = `<div class="empty-state">❌ Error: ${escHtml(err.message)}</div>`;
    }
}

document.getElementById("btn-add-block-ip").addEventListener("click", async () => {
    const ip   = document.getElementById("blocklist-input").value.trim();
    const note = document.getElementById("blocklist-note").value.trim();
    if (!ip) return;
    try {
        await window.flotbotAdmin.blockIpGlobal(ip, note || "Manually blocked via Admin Console");
        document.getElementById("blocklist-input").value = "";
        document.getElementById("blocklist-note").value  = "";
        await loadBlockedIps();
    } catch (err) { alert("Error: " + err.message); }
});

async function removeBlockedIp(id) {
    if (!confirm("Unblock this IP?")) return;
    try {
        await window.flotbotAdmin.removeBlockedIp(id);
        await loadBlockedIps();
    } catch (err) { alert("Error: " + err.message); }
}

document.getElementById("btn-refresh-blocklist").addEventListener("click", loadBlockedIps);
