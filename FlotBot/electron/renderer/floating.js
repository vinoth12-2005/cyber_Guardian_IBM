/**
 * floating.js  ─  FlotBot Floating Chatbot Widget Logic
 * ─────────────────────────────────────────────────────────────
 * Key improvements in this version:
 *
 *   STREAMING AI RENDERING
 *     Tokens are received word-by-word via IPC "ai-token" events and
 *     appended directly into the live bubble — user sees the response
 *     forming in real-time instead of waiting for the full reply.
 *
 *   AI PROVIDER STATUS BADGE
 *     Header badge shows: Gemini (cloud) | Ollama (local) | Mock (offline)
 *     with response latency displayed as a pill on the status card.
 *
 *   FAST INPUT UX
 *     • Enter sends message immediately
 *     • Textarea auto-resizes
 *     • Send button state managed cleanly
 *     • Stream is aborted if user sends a new message (abort token listener)
 *
 *   EXPLAIN ALERT STREAMING
 *     "🔍 Explain" button triggers streaming explanation, showing words
 *     appear live in the bubble.
 */

// ─── STATE ───────────────────────────────────────────────────────────────────

const sessionId = `floating-${Date.now()}`;
let isExpanded       = false;
let alertCount       = 0;
let latestAlert      = null;
let lastFocusedAlert = null;
let alertSessionStart = null;
let sessionChatLog    = [];

// Streaming state
let _isStreaming          = false;     // true while AI is generating
let _streamUnsubscribe    = null;     // call to stop listening to ai-token
let _currentStreamBubble  = null;    // the live DOM bubble being streamed into

// Drag state
let isDragging  = false;
let lastMouseX  = 0;
let lastMouseY  = 0;
let dragDistance = 0;

// ─── DOM REFS ─────────────────────────────────────────────────────────────────

const bubble          = document.getElementById('floating-bubble');
const bubbleBadge     = document.getElementById('bubble-badge');
const bubbleInner     = document.querySelector('.bubble-inner');
const bubbleRing      = document.querySelector('.bubble-ring');
const chatPanel       = document.getElementById('floating-chat-panel');
const messagesEl      = document.getElementById('chat-messages');
const chatInput       = document.getElementById('chat-input');
const sendBtn         = document.getElementById('btn-send-chat');
const typingLoader    = document.getElementById('typing-loader');
const typingProvLabel = document.getElementById('typing-provider-label');
const alertsBanner    = document.getElementById('alerts-banner');
const bannerText      = alertsBanner ? alertsBanner.querySelector('.banner-text') : null;
const btnBannerBlock  = document.getElementById('btn-banner-block');
const btnBannerExplain= document.getElementById('btn-banner-explain');
const btnBannerDismiss= document.getElementById('btn-banner-dismiss');
const btnMinimize     = document.getElementById('btn-minimize');
const btnCollapse     = document.getElementById('btn-collapse');
const statusCard      = document.getElementById('status-card');
const statusText      = document.getElementById('status-text');
const statusDesc      = document.getElementById('status-desc');
const statusIcon      = document.querySelector('.status-icon');
const dragHandle      = document.getElementById('drag-handle');
const cmdChips        = document.querySelectorAll('.cmd-chip');
const aiBadge         = document.getElementById('ai-provider-badge');
const aiBadgeLabel    = document.getElementById('ai-badge-label');
const latencyPill     = document.getElementById('latency-pill');

// ─── AI PROVIDER STATUS & 1-CLICK SWITCHER ─────────────────────────────────────

let currentAIMode = "auto";

async function refreshAIStatus() {
    try {
        if (!window.flotbot.getAIStatus) return;
        const status = await window.flotbot.getAIStatus();

        const mode = status?.mode || "auto";
        currentAIMode = mode;
        const chat   = status?.chat;
        const analysis = status?.analysis;
        const localModel = analysis?.model || 'qwen2.5';
        const cloudModel = chat?.model || '2.0-flash';

        if (aiBadge) {
            if (mode === "offline") {
                aiBadge.className = "ai-badge ai-badge--local";
                if (aiBadgeLabel) aiBadgeLabel.textContent = `🔒 Local Ollama (${localModel})`;
                aiBadge.title = "Mode: OFFLINE (Local Ollama). Click to switch to Online Cloud AI.";
            } else if (mode === "online") {
                aiBadge.className = "ai-badge ai-badge--cloud";
                if (aiBadgeLabel) aiBadgeLabel.textContent = `⚡ Cloud Gemini (${cloudModel})`;
                aiBadge.title = "Mode: ONLINE (Google Gemini). Click to switch to Auto Hybrid Mode.";
            } else {
                aiBadge.className = "ai-badge ai-badge--cloud";
                if (aiBadgeLabel) aiBadgeLabel.textContent = `🧠 Auto Hybrid (${localModel})`;
                aiBadge.title = "Mode: AUTO HYBRID (Smart Routing). Click to switch to 100% Offline Mode.";
            }
        }

        // Recent latency
        const latencies = status?.latency;
        if (latencyPill && Array.isArray(latencies) && latencies.length > 0) {
            const last = latencies[latencies.length - 1];
            if (last?.ms) {
                const ms   = last.ms;
                const fast = ms < 1500;
                const med  = ms < 4000;
                latencyPill.textContent  = `${ms}ms`;
                latencyPill.className    = `latency-pill ${fast ? "fast" : med ? "medium" : "slow"}`;
                latencyPill.title        = `Last AI response: ${ms}ms via ${last.provider}`;
            }
        }

    } catch { /* non-fatal */ }
}

// 1-Click Fast Mode Switcher
if (aiBadge) {
    aiBadge.addEventListener('click', async (e) => {
        e.stopPropagation();
        const modeOrder = ["auto", "offline", "online"];
        const nextIdx = (modeOrder.indexOf(currentAIMode) + 1) % modeOrder.length;
        const nextMode = modeOrder[nextIdx];

        try {
            if (window.flotbot.setAIMode) {
                const res = await window.flotbot.setAIMode({ mode: nextMode });
                if (res && res.success) {
                    currentAIMode = nextMode;
                    const modeLabels = {
                        offline: "🔒 100% Offline Local AI (Ollama)",
                        online: "⚡ Online Cloud AI (Google Gemini)",
                        auto: "🧠 Auto Smart Hybrid (Local Forensics + Cloud Intel)"
                    };
                    appendMessage('bot', `🤖 AI Engine switched to <strong>${modeLabels[nextMode]}</strong>. All future questions and analyses will route instantly.`);
                    await refreshAIStatus();
                }
            }
        } catch (err) {
            console.error("Failed to switch AI mode:", err);
        }
    });
}

