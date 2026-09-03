const axios = require('axios');
const ThreatIntelProvider = require('./ThreatIntelProvider');
const SecurityResult = require('./SecurityResult');

/**
 * HybridAnalysisProvider
 * ─────────────────────────────────────────────────────────────
 * Queries Hybrid Analysis (Falcon Sandbox) v2 API for hash reputation
 * and behavioral sandbox summaries.
 */
class HybridAnalysisProvider extends ThreatIntelProvider {
  constructor(apiKey = null) {
    super('HybridAnalysis');
    this.apiKey = apiKey || process.env.HYBRID_ANALYSIS_API_KEY || '';
    this.baseUrl = 'https://www.hybrid-analysis.com/api/v2';
    this.ready = !!(this.apiKey && this.apiKey.trim().length > 10);
  }

  async checkFileHash(sha256) {
    if (!this.ready) {
      return SecurityResult.unavailable('HybridAnalysis', 'hash', sha256, 'HYBRID_ANALYSIS_API_KEY missing or unconfigured');
    }
    if (!sha256) {
      return SecurityResult.error('HybridAnalysis', 'hash', sha256, 'No SHA256 provided');
    }

    try {
      const url = `${this.baseUrl}/search/hash`;
      const params = new URLSearchParams();
      params.append('hash', sha256);

      const res = await axios.post(url, params, {
        headers: {
          'api-key': this.apiKey,
          'user-agent': 'Falcon Sandbox FlotBot Defender',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 8000,
      });

      const reports = res.data || [];
      if (!Array.isArray(reports) || reports.length === 0) {
        return new SecurityResult({
          provider: 'HybridAnalysis',
          target_type: 'hash',
          target: sha256,
          status: 'completed',
          classification: 'unknown',
          confidence: 0.0,
          evidence: { details: 'Hash not found in Hybrid Analysis database' },
        });
      }

      const report = reports[0];
      const threatScore = report.threat_score ?? 0;
      const verdict = report.verdict || '';

      let classification = 'no_known_threat';
      if (verdict === 'malicious' || threatScore >= 65) {
        classification = 'malicious';
      } else if (verdict === 'suspicious' || threatScore >= 30) {
        classification = 'suspicious';
      }

      return new SecurityResult({
        provider: 'HybridAnalysis',
        target_type: 'hash',
        target: sha256,
        status: 'completed',
        classification,
        confidence: Math.min(1.0, threatScore / 100),
        detections: {
          malicious: classification === 'malicious' ? 1 : 0,
          suspicious: classification === 'suspicious' ? 1 : 0,
          total: 1,
        },
        evidence: {
          threatScore,
          verdict,
          vxFamily: report.vx_family,
          type: report.type_short,
          environmentDescription: report.environment_description,
        },
        raw_reference: `https://www.hybrid-analysis.com/sample/${sha256}`,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        return new SecurityResult({
          provider: 'HybridAnalysis',
          target_type: 'hash',
          target: sha256,
          status: 'completed',
          classification: 'unknown',
          confidence: 0.0,
          evidence: { details: 'No sandbox report found' },
        });
      }
      return SecurityResult.error('HybridAnalysis', 'hash', sha256, err.message || 'Hybrid Analysis API request failed');
    }
  }
}

module.exports = HybridAnalysisProvider;
