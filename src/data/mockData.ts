import type {
  UserProfile,
  AwarenessScoreData,
  QuickStatItem,
  AnalysisHistoryItem,
  SuspiciousActivityItem,
  ChatbotHistoryItem,
  SimulationHistoryItem,
  WeeklyReportData,
  AttackTrendItem,
  AIRecommendationItem,
  NotificationItem
} from '../types/dashboard';

export const mockUserProfile: UserProfile = {
  name: "Alex Vance",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  awarenessLevel: "Advanced",
  securityTipOfDay: {
    tip: "Be vigilant with unexpected MFA push prompts or emergency SMS verification requests—attackers use fatigue tactics to gain unauthorized access.",
    category: "Authentication Hygiene"
  }
};

export const mockAwarenessScore: AwarenessScoreData = {
  overallScore: 88,
  maxScore: 100,
  level: "Advanced",
  weeklyProgress: 6.2,
  categoryScores: {
    phishingDefense: 92,
    passwordHygiene: 96,
    networkSecurity: 84,
    threatDetection: 80,
  }
};

export const mockQuickStats: QuickStatItem[] = [
  {
    id: "stat-1",
    title: "URLs Analyzed",
    value: "1,428",
    trend: "+12% this week",
    isPositive: true,
    iconName: "Globe",
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent"
  },
  {
    id: "stat-2",
    title: "Emails Scanned",
    value: "3,892",
    trend: "+8% this week",
    isPositive: true,
    iconName: "Mail",
    gradient: "from-blue-500/20 via-indigo-500/10 to-transparent"
  },
  {
    id: "stat-3",
    title: "QR Codes Checked",
    value: "245",
    trend: "+18% this week",
    isPositive: true,
    iconName: "QrCode",
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent"
  },
  {
    id: "stat-4",
    title: "Simulations Completed",
    value: "18",
    trend: "+2 completed",
    isPositive: true,
    iconName: "ShieldAlert",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent"
  },
  {
    id: "stat-5",
    title: "Courses Completed",
    value: "12",
    trend: "100% path progress",
    isPositive: true,
    iconName: "GraduationCap",
    gradient: "from-cyan-500/20 via-purple-500/10 to-transparent"
  },
  {
    id: "stat-6",
    title: "Active Streak",
    value: "14 Days",
    trend: "Personal Best",
    isPositive: true,
    iconName: "Zap",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent"
  }
];

export const mockAnalysisHistory: AnalysisHistoryItem[] = [
  {
    id: "log-101",
    date: "2026-08-10 12:42",
    type: "URL",
    target: "https://auth-security-update-verify.com/login",
    result: "Malicious Phishing Domain",
    riskLevel: "Dangerous",
    status: "Quarantined",
    details: {
      threatType: "Credential Harvester Target: Google SSO",
      engineDetections: "42 / 68 Vendors Flagged",
      recommendation: "Do not open. Blacklisted across network firewall."
    }
  },
  {
    id: "log-102",
    date: "2026-08-10 10:15",
    type: "Email",
    target: "urgent-payroll-update@company-services-direct.net",
    result: "Spear Phishing Spoof",
    riskLevel: "Dangerous",
    status: "Flagged",
    details: {
      threatType: "CEO Fraud & Wire Transfer Request",
      engineDetections: "DKIM / SPF Validation Failed",
      recommendation: "Reported to SOC Security Operations Center."
    }
  },
  {
    id: "log-103",
    date: "2026-08-09 18:30",
    type: "QR Code",
    target: "Parking Meter Sticker QR #8492",
    result: "Redirect to Fraudulent Payment Gateway",
    riskLevel: "Suspicious",
    status: "Quarantined",
    details: {
      threatType: "Quishing / QR Payment Scam",
      engineDetections: "Obfuscated URL Redirect",
      recommendation: "Avoid submitting financial details on untrusted forms."
    }
  },
  {
    id: "log-104",
    date: "2026-08-09 14:10",
    type: "URL",
    target: "https://github.com/facebook/react/releases",
    result: "Clean Official Repository",
    riskLevel: "Safe",
    status: "Whitelisted",
    details: {
      threatType: "None",
      engineDetections: "0 / 68 Vendors Flagged",
      recommendation: "Safe for regular use."
    }
  },
  {
    id: "log-105",
    date: "2026-08-08 16:55",
    type: "Attachment",
    target: "Invoice_Aug_2026_Tax_Doc.pdf.exe",
    result: "Trojan / Ransomware Executable Payload",
    riskLevel: "Dangerous",
    status: "Quarantined",
    details: {
      threatType: "Double Extension Malware Payload",
      engineDetections: "61 / 68 Vendors Flagged",
      recommendation: "File automatically stripped and removed."
    }
  },
  {
    id: "log-106",
    date: "2026-08-08 09:20",
    type: "IP Address",
    target: "185.220.101.45 (Tor Exit Node)",
    result: "Suspicious Network Connection Attempt",
    riskLevel: "Suspicious",
    status: "Flagged",
    details: {
      threatType: "Anonymized Proxy Scanning",
      engineDetections: "High Risk Reputation Score",
      recommendation: "Traffic blocked by web application firewall."
    }
  },
  {
    id: "log-107",
    date: "2026-08-07 11:05",
    type: "Email",
    target: "newsletter@techcrunch.com",
    result: "Verified Authentic Sender",
    riskLevel: "Safe",
    status: "Completed",
    details: {
      threatType: "None",
      engineDetections: "Passed DMARC, SPF, DKIM",
      recommendation: "Normal delivery."
    }
  },
  {
    id: "log-108",
    date: "2026-08-06 21:40",
    type: "URL",
    target: "http://free-crypto-giveaway-2026.xyz",
    result: "Cryptocurrency Scam Domain",
    riskLevel: "Dangerous",
    status: "Quarantined"
  }
];

export const mockSuspiciousActivity: SuspiciousActivityItem[] = [
  {
    id: "act-1",
    date: "2026-08-10 11:30",
    category: "Fake Login",
    target: "Microsoft 365 Fake Auth Portal (microsoft-login-verify-sec.com)",
    riskLevel: "Dangerous",
    aiExplanation: "AI Neural Model detected a pixel-perfect replica of Microsoft Office 365 login screen hosted on a recently registered Russian Registrar domain. Form submits credentials directly to a C2 server.",
    technicalDetails: {
      ipAddress: "194.26.29.112",
      location: "Frankfurt, Germany (Hosteroid AS)",
      indicatorsOfCompromise: [
        "Domain registered 4 hours ago",
        "Self-signed TLS Certificate",
        "Credential harvesting JS payload obfuscated with Base64"
      ],
      remediationAction: "Host domain reported to Google SafeBrowsing and Microsoft Security Response."
    }
  },
  {
    id: "act-2",
    date: "2026-08-09 16:45",
    category: "Phishing Email",
    target: "Subject: 'URGENT: Executive HR Salary Audit - Action Required'",
    riskLevel: "Dangerous",
    aiExplanation: "Targeted Spear Phishing campaign impersonating VP of HR. Uses typo-squatted domain (@companyy-hr.com) and contains a malicious tracking beacon link.",
    technicalDetails: {
      ipAddress: "45.142.214.9",
      location: "Amsterdam, Netherlands",
      indicatorsOfCompromise: [
        "Display name spoofing",
        "Hidden zero-width spaces in subject line to bypass basic spam filters",
        "Direct payload link pointing to cloudflare worker endpoint"
      ],
      remediationAction: "Sender domain blacklisted organisation-wide and mail purged from inboxes."
    }
  },
  {
    id: "act-3",
    date: "2026-08-08 14:15",
    category: "Scam QR",
    target: "Public Transit Poster QR Code Overlay",
    riskLevel: "Suspicious",
    aiExplanation: "Physical sticker overlaid on legitimate transit map. QR code decodes to an unencrypted HTTP link leading to an aggressive subscription popup.",
    technicalDetails: {
      ipAddress: "104.21.55.12",
      location: "San Jose, USA",
      indicatorsOfCompromise: [
        "HTTP non-secure connection",
        "Aggressive mobile browser fingerprinting script",
        "Auto-submitting SMS premium number prompt"
      ],
      remediationAction: "Scanner prevented browser navigation and alerted user of physical QR tampering risk."
    }
  },
  {
    id: "act-4",
    date: "2026-08-07 09:10",
    category: "Malware Link",
    target: "Discord CDN Attachment: 'update_v4.2_patch.zip'",
    riskLevel: "Dangerous",
    aiExplanation: "Archive containing an InfoStealer payload designed to extract browser session cookies, cryptocurrency wallets, and SSH keys.",
    technicalDetails: {
      ipAddress: "162.159.135.232",
      location: "Cloudflare Edge",
      indicatorsOfCompromise: [
        "Stealer payload packed with UPX",
        "Communicates with Telegram Bot API for exfiltration",
        "Attempts registry persistence key modification"
      ],
      remediationAction: "Download aborted, file signature uploaded to CyberGuardian threat database."
    }
  },
  {
    id: "act-5",
    date: "2026-08-05 19:20",
    category: "Suspicious Website",
    target: "Typosquat: gooogle-analytics-script.net",
    riskLevel: "Suspicious",
    aiExplanation: "Discovered embedded third-party script on a blog that attempted keylogging on input forms.",
    technicalDetails: {
      ipAddress: "91.218.114.205",
      location: "Bucharest, Romania",
      indicatorsOfCompromise: [
        "Script injection into DOM",
        "Event listener on keystrokes",
        "Encrypted WebSocket telemetry"
      ],
      remediationAction: "Script execution blocked by browser shield extension."
    }
  }
];