// Poll provider status periodically
refreshAIStatus();
setInterval(refreshAIStatus, 10_000);

// ─── ROCK-SOLID DRAG SYSTEM ──────────────────────────────────────────────────

let dragStartX = 0;
let dragStartY = 0;

function handleDragStart(e) {
    if (e.button !== 0) return; // Only primary mouse button
    isDragging = true;
    dragStartX = e.screenX;
    dragStartY = e.screenY;
    dragDistance = 0;
    document.body.style.cursor = 'grabbing';
    if (bubbleRing) bubbleRing.style.cursor = 'grabbing';
    if (dragHandle) dragHandle.style.cursor = 'grabbing';

    if (window.flotbot.startDragFloating) {
        window.flotbot.startDragFloating({
            offsetX: e.clientX,
            offsetY: e.clientY
        });
    }

    e.preventDefault();
    e.stopPropagation();
}

function handleDragMove(e) {
    if (!isDragging) return;
    const dist = Math.abs(e.screenX - dragStartX) + Math.abs(e.screenY - dragStartY);
    dragDistance = Math.max(dragDistance, dist);
}

function handleDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = '';
    if (bubbleRing) bubbleRing.style.cursor = 'grab';
    if (dragHandle) dragHandle.style.cursor = 'grab';

    if (window.flotbot.stopDragFloating) {
        window.flotbot.stopDragFloating();
    }
}

window.addEventListener('mousemove', handleDragMove);
window.addEventListener('mouseup', handleDragEnd);
window.addEventListener('blur', handleDragEnd);

if (bubbleRing) {
    bubbleRing.addEventListener('mousedown', (e) => {
        if (e.target === bubbleBadge) return;
        handleDragStart(e);
    });

    bubbleRing.addEventListener('mouseup', (e) => {
        // If the mouse was barely moved, treat as an expand click!
        if (dragDistance < 6) {
            setTimeout(expandPanel, 10);
        }
    });

    bubbleRing.addEventListener('mouseenter', () => {
        if (!isExpanded && window.flotbot.setIgnoreMouseEvents) {
            window.flotbot.setIgnoreMouseEvents(false);
        }
    });
}

if (dragHandle) {
    dragHandle.addEventListener('mousedown', (e) => {
        if (e.target.closest('button') || e.target.closest('#ai-provider-badge')) return;
        handleDragStart(e);
    });
}

// ─── EXPAND / COLLAPSE ────────────────────────────────────────────────────────

function expandPanel() {
    if (isExpanded) return;
    isExpanded = true;
    bubble.classList.add('hidden');
    bubble.classList.remove('visible');
    chatPanel.classList.remove('hidden');
    chatPanel.classList.add('visible');
    window.flotbot.resizeFloating('expanded');
    if (window.flotbot.setIgnoreMouseEvents) {
        window.flotbot.setIgnoreMouseEvents(false);
    }
    scrollToBottom();
    refreshAIStatus();
}

let currentSizeState = 'expanded'; // 'expanded' | 'fullscreen' | 'docked'

const btnDock = document.getElementById('btn-dock');
const btnFullscreen = document.getElementById('btn-fullscreen');

btnDock && btnDock.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentSizeState === 'docked') {
        currentSizeState = 'expanded';
        window.flotbot.resizeFloating('expanded');
        btnDock.textContent = '◧';
        btnDock.title = 'Dock to Side';
    } else {
        currentSizeState = 'docked';
        window.flotbot.resizeFloating('docked');
        btnDock.textContent = '◨';
        btnDock.title = 'Float Window';
        if (btnFullscreen) {
            btnFullscreen.textContent = '⛶';
            btnFullscreen.title = 'Toggle Fullscreen';
        }
    }
});

btnFullscreen && btnFullscreen.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentSizeState === 'fullscreen') {
        currentSizeState = 'expanded';
        window.flotbot.resizeFloating('expanded');
        btnFullscreen.textContent = '⛶';
        btnFullscreen.title = 'Toggle Fullscreen';
    } else {
        currentSizeState = 'fullscreen';
        window.flotbot.resizeFloating('fullscreen');
        btnFullscreen.textContent = '⛶';
        btnFullscreen.title = 'Restore Window';
        if (btnDock) {
            btnDock.textContent = '◧';
            btnDock.title = 'Dock to Side';
        }
    }
});

function collapsePanel() {
    if (!isExpanded) return;
    isExpanded = false;
    chatPanel.classList.remove('visible');
    chatPanel.classList.add('hidden');
    bubble.classList.remove('hidden');
    bubble.classList.add('visible');
    window.flotbot.resizeFloating('collapsed');

    // Reset sizing states on collapse
    currentSizeState = 'expanded';
    if (btnDock) {
        btnDock.textContent = '◧';
        btnDock.title = 'Dock to Side';
    }
    if (btnFullscreen) {
        btnFullscreen.textContent = '⛶';
        btnFullscreen.title = 'Toggle Fullscreen';
    }
}

btnMinimize && btnMinimize.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    collapsePanel();
});

btnCollapse && btnCollapse.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    collapsePanel();
});

// ─── INPUT ────────────────────────────────────────────────────────────────────

chatInput && chatInput.addEventListener('input', () => {
    sendBtn.disabled = chatInput.value.trim().length === 0;
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 80) + 'px';
});

chatInput && chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled && !_isStreaming) sendMessage();
    }
});

sendBtn && sendBtn.addEventListener('click', () => {
    if (_isStreaming) {
        stopGeneration();
    } else {
        sendMessage();
    }
});

// ─── SCREEN CONSENT MODAL & QUICK COMMAND CHIPS ───────────────────────────────

const modalScreenConsent = document.getElementById('modal-screen-consent');
const btnConsentAllow    = document.getElementById('btn-consent-allow');
const btnConsentDeny     = document.getElementById('btn-consent-deny');
let hasScreenConsent     = false;

