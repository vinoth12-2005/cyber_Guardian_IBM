/**
 * FlotBot Dashboard Renderer Logic
 */

// Active Session parameters
let currentAlerts = [];
let currentProcesses = [];
let selectedAlert = null;
const sessionChatId = "session_" + Math.random().toString(36).substring(2, 9);

document.addEventListener("DOMContentLoaded", () => {

    // 1. Initialize Titlebar Controls
    initTitlebar();

    // 2. Initialize Navigation and Tabs
    initNavigation();

    // 3. Setup polling loop
    refreshData();
    setInterval(refreshData, 5000);

    // 4. Setup Event Subscriptions
    initSubscriptions();

    // 5. Setup Action Listeners
    initActionListeners();

    // 6. Initialize File Threat Engine & Replay
    initFileThreatEngine();
    initThreatReplay();

});

/**
 * Handle minimize, maximize, and hide buttons on custom window header.
 */
function initTitlebar() {
    document.getElementById("btn-minimize").addEventListener("click", () => window.flotbot.minimize());
    document.getElementById("btn-maximize").addEventListener("click", () => window.flotbot.maximize());
    document.getElementById("btn-close").addEventListener("click", () => window.flotbot.close());
}

/**
 * Handle Tab navigation click binds.
 */
function initNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const pages    = document.querySelectorAll(".page-content");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();

            // Toggle active nav class
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");

            // Toggle active page display
            const targetPageId = item.getAttribute("data-target");
            pages.forEach(p => p.classList.remove("active"));
            document.getElementById(targetPageId).classList.add("active");

            // Optional page load context triggers
            if (targetPageId === "processes-page") loadProcesses();
            if (targetPageId === "network-page") loadNetwork();
            if (targetPageId === "registry-page") loadRegistry();
            if (targetPageId === "alerts-page") loadAlertsConsole();
            if (targetPageId === "replay-page") loadReplayTimeline();
        });
    });
}

/**
 * Setup Realtime Alert broadcasts from main process.
 */
function initSubscriptions() {
    window.flotbot.onAlert((alert) => {
        console.log("[Renderer] Realtime threat alert received:", alert);
        refreshData();
        // If on Alerts Console or Dashboard, repaint them
        loadAlertsConsole();
    });

    window.flotbot.onNavigate((page) => {
        const navItem = document.querySelector(`.nav-item[data-target="${page}-page"]`);
        if (navItem) navItem.click();
    });
}

/**
 * Setup page and modal interaction event listeners.
 */
function initActionListeners() {

    // Process Search Filter input
    const procSearch = document.getElementById("proc-search");
    procSearch.addEventListener("input", () => {
        filterProcesses(procSearch.value);
    });

    // Chat Send button
    document.getElementById("btn-send-chat").addEventListener("click", sendChatMessage);
    document.getElementById("chat-user-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendChatMessage();
    });

    // Request AI Explainer button inside modal
    document.getElementById("btn-request-ai-explain").addEventListener("click", requestAiExplanation);

    // Acknowledge single alert button inside modal
    document.getElementById("btn-modal-ack").addEventListener("click", async () => {
        if (selectedAlert) {
            await window.flotbot.ackAlert(selectedAlert.id);
            closeAlertModal();
            refreshData();
            loadAlertsConsole();
        }
    });

    // Acknowledge All alerts button
    document.getElementById("btn-ack-all").addEventListener("click", async () => {
        await window.flotbot.ackAllAlerts();
        refreshData();
        loadAlertsConsole();
    });

    // Modal Close buttons
    document.querySelector(".close-modal").addEventListener("click", closeAlertModal);
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("alert-modal");
        if (e.target === modal) closeAlertModal();
    });

    // Save Settings Config
    document.getElementById("btn-save-settings").addEventListener("click", saveSettings);

    // Manual Scan button on Dashboard
    document.getElementById("btn-manual-scan").addEventListener("click", async () => {
        const btn = document.getElementById("btn-manual-scan");
        btn.disabled = true;
        btn.textContent = "Scanning...";
        await refreshData();
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = "Scan Now";
        }, 1500);
    });

}

/**
 * Fetch stats, alerts, and repopulate overview screens.
 */
