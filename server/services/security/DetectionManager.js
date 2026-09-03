const VirusTotalProvider = require('./VirusTotalProvider');
const SafeBrowsingProvider = require('./SafeBrowsingProvider');
const HybridAnalysisProvider = require('./HybridAnalysisProvider');
const SecurityResult = require('./SecurityResult');
const URLEngine = require('../URLEngine');

/**
 * DetectionManager
 * ─────────────────────────────────────────────────────────────
 * Centralized Threat Intelligence & Detection Orchestrator:
 *   1. Local Heuristic Sensor Pre-Filter (URLEngine / File Heuristics)
 *   2. Google Safe Browsing API (Phishing / Social Engineering)
 *   3. VirusTotal v3 API (70+ Antivirus Engines)
 *   4. Hybrid Analysis API (Falcon Dynamic Sandbox)
 *   5. Multi-Provider Evidence Fusion (Reduces false positives/negatives)
 */
class DetectionManager {
  constructor(config = {}) {
    this.virusTotal = new VirusTotalProvider(config.virusTotalApiKey || config.vtApiKey);
    this.safeBrowsing = new SafeBrowsingProvider(config.safeBrowsingApiKey);
    this.hybridAnalysis = new HybridAnalysisProvider(config.hybridAnalysisApiKey);
  }