function requestScreenConsent(promptText) {
    return new Promise((resolve) => {
        if (hasScreenConsent) return resolve(true);

        if (modalScreenConsent) {
            modalScreenConsent.style.display = 'flex';
        }

        const onAllow = () => {
            hasScreenConsent = true;
            if (modalScreenConsent) modalScreenConsent.style.display = 'none';
            cleanup();
            resolve(true);
        };

        const onDeny = () => {
            if (modalScreenConsent) modalScreenConsent.style.display = 'none';
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            btnConsentAllow && btnConsentAllow.removeEventListener('click', onAllow);
            btnConsentDeny  && btnConsentDeny.removeEventListener('click', onDeny);
        };

        btnConsentAllow && btnConsentAllow.addEventListener('click', onAllow);
        btnConsentDeny  && btnConsentDeny.addEventListener('click', onDeny);
    });
}

// ─── QUICK COMMANDS DISPATCHER ────────────────────────────────────────────────

const allChips = document.querySelectorAll('.quick-commands .cmd-chip');
allChips.forEach(chip => {
    chip.addEventListener('click', async () => {
        const action = chip.dataset.action;
        const cmd = chip.dataset.cmd;

        if (action === 'screen' || chip.id === 'btn-chip-screen') {
            const allowed = await requestScreenConsent("Screen Analysis");
            if (!allowed) {
                appendMessage('user', '📸 Inspect active screen for visual threats');
                appendMessage('bot', '⚠️ <strong>Screen Access Denied:</strong> Privacy preserved. Screen capture cancelled.');
                return;
            }
            runScreenVisualAnalysis();
            return;
        } else if (action === 'threads' || chip.id === 'btn-chip-threads') {
            runThreadAudit();
            return;
        } else if (action === 'malware' || chip.id === 'btn-chip-malware') {
            runMalwareScanner();
            return;
        } else if (action === 'deepscan' || chip.id === 'btn-chip-deepscan') {
            runDeepSystemScan();
            return;
        }

        if (cmd) {
            chatInput.value = cmd;
            sendBtn.disabled = false;
            sendMessage();
        }
    });
});

// ─── 1. REAL SCREEN VISUAL ANALYSIS ───────────────────────────────────────────

async function runScreenVisualAnalysis() {
    appendMessage('user', '📸 Capture and analyze screen for visual security threats');
    showTyping(true, 'Capturing desktop frame & running vision inspection...');

    try {
        const windows = await window.flotbot.getOpenWindows().catch(() => []);
        const result = await window.flotbot.analyzeScreen({
            windows,
            windowTitle: windows[0]?.title || "Active Workspace"
        });

        showTyping(false);

        let html = `<strong>📸 Visual Desktop & Phishing Analysis Report</strong><br><br>`;

        if (result.imagePreview) {
            html += `<div class="screen-preview-card">
                <img src="${result.imagePreview}" alt="Desktop Capture Preview" />
                <div class="screen-preview-meta">
                    <span>👁️ Visual Snapshot (${result.provider ? result.provider.toUpperCase() : 'AI'})</span>
                    <span>${result.openWindowsCount || windows.length} Active Windows</span>
                </div>
            </div>`;
        }

        if (result.warnings && result.warnings.length > 0) {
            html += `<div style="margin: 6px 0; padding: 6px 10px; background: rgba(239,68,68,0.15); border-left: 3px solid #ef4444; border-radius: 4px;">`;
            result.warnings.forEach(w => {
                html += `<div>${escHtml(w)}</div>`;
            });
            html += `</div>`;
        }

        html += `<br>${formatAIResponse(result.aiOpinion || 'No immediate visual security threats detected.')}`;

        appendMessage('bot', html);

    } catch (err) {
        showTyping(false);
        appendMessage('bot', `⚠️ Screen analysis failed: ${escHtml(err.message)}`);
    }
}

// ─── 2. PROCESS THREAD AUDIT ──────────────────────────────────────────────────

async function runThreadAudit() {
    appendMessage('user', '🧵 Audit active process threads and detect CPU anomalies / thread injection');
    showTyping(true, 'Auditing process threads & checking anomaly baselines...');

    try {
        const report = await window.flotbot.auditThreads();
        showTyping(false);

        let html = `<strong>🧵 Process Thread & Injection Forensic Audit</strong><br><br>`;
        html += `📊 <strong>Audit Summary:</strong> Audited <strong>${report.totalProcessesAudited}</strong> processes | Anomalies: <strong>${report.anomaliesFound}</strong><br><br>`;

        if (report.anomalousProcesses && report.anomalousProcesses.length > 0) {
            const actions = [];
            html += `<strong>⚠️ Anomalous Thread Patterns Detected:</strong><br>`;
            report.anomalousProcesses.forEach((proc, idx) => {
                html += `<div style="margin-top:6px; padding:6px 10px; background:rgba(239,68,68,0.15); border-left:3px solid #ef4444; border-radius:4px;">`;
                html += `<strong>#${idx + 1} Process:</strong> <code>${escHtml(proc.name)}</code> (PID: <strong>${proc.pid}</strong>)<br>`;
                html += `<strong>Threads:</strong> ${proc.threadCount} | <strong>CPU:</strong> ${proc.cpu}%<br>`;
                html += `<strong>Reasons:</strong> ${escHtml(proc.reasons.join(', '))}<br>`;
                html += `</div>`;

                actions.push({
                    type: 'block',
                    label: `🚫 Kill PID ${proc.pid}`,
                    handler: () => blockProcess(proc.pid, proc.name)
                });
            });

            if (report.aiForensicReport) {
                html += `<br>${formatAIResponse(report.aiForensicReport)}`;
            }

            appendMessage('bot', html, actions);
        } else {
            html += `${formatAIResponse(report.aiForensicReport)}`;
            appendMessage('bot', html);
        }

    } catch (err) {
        showTyping(false);
        appendMessage('bot', `⚠️ Thread audit failed: ${escHtml(err.message)}`);
    }
}

// ─── 3. REAL MALWARE FILE INSPECTOR ───────────────────────────────────────────

