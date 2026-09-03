const axios = require('axios');
const ThreatIntelProvider = require('./ThreatIntelProvider');
const SecurityResult = require('./SecurityResult');

/**
 * VirusTotalProvider
 * ─────────────────────────────────────────────────────────────
 * Queries VirusTotal v3 API for hashes, URLs, domains, and IPs.
 * Never logs or exposes API keys.
 */
class VirusTotalProvider extends ThreatIntelProvider {
  constructor(apiKey = null) {
    super('VirusTotal');
    this.apiKey = apiKey || process.env.VIRUSTOTAL_API_KEY || '';
    this.baseUrl = 'https://www.virustotal.com/api/v3';
    this.ready = !!(this.apiKey && this.apiKey.trim().length > 10);
  }

  async checkFileHash(sha256) {
    if (!this.ready) {
      return SecurityResult.unavailable('VirusTotal', 'hash', sha256, 'VIRUSTOTAL_API_KEY missing or unconfigured');
    }
    if (!sha256) {
      return SecurityResult.error('VirusTotal', 'hash', sha256, 'No SHA256 provided');
    }

    try {
      const url = `${this.baseUrl}/files/${sha256}`;
      const res = await axios.get(url, {
        headers: { 'x-apikey': this.apiKey },
        timeout: 8000,
      });

      const stats = res.data?.data?.attributes?.last_analysis_stats || {};
      const malicious = stats.malicious || 0;
      const suspicious = stats.suspicious || 0;
      const total = Object.values(stats).reduce((a, b) => a + b, 0);

      let classification = 'no_known_threat';
      if (malicious >= 3) classification = 'malicious';
      else if (malicious > 0 || suspicious >= 2) classification = 'suspicious';

      const confidence = total > 0 ? Math.min(1.0, (malicious + suspicious) / Math.max(1, total)) : 0.0;

      return new SecurityResult({
        provider: 'VirusTotal',
        target_type: 'hash',
        target: sha256,
        status: 'completed',
        classification,
        confidence,
        detections: { malicious, suspicious, total },
        evidence: { stats, lastAnalysisDate: res.data?.data?.attributes?.last_analysis_date },
        raw_reference: `https://www.virustotal.com/gui/file/${sha256}`,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        return new SecurityResult({
          provider: 'VirusTotal',
          target_type: 'hash',
          target: sha256,
          status: 'completed',
          classification: 'unknown',
          confidence: 0.0,
          evidence: { details: 'Hash not found in VirusTotal database' },
        });
      }
      if (err.response?.status === 429) {
        return SecurityResult.error('VirusTotal', 'hash', sha256, 'Rate limit exceeded (HTTP 429)');
      }
      return SecurityResult.error('VirusTotal', 'hash', sha256, err.message || 'Network error');
    }
  }

  async checkUrl(urlString) {
    if (!this.ready) {
      return SecurityResult.unavailable('VirusTotal', 'url', urlString, 'VIRUSTOTAL_API_KEY missing or unconfigured');
    }
    if (!urlString) {
      return SecurityResult.error('VirusTotal', 'url', urlString, 'No URL provided');
    }

    try {
      const urlId = Buffer.from(urlString).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const apiUrl = `${this.baseUrl}/urls/${urlId}`;
      const res = await axios.get(apiUrl, {
        headers: { 'x-apikey': this.apiKey },
        timeout: 8000,
      });

      const stats = res.data?.data?.attributes?.last_analysis_stats || {};
      const malicious = stats.malicious || 0;
      const suspicious = stats.suspicious || 0;
      const total = Object.values(stats).reduce((a, b) => a + b, 0);

      let classification = 'no_known_threat';
      if (malicious >= 2) classification = 'malicious';
      else if (malicious > 0 || suspicious >= 2) classification = 'suspicious';

      const confidence = total > 0 ? Math.min(1.0, (malicious + suspicious) / Math.max(1, total)) : 0.0;

      return new SecurityResult({
        provider: 'VirusTotal',
        target_type: 'url',
        target: urlString,
        status: 'completed',
        classification,
        confidence,
        detections: { malicious, suspicious, total },
        evidence: { stats, lastAnalysisDate: res.data?.data?.attributes?.last_analysis_date },
        raw_reference: `https://www.virustotal.com/gui/url/${urlId}`,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        return new SecurityResult({
          provider: 'VirusTotal',
          target_type: 'url',
          target: urlString,
          status: 'completed',
          classification: 'unknown',
          confidence: 0.0,
          evidence: { details: 'URL not scanned in VirusTotal cache' },
        });
      }
      if (err.response?.status === 429) {
        return SecurityResult.error('VirusTotal', 'url', urlString, 'Rate limit exceeded (HTTP 429)');
      }
      return SecurityResult.error('VirusTotal', 'url', urlString, err.message || 'Network error');
    }
  }
}

module.exports = VirusTotalProvider;