  /**
   * Check a URL across Local URLEngine, Google Safe Browsing, and VirusTotal.
   * @param {string} urlString
   * @returns {Promise<object>} Combined evidence, provider consensus, and fused verdict
   */
  async checkUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') {
      return {
        target: '',
        classification: 'no_known_threat',
        overall_score: 0,
        provider_results: [],
        evidence: [],
      };
    }

    // 1. Fast Local Heuristic Scan (Instant)
    const localTelemetry = URLEngine.analyze(urlString);

    // 2. Parallel Cloud Threat Intelligence Lookups
    const [vtRes, sbRes] = await Promise.allSettled([
      this.virusTotal.checkUrl(urlString),
      this.safeBrowsing.checkUrl(urlString),
    ]);

    const vtResult =
      vtRes.status === 'fulfilled'
        ? vtRes.value
        : SecurityResult.error('VirusTotal', 'url', urlString, vtRes.reason?.message);

    const sbResult =
      sbRes.status === 'fulfilled'
        ? sbRes.value
        : SecurityResult.error('GoogleSafeBrowsing', 'url', urlString, sbRes.reason?.message);

    const providerResults = [vtResult, sbResult];
    const fused = this._fuseResults(providerResults, localTelemetry);

    return {
      target: urlString,
      target_type: 'url',
      domain: localTelemetry.domain,
      classification: fused.classification,
      isThreat: fused.classification === 'malicious' || fused.classification === 'suspicious',
      confidence: fused.confidence,
      score: fused.score,
      riskLevel: fused.riskLevel,
      provider_results: providerResults.map((p) => ({
        provider: p.provider,
        status: p.status,
        classification: p.classification,
        confidence: p.confidence,
        detections: p.detections,
        error: p.error,
        evidence: p.evidence,
      })),
      local_heuristics: {
        score: localTelemetry.score,
        warnings: localTelemetry.warnings,
        mitre: localTelemetry.mitre,
        isPhishing: localTelemetry.isPhishing,
      },
      summary: fused.summary,
      evidence: fused.evidence,
    };
  }

  /**
   * Check a File / SHA-256 across VirusTotal with Hybrid Analysis escalation.
   * @param {object} fileParams - { sha256, fileName, filePath, entropy, size }
   */
  async checkFile({ sha256 = null, fileName = null, filePath = null, entropy = 0 } = {}) {
    const providerResults = [];

    // 1. VirusTotal Cloud Hash Reputation
    let vtResult = null;
    if (sha256) {
      vtResult = await this.virusTotal.checkFileHash(sha256);
      providerResults.push(vtResult);
    } else {
      providerResults.push(
        SecurityResult.unavailable('VirusTotal', 'hash', filePath || fileName, 'No SHA256 provided')
      );
    }

    // 2. Escalation to Hybrid Analysis if unknown or suspicious
    let haResult = null;
    if (
      sha256 &&
      (vtResult?.classification === 'unknown' ||
        vtResult?.classification === 'suspicious' ||
        vtResult?.status === 'unavailable')
    ) {
      haResult = await this.hybridAnalysis.checkFileHash(sha256);
      providerResults.push(haResult);
    } else {
      providerResults.push(
        SecurityResult.unavailable(
          'HybridAnalysis',
          'hash',
          sha256 || filePath || fileName,
          'Escalation not required or SHA256 missing'
        )
      );
    }

    // Local file telemetry
    const localTelemetry = {
      fileName,
      entropy,
      hasDoubleExtension: /\.(pdf|docx|xlsx|txt)\.(exe|scr|vbs|bat|ps1)$/i.test(fileName || ''),
    };

    const fused = this._fuseResults(providerResults, localTelemetry);

    return {
      target: sha256 || fileName || filePath,
      target_type: 'file',
      classification: fused.classification,
      isThreat: fused.classification === 'malicious' || fused.classification === 'suspicious',
      confidence: fused.confidence,
      score: fused.score,
      riskLevel: fused.riskLevel,
      provider_results: providerResults.map((p) => ({
        provider: p.provider,
        status: p.status,
        classification: p.classification,
        confidence: p.confidence,
        detections: p.detections,
        error: p.error,
        evidence: p.evidence,
      })),
      local_heuristics: localTelemetry,
      summary: fused.summary,
      evidence: fused.evidence,
    };
  }

  /**
   * Fuse multi-provider results with local heuristic telemetry.
   */
  _fuseResults(providerResults, localTelemetry = {}) {
    let isMalicious = false;
    let isSuspicious = false;
    let highestConfidence = 0.0;
    const evidence = [];

    // Check Cloud Providers
    for (const res of providerResults) {
      if (res.status === 'completed') {
        if (res.classification === 'malicious') {
          isMalicious = true;
          highestConfidence = Math.max(highestConfidence, res.confidence);
          evidence.push(`${res.provider}: Confirmed Malicious (${JSON.stringify(res.detections)})`);
        } else if (res.classification === 'suspicious') {
          isSuspicious = true;
          highestConfidence = Math.max(highestConfidence, res.confidence);
          evidence.push(`${res.provider}: Flagged Suspicious`);
        } else if (res.classification === 'no_known_threat') {
          evidence.push(`${res.provider}: Clean (No Threats Found)`);
        }
      } else if (res.status === 'unavailable') {
        evidence.push(`${res.provider}: Provider Key Unconfigured / Standby`);
      }
    }

    // Check Local Heuristic Telemetry
    if (localTelemetry.score >= 70 || localTelemetry.hasDoubleExtension) {
      if (!isMalicious) isSuspicious = true;
      highestConfidence = Math.max(highestConfidence, 0.75);
      if (localTelemetry.warnings) {
        evidence.push(...localTelemetry.warnings.map((w) => `Local Sensor: ${w}`));
      }
    } else if (localTelemetry.score >= 40) {
      isSuspicious = true;
      highestConfidence = Math.max(highestConfidence, 0.6);
      if (localTelemetry.warnings) {
        evidence.push(...localTelemetry.warnings.map((w) => `Local Sensor: ${w}`));
      }
    }

    let classification = 'no_known_threat';
    let riskLevel = 'SAFE';
    let score = localTelemetry.score || 5;

    if (isMalicious) {
      classification = 'malicious';
      riskLevel = 'CRITICAL';
      score = Math.max(score, 85);
    } else if (isSuspicious) {
      classification = 'suspicious';
      riskLevel = score >= 60 ? 'HIGH' : 'MEDIUM';
      score = Math.max(score, 55);
    }

    let summary = 'Verified safe. No threats reported across active engines.';
    if (classification === 'malicious') {
      summary = 'CRITICAL THREAT: Destination or file flagged by security intelligence engines.';
    } else if (classification === 'suspicious') {
      summary = 'SUSPICIOUS: Risk heuristics or suspicious patterns identified.';
    }

    return {
      classification,
      riskLevel,
      score,
      confidence: highestConfidence,
      summary,
      evidence,
    };
  }
}

module.exports = DetectionManager;