async function runMalwareScanner() {
    let report = null;
    let targetPath = "";

    if (window.flotbot.pickAndScanFile) {
        const choice = confirm("Click OK to select a file via File Explorer/Finder, or CANCEL to type a manual path.");
        if (choice) {
            showTyping(true, "Selecting file & analyzing binary...");
            const res = await window.flotbot.pickAndScanFile();
            showTyping(false);
            if (res && !res.canceled && res.report) {
                report = res.report;
                targetPath = res.filePath;
            } else {
                return;
            }
        }
    }

    if (!report) {
        const inputPath = prompt("Enter the absolute file path to inspect for malware:");
        targetPath = (inputPath || "").trim();
        if (!targetPath) return;

        appendMessage('user', `🦠 Inspect file for malware: <code>${escHtml(targetPath)}</code>`);
        showTyping(true, `Analyzing file binary, Shannon entropy, YARA & ML models...`);

        try {
            report = await window.flotbot.analyzeFileThreat(targetPath);
            showTyping(false);
        } catch (err) {
            showTyping(false);
            appendMessage('bot', `⚠️ Malware inspection error: ${escHtml(err.message)}`);
            return;
        }
    } else {
        appendMessage('user', `🦠 Inspect file for malware: <code>${escHtml(targetPath)}</code>`);
    }

    if (!report || !report.success) {
        appendMessage('bot', `❌ File Inspection Error: ${escHtml(report?.error || "Unknown error")}`);
        return;
    }

    let html = `<strong>🦠 Master File Threat Inspection Report</strong><br><br>`;
    html += `<strong>File:</strong> <code>${escHtml(report.filename)}</code> (${report.sizeFormatted || `${report.fileSizeBytes} B`})<br>`;
    html += `<strong>Verdict:</strong> <span style="font-weight:700; color:${report.isMalicious ? '#ef4444' : report.isSuspicious ? '#f59e0b' : '#22c55e'};">${report.verdict}</span> (Risk Score: <strong>${report.riskScore}/100</strong> | Confidence: <strong>${((report.confidence || 0.8) * 100).toFixed(0)}%</strong>)<br>`;
    html += `<strong>Format:</strong> ${escHtml(report.identification?.format || "Unknown")} | <strong>Entropy:</strong> ${report.entropy?.score || 0}/8.0 (${escHtml(report.entropy?.tier || "Normal")})<br>`;
    html += `<strong>Signature:</strong> ${escHtml(report.signature?.status || "Unsigned")} (${escHtml(report.signature?.publisher || "Unknown")})<br>`;
    html += `<strong>ML Model:</strong> ${((report.ml?.malicious_probability || 0) * 100).toFixed(0)}% Malicious Probability [${escHtml(report.ml?.classification || "BENIGN")}]<br>`;
    html += `<strong>SHA-256:</strong> <code style="font-size:9.5px;">${report.hashes?.sha256}</code><br>`;

    if (report.yaraMatches && report.yaraMatches.length > 0) {
        html += `<br><strong>🎯 YARA Matches (${report.yaraMatches.length}):</strong><br>`;
        report.yaraMatches.forEach(y => {
            html += `<span style="display:inline-block; margin:2px; padding:2px 6px; background:#4338ca; border-radius:3px; font-size:10px; color:#fff;">${escHtml(y.rule)} [${escHtml(y.severity)}]</span>`;
        });
        html += `<br>`;
    }

    if (report.evidenceBreakdown && report.evidenceBreakdown.length > 0) {
        html += `<br><strong>🚨 Evidence Factors:</strong><br>`;
        report.evidenceBreakdown.forEach(f => {
            html += `<div style="margin-top:4px; padding:4px 8px; background:rgba(239,68,68,0.12); border-left:3px solid #ef4444; border-radius:4px; font-size:11px;">
                <strong>${escHtml(f.factor)}:</strong> <span style="color:${f.points > 0 ? '#ef4444' : '#22c55e'}; font-weight:bold;">${f.points > 0 ? '+' : ''}${f.points} pts</span>
            </div>`;
        });
    }

    if (report.remediation?.remediationCommand) {
        html += `<br><strong>🛠️ Remediation Command (${report.platform}):</strong><br><code style="color:#38bdf8; font-size:10px;">${escHtml(report.remediation.remediationCommand)}</code><br>`;
    }

    if (report.aiExplanation) {
        html += `<br>${formatAIResponse(report.aiExplanation)}`;
    }

    appendMessage('bot', html);
}

async function runDeepSystemScan() {
    appendMessage('user', '🔍 Perform deep inch-by-inch file system security audit');
    showTyping(true, '⚡ FlotBot is performing inch-by-inch file system audit...');
    
    try {
        const report = await window.flotbot.deepScanSystem();
        showTyping(false);

        let html = `<strong>🔍 Deep File System Audit Report</strong><br><br>`;
        html += `${escHtml(report.honestReportSummary)}<br><br>`;
        html += `📊 <strong>Audit Stats:</strong> Scanned <strong>${report.totalScanned}</strong> files | Clean: <strong>${report.cleanFiles}</strong> | Flagged: <strong>${report.threatsFound}</strong><br>`;

        if (report.suspiciousFiles && report.suspiciousFiles.length > 0) {
            html += `<br><strong>⚠️ Flagged Items & Solutions:</strong><br>`;
            report.suspiciousFiles.forEach((file, idx) => {
                html += `<div style="margin-top:6px; padding:6px; background:rgba(239,68,68,0.1); border-left:3px solid #ef4444; border-radius:4px;">`;
                html += `<strong>#${idx + 1} File:</strong> <code>${escHtml(file.filename)}</code><br>`;
                html += `<strong>Path:</strong> <code>${escHtml(file.path)}</code><br>`;
                html += `<strong>Risk:</strong> ${escHtml(file.risks.join(', '))}<br>`;
                
                const fix = report.remediationSteps[idx];
                if (fix) {
                    html += `<strong>🛠️ Step-by-Step Fix Command (${report.os}):</strong><br>`;
                    html += `<code style="color:#38bdf8;">${escHtml(fix.command)}</code>`;
                }
                html += `</div>`;
            });
        }

        appendMessage('bot', html);
    } catch (err) {
        showTyping(false);
        appendMessage('bot', `⚠️ Deep scan failed: ${escHtml(err.message)}`);
    }
}

// ─── RESET ALERT STATE ────────────────────────────────────────────────────────

function resetAlertsState() {
    alertCount       = 0;
    latestAlert      = null;
    lastFocusedAlert = null;
    if (bubbleBadge)  { bubbleBadge.textContent = ''; bubbleBadge.classList.remove('show'); }
    if (bubbleInner)  { bubbleInner.classList.remove('threat'); }
    if (alertsBanner) { alertsBanner.className = 'alerts-banner-hidden'; }
    if (statusCard && statusText && statusDesc) {
        statusCard.className = 'status-card secure';
        statusText.textContent = 'SECURE';
        if (statusIcon) statusIcon.textContent = '🛡️';
        statusDesc.textContent = 'No threats detected';
    }
}

