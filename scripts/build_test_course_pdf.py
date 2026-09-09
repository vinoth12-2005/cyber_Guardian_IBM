#!/usr/bin/env python3
"""
Generate a professional, multi-page Cybersecurity Course PDF
designed specifically for testing the CyberGuardian AI PDF Ingestion Engine.
"""

import os
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image as RLImage
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

def create_diagram_image(filename, title, subtitle, box1_text, box2_text, box3_text):
    """Generate a clean cybersecurity architectural diagram as JPEG."""
    width, height = 650, 260
    img = Image.new('RGB', (width, height), color=(15, 23, 42)) # Slate 900 background
    draw = ImageDraw.Draw(img)

    # Draw border
    draw.rectangle([(2, 2), (width - 3, height - 3)], outline=(56, 189, 248), width=2) # Cyan border

    # Draw title bar
    draw.rectangle([(2, 2), (width - 3, 40)], fill=(30, 41, 59))
    draw.text((20, 12), title, fill=(248, 250, 252))
    draw.text((width - 180, 14), subtitle, fill=(148, 163, 184))

    # Box 1: Untrusted Subject
    draw.rounded_rectangle([(30, 70), (190, 210)], radius=8, fill=(30, 41, 59), outline=(239, 68, 68), width=2)
    draw.text((45, 85), "1. Identity Context", fill=(248, 113, 113))
    draw.text((40, 115), box1_text[:24], fill=(226, 232, 240))
    draw.text((40, 135), box1_text[24:48] if len(box1_text)>24 else "", fill=(148, 163, 184))
    draw.text((40, 165), "[Device Posture]", fill=(148, 163, 184))

    # Arrow 1 -> 2
    draw.line([(195, 140), (235, 140)], fill=(56, 189, 248), width=3)
    draw.polygon([(245, 140), (235, 133), (235, 147)], fill=(56, 189, 248))

    # Box 2: Policy Decision Point
    draw.rounded_rectangle([(250, 70), (410, 210)], radius=8, fill=(30, 41, 59), outline=(56, 189, 248), width=2)
    draw.text((265, 85), "2. Policy Engine (PDP)", fill=(56, 189, 248))
    draw.text((260, 115), box2_text[:24], fill=(226, 232, 240))
    draw.text((260, 135), box2_text[24:48] if len(box2_text)>24 else "", fill=(148, 163, 184))
    draw.text((260, 165), "[MFA + Risk Engine]", fill=(148, 163, 184))

    # Arrow 2 -> 3
    draw.line([(415, 140), (455, 140)], fill=(56, 189, 248), width=3)
    draw.polygon([(465, 140), (455, 133), (455, 147)], fill=(56, 189, 248))

    # Box 3: Protected Resource
    draw.rounded_rectangle([(470, 70), (620, 210)], radius=8, fill=(30, 41, 59), outline=(34, 197, 94), width=2)
    draw.text((485, 85), "3. Enforce & Allow", fill=(74, 222, 128))
    draw.text((480, 115), box3_text[:22], fill=(226, 232, 240))
    draw.text((480, 135), box3_text[22:44] if len(box3_text)>22 else "", fill=(148, 163, 184))
    draw.text((480, 165), "[Least Privilege]", fill=(148, 163, 184))

    img.save(filename, "JPEG", quality=90)
    return filename

