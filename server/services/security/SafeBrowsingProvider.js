const axios = require('axios');
const ThreatIntelProvider = require('./ThreatIntelProvider');
const SecurityResult = require('./SecurityResult');

/**
 * SafeBrowsingProvider
 * ─────────────────────────────────────────────────────────────
 * Google Safe Browsing Lookup API v4 integration for URLs.
 */
class SafeBrowsingProvider extends ThreatIntelProvider {
  constructor(apiKey = null) {
    super('GoogleSafeBrowsing');
    this.apiKey = apiKey || process.env.GOOGLE_SAFE_BROWSING_API_KEY || process.env.SAFE_BROWSING_API_KEY || '';
    this.baseUrl = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';
    this.ready = !!(this.apiKey && this.apiKey.trim().length > 10);
  }

  async checkUrl(urlString) {
    if (!this.ready) {
      return SecurityResult.unavailable('GoogleSafeBrowsing', 'url', urlString, 'GOOGLE_SAFE_BROWSING_API_KEY missing or unconfigured');
    }
    if (!urlString) {
      return SecurityResult.error('GoogleSafeBrowsing', 'url', urlString, 'No URL provided');
    }

    try {
      const payload = {
        client: {
          clientId: 'flotbot-defender',
          clientVersion: '2.0.0',
        },
        threatInfo: {
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION',
          ],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: urlString }],
        },
      };

      const res = await axios.post(`${this.baseUrl}?key=${this.apiKey}`, payload, {
        timeout: 7000,
        headers: { 'Content-Type': 'application/json' },
      });

      const matches = res.data?.matches || [];
      const isMalicious = matches.length > 0;

      if (isMalicious) {
        const threatTypes = matches.map((m) => m.threatType);
        return new SecurityResult({
          provider: 'GoogleSafeBrowsing',
          target_type: 'url',
          target: urlString,
          status: 'completed',
          classification: 'malicious',
          confidence: 0.95,
          detections: { malicious: matches.length, suspicious: 0, total: matches.length },
          evidence: {
            matches,
            threatTypes,
            primaryThreat: threatTypes[0],
          },
        });
      }

      return new SecurityResult({
        provider: 'GoogleSafeBrowsing',
        target_type: 'url',
        target: urlString,
        status: 'completed',
        classification: 'no_known_threat',
        confidence: 0.85,
        detections: { malicious: 0, suspicious: 0, total: 0 },
        evidence: { matches: [] },
      });
    } catch (err) {
      return SecurityResult.error('GoogleSafeBrowsing', 'url', urlString, err.message || 'Google Safe Browsing API error');
    }
  }
}

module.exports = SafeBrowsingProvider;
