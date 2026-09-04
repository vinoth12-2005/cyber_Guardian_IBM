#!/usr/bin/env node

/**
 * Universal Multi-Process Concurrent Runner
 * Compatible with all Node.js versions (v16, v18, v20, v22+)
 * Cross-platform compatible (Linux, macOS, Windows CMD, PowerShell, Git Bash)
 * Zero external CLI dependency requirements
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const binDir = path.resolve(rootDir, 'node_modules', '.bin');

// Inject node_modules/.bin into PATH so tools like vite, wait-on, electron are always available
const enhancedEnv = {
  ...process.env,
  FORCE_COLOR: 'true',
  PATH: `${binDir}${path.delimiter}${process.env.PATH || ''}`,
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

const PRESETS = {
  admin: {
    title: 'CYBERGUARDIAN AI — ENTERPRISE ADMIN CONSOLE & DEFENDER',
    banner: [
      `${MAGENTA}${BOLD}👑 Admin Management URL:${RESET}   ${BOLD}http://localhost:5174${RESET}  ${GREEN}👈 OPEN THIS IN YOUR BROWSER${RESET}`,
      `${CYAN}${BOLD}📡 Unified Backend API:${RESET}     http://localhost:5000`,
      '',
      `${YELLOW}ℹ️  NOTE:${RESET} Port 5173 is the Employee Portal (${DIM}npm run dev:all${RESET}).`,
      `          Port 5174 is the Enterprise Admin Console (${DIM}npm run admin:all${RESET}).`,
    ],
    tasks: [
      { name: 'backend', color: CYAN, cmd: 'node --watch server/server.js' },
      { name: 'admin-ui', color: MAGENTA, cmd: 'vite --config admin/vite.config.ts --port 5174' },
    ],
  },
  dev: {
    title: 'CYBERGUARDIAN AI — EMPLOYEE SECURITY TRAINING PORTAL',
    banner: [
      `${GREEN}${BOLD}💻 Employee Portal URL:${RESET}    ${BOLD}http://localhost:5173${RESET}  ${GREEN}👈 OPEN THIS IN YOUR BROWSER${RESET}`,
      `${CYAN}${BOLD}📡 Unified Backend API:${RESET}     http://localhost:5000`,
      '',
      `${YELLOW}ℹ️  NOTE:${RESET} For the Enterprise Admin Console, run: ${DIM}npm run admin:all${RESET} (Port 5174)`,
    ],
    tasks: [
      { name: 'backend', color: CYAN, cmd: 'node --watch server/server.js' },
      { name: 'employee-ui', color: GREEN, cmd: 'vite --port 5173' },
    ],
  },
  full: {
    title: 'CYBERGUARDIAN AI — FULL ENTERPRISE SUITE (ALL PORTALS)',
    banner: [
      `${GREEN}${BOLD}💻 Employee Portal URL:${RESET}    ${BOLD}http://localhost:5173${RESET}  (Employee / Training Portal)`,
      `${MAGENTA}${BOLD}👑 Admin Console URL:${RESET}      ${BOLD}http://localhost:5174${RESET}  (Security Operations / Admin Console)`,
      `${CYAN}${BOLD}📡 Unified Backend API:${RESET}     http://localhost:5000`,
    ],
    tasks: [
      { name: 'backend', color: CYAN, cmd: 'node --watch server/server.js' },
      { name: 'employee-ui', color: GREEN, cmd: 'vite --port 5173' },
      { name: 'admin-ui', color: MAGENTA, cmd: 'vite --config admin/vite.config.ts --port 5174' },
    ],
  },
  electron: {
    title: 'CYBERGUARDIAN AI — ELECTRON DESKTOP SUITE',
    banner: [
      `${CYAN}${BOLD}📡 Unified Backend API:${RESET}     http://localhost:5000`,
      `${YELLOW}${BOLD}🖥️  Electron Desktop App:${RESET}  Launching once Web Portal (Port 5173) is online...`,
    ],
    tasks: [
      { name: 'backend', color: CYAN, cmd: 'node server/server.js' },
      { name: 'employee-ui', color: GREEN, cmd: 'vite --port 5173' },
      { name: 'electron', color: YELLOW, cmd: 'wait-on http://localhost:5173 && electron .' },
    ],
  },
};

// Aliases
PRESETS['admin:all'] = PRESETS.admin;
PRESETS['dev:all'] = PRESETS.dev;
PRESETS['full:all'] = PRESETS.full;
PRESETS['electron:dev'] = PRESETS.electron;

const rawArgs = process.argv.slice(2);

if (rawArgs.length === 0) {
  console.error(`${YELLOW}Usage:${RESET}`);
  console.error(`  node scripts/runner.js admin     ${DIM}(Backend + Admin Console on :5174)${RESET}`);
  console.error(`  node scripts/runner.js dev       ${DIM}(Backend + Employee Portal on :5173)${RESET}`);
  console.error(`  node scripts/runner.js full      ${DIM}(Backend + Employee :5173 + Admin :5174)${RESET}`);
  console.error(`  node scripts/runner.js electron  ${DIM}(Backend + Vite + Electron App)${RESET}`);
  console.error(`  node scripts/runner.js "cmd 1" "cmd 2" ...`);
  process.exit(1);
}

let tasksToRun = [];
let bannerInfo = null;

const firstArgNormalized = rawArgs[0].toLowerCase().replace(/^--?/, '');

if (PRESETS[firstArgNormalized]) {
  const preset = PRESETS[firstArgNormalized];
  tasksToRun = preset.tasks;
  bannerInfo = {
    title: preset.title,
    banner: preset.banner,
  };
} else {
  // Check if args were split by shell unquoting (e.g., ["node", "--watch", "server/server.js", "vite", "admin", "--port", "5174"])
  const fullJoined = rawArgs.join(' ');
  if (fullJoined.includes('admin') && fullJoined.includes('5174')) {
    const preset = PRESETS.admin;
    tasksToRun = preset.tasks;
    bannerInfo = { title: preset.title, banner: preset.banner };
  } else {
    // Custom commands passed directly
    const COLORS = [CYAN, MAGENTA, GREEN, YELLOW, BLUE];
    tasksToRun = rawArgs.map((cmdStr, idx) => {
      // Clean leading/trailing quotes that may have leaked
      const cleaned = cmdStr.replace(/^["']|["']$/g, '').trim();
      return {
        name: `proc-${idx + 1}`,
        color: COLORS[idx % COLORS.length],
        cmd: cleaned,
      };
    });
  }
}

// Print Startup Banner
if (bannerInfo) {
  console.log(`\n${BOLD}================================================================================${RESET}`);
  console.log(`🛡️  ${BOLD}${bannerInfo.title}${RESET}`);
  console.log(`${BOLD}================================================================================${RESET}`);
  bannerInfo.banner.forEach((line) => console.log(`  ${line}`));
  console.log(`${BOLD}================================================================================${RESET}\n`);
}

const processes = [];

tasksToRun.forEach((task) => {
  const tag = `${task.color}${BOLD}[${task.name}]${RESET} `;

  const child = spawn(task.cmd, {
    shell: true,
    cwd: rootDir,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: enhancedEnv,
  });

  processes.push(child);

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line, idx) => {
      if (idx === lines.length - 1 && line === '') return;
      process.stdout.write(`${tag}${line}\n`);
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line, idx) => {
      if (idx === lines.length - 1 && line === '') return;
      process.stderr.write(`${tag}${line}\n`);
    });
  });

  child.on('error', (err) => {
    console.error(`${tag}Error starting process (${task.cmd}):`, err.message);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`${tag}Process exited with code ${code}`);
    }
  });
});

let isCleaningUp = false;
function cleanup() {
  if (isCleaningUp) return;
  isCleaningUp = true;
  console.log(`\n${YELLOW}[runner] Shutting down all child processes...${RESET}`);
  processes.forEach((proc) => {
    try {
      if (!proc.killed) {
        proc.kill('SIGTERM');
      }
    } catch (e) {
      // Ignore
    }
  });
  setTimeout(() => {
    process.exit(0);
  }, 300);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