// ─── SEND MESSAGE  (with streaming) ──────────────────────────────────────────

/**
 * sendMessage()
 * ─────────────────────────────────────────────────────────────
 * 1. Captures input and shows user bubble immediately.
 * 2. Creates an empty bot bubble and subscribes to ai-token IPC events.
 * 3. Each token is appended to the live bubble — user sees words appear in real-time.
 * 4. When the IPC handle resolves, cleanup is done.
 * 5. On error, the bubble shows an error message.
 */
async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text || _isStreaming) return;

    if (/\b(screen|sites|browser|tabs|visited|opened)\b/i.test(text) && !hasScreenConsent) {
        const allowed = await requestScreenConsent(text);
        if (!allowed) {
            appendMessage('user', escHtml(text));
            appendMessage('bot', '⚠️ <strong>Screen Access Denied:</strong> FlotBot respects your privacy. Screen analysis was cancelled.');
            chatInput.value = '';
            chatInput.style.height = 'auto';
            sendBtn.disabled = true;
            return;
        }
    }

    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled  = true;

    appendMessage('user', escHtml(text));
    _startStream();

    try {
        const [alerts, windows] = await Promise.all([
            window.flotbot.getAlerts().catch(() => []),
            window.flotbot.getOpenWindows().catch(() => [])
        ]);

        const context = { alerts, windows, focusedAlert: lastFocusedAlert };
        lastFocusedAlert = null; // Clear so subsequent chat messages don't stick to this alert!

        let streamBubble = null;

        // Subscribe to streaming tokens — create bot bubble on first token
        const unsub = window.flotbot.onAIToken((token) => {
            if (!streamBubble) {
                showTyping(false);
                streamBubble = _createStreamingBubble();
            }
            _appendToken(streamBubble, token);
        });
        _streamUnsubscribe = unsub;

        // Kick off the IPC call (tokens will push independently)
        const result = await window.flotbot.sendChat(sessionId, text, context, 'floating');

        // Unsubscribe tokens — the promise resolved, we have the full text
        unsub();
        _streamUnsubscribe = null;

        if (!streamBubble) {
            showTyping(false);
            streamBubble = _createStreamingBubble();
        }

        // If the bubble is empty (provider didn't stream — e.g. mock or cache),
        // fill it with the final text from the resolved promise
        if (streamBubble._rawText.trim().length === 0) {
            if (result && result.success && result.reply) {
                streamBubble.innerHTML = formatAIResponse(result.reply);
            } else {
                const errMsg = (result && result.error)
                    ? escHtml(result.error)
                    : 'No response received. Check that your AI provider is configured in <code>.env</code>.';
                streamBubble.innerHTML = `<span style="color:hsl(40,90%,65%)">⚠️ ${errMsg}</span>`;
            }
        } else {
            // Streaming completed — re-render final text with markdown formatting
            streamBubble.innerHTML = formatAIResponse(streamBubble._rawText);
        }

        streamBubble.classList.remove('streaming');
        addCopyButton(streamBubble);
        saveChatHistory('bot', streamBubble.innerHTML);

        // Update latency pill from result
        if (result?.latencyMs && latencyPill) {
            const ms   = result.latencyMs;
            const fast = ms < 1500;
            const med  = ms < 4000;
            latencyPill.textContent = `${ms}ms`;
            latencyPill.className   = `latency-pill ${fast ? "fast" : med ? "medium" : "slow"}`;
            latencyPill.title       = `Last AI response: ${ms}ms via ${result.provider || '?'}`;
            // Also refresh badge
            refreshAIStatus();
        }

    } catch (err) {
        if (_streamUnsubscribe) { _streamUnsubscribe(); _streamUnsubscribe = null; }
        if (_currentStreamBubble) {
            _currentStreamBubble.innerHTML = `<span style="color:hsl(0,70%,60%)">❌ Error: ${escHtml(err.message)}</span>`;
        } else {
            appendMessage('bot', `<span style="color:hsl(0,70%,60%)">❌ Error: ${escHtml(err.message)}</span>`);
        }

    } finally {
        _endStream();
    }
}

// ─── STREAMING HELPERS & STOP CONTROLS ─────────────────────────────────────────
const SEND_ICON_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>`;
const STOP_ICON_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="12" height="12" rx="2" fill="white" /></svg>`;

function _startStream() {
    _isStreaming         = true;
    _currentStreamBubble = null;
    showTyping(true);

    if (sendBtn) {
        sendBtn.disabled  = false;
        sendBtn.title     = "Stop AI Generation";
        sendBtn.classList.add("btn-stop");
        sendBtn.innerHTML = STOP_ICON_SVG;
    }
}

function _endStream() {
    _isStreaming         = false;
    _currentStreamBubble = null;
    if (_streamUnsubscribe) {
        _streamUnsubscribe();
        _streamUnsubscribe = null;
    }
    showTyping(false);

    if (sendBtn) {
        sendBtn.classList.remove("btn-stop");
        sendBtn.title     = "Send Message";
        sendBtn.innerHTML = SEND_ICON_SVG;
        sendBtn.disabled  = chatInput.value.trim().length === 0;
    }
    scrollToBottom();
}

function stopGeneration() {
    if (!_isStreaming) return;
    if (_currentStreamBubble) {
        _currentStreamBubble.classList.remove('streaming');
        if (_currentStreamBubble._rawText) {
            _currentStreamBubble.innerHTML = formatAIResponse(_currentStreamBubble._rawText) + ' <em style="color:var(--c-muted); font-size:10px;">[Stopped by user]</em>';
        } else {
            _currentStreamBubble.innerHTML = '<em style="color:var(--c-muted); font-size:10px;">🛑 Generation stopped by user.</em>';
        }
    }
    _endStream();
}

/**
 * Creates a bot message bubble in the DOM and returns the inner bubble div.
 * The bubble div has a special _rawText property for accumulating raw text.
 */
function _createStreamingBubble() {
    // Typing loader remains active until first streaming token arrives in _appendToken()
    const msg      = document.createElement('div');
    msg.className  = 'message bot';

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'bubble streaming';
    bubbleEl._rawText  = '';   // custom property for raw token accumulation

    const timeEl       = document.createElement('span');
    timeEl.className   = 'time';
    timeEl.textContent = formatTime(new Date());

    msg.appendChild(bubbleEl);
    msg.appendChild(timeEl);
    messagesEl.appendChild(msg);

    _currentStreamBubble = bubbleEl;
    scrollToBottom();
    return bubbleEl;
}