export const mockChatbotHistory: ChatbotHistoryItem[] = [
  {
    id: "chat-1",
    date: "2026-08-10 11:15",
    question: "How can I verify if an urgent SMS from my bank is legitimate or a Smishing attempt?",
    aiSummary: "Explained bank SMS verification steps: never click shortlinks, check official app notifications, and call the verified back-of-card number.",
    category: "Phishing",
    messageCount: 6
  },
  {
    id: "chat-2",
    date: "2026-08-08 15:40",
    question: "Is using a Password Manager safe if the master password is breached?",
    aiSummary: "Detailed zero-knowledge encryption architecture, PBKDF2/Argon2 hashing, and the vital importance of 2FA for vault access.",
    category: "Password",
    messageCount: 8
  },
  {
    id: "chat-3",
    date: "2026-08-06 10:20",
    question: "What are the risks of using free airport Wi-Fi without a VPN?",
    aiSummary: "Outlined Man-in-the-Middle (MitM) attacks, Evil Twin access points, HTTPS stripping, and recommended DNS-over-HTTPS & VPN protection.",
    category: "Network",
    messageCount: 5
  },
  {
    id: "chat-4",
    date: "2026-08-04 17:00",
    question: "Can AI deepfake audio call me claiming to be a family member asking for urgent funds?",
    aiSummary: "Analyzed Voice Cloning (Deepfake) Scams and advised establishing a secret verbal passphrase with family members for emergencies.",
    category: "Privacy",
    messageCount: 10
  }
];

export const mockSimulationHistory: SimulationHistoryItem[] = [
  {
    id: "sim-1",
    simulationType: "Spear Phishing Executive Email Drill",
    difficulty: "Advanced",
    result: "Passed",
    score: 95,
    completionPercentage: 100,
    date: "2026-08-09"
  },
  {
    id: "sim-2",
    simulationType: "Malicious QR Code (Quishing) Challenge",
    difficulty: "Intermediate",
    result: "Passed",
    score: 90,
    completionPercentage: 100,
    date: "2026-08-07"
  },
  {
    id: "sim-3",
    simulationType: "Ransomware Attachment Identification",
    difficulty: "Expert",
    result: "Passed",
    score: 88,
    completionPercentage: 100,
    date: "2026-08-04"
  },
  {
    id: "sim-4",
    simulationType: "OAuth Permission Consent Abuse Simulation",
    difficulty: "Advanced",
    result: "Failed",
    score: 55,
    completionPercentage: 100,
    date: "2026-07-28"
  },
  {
    id: "sim-5",
    simulationType: "Social Engineering Phone Vishing Test",
    difficulty: "Intermediate",
    result: "Passed",
    score: 100,
    completionPercentage: 100,
    date: "2026-07-20"
  }
];

