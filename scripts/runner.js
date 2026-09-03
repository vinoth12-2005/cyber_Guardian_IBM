#!/usr/bin/env node

/**
 * Universal Multi-Process Concurrent Runner
 * Compatible with all Node.js versions (v16, v18, v20, v22+)
 * Zero external CLI dependency requirements
 */

import { spawn } from 'child_process';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/runner.js "command 1" "command 2" ...');
  process.exit(1);
}

const COLORS = [
  '\x1b[36m', // Cyan
  '\x1b[35m', // Magenta
  '\x1b[32m', // Green
  '\x1b[33m', // Yellow
  '\x1b[34m', // Blue
];
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const processes = [];

args.forEach((cmdStr, index) => {
  const color = COLORS[index % COLORS.length];
  const tag = `${color}${BOLD}[proc-${index + 1}]${RESET} `;

  // Split command string into executable and arguments
  const child = spawn(cmdStr, {
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: 'true' },
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
    console.error(`${tag}Error starting process:`, err.message);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`${tag}Process exited with code ${code}`);
    }
  });
});

function cleanup() {
  processes.forEach((proc) => {
    try {
      if (!proc.killed) {
        proc.kill('SIGTERM');
      }
    } catch (e) {
      // Ignore
    }
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