/**
 * Appends a streaming token to the live bubble.
 * Shows raw text with a blinking cursor while streaming.
 */
function _appendToken(bubbleEl, token) {
    if (!bubbleEl) return;

    // Hide the typing loader on first token
    showTyping(false);

    bubbleEl._rawText += token;

    // Render raw text (no markdown yet — we do full markdown render at end)
    // We show escaped text + a blinking cursor
    const escaped = bubbleEl._rawText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');

    bubbleEl.innerHTML = escaped + '<span class="stream-cursor">▊</span>';
    scrollToBottom();
}

// ─── COPY TO CLIPBOARD HELPER ─────────────────────────────────────────────────

const COPY_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const CHECK_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block; color:#22c55e;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

function addCopyButton(bubbleEl) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = COPY_ICON_SVG;
    copyBtn.title = 'Copy message to clipboard';
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const clone = bubbleEl.cloneNode(true);
        const btn = clone.querySelector('.copy-btn');
        if (btn) btn.remove();
        const actionChips = clone.querySelector('.msg-actions');
        if (actionChips) actionChips.remove();
        const textToCopy = clone.innerText.trim();
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.innerHTML = CHECK_ICON_SVG;
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.innerHTML = COPY_ICON_SVG;
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error("Clipboard copy failed:", err);
        });
    });
    bubbleEl.insertBefore(copyBtn, bubbleEl.firstChild);
}

// ─── CHAT HISTORY PERSISTENCE ─────────────────────────────────────────────────
const CHAT_STORAGE_KEY = 'flotbot_chat_history_v1';

function saveChatHistory(role, htmlContent) {
    try {
        const stored = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
        stored.push({ role, htmlContent, timeStr: formatTime(new Date()) });
        if (stored.length > 60) stored.shift();
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(stored));
    } catch { /* ignore */ }
}

function loadSavedChatHistory() {
    try {
        const stored = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
        if (stored.length === 0) return;

        stored.forEach(item => {
            const msg = document.createElement('div');
            msg.className = `message ${item.role}`;
            if (item.role === 'alert') msg.classList.add('alert-msg');

            const bubbleEl = document.createElement('div');
            bubbleEl.className = 'bubble';
            bubbleEl.innerHTML = item.htmlContent;

            if (item.role === 'bot' || item.role === 'user') {
                addCopyButton(bubbleEl);
            }

            const timeEl = document.createElement('span');
            timeEl.className = 'time';
            timeEl.textContent = item.timeStr || formatTime(new Date());

            msg.appendChild(bubbleEl);
            msg.appendChild(timeEl);
            messagesEl.appendChild(msg);
        });
        scrollToBottom();
    } catch { /* ignore */ }
}

// Automatically load chat history on initialize
loadSavedChatHistory();

// ─── APPEND MESSAGE ────────────────────────────────────────────────────────────

function appendMessage(role, htmlContent, actions, skipSave = false) {
    const msg      = document.createElement('div');
    msg.className  = `message ${role}`;
    if (role === 'alert') msg.classList.add('alert-msg');

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'bubble';
    bubbleEl.innerHTML = htmlContent;

    if (actions && actions.length > 0) {
        const actionsEl = document.createElement('div');
        actionsEl.className = 'msg-actions';
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className   = `action-chip ${action.type}`;
            btn.textContent = action.label;
            btn.addEventListener('click', action.handler);
            actionsEl.appendChild(btn);
        });
        bubbleEl.appendChild(actionsEl);
    }

    // Add copy button for bot & user messages
    if (role === 'bot' || role === 'user') {
        addCopyButton(bubbleEl);
    }

    const timeEl       = document.createElement('span');
    timeEl.className   = 'time';
    timeEl.textContent = formatTime(new Date());

    msg.appendChild(bubbleEl);
    msg.appendChild(timeEl);
    messagesEl.appendChild(msg);
    scrollToBottom();

    if (!skipSave) {
        saveChatHistory(role, htmlContent);
    }
}

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────

function showTyping(show, providerLabel) {
    if (!typingLoader) return;
    if (show) {
        if (messagesEl) {
            messagesEl.appendChild(typingLoader);
        }
        typingLoader.className = '';
        if (typingProvLabel) {
            typingProvLabel.textContent = providerLabel || '⚡ FlotBot is analyzing threat telemetry...';
        }
        scrollToBottom();
    } else {
        typingLoader.className = 'typing-loader-hidden';
    }
}

// ─── SCROLL / TIME / ESCAPE ────────────────────────────────────────────────────

function scrollToBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
}

function formatTime(d) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escHtml(str) {
    return (str || '')
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;');
}

function formatAIResponse(text) {
    if (!text) return '';

    // Escape raw HTML first
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // 1. Code blocks: ```javascript ... ```
    html = html.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/g, (match, codeContent) => {
        const cleanCode = codeContent.trim();
        return `<div class="code-block-container" style="position:relative; margin:8px 0;">` +
               `<pre style="background:hsla(220,30%,8%,0.95); border:1px solid hsla(210,70%,55%,0.15); border-radius:6px; padding:10px 40px 10px 10px; font-family:monospace; font-size:11px; overflow-x:auto; user-select:text; -webkit-user-select:text; white-space:pre-wrap; word-break:break-all; color:#a5d6ff; margin:0;">${cleanCode}</pre>` +
               `<button class="code-block-copy-btn" onclick="navigator.clipboard.writeText(this.previousElementSibling.innerText.trim()).then(() => { this.innerHTML = CHECK_ICON_SVG; this.classList.add('copied'); setTimeout(() => { this.innerHTML = COPY_ICON_SVG; this.classList.remove('copied'); }, 2000) })" style="position:absolute; top:5px; right:5px; background:hsla(220,20%,15%,0.9); border:1px solid var(--c-border); border-radius:4px; color:var(--c-muted-2); width:22px; height:22px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; opacity:0; transition:opacity 0.2s, background 0.15s, color 0.15s; user-select:none; -webkit-user-select:none; padding:0;">${COPY_ICON_SVG}</button>` +
               `</div>`;
     });

    // 2. Inline code: `code`
    html = html.replace(/`([^`]+)`/g, (match, codeText) => {
        const clean = codeText.trim();
        return `<code onclick="navigator.clipboard.writeText(this.innerText.trim()).then(() => { const oldBg = this.style.background; const oldColor = this.style.color; this.style.background = 'var(--c-green)'; this.style.color = '#ffffff'; setTimeout(() => { this.style.background = oldBg; this.style.color = oldColor; }, 1000) })" title="Click to copy command" style="background:hsla(220,25%,20%,0.9); padding:2px 5px; border-radius:4px; font-size:10.5px; font-family:monospace; color:#ff7b72; cursor:pointer; transition:background 0.2s, color 0.2s; user-select:text; -webkit-user-select:text; display:inline-block; max-width:100%; vertical-align:middle; overflow-x:auto;">${clean}</code>`;
    });

    // 3. Bold text: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 4. Headings: ### Title or ## Title or # Title
    // We map headings to bold blocks with cyan color, clear spacing, and custom emojis based on contents
    html = html.replace(/^(###|##|#)\s+(.+)$/gm, (match, hashes, titleText) => {
        let cleanTitle = titleText.trim();
        let emoji = '🔹';

        const lower = cleanTitle.toLowerCase();
        if (lower.includes('threat') || lower.includes('alert') || lower.includes('warning') || lower.includes('danger')) {
            emoji = '🚨';
        } else if (lower.includes('recommend') || lower.includes('action') || lower.includes('mitigat') || lower.includes('fix')) {
            emoji = '🛡️';
        } else if (lower.includes('process') || lower.includes('running') || lower.includes('program')) {
            emoji = '⚙️';
        } else if (lower.includes('network') || lower.includes('socket') || lower.includes('ip') || lower.includes('port')) {
            emoji = '🌐';
        } else if (lower.includes('file') || lower.includes('folder') || lower.includes('directory')) {
            emoji = '📂';
        } else if (lower.includes('spec') || lower.includes('hardware') || lower.includes('cpu') || lower.includes('ram')) {
            emoji = '🖥️';
        } else if (lower.includes('persistence') || lower.includes('registry') || lower.includes('autostart')) {
            emoji = '🔒';
        } else if (lower.includes('summary') || lower.includes('overview') || lower.includes('conclusion')) {
            emoji = '📝';
        } else if (lower.includes('detail') || lower.includes('technical') || lower.includes('info')) {
            emoji = '🔍';
        } else if (lower.includes('command') || lower.includes('terminal') || lower.includes('run') || lower.includes('script')) {
            emoji = '💻';
        }

        // Strip any emoji already in the title to avoid duplication
        cleanTitle = cleanTitle.replace(/^[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();

        return `<span style="display:block; font-size:13px; font-weight:700; color:var(--c-cyan); margin-top:12px; margin-bottom:6px;">${emoji} ${cleanTitle}</span>`;
    });

    // 5. Classic uppercase headings
    html = html
        .replace(/THREAT DETECTED/g,    '<strong style="color:hsl(0,80%,70%); display:block; font-size:13px; margin-top:10px;">🚨 THREAT DETECTED</strong>')
        .replace(/RECOMMENDED ACTION/g, '<strong style="color:hsl(40,90%,65%); display:block; font-size:13px; margin-top:10px;">🛡️ RECOMMENDED ACTION</strong>')
        .replace(/MITIGATION/g,         '<strong style="color:hsl(140,70%,55%); display:block; font-size:13px; margin-top:10px;">✅ MITIGATION</strong>')
        .replace(/SCORE:\s*(\d+)/g,     '<strong style="color:hsl(210,90%,75%);">📊 Score: $1/100</strong>');

    // 6. Lists
    // Bullet list items starting with - or * or •
    html = html.replace(/^[-*•]\s+(.+)$/gm, '<div style="margin-left:12px; margin-top:4px; margin-bottom:4px; display:list-item; list-style-type:disc; padding-left:4px;">$1</div>');
    // Numbered lists starting with digits
    html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<div style="margin-left:12px; margin-top:4px; margin-bottom:4px; display:list-item; list-style-type:decimal; padding-left:4px;">$2</div>');

    // 7. Linebreaks (excluding inside pre tags)
    // We split by <pre> blocks so we don't accidentally insert <br> inside code formatting
    const parts = html.split(/(<pre[\s\S]*?<\/pre>)/);
    for (let i = 0; i < parts.length; i++) {
        if (!parts[i].startsWith('<pre')) {
            parts[i] = parts[i].replace(/\n/g, '<br>');
        }
    }
    html = parts.join('');

    return html;
}

// ─── REAL-TIME ALERT LISTENER ─────────────────────────────────────────────────

window.flotbot.onAlert((alert) => {
    alertCount++;
    latestAlert      = alert;
    alertSessionStart = Date.now();
    sessionChatLog   = [];

    bubbleBadge.textContent = alertCount > 9 ? '9+' : alertCount;
    bubbleBadge.classList.add('show');
    bubbleInner.classList.add('threat');
    updateStatus(alert);

    if (isExpanded) showAlertBanner(alert);

    const actions = [];

    actions.push({
        type:    'explain',
        label:   '🔍 Explain',
        handler: () => explainAlert(alert)
    });

    if (alert.evidence && alert.evidence.pid) {
        actions.push({
            type:    'block',
            label:   `🚫 Terminate PID ${alert.evidence.pid}`,
            handler: () => blockProcess(alert.evidence.pid, alert.title)
        });
    }

    if (alert.evidence && alert.evidence.remoteAddress) {
        actions.push({
            type:    'block',
            label:   `🔒 Block IP ${alert.evidence.remoteAddress}`,
            handler: () => blockIp(alert.evidence.remoteAddress)
        });
    }

    appendMessage('bot',
        `<strong style="color:hsl(0,80%,70%);">⚠️ ${escHtml(alert.title)}</strong><br>` +
        `<span style="color:hsl(0,70%,60%)">[${escHtml(alert.severity)}]</span> ${escHtml(alert.description || '')}`,
        actions
    );
});



// ─── ALERT BANNER ─────────────────────────────────────────────────────────────

function showAlertBanner(alert) {
    if (!alertsBanner || !bannerText) return;
    bannerText.innerHTML = `<strong>[${escHtml(alert.severity)}]</strong> ${escHtml(alert.title)}`;
    alertsBanner.className = '';
    alertsBanner.style.display = '';
}

btnBannerDismiss && btnBannerDismiss.addEventListener('click', async () => {
    if (latestAlert) {
        try { await window.flotbot.ackAlert(latestAlert.id); _logAlertAction("DISMISSED", "", ""); }
        catch (err) { console.error("Failed to acknowledge alert:", err); }
    }
    resetAlertsState();
});

btnBannerExplain && btnBannerExplain.addEventListener('click', () => {
    if (latestAlert) explainAlert(latestAlert);
    if (alertsBanner) alertsBanner.className = 'alerts-banner-hidden';
});

btnBannerBlock && btnBannerBlock.addEventListener('click', () => {
    if (latestAlert && latestAlert.evidence) {
        const pid = latestAlert.evidence.pid;
        const ip  = latestAlert.evidence.remoteAddress;
        if (pid) blockProcess(pid, latestAlert.title);
        else if (ip) blockIp(ip);
    }
    if (alertsBanner) alertsBanner.className = 'alerts-banner-hidden';
});

// ─── STATUS CARD ──────────────────────────────────────────────────────────────

function updateStatus(alert) {
    if (!statusCard || !statusText || !statusDesc) return;
    if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
        statusCard.className = 'status-card critical';
        statusText.textContent = 'CRITICAL THREAT';
        if (statusIcon) statusIcon.textContent = '🚨';
    } else {
        statusCard.className = 'status-card warning';
        statusText.textContent = 'WARNING';
        if (statusIcon) statusIcon.textContent = '⚠️';
    }
    statusDesc.textContent = alert.title;
}

// ─── BLOCK PROCESS ────────────────────────────────────────────────────────────

async function blockProcess(pid, name) {
    appendMessage('bot', `🛡️ Terminating process PID ${pid} (${escHtml(name || '')})...`);
    try {
        const result = await window.flotbot.blockProcess(parseInt(pid, 10));
        if (result && result.success) {
            appendMessage('bot', `<span style="color:hsl(140,70%,55%)">✅ Success:</span> ${escHtml(result.message)}`);
        } else {
            appendMessage('bot', `<span style="color:hsl(0,70%,60%)">❌ Failed:</span> ${escHtml(result.error)}`);
        }
        if (latestAlert) _logAlertAction("TERMINATED", String(pid), latestAlert.evidence?.exePath || "");
    } catch (err) {
        appendMessage('bot', `<span style="color:hsl(0,70%,60%)">❌ Error:</span> ${escHtml(err.message)}`);
    }
}

// ─── BLOCK IP ─────────────────────────────────────────────────────────────────

async function blockIp(ip) {
    appendMessage('bot', `🔒 Blocking IP <code>${escHtml(ip)}</code> via firewall...`);
    try {
        const result = await window.flotbot.blockIp(ip);
        if (result && result.success) {
            appendMessage('bot', `<span style="color:hsl(140,70%,55%)">✅ Success:</span> ${escHtml(result.message)}`);
        } else {
            appendMessage('bot', `<span style="color:hsl(0,70%,60%)">❌ Failed:</span> ${escHtml(result.error)}`);
        }
    } catch (err) {
        appendMessage('bot', `<span style="color:hsl(0,70%,60%)">❌ Error:</span> ${escHtml(err.message)}`);
    }
}

// ─── EXPLAIN ALERT  (streaming) ───────────────────────────────────────────────

async function explainAlert(alert) {
    if (_isStreaming) return;

    lastFocusedAlert = alert;
    if (!isExpanded) expandPanel();

    appendMessage('bot', `🔍 Analyzing: <strong>${escHtml(alert.title)}</strong>...`);
    _startStream();
    showTyping(true, 'Generating explanation...');

    try {
        // Subscribe to streaming tokens first
        const streamBubble = _createStreamingBubble();
        const unsub = window.flotbot.onAIToken((token) => {
            _appendToken(streamBubble, token);
        });
        _streamUnsubscribe = unsub;

        // Call explain IPC
        const result = await window.flotbot.explainAlert(alert);

        unsub();
        _streamUnsubscribe = null;

        if (streamBubble._rawText.trim().length === 0) {
            if (result && result.success && result.explanation) {
                streamBubble.innerHTML = formatAIResponse(result.explanation);
            } else {
                const errText = (result && (result.error || result.explanation))
                    ? (result.error || result.explanation)
                    : 'AI model did not return an explanation.';
                streamBubble.innerHTML = `<span style="color:hsl(0,70%,60%)">❌ ${escHtml(errText)}</span>`;
            }
        } else {
            streamBubble.innerHTML = formatAIResponse(streamBubble._rawText);
        }

        streamBubble.classList.remove('streaming');
        addCopyButton(streamBubble);

        if (result?.latencyMs && latencyPill) {
            const ms = result.latencyMs;
            latencyPill.textContent = `${ms}ms`;
            latencyPill.className   = `latency-pill ${ms < 1500 ? "fast" : ms < 4000 ? "medium" : "slow"}`;
        }

    } catch (err) {
        if (_streamUnsubscribe) { _streamUnsubscribe(); _streamUnsubscribe = null; }
        if (_currentStreamBubble) {
            _currentStreamBubble.innerHTML = `<span style="color:hsl(0,70%,60%)">❌ Error: ${escHtml(err.message)}</span>`;
        } else {
            appendMessage('bot', `<span style="color:hsl(0,70%,60%)">❌ Error: ${escHtml(err.message)}</span>`);
        }
    } finally {
        _endStream();
    }
}

// ─── ALERT HISTORY TELEMETRY ──────────────────────────────────────────────────

function _logAlertAction(actionTaken, pid, exePath) {
    if (!latestAlert || !window.flotbot.logAlertAction) return;
    const responseTimeMs = alertSessionStart ? Date.now() - alertSessionStart : null;
    window.flotbot.logAlertAction({
        alertId:       latestAlert.id || "",
        ruleTriggered: latestAlert.rule || latestAlert.source || "",
        pid:           pid || latestAlert.evidence?.pid || "",
        exePath:       exePath || latestAlert.evidence?.exePath || "",
        remoteIp:      latestAlert.evidence?.remoteAddress || latestAlert.evidence?.remoteAddr || "",
        severity:      latestAlert.severity || "",
        actionTaken,
        responseTimeMs,
        chatTranscript: sessionChatLog.slice()
    }).catch(() => {});
}

// ─── STARTUP ──────────────────────────────────────────────────────────────────

showTyping(false);
