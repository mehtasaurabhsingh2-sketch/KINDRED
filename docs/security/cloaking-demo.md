# KINDRED — Security Lab: Cloaking Demo

> **Audience:** Developers, cybersecurity learners, and interview reviewers.  
> **Purpose:** Explain what cloaking is, what this demo shows, and what it deliberately does *not* implement.

---

## 1. What is Cloaking?

**Cloaking** is the practice of returning different content to different clients
based on request metadata, rather than what the user explicitly requested.

A server "cloak" is a decision layer that inspects request signals — such as:

- The `User-Agent` header
- IP address or ASN
- Authentication state
- HTTP headers (e.g. `Accept`, `Referer`)

…and selects one of several pre-defined response profiles accordingly.

---

## 2. Request-Dependent Content Selection

This is the mechanism underlying cloaking.  The server reads one or more
request attributes and maps them to a response profile.  Examples:

| Request Signal | Typical Use |
|---|---|
| `User-Agent: Mozilla/…` | Standard browser → serve HTML |
| `User-Agent: curl/…` | CLI client → serve plain text or JSON |
| `Accept: application/json` | API client → serve JSON |
| `Authorization: Bearer …` | Authenticated → serve personalised content |
| IP geolocation | EU visitor → serve GDPR-compliant page |

In legitimate engineering these are called **content negotiation**,
**personalisation**, or **progressive enhancement**.

---

## 3. Legitimate Uses of Different Response Profiles

- **A/B testing**: 50 % of users see variant A, 50 % see variant B.
- **Mobile vs. desktop rendering**: return a lighter HTML structure for narrow viewports.
- **API versioning**: different `Accept` headers trigger different serialisation.
- **Feature flags**: authenticated users with a beta flag see new features.
- **Internationalisation**: `Accept-Language` drives locale selection.

None of these are suspicious in isolation.  The key is **observability** —
legitimate systems log the decision, expose it in monitoring, and behave
consistently when inspected.

---

## 4. Why Suspicious Content Differences Can Matter to Defenders

Malicious actors abuse request-dependent selection to:

1. **Hide malware from scanners** — serve clean HTML to crawlers/AVs,
   serve a drive-by-download payload to real browsers.

2. **SEO cloaking** — show keyword-stuffed content to search-engine bots
   while showing unrelated content to users.

3. **Phishing** — show a safe page when the URL is checked by a security
   gateway, serve a credential-harvesting form to real users.

4. **WAF evasion** — detect web application firewalls by their User-Agent
   or IP range and serve benign traffic to bypass inspection.

What makes this *suspicious* rather than *legitimate* is:

- The content difference is covert (not logged, not declared).
- The alternate content is harmful.
- The selection criteria target security infrastructure.

---

## 5. How Investigators Compare Responses

A defender investigating suspected cloaking would:

1. **Replay the request with a different User-Agent** using `curl`, Burp Suite,
   or a custom script and compare the response byte-for-byte.

2. **Check server logs** for the decision point — does the log show a branching
   condition?  Is the selected profile recorded?

3. **Use a headless browser** (Puppeteer, Playwright) to mimic a real user and
   compare to a bare HTTP fetch.

4. **Crawl with different IP ranges** to detect geolocation-based branching.

5. **Monitor over time** — archive responses daily and diff them to detect
   profile changes.

---

## 6. What the KINDRED Demo Demonstrates

**Route:** `GET /api/security-lab/cloaking-demo`

The endpoint:

1. Reads the `User-Agent` header from the incoming request.
2. Checks whether the request is authenticated (Firebase token present).
3. Selects one of two **harmless demonstration profiles** based on whether
   `Mozilla` appears in the User-Agent:
   - **Browser profile** — returned when the UA contains `Mozilla` (standard
     browser prefix).
   - **Alternate demo profile** — returned when the UA does not (e.g. `curl`,
     a Python script, a custom client).
4. Returns the selected profile, the selection reason, and harmless
   illustrative content in a single JSON response.
5. **Logs every decision** to stdout (timestamp, requestId, UA, auth state,
   selected profile, reason) so the behaviour is fully observable.

The frontend reads the response and displays:

- The detected User-Agent.
- The authentication state.
- The request ID (traceable in backend logs).
- The selected profile and the reason the server chose it.
- The harmless response content.

---

## 7. What the Demo Deliberately Does NOT Implement

| Capability | Status |
|---|---|
| Antivirus / EDR evasion | ❌ Not implemented |
| WAF bypass | ❌ Not implemented |
| Scanner or crawler detection | ❌ Not implemented |
| Specific security-tool identification | ❌ Not implemented |
| Malicious payload delivery | ❌ Not implemented |
| CAPTCHA bypass | ❌ Not implemented |
| Phishing content | ❌ Not implemented |
| Covert / hidden decision logic | ❌ Not implemented (all decisions logged) |
| Modification of existing KINDRED chat | ❌ Not implemented |

The selection criterion (`Mozilla` in UA) is deliberately coarse and
non-evasive — it matches the standard browser prefix, not any security
product.

---

## 8. Security Limitations

- This is a **development-only educational demo**.  It should not be
  deployed to production as a live attack simulation without explicit
  scope agreement.
- The demo does not simulate real-world threat actor techniques, which are
  far more sophisticated.
- The classification accuracy (browser vs. non-browser) is intentionally
  simple.  Real fingerprinting systems are more complex.

---

## 9. Interview Explanation

> *"I built a controlled demonstration inside KINDRED, my AI companion
> application, showing how a server can inspect request context and select
> different harmless response profiles.  The purpose was to understand the
> mechanism behind cloaking — how the server-side decision is structured,
> what signals it reads, and what the response difference looks like.*
>
> *I deliberately kept the implementation observable: every decision is
> written to the server log with the request ID, user-agent, auth state,
> and selection reason.  That is the opposite of how real cloaking is
> abused — malicious cloaking is covert; this is transparent.*
>
> *I did not implement security-tool evasion, scanner detection, WAF
> bypass, or any form of malicious payload delivery.  The two profiles
> contain only illustrative text.  The implementation is isolated from the
> main chat system — it has its own controller, its own route, and its own
> frontend page — so it cannot interfere with the AI companion
> functionality.*
>
> *If a defender wanted to investigate cloaking on a real site, they would
> replay the request with a different User-Agent using curl or Burp Suite
> and compare the responses.  They would also check whether the server logs
> show a branching decision.  My demo makes both of those steps trivial
> because the log entry and the response both contain the reason.*"

---

*Document maintained alongside the KINDRED codebase.  Last updated: 2026-10-01.*