async function refreshData() {
    try {
        const stats = await window.flotbot.getStats();
        currentAlerts = await window.flotbot.getAlerts();

        // 1. Update Stats count widgets
        document.getElementById("alerts-count-badge").textContent = stats.activeAlertsCount;
        document.getElementById("stat-total-alerts").textContent = stats.alertsCount;

        // 2. Render Threat Gauge Ring
        updateThreatGauge(stats.threatScore, stats.status);

        // 3. Render Dashboard Recent Alerts list
        renderRecentAlerts();

    } catch (err) {
        console.error("Failed to query dashboard update payload:", err);
    }
}

/**
 * Visual Gauge ring paint.
 */
function updateThreatGauge(score, status) {
    const gauge = document.getElementById("threat-gauge");
    const valText = document.getElementById("threat-score-val");
    const statusLabel = document.getElementById("threat-status-label");

    // Conic gradient mapping
    let color = "var(--secure-color)";
    let textStatus = "System Fully Secure";

    if (status === "CRITICAL") {
        color = "var(--danger-color)";
        textStatus = "Threat Detected! Action Required";
        statusLabel.className = "gauge-label critical";
    } else if (status === "WARNING") {
        color = "var(--warning-color)";
        textStatus = "Suspicious Activity Flagged";
        statusLabel.className = "gauge-label warning";
    } else {
        statusLabel.className = "gauge-label secure";
    }

    gauge.style.background = `conic-gradient(${color} ${score * 3.6}deg, var(--border-color) 0deg)`;
    valText.textContent = `${score}%`;
    statusLabel.textContent = textStatus;
}

/**
 * Render small table of recent warnings.
 */
function renderRecentAlerts() {
    const tbody = document.querySelector("#tbl-recent-alerts tbody");
    tbody.innerHTML = "";

    const active = currentAlerts.filter(a => !a.acknowledged).slice(0, 5);

    if (active.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No active threats detected. System safe.</td></tr>`;
        return;
    }

    active.forEach(alert => {
        const tr = document.createElement("tr");

        const dateStr = new Date(alert.timestamp).toLocaleTimeString();

        tr.innerHTML = `
            <td><span class="badge-sec ${alert.severity.toLowerCase()}">${alert.severity}</span></td>
            <td><strong>${alert.title}</strong></td>
            <td>${alert.source}</td>
            <td>${dateStr}</td>
            <td><button class="btn btn-secondary btn-sm btn-inspect" data-id="${alert.id}">Inspect</button></td>
        `;

        tr.querySelector(".btn-inspect").addEventListener("click", () => {
            openAlertModal(alert);
        });

        tbody.appendChild(tr);
    });
}

/**
 * Populate full alerts timeline console tab.
 */
function loadAlertsConsole() {
    const container = document.getElementById("alerts-list-container");
    const filterSev = document.getElementById("filter-severity").value;
    const filterSrc = document.getElementById("filter-source").value;

    container.innerHTML = "";

    let filtered = currentAlerts;

    if (filterSev) {
        filtered = filtered.filter(a => a.severity === filterSev);
    }
    if (filterSrc) {
        filtered = filtered.filter(a => a.source === filterSrc);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state">No matching alerts found.</div>`;
        return;
    }

    filtered.forEach(alert => {
        const item = document.createElement("div");
        item.className = `alert-item-card border-${alert.severity.toLowerCase()} ${alert.acknowledged ? 'acknowledged-fade' : ''}`;

        const timeStr = new Date(alert.timestamp).toLocaleString();

        item.innerHTML = `
            <div class="alert-info-col">
                <div class="alert-info-header">
                    <span class="badge-sec ${alert.severity.toLowerCase()}">${alert.severity}</span>
                    <h4>${alert.title}</h4>
                    ${alert.acknowledged ? '<span class="badge-sec low">ACK</span>' : ''}
                </div>
                <div class="desc">${alert.description}</div>
                <div class="time">Detected: ${timeStr} | Source: ${alert.source}</div>
            </div>
            <div>
                <button class="btn btn-secondary btn-inspect" data-id="${alert.id}">Inspect</button>
            </div>
        `;

        item.querySelector(".btn-inspect").addEventListener("click", () => {
            openAlertModal(alert);
        });

        container.appendChild(item);
    });
}

/**
 * Load processes list from collector.
 */
async function loadProcesses() {
    try {
        currentProcesses = await window.flotbot.getRecentProcesses();
        renderProcessesTable(currentProcesses);
    } catch (err) {
        console.error("Processes collector failure:", err);
    }
}