export const mockWeeklyReport: WeeklyReportData = {
  scoreChange: 6.2,
  simulationsCompleted: 4,
  threatsIdentified: 14,
  weakAreas: [
    "OAuth Third-Party App Authorizations",
    "Deepfake Voice Call Verification",
    "Metadata Privacy in Shared PDFs"
  ],
  strongAreas: [
    "Credential Harvesting Detection",
    "MFA Token Hygiene & Hardware Keys",
    "Suspicious Domain Inspection"
  ],
  barChartData: [
    { day: "Mon", threatsBlocked: 4, scansPerformed: 38 },
    { day: "Tue", threatsBlocked: 2, scansPerformed: 45 },
    { day: "Wed", threatsBlocked: 5, scansPerformed: 52 },
    { day: "Thu", threatsBlocked: 1, scansPerformed: 40 },
    { day: "Fri", threatsBlocked: 6, scansPerformed: 64 },
    { day: "Sat", threatsBlocked: 3, scansPerformed: 28 },
    { day: "Sun", threatsBlocked: 2, scansPerformed: 30 },
  ],
  lineChartData: [
    { week: "W1", score: 74 },
    { week: "W2", score: 78 },
    { week: "W3", score: 81 },
    { week: "W4", score: 83 },
    { week: "W5", score: 88 },
  ],
  pieChartData: [
    { name: "Phishing URLs", value: 42, color: "#06B6D4" },
    { name: "Fake Logins", value: 24, color: "#3B82F6" },
    { name: "Malware Docs", value: 18, color: "#8B5CF6" },
    { name: "Scam QR Codes", value: 16, color: "#EC4899" },
  ]
};

export const mockAttackTrends: AttackTrendItem[] = [
  {
    id: "trend-1",
    attackName: "AI Voice Cloning & Deepfake Vishing",
    description: "Fraudsters use 3-second audio snippets scraped from social media to synthesize real-time voice calls pretending to be loved ones or corporate executives in distress.",
    difficulty: "Advanced",
    popularity: 94,
    preventionTips: [
      "Set up a unique family safe-word passphrase for urgent money requests.",
      "Hang up and call back directly on the known contact number.",
      "Ask specific personal questions that an AI model cannot scrape."
    ],
    iconName: "Mic"
  },
  {
    id: "trend-2",
    attackName: "Quishing (QR Code Phishing)",
    description: "Malicious QR stickers replaced on public payment terminals, EV chargers, and restaurant tables that direct users to credential-harvesting web apps.",
    difficulty: "Intermediate",
    popularity: 88,
    preventionTips: [
      "Inspect physical QR stickers for tampering or overlay labels.",
      "Preview the full destination URL in your scanner before opening.",
      "Never input passwords or banking details via unknown QR landing pages."
    ],
    iconName: "QrCode"
  },
  {
    id: "trend-3",
    attackName: "MFA Push Fatigue Attacks",
    description: "Attackers bombard a user with dozens of push notifications at 2 AM hoping the exhausted user taps 'Approve' to stop the notification spam.",
    difficulty: "Intermediate",
    popularity: 82,
    preventionTips: [
      "Never approve MFA requests you did not initiate personally.",
      "Switch to FIDO2 / Passkey hardware keys or Number Matching MFA.",
      "Report repeated push spam to IT Security immediately."
    ],
    iconName: "BellRing"
  },
  {
    id: "trend-4",
    attackName: "WhatsApp & Telegram Account Takeover",
    description: "Scammers request a fake 6-digit SMS verification code by impersonating a mutual contact who claims to have sent it by mistake.",
    difficulty: "Beginner",
    popularity: 90,
    preventionTips: [
      "Never forward ANY SMS or WhatsApp verification code to anyone.",
      "Enable Two-Step Verification PIN inside WhatsApp settings.",
      "Verify unexpected friend requests over another channel."
    ],
    iconName: "MessageSquare"
  },
  {
    id: "trend-5",
    attackName: "OAuth Consent App Hijacking",
    description: "Malicious third-party apps request 'Read Mail & Contacts' permission under the guise of a productivity tool, gaining permanent token access without needing your password.",
    difficulty: "Advanced",
    popularity: 76,
    preventionTips: [
      "Review connected apps in Google / Microsoft Account security settings regularly.",
      "Revoke permissions for unverified or unused third-party tools.",
      "Look for verified publisher badges during OAuth login prompts."
    ],
    iconName: "KeyRound"
  },
  {
    id: "trend-6",
    attackName: "Fake Banking SMS & Instant Refund Scams",
    description: "SMS messages spoofing major banks warning of an urgent 'suspicious transaction' with a link to cancel the charge, which actually authorizes it.",
    difficulty: "Intermediate",
    popularity: 86,
    preventionTips: [
      "Banks never ask for online banking PINs or OTPs via SMS links.",
      "Log into official mobile banking apps directly to check account activity.",
      "Forward scam SMS messages to official anti-phishing hotline."
    ],
    iconName: "Landmark"
  }
];

