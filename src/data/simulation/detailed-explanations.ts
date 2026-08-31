// ============================================================
// SE-LAB — Detailed Threat Intelligence & Educational Explanations
// Comprehensive documentation for all simulation scenarios
// Includes: MITRE ATT&CK mapping, red flags, defensive playbooks,
// real-world cases, referral links, and data exposure detail.
// ============================================================

export interface ScenarioDetail {
  id: string;
  attackVector: string;
  mitreTechniques: { id: string; name: string }[];
  psychologicalTriggers: string[];
  detailedExplanation: string;
  redFlags: string[];
  defensivePlaybook: string[];
  realWorldImpact: string;
  mitigationChecklist: string[];
  dataStolen?: string[];
  realWorldCase?: string;
  referralLinks?: { label: string; url: string; org: string }[];
  conceptDiagramAlt?: string;
  attackChain?: string[];
}

export const detailedExplanations: Record<string, ScenarioDetail> = {
  'SE-001': {
    id: 'SE-001',
    attackVector: 'Spear Phishing & Homoglyph Domain Spoofing',
    mitreTechniques: [
      { id: 'T1566.002', name: 'Phishing: Spearphishing Link' },
      { id: 'T1078', name: 'Valid Accounts' },
      { id: 'T1539', name: 'Steal Web Session Cookie' },
    ],
    psychologicalTriggers: ['Urgency', 'Fear of Loss', 'Authority Bias'],
    detailedExplanation: `This attack uses homoglyph domain spoofing (substituting similar-looking characters in the URL) to impersonate an official IT support system. The victim receives an urgent notification claiming their account will be suspended within 24 hours.\n\nWhen the victim clicks the link, they land on a lookalike login portal engineered to capture credentials. The attacker intercepts the submitted username and password to compromise the victim's corporate account.`,
    redFlags: [
      'Sender address domain mismatch (e.g., @n0rthstar-systems.test)',
      'Artificial deadline ("Account suspended in 24 hours")',
      'Generic greeting combined with aggressive pressure tactics',
      'Unsigned or invalid SSL certificate on the destination page',
    ],
    defensivePlaybook: [
      'Always inspect the full domain in the address bar before entering credentials.',
      'Check browser bookmarks for the known-good internal login portal.',
      'Report suspicious login prompts to Security Operations immediately.',
      'Never rely on email links for account security verification.',
    ],
    realWorldImpact: 'Credential harvesting via lookalike domains accounts for over 60% of initial access vectors in corporate ransomware breaches.',
    mitigationChecklist: [
      'Enforce FIDO2 / WebAuthn hardware keys to prevent phishing proxying.',
      'Deploy email authentication protocols (DMARC, DKIM, SPF).',
      'Implement domain registration monitoring for homoglyph variants.',
    ],
    dataStolen: [
      'Corporate username (email address)',
      'Account password (plaintext)',
      'Browser fingerprint (OS, browser version)',
      'Victim IP address (used for geo-targeting)',
    ],
    realWorldCase: 'In 2016, the DNC hack began with a spear phishing email using a lookalike domain (accounts-google.com instead of accounts.google.com) that captured John Podesta\'s Gmail credentials, leading to massive political fallout.',
    referralLinks: [
      { label: 'OWASP Phishing Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Phishing_Prevention_Cheat_Sheet.html', org: 'OWASP' },
      { label: 'CISA Phishing Guidance', url: 'https://www.cisa.gov/phishing', org: 'CISA' },
      { label: 'NIST Email Security Guide SP 800-177', url: 'https://csrc.nist.gov/publications/detail/sp/800-177/rev-1/final', org: 'NIST' },
      { label: 'Have I Been Pwned — Check Your Email', url: 'https://haveibeenpwned.com/', org: 'HIBP' },
    ],
    attackChain: [
      'Attacker registers lookalike domain (n0rthstar.com vs northstar.com)',
      'Crafts urgent email with spoofed sender display name',
      'Victim clicks link and lands on fake login portal',
      'Victim enters credentials — captured and transmitted to attacker C2',
      'Attacker uses credentials for account takeover or sells on dark web',
    ],
    conceptDiagramAlt: 'Email from spoofed domain → Victim clicks link → Lookalike login page → Credentials captured by attacker',
  },
  'SE-002': {
    id: 'SE-002',
    attackVector: 'IT Helpdesk Impersonation — Fake Support Portal',
    mitreTechniques: [
      { id: 'T1566.001', name: 'Phishing: Spearphishing Attachment' },
      { id: 'T1078', name: 'Valid Accounts' },
    ],
    psychologicalTriggers: ['Authority', 'Urgency', 'Helpfulness'],
    detailedExplanation: 'Attackers impersonate the internal IT helpdesk to trick employees into resetting credentials or enabling remote access. Fake helpdesk portals look identical to internal tools and capture corporate credentials.',
    redFlags: [
      'IT request arriving via external email domain',
      'Request to "verify account" through a link rather than internal portal',
      'Urgency without specific incident reference number',
    ],
    defensivePlaybook: [
      'Verify IT requests by calling the IT helpdesk directly using the internal directory number.',
      'Never click links in helpdesk emails — navigate directly to the internal portal.',
      'Check that the portal URL is on your company\'s official internal domain.',
    ],
    realWorldImpact: 'Helpdesk social engineering is one of the most common initial access techniques in corporate breaches.',
    mitigationChecklist: [
      'Implement callback verification for all remote helpdesk sessions.',
      'Use multi-factor authentication for all IT support portals.',
    ],
    dataStolen: ['Corporate account credentials', 'Active Directory password', 'MFA bypass codes'],
    realWorldCase: 'The Uber breach of September 2022 began when an attacker impersonated Uber IT support in a WhatsApp message, eventually convincing an employee to share their VPN credentials and bypass MFA.',
    referralLinks: [
      { label: 'SANS Social Engineering Defense', url: 'https://www.sans.org/blog/top-5-social-engineering-attack-vectors/', org: 'SANS' },
      { label: 'CISA Employee Training Resources', url: 'https://www.cisa.gov/cybersecurity-awareness-month', org: 'CISA' },
    ],
    attackChain: [
      'Attacker sends fake IT helpdesk email',
      'Victim clicks "Verify Account" link',
      'Lands on fake helpdesk portal with authentic branding',
      'Enters credentials to "verify identity"',
      'Attacker captures and immediately uses credentials',
    ],
  },
  // MITM Scenarios
  'SE-041': {
    id: 'SE-041',
    attackVector: 'Evil Twin Wi-Fi Access Point Attack',
    mitreTechniques: [
      { id: 'T1557', name: 'Adversary-in-the-Middle' },
      { id: 'T1040', name: 'Network Sniffing' },
      { id: 'T1557.002', name: 'ARP Cache Poisoning' },
    ],
    psychologicalTriggers: ['Convenience', 'Trust (familiar network name)', 'Lack of awareness'],
    detailedExplanation: `An Evil Twin attack creates a rogue Wi-Fi access point broadcasting the same SSID (network name) as a legitimate hotspot. The attacker's AP typically broadcasts at higher power, causing devices to auto-connect.\n\nOnce connected, ALL your network traffic routes through the attacker's device. For unencrypted HTTP connections, the attacker can read everything in plaintext — usernames, passwords, session cookies, and data you send or receive.`,
    redFlags: [
      'Public Wi-Fi network without a password in a location where you\'d expect one',
      'Websites loading via HTTP instead of HTTPS on a public network',
      'Certificate warnings appearing for sites you\'ve visited before',
      'Unusually slow connection or frequent disconnections',
    ],
    defensivePlaybook: [
      'Always use a VPN on public Wi-Fi — it encrypts ALL traffic even on HTTP sites.',
      'Verify websites use HTTPS (padlock) before entering ANY credentials.',
      'Use mobile data instead of public Wi-Fi for banking or sensitive tasks.',
      'Forget public Wi-Fi networks after use to prevent auto-reconnection.',
    ],
    realWorldImpact: 'A single Evil Twin AP can intercept thousands of credentials in a busy airport or coffee shop within hours.',
    mitigationChecklist: [
      'Deploy VPN for all employees using public networks.',
      'Enforce HTTPS-only browsing via browser policy.',
      'Use certificate pinning in mobile applications.',
    ],
    dataStolen: [
      'All HTTP traffic in plaintext (usernames, passwords)',
      'Session cookies (enabling account hijacking)',
      'Browser history and search queries',
      'File uploads/downloads in transit',
    ],
    realWorldCase: 'At DEF CON conferences, attackers historically ran a "Wall of Sheep" — displaying credentials captured from attendees on unsecured Wi-Fi. Thousands of credentials were captured each year.',
    referralLinks: [
      { label: 'OWASP MITM Attack Overview', url: 'https://owasp.org/www-community/attacks/Manipulator-in-the-middle_attack', org: 'OWASP' },
      { label: 'NIST Wireless Security SP 800-153', url: 'https://csrc.nist.gov/publications/detail/sp/800-153/final', org: 'NIST' },
      { label: 'CISA Public Wi-Fi Safety Tips', url: 'https://www.cisa.gov/news-events/news/cybersecurity-tips-using-public-wifi', org: 'CISA' },
    ],
    attackChain: [
      'Attacker sets up rogue AP with same SSID as legitimate hotspot',
      'Broadcasts at higher power to force victim auto-connect',
      'Victim\'s device connects to attacker AP automatically',
      'Attacker runs packet sniffer (Wireshark) to capture all traffic',
      'HTTP credentials transmitted in plaintext are captured',
      'Session cookies captured — account takeover without password needed',
    ],
    conceptDiagramAlt: 'Your Device → [Evil Twin AP (attacker)] → Internet. Attacker reads all unencrypted traffic in the middle.',
  },
  'SE-042': {
    id: 'SE-042',
    attackVector: 'SSL Stripping / HTTPS Downgrade MITM Attack',
    mitreTechniques: [
      { id: 'T1557', name: 'Adversary-in-the-Middle' },
      { id: 'T1040', name: 'Network Sniffing' },
    ],
    psychologicalTriggers: ['Lack of awareness', 'Trust in familiar websites'],
    detailedExplanation: 'SSL Stripping downgrades HTTPS connections to HTTP by intercepting the victim\'s initial request. The attacker maintains HTTPS with the real server but serves the victim plain HTTP — credentials travel unencrypted to the attacker.',
    redFlags: [
      'Padlock icon missing on a site that should be secure',
      'URL shows http:// instead of https:// for banking/account sites',
      'Browser warning about connection not being private',
    ],
    defensivePlaybook: [
      'ALWAYS check for the padlock before entering credentials on any site.',
      'Type https:// explicitly when navigating to sensitive sites.',
      'Use a VPN to encrypt traffic before it can be stripped.',
    ],
    realWorldImpact: 'SSL Stripping was publicly demonstrated by Moxie Marlinspike at Black Hat 2009 and remains effective against users who don\'t verify HTTPS.',
    mitigationChecklist: [
      'Implement HSTS headers on all web properties.',
      'Submit to HSTS Preload list to enforce HTTPS from first visit.',
    ],
    dataStolen: ['Login credentials in plaintext', 'Session tokens', 'Form submission data'],
    realWorldCase: 'In 2015, Lenovo\'s Superfish adware performed SSL interception on all HTTPS connections, exposing millions of users to potential credential theft by creating fake certificates.',
    referralLinks: [
      { label: 'HSTS Preload List', url: 'https://hstspreload.org/', org: 'Google' },
      { label: 'SSL Labs — Test Any Site', url: 'https://www.ssllabs.com/ssltest/', org: 'Qualys SSL Labs' },
      { label: 'Mozilla Observatory Security Test', url: 'https://observatory.mozilla.org/', org: 'Mozilla' },
    ],
    attackChain: [
      'Attacker positions between victim and router (ARP poisoning)',
      'Victim browser sends initial HTTP request for bank.com',
      'Attacker intercepts and establishes own HTTPS connection to real server',
      'Serves victim an HTTP version of bank login page',
      'Victim enters credentials over unencrypted HTTP',
      'Attacker captures plaintext credentials and forwards request',
    ],
  },
  // Ransomware Scenarios
  'SE-046': {
    id: 'SE-046',
    attackVector: 'Email-Delivered Ransomware (Malicious Office Macro)',
    mitreTechniques: [
      { id: 'T1566.001', name: 'Phishing: Spearphishing Attachment' },
      { id: 'T1204.002', name: 'User Execution: Malicious File' },
      { id: 'T1486', name: 'Data Encrypted for Impact' },
      { id: 'T1041', name: 'Exfiltration Over C2 Channel' },
    ],
    psychologicalTriggers: ['Curiosity', 'Urgency (overdue invoice)', 'Authority'],
    detailedExplanation: `Ransomware encrypts your files and demands payment for the decryption key. Modern groups use "double extortion" — first STEALING data, then encrypting it. If you don't pay, they publish your files on their dark web leak site.\n\nDelivery is commonly via malicious Office files with macros (XLSM, DOCM) that download and execute ransomware when macros are enabled.`,
    redFlags: [
      'Email asking you to "Enable Macros" to view content',
      'Unsolicited invoice or contract from unknown sender',
      'Office file with .xlsm or .docm extension from external party',
      'Compressed archive containing executable from unexpected source',
    ],
    defensivePlaybook: [
      'NEVER enable macros in Office files received via email.',
      'Open attachments only from verified, expected senders.',
      'Maintain offline backups (3-2-1 rule: 3 copies, 2 media, 1 offsite).',
      'Keep all software patched and updated.',
    ],
    realWorldImpact: 'Ransomware attacks cost organizations $20 billion globally in 2021. Average ransom payment: $570,000.',
    mitigationChecklist: [
      'Disable macros by default in Group Policy for all Office applications.',
      'Deploy endpoint detection & response (EDR) tools.',
      'Implement network segmentation to prevent lateral movement.',
      'Maintain immutable offsite backups tested for restoration.',
    ],
    dataStolen: [
      'All files on infected system and accessible network shares',
      'HR records, financial reports, intellectual property',
      'Customer databases with PII',
      'Active Directory credentials (NTLM hash dump)',
    ],
    realWorldCase: 'The Colonial Pipeline attack (May 2021) by DarkSide ransomware shut down the largest US fuel pipeline for 6 days. Colonial paid $4.4 million in Bitcoin. The attack caused widespread fuel shortages across the US East Coast.',
    referralLinks: [
      { label: 'CISA #StopRansomware', url: 'https://www.cisa.gov/stopransomware', org: 'CISA' },
      { label: 'NIST Ransomware Risk Management', url: 'https://csrc.nist.gov/projects/ransomware-protection', org: 'NIST' },
      { label: 'No More Ransom Project', url: 'https://www.nomoreransom.org/', org: 'Europol/NCSC' },
      { label: 'ID Ransomware — Identify the Variant', url: 'https://id-ransomware.malwarehunterteam.com/', org: 'MalwareHunterTeam' },
    ],
    attackChain: [
      'Attacker sends phishing email with malicious Invoice_Q4.xlsm attachment',
      'User opens file — Excel warns about macros',
      'Attacker message inside file: "Enable macros to view content"',
      'User enables macros — dropper downloads ransomware payload',
      'Ransomware enumerates and exfiltrates sensitive files (double extortion)',
      'Files encrypted with AES-256 — decryption key on attacker server',
      'Ransom note displayed demanding Bitcoin payment within 72 hours',
    ],
    conceptDiagramAlt: 'Phishing Email → Malicious Macro → Downloads Ransomware → Exfiltrates Files → Encrypts Files → Ransom Note',
  },
  // Social Media Scenarios
  'SE-050': {
    id: 'SE-050',
    attackVector: 'Social Media Profile Cloning & Fake Giveaway Phishing',
    mitreTechniques: [
      { id: 'T1585', name: 'Establish Accounts' },
      { id: 'T1566.002', name: 'Phishing: Spearphishing Link' },
    ],
    psychologicalTriggers: ['Excitement (prize)', 'Social proof (many likes)', 'FOMO (limited time)'],
    detailedExplanation: 'Social media giveaway scams create fake profiles impersonating celebrities or brands. High-engagement posts (with purchased fake likes) make the scam appear legitimate. Victims enter personal details or pay "shipping fees" to claim fake prizes.',
    redFlags: [
      'Account recently created (check "Joined" date)',
      'Account follower count unusually low for claimed celebrity/brand',
      'Post urgency: "Only 100 prizes remaining!"',
      'Request for credit card for "shipping fee" — real giveaways are free',
      'DMs from celebrity accounts asking for personal details',
    ],
    defensivePlaybook: [
      'Verify giveaways on official websites directly, not through social posts.',
      'Real giveaways NEVER ask for payment or credit card details.',
      'Check account creation date and follower authenticity.',
      'Report fake accounts using the platform\'s report feature.',
    ],
    realWorldImpact: 'Social media fraud cost US consumers $770 million in 2021 (FTC). Cryptocurrency investment scams are the most common type.',
    mitigationChecklist: [
      'Enable two-factor authentication on all social media accounts.',
      'Review and limit third-party app permissions on social accounts.',
      'Use unique passwords per platform (password manager).',
    ],
    dataStolen: ['Full name', 'Email address', 'Phone number', 'Home address', 'Credit card number (for fake shipping fee)'],
    realWorldCase: 'In 2021, Elon Musk cryptocurrency giveaway scams stole over $2 million in Bitcoin. Fake accounts promised to "double your crypto" if victims sent funds first.',
    referralLinks: [
      { label: 'FTC Social Media Scams Guide', url: 'https://consumer.ftc.gov/articles/what-know-about-social-media-scams', org: 'FTC' },
      { label: 'NCSC Social Media Safety Guide', url: 'https://www.ncsc.gov.uk/guidance/social-media-how-to-use-it-safely', org: 'NCSC UK' },
      { label: 'Meta Safety Center', url: 'https://www.facebook.com/safety/', org: 'Meta' },
    ],
    attackChain: [
      'Attacker clones celebrity or brand profile with similar username',
      'Purchases fake likes and followers to appear legitimate',
      'Posts viral giveaway with urgent CTA and link',
      'Victims click to claim prize on phishing form',
      'Form captures: name, email, phone, address, and credit card',
      'Data used for identity theft and card fraud',
    ],
  },
};

export function getScenarioDetail(simInput: string | { id: string; title?: string; category?: string; summary?: string; goal?: string }): ScenarioDetail {
  const simId = typeof simInput === 'string' ? simInput : simInput.id;

  if (detailedExplanations[simId]) {
    return detailedExplanations[simId];
  }

  const title = typeof simInput === 'object' && simInput.title ? simInput.title : `Simulation ${simId}`;
  const category = (typeof simInput === 'object' && simInput.category ? simInput.category : 'Social Engineering');
  const summary = typeof simInput === 'object' && (simInput.summary || simInput.goal) ? (simInput.summary || simInput.goal) : 'Investigate and mitigate security incident.';

  return {
    id: simId,
    attackVector: `${category} Attack Technique`,
    mitreTechniques: [
      { id: 'T1566', name: `Phishing: ${category}` },
      { id: 'T1598', name: 'Phishing for Information' },
      { id: 'T1204', name: 'User Execution' },
    ],
    psychologicalTriggers: ['Urgency', 'Authority Bias', 'Social Proof', 'Fear of Consequences'],
    detailedExplanation: `In this simulation (${simId}: ${title}), the adversary uses ${(category || 'cyberattack').toLowerCase()} techniques as the primary attack vector.\n\nKey Objective: ${summary}\n\nBy exploiting human psychology and trust, the attacker attempts to extract sensitive information or induce the victim into taking a harmful action.`,
    redFlags: [
      'Unsolicited communication demanding immediate action',
      'Discrepancies in sender identity, URL domains, or contact information',
      'Requests for credentials, sensitive files, or financial transactions',
      'Pressure tactics discouraging independent verification',
    ],
    defensivePlaybook: [
      'Pause and evaluate — never act under artificial urgency.',
      'Perform out-of-band verification using official contact channels.',
      'Inspect URLs, sender details, and digital signatures carefully.',
      'Report suspicious communications to your Security Operations Center (SOC).',
    ],
    realWorldImpact: 'Social engineering remains involved in over 82% of corporate security incidents per Verizon DBIR 2024.',
    mitigationChecklist: [
      'Conduct regular cyber range security awareness training.',
      'Establish strict out-of-band verification procedures.',
      'Deploy multi-factor authentication and zero-trust access controls.',
    ],
    dataStolen: [
      'Account credentials (username and password)',
      'Session tokens (for account hijacking)',
      'Personal Identifiable Information (PII)',
      'Financial data (if applicable)',
    ],
    referralLinks: [
      { label: 'OWASP Top 10 Security Risks', url: 'https://owasp.org/www-project-top-ten/', org: 'OWASP' },
      { label: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework', org: 'NIST' },
      { label: 'CISA Free Cybersecurity Services', url: 'https://www.cisa.gov/cybersecurity', org: 'CISA' },
      { label: 'SANS Security Awareness', url: 'https://www.sans.org/security-awareness-training/', org: 'SANS' },
      { label: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/', org: 'HIBP' },
    ],
  };
}