def build_pdf(output_pdf_path):
    # Ensure directory
    os.makedirs(os.path.dirname(os.path.abspath(output_pdf_path)), exist_ok=True)
    temp_dir = os.path.dirname(os.path.abspath(output_pdf_path))

    img1_path = os.path.join(temp_dir, "diagram_zerotrust_arch.jpg")
    img2_path = os.path.join(temp_dir, "diagram_token_replay.jpg")

    create_diagram_image(
        img1_path,
        "NIST SP 800-207 Zero-Trust Architecture",
        "Control Plane vs Data Plane",
        "Subject / Device Claim Continuous Verification",
        "Dynamic Trust Scoring AI Telemetry Rules",
        "Encrypted App Gateway Strict Per-Session Key"
    )

    create_diagram_image(
        img2_path,
        "Adversary-in-the-Middle (AiTM) Token Theft",
        "MITRE ATT&CK T1556",
        "Target Enters Credential Into Reverse Proxy Trap",
        "Adversary Steals SAML Session Auth Token",
        "Adversary Bypasses MFA Accesses Cloud Tenant"
    )

    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles
    primary_color = colors.HexColor("#0f172a") # Slate 900
    accent_color = colors.HexColor("#0284c7")  # Sky 600
    subtext_color = colors.HexColor("#475569") # Slate 600
    code_bg = colors.HexColor("#f1f5f9")

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        alignment=TA_CENTER,
        spaceAfter=12
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=accent_color,
        alignment=TA_CENTER,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=accent_color,
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1e293b"),
        alignment=TA_JUSTIFY,
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#0369a1")
    )

    code_style = ParagraphStyle(
        'Code_Text',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    # ================= PAGE 1: TITLE & EXECUTIVE OVERVIEW =================
    story.append(Paragraph("Enterprise Zero-Trust Architecture & Identity Threat Defense", title_style))
    story.append(Paragraph("NIST SP 800-207 Operational Framework and Advanced Identity Protection Playbook", subtitle_style))
    story.append(Spacer(1, 10))

    # Meta table
    meta_data = [
        [Paragraph("<b>Document ID:</b> NIST-ZTA-SEC-800", body_style), Paragraph("<b>Target Proficiency:</b> Intermediate / Advanced", body_style)],
        [Paragraph("<b>Curriculum Category:</b> Identity & Access", body_style), Paragraph("<b>Estimated Study Duration:</b> 4-6 Hours", body_style)],
        [Paragraph("<b>Classification:</b> Enterprise Cybersecurity Standard", body_style), Paragraph("<b>Audit Compliance:</b> ISO 27001 / SOC 2 Type II", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[260, 260])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    story.append(Paragraph("Executive Overview & Scope", h1_style))
    story.append(Paragraph(
        "Modern cybersecurity perimeter models have collapsed due to ubiquitous remote work, multi-cloud SaaS platforms, and distributed microservices. "
        "Adversaries no longer rely on simple malware binaries; instead, they compromise legitimate credentials, bypass multi-factor authentication (MFA) "
        "via session token theft, and move laterally across corporate directories undetected. The Zero-Trust Architecture (ZTA) framework, defined by "
        "NIST Special Publication 800-207, re-architects enterprise defense upon a single uncompromising premise: <i>Never Trust, Always Verify</i>. "
        "All network traffic is treated as inherently hostile, regardless of whether it originates outside the firewall or from an internal workstation.",
        body_style
    ))
    story.append(Paragraph(
        "This curriculum provides enterprise engineers, SOC analysts, and security administrators with end-to-end technical blueprints. "
        "Students will explore Policy Decision Points (PDP), session token hygiene, continuous device health attestation, and active forensic containment procedures.",
        body_style
    ))

    story.append(Paragraph("Core Learning Objectives & Target Skills", h2_style))
    story.append(Paragraph("• <b>Deconstruct Zero-Trust Architecture:</b> Differentiate between the Control Plane and Data Plane according to NIST SP 800-207.", bullet_style))
    story.append(Paragraph("• <b>Analyze Identity Threat Vectors:</b> Identify Adversary-in-the-Middle (AiTM) phishing, OAuth token consent abuses, and session replay.", bullet_style))
    story.append(Paragraph("• <b>Implement Adaptive Enforcement:</b> Deploy Conditional Access policies based on user risk score, IP reputation, and endpoint compliance.", bullet_style))
    story.append(Paragraph("• <b>Execute SOC Containment Protocols:</b> Invalidate session tokens, enforce global identity revocation, and isolate compromised hosts.", bullet_style))
    story.append(Spacer(1, 10))

    # Callout box
    callout_data = [[
        Paragraph("<b>Key Takeaway:</b> Zero Trust is an architecture, not a product. It requires strict separation between Policy Decision Points (PDP) that evaluate identity claims and Policy Enforcement Points (PEP) that gate access to internal microservices.", callout_style)
    ]]
    callout_table = Table(callout_data, colWidths=[520])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f0f9ff")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#0284c7")),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(callout_table)

    story.append(PageBreak())

    # ================= PAGE 2: MODULE 1 =================
    story.append(Paragraph("Module 1: NIST SP 800-207 Architecture & Control Plane Enforcement", h1_style))
    story.append(Paragraph(
        "Zero-Trust Architecture replaces implicit network trust zones with explicit, continuous, per-request authorization. "
        "In a traditional castle-and-moat architecture, any user inside the corporate VPN is granted broad lateral network access. "
        "Under NIST SP 800-207, the enterprise is partitioned into two fundamental tiers: the Control Plane and the Data Plane.",
        body_style
    ))
    story.append(Paragraph(
        "The Control Plane houses the <b>Policy Engine (PE)</b> and the <b>Policy Administrator (PA)</b>, collectively known as the Policy Decision Point (PDP). "
        "When an employee requests access to a financial database, the Policy Engine inspects telemetry: user identity, password health, hardware token MFA validation, "
        "device endpoint compliance (EDR agent status, disk encryption, OS patch level), and contextual anomaly scores (geographic velocity, unusual login hour). "
        "Only when all dynamic criteria are satisfied does the Policy Administrator instruct the <b>Policy Enforcement Point (PEP)</b> on the Data Plane to open an encrypted micro-tunnel.",
        body_style
    ))

    # Architecture Diagram
    story.append(Spacer(1, 6))
    story.append(RLImage(img1_path, width=520, height=200))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Key Zero-Trust Principles for Enterprise Networks", h2_style))
    story.append(Paragraph("1. <b>All Data Sources and Computing Services Are Considered Resources:</b> No server or database is implicitly reachable without dynamic identity validation.", bullet_style))
    story.append(Paragraph("2. <b>All Communication Is Secured Regardless of Network Location:</b> Mutual TLS (mTLS) with ephemeral certificates must encrypt both inter-service communication and client ingress.", bullet_style))
    story.append(Paragraph("3. <b>Access to Individual Enterprise Resources Is Granted on a Per-Session Basis:</b> An authenticated user session to an intranet wiki must not grant access to the customer CRM.", bullet_style))
    story.append(Paragraph("4. <b>Dynamic Policy Determines Access:</b> Resource access decisions are governed by real-time behavioral signals, not static Active Directory group memberships.", bullet_style))

    story.append(PageBreak())

    # ================= PAGE 3: MODULE 2 =================
    story.append(Paragraph("Module 2: Advanced Identity Attacks, Token Theft & Session Hijacking", h1_style))
    story.append(Paragraph(
        "As organizations adopted SMS and push-notification Multi-Factor Authentication, threat actors shifted from credential stuffing "
        "to Adversary-in-the-Middle (AiTM) reverse proxy frameworks (such as Evilginx, Modlishka, and Muraena). "
        "In an AiTM attack, the adversary positions a proxy between the user and the legitimate identity provider (e.g., Azure AD / Okta).",
        body_style
    ))
    story.append(Paragraph(
        "When the target submits their username, password, and completes the biometric or authenticator MFA prompt, the reverse proxy captures "
        "the final authenticated session cookie (such as the Primary Refresh Token / ESTSAUTH token). "
        "Armed with this session token, the adversary injects it into their own browser, bypassing MFA entirely without ever needing the target's physical phone.",
        body_style
    ))

    # Token Replay Diagram
    story.append(Spacer(1, 6))
    story.append(RLImage(img2_path, width=520, height=200))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Real-World Incident Case Studies", h2_style))
    story.append(Paragraph(
        "<b>Case Study 1: The Lapsus$ / MGM Resorts Identity Breach:</b> "
        "Adversaries leveraged vishing (voice phishing) targeting the corporate IT helpdesk, impersonating high-privilege administrators to trigger MFA resets. "
        "Once internal access was established, they abused broad Active Directory replication permissions to extract domain credentials and deploy ransomware. "
        "A strict Zero-Trust model with cryptographic hardware FIDO2 keys and device-bound certificates would have prevented the session takeover.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Case Study 2: Illicit OAuth 2.0 Consent Grant Abuse:</b> "
        "Threat actors distributed deceptive applications requesting <i>Mail.ReadWrite</i> and <i>User.Read</i> permissions under the guise of an executive productivity add-in. "
        "Unsuspecting users approved the OAuth prompt, granting the attacker persistent API access to their entire mailbox even after changing their master passwords.",
        body_style
    ))

    story.append(PageBreak())

    # ================= PAGE 4: MODULE 3 =================
    story.append(Paragraph("Module 3: SOC Telemetry, Threat Containment & Hardening Playbook", h1_style))
    story.append(Paragraph(
        "When an identity compromise or token hijacking anomaly is detected by the SOC, immediate containment is required to stop lateral movement. "
        "Security engineers must execute a deterministic 5-step containment procedure rather than merely resetting the user's password.",
        body_style
    ))

    story.append(Paragraph("5-Step Identity Incident Containment Procedure", h2_style))
    story.append(Paragraph("1. <b>Global Session Token Revocation:</b> Terminate all active OAuth refresh tokens and invalidate browser sessions across all identity providers.", bullet_style))
    story.append(Paragraph("2. <b>Endpoint Host Isolation:</b> Disconnect the compromised endpoint from the local VLAN using EDR network quarantine to halt C2 beaconing.", bullet_style))
    story.append(Paragraph("3. <b>Domain Sinkholing & Firewall Block:</b> Block the attacker's reverse proxy IP and domain on perimeter DNS resolvers and Web Application Firewalls.", bullet_style))
    story.append(Paragraph("4. <b>Audit OAuth App Permissions:</b> Enumerate enterprise application consent logs and immediately revoke unverified third-party client IDs.", bullet_style))
    story.append(Paragraph("5. <b>FIDO2 Hardware Credential Re-enrollment:</b> Issue a cryptographic FIDO2 WebAuthn key to the affected user in person or via out-of-band video verification.", bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Technical Containment Scripts & Telemetry Commands", h2_style))

    # Code Box
    code_text = (
        "# 1. Invalidate all active Microsoft Graph refresh tokens immediately\n"
        "Revoke-MgUserSignInSession -UserId 'victim.user@enterprise.com'\n\n"
        "# 2. Enumerate malicious OAuth application permissions granted by users\n"
        "Get-MgServicePrincipal -Filter \"appId eq 'unverified-app-id'\" | Select-Object DisplayName, Id\n\n"
        "# 3. Linux EDR Sensor: Inspect suspicious parent-child process execution\n"
        "journalctl -u edr-sensor.service --since '1 hour ago' | grep -i 'token_theft_detected'"
    )
    code_table = Table([[Paragraph(code_text.replace('\n', '<br/>'), code_style)]], colWidths=[520])
    code_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(code_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("Interactive 3D Threat Flip Card Reference", h2_style))
    flip_data = [
        [Paragraph("<b>FRONT: Threat Indicator Inspection</b>", body_style), Paragraph("<b>BACK: Forensic Containment Playbook</b>", body_style)],
        [
            Paragraph("<b>Scenario:</b> User reports receiving 10 rapid MFA push notifications at 2:00 AM, followed by a successful login from an unknown ASN in Bucharest.<br/><b>Indicator:</b> MFA Fatigue (Push Bombing) + Impossible Travel Anomaly.", body_style),
            Paragraph("<b>Forensic Analysis:</b> Adversary brute-forced password and bombarded target phone until user accidentally accepted. Attacker extracted PRT session cookie.<br/><b>Mitigation:</b> Enable MFA Number Matching, enforce FIDO2, and revoke active sessions.", body_style)
        ]
    ]
    flip_table = Table(flip_data, colWidths=[260, 260])
    flip_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e0f2fe")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#38bdf8")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(flip_table)

    story.append(PageBreak())

    # ================= PAGE 5: PROCTORED ASSESSMENT & QUIZ =================
    story.append(Paragraph("Module 4: Proctored Certification Assessment & Knowledge Check", h1_style))
    story.append(Paragraph(
        "Complete the following scenario-based assessment questions. These questions test technical comprehension of "
        "NIST SP 800-207 principles, AiTM threat interception, and SOC response procedures.",
        body_style
    ))
    story.append(Spacer(1, 6))

    q_data = [
        ("Question 1", "Under the NIST SP 800-207 Zero-Trust Architecture, what is the role of the Policy Enforcement Point (PEP)?",
         ["A. It stores master cryptographic hashing salts for Active Directory passwords.",
          "B. It dynamically evaluates trust scores based on user device health.",
          "C. It serves as the gateway that terminates, enables, or monitors communication between a subject and resource.",
          "D. It generates automated compliance reports for external ISO auditors."],
         "Correct Answer: C — The PEP is located in the data plane and directly terminates connections based on Policy Decision Point orders."),
        
        ("Question 2", "How does an Adversary-in-the-Middle (AiTM) reverse proxy successfully bypass standard SMS or Push Multi-Factor Authentication?",
         ["A. By cracking the RSA-2048 private key of the identity provider in real time.",
          "B. By capturing the authenticated session token/cookie returned after the victim completes legitimate MFA authentication.",
          "C. By modifying the victim's DNS hosts file using an unprivileged macro.",
          "D. By spoofing the cellular tower using a software-defined radio (SDR)."],
         "Correct Answer: B — AiTM reverse proxies intercept the final session cookie after the user completes MFA, allowing token replay."),

        ("Question 3", "Which Multi-Factor Authentication mechanism provides mathematical cryptographic protection against AiTM proxy interception?",
         ["A. SMS OTP text verification codes.",
          "B. Voice automated phone call callbacks.",
          "C. FIDO2 / WebAuthn hardware security keys with domain-bound origin binding.",
          "D. Email-based magic link verification."],
         "Correct Answer: C — FIDO2 WebAuthn keys bind credentials to the specific browser domain origin, rendering reverse proxies unable to forward authentication.")
    ]

    for q_num, q_text, opts, exp in q_data:
        story.append(Paragraph(f"<b>{q_num}:</b> {q_text}", h2_style))
        for opt in opts:
            story.append(Paragraph(opt, bullet_style))
        story.append(Paragraph(f"<i>{exp}</i>", callout_style))
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 10))
    # Final Sign-off block
    signoff_data = [[
        Paragraph("<b>Standardization Authority:</b> CyberGuardian AI Curriculum Board<br/><b>Verified Compatible With:</b> CyberGuardian Unified Ingestion Engine v2.0", body_style),
        Paragraph("<b>Status:</b> Approved for Ingestion & Live Staging<br/><b>Generated Date:</b> September 2026", body_style)
    ]]
    signoff_table = Table(signoff_data, colWidths=[260, 260])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#94a3b8")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(signoff_table)

    # Build the document
    doc.build(story)
    print(f"Successfully generated course PDF: {output_pdf_path}")

if __name__ == "__main__":
    output_path = "/home/zoro/Documents/final_OG/IBM project-OG/Zero_Trust_Security_Course.pdf"
    build_pdf(output_path)
