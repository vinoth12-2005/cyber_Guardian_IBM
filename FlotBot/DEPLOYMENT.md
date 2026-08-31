# FloatBot AI — Deployment & Operating Guide

## 1. System Requirements

| OS Platform | Minimum OS Version | Supported Architectures | Recommended Privileges |
| :--- | :--- | :--- | :--- |
| **Linux** | Debian 11+, Ubuntu 20.04+, RHEL 8+, Arch | x64, ARM64 | Standard user (sudo optional for firewall) |
| **macOS** | macOS 12 (Monterey) or higher | Apple Silicon (M1-M4), Intel x64 | Standard user (Screen Recording permission) |
| **Windows** | Windows 10 (1909+), Windows 11, Server 2019+ | x64, ARM64 | Administrator recommended |

---

## 2. Installation Methods

### Method A: Direct Clone & Launch
```bash
git clone https://github.com/your-org/flotbot.git
cd FlotBot
npm install
cp .env.example .env
npm start
```

### Method B: System Service / Background Daemon
On Linux with systemd:
```ini
# /etc/systemd/system/flotbot.service
[Unit]
Description=FloatBot AI Endpoint Protection Daemon
After=network.target

[Service]
Type=simple
User=zoro
WorkingDirectory=/home/zoro/Documents/FlotBot
ExecStart=/usr/bin/node /home/zoro/Documents/FlotBot/app/app.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```
Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now flotbot
```

---

## 3. Pre-Flight Verification
Run the built-in diagnostic tool to verify all sensors and storage:
```bash
node scripts/doctor.js
# Or
./bin/floatbot doctor
```
