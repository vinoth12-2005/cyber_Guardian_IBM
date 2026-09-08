const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const ROOT_DIR = path.resolve(__dirname, "..");
const MAIN_ROOT_DIR = path.resolve(ROOT_DIR, "..");
const ENV_FILE = path.join(ROOT_DIR, ".env");
const MAIN_ENV_FILE = path.join(MAIN_ROOT_DIR, ".env");
const ENV_EXAMPLE = path.join(ROOT_DIR, ".env.example");
const IS_WIN = process.platform === "win32";

// Load environment variables early so child processes inherit all keys
try {
    const dotenv = require("dotenv");
    dotenv.config({ path: ENV_FILE });
    dotenv.config({ path: MAIN_ENV_FILE });
    dotenv.config();
} catch (e) {}

console.log("\n=======================================================");
console.log(" 🛡️  FlotBot Cross-Platform Automated Setup & Launcher");
console.log("=======================================================\n");

function runCmd(cmd, options = {}) {
    try {
        return execSync(cmd, { encoding: "utf8", stdio: "pipe", ...options }).trim();
    } catch (err) {
        return null;
    }
}

async function checkOllamaHttp() {
    return new Promise((resolve) => {
        const req = http.get("http://127.0.0.1:11434/api/tags", { timeout: 3000 }, (res) => {
            let body = "";
            res.on("data", chunk => body += chunk);
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ online: true, models: parsed.models || [] });
                } catch {
                    resolve({ online: true, models: [] });
                }
            });
        });
        req.on("error", () => resolve({ online: false, models: [] }));
        req.on("timeout", () => { req.destroy(); resolve({ online: false, models: [] }); });
    });
}

function checkHttpUrl(targetUrl, timeoutMs = 2000) {
    return new Promise((resolve) => {
        try {
            const u = new URL(targetUrl);
            const req = http.get({
                hostname: u.hostname,
                port: u.port,
                path: u.pathname,
                timeout: timeoutMs,
            }, (res) => {
                resolve(res.statusCode < 500);
            });
            req.on("error", () => resolve(false));
            req.on("timeout", () => { req.destroy(); resolve(false); });
        } catch {
            resolve(false);
        }
    });
}

