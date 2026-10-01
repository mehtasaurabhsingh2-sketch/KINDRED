const { logInfo } = require('../utils/logger');

/**
 * Classifies a User-Agent string into one of two harmless demo buckets.
 *
 * Rules are intentionally simple and non-evasive:
 *   - If the string contains "Mozilla" (standard browser UA prefix), use the
 *     "browser" profile.
 *   - Otherwise (curl, httpie, custom scripts, etc.) use "alternate-demo".
 *
 * Critically, we do NOT identify specific security vendors, antivirus
 * products, scanners, WAFs, or crawlers.  This is an educational demo only.
 *
 * @param {string} ua - The raw User-Agent header value
 * @returns {{ profile: string, reason: string }}
 */
function selectDemoProfile(ua) {
  const normalised = (ua || '').toLowerCase();

  if (normalised.includes('mozilla')) {
    return {
      profile: 'browser',
      reason:
        'User-Agent contains "Mozilla", which is the standard prefix used by ' +
        'web browsers.  The server selected the browser demonstration profile.'
    };
  }

  return {
    profile: 'alternate-demo',
    reason:
      'User-Agent does not contain the "Mozilla" prefix.  This commonly ' +
      'indicates a non-browser client such as a command-line tool or custom ' +
      'script.  The server selected the alternate demonstration profile.'
  };
}

/**
 * GET /api/security-lab/cloaking-demo
 *
 * Demonstrates request-dependent response selection in a fully observable,
 * educational, and harmless way.
 *
 * What it does:
 *   1. Reads the User-Agent header and authentication state from the request.
 *   2. Selects one of two predefined harmless content profiles.
 *   3. Returns the decision, the reason, and harmless demo content.
 *   4. Logs every decision to stdout so it is observable in development.
 *
 * What it deliberately does NOT do:
 *   - Evade security tools, scanners, or WAFs
 *   - Identify specific antivirus or penetration-testing products
 *   - Serve malicious payloads
 *   - Hide behaviour from developers or security analysts
 */
const handleCloakingDemo = async (req, res, next) => {
  try {
    const requestId = req.requestId;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const isAuthenticated = Boolean(req.user?.uid);
    const userId = req.user?.uid || 'unauthenticated';

    const { profile, reason } = selectDemoProfile(userAgent);

    // ── Observable decision log ──────────────────────────────────────────────
    // Every decision is written to stdout so it can be inspected in
    // development.  No tokens, passwords, or secrets are logged.
    logInfo('Security Lab: cloaking-demo decision', {
      requestId,
      userAgent,
      isAuthenticated,
      userId,          // uid only, never the token itself
      selectedProfile: profile,
      selectionReason: reason
    });

    // ── Harmless demonstration content per profile ────────────────────────────
    const profiles = {
      browser: {
        demo: true,
        profile: 'browser',
        reason,
        content:
          'This is the browser demonstration profile.  ' +
          'A standard web browser requested this endpoint, so the server ' +
          'returned human-readable content formatted for display.',
        requestId
      },
      'alternate-demo': {
        demo: true,
        profile: 'alternate-demo',
        reason,
        content:
          'This is the alternate educational profile.  ' +
          'A non-browser client requested this endpoint.  In real cloaking ' +
          'scenarios a server might serve different content here — this demo ' +
          'only returns harmless illustrative text.',
        requestId
      }
    };

    return res.status(200).json({
      success: true,
      data: {
        ...profiles[profile],
        meta: {
          userAgent,
          isAuthenticated,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleCloakingDemo };
