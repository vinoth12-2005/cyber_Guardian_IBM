// ============================================================
// SE-LAB — Default Learning Cards Generator
// Auto-generates reactive learning cards for all simulations
// that don't have custom cards, based on event types
// ============================================================

import type { LearningCard, SESimulation } from '@/types';

const defaultCards: LearningCard[] = [
  {
    trigger: 'MESSAGE_OPENED',
    title: 'Message Received',
    body: 'You opened the message. Before taking any action, inspect the sender, check for urgency manipulation, and look for red flags.',
    detect: 'Look for pressure language, unexpected requests, and unfamiliar senders.',
    respond: 'If suspicious, do NOT click links or provide information. Report immediately.',
  },
  {
    trigger: 'SENDER_INSPECTED',
    title: 'Good Investigation',
    body: 'You checked the sender identity. This is a critical defensive step. Look for mismatched domains, display name spoofing, and unverified sources.',
    detect: 'Compare the sender with known legitimate addresses. Check for character substitutions.',
    respond: 'If the sender doesn\'t match the claimed organization, treat it as suspicious.',
  },
  {
    trigger: 'LINK_HOVERED',
    title: 'Link Inspection',
    body: 'You previewed the link destination. Always check where a link actually points before clicking.',
    detect: 'Look for misspelled domains, suspicious TLDs, and URL shorteners that hide the real destination.',
    respond: 'If the URL doesn\'t match the expected destination, do NOT click it.',
  },
  {
    trigger: 'LINK_OPENED',
    title: 'Link Clicked',
    body: 'You navigated to a potentially suspicious destination. The attacker now knows you engaged with the content.',
    attackerSaw: 'Victim followed link — IP, browser, and device info captured (simulated)',
    detect: 'Check the address bar. Is this the domain you expected? Look for HTTPS and valid certificates.',
    respond: 'If the destination looks wrong, close the tab immediately. Do not enter any data.',
  },
  {
    trigger: 'URL_INSPECTED',
    title: 'URL Analysis',
    body: 'You examined the URL or certificate details. This investigative step helps identify phishing domains.',
    detect: 'Look for: misspelled brand names, unusual subdomains, HTTP instead of HTTPS, and invalid certificates.',
    respond: 'If the URL is suspicious, close the page and report it. Navigate to the real site directly.',
  },
  {
    trigger: 'FORM_FIELD_FOCUSED',
    title: 'Caution — Form Input',
    body: 'You\'re about to enter data into a form. Make sure you trust this page before providing any information.',
    attackerSaw: 'Victim interacting with credential harvesting form',
    detect: 'Verify the page URL and certificate before entering ANY data.',
    respond: 'If you\'re unsure about the page legitimacy, close it without entering data.',
  },
  {
    trigger: 'SYNTHETIC_DATA_ENTERED',
    title: 'Data Entry Warning',
    body: 'You are typing information into a potentially malicious form. Every keystroke could be captured.',
    attackerSaw: 'Victim entering data — keylogger simulation active',
    detect: 'Stop and verify: Is this the legitimate site? How did you get here?',
    respond: 'If you arrived via a link from an unsolicited message, stop typing and close the page.',
  },
  {
    trigger: 'FORM_SUBMITTED',
    title: 'Data Submitted',
    body: 'Information has been submitted. If this was a malicious form, the data is now in the attacker\'s hands.',
    attackerSaw: 'Form data package received and logged',
    detect: 'After submitting to a suspicious form, assume the data is compromised.',
    respond: 'Change any submitted passwords immediately. Enable MFA. Report the incident.',
  },
  {
    trigger: 'CREDENTIAL_EXPOSED',
    title: 'Credentials Compromised',
    body: 'Synthetic credentials have been captured by the simulated attacker. In a real scenario, your account would be at risk.',
    attackerSaw: 'Credentials logged — account access possible',
    detect: 'Credential harvesting pages often look identical to legitimate login pages.',
    respond: 'Change passwords immediately via official channels. Enable MFA on all accounts.',
  },
  {
    trigger: 'REPORT_FILED',
    title: 'Excellent Defense!',
    body: 'You reported the suspicious activity. This is the ideal defensive response and helps protect others.',
    respond: 'Continue to be vigilant. Early reporting is one of the most effective defenses against social engineering.',
  },
  {
    trigger: 'BLOCK_APPLIED',
    title: 'Sender Blocked',
    body: 'You blocked the suspicious sender. This prevents further messages from this source.',
    respond: 'Blocking is a good step, but also report the sender so security teams can investigate.',
  },
  {
    trigger: 'VERIFICATION_PERFORMED',
    title: 'Independent Verification',
    body: 'You verified through an independent channel. This is the gold standard of defense against social engineering.',
    respond: 'Always use a separate, trusted channel to verify unexpected requests — especially financial ones.',
  },
  {
    trigger: 'PERMISSION_VIEWED',
    title: 'Permission Review',
    body: 'You reviewed the requested permissions. Understanding what access you\'re granting is critical.',
    detect: 'Watch for overly broad permissions that don\'t match the app\'s stated purpose.',
    respond: 'Deny permissions that seem excessive. A calculator app shouldn\'t need access to your emails.',
  },
  {
    trigger: 'PERMISSION_ACCEPTED',
    title: 'Permissions Granted',
    body: 'You granted access permissions. If the application is malicious, it now has the access it requested.',
    attackerSaw: 'Full permission grant received — account access established',
    detect: 'Excessive permissions are a major red flag for malicious apps.',
    respond: 'Revoke permissions immediately through your account security settings.',
  },
  {
    trigger: 'PERMISSION_REJECTED',
    title: 'Permissions Denied',
    body: 'You denied the permission request. This is the correct response to suspicious or excessive permission requests.',
    respond: 'Continue to scrutinize permission requests. Only grant what\'s necessary.',
  },
  {
    trigger: 'QR_SCANNED',
    title: 'QR Code Scanned',
    body: 'You scanned a QR code. QR codes can point to any URL — inspect the decoded destination before opening.',
    detect: 'Preview the URL before navigating. Verify it matches a legitimate, expected destination.',
    respond: 'If the URL looks suspicious, do not open it. Report the QR code source.',
  },
  {
    trigger: 'MFA_APPROVED',
    title: 'MFA Push Approved',
    body: 'You approved an MFA push notification. If you didn\'t initiate a login, an attacker may have your password.',
    attackerSaw: 'MFA bypass successful — full account access granted',
    detect: 'Never approve MFA prompts you didn\'t initiate. Multiple unexpected prompts = MFA fatigue attack.',
    respond: 'Change your password immediately. Report the suspicious login attempts.',
  },
  {
    trigger: 'MFA_DENIED',
    title: 'MFA Push Denied',
    body: 'You denied an unexpected MFA push. This is the correct response to prompts you didn\'t initiate.',
    respond: 'If you receive repeated unexpected MFA prompts, report it as a potential MFA fatigue attack.',
  },
  {
    trigger: 'DEFENSE_ACTION',
    title: 'Defensive Action',
    body: 'You took a defensive action. This reduces the attacker\'s chance of success.',
    respond: 'Continue to apply defensive practices: verify, report, and don\'t engage with suspicious content.',
  },
  {
    trigger: 'BRANCH_TAKEN',
    title: 'Decision Made',
    body: 'You made a decision that changed the simulation path. Your choices affect the outcome.',
    respond: 'Reflect on whether your decision was based on verification and evidence, or on pressure and urgency.',
  },
  {
    trigger: 'MESSAGE_REPLIED',
    title: 'Reply Sent',
    body: 'You replied to the message. Replying to phishing/scam messages confirms your contact info is active.',
    attackerSaw: 'Target reply received — contact confirmed active',
    detect: 'Replying to suspicious messages increases future targeting.',
    respond: 'Avoid replying to suspicious messages. Report and delete instead.',
  },
  {
    trigger: 'HEADER_VIEWED',
    title: 'Headers Examined',
    body: 'You inspected the full message headers. This reveals routing information and authentication results.',
    detect: 'Look for SPF/DKIM failures, mismatched originating IPs, and suspicious relay servers.',
    respond: 'Failed authentication checks (SPF fail, DKIM fail) indicate the sender may be spoofed.',
  },
  {
    trigger: 'ATTACHMENT_OPENED',
    title: 'Attachment Opened',
    body: 'You opened an attachment. Malicious attachments can contain malware or credential harvesting traps.',
    attackerSaw: 'Victim opened attachment — potential malware execution',
    detect: 'Watch for: double extensions (.pdf.exe), unexpected file types, and files from unknown senders.',
    respond: 'If an attachment seems suspicious, do not open it. Report it to your security team.',
  },
];

/**
 * Enrich a simulation with default learning cards if it has none.
 * Custom cards from the scenario definition take priority.
 */
export function enrichLearningCards(sim: SESimulation): SESimulation {
  if (sim.learningCards && sim.learningCards.length > 0) return sim;
  return { ...sim, learningCards: defaultCards };
}

export { defaultCards };