async function main() {
    // Step 1: Ensure .env file exists
    console.log("[1/5] Checking environment configuration (.env)...");
    if (!fs.existsSync(ENV_FILE)) {
        if (fs.existsSync(ENV_EXAMPLE)) {
            fs.copyFileSync(ENV_EXAMPLE, ENV_FILE);
            console.log("  ✔ Created .env from .env.example");
        } else {
            fs.writeFileSync(ENV_FILE, "OLLAMA_HOST=http://127.0.0.1:11434\nOLLAMA_MODEL=llama3.1\nAI_PRIVACY_MODE=true\n");
            console.log("  ✔ Created default .env file");
        }
    } else {
        console.log("  ✔ .env file exists (Skipping creation)");
    }

    // Step 2: Check NPM dependencies
    console.log("\n[2/5] Checking Node.js dependencies...");

    // Check Root dependencies (Vite, React, Express, etc.)
    const rootNodeModules = path.join(MAIN_ROOT_DIR, "node_modules");
    if (!fs.existsSync(rootNodeModules) || !fs.existsSync(path.join(rootNodeModules, "vite"))) {
        console.log("  ➜ Root project dependencies missing. Installing npm packages...");
        try {
            execSync("npm install", { cwd: MAIN_ROOT_DIR, stdio: "inherit" });
            console.log("  ✔ Root project dependencies installed successfully.");
        } catch (e) {
            console.error("  ❌ Root npm install failed:", e.message);
        }
    } else {
        console.log("  ✔ Root project npm dependencies present");
    }

    // Check FlotBot dependencies (Electron, etc.)
    const nodeModulesPath = path.join(ROOT_DIR, "node_modules");
    if (!fs.existsSync(nodeModulesPath) || !fs.existsSync(path.join(nodeModulesPath, "electron"))) {
        console.log("  ➜ FlotBot dependencies missing or incomplete. Installing npm packages...");
        try {
            execSync("npm install", { cwd: ROOT_DIR, stdio: "inherit" });
            console.log("  ✔ FlotBot dependencies installed successfully.");
        } catch (e) {
            console.error("  ❌ FlotBot npm install failed:", e.message);
        }
    } else {
        console.log("  ✔ All FlotBot npm dependencies present");
    }

    // Ensure Electron binary was actually downloaded (can be skipped by npm allow-scripts / ignore-scripts)
    const electronDist = path.join(nodeModulesPath, "electron", "dist");
    const electronInstallScript = path.join(nodeModulesPath, "electron", "install.js");
    if (!fs.existsSync(electronDist) && fs.existsSync(electronInstallScript)) {
        console.log("  ➜ Electron binary missing. Running electron install script...");
        try {
            execSync(`node "${electronInstallScript}"`, { cwd: path.join(nodeModulesPath, "electron"), stdio: "inherit" });
            console.log("  ✔ Electron binary downloaded successfully.");
        } catch (e) {
            console.warn("  ⚠️ Could not download electron binary:", e.message);
        }
    }

    // Step 3: Check Ollama installation
    console.log("\n[3/5] Checking Ollama AI service...");
    const ollamaVer = runCmd("ollama --version");
    if (ollamaVer) {
        console.log(`  ✔ Ollama installed: ${ollamaVer} (Skipping install)`);
    } else {
        console.log("  ⚠️  Ollama is not detected on this system.");
        const platform = process.platform;
        if (platform === "linux") {
            console.log("  ➜ Auto-installing Ollama on Linux via official installer...");
            try {
                execSync("curl -fsSL https://ollama.com/install.sh | sh", { stdio: "inherit" });
                console.log("  ✔ Ollama installed successfully!");
            } catch (e) {
                console.error("  ❌ Failed to auto-install Ollama. Please install manually from https://ollama.com");
            }
        } else if (platform === "darwin") {
            console.log("  ➜ macOS detected. Attempting Homebrew installation or download...");
            const brewCheck = runCmd("which brew");
            if (brewCheck) {
                execSync("brew install ollama", { stdio: "inherit" });
            } else {
                console.log("  ➜ Please download Ollama for macOS from: https://ollama.com/download/mac");
            }
        } else if (platform === "win32") {
            console.log("  ➜ Windows detected. Please download Ollama Setup from: https://ollama.com/download/windows");
        }
    }

    // Step 4: Check if Ollama service is running & pull Llama 3.1 model if needed
    console.log("\n[4/5] Checking Ollama server status & Llama 3.1 model...");
    let httpStatus = await checkOllamaHttp();
    if (!httpStatus.online) {
        console.log("  ➜ Ollama service not responding at http://127.0.0.1:11434. Starting background service...");
        if (runCmd("ollama --version")) {
            const ollamaProcess = spawn("ollama", ["serve"], { detached: true, stdio: "ignore" });
            ollamaProcess.unref();
            // Wait for service to initialize
            for (let i = 0; i < 5; i++) {
                await new Promise(r => setTimeout(r, 1000));
                httpStatus = await checkOllamaHttp();
                if (httpStatus.online) break;
            }
        }
    }

    if (httpStatus.online) {
        console.log("  ✔ Ollama local server is active (http://127.0.0.1:11434)");
        const installedModels = httpStatus.models.map(m => m.name);
        if (installedModels.length > 0) {
            // Find preferred model or default to first installed model (prioritize high-speed models)
            let selectedModel = installedModels.find(m => m.includes("0.5b")) ||
                                installedModels.find(m => m.includes("1b")) ||
                                installedModels.find(m => m.includes("qwen")) ||
                                installedModels.find(m => m.includes("llama")) ||
                                installedModels[0];
            
            console.log(`  ✔ Found installed local model: "${selectedModel}" (Skipping download!)`);
            console.log(`    Available local models: ${installedModels.join(", ")}`);
            
            // Update .env with the active installed model
            if (fs.existsSync(ENV_FILE)) {
                let envContent = fs.readFileSync(ENV_FILE, "utf8");
                if (envContent.includes("OLLAMA_MODEL=")) {
                    envContent = envContent.replace(/OLLAMA_MODEL=.*/g, `OLLAMA_MODEL=${selectedModel}`);
                } else {
                    envContent += `\nOLLAMA_MODEL=${selectedModel}\n`;
                }
                fs.writeFileSync(ENV_FILE, envContent);
            }
        } else {
            console.log("  ➜ No models found in Ollama. Pulling lightweight model 'qwen2.5:0.5b' (~390MB)...");
            try {
                execSync("ollama pull qwen2.5:0.5b", { stdio: "inherit" });
                console.log("  ✔ Model pulled successfully!");
            } catch (e) {
                console.warn("  ⚠️ Could not auto-pull model. Ollama will run with fallback.");
            }
        }
    } else {
        console.warn("  ⚠️ Could not connect to local Ollama server. Starting FlotBot in offline fallback mode.");
    }

    // Step 5: Launch Unified CyberGuardian Ecosystem & FlotBot
    if (process.argv.includes("--start") || process.argv.includes("-s") || process.argv.length <= 2) {
        const childProcesses = [];

        console.log("\n[5/5] 🚀 Starting CyberGuardian Enterprise Ecosystem...\n");

        // 5a. Start Unified Express Backend Server (Port 5000)
        const isBackendUp = await checkHttpUrl("http://127.0.0.1:5000/health", 1000);
        if (!isBackendUp) {
            console.log("  ➜ [1/3] Starting Unified Backend API Server on Port 5000...");
            const serverProc = spawn("node", ["server/server.js"], {
                cwd: MAIN_ROOT_DIR,
                stdio: "inherit",
                shell: IS_WIN,
                env: { ...process.env, FORCE_COLOR: "true" }
            });
            serverProc.on("error", (err) => console.error("  ❌ Backend server error:", err.message));
            childProcesses.push(serverProc);
        } else {
            console.log("  ✔ [1/3] Backend API Server is already active (http://localhost:5000)");
        }

        // 5b. Start Vite Frontend Server (Port 5173)
        const isViteUp = await checkHttpUrl("http://127.0.0.1:5173", 1000);
        let viteErrorOutput = "";
        if (!isViteUp) {
            console.log("  ➜ [2/3] Starting Vite Web Development Server on Port 5173...");
            const npxCmd = IS_WIN ? "npx.cmd" : "npx";
            const viteProc = spawn(npxCmd, ["vite", "--port", "5173"], {
                cwd: MAIN_ROOT_DIR,
                stdio: "pipe",
                shell: IS_WIN,
                env: { ...process.env, FORCE_COLOR: "true" }
            });
            viteProc.on("error", (err) => console.error("  ❌ Vite dev server error:", err.message));
            viteProc.stderr?.on("data", (data) => {
                viteErrorOutput += data.toString();
            });
            childProcesses.push(viteProc);
        } else {
            console.log("  ✔ [2/3] Vite Web Server is already active (http://localhost:5173)");
        }

        // 5c. Wait briefly for Vite & Backend to accept connections
        console.log("  ➜ Waiting for web interface to initialize...");
        let viteReady = false;
        for (let i = 0; i < 15; i++) {
            viteReady = await checkHttpUrl("http://127.0.0.1:5173", 800);
            if (viteReady) break;
            await new Promise(r => setTimeout(r, 600));
        }
        if (!viteReady && viteErrorOutput) {
            console.warn("  ⚠️ Vite server warnings/errors:\n" + viteErrorOutput.trim());
        }

        // 5d. Launch Electron Desktop Application pointing to http://localhost:5173
        console.log("  ➜ [3/3] Launching Electron Desktop Shell & Floating FlotBot AI...\n");
        const electronBin = path.join(ROOT_DIR, "node_modules/.bin", IS_WIN ? "electron.cmd" : "electron");
        let electronCmd = fs.existsSync(electronBin) ? electronBin : (IS_WIN ? "electron.cmd" : "electron");
        if (IS_WIN && electronCmd.includes(" ") && !electronCmd.startsWith('"')) {
            electronCmd = `"${electronCmd}"`;
        }

        const electronApp = spawn(electronCmd, ["."], {
            cwd: ROOT_DIR,
            stdio: "inherit",
            shell: IS_WIN,
            env: {
                ...process.env,
                VITE_DEV: "true",
                VITE_DEV_SERVER_URL: "http://localhost:5173"
            }
        });

        // Clean shutdown: Terminate child backend and vite servers when Electron closes
        const cleanup = () => {
            childProcesses.forEach(proc => {
                try {
                    if (!proc.killed && proc.pid) {
                        if (process.platform === "win32") {
                            execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: "ignore" });
                        } else {
                            proc.kill("SIGTERM");
                        }
                    }
                } catch (e) {}
            });
        };

        electronApp.on("error", (err) => {
            console.error("  ❌ Electron failed to launch:", err.message);
            cleanup();
            process.exit(1);
        });

        electronApp.on("exit", (code) => {
            console.log(`[FlotBot] Desktop application closed (code ${code}). Stopping services...`);
            cleanup();
            process.exit(code || 0);
        });

        process.on("SIGINT", () => { cleanup(); process.exit(0); });
        process.on("SIGTERM", () => { cleanup(); process.exit(0); });
    } else {
        console.log("\n[5/5] ✔ All requirements verified successfully!");
    }
}

main().catch(err => {
    console.error("Setup error:", err);
});
