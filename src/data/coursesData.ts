// ── COURSES DATA ─────────────────────────────────────────────────────────────
// Automatically generated comprehensive cybersecurity catalog (52 courses)
import type { Course } from "../types/courses";

export const COURSES_DEFAULT: Course[] = [
  {
    "id": "phish-fund",
    "title": "Phishing Fundamentals",
    "cat": "Phishing",
    "icon": "mail",
    "color1": "#3B82F6",
    "color2": "#06B6D4",
    "level": "Beginner",
    "desc": "Learn to spot the red flags in fake emails, texts, and links before they cost you.",
    "objectives": [
      "Identify the 5 most common phishing tactics",
      "Spot lookalike domains and spoofed senders",
      "Know what to do when you suspect phishing"
    ],
    "modules": [
      {
        "title": "Introduction & Detection",
        "lessons": [
          {
            "id": "les-phish-1",
            "title": "What is phishing?",
            "type": "reading",
            "dur": "6 min",
            "body": "Phishing is a social engineering attack where bad actors impersonate trusted organizations (like IT helpdesks, banks, or Microsoft 365) via email or messaging to trick users into revealing sensitive login credentials or executing malware.",
            "image": "/assets/course-diagrams/packet_capture_analysis_1787991262941.png",
            "example": "Headers analysis snippet:\nReceived: from mail.fake-bank-security-update.com (185.220.101.5)\nReturn-Path: <attacker@spoofed-domain.xyz>\nFrom: \"IT Support Helpdesk\" <support@yourcompany-portal.net>",
            "realTimeExample": "In 2023, Twilio employees were targeted by an SMS quishing/phishing attack using lookalike domains, granting attackers unauthorized access to internal administrative tools.",
            "points": [
              "Master the core operational principles of email header verification & SPF/DKIM inspection",
              "Recognize artificial urgency (e.g. 'Account suspended in 15 minutes')",
              "Always perform out-of-band communication before transferring funds or entering credentials",
              "Report suspicious anomalies immediately using the enterprise PhishAlert button"
            ],
            "knowledgeCheck": [
              {
                "q": "What is the primary technical check to verify if an email sender address is spoofed?",
                "options": [
                  "Check the display name in the inbox",
                  "Inspect Return-Path and SPF/DKIM authentication headers",
                  "Check if the email has an attachment",
                  "Read the email signature carefully"
                ],
                "answer": 1,
                "explanation": "Display names can be easily faked. Checking SPF/DKIM and Return-Path headers confirms the true sending server."
              }
            ]
          },
          {
            "id": "les-phish-2",
            "title": "Anatomy of a fake email & SQL Injection Payloads",
            "type": "reading",
            "dur": "7 min",
            "body": "Phishers frequently embed malicious hyper-links leading to fake authentication portals designed with SQL injection payloads or OAuth token harvesting prompts.",
            "image": "/assets/course-diagrams/sql_injection_lab_diagram_1787991241967.png",
            "example": "SQLi Auth Bypass Payload in login input field:\nUsername: admin' OR '1'='1' --\nPassword: [anything]",
            "realTimeExample": "Attackers combined spear-phishing emails with SQL injection payloads against e-commerce portals to extract over 500,000 credit card hashes.",
            "points": [
              "Inspect hover links for subdomains vs main root domain",
              "Never enter FIDO2/MFA OTP codes into unverified browser URLs",
              "Sanitize all web form inputs with parameterized SQL queries"
            ],
            "knowledgeCheck": [
              {
                "q": "Which SQL query modification occurs when ' OR '1'='1' -- is injected into a vulnerable login?",
                "options": [
                  "It deletes all user database records",
                  "It forces the evaluation to always TRUE, bypassing password checks",
                  "It encrypts the database passwords",
                  "It sends an alert to the webmaster"
                ],
                "answer": 1,
                "explanation": "1=1 is always true, causing the SQL parser to match the first user record (admin) without valid credentials."
              }
            ]
          },
          {
            "title": "Quiz: Phishing Fundamentals Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Phishing Fundamentals.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Which of these is the strongest sign of a phishing email?",
        "options": [
          "Company logo",
          "Urgent language demanding action",
          "Friendly greeting",
          "Sent during work hours"
        ],
        "answer": 1,
        "explanation": "Urgency shuts down analytical thinking."
      },
      {
        "q": "What should you do before clicking an email link?",
        "options": [
          "Click immediately",
          "Hover over link to inspect destination URL",
          "Forward to a friend",
          "Ignore it forever"
        ],
        "answer": 1,
        "explanation": "Hovering previews the real link destination safely."
      },
      {
        "q": "A lookalike domain like paypa1.com is an example of:",
        "options": [
          "Typosquatting",
          "CDN cache",
          "Valid merchant",
          "DNS server"
        ],
        "answer": 0,
        "explanation": "Typosquatting tricks users with subtle misspellings."
      }
    ]
  },
  {
    "id": "qr-vigilance",
    "title": "QR Code Vigilance (Quishing)",
    "cat": "Phishing",
    "icon": "lock2",
    "color1": "#8B5CF6",
    "color2": "#06B6D4",
    "level": "Beginner",
    "desc": "QR codes are a growing phishing vector \u2014 learn to scan smart and avoid malicious redirects.",
    "objectives": [
      "Understand quishing tactics",
      "Preview QR destinations before opening",
      "Spot physical tampering on public QR codes"
    ],
    "modules": [
      {
        "title": "QR Security Essentials",
        "lessons": [
          {
            "title": "Understanding Quishing",
            "type": "reading",
            "dur": "6 min",
            "body": "QR codes are a growing phishing vector \u2014 learn to scan smart and avoid malicious redirects. Understanding the fundamentals of QR Code Vigilance (Quishing) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of QR Code Vigilance (Quishing)",
              "Recognise early indicators of compromise related to phishing threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Safe QR Scanning Habits",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in QR Code Vigilance (Quishing). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for QR Code Vigilance (Quishing)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: QR Code Vigilance (Quishing) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for QR Code Vigilance (Quishing).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "'Quishing' refers to phishing delivered via:",
        "options": [
          "Voice calls",
          "QR codes",
          "Fax machines",
          "Bluetooth"
        ],
        "answer": 1,
        "explanation": "Quishing uses QR codes to hide malicious URLs."
      },
      {
        "q": "A sticker QR pasted over a parking meter code is an example of:",
        "options": [
          "Special promotion",
          "Physical tampering for phishing",
          "Firmware update",
          "Loyalty code"
        ],
        "answer": 1,
        "explanation": "Attackers place fake stickers over legit QR codes."
      },
      {
        "q": "Before opening a scanned QR link you should:",
        "options": [
          "Enter credentials fast",
          "Preview the destination domain",
          "Scan it twice",
          "Disable WiFi"
        ],
        "answer": 1,
        "explanation": "Previewing the URL checks for untrusted domains."
      }
    ]
  },
  {
    "id": "smishing-vishing",
    "title": "Smishing & Vishing Defense",
    "cat": "Phishing",
    "icon": "phone",
    "color1": "#EC4899",
    "color2": "#8B5CF6",
    "level": "Beginner",
    "desc": "Defend against SMS phishing (smishing) and voice caller impersonation (vishing).",
    "objectives": [
      "Spot suspicious text messages with links",
      "Handle caller ID spoofing and voice impersonation",
      "Verify caller identity via official channels"
    ],
    "modules": [
      {
        "title": "Mobile & Voice Attacks",
        "lessons": [
          {
            "title": "Smishing Tactics Exposed",
            "type": "reading",
            "dur": "6 min",
            "body": "Defend against SMS phishing (smishing) and voice caller impersonation (vishing). Understanding the fundamentals of Smishing & Vishing Defense is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Smishing & Vishing Defense",
              "Recognise early indicators of compromise related to phishing threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Vishing & Caller ID Spoofing",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Smishing & Vishing Defense. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Smishing & Vishing Defense",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Smishing & Vishing Defense Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Smishing & Vishing Defense.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Smishing refers to phishing attacks delivered via:",
        "options": [
          "SMS text messages",
          "Smart TVs",
          "Satellite dish",
          "Social media posts"
        ],
        "answer": 0,
        "explanation": "Smishing uses SMS to deliver malicious links or prompts."
      },
      {
        "q": "If a caller claims to be your IT desk asking for your password, you should:",
        "options": [
          "Provide it immediately",
          "Refuse and call back on a verified directory number",
          "Ask for their manager",
          "Mute your phone"
        ],
        "answer": 1,
        "explanation": "IT staff will never ask for your password over the phone."
      },
      {
        "q": "Caller ID spoofing allows attackers to:",
        "options": [
          "Fake the phone number displayed on your phone",
          "Listen to your voicemails",
          "Record your calls",
          "Disable your SIM"
        ],
        "answer": 0,
        "explanation": "Attackers can manipulate caller ID to appear as trusted institutions."
      }
    ]
  },
  {
    "id": "bec-fraud",
    "title": "Business Email Compromise (BEC)",
    "cat": "Phishing",
    "icon": "mail",
    "color1": "#EF4444",
    "color2": "#F59E0B",
    "level": "Intermediate",
    "desc": "Stop executive impersonation, urgent wire transfer requests, and supplier account fraud.",
    "objectives": [
      "Recognise CEO fraud and vendor email compromise",
      "Establish strict dual-authorization controls",
      "Verify bank details out-of-band"
    ],
    "modules": [
      {
        "title": "BEC & Financial Scams",
        "lessons": [
          {
            "title": "Anatomy of Executive Impersonation",
            "type": "reading",
            "dur": "6 min",
            "body": "Stop executive impersonation, urgent wire transfer requests, and supplier account fraud. Understanding the fundamentals of Business Email Compromise (BEC) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Business Email Compromise (BEC)",
              "Recognise early indicators of compromise related to phishing threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Vendor Account Takeover",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Business Email Compromise (BEC). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Business Email Compromise (BEC)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Business Email Compromise (BEC) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Business Email Compromise (BEC).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is the main objective of Business Email Compromise (BEC)?",
        "options": [
          "Install cryptocurrency miners",
          "Tricking staff into sending funds or sensitive data",
          "Defacing company website",
          "Cracking router passwords"
        ],
        "answer": 1,
        "explanation": "BEC aims to authorise fraudulent wire transfers or leak data."
      },
      {
        "q": "When a vendor emails asking to change payment bank details, you must:",
        "options": [
          "Update it right away",
          "Verify by phone using a previously known trusted number",
          "Reply to the email asking for confirmation",
          "Ignore the invoice"
        ],
        "answer": 1,
        "explanation": "Always verify out-of-band using known contact details."
      },
      {
        "q": "Why do BEC attackers use domain lookalikes?",
        "options": [
          "To pass email filter checks and fool recipients",
          "To speed up internet speed",
          "To encrypt emails",
          "To store backups"
        ],
        "answer": 0,
        "explanation": "Lookalike domains bypass superficial visual inspection."
      }
    ]
  },
  {
    "id": "spear-whaling",
    "title": "Spear Phishing & Executive Whaling",
    "cat": "Phishing",
    "icon": "target",
    "color1": "#3B82F6",
    "color2": "#6366F1",
    "level": "Intermediate",
    "desc": "Understand hyper-targeted phishing campaigns aimed at specific individuals and high-level executives.",
    "objectives": [
      "Analyze open source intelligence (OSINT) gathering",
      "Recognise tailored spear-phishing pretexts",
      "Protect C-suite credentials"
    ],
    "modules": [
      {
        "title": "Targeted Cyber Attacks",
        "lessons": [
          {
            "title": "Spear Phishing Mechanics",
            "type": "reading",
            "dur": "6 min",
            "body": "Understand hyper-targeted phishing campaigns aimed at specific individuals and high-level executives. Understanding the fundamentals of Spear Phishing & Executive Whaling is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Spear Phishing & Executive Whaling",
              "Recognise early indicators of compromise related to phishing threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Whaling & High-Value Targets",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Spear Phishing & Executive Whaling. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Spear Phishing & Executive Whaling",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Spear Phishing & Executive Whaling Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Spear Phishing & Executive Whaling.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "How does spear phishing differ from general phishing?",
        "options": [
          "It targets mass audiences",
          "It uses personalized data gathered about specific targets",
          "It only arrives via postal mail",
          "It requires no internet"
        ],
        "answer": 1,
        "explanation": "Spear phishing uses tailored personal information."
      },
      {
        "q": "Executive 'whaling' specifically targets:",
        "options": [
          "Entry level interns",
          "High-level executives and board members",
          "External customers",
          "Hardware suppliers"
        ],
        "answer": 1,
        "explanation": "Whaling aims at executives with high authority and access."
      },
      {
        "q": "Where do attackers often gather OSINT for spear phishing?",
        "options": [
          "Social media & company websites",
          "Encrypted databases",
          "Internal Slack logs",
          "Paper shredders"
        ],
        "answer": 0,
        "explanation": "Public profiles provide key detail on roles and projects."
      }
    ]
  },
  {
    "id": "brand-spoofing",
    "title": "Brand Impersonation & Typosquatting",
    "cat": "Phishing",
    "icon": "globe",
    "color1": "#10B981",
    "color2": "#3B82F6",
    "level": "Beginner",
    "desc": "Learn how cybercriminals copy major brand websites and domains to steal customer credentials.",
    "objectives": [
      "Identify homograph attacks and Unicode domain tricks",
      "Spot subtle URL misspellings",
      "Verify SSL certificates and origin domains"
    ],
    "modules": [
      {
        "title": "Brand Protection",
        "lessons": [
          {
            "title": "Typosquatting & Fake Sites",
            "type": "reading",
            "dur": "6 min",
            "body": "Learn how cybercriminals copy major brand websites and domains to steal customer credentials. Understanding the fundamentals of Brand Impersonation & Typosquatting is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Brand Impersonation & Typosquatting",
              "Recognise early indicators of compromise related to phishing threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Homograph & Unicode Tricks",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Brand Impersonation & Typosquatting. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Brand Impersonation & Typosquatting",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Brand Impersonation & Typosquatting Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Brand Impersonation & Typosquatting.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Typosquatting exploits:",
        "options": [
          "Common user typing mistakes in browser address bar",
          "Router hardware bugs",
          "Weak passwords",
          "Monitor resolution"
        ],
        "answer": 0,
        "explanation": "Attackers buy mistyped domain variations."
      },
      {
        "q": "An Internationalized Domain Name (IDN) homograph attack uses:",
        "options": [
          "Lookalike characters from non-Latin alphabets",
          "Random numbers",
          "Shortened Bit.ly links",
          "Subdomain redirects"
        ],
        "answer": 0,
        "explanation": "Cyrillic or Greek characters can look identical to Latin letters."
      },
      {
        "q": "Does having a green lock icon (HTTPS) guarantee a site is safe?",
        "options": [
          "Yes, HTTPS means trusted owner",
          "No, phishing sites can easily obtain HTTPS certificates",
          "Yes, HTTPS encrypts all content",
          "Only on Chrome"
        ],
        "answer": 1,
        "explanation": "HTTPS encrypts traffic but does not verify website intent."
      }
    ]
  },
  {
    "id": "pwd-hygiene",
    "title": "Password Hygiene Mastery",
    "cat": "Passwords",
    "icon": "key",
    "color1": "#F59E0B",
    "color2": "#EF4444",
    "level": "Beginner",
    "desc": "Build password habits that hold up against real-world credential stuffing and brute force.",
    "objectives": [
      "Create long, unique passphrases",
      "Understand credential stuffing risks",
      "Use password managers effectively"
    ],
    "modules": [
      {
        "title": "Password Defense",
        "lessons": [
          {
            "title": "The Password Reuse Problem",
            "type": "reading",
            "dur": "6 min",
            "body": "Build password habits that hold up against real-world credential stuffing and brute force. Understanding the fundamentals of Password Hygiene Mastery is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Password Hygiene Mastery",
              "Recognise early indicators of compromise related to passwords threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Passphrases vs Complexity",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Password Hygiene Mastery. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Password Hygiene Mastery",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Password Hygiene Mastery Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Password Hygiene Mastery.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Why is reusing passwords across websites dangerous?",
        "options": [
          "It slows typing",
          "A breach on one site compromises all accounts sharing that password",
          "Browsers block it",
          "No risk"
        ],
        "answer": 1,
        "explanation": "Credential stuffing tools test leaked pairs everywhere."
      },
      {
        "q": "Which password is generally hardest to crack?",
        "options": [
          "Pass123!",
          "correct-horse-battery-staple-99",
          "P@ssw0rd",
          "Admin2024"
        ],
        "answer": 1,
        "explanation": "Length significantly expands the brute-force search space."
      },
      {
        "q": "A password manager helps by:",
        "options": [
          "Shortening passwords",
          "Generating and storing unique strong passwords per site",
          "Removing login screens",
          "Posting passwords online"
        ],
        "answer": 1,
        "explanation": "It creates unique random credentials for every login."
      }
    ]
  },
  {
    "id": "mfa-fido2",
    "title": "MFA & Passkeys (FIDO2)",
    "cat": "Passwords",
    "icon": "shield",
    "color1": "#10B981",
    "color2": "#06B6D4",
    "level": "Intermediate",
    "desc": "Upgrade from weak SMS codes to phishing-resistant authentication like Passkeys and hardware keys.",
    "objectives": [
      "Understand MFA methods (SMS, OTP, Push, FIDO2)",
      "Defend against MFA Fatigue attacks",
      "Deploy Passkeys and WebAuthn"
    ],
    "modules": [
      {
        "title": "Modern Authentication",
        "lessons": [
          {
            "title": "MFA Evolution & Weaknesses",
            "type": "reading",
            "dur": "6 min",
            "body": "Upgrade from weak SMS codes to phishing-resistant authentication like Passkeys and hardware keys. Understanding the fundamentals of MFA & Passkeys (FIDO2) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of MFA & Passkeys (FIDO2)",
              "Recognise early indicators of compromise related to passwords threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Passkeys & FIDO2 Standard",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in MFA & Passkeys (FIDO2). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for MFA & Passkeys (FIDO2)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: MFA & Passkeys (FIDO2) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for MFA & Passkeys (FIDO2).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Which MFA method is most resistant to phishing?",
        "options": [
          "SMS OTP text",
          "Email code",
          "FIDO2 Hardware Key / Passkey",
          "Voice call OTP"
        ],
        "answer": 2,
        "explanation": "FIDO2 cryptographically binds auth to the exact domain origin."
      },
      {
        "q": "MFA Prompt Fatigue occurs when an attacker:",
        "options": [
          "Sends dozens of push notifications hoping the user clicks Approve",
          "Guesses your password",
          "Steals your phone",
          "Disables WiFi"
        ],
        "answer": 0,
        "explanation": "Attackers spam approval prompts to annoy or trick users."
      },
      {
        "q": "Passkeys replace passwords using:",
        "options": [
          "Public-key cryptography tied to biometric device unlock",
          "Plain text files",
          "Centralised passwords",
          "Security questions"
        ],
        "answer": 0,
        "explanation": "Passkeys rely on asymmetric cryptography stored securely on hardware."
      }
    ]
  },
  {
    "id": "pam-privilege",
    "title": "Privileged Access Management (PAM)",
    "cat": "Identity & Access",
    "icon": "keyhole",
    "color1": "#8B5CF6",
    "color2": "#EC4899",
    "level": "Advanced",
    "desc": "Secure administrative credentials, root accounts, and break-glass emergency access.",
    "objectives": [
      "Enforce Least Privilege Architecture",
      "Implement Just-In-Time (JIT) access",
      "Audit privileged session logs"
    ],
    "modules": [
      {
        "title": "Privilege Escalation & Control",
        "lessons": [
          {
            "title": "Principle of Least Privilege",
            "type": "reading",
            "dur": "6 min",
            "body": "Secure administrative credentials, root accounts, and break-glass emergency access. Understanding the fundamentals of Privileged Access Management (PAM) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Privileged Access Management (PAM)",
              "Recognise early indicators of compromise related to identity & access threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "PAM Architecture & JIT",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Privileged Access Management (PAM). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Privileged Access Management (PAM)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Privileged Access Management (PAM) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Privileged Access Management (PAM).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "The Principle of Least Privilege dictates that users should have:",
        "options": [
          "Full admin rights by default",
          "Only the minimum access necessary to perform their job duties",
          "Access to all shared folders",
          "Read access to root"
        ],
        "answer": 1,
        "explanation": "Restricting access limits potential breach damage."
      },
      {
        "q": "Just-In-Time (JIT) privileged access provides:",
        "options": [
          "Permanent root access",
          "Temporary elevated access that expires automatically",
          "Unlimited password resets",
          "Unmonitored shell sessions"
        ],
        "answer": 1,
        "explanation": "JIT grants temporary permission strictly when needed."
      },
      {
        "q": "A 'Break-Glass' account is designed for:",
        "options": [
          "Daily admin tasks",
          "Emergency access when primary auth systems fail",
          "Testing new features",
          "Guest users"
        ],
        "answer": 1,
        "explanation": "Emergency accounts bypass standard MFA during system outages."
      }
    ]
  },
  {
    "id": "iam-oauth",
    "title": "IAM & Identity Federation (OAuth/SAML)",
    "cat": "Identity & Access",
    "icon": "users",
    "color1": "#3B82F6",
    "color2": "#8B5CF6",
    "level": "Advanced",
    "desc": "Understand federated identity, OAuth 2.0 grants, SAML SSO assertions, and OIDC token flows.",
    "objectives": [
      "Differentiate Authentication vs Authorization",
      "Secure OAuth 2.0 client secrets and redirect URIs",
      "Prevent SAML response manipulation"
    ],
    "modules": [
      {
        "title": "Federated Identity Architecture",
        "lessons": [
          {
            "title": "OAuth 2.0 & OIDC Deep Dive",
            "type": "reading",
            "dur": "6 min",
            "body": "Understand federated identity, OAuth 2.0 grants, SAML SSO assertions, and OIDC token flows. Understanding the fundamentals of IAM & Identity Federation (OAuth/SAML) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of IAM & Identity Federation (OAuth/SAML)",
              "Recognise early indicators of compromise related to identity & access threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "SAML 2.0 & SSO Vulnerabilities",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in IAM & Identity Federation (OAuth/SAML). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for IAM & Identity Federation (OAuth/SAML)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: IAM & Identity Federation (OAuth/SAML) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for IAM & Identity Federation (OAuth/SAML).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is the fundamental difference between OAuth 2.0 and SAML/OIDC?",
        "options": [
          "OAuth is for Authorization; SAML/OIDC are for Authentication",
          "OAuth is obsolete",
          "SAML only works on mobile",
          "They are identical"
        ],
        "answer": 0,
        "explanation": "OAuth grants delegated access rights; OIDC/SAML verify identity."
      },
      {
        "q": "An open redirect in an OAuth flow can allow an attacker to:",
        "options": [
          "Steal authorisation codes or access tokens",
          "Format your drive",
          "Bypass HTTPS",
          "Disable DNS"
        ],
        "answer": 0,
        "explanation": "Redirect URIs must be strictly validated to prevent token theft."
      },
      {
        "q": "What does a JWT (JSON Web Token) contain?",
        "options": [
          "Encrypted hard drive keys",
          "Header, Payload (Claims), and Signature",
          "Source code",
          "Antivirus signatures"
        ],
        "answer": 1,
        "explanation": "JWTs carry signed payload claims between auth services."
      }
    ]
  },
  {
    "id": "sso-hardening",
    "title": "Single Sign-On (SSO) Security",
    "cat": "Identity & Access",
    "icon": "lock",
    "color1": "#06B6D4",
    "color2": "#3B82F6",
    "level": "Intermediate",
    "desc": "Harden enterprise SSO providers (Okta, Entra ID, Ping) against session hijacking and token theft.",
    "objectives": [
      "Protect SSO master sessions",
      "Detect stolen session cookies and tokens",
      "Implement Conditional Access policies"
    ],
    "modules": [
      {
        "title": "Enterprise SSO Protection",
        "lessons": [
          {
            "title": "SSO Risks & Blast Radius",
            "type": "reading",
            "dur": "6 min",
            "body": "Harden enterprise SSO providers (Okta, Entra ID, Ping) against session hijacking and token theft. Understanding the fundamentals of Single Sign-On (SSO) Security is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Single Sign-On (SSO) Security",
              "Recognise early indicators of compromise related to identity & access threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Conditional Access & Session Defense",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Single Sign-On (SSO) Security. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Single Sign-On (SSO) Security",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Single Sign-On (SSO) Security Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Single Sign-On (SSO) Security.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is the primary security trade-off of Single Sign-On (SSO)?",
        "options": [
          "It requires multiple passwords",
          "If the master SSO credentials are compromised, all linked apps are accessible",
          "It slows down login",
          "It disables MFA"
        ],
        "answer": 1,
        "explanation": "SSO concentrates risk into a single high-value credential set."
      },
      {
        "q": "Conditional Access policies evaluate login risk based on:",
        "options": [
          "Device health, IP location, sign-in risk level, and user role",
          "Screen resolution",
          "Keyboard speed",
          "Battery level"
        ],
        "answer": 0,
        "explanation": "Conditional rules enforce MFA or block login based on risk factors."
      },
      {
        "q": "Session hijacking occurs when an attacker:",
        "options": [
          "Steals a valid session token/cookie to bypass authentication",
          "Guesses your username",
          "Deletes your account",
          "Triggers a server reboot"
        ],
        "answer": 0,
        "explanation": "Stolen session tokens grant active login status without requiring credentials."
      }
    ]
  },
  {
    "id": "social-eng",
    "title": "Social Engineering: Human Hacking",
    "cat": "Social Engineering",
    "icon": "users",
    "color1": "#EF4444",
    "color2": "#F59E0B",
    "level": "Intermediate",
    "desc": "Understand the psychological tricks attackers use to manipulate people into handing over access.",
    "objectives": [
      "Recognise pretexting and baiting",
      "Understand authority and urgency triggers",
      "Verify before trusting high-risk requests"
    ],
    "modules": [
      {
        "title": "Psychology of Manipulation",
        "lessons": [
          {
            "title": "Why Humans Are Target #1",
            "type": "reading",
            "dur": "6 min",
            "body": "Understand the psychological tricks attackers use to manipulate people into handing over access. Understanding the fundamentals of Social Engineering: Human Hacking is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Social Engineering: Human Hacking",
              "Recognise early indicators of compromise related to social engineering threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Pretexting & Impersonation",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Social Engineering: Human Hacking. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Social Engineering: Human Hacking",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Social Engineering: Human Hacking Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Social Engineering: Human Hacking.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Pretexting is best described as:",
        "options": [
          "Sending virus attachments",
          "Inventing a fabricated scenario to extract trust & info",
          "Firewall filtering",
          "Cracking WiFi"
        ],
        "answer": 1,
        "explanation": "Pretexting establishes a false context to manipulate targets."
      },
      {
        "q": "What is the best reaction to an urgent request for confidential data from a VP via text?",
        "options": [
          "Send data instantly",
          "Verify through a separate known internal channel",
          "Ignore completely",
          "Post it on social media"
        ],
        "answer": 1,
        "explanation": "Out-of-band verification stops executive impersonation."
      },
      {
        "q": "Why do attackers research targets on social media first?",
        "options": [
          "For fun",
          "To construct tailored pretexts that sound authentic",
          "It is required by law",
          "To test internet speed"
        ],
        "answer": 1,
        "explanation": "Personal context builds rapid rapport and trust."
      }
    ]
  },
  {
    "id": "physical-sec",
    "title": "Physical Security & Tailgating",
    "cat": "Physical Security",
    "icon": "lock2",
    "color1": "#F59E0B",
    "color2": "#10B981",
    "level": "Beginner",
    "desc": "Protect facilities from physical intrusions, badge spoofing, tailgating, and rogue devices.",
    "objectives": [
      "Prevent badge tailgating at secure doors",
      "Identify unauthorized visitors without badges",
      "Spot rogue keyloggers and USB devices"
    ],
    "modules": [
      {
        "title": "Facility & Hardware Security",
        "lessons": [
          {
            "title": "Tailgating & Access Control",
            "type": "reading",
            "dur": "6 min",
            "body": "Protect facilities from physical intrusions, badge spoofing, tailgating, and rogue devices. Understanding the fundamentals of Physical Security & Tailgating is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Physical Security & Tailgating",
              "Recognise early indicators of compromise related to physical security threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Clean Workplace & Hardware Tampering",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Physical Security & Tailgating. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Physical Security & Tailgating",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Physical Security & Tailgating Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Physical Security & Tailgating.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Tailgating in physical security refers to:",
        "options": [
          "Following someone into a secure building without scanning a badge",
          "Driving too close to a car",
          "Monitoring server bandwidth",
          "Email forwarding"
        ],
        "answer": 0,
        "explanation": "Tailgating bypasses badge access control through politeness."
      },
      {
        "q": "If an unbadged stranger follows you into a server room, you should:",
        "options": [
          "Hold the door for them",
          "Politely ask to see their badge or direct them to reception",
          "Ignore them",
          "Give them your keys"
        ],
        "answer": 1,
        "explanation": "Challenge unknown individuals politely to maintain facility security."
      },
      {
        "q": "What is a hardware keylogger?",
        "options": [
          "A software virus",
          "A physical adapter plugged between keyboard and PC to record typing",
          "A wireless mouse",
          "A monitor cable"
        ],
        "answer": 1,
        "explanation": "Hardware keyloggers capture keystrokes directly off physical cables."
      }
    ]
  },
  {
    "id": "insider-threat",
    "title": "Insider Threat Detection & Mitigation",
    "cat": "Social Engineering",
    "icon": "eye",
    "color1": "#8B5CF6",
    "color2": "#EF4444",
    "level": "Intermediate",
    "desc": "Detect and mitigate malicious, negligent, or compromised insider activities within your organisation.",
    "objectives": [
      "Identify indicators of malicious insider intent",
      "Recognise accidental insider data leakage",
      "Implement User and Entity Behavior Analytics (UEBA)"
    ],
    "modules": [
      {
        "title": "Insider Risk Management",
        "lessons": [
          {
            "title": "Malicious vs Negligent Insiders",
            "type": "reading",
            "dur": "6 min",
            "body": "Detect and mitigate malicious, negligent, or compromised insider activities within your organisation. Understanding the fundamentals of Insider Threat Detection & Mitigation is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Insider Threat Detection & Mitigation",
              "Recognise early indicators of compromise related to social engineering threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Behavioral Indicators & Safeguards",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Insider Threat Detection & Mitigation. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Insider Threat Detection & Mitigation",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Insider Threat Detection & Mitigation Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Insider Threat Detection & Mitigation.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "An insider threat can originate from:",
        "options": [
          "Employees only",
          "Employees, contractors, and third-party vendors",
          "Automated bots only",
          "Compromised smart TVs"
        ],
        "answer": 1,
        "explanation": "Anyone with authorized internal access poses insider risk."
      },
      {
        "q": "Which is a classic behavioral indicator of potential insider data theft?",
        "options": [
          "Working standard hours",
          "Mass downloading sensitive files before handing in a resignation",
          "Attending training",
          "Updating passwords"
        ],
        "answer": 1,
        "explanation": "Unusual bulk data downloads often precede employee departure."
      },
      {
        "q": "User and Entity Behavior Analytics (UEBA) helps by:",
        "options": [
          "Baseline normal user activity and flagging anomalous spikes",
          "Blocking all emails",
          "Deleting inactive files",
          "Enforcing password changes daily"
        ],
        "answer": 0,
        "explanation": "UEBA detects unusual access patterns automatically."
      }
    ]
  },
  {
    "id": "deepfake-defense",
    "title": "AI Deepfake & Voice Impersonation",
    "cat": "Social Engineering",
    "icon": "bot",
    "color1": "#EC4899",
    "color2": "#3B82F6",
    "level": "Intermediate",
    "desc": "Identify synthetic voice clones, AI video deepfakes, and automated social engineering bots.",
    "objectives": [
      "Recognise audio artifacts in cloned phone calls",
      "Spot visual glitching in synthetic video calls",
      "Establish shared secret verification words"
    ],
    "modules": [
      {
        "title": "Emerging AI Threats",
        "lessons": [
          {
            "title": "Voice Cloning & Vishing 2.0",
            "type": "reading",
            "dur": "6 min",
            "body": "Identify synthetic voice clones, AI video deepfakes, and automated social engineering bots. Understanding the fundamentals of AI Deepfake & Voice Impersonation is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of AI Deepfake & Voice Impersonation",
              "Recognise early indicators of compromise related to social engineering threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Deepfake Video & Visual Audits",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in AI Deepfake & Voice Impersonation. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for AI Deepfake & Voice Impersonation",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: AI Deepfake & Voice Impersonation Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for AI Deepfake & Voice Impersonation.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Voice cloning technology can copy someone's voice using as little as:",
        "options": [
          "10 hours of studio audio",
          "3 seconds of sample audio from social media",
          "100 written pages",
          "No audio sample needed"
        ],
        "answer": 1,
        "explanation": "Modern generative AI models clone voices from tiny audio samples."
      },
      {
        "q": "How can teams verify the identity of a colleague on an urgent video call?",
        "options": [
          "Rely on their visual face",
          "Ask a pre-arranged out-of-band passphrase or challenge question",
          "Trust the caller ID",
          "Assume video is always real"
        ],
        "answer": 1,
        "explanation": "Shared secret words verify identity beyond synthetic media."
      },
      {
        "q": "Visual glitches common in real-time deepfake video streams include:",
        "options": [
          "Unnatural blinking, blurring around cheekbones, and lighting mismatches",
          "High resolution",
          "Perfect audio sync",
          "Crisp background blur"
        ],
        "answer": 0,
        "explanation": "Deepfakes often show artifacts around face edges and eyes."
      }
    ]
  },
  {
    "id": "clean-desk",
    "title": "Clean Desk & Workstation Hardening",
    "cat": "Physical Security",
    "icon": "file",
    "color1": "#10B981",
    "color2": "#06B6D4",
    "level": "Beginner",
    "desc": "Prevent visual shoulder surfing, exposed sensitive printouts, and unattended workstation access.",
    "objectives": [
      "Enforce screen auto-lock (Win+L / Cmd+Ctrl+Q)",
      "Safeguard physical document storage",
      "Prevent shoulder surfing in open offices"
    ],
    "modules": [
      {
        "title": "Workstation Hygiene",
        "lessons": [
          {
            "title": "Clean Desk & Screen Locking",
            "type": "reading",
            "dur": "6 min",
            "body": "Prevent visual shoulder surfing, exposed sensitive printouts, and unattended workstation access. Understanding the fundamentals of Clean Desk & Workstation Hardening is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Clean Desk & Workstation Hardening",
              "Recognise early indicators of compromise related to physical security threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Document Shredding & Disposal",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Clean Desk & Workstation Hardening. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Clean Desk & Workstation Hardening",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Clean Desk & Workstation Hardening Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Clean Desk & Workstation Hardening.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What keyboard shortcut locks a Windows PC instantly?",
        "options": [
          "Ctrl + C",
          "Win + L",
          "Alt + F4",
          "Ctrl + Alt + Del"
        ],
        "answer": 1,
        "explanation": "Win + L instantly locks Windows workstations."
      },
      {
        "q": "Leaving confidential papers on your desk overnight violates:",
        "options": [
          "Clean Desk Policy",
          "GDPR technical code",
          "Fire code",
          "Network protocol"
        ],
        "answer": 0,
        "explanation": "Clean Desk policy requires locking away sensitive physical documents."
      },
      {
        "q": "Shoulder surfing refers to:",
        "options": [
          "Surfing on a surfboard",
          "Looking over someone's shoulder to view confidential screen data",
          "Riding on a subway",
          "Scanning WiFi networks"
        ],
        "answer": 1,
        "explanation": "Attackers observe screens visually in public or open spaces."
      }
    ]
  },
  {
    "id": "malware-def",
    "title": "Malware Awareness & Defense",
    "cat": "Malware",
    "icon": "bot",
    "color1": "#EF4444",
    "color2": "#8B5CF6",
    "level": "Intermediate",
    "desc": "Understand how malware infiltrates systems, recognise early symptoms, and deploy defense-in-depth.",
    "objectives": [
      "Differentiate trojans, worms, ransomware, and spyware",
      "Spot signs of endpoint infection",
      "Implement Endpoint Detection and Response (EDR)"
    ],
    "modules": [
      {
        "title": "Malware Taxonomy",
        "lessons": [
          {
            "title": "Understanding Malware Types",
            "type": "reading",
            "dur": "6 min",
            "body": "Understand how malware infiltrates systems, recognise early symptoms, and deploy defense-in-depth. Understanding the fundamentals of Malware Awareness & Defense is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Malware Awareness & Defense",
              "Recognise early indicators of compromise related to malware threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Infection Vectors & Detection",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Malware Awareness & Defense. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Malware Awareness & Defense",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Malware Awareness & Defense Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Malware Awareness & Defense.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Which malware self-replicates across networks without human interaction?",
        "options": [
          "Virus",
          "Worm",
          "Trojan",
          "Adware"
        ],
        "answer": 1,
        "explanation": "Worms spread autonomously via network vulnerabilities."
      },
      {
        "q": "Fileless malware is dangerous because it:",
        "options": [
          "Lives entirely in RAM memory without writing files to disk",
          "Only targets mobile phones",
          "Is visible on desktop",
          "Uses USB drives"
        ],
        "answer": 0,
        "explanation": "Memory-only execution evades traditional disk virus scanners."
      },
      {
        "q": "First step when you suspect a machine is infected with active malware:",
        "options": [
          "Turn off power immediately",
          "Disconnect network cable/WiFi while leaving PC powered on",
          "Delete system32",
          "Email all colleagues"
        ],
        "answer": 1,
        "explanation": "Disconnecting stops lateral spread while preserving forensic memory."
      }
    ]
  },
  {
    "id": "ransomware-shield",
    "title": "Ransomware Mitigation & Recovery",
    "cat": "Malware",
    "icon": "shield",
    "color1": "#EF4444",
    "color2": "#10B981",
    "level": "Advanced",
    "desc": "Defend against double-extortion ransomware, encryptor payloads, and exfiltration tactics.",
    "objectives": [
      "Understand the 3-2-1 backup strategy",
      "Protect active directory from domain dominance",
      "Execute ransomware containment playbooks"
    ],
    "modules": [
      {
        "title": "Ransomware Countermeasures",
        "lessons": [
          {
            "title": "Double Extortion Mechanics",
            "type": "reading",
            "dur": "6 min",
            "body": "Defend against double-extortion ransomware, encryptor payloads, and exfiltration tactics. Understanding the fundamentals of Ransomware Mitigation & Recovery is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Ransomware Mitigation & Recovery",
              "Recognise early indicators of compromise related to malware threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Backup Resilience & Isolation",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Ransomware Mitigation & Recovery. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Ransomware Mitigation & Recovery",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Ransomware Mitigation & Recovery Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Ransomware Mitigation & Recovery.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is 'double extortion' in modern ransomware attacks?",
        "options": [
          "Asking for ransom twice",
          "Exfiltrating sensitive data before encrypting it, threatening public leak",
          "Encrypting two servers",
          "Demanding crypto and cash"
        ],
        "answer": 1,
        "explanation": "Attackers steal data to pressure victims even if backups exist."
      },
      {
        "q": "The 3-2-1 backup rule stands for:",
        "options": [
          "3 passwords, 2 users, 1 admin",
          "3 copies of data, 2 different media types, 1 offsite/immutable",
          "3 days retention",
          "3 cloud providers"
        ],
        "answer": 1,
        "explanation": "3-2-1 ensures backups survive ransomware wiping local storage."
      },
      {
        "q": "Why do security experts discourage paying ransoms?",
        "options": [
          "It funds criminal enterprise and guarantees no key will be sent",
          "It causes tax audits",
          "It degrades network speed",
          "It is illegal in all countries"
        ],
        "answer": 0,
        "explanation": "Payment encourages future attacks and yields working keys only ~50% of the time."
      }
    ]
  },
  {
    "id": "doc-security",
    "title": "Document & File Security (Macros)",
    "cat": "Malware",
    "icon": "file",
    "color1": "#22C55E",
    "color2": "#06B6D4",
    "level": "Intermediate",
    "desc": "Identify malicious VBA macros, payload-carrying PDFs, and hazardous file extensions.",
    "objectives": [
      "Recognise macro-enabled file extensions (.docm, .xlsm)",
      "Understand Protected View and Office macro blocking",
      "Safely inspect files in isolated sandboxes"
    ],
    "modules": [
      {
        "title": "Malicious Document Analysis",
        "lessons": [
          {
            "title": "VBA Macros & Exploit Vectors",
            "type": "reading",
            "dur": "6 min",
            "body": "Identify malicious VBA macros, payload-carrying PDFs, and hazardous file extensions. Understanding the fundamentals of Document & File Security (Macros) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Document & File Security (Macros)",
              "Recognise early indicators of compromise related to malware threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Safe File Handling & Sandboxing",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Document & File Security (Macros). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Document & File Security (Macros)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Document & File Security (Macros) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Document & File Security (Macros).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Why do attackers embed VBA macros in Office files?",
        "options": [
          "To format text",
          "To run scripts that silently download malware when opened",
          "To compress files",
          "To translate language"
        ],
        "answer": 1,
        "explanation": "VBA scripts run code to fetch secondary stage malware payloads."
      },
      {
        "q": "If an email document prompts you to 'Enable Content / Enable Editing', you should:",
        "options": [
          "Enable it immediately",
          "Exercise extreme caution and verify sender legitimacy",
          "Forward to all contacts",
          "Rename to .txt"
        ],
        "answer": 1,
        "explanation": "'Enable Content' turns off macro security protections."
      },
      {
        "q": "Which file extension indicates a macro-enabled Word document?",
        "options": [
          ".docx",
          ".docm",
          ".pdf",
          ".txt"
        ],
        "answer": 1,
        "explanation": ".docm files contain executable macros."
      }
    ]
  },
  {
    "id": "endpoint-edr",
    "title": "Endpoint Detection & Response (EDR)",
    "cat": "Malware",
    "icon": "activity",
    "color1": "#3B82F6",
    "color2": "#EC4899",
    "level": "Advanced",
    "desc": "Deploy EDR/XDR agents to continuously monitor endpoint telemetry, processes, and network connections.",
    "objectives": [
      "Analyze endpoint telemetry and process trees",
      "Detect parent-child process anomalies (e.g. word.exe spawning powershell.exe)",
      "Execute remote device isolation"
    ],
    "modules": [
      {
        "title": "Endpoint Telemetry & Hunting",
        "lessons": [
          {
            "title": "EDR Architecture vs Traditional AV",
            "type": "reading",
            "dur": "6 min",
            "body": "Deploy EDR/XDR agents to continuously monitor endpoint telemetry, processes, and network connections. Understanding the fundamentals of Endpoint Detection & Response (EDR) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Endpoint Detection & Response (EDR)",
              "Recognise early indicators of compromise related to malware threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Process Lineage & Anomaly Detection",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Endpoint Detection & Response (EDR). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Endpoint Detection & Response (EDR)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Endpoint Detection & Response (EDR) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Endpoint Detection & Response (EDR).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Traditional Antivirus relies primarily on:",
        "options": [
          "Behavioral AI",
          "Known file hash signatures",
          "Quantum computing",
          "Manual reviews"
        ],
        "answer": 1,
        "explanation": "Legacy AV checks file signatures against static databases."
      },
      {
        "q": "Why is 'word.exe' spawning 'powershell.exe' suspicious in EDR telemetry?",
        "options": [
          "It is normal behavior",
          "Office apps rarely need to launch command interpreters unless exploiting macros",
          "PowerShell is disabled",
          "Word runs faster in PowerShell"
        ],
        "answer": 1,
        "explanation": "Process spawning anomalies indicate malicious script execution."
      },
      {
        "q": "What action does an EDR agent take during an active incident?",
        "options": [
          "Isolates the host network stack remotely while maintaining EDR telemetry",
          "Deletes all user files",
          "Reboots the server",
          "Sends a fax"
        ],
        "answer": 0,
        "explanation": "Network isolation contains threats while keeping SOC control."
      }
    ]
  },
  {
    "id": "usb-sec",
    "title": "Removable Media & USB Safeguards",
    "cat": "Malware",
    "icon": "key",
    "color1": "#F59E0B",
    "color2": "#3B82F6",
    "level": "Beginner",
    "desc": "Block USB drop attacks, Rubber Ducky keystroke injection devices, and unauthorized data exfiltration.",
    "objectives": [
      "Recognise USB drop attack baiting",
      "Defend against BadUSB hardware attacks",
      "Enforce USB device encryption and port controls"
    ],
    "modules": [
      {
        "title": "Hardware Vector Control",
        "lessons": [
          {
            "title": "USB Drop Scams & Rubber Ducky",
            "type": "reading",
            "dur": "6 min",
            "body": "Block USB drop attacks, Rubber Ducky keystroke injection devices, and unauthorized data exfiltration. Understanding the fundamentals of Removable Media & USB Safeguards is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Removable Media & USB Safeguards",
              "Recognise early indicators of compromise related to malware threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "USB Control Policies & Encryption",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Removable Media & USB Safeguards. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Removable Media & USB Safeguards",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Removable Media & USB Safeguards Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Removable Media & USB Safeguards.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "A USB Drop Attack relies on:",
        "options": [
          "Throwing USB drives at servers",
          "Curious employees picking up planted USBs and plugging them into work PCs",
          "Downloading files over WiFi",
          "Cracking passwords"
        ],
        "answer": 1,
        "explanation": "Attackers leave infected USBs in parking lots hoping users plug them in."
      },
      {
        "q": "What is a 'Rubber Ducky' in cybersecurity?",
        "options": [
          "A bath toy",
          "A USB drive configured as a high-speed keystroke injection keyboard",
          "A firewall brand",
          "An antivirus scanner"
        ],
        "answer": 1,
        "explanation": "It pretends to be a keyboard to execute commands in seconds."
      },
      {
        "q": "What is the best corporate policy for unknown USB drives?",
        "options": [
          "Plug into home PC first",
          "Hand them directly to IT/Security without plugging them in",
          "Format them immediately",
          "Share with colleagues"
        ],
        "answer": 1,
        "explanation": "IT uses isolated non-connected hardware to analyze media."
      }
    ]
  },
  {
    "id": "wifi-safety",
    "title": "Securing Home & Public WiFi",
    "cat": "Network",
    "icon": "wifi",
    "color1": "#06B6D4",
    "color2": "#3B82F6",
    "level": "Beginner",
    "desc": "Secure home router configurations and navigate untrusted public WiFi networks safely.",
    "objectives": [
      "Harden home router default settings",
      "Recognise Evil Twin rogue access points",
      "Use VPNs on untrusted wireless networks"
    ],
    "modules": [
      {
        "title": "Wireless Defense",
        "lessons": [
          {
            "title": "Home Router Hardening",
            "type": "reading",
            "dur": "6 min",
            "body": "Secure home router configurations and navigate untrusted public WiFi networks safely. Understanding the fundamentals of Securing Home & Public WiFi is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Securing Home & Public WiFi",
              "Recognise early indicators of compromise related to network threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Public WiFi Risks & Evil Twins",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Securing Home & Public WiFi. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Securing Home & Public WiFi",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Securing Home & Public WiFi Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Securing Home & Public WiFi.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is the first configuration to change on a new home router?",
        "options": [
          "WiFi name color",
          "Default admin username and password",
          "Antenna position",
          "Power cord"
        ],
        "answer": 1,
        "explanation": "Default router admin credentials are standard knowledge for hackers."
      },
      {
        "q": "An 'Evil Twin' attack in public WiFi involves:",
        "options": [
          "A duplicate rogue access point with identical SSID created by an attacker",
          "Two routers connected together",
          "Fast WiFi speeds",
          "Satellite internet"
        ],
        "answer": 0,
        "explanation": "Evil twins mimic legitimate WiFi SSIDs to intercept traffic."
      },
      {
        "q": "Which WiFi encryption standard is current best practice?",
        "options": [
          "WEP",
          "WPA3 (or WPA2-AES)",
          "Open / None",
          "HTTP"
        ],
        "answer": 1,
        "explanation": "WPA3 provides robust cryptographic security."
      }
    ]
  },
  {
    "id": "vpn-ztna",
    "title": "VPN & Zero Trust Access (ZTNA)",
    "cat": "Network",
    "icon": "shield",
    "color1": "#10B981",
    "color2": "#8B5CF6",
    "level": "Intermediate",
    "desc": "Transition from legacy perimeter VPNs to identity-centric Zero Trust Network Access (ZTNA).",
    "objectives": [
      "Compare IPsec/TLS VPNs vs ZTNA",
      "Enforce 'Never Trust, Always Verify'",
      "Implement micro-segmentation"
    ],
    "modules": [
      {
        "title": "Zero Trust Architecture",
        "lessons": [
          {
            "title": "Perimeter VPN Limitations",
            "type": "reading",
            "dur": "6 min",
            "body": "Transition from legacy perimeter VPNs to identity-centric Zero Trust Network Access (ZTNA). Understanding the fundamentals of VPN & Zero Trust Access (ZTNA) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of VPN & Zero Trust Access (ZTNA)",
              "Recognise early indicators of compromise related to network threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Zero Trust Core Principles",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in VPN & Zero Trust Access (ZTNA). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for VPN & Zero Trust Access (ZTNA)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: VPN & Zero Trust Access (ZTNA) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for VPN & Zero Trust Access (ZTNA).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is the core premise of Zero Trust Security?",
        "options": [
          "Trust all internal network devices",
          "Never trust, always verify every access request regardless of location",
          "Trust users with strong passwords",
          "Disable all firewalls"
        ],
        "answer": 1,
        "explanation": "Zero Trust assumes network segments are inherently compromised."
      },
      {
        "q": "How does ZTNA improve upon traditional VPN access?",
        "options": [
          "VPN grants full network access; ZTNA grants granular app-level access",
          "ZTNA requires no passwords",
          "VPN is faster",
          "ZTNA works without internet"
        ],
        "answer": 0,
        "explanation": "ZTNA prevents lateral movement by scoping access to single apps."
      },
      {
        "q": "Micro-segmentation in network design prevents:",
        "options": [
          "Attackers from moving laterally across internal subnets",
          "High internet bills",
          "Router overheating",
          "DNS lookups"
        ],
        "answer": 0,
        "explanation": "Micro-segmentation isolates subnets with granular policy controls."
      }
    ]
  },
  {
    "id": "firewall-ids",
    "title": "Firewalls, IDS & IPS Systems",
    "cat": "Network",
    "icon": "server",
    "color1": "#EF4444",
    "color2": "#3B82F6",
    "level": "Intermediate",
    "desc": "Configure Next-Generation Firewalls (NGFW) and Intrusion Detection/Prevention Systems.",
    "objectives": [
      "Understand stateless vs stateful packet inspection",
      "Differentiate IDS alerts vs IPS inline blocking",
      "Write basic Snort/YARA rules"
    ],
    "modules": [
      {
        "title": "Traffic Filtering & Detection",
        "lessons": [
          {
            "title": "Firewall Architecture",
            "type": "reading",
            "dur": "6 min",
            "body": "Configure Next-Generation Firewalls (NGFW) and Intrusion Detection/Prevention Systems. Understanding the fundamentals of Firewalls, IDS & IPS Systems is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Firewalls, IDS & IPS Systems",
              "Recognise early indicators of compromise related to network threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "IDS vs IPS Inline Prevention",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Firewalls, IDS & IPS Systems. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Firewalls, IDS & IPS Systems",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Firewalls, IDS & IPS Systems Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Firewalls, IDS & IPS Systems.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is the key difference between an IDS and an IPS?",
        "options": [
          "IDS detects and alerts; IPS actively blocks malicious traffic inline",
          "IDS is hardware; IPS is software",
          "IPS only monitors email",
          "They are identical"
        ],
        "answer": 0,
        "explanation": "IPS acts inline to drop matching attack packets."
      },
      {
        "q": "A Next-Generation Firewall (NGFW) operates at which OSI layers?",
        "options": [
          "Layer 3 only",
          "Up to Layer 7 (Application layer inspection)",
          "Layer 1 physical",
          "Layer 2 data link"
        ],
        "answer": 1,
        "explanation": "NGFWs inspect application traffic, signatures, and URLs."
      },
      {
        "q": "What rule default is best practice for firewall access control lists (ACL)?",
        "options": [
          "Implicit Allow",
          "Implicit Deny All",
          "Allow HTTP only",
          "Deny admin only"
        ],
        "answer": 1,
        "explanation": "Implicit Deny blocks everything not explicitly permitted."
      }
    ]
  },
  {
    "id": "dns-sec",
    "title": "DNS Security & Tunneling Prevention",
    "cat": "Network",
    "icon": "globe",
    "color1": "#3B82F6",
    "color2": "#10B981",
    "level": "Advanced",
    "desc": "Protect domain name resolution from DNS spoofing, cache poisoning, and covert data tunneling.",
    "objectives": [
      "Deploy DNSSEC cryptographic validation",
      "Detect DNS tunneling data exfiltration",
      "Implement Protective DNS (PDNS) filtering"
    ],
    "modules": [
      {
        "title": "Domain Infrastructure Security",
        "lessons": [
          {
            "title": "DNS Threats & Cache Poisoning",
            "type": "reading",
            "dur": "6 min",
            "body": "Protect domain name resolution from DNS spoofing, cache poisoning, and covert data tunneling. Understanding the fundamentals of DNS Security & Tunneling Prevention is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of DNS Security & Tunneling Prevention",
              "Recognise early indicators of compromise related to network threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "DNSSEC & Protective DNS",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in DNS Security & Tunneling Prevention. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for DNS Security & Tunneling Prevention",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: DNS Security & Tunneling Prevention Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for DNS Security & Tunneling Prevention.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "DNS Cache Poisoning tricks a resolver into:",
        "options": [
          "Returning fake IP addresses for legitimate domain queries",
          "Shutting down DNS servers",
          "Deleting domain names",
          "Encrypting web pages"
        ],
        "answer": 0,
        "explanation": "Attackers inject false DNS records to redirect web traffic."
      },
      {
        "q": "What does DNSSEC add to domain name queries?",
        "options": [
          "Cryptographic digital signatures verifying DNS record authenticity",
          "Faster download speeds",
          "Free domain registration",
          "Automatic HTTPS"
        ],
        "answer": 0,
        "explanation": "DNSSEC signs DNS records to prevent tampering."
      },
      {
        "q": "DNS Tunneling is used by malware to:",
        "options": [
          "Exfiltrate data or receive C2 commands disguised as DNS lookup requests",
          "Speed up WiFi",
          "Crack passwords",
          "Bypass MFA"
        ],
        "answer": 0,
        "explanation": "Tunneling hides stolen data inside TXT or A query payloads."
      }
    ]
  },
  {
    "id": "remote-work",
    "title": "Hybrid & Remote Work Cybersecurity",
    "cat": "Network",
    "icon": "phone",
    "color1": "#8B5CF6",
    "color2": "#EC4899",
    "level": "Beginner",
    "desc": "Secure personal devices (BYOD), home networks, and remote conferencing tools.",
    "objectives": [
      "Secure home office workstations",
      "Prevent screen privacy leaks during video calls",
      "Enforce Mobile Device Management (MDM)"
    ],
    "modules": [
      {
        "title": "Remote Workforce Security",
        "lessons": [
          {
            "title": "BYOD Risks & Hygiene",
            "type": "reading",
            "dur": "6 min",
            "body": "Secure personal devices (BYOD), home networks, and remote conferencing tools. Understanding the fundamentals of Hybrid & Remote Work Cybersecurity is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Hybrid & Remote Work Cybersecurity",
              "Recognise early indicators of compromise related to network threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Video Call Privacy & Link Safety",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Hybrid & Remote Work Cybersecurity. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Hybrid & Remote Work Cybersecurity",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Hybrid & Remote Work Cybersecurity Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Hybrid & Remote Work Cybersecurity.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "When sharing your screen on a remote video call, you should:",
        "options": [
          "Share your whole desktop",
          "Share only the specific application window needed",
          "Leave personal messaging apps open",
          "Show confidential files"
        ],
        "answer": 1,
        "explanation": "App window sharing prevents accidental data exposure."
      },
      {
        "q": "Mobile Device Management (MDM) software enables IT to:",
        "options": [
          "Read personal text messages",
          "Remotely wipe corporate data if a device is lost or stolen",
          "Track web browsing 24/7",
          "Change your wallpaper"
        ],
        "answer": 1,
        "explanation": "MDM enforces security policies and remote data erasure."
      },
      {
        "q": "Connecting a work laptop to an unencrypted public smart TV is risky because:",
        "options": [
          "It can expose screen contents or allow network interception",
          "It drains battery",
          "It breaks the TV",
          "It turns off WiFi"
        ],
        "answer": 0,
        "explanation": "Untrusted display devices can mirror or capture visual data."
      }
    ]
  },
  {
    "id": "cloud-sec",
    "title": "Cloud Security Essentials (AWS/Azure/GCP)",
    "cat": "Cloud",
    "icon": "cloud",
    "color1": "#3B82F6",
    "color2": "#06B6D4",
    "level": "Intermediate",
    "desc": "Master the Cloud Shared Responsibility Model and cloud security posture management (CSPM).",
    "objectives": [
      "Understand Shared Responsibility across IaaS, PaaS, SaaS",
      "Identify cloud misconfigurations",
      "Enforce Cloud IAM policies"
    ],
    "modules": [
      {
        "title": "Cloud Architecture Security",
        "lessons": [
          {
            "title": "Shared Responsibility Framework",
            "type": "reading",
            "dur": "6 min",
            "body": "Master the Cloud Shared Responsibility Model and cloud security posture management (CSPM). Understanding the fundamentals of Cloud Security Essentials (AWS/Azure/GCP) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Cloud Security Essentials (AWS/Azure/GCP)",
              "Recognise early indicators of compromise related to cloud threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "CSPM & Misconfiguration Defense",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Cloud Security Essentials (AWS/Azure/GCP). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Cloud Security Essentials (AWS/Azure/GCP)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Cloud Security Essentials (AWS/Azure/GCP) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Cloud Security Essentials (AWS/Azure/GCP).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "In Cloud IaaS (Infrastructure as a Service), who is responsible for OS patching?",
        "options": [
          "Cloud Provider (AWS/Azure)",
          "Customer",
          "Domain Registrar",
          "Hardware vendor"
        ],
        "answer": 1,
        "explanation": "In IaaS, the customer manages the guest OS, apps, and data."
      },
      {
        "q": "What is the #1 cause of cloud data breaches?",
        "options": [
          "Zero-day hypervisor exploits",
          "Cloud misconfigurations & publicly exposed storage",
          "Hardware failure",
          "Fiber optic cuts"
        ],
        "answer": 1,
        "explanation": "Misconfigured storage buckets account for the vast majority of leaks."
      },
      {
        "q": "Cloud Security Posture Management (CSPM) tools:",
        "options": [
          "Continuously scan cloud infrastructure for compliance & security flaws",
          "Mine cryptocurrency",
          "Manage server cables",
          "Replace firewalls"
        ],
        "answer": 0,
        "explanation": "CSPM automates drift detection and compliance auditing."
      }
    ]
  },
  {
    "id": "container-sec",
    "title": "Container & Docker Security",
    "cat": "Cloud",
    "icon": "layers",
    "color1": "#06B6D4",
    "color2": "#3B82F6",
    "level": "Intermediate",
    "desc": "Hardening Docker container images, runtime environments, and base registries.",
    "objectives": [
      "Scan container images for CVE vulnerabilities",
      "Avoid running containers as root user",
      "Implement minimal distroless base images"
    ],
    "modules": [
      {
        "title": "Container Image & Runtime Safety",
        "lessons": [
          {
            "title": "Docker File Best Practices",
            "type": "reading",
            "dur": "6 min",
            "body": "Hardening Docker container images, runtime environments, and base registries. Understanding the fundamentals of Container & Docker Security is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Container & Docker Security",
              "Recognise early indicators of compromise related to cloud threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Container Isolation & Scanning",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Container & Docker Security. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Container & Docker Security",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Container & Docker Security Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Container & Docker Security.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Why should container processes avoid running as 'root'?",
        "options": [
          "Root causes slow builds",
          "If container isolation breaks, the attacker gains host root access",
          "Docker forbids it",
          "Root increases file size"
        ],
        "answer": 1,
        "explanation": "Running as non-root limits container breakout impact."
      },
      {
        "q": "Distroless container base images enhance security by:",
        "options": [
          "Including full Linux desktop GUI",
          "Removing package managers, shells, and unnecessary binaries",
          "Adding extra tools",
          "Compressing zip files"
        ],
        "answer": 1,
        "explanation": "Removing utilities shrinks the available attack surface."
      },
      {
        "q": "Container vulnerability scanners analyze:",
        "options": [
          "OS packages and application dependencies inside the image layer",
          "CPU temperatures",
          "Network cables",
          "RAM brand"
        ],
        "answer": 0,
        "explanation": "Scanners check installed binaries against CVE databases."
      }
    ]
  },
  {
    "id": "k8s-sec",
    "title": "Kubernetes Cluster Hardening & RBAC",
    "cat": "Cloud",
    "icon": "server",
    "color1": "#8B5CF6",
    "color2": "#3B82F6",
    "level": "Advanced",
    "desc": "Secure Kubernetes API servers, etcd datastores, pod security standards, and RBAC policies.",
    "objectives": [
      "Harden Kubernetes API server authentication",
      "Enforce Pod Security Standards (Restricted)",
      "Audit Kube-RBAC roles"
    ],
    "modules": [
      {
        "title": "Kubernetes Orchestration Security",
        "lessons": [
          {
            "title": "K8s Control Plane Defense",
            "type": "reading",
            "dur": "6 min",
            "body": "Secure Kubernetes API servers, etcd datastores, pod security standards, and RBAC policies. Understanding the fundamentals of Kubernetes Cluster Hardening & RBAC is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Kubernetes Cluster Hardening & RBAC",
              "Recognise early indicators of compromise related to cloud threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Pod Security & RBAC Policies",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Kubernetes Cluster Hardening & RBAC. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Kubernetes Cluster Hardening & RBAC",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Kubernetes Cluster Hardening & RBAC Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Kubernetes Cluster Hardening & RBAC.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "In Kubernetes RBAC, a RoleBinding maps:",
        "options": [
          "Subjects (users/service accounts) to specific permissions within a namespace",
          "Pod to Node",
          "Docker to VM",
          "DNS to IP"
        ],
        "answer": 0,
        "explanation": "RBAC binds roles with permissions to service accounts or users."
      },
      {
        "q": "Why must the Kubernetes etcd datastore be encrypted at rest?",
        "options": [
          "It stores all cluster state and secrets in plain text by default",
          "It speeds up API calls",
          "Etcd uses no disk space",
          "It runs on Linux"
        ],
        "answer": 0,
        "explanation": "Etcd contains plaintext secrets unless encryption-at-rest is configured."
      },
      {
        "q": "NetworkPolicies in Kubernetes act as:",
        "options": [
          "Cluster-internal firewall rules restricting traffic between pods",
          "Load balancers",
          "DNS lookups",
          "Storage mounters"
        ],
        "answer": 0,
        "explanation": "NetworkPolicies restrict ingress and egress between pod subnets."
      }
    ]
  },
  {
    "id": "serverless-sec",
    "title": "Serverless Security (AWS Lambda/Functions)",
    "cat": "Cloud",
    "icon": "cpu",
    "color1": "#EC4899",
    "color2": "#8B5CF6",
    "level": "Advanced",
    "desc": "Protect event-driven serverless architectures, function permissions, and cold-start risks.",
    "objectives": [
      "Apply granular per-function IAM roles",
      "Prevent event injection attacks",
      "Manage secret tokens in serverless environments"
    ],
    "modules": [
      {
        "title": "Serverless Protection",
        "lessons": [
          {
            "title": "Function Granularity & Least Privilege",
            "type": "reading",
            "dur": "6 min",
            "body": "Protect event-driven serverless architectures, function permissions, and cold-start risks. Understanding the fundamentals of Serverless Security (AWS Lambda/Functions) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Serverless Security (AWS Lambda/Functions)",
              "Recognise early indicators of compromise related to cloud threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Event Injection & Secret Management",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Serverless Security (AWS Lambda/Functions). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Serverless Security (AWS Lambda/Functions)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Serverless Security (AWS Lambda/Functions) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Serverless Security (AWS Lambda/Functions).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Why is giving a single IAM role to all Lambda functions risky?",
        "options": [
          "Lambda functions charge more",
          "Over-privileged roles allow a breach in one function to compromise all cloud assets",
          "Lambda crashes",
          "Function times out"
        ],
        "answer": 1,
        "explanation": "Every function requires a dedicated minimal IAM role."
      },
      {
        "q": "Event injection in serverless occurs when:",
        "options": [
          "Untrusted data in event triggers (S3, SQS, API Gateway) executes arbitrary code",
          "Cold starts occur",
          "Function memory fills up",
          "JSON is parsed"
        ],
        "answer": 0,
        "explanation": "Malicious inputs embedded in event payloads manipulate logic."
      },
      {
        "q": "Where should API keys be stored in AWS Lambda?",
        "options": [
          "Hardcoded in function source code",
          "AWS Secrets Manager or Parameter Store encrypted",
          "In console log output",
          "In public git repo"
        ],
        "answer": 1,
        "explanation": "Secrets services store credentials securely outside code."
      }
    ]
  },
  {
    "id": "cloud-storage",
    "title": "Cloud Storage Protection (S3 / Blob)",
    "cat": "Cloud",
    "icon": "database",
    "color1": "#10B981",
    "color2": "#06B6D4",
    "level": "Intermediate",
    "desc": "Prevent public bucket leaks, enforce client/server encryption, and audit storage access.",
    "objectives": [
      "Block public S3 access at account level",
      "Configure SSE-KMS bucket encryption",
      "Enable S3 Object Lock and access logging"
    ],
    "modules": [
      {
        "title": "Object Storage Security",
        "lessons": [
          {
            "title": "Preventing Storage Misconfigurations",
            "type": "reading",
            "dur": "6 min",
            "body": "Prevent public bucket leaks, enforce client/server encryption, and audit storage access. Understanding the fundamentals of Cloud Storage Protection (S3 / Blob) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Cloud Storage Protection (S3 / Blob)",
              "Recognise early indicators of compromise related to cloud threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Encryption & Versioning Safeguards",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Cloud Storage Protection (S3 / Blob). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Cloud Storage Protection (S3 / Blob)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Cloud Storage Protection (S3 / Blob) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Cloud Storage Protection (S3 / Blob).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is the AWS feature 'S3 Block Public Access' designed to do?",
        "options": [
          "Block all internet connections",
          "Act as a centralized guardrail preventing any bucket from becoming public",
          "Delete old files",
          "Encrypt files"
        ],
        "answer": 1,
        "explanation": "Block Public Access overrides permissive bucket policies globally."
      },
      {
        "q": "S3 Object Lock protects against ransomware by enforcing:",
        "options": [
          "Write Once Read Many (WORM) immutability",
          "File deletion",
          "Compression",
          "Public sharing"
        ],
        "answer": 0,
        "explanation": "Immutability prevents deletion or alteration during retention periods."
      },
      {
        "q": "Enabling bucket access logging provides:",
        "options": [
          "Faster downloads",
          "An audit trail of every GET/PUT request made to stored objects",
          "Free storage",
          "Automatic virus deletion"
        ],
        "answer": 1,
        "explanation": "Access logs track access requests for incident investigations."
      }
    ]
  },
  {
    "id": "owasp-top-10",
    "title": "OWASP Top 10 Web Vulnerabilities",
    "cat": "Application Security",
    "icon": "code",
    "color1": "#EF4444",
    "color2": "#F59E0B",
    "level": "Intermediate",
    "desc": "Understand the 10 most critical web application security risks defined by OWASP.",
    "objectives": [
      "Explore Broken Access Control, Injection, SSRF",
      "Understand Cryptographic Failures",
      "Remediate Security Misconfigurations"
    ],
    "modules": [
      {
        "title": "Web Risk Standard",
        "lessons": [
          {
            "title": "Top OWASP Risks Overview",
            "type": "reading",
            "dur": "6 min",
            "body": "Understand the 10 most critical web application security risks defined by OWASP. Understanding the fundamentals of OWASP Top 10 Web Vulnerabilities is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of OWASP Top 10 Web Vulnerabilities",
              "Recognise early indicators of compromise related to application security threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Access Control & Injection Focus",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in OWASP Top 10 Web Vulnerabilities. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for OWASP Top 10 Web Vulnerabilities",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: OWASP Top 10 Web Vulnerabilities Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for OWASP Top 10 Web Vulnerabilities.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Which risk currently holds the #1 spot on the OWASP Top 10?",
        "options": [
          "Cross-Site Scripting",
          "Broken Access Control",
          "SQL Injection",
          "Buffer Overflow"
        ],
        "answer": 1,
        "explanation": "Broken Access Control accounts for the highest frequency of web flaws."
      },
      {
        "q": "Server-Side Request Forgery (SSRF) allows an attacker to:",
        "options": [
          "Force the web server to send forged requests to internal private resources",
          "Steal local WiFi password",
          "Format client PC",
          "Crash browser"
        ],
        "answer": 0,
        "explanation": "SSRF targets internal endpoints reachable only by the server."
      },
      {
        "q": "Insecure Deserialization vulnerabilities occur when:",
        "options": [
          "Untrusted data is used to populate application objects without validation",
          "Images load slowly",
          "Cookies expire",
          "HTTPS is disabled"
        ],
        "answer": 0,
        "explanation": "Manipulated serialized objects can lead to remote code execution."
      }
    ]
  },
  {
    "id": "api-sec",
    "title": "API Security Best Practices (REST/GraphQL)",
    "cat": "Application Security",
    "icon": "terminal",
    "color1": "#3B82F6",
    "color2": "#8B5CF6",
    "level": "Advanced",
    "desc": "Harden REST & GraphQL endpoints against Broken Object Level Authorization (BOLA) and rate limits.",
    "objectives": [
      "Mitigate BOLA / IDOR vulnerabilities",
      "Implement rate limiting and throttling",
      "Validate OpenAPI schemas strictly"
    ],
    "modules": [
      {
        "title": "API Security Standard",
        "lessons": [
          {
            "title": "BOLA (OWASP API #1) Mechanics",
            "type": "reading",
            "dur": "6 min",
            "body": "Harden REST & GraphQL endpoints against Broken Object Level Authorization (BOLA) and rate limits. Understanding the fundamentals of API Security Best Practices (REST/GraphQL) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of API Security Best Practices (REST/GraphQL)",
              "Recognise early indicators of compromise related to application security threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Rate Limiting & Authentication",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in API Security Best Practices (REST/GraphQL). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for API Security Best Practices (REST/GraphQL)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: API Security Best Practices (REST/GraphQL) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for API Security Best Practices (REST/GraphQL).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Broken Object Level Authorization (BOLA) occurs when an API:",
        "options": [
          "Does not check if the authenticated user owns the requested object ID",
          "Has slow response time",
          "Returns 500 status code",
          "Uses JSON format"
        ],
        "answer": 0,
        "explanation": "BOLA lets users access objects belonging to other users by tweaking IDs."
      },
      {
        "q": "Why is API Rate Limiting critical for defense?",
        "options": [
          "It prevents brute force attacks, credential stuffing, and DoS resource exhaustion",
          "It reduces hosting cost",
          "It improves SEO",
          "It fixes bugs"
        ],
        "answer": 0,
        "explanation": "Rate limiting restricts automated request spam."
      },
      {
        "q": "In GraphQL security, 'Query Depth Limiting' prevents:",
        "options": [
          "Nested recursive queries designed to crash database resources",
          "User logins",
          "Schema introspection",
          "HTTP POST requests"
        ],
        "answer": 0,
        "explanation": "Deeply nested GraphQL queries cause server denial of service."
      }
    ]
  },
  {
    "id": "sqli-defense",
    "title": "SQL Injection Prevention",
    "cat": "Application Security",
    "icon": "database",
    "color1": "#EF4444",
    "color2": "#3B82F6",
    "level": "Intermediate",
    "desc": "Defend relational databases from SQL injection (SQLi) attacks using parameterized queries.",
    "objectives": [
      "Understand how malicious input alters SQL query logic",
      "Implement Parameterized Queries / Prepared Statements",
      "Enforce database least privilege"
    ],
    "modules": [
      {
        "title": "Database Query Defense",
        "lessons": [
          {
            "title": "SQLi Exploitation Mechanics",
            "type": "reading",
            "dur": "6 min",
            "body": "Defend relational databases from SQL injection (SQLi) attacks using parameterized queries. Understanding the fundamentals of SQL Injection Prevention is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of SQL Injection Prevention",
              "Recognise early indicators of compromise related to application security threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Prepared Statements & ORMs",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in SQL Injection Prevention. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for SQL Injection Prevention",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: SQL Injection Prevention Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for SQL Injection Prevention.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "The fundamental cause of SQL Injection is:",
        "options": [
          "Concatenating unescaped user input directly into database query strings",
          "Using MySQL instead of PostgreSQL",
          "Slow database hardware",
          "Missing indexes"
        ],
        "answer": 0,
        "explanation": "String concatenation allows user input to alter SQL execution syntax."
      },
      {
        "q": "Which coding pattern effectively eliminates SQL Injection?",
        "options": [
          "Input length limit",
          "Parameterized queries / Prepared statements",
          "Encrypting database",
          "Using GET instead of POST"
        ],
        "answer": 1,
        "explanation": "Prepared statements separate SQL code logic from data parameters."
      },
      {
        "q": "What can an attacker achieve via Blind SQL Injection?",
        "options": [
          "Infer database data character-by-character using true/false boolean or time delays",
          "Nothing",
          "Speed up query",
          "Format database RAM"
        ],
        "answer": 0,
        "explanation": "Blind SQLi extracts data by analyzing server response behavior."
      }
    ]
  },
  {
    "id": "xss-csrf",
    "title": "Cross-Site Scripting (XSS) & CSRF",
    "cat": "Application Security",
    "icon": "code",
    "color1": "#F59E0B",
    "color2": "#EC4899",
    "level": "Intermediate",
    "desc": "Block XSS JavaScript injection and Cross-Site Request Forgery attack vectors.",
    "objectives": [
      "Identify Stored, Reflected, and DOM-based XSS",
      "Implement Content Security Policy (CSP)",
      "Enforce SameSite cookies and Anti-CSRF tokens"
    ],
    "modules": [
      {
        "title": "Client-Side Attack Defense",
        "lessons": [
          {
            "title": "XSS Taxonomy & CSP Mitigation",
            "type": "reading",
            "dur": "6 min",
            "body": "Block XSS JavaScript injection and Cross-Site Request Forgery attack vectors. Understanding the fundamentals of Cross-Site Scripting (XSS) & CSRF is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Cross-Site Scripting (XSS) & CSRF",
              "Recognise early indicators of compromise related to application security threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "CSRF Protection & SameSite Cookies",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Cross-Site Scripting (XSS) & CSRF. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Cross-Site Scripting (XSS) & CSRF",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Cross-Site Scripting (XSS) & CSRF Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Cross-Site Scripting (XSS) & CSRF.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Cross-Site Scripting (XSS) allows attackers to:",
        "options": [
          "Execute arbitrary JavaScript in the victim's browser context",
          "Format the server drive",
          "Read database files directly",
          "Crack WiFi passwords"
        ],
        "answer": 0,
        "explanation": "XSS runs malicious client scripts to steal cookies or session tokens."
      },
      {
        "q": "How does a Content Security Policy (CSP) header help mitigate XSS?",
        "options": [
          "It restricts which domains can execute scripts on the web page",
          "It encrypts passwords",
          "It blocks popups",
          "It disables HTML"
        ],
        "answer": 0,
        "explanation": "CSP specifies allowed script sources, blocking inline untrusted scripts."
      },
      {
        "q": "SameSite=Strict cookie attribute prevents CSRF by:",
        "options": [
          "Refusing to send the cookie on cross-site requests",
          "Deleting cookies after 1 minute",
          "Encrypting cookie text",
          "Disabling HTTPS"
        ],
        "answer": 0,
        "explanation": "SameSite prevents browsers from attaching cookies to cross-domain calls."
      }
    ]
  },
  {
    "id": "devsecops",
    "title": "DevSecOps & CI/CD Security",
    "cat": "DevSecOps",
    "icon": "layers",
    "color1": "#10B981",
    "color2": "#3B82F6",
    "level": "Advanced",
    "desc": "Integrate automated security testing (SAST, DAST, SCA) directly into CI/CD build pipelines.",
    "objectives": [
      "Implement Static Application Security Testing (SAST)",
      "Automate Dependency Vulnerability Scanning (SCA)",
      "Secure CI/CD build runners and secrets"
    ],
    "modules": [
      {
        "title": "Pipeline Security Automation",
        "lessons": [
          {
            "title": "SAST, DAST & Software Composition Analysis",
            "type": "reading",
            "dur": "6 min",
            "body": "Integrate automated security testing (SAST, DAST, SCA) directly into CI/CD build pipelines. Understanding the fundamentals of DevSecOps & CI/CD Security is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of DevSecOps & CI/CD Security",
              "Recognise early indicators of compromise related to devsecops threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Securing Pipeline Runners & Secrets",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in DevSecOps & CI/CD Security. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for DevSecOps & CI/CD Security",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: DevSecOps & CI/CD Security Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for DevSecOps & CI/CD Security.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Software Composition Analysis (SCA) tools specifically check:",
        "options": [
          "Third-party open source dependencies for known CVE vulnerabilities",
          "Source code formatting",
          "Network cabling",
          "CPU usage"
        ],
        "answer": 0,
        "explanation": "SCA scans package lock files (npm, pip) for vulnerable libraries."
      },
      {
        "q": "What is the key difference between SAST and DAST?",
        "options": [
          "SAST analyzes source code static state; DAST tests running app dynamically from outside",
          "SAST is for cloud",
          "DAST requires no app",
          "They are identical"
        ],
        "answer": 0,
        "explanation": "SAST inspects code; DAST probes a live running environment."
      },
      {
        "q": "Storing hardcoded CI/CD secret tokens in git repositories is mitigated by:",
        "options": [
          "Pre-commit hooks and automated git secret scanners (e.g. TruffleHog)",
          "Making repo private",
          "Deleting git history",
          "Renaming repository"
        ],
        "answer": 0,
        "explanation": "Secret scanners detect keys before commits push to remote repos."
      }
    ]
  },
  {
    "id": "ai-prompt-inj",
    "title": "AI Prompt Injection & LLM Security",
    "cat": "AI & Emerging Tech",
    "icon": "bot",
    "color1": "#8B5CF6",
    "color2": "#EC4899",
    "level": "Intermediate",
    "desc": "Understand OWASP for LLMs: Direct/Indirect Prompt Injection, Data Poisoning, and Output Handling.",
    "objectives": [
      "Differentiate direct vs indirect prompt injection",
      "Prevent LLM data exfiltration and SSRF",
      "Sanitize LLM output before execution"
    ],
    "modules": [
      {
        "title": "Large Language Model Vulnerabilities",
        "lessons": [
          {
            "title": "Prompt Injection Mechanics",
            "type": "reading",
            "dur": "6 min",
            "body": "Understand OWASP for LLMs: Direct/Indirect Prompt Injection, Data Poisoning, and Output Handling. Understanding the fundamentals of AI Prompt Injection & LLM Security is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of AI Prompt Injection & LLM Security",
              "Recognise early indicators of compromise related to ai & emerging tech threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "OWASP for LLM Applications",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in AI Prompt Injection & LLM Security. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for AI Prompt Injection & LLM Security",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: AI Prompt Injection & LLM Security Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for AI Prompt Injection & LLM Security.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Indirect Prompt Injection occurs when an LLM reads:",
        "options": [
          "Instructions hidden within untrusted external text (e.g. web pages, PDFs)",
          "Direct user chat prompts",
          "System prompts",
          "Source code files"
        ],
        "answer": 0,
        "explanation": "External data sources hijack the model's instruction flow."
      },
      {
        "q": "Why is trusting raw LLM output to execute shell code dangerous?",
        "options": [
          "LLMs can generate unintended or malicious command strings",
          "LLMs write slow code",
          "Shell code uses too much memory",
          "Python is required"
        ],
        "answer": 0,
        "explanation": "Unsanitized output execution can lead to arbitrary code execution."
      },
      {
        "q": "Training data poisoning attacks aim to:",
        "options": [
          "Manipulate the AI model's training set to introduce backdoors or bias",
          "Speed up training",
          "Delete the model",
          "Encrypt training files"
        ],
        "answer": 0,
        "explanation": "Corrupted training data creates predictable model blind spots."
      }
    ]
  },
  {
    "id": "ai-privacy",
    "title": "AI Model Data Privacy & Governance",
    "cat": "AI & Emerging Tech",
    "icon": "shield",
    "color1": "#3B82F6",
    "color2": "#10B981",
    "level": "Intermediate",
    "desc": "Prevent sensitive data leaks into public AI training sets and maintain governance compliance.",
    "objectives": [
      "Understand corporate data loss risks via AI chatbots",
      "Enforce enterprise AI opt-out privacy settings",
      "Implement private self-hosted LLM instances"
    ],
    "modules": [
      {
        "title": "AI Governance Framework",
        "lessons": [
          {
            "title": "Public AI Chatbot Data Leakage",
            "type": "reading",
            "dur": "6 min",
            "body": "Prevent sensitive data leaks into public AI training sets and maintain governance compliance. Understanding the fundamentals of AI Model Data Privacy & Governance is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of AI Model Data Privacy & Governance",
              "Recognise early indicators of compromise related to ai & emerging tech threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Enterprise Governance & Private LLMs",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in AI Model Data Privacy & Governance. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for AI Model Data Privacy & Governance",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: AI Model Data Privacy & Governance Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for AI Model Data Privacy & Governance.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Entering confidential source code or customer data into free public AI chatbots can:",
        "options": [
          "Expose proprietary data to third-party vendors or training pipelines",
          "Improve computer speed",
          "Automatically patch code bugs",
          "Encrypt the data"
        ],
        "answer": 0,
        "explanation": "Public AI tools often retain chat inputs for model training."
      },
      {
        "q": "An Enterprise AI Data Policy should specify:",
        "options": [
          "Which AI tools are approved and what data classification levels are permitted",
          "Which programming language to use",
          "Monitor refresh rates",
          "Keyboard models"
        ],
        "answer": 0,
        "explanation": "Clear policies define allowed data sensitivity levels for AI use."
      },
      {
        "q": "Self-hosting open source LLMs on private infrastructure ensures:",
        "options": [
          "Data never leaves the organisation's security perimeter",
          "Zero cost",
          "100% accurate outputs",
          "No electricity usage"
        ],
        "answer": 0,
        "explanation": "On-prem/VPC models keep prompts inside internal networks."
      }
    ]
  },
  {
    "id": "iot-sec",
    "title": "IoT Device Defense & Hardening",
    "cat": "Mobile & IoT",
    "icon": "cpu",
    "color1": "#06B6D4",
    "color2": "#F59E0B",
    "level": "Intermediate",
    "desc": "Secure smart office hardware, IoT sensors, cameras, and embedded firmware.",
    "objectives": [
      "Change factory default IoT passwords",
      "Isolate IoT devices on dedicated VLANs",
      "Disable unnecessary UPnP services"
    ],
    "modules": [
      {
        "title": "Embedded & IoT Security",
        "lessons": [
          {
            "title": "IoT Threat Landscape & Botnets",
            "type": "reading",
            "dur": "6 min",
            "body": "Secure smart office hardware, IoT sensors, cameras, and embedded firmware. Understanding the fundamentals of IoT Device Defense & Hardening is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of IoT Device Defense & Hardening",
              "Recognise early indicators of compromise related to mobile & iot threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Network Isolation & Firmware Hardening",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in IoT Device Defense & Hardening. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for IoT Device Defense & Hardening",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: IoT Device Defense & Hardening Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for IoT Device Defense & Hardening.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Why were Mirai botnet attacks so massive and successful?",
        "options": [
          "They exploited hundreds of thousands of IoT devices using factory default passwords",
          "They used quantum computers",
          "They hacked mainframes",
          "They targeted satellite links"
        ],
        "answer": 0,
        "explanation": "Default admin passwords allowed rapid automated bot infection."
      },
      {
        "q": "Why should smart office devices (cameras, printers) reside on a guest/IoT VLAN?",
        "options": [
          "To isolate them so a compromised IoT device cannot reach corporate servers",
          "To make them print faster",
          "To save IP addresses",
          "To turn them off"
        ],
        "answer": 0,
        "explanation": "VLAN isolation contains compromised IoT devices."
      },
      {
        "q": "Universal Plug and Play (UPnP) on routers should be disabled because:",
        "options": [
          "It allows devices to automatically open external firewall ports without authentication",
          "It slows down internet",
          "It disables WiFi",
          "It deletes files"
        ],
        "answer": 0,
        "explanation": "UPnP permits untrusted devices to punch holes through firewalls."
      }
    ]
  },
  {
    "id": "supply-chain",
    "title": "Software Supply Chain Security (SBOM)",
    "cat": "DevSecOps",
    "icon": "layers",
    "color1": "#EF4444",
    "color2": "#3B82F6",
    "level": "Advanced",
    "desc": "Defend against compromised open-source packages, dependency confusion, and generate SBOMs.",
    "objectives": [
      "Generate and audit Software Bill of Materials (SBOM)",
      "Detect typosquatting package malicious imports (npm/PyPI)",
      "Pin dependencies with cryptographic hashes"
    ],
    "modules": [
      {
        "title": "Supply Chain Defense",
        "lessons": [
          {
            "title": "Dependency Tampering & Confusion",
            "type": "reading",
            "dur": "6 min",
            "body": "Defend against compromised open-source packages, dependency confusion, and generate SBOMs. Understanding the fundamentals of Software Supply Chain Security (SBOM) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Software Supply Chain Security (SBOM)",
              "Recognise early indicators of compromise related to devsecops threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "SBOM Verification & Package Pinning",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Software Supply Chain Security (SBOM). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Software Supply Chain Security (SBOM)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Software Supply Chain Security (SBOM) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Software Supply Chain Security (SBOM).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "A Software Bill of Materials (SBOM) is:",
        "options": [
          "A comprehensive inventory of all software components and dependencies used in an app",
          "An invoice from vendor",
          "A hardware list",
          "A user manual"
        ],
        "answer": 0,
        "explanation": "SBOMs track component provenance for rapid vulnerability response."
      },
      {
        "q": "Dependency Confusion attacks exploit:",
        "options": [
          "Package managers fetching malicious public packages named identically to internal private modules",
          "Slow internet",
          "Syntax errors",
          "Compiler bugs"
        ],
        "answer": 0,
        "explanation": "Public repositories can shadow internal private package names."
      },
      {
        "q": "Why is pinning package versions with cryptographic lockhashes important?",
        "options": [
          "It prevents automatic fetching of compromised or altered dependency updates",
          "It speeds up builds",
          "It reduces disk size",
          "It fixes syntax"
        ],
        "answer": 0,
        "explanation": "Lockfiles ensure exact binary builds every time."
      }
    ]
  },
  {
    "id": "hipaa-sec",
    "title": "Healthcare Privacy & HIPAA Compliance",
    "cat": "Compliance & Governance",
    "icon": "shield",
    "color1": "#10B981",
    "color2": "#06B6D4",
    "level": "Intermediate",
    "desc": "Protect Protected Health Information (PHI) under HIPAA Privacy and Security rules.",
    "objectives": [
      "Identify Protected Health Information (PHI)",
      "Implement HIPAA Administrative, Physical & Technical Safeguards",
      "Respond to breach notification rules"
    ],
    "modules": [
      {
        "title": "Healthcare Compliance Standard",
        "lessons": [
          {
            "title": "PHI Classification & Scope",
            "type": "reading",
            "dur": "6 min",
            "body": "Protect Protected Health Information (PHI) under HIPAA Privacy and Security rules. Understanding the fundamentals of Healthcare Privacy & HIPAA Compliance is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Healthcare Privacy & HIPAA Compliance",
              "Recognise early indicators of compromise related to compliance & governance threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "HIPAA Security Rule Controls",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Healthcare Privacy & HIPAA Compliance. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Healthcare Privacy & HIPAA Compliance",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Healthcare Privacy & HIPAA Compliance Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Healthcare Privacy & HIPAA Compliance.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What constitutes Protected Health Information (PHI) under HIPAA?",
        "options": [
          "Individually identifiable health data created or received by a covered entity",
          "Company financial reports",
          "Public weather reports",
          "Employee job titles"
        ],
        "answer": 0,
        "explanation": "PHI includes health status, care provision, or payment details linked to identity."
      },
      {
        "q": "Under the HIPAA Security Rule, Technical Safeguards require:",
        "options": [
          "Access control, audit controls, integrity controls, and transmission security (encryption)",
          "Building fences",
          "Employee background checks",
          "Paper shredding only"
        ],
        "answer": 0,
        "explanation": "Technical safeguards enforce electronic PHI protection."
      },
      {
        "q": "What is the Business Associate Agreement (BAA) requirement?",
        "options": [
          "Contracts mandating third-party vendors safeguard PHI according to HIPAA",
          "Job contracts",
          "Lease agreements",
          "Tax forms"
        ],
        "answer": 0,
        "explanation": "BAAs extend HIPAA compliance obligations to vendors."
      }
    ]
  },
  {
    "id": "pci-dss",
    "title": "Payment Card Security (PCI-DSS 4.0)",
    "cat": "Compliance & Governance",
    "icon": "key",
    "color1": "#F59E0B",
    "color2": "#8B5CF6",
    "level": "Advanced",
    "desc": "Comply with PCI-DSS 4.0 requirements for storing, processing, or transmitting credit card data.",
    "objectives": [
      "Understand Cardholder Data Environment (CDE) scope",
      "Never store CVV/CVC sensitive authentication data",
      "Implement strong encryption and tokenization"
    ],
    "modules": [
      {
        "title": "Payment Security Standard",
        "lessons": [
          {
            "title": "PCI-DSS 4.0 Core Requirements",
            "type": "reading",
            "dur": "6 min",
            "body": "Comply with PCI-DSS 4.0 requirements for storing, processing, or transmitting credit card data. Understanding the fundamentals of Payment Card Security (PCI-DSS 4.0) is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Payment Card Security (PCI-DSS 4.0)",
              "Recognise early indicators of compromise related to compliance & governance threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Cardholder Data Environment & Tokenization",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Payment Card Security (PCI-DSS 4.0). By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Payment Card Security (PCI-DSS 4.0)",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Payment Card Security (PCI-DSS 4.0) Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Payment Card Security (PCI-DSS 4.0).",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Under PCI-DSS, which credit card data must NEVER be stored after authorization?",
        "options": [
          "Cardholder Name",
          "Primary Account Number (PAN)",
          "Sensitive Authentication Data (CVV2 / CVC2 / PIN)",
          "Expiration Date"
        ],
        "answer": 2,
        "explanation": "CVV security codes must never be stored under any circumstances."
      },
      {
        "q": "Tokenization reduces PCI-DSS scope by:",
        "options": [
          "Replacing PAN card numbers with non-sensitive surrogate token values",
          "Deleting all files",
          "Disabling credit card payments",
          "Encrypting emails"
        ],
        "answer": 0,
        "explanation": "Tokens remove real card numbers from merchant database scope."
      },
      {
        "q": "Requirement 1 of PCI-DSS 4.0 focuses on:",
        "options": [
          "Installing and maintaining network security controls (firewalls)",
          "Employee wallpaper",
          "Password managers",
          "Customer service"
        ],
        "answer": 0,
        "explanation": "Network security controls isolate the Cardholder Data Environment."
      }
    ]
  },
  {
    "id": "iso-27001",
    "title": "ISO 27001 ISMS Implementation",
    "cat": "Compliance & Governance",
    "icon": "award",
    "color1": "#3B82F6",
    "color2": "#10B981",
    "level": "Advanced",
    "desc": "Build an Information Security Management System (ISMS) aligned with ISO/IEC 27001:2022.",
    "objectives": [
      "Conduct Risk Assessment & Treatment Plans",
      "Define Statement of Applicability (SoA)",
      "Implement Annex A Security Controls"
    ],
    "modules": [
      {
        "title": "International Security Standard",
        "lessons": [
          {
            "title": "ISMS Governance Structure",
            "type": "reading",
            "dur": "6 min",
            "body": "Build an Information Security Management System (ISMS) aligned with ISO/IEC 27001:2022. Understanding the fundamentals of ISO 27001 ISMS Implementation is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of ISO 27001 ISMS Implementation",
              "Recognise early indicators of compromise related to compliance & governance threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Annex A Controls & Certification Audit",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in ISO 27001 ISMS Implementation. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for ISO 27001 ISMS Implementation",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: ISO 27001 ISMS Implementation Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for ISO 27001 ISMS Implementation.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "The core purpose of ISO 27001 is to establish:",
        "options": [
          "An ongoing Information Security Management System (ISMS) based on risk management",
          "A single firewall configuration",
          "A software product",
          "A hardware standard"
        ],
        "answer": 0,
        "explanation": "ISO 27001 provides a holistic framework for managing security risk."
      },
      {
        "q": "What is the Statement of Applicability (SoA)?",
        "options": [
          "A document identifying which Annex A controls were selected and why",
          "A financial invoice",
          "An antivirus log",
          "A press release"
        ],
        "answer": 0,
        "explanation": "The SoA justifies control selection and exclusion decisions."
      },
      {
        "q": "The Plan-Do-Check-Act (PDCA) cycle ensures:",
        "options": [
          "Continuous improvement of security processes over time",
          "One-time security fix",
          "Fast code compilation",
          "Lower tax rates"
        ],
        "answer": 0,
        "explanation": "PDCA drives continuous security posture evolution."
      }
    ]
  },
  {
    "id": "soc2-audit",
    "title": "SOC 2 Type II Audits & Controls",
    "cat": "Compliance & Governance",
    "icon": "shield",
    "color1": "#8B5CF6",
    "color2": "#EC4899",
    "level": "Intermediate",
    "desc": "Prepare for SOC 2 Type II trust services criteria audits (Security, Availability, Confidentiality).",
    "objectives": [
      "Differentiate SOC 2 Type I vs Type II",
      "Align controls with 5 Trust Services Criteria",
      "Gather continuous evidence logs"
    ],
    "modules": [
      {
        "title": "Audit & Attestation Standard",
        "lessons": [
          {
            "title": "SOC 2 Framework & Trust Criteria",
            "type": "reading",
            "dur": "6 min",
            "body": "Prepare for SOC 2 Type II trust services criteria audits (Security, Availability, Confidentiality). Understanding the fundamentals of SOC 2 Type II Audits & Controls is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of SOC 2 Type II Audits & Controls",
              "Recognise early indicators of compromise related to compliance & governance threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Type I vs Type II & Evidence Audit",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in SOC 2 Type II Audits & Controls. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for SOC 2 Type II Audits & Controls",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: SOC 2 Type II Audits & Controls Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for SOC 2 Type II Audits & Controls.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What distinguishes a SOC 2 Type II report from a Type I report?",
        "options": [
          "Type I tests controls at a single point in time; Type II audits operational effectiveness over a period (e.g. 6-12 mos)",
          "Type I is public; Type II secret",
          "Type II is cheaper",
          "Type I is for hardware"
        ],
        "answer": 0,
        "explanation": "Type II evaluates long-term operational consistency."
      },
      {
        "q": "Which Trust Services Criterion is MANDATORY in every SOC 2 audit?",
        "options": [
          "Security (Common Criteria)",
          "Privacy",
          "Processing Integrity",
          "Confidentiality"
        ],
        "answer": 0,
        "explanation": "Security is the baseline required criterion for all SOC 2 audits."
      },
      {
        "q": "Evidence collection in SOC 2 audits requires:",
        "options": [
          "Documented proof of automated logs, ticket approvals, and policy compliance",
          "Verbal promises",
          "Screenshots from 5 years ago",
          "No documentation"
        ],
        "answer": 0,
        "explanation": "Auditors require verifiable evidence of control execution."
      }
    ]
  },
  {
    "id": "data-dlp",
    "title": "Data Loss Prevention (DLP) & Tagging",
    "cat": "Data Protection",
    "icon": "file",
    "color1": "#10B981",
    "color2": "#3B82F6",
    "level": "Intermediate",
    "desc": "Classify sensitive assets, enforce DLP inspection rules, and prevent unauthorized exfiltration.",
    "objectives": [
      "Implement Data Classification Tiers (Public, Internal, Confidential, Restricted)",
      "Deploy Endpoint & Email DLP rules",
      "Prevent USB and cloud exfiltration"
    ],
    "modules": [
      {
        "title": "Data Asset Safeguards",
        "lessons": [
          {
            "title": "Data Classification Schemes",
            "type": "reading",
            "dur": "6 min",
            "body": "Classify sensitive assets, enforce DLP inspection rules, and prevent unauthorized exfiltration. Understanding the fundamentals of Data Loss Prevention (DLP) & Tagging is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Data Loss Prevention (DLP) & Tagging",
              "Recognise early indicators of compromise related to data protection threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "DLP Rule Engine & Enforcement",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Data Loss Prevention (DLP) & Tagging. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Data Loss Prevention (DLP) & Tagging",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Data Loss Prevention (DLP) & Tagging Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Data Loss Prevention (DLP) & Tagging.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is the primary goal of a Data Loss Prevention (DLP) solution?",
        "options": [
          "Detect and block unauthorized transmission of sensitive data outside the perimeter",
          "Delete old emails",
          "Speed up file downloads",
          "Compress database backups"
        ],
        "answer": 0,
        "explanation": "DLP inspects content to prevent sensitive data leaks."
      },
      {
        "q": "Data classification tag 'Restricted' usually applies to:",
        "options": [
          "High-risk data like PII, PCI, or trade secrets that could cause severe damage if leaked",
          "Marketing brochures",
          "Public press releases",
          "Office lunch menus"
        ],
        "answer": 0,
        "explanation": "Restricted classification protects highest sensitivity data."
      },
      {
        "q": "How does DLP inspect encrypted outbound web traffic?",
        "options": [
          "Using TLS Man-in-the-Middle SSL Inspection proxying",
          "Reading user minds",
          "Guessing content",
          "Blocking all traffic"
        ],
        "answer": 0,
        "explanation": "SSL inspection decrypts outbound traffic at the proxy to scan for leaks."
      }
    ]
  },
  {
    "id": "incident-resp",
    "title": "Cyber Incident Response Playbooks",
    "cat": "Incident Response",
    "icon": "alert",
    "color1": "#EF4444",
    "color2": "#F59E0B",
    "level": "Advanced",
    "desc": "Execute the 6 phases of Incident Response (PICERL) to contain breaches rapidly.",
    "objectives": [
      "Master NIST PICERL Incident Response Lifecycle",
      "Perform isolation and containment tactics",
      "Conduct post-incident lessons learned"
    ],
    "modules": [
      {
        "title": "Incident Handling Standard",
        "lessons": [
          {
            "title": "PICERL IR Lifecycle",
            "type": "reading",
            "dur": "6 min",
            "body": "Execute the 6 phases of Incident Response (PICERL) to contain breaches rapidly. Understanding the fundamentals of Cyber Incident Response Playbooks is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Cyber Incident Response Playbooks",
              "Recognise early indicators of compromise related to incident response threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Containment Strategies & Root Cause",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Cyber Incident Response Playbooks. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Cyber Incident Response Playbooks",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Cyber Incident Response Playbooks Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Cyber Incident Response Playbooks.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What are the 6 phases of the NIST Incident Response lifecycle (PICERL)?",
        "options": [
          "Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned",
          "Plan, Input, Code, Edit, Run, Log",
          "Password, IP, Cloud, Email, Risk, Lock",
          "Scan, Detect, Delete, Reboot, Report, Stop"
        ],
        "answer": 0,
        "explanation": "PICERL outlines the standard incident response workflow."
      },
      {
        "q": "During containment, why should responders avoid deleting malware files immediately?",
        "options": [
          "Deleting files too soon destroys forensic evidence needed to determine entry point and scope",
          "Files delete automatically",
          "Malware cannot be deleted",
          "It speeds up network"
        ],
        "answer": 0,
        "explanation": "Preserving artifacts enables root-cause analysis."
      },
      {
        "q": "A Post-Incident Lessons Learned meeting should take place:",
        "options": [
          "Within 1-2 weeks after incident resolution to update playbooks and controls",
          "1 year later",
          "Never",
          "Before the incident occurs"
        ],
        "answer": 0,
        "explanation": "Post-mortems improve future incident resilience."
      }
    ]
  },
  {
    "id": "threat-intel",
    "title": "Threat Intelligence & MITRE ATT&CK",
    "cat": "Threat Intelligence",
    "icon": "target",
    "color1": "#8B5CF6",
    "color2": "#3B82F6",
    "level": "Advanced",
    "desc": "Leverage Cyber Threat Intelligence (CTI) and map adversary tactics with MITRE ATT&CK.",
    "objectives": [
      "Navigate MITRE ATT&CK Matrix (Tactics, Techniques, Sub-techniques)",
      "Utilize Indicators of Compromise (IoCs) & STIX/TAXII",
      "Track Threat Actor Groups (APTs)"
    ],
    "modules": [
      {
        "title": "Threat Intelligence Matrix",
        "lessons": [
          {
            "title": "MITRE ATT&CK Framework Structure",
            "type": "reading",
            "dur": "6 min",
            "body": "Leverage Cyber Threat Intelligence (CTI) and map adversary tactics with MITRE ATT&CK. Understanding the fundamentals of Threat Intelligence & MITRE ATT&CK is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Threat Intelligence & MITRE ATT&CK",
              "Recognise early indicators of compromise related to threat intelligence threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "IoCs, TTPs & CTI Sharing",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Threat Intelligence & MITRE ATT&CK. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Threat Intelligence & MITRE ATT&CK",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Threat Intelligence & MITRE ATT&CK Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Threat Intelligence & MITRE ATT&CK.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What does TTP stand for in Cyber Threat Intelligence?",
        "options": [
          "Tactics, Techniques, and Procedures",
          "Total Threat Protection",
          "Technical Transfer Protocol",
          "Time To Patch"
        ],
        "answer": 0,
        "explanation": "TTPs describe the behavioral patterns of cyber adversaries."
      },
      {
        "q": "In the Pyramid of Pain, which indicator is HARDEST for attackers to change?",
        "options": [
          "TTPs (Tactics, Techniques & Procedures)",
          "IP Addresses",
          "MD5 Hash Values",
          "Domain Names"
        ],
        "answer": 0,
        "explanation": "Changing operational behaviors (TTPs) requires significant effort."
      },
      {
        "q": "STIX and TAXII standards facilitate:",
        "options": [
          "Automated format and transport exchange of cyber threat intelligence data",
          "Video streaming",
          "Password resets",
          "Hard drive formatting"
        ],
        "answer": 0,
        "explanation": "STIX/TAXII standardize threat intelligence sharing across SOCs."
      }
    ]
  },
  {
    "id": "forensics-101",
    "title": "Digital Forensics & Evidence Handling",
    "cat": "Incident Response",
    "icon": "search",
    "color1": "#3B82F6",
    "color2": "#EC4899",
    "level": "Advanced",
    "desc": "Collect digital evidence, maintain chain of custody, and perform memory/disk forensic analysis.",
    "objectives": [
      "Maintain Chain of Custody for court admissibility",
      "Capture volatile RAM memory artifacts",
      "Analyze disk filesystem artifacts (MFT, Registry, Logs)"
    ],
    "modules": [
      {
        "title": "Forensic Methodology",
        "lessons": [
          {
            "title": "Chain of Custody & Evidence Volatility",
            "type": "reading",
            "dur": "6 min",
            "body": "Collect digital evidence, maintain chain of custody, and perform memory/disk forensic analysis. Understanding the fundamentals of Digital Forensics & Evidence Handling is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Digital Forensics & Evidence Handling",
              "Recognise early indicators of compromise related to incident response threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "RAM & Disk Forensic Analysis",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Digital Forensics & Evidence Handling. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Digital Forensics & Evidence Handling",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Digital Forensics & Evidence Handling Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Digital Forensics & Evidence Handling.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Order of Volatility dictates that forensic evidence should be collected starting with:",
        "options": [
          "Most volatile memory (RAM, CPU cache) down to non-volatile disk/tape storage",
          "Hard drive first",
          "Cloud backups",
          "Printouts"
        ],
        "answer": 0,
        "explanation": "Volatile memory disappears upon power off and must be captured first."
      },
      {
        "q": "Why is Chain of Custody critical for digital evidence?",
        "options": [
          "It legally proves evidence was untampered with from collection to courtroom presentation",
          "It reduces disk size",
          "It encrypts drive",
          "It fixes OS bugs"
        ],
        "answer": 0,
        "explanation": "Chain of custody documents handling to ensure court admissibility."
      },
      {
        "q": "A forensic write-blocker hardware tool ensures:",
        "options": [
          "The target evidence drive cannot be modified during write-read disk imaging",
          "Files write faster",
          "Deletes viruses automatically",
          "Formats the drive"
        ],
        "answer": 0,
        "explanation": "Write-blockers prevent alterations to original evidence drives."
      }
    ]
  },
  {
    "id": "bcdr-plan",
    "title": "Disaster Recovery & Business Continuity",
    "cat": "Compliance & Governance",
    "icon": "clock",
    "color1": "#F59E0B",
    "color2": "#10B981",
    "level": "Intermediate",
    "desc": "Design Business Continuity (BCP) and Disaster Recovery (DRP) strategies for cyber resiliency.",
    "objectives": [
      "Define Recovery Time Objective (RTO) and Recovery Point Objective (RPO)",
      "Conduct Business Impact Analysis (BIA)",
      "Execute tabletop DR simulation exercises"
    ],
    "modules": [
      {
        "title": "Resilience Architecture",
        "lessons": [
          {
            "title": "RTO & RPO Metrics",
            "type": "reading",
            "dur": "6 min",
            "body": "Design Business Continuity (BCP) and Disaster Recovery (DRP) strategies for cyber resiliency. Understanding the fundamentals of Disaster Recovery & Business Continuity is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Disaster Recovery & Business Continuity",
              "Recognise early indicators of compromise related to compliance & governance threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Business Impact Analysis & DR Testing",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Disaster Recovery & Business Continuity. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Disaster Recovery & Business Continuity",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Disaster Recovery & Business Continuity Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Disaster Recovery & Business Continuity.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "Recovery Time Objective (RTO) measures:",
        "options": [
          "The maximum acceptable duration of system downtime after a disaster",
          "The amount of data lost",
          "The cost of servers",
          "The age of backups"
        ],
        "answer": 0,
        "explanation": "RTO defines how quickly systems must be restored."
      },
      {
        "q": "Recovery Point Objective (RPO) measures:",
        "options": [
          "The maximum acceptable age of data lost measured in time (e.g. 1 hour of data loss)",
          "Total downtime minutes",
          "Network latency",
          "CPU count"
        ],
        "answer": 0,
        "explanation": "RPO defines acceptable data loss interval."
      },
      {
        "q": "What is the primary goal of a DR Tabletop Exercise?",
        "options": [
          "Walk through disaster scenarios verbally to test team roles and playbook gaps",
          "Replace server hardware",
          "Buy insurance",
          "Install software"
        ],
        "answer": 0,
        "explanation": "Tabletop simulations validate response readiness without disruption."
      }
    ]
  },
  {
    "id": "siem-soc",
    "title": "SOC Analyst & SIEM Alert Triaging",
    "cat": "Incident Response",
    "icon": "activity",
    "color1": "#3B82F6",
    "color2": "#8B5CF6",
    "level": "Intermediate",
    "desc": "Triage security alerts, correlate log events in SIEM, and minimize false positive alert fatigue.",
    "objectives": [
      "Correlate multi-source log events (Firewall, EDR, Cloud, Auth)",
      "Distinguish False Positives vs True Positives",
      "Escalate validated alerts to Tier 2/3 responders"
    ],
    "modules": [
      {
        "title": "SOC Operations",
        "lessons": [
          {
            "title": "SIEM Log Correlation",
            "type": "reading",
            "dur": "6 min",
            "body": "Triage security alerts, correlate log events in SIEM, and minimize false positive alert fatigue. Understanding the fundamentals of SOC Analyst & SIEM Alert Triaging is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of SOC Analyst & SIEM Alert Triaging",
              "Recognise early indicators of compromise related to incident response threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Alert Triaging & Escalation Workflows",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in SOC Analyst & SIEM Alert Triaging. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for SOC Analyst & SIEM Alert Triaging",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: SOC Analyst & SIEM Alert Triaging Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for SOC Analyst & SIEM Alert Triaging.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is the primary function of a SIEM (Security Information and Event Management)?",
        "options": [
          "Aggregate, correlate, and analyze security log data from across the enterprise in real time",
          "Send marketing emails",
          "Manage payroll",
          "Compile code"
        ],
        "answer": 0,
        "explanation": "SIEM centralizes log telemetry to detect multi-stage attacks."
      },
      {
        "q": "A 'False Positive' alert occurs when:",
        "options": [
          "Benign activity triggers a security alert incorrectly",
          "An attack succeeds undetected",
          "A server crashes",
          "Log files are deleted"
        ],
        "answer": 0,
        "explanation": "False positives waste SOC analyst time and cause alert fatigue."
      },
      {
        "q": "What is SOAR (Security Orchestration, Automation, and Response)?",
        "options": [
          "Technology that automates response playbooks and integrates security tools",
          "A cloud provider",
          "A database engine",
          "An operating system"
        ],
        "answer": 0,
        "explanation": "SOAR automates repetitive triaging and containment workflows."
      }
    ]
  },
  {
    "id": "bug-bounty",
    "title": "Vulnerability Disclosure & Bug Bounties",
    "cat": "Application Security",
    "icon": "award",
    "color1": "#10B981",
    "color2": "#EC4899",
    "level": "Intermediate",
    "desc": "Manage Coordinated Vulnerability Disclosure (CVD) and bug bounty programs (HackerOne, Bugcrowd).",
    "objectives": [
      "Establish safe harbor policies for ethical hackers",
      "Draft clear vulnerability disclosure scope rules",
      "Triage and remediate reported security flaws"
    ],
    "modules": [
      {
        "title": "Crowdsourced Security",
        "lessons": [
          {
            "title": "Coordinated Vulnerability Disclosure (CVD)",
            "type": "reading",
            "dur": "6 min",
            "body": "Manage Coordinated Vulnerability Disclosure (CVD) and bug bounty programs (HackerOne, Bugcrowd). Understanding the fundamentals of Vulnerability Disclosure & Bug Bounties is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Vulnerability Disclosure & Bug Bounties",
              "Recognise early indicators of compromise related to application security threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Bug Bounty Scope & Triaging",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Vulnerability Disclosure & Bug Bounties. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Vulnerability Disclosure & Bug Bounties",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Vulnerability Disclosure & Bug Bounties Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Vulnerability Disclosure & Bug Bounties.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What does 'Safe Harbor' guarantee to security researchers in a disclosure policy?",
        "options": [
          "Legal immunity from prosecution when researching within stated scope boundaries",
          "Guaranteed cash payouts",
          "Free web hosting",
          "Job offers"
        ],
        "answer": 0,
        "explanation": "Safe harbor protects good-faith security researchers legally."
      },
      {
        "q": "What is a vulnerability 'Out of Scope' designation?",
        "options": [
          "Systems or attack types (e.g. DDoS, Social Engineering) explicitly forbidden from testing",
          "Vulnerabilities that pay double",
          "Easy vulnerabilities",
          "Third-party plugins"
        ],
        "answer": 0,
        "explanation": "Out of scope rules define boundaries researchers must respect."
      },
      {
        "q": "CVSS (Common Vulnerability Scoring System) provides:",
        "options": [
          "A standardized numerical score (0-10) reflecting vulnerability severity",
          "Payment amounts",
          "Fixing time",
          "Attacker names"
        ],
        "answer": 0,
        "explanation": "CVSS standardizes vulnerability risk ratings across industry."
      }
    ]
  },
  {
    "id": "crypto-fund",
    "title": "Practical Cryptography & TLS 1.3",
    "cat": "Cryptography",
    "icon": "key",
    "color1": "#8B5CF6",
    "color2": "#06B6D4",
    "level": "Advanced",
    "desc": "Understand symmetric vs asymmetric encryption, TLS 1.3 handshakes, and hashing integrity.",
    "objectives": [
      "Differentiate AES-256 vs RSA/ECC",
      "Understand SHA-256 hashing and salt",
      "Enforce TLS 1.3 cipher suites"
    ],
    "modules": [
      {
        "title": "Applied Cryptography",
        "lessons": [
          {
            "title": "Symmetric & Asymmetric Encryption",
            "type": "reading",
            "dur": "6 min",
            "body": "Understand symmetric vs asymmetric encryption, TLS 1.3 handshakes, and hashing integrity. Understanding the fundamentals of Practical Cryptography & TLS 1.3 is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Practical Cryptography & TLS 1.3",
              "Recognise early indicators of compromise related to cryptography threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "TLS 1.3 Handshake & Hashing",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Practical Cryptography & TLS 1.3. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Practical Cryptography & TLS 1.3",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Practical Cryptography & TLS 1.3 Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Practical Cryptography & TLS 1.3.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is the key advantage of asymmetric encryption (RSA/ECC)?",
        "options": [
          "It uses one secret key for everything",
          "It allows secure key exchange using public and private key pairs",
          "It requires no mathematical computations",
          "It compresses files"
        ],
        "answer": 1,
        "explanation": "Public/private keys solve the secret key distribution problem."
      },
      {
        "q": "Salting passwords before hashing prevents:",
        "options": [
          "Pre-computed Rainbow Table dictionary attacks",
          "Passwords from expiring",
          "Database crashes",
          "User typing errors"
        ],
        "answer": 0,
        "explanation": "Salt ensures identical passwords yield unique hashes."
      },
      {
        "q": "TLS 1.3 improves security over TLS 1.2 by:",
        "options": [
          "Removing weak legacy ciphers and reducing handshake round trips",
          "Making web pages load in black and white",
          "Disabling cookies",
          "Encrypting WiFi routers"
        ],
        "answer": 0,
        "explanation": "TLS 1.3 eliminates obsolete insecure cipher suites."
      }
    ]
  },
  {
    "id": "cloud-forensics",
    "title": "Cloud Incident Forensics & Log Auditing",
    "cat": "Incident Response",
    "icon": "cloud",
    "color1": "#3B82F6",
    "color2": "#10B981",
    "level": "Advanced",
    "desc": "Analyze AWS CloudTrail, Azure Activity Logs, and GCP Audit Logs for Cloud Incident Response.",
    "objectives": [
      "Audit CloudTrail event histories for anomalous API calls",
      "Investigate compromised IAM credentials",
      "Preserve cloud snapshot disk images"
    ],
    "modules": [
      {
        "title": "Cloud Forensics & Telemetry",
        "lessons": [
          {
            "title": "Cloud Trail & Activity Log Audit",
            "type": "reading",
            "dur": "6 min",
            "body": "Analyze AWS CloudTrail, Azure Activity Logs, and GCP Audit Logs for Cloud Incident Response. Understanding the fundamentals of Cloud Incident Forensics & Log Auditing is critical for modern cyber hygiene and enterprise defense. Attackers continuously evolve their techniques, making proactive training and strict control enforcement essential to safeguarding operations.",
            "points": [
              "Master the core operational principles of Cloud Incident Forensics & Log Auditing",
              "Recognise early indicators of compromise related to incident response threats",
              "Enforce defense-in-depth controls across technical and human vectors",
              "Report suspicious anomalies immediately to your IT Security Helpdesk"
            ]
          },
          {
            "title": "Snapshot Forensic Preservation",
            "type": "reading",
            "dur": "7 min",
            "body": "Practical execution and control enforcement in Cloud Incident Forensics & Log Auditing. By integrating automated monitoring, clear policies, and out-of-band verification, organisations build resilient defensive posture against targeted exploits.",
            "points": [
              "Implement industry standard guidelines for Cloud Incident Forensics & Log Auditing",
              "Conduct continuous verification and audit logging",
              "Reduce blast radius through effective isolation and least privilege",
              "Maintain updated emergency playbooks and incident escalation paths"
            ]
          },
          {
            "title": "Quiz: Cloud Incident Forensics & Log Auditing Assessment",
            "type": "quiz",
            "dur": "5 min",
            "body": "Test your knowledge and earn XP for Cloud Incident Forensics & Log Auditing.",
            "points": []
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "AWS CloudTrail records:",
        "options": [
          "Every API call made in the AWS account by users, roles, or services",
          "Internal file contents",
          "Screen recordings",
          "Hardware serial numbers"
        ],
        "answer": 0,
        "explanation": "CloudTrail captures complete API event audit history."
      },
      {
        "q": "Why should CloudTrail log buckets be encrypted and Object Locked?",
        "options": [
          "To prevent attackers from deleting or tampering with event history after compromising admin keys",
          "To speed up AWS console",
          "To save costs",
          "To share with public"
        ],
        "answer": 0,
        "explanation": "Log immutability ensures forensic integrity during incidents."
      },
      {
        "q": "Preserving an infected cloud VM for forensics involves:",
        "options": [
          "Taking an EBS/Disk snapshot and detaching network security groups",
          "Terminating the instance immediately",
          "Rebooting 10 times",
          "Formatting root volume"
        ],
        "answer": 0,
        "explanation": "Snapshots freeze state while network isolation prevents exfiltration."
      }
    ]
  }
];