function renderProcessesTable(list) {
    const tbody = document.querySelector("#tbl-processes tbody");
    tbody.innerHTML = "";

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No running processes collected.</td></tr>`;
        return;
    }

    list.forEach(proc => {
        const tr = document.createElement("tr");

        // Format commandline arguments length safely
        const displayCmd = proc.cmdLine ? (proc.cmdLine.length > 80 ? proc.cmdLine.substring(0, 80) + "..." : proc.cmdLine) : "";

        tr.innerHTML = `
            <td>${proc.pid}</td>
            <td><strong>${proc.image}</strong></td>
            <td title="${proc.cmdLine || ''}">${displayCmd}</td>
            <td>${proc.parentPid || "0"}</td>
            <td>${proc.memoryRaw || "0 K"}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterProcesses(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        renderProcessesTable(currentProcesses);
        return;
    }

    const filtered = currentProcesses.filter(p => 
        (p.image && p.image.toLowerCase().includes(q)) || 
        (p.pid && p.pid.toString().includes(q)) ||
        (p.cmdLine && p.cmdLine.toLowerCase().includes(q))
    );
    renderProcessesTable(filtered);
}

/**
 * Load Network connections list.
 */
async function loadNetwork() {
    try {
        const list = await window.flotbot.getNetworkConnections();
        const tbody = document.querySelector("#tbl-network tbody");
        tbody.innerHTML = "";

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No active sockets detected.</td></tr>`;
            return;
        }

        list.forEach(conn => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span class="badge-sec ${conn.protocol === 'TCP' ? 'medium' : 'low'}">${conn.protocol}</span></td>
                <td>${conn.localAddr}:${conn.localPort}</td>
                <td>${conn.remoteAddr}:${conn.remotePort}</td>
                <td>${conn.state}</td>
                <td>${conn.pid}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Network collector fail:", err);
    }
}

/**
 * Load Registry startup keys list.
 */
async function loadRegistry() {
    try {
        const data = await window.flotbot.getRegistryState();
        const tbody = document.querySelector("#tbl-registry tbody");
        tbody.innerHTML = "";

        const keys = data.runKeys || [];

        if (keys.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="empty-state">No startup registry paths found.</td></tr>`;
            return;
        }

        keys.forEach(entry => {
            const tr = document.createElement("tr");

            // Key path formatting
            const shortPath = entry.keyPath.replace("HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\", "...\\");

            tr.innerHTML = `
                <td title="${entry.keyPath}">${shortPath}</td>
                <td><strong>${entry.valueName}</strong></td>
                <td>${entry.data}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Registry collector fail:", err);
    }
}

/**
 * Open detail inspect Modal for alert context.
 */
function openAlertModal(alert) {
    selectedAlert = alert;

    document.getElementById("modal-alert-title").textContent = alert.title;
    document.getElementById("modal-alert-severity").textContent = alert.severity;
    document.getElementById("modal-alert-severity").className = `severity-badge badge-sec ${alert.severity.toLowerCase()}`;
    document.getElementById("modal-alert-category").textContent = alert.category;
    document.getElementById("modal-alert-time").textContent = new Date(alert.timestamp).toLocaleString();
    document.getElementById("modal-alert-source").textContent = alert.source;
    document.getElementById("modal-alert-desc").textContent = alert.description;
    document.getElementById("modal-alert-recommend").textContent = alert.recommendation || "Verify and terminate the associated process if unauthorized.";

    // Render Raw evidence
    document.getElementById("modal-alert-evidence").textContent = JSON.stringify(alert.evidence || {}, null, 4);

    // Check if there is already a cached AI explanation in database or memory
    const aiBox = document.getElementById("modal-alert-ai-explanation");
    aiBox.innerHTML = `Click "Request AI Analysis" below to fetch real-time behavior explanation and Mitre correlation from Copilot...`;
    document.getElementById("btn-request-ai-explain").style.display = "inline-flex";

    // Set modal display to flex
    document.getElementById("alert-modal").style.display = "flex";
}

function closeAlertModal() {
    document.getElementById("alert-modal").style.display = "none";
    selectedAlert = null;
}

/**
 * Trigger AI explain alert pipeline.
 */
async function requestAiExplanation() {
    if (!selectedAlert) return;

    const explainBtn = document.getElementById("btn-request-ai-explain");
    const aiBox      = document.getElementById("modal-alert-ai-explanation");

    explainBtn.disabled = true;
    aiBox.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div> Contextualizing alert...`;

    try {
        const res = await window.flotbot.explainAlert(selectedAlert);
        if (res.success) {
            aiBox.innerHTML = `<strong>Security Analyst Insight:</strong><br>${res.explanation.replace(/\n/g, '<br>')}`;
            explainBtn.style.display = "none"; // Hide button after fetch succeeds
        } else {
            aiBox.textContent = `Copilot error: ${res.error}`;
            explainBtn.disabled = false;
        }
    } catch (err) {
        aiBox.textContent = `Fail: ${err.message}`;
        explainBtn.disabled = false;
    }
}

/**
 * Handle AI Copilot Chat panel actions.
 */
async function sendChatMessage() {
    const inputField = document.getElementById("chat-user-input");
    const text       = inputField.value.trim();

    if (!text) return;

    const historyBox = document.getElementById("chat-history");

    // Append User Bubble
    const userDiv = document.createElement("div");
    userDiv.className = "message user";
    userDiv.textContent = text;
    historyBox.appendChild(userDiv);

    // Clear input field
    inputField.value = "";

    // Append Loading indicator bubble
    const loaderDiv = document.createElement("div");
    loaderDiv.className = "message assistant typing-bubble";
    loaderDiv.innerHTML = `<div id="typing-loader" style="margin:0;"><div class="dot"></div><div class="dot"></div><div class="dot"></div><span class="typing-provider-label">⚡ FlotBot is analyzing threat telemetry...</span></div>`;
    historyBox.appendChild(loaderDiv);
    historyBox.scrollTop = historyBox.scrollHeight;

    try {
        const context = {
            alerts: currentAlerts.slice(0, 5),
            processes: currentProcesses.slice(0, 8)
        };
        const res = await window.flotbot.sendChat(sessionChatId, text, context);

        // Remove loading bubble
        historyBox.removeChild(loaderDiv);

        const replyDiv = document.createElement("div");
        replyDiv.className = "message assistant";

        if (res.success) {
            replyDiv.innerHTML = res.reply.replace(/\n/g, "<br>");
        } else {
            replyDiv.textContent = `Error: ${res.error}`;
        }

        historyBox.appendChild(replyDiv);
        historyBox.scrollTop = historyBox.scrollHeight;

    } catch (err) {
        historyBox.removeChild(loaderDiv);
        const errDiv = document.createElement("div");
        errDiv.className = "message assistant system";
        errDiv.textContent = `Fatal Connection Error: ${err.message}`;
        historyBox.appendChild(errDiv);
    }
}

/**
 * Settings Load & Updates
 */
async function saveSettings() {
    const intervalElem = document.getElementById("settings-interval");
    const interval = intervalElem && !isNaN(parseInt(intervalElem.value, 10)) ? parseInt(intervalElem.value, 10) : 5000;
    const providerElem = document.getElementById("settings-provider");
    const provider = providerElem ? providerElem.value : "mock";
    const notifyElem = document.getElementById("settings-notifications");
    const notify = notifyElem ? notifyElem.checked : false;
    const soundElem = document.getElementById("settings-sound");
    const sound = soundElem ? soundElem.checked : false;

    const settingsObj = {
        scanInterval: interval,
        aiProvider: provider,
        notificationsEnabled: notify,
        soundEnabled: sound
    };

    try {
        await window.flotbot.updateSettings(settingsObj);
        alert("Configurations updated successfully. Application may require restarting for some options to apply.");
    } catch (err) {
        alert("Error saving configurations: " + err.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE THREAT ENGINE CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════

function initFileThreatEngine() {
    const btnPick = document.getElementById("btn-pick-file-scan");
    const btnDeep = document.getElementById("btn-run-deep-audit");
    const btnScanPath = document.getElementById("btn-scan-path-input");
    const inputPath = document.getElementById("file-engine-path-input");

    if (btnPick) {
        btnPick.addEventListener("click", async () => {
            btnPick.disabled = true;
            btnPick.textContent = "Selecting File...";
            try {
                const res = await window.flotbot.pickAndScanFile();
                if (res && !res.canceled && res.report) {
                    renderFileThreatReport(res.report);
                }
            } catch (err) {
                alert(`File scan error: ${err.message}`);
            } finally {
                btnPick.disabled = false;
                btnPick.textContent = "📂 Select File to Inspect";
            }
        });
    }

    if (btnScanPath && inputPath) {
        btnScanPath.addEventListener("click", async () => {
            const pathVal = inputPath.value.trim();
            if (!pathVal) return alert("Please enter a file path to inspect.");
            btnScanPath.disabled = true;
            btnScanPath.textContent = "Scanning...";
            try {
                const report = await window.flotbot.analyzeFileThreat(pathVal);
                if (report && report.success) {
                    renderFileThreatReport(report);
                } else {
                    alert(`Scan failed: ${report?.error || "Unknown error"}`);
                }
            } catch (err) {
                alert(`Scan error: ${err.message}`);
            } finally {
                btnScanPath.disabled = false;
                btnScanPath.textContent = "Scan Path";
            }
        });

        inputPath.addEventListener("keypress", (e) => {
            if (e.key === "Enter") btnScanPath.click();
        });
    }

    if (btnDeep) {
        btnDeep.addEventListener("click", async () => {
            btnDeep.disabled = true;
            btnDeep.textContent = "Auditing Host...";
            try {
                const res = await window.flotbot.deepScanSystem();
                alert(`Deep Audit Complete: Scanned ${res.totalScanned} files across system directories.\nClean: ${res.cleanFiles} | Flagged: ${res.threatsFound}\n\n${res.honestReportSummary}`);
            } catch (err) {
                alert(`Deep audit failed: ${err.message}`);
            } finally {
                btnDeep.disabled = false;
                btnDeep.textContent = "🔍 Deep Host Audit";
            }
        });
    }
}

function renderFileThreatReport(report) {
    const emptyEl = document.getElementById("file-engine-empty");
    const resultsEl = document.getElementById("file-engine-results");

    if (emptyEl) emptyEl.style.display = "none";
    if (resultsEl) resultsEl.style.display = "block";

    // Verdict badge
    const badge = document.getElementById("file-res-verdict-badge");
    if (badge) {
        badge.textContent = report.verdict;
        badge.className = `badge-sec ${report.isMalicious ? 'critical' : report.isSuspicious ? 'medium' : 'low'}`;
    }

    // Header info
    const nameEl = document.getElementById("file-res-filename");
    if (nameEl) nameEl.textContent = report.filename;
    const pathEl = document.getElementById("file-res-filepath");
    if (pathEl) pathEl.textContent = report.filePath;

    // Score & confidence
    const scoreEl = document.getElementById("file-res-risk-score");
    if (scoreEl) scoreEl.innerHTML = `${report.riskScore}<span style="font-size:14px; color:#64748b;">/100</span>`;
    const confEl = document.getElementById("file-res-confidence");
    if (confEl) confEl.textContent = `Confidence: ${(report.confidence * 100).toFixed(0)}%`;

    // Tiles
    const formatEl = document.getElementById("file-res-format");
    if (formatEl) formatEl.textContent = report.identification?.format || "Unknown";
    const sizeEl = document.getElementById("file-res-size");
    if (sizeEl) sizeEl.textContent = report.sizeFormatted || `${report.fileSizeBytes} B`;

    const entropyEl = document.getElementById("file-res-entropy");
    if (entropyEl) entropyEl.textContent = `${report.entropy?.score || 0} / 8.0`;
    const entropyTierEl = document.getElementById("file-res-entropy-tier");
    if (entropyTierEl) entropyTierEl.textContent = report.entropy?.tier || "Normal";

    const sigEl = document.getElementById("file-res-sig");
    if (sigEl) sigEl.textContent = report.signature?.status || "Unsigned";
    const pubEl = document.getElementById("file-res-publisher");
    if (pubEl) pubEl.textContent = report.signature?.publisher || "Unknown";

    const yaraEl = document.getElementById("file-res-yara");
    if (yaraEl) yaraEl.textContent = `${report.yaraMatches?.length || 0} Match(es)`;

    const mlEl = document.getElementById("file-res-ml");
    if (mlEl) mlEl.textContent = `${((report.ml?.malicious_probability || 0) * 100).toFixed(0)}%`;
    const mlClassEl = document.getElementById("file-res-ml-class");
    if (mlClassEl) mlClassEl.textContent = report.ml?.classification || "BENIGN";

    const shaEl = document.getElementById("file-res-sha256");
    if (shaEl) shaEl.textContent = report.hashes?.sha256 || "—";

    // Evidence Breakdown
    const listEl = document.getElementById("file-res-evidence-list");
    if (listEl) {
        listEl.innerHTML = "";
        const breakdown = report.evidenceBreakdown || [];
        if (breakdown.length === 0) {
            listEl.innerHTML = `<div style="font-size:12px; color:#64748b;">No adverse threat factors detected.</div>`;
        } else {
            breakdown.forEach(item => {
                const row = document.createElement("div");
                row.style.cssText = "display:flex; justify-content:space-between; padding:6px 10px; background:rgba(30,41,59,0.5); border-radius:4px; font-size:12px;";
                row.innerHTML = `
                    <span>${item.factor}</span>
                    <strong style="color:${item.points > 0 ? '#ef4444' : '#22c55e'};">${item.points > 0 ? '+' : ''}${item.points} pts</strong>
                `;
                listEl.appendChild(row);
            });
        }
    }

    // Remediation
    const remDesc = document.getElementById("file-res-remediation-desc");
    if (remDesc) remDesc.textContent = report.remediation?.explanation || "No immediate action required.";
    const remCmd = document.getElementById("file-res-remediation-cmd");
    if (remCmd) {
        if (report.remediation?.remediationCommand) {
            remCmd.style.display = "block";
            remCmd.textContent = report.remediation.remediationCommand;
        } else {
            remCmd.style.display = "none";
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// ULTRA-FAST THREAT REPLAY CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════

let currentReplayTimeline = [];
let replayPlaybackTimer = null;
let replaySpeedIntervalMs = 1000;
let isReplayPlaying = false;

function initThreatReplay() {
    const btnLoad = document.getElementById("btn-load-replay-timeline");
    const scrub = document.getElementById("replay-scrub");
    const btnPlay = document.getElementById("btn-replay-play");
    const btnFirst = document.getElementById("btn-replay-first");
    const btnPrev = document.getElementById("btn-replay-prev");
    const btnNext = document.getElementById("btn-replay-next");
    const btnLast = document.getElementById("btn-replay-last");

    if (btnLoad) {
        btnLoad.addEventListener("click", loadReplayTimeline);
    }

    if (scrub) {
        scrub.addEventListener("input", async () => {
            const val = parseInt(scrub.value, 10);
            document.getElementById("replay-percent-badge").textContent = `${val}%`;
            const step = await window.flotbot.replaySeekPercent(val);
            if (step) renderReplayStep(step);
        });
    }

    if (btnPlay) {
        btnPlay.addEventListener("click", toggleReplayPlayback);
    }

    if (btnFirst) {
        btnFirst.addEventListener("click", async () => {
            const step = await window.flotbot.replaySeek(0);
            if (step) renderReplayStep(step);
        });
    }

    if (btnLast) {
        btnLast.addEventListener("click", async () => {
            if (currentReplayTimeline.length > 0) {
                const step = await window.flotbot.replaySeek(currentReplayTimeline.length - 1);
                if (step) renderReplayStep(step);
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener("click", async () => {
            const step = await window.flotbot.replayPrevious(1);
            if (step) renderReplayStep(step);
        });
    }

    if (btnNext) {
        btnNext.addEventListener("click", async () => {
            const step = await window.flotbot.replayNext(1);
            if (step) renderReplayStep(step);
        });
    }

    // Speed buttons
    document.querySelectorAll(".btn-speed").forEach(btn => {
        btn.addEventListener("click", async () => {
            document.querySelectorAll(".btn-speed").forEach(b => b.classList.remove("btn-primary"));
            btn.classList.add("btn-primary");
            const speed = parseFloat(btn.getAttribute("data-speed"));
            if (speed === 0) {
                replaySpeedIntervalMs = 20; // Fast-forward burst
            } else {
                replaySpeedIntervalMs = Math.max(20, Math.round(1000 / speed));
            }
            await window.flotbot.replaySetSpeed(speed);
            if (isReplayPlaying) {
                clearInterval(replayPlaybackTimer);
                replayPlaybackTimer = setInterval(stepReplayTick, replaySpeedIntervalMs);
            }
        });
    });
}

async function loadReplayTimeline() {
    const btnLoad = document.getElementById("btn-load-replay-timeline");
    if (btnLoad) {
        btnLoad.disabled = true;
        btnLoad.textContent = "⚡ Indexing Big Data...";
    }

    try {
        const events = await window.flotbot.buildTimeline({
            startTime: new Date(Date.now() - 86400_000 * 7),
            endTime: new Date(),
            options: { limit: 10000 }
        });

        currentReplayTimeline = events || [];
        await window.flotbot.initReplay({ incidentOrEvents: currentReplayTimeline });

        renderReplayTable(currentReplayTimeline);

        if (currentReplayTimeline.length > 0) {
            const firstStep = await window.flotbot.replaySeek(0);
            if (firstStep) renderReplayStep(firstStep);
        }

    } catch (err) {
        console.error("Timeline load failed:", err);
    } finally {
        if (btnLoad) {
            btnLoad.disabled = false;
            btnLoad.textContent = "⚡ Load Recent Timeline";
        }
    }
}

function toggleReplayPlayback() {
    const btnPlay = document.getElementById("btn-replay-play");
    if (isReplayPlaying) {
        isReplayPlaying = false;
        if (replayPlaybackTimer) clearInterval(replayPlaybackTimer);
        if (btnPlay) btnPlay.textContent = "▶ Play";
    } else {
        isReplayPlaying = true;
        if (btnPlay) btnPlay.textContent = "⏸ Pause";
        replayPlaybackTimer = setInterval(stepReplayTick, replaySpeedIntervalMs);
    }
}

async function stepReplayTick() {
    const step = await window.flotbot.replayNext(1);
    if (!step || step.stepIndex >= step.totalSteps - 1) {
        toggleReplayPlayback(); // Auto pause at end
    }
    if (step) renderReplayStep(step);
}

function renderReplayStep(step) {
    if (!step) return;

    // Update step and percent
    const stepLabel = document.getElementById("replay-step-label");
    if (stepLabel) stepLabel.textContent = `Step ${step.stepIndex + 1} of ${step.totalSteps}`;

    const scrub = document.getElementById("replay-scrub");
    if (scrub) scrub.value = step.progressPercent;
    const badge = document.getElementById("replay-percent-badge");
    if (badge) badge.textContent = `${step.progressPercent}%`;

    // State counts
    const chk = step.checkpointState;
    if (chk) {
        const pEl = document.getElementById("replay-state-pids");
        if (pEl) pEl.textContent = chk.activePidsCount || 0;
        const sEl = document.getElementById("replay-state-sockets");
        if (sEl) sEl.textContent = chk.activeSocketsCount || 0;
        const fEl = document.getElementById("replay-state-files");
        if (fEl) fEl.textContent = chk.modifiedFilesCount || 0;
        const aEl = document.getElementById("replay-state-alerts");
        if (aEl) aEl.textContent = chk.alertsCount || 0;
    }

    // Detail card
    const ev = step.event;
    if (ev) {
        const titleEl = document.getElementById("replay-curr-title");
        if (titleEl) titleEl.textContent = ev.title || `Event ${ev.type}`;
        const descEl = document.getElementById("replay-curr-desc");
        if (descEl) descEl.textContent = ev.description || "Microsecond event step";
        const timeEl = document.getElementById("replay-curr-time");
        if (timeEl) timeEl.textContent = `Timestamp: ${ev.timestamp} (Epoch: ${ev.epoch})`;
    }

    // Highlight row in table
    document.querySelectorAll("#tbl-replay-stream tbody tr").forEach((tr, idx) => {
        if (idx === step.stepIndex) {
            tr.style.background = "rgba(56,189,248,0.25)";
            tr.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else {
            tr.style.background = "";
        }
    });
}

function renderReplayTable(events) {
    const tbody = document.querySelector("#tbl-replay-stream tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!events || events.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No timeline events in selected window.</td></tr>`;
        return;
    }

    // Render up to 500 rows for smooth performance
    const renderLimit = Math.min(events.length, 500);
    for (let i = 0; i < renderLimit; i++) {
        const ev = events[i];
        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";
        const timeStr = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : "—";
        tr.innerHTML = `
            <td><code>${timeStr}</code></td>
            <td><span class="badge-sec ${ev.type.includes('ALERT') ? 'critical' : 'low'}">${ev.type}</span></td>
            <td><strong>${ev.title}</strong></td>
            <td><small style="color:#94a3b8;">${ev.description}</small></td>
        `;

        tr.addEventListener("click", async () => {
            const step = await window.flotbot.replaySeek(i);
            if (step) renderReplayStep(step);
        });

        tbody.appendChild(tr);
    }
}