export const mockAIRecommendations: AIRecommendationItem[] = [
  {
    id: "rec-1",
    title: "Master OAuth App Authorization Defenses",
    priority: "High",
    reason: "You missed 2 questions on OAuth consent abuse during your last assessment.",
    actionText: "Practice OAuth Simulation",
    actionType: "simulation"
  },
  {
    id: "rec-2",
    title: "Enable Passkeys & Hardware 2FA",
    priority: "High",
    reason: "SMS-based 2FA remains vulnerable to SIM swap and intercept attacks.",
    actionText: "Configure Security Keys",
    actionType: "setting"
  },
  {
    id: "rec-3",
    title: "Complete Deepfake Audio Spotting Course",
    priority: "Medium",
    reason: "Voice cloning attacks increased by 140% in your region this month.",
    actionText: "Start 5-Min Interactive Lesson",
    actionType: "course"
  },
  {
    id: "rec-4",
    title: "Review Quarantined Email Attachments",
    priority: "Medium",
    reason: "2 suspicious executables were blocked in your organization inbox.",
    actionText: "Inspect Security Log",
    actionType: "review"
  },
  {
    id: "rec-5",
    title: "Audit Active Sessions across Devices",
    priority: "Low",
    reason: "You have 4 active web sessions open for over 14 days.",
    actionText: "Review Open Sessions",
    actionType: "setting"
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Awareness Score Increased!",
    description: "Your Cyber Awareness score reached 88 (+6.2% improvement this week). Keep up the great work!",
    timestamp: "10 mins ago",
    read: false,
    type: "score"
  },
  {
    id: "notif-2",
    title: "New Simulation Available",
    description: "AI Deepfake Voice Scam simulation module is now unlocked in your Simulation Lab.",
    timestamp: "1 hour ago",
    read: false,
    type: "simulation"
  },
  {
    id: "notif-3",
    title: "Weekly Cyber Report Ready",
    description: "Your weekly analytics and threat summary for August W2 is compiled and ready for review.",
    timestamp: "3 hours ago",
    read: true,
    type: "report"
  },
  {
    id: "notif-4",
    title: "Critical Threat Blocked",
    description: "CyberGuardian Shield prevented a credential harvester link from executing in your browser.",
    timestamp: "Yesterday",
    read: true,
    type: "alert"
  }
];
