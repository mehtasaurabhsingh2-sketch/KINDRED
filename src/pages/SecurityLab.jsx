import React, { useContext, useState, useCallback } from 'react';
import {
  FlaskConical,
  RefreshCw,
  ShieldCheck,
  BookOpen,
  Monitor,
  Globe
} from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { fetchCloakingDemo } from '../services/api';
import './SecurityLab.css';

// ── Sub-components ────────────────────────────────────────────────────────────

/** One labelled info row inside the result grid. */
const InfoRow = ({ label, children }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{children}</span>
  </div>
);

/** Coloured pill showing which demo profile was selected. */
const ProfileBadge = ({ profile }) => {
  const isBrowser = profile === 'browser';
  return (
    <span className={`profile-badge ${isBrowser ? 'browser' : 'alternate'}`}>
      {isBrowser ? <Monitor size={14} /> : <Globe size={14} />}
      {isBrowser ? 'Browser Profile' : 'Alternate Demo Profile'}
    </span>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const SecurityLab = () => {
  const { currentUser } = useContext(AuthContext);

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  /**
   * Fires the cloaking-demo request.  Using useCallback so the function
   * reference is stable across renders (lint friendly).
   */
  const runDemo = useCallback(async () => {
    if (!currentUser || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = await currentUser.getIdToken();
      const data  = await fetchCloakingDemo(token);
      setResult(data);
    } catch (err) {
      // Surface a clean message — never a raw stack trace.
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, loading]);

  return (
    <div className="security-lab-layout">
      <Sidebar />

      <main className="security-lab-content">

        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="lab-header">
          <FlaskConical size={32} className="lab-header-icon" />
          <h1 className="lab-title">Security Lab</h1>
        </div>
        <p className="lab-subtitle">
          Controlled cybersecurity experiments — for learning and interview demonstration.
        </p>
        
        <div style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <ShieldCheck size={16} /> Administrator / Developer Environment
        </div>

        {/* ── Cloaking Demo Card ─────────────────────────────────────────── */}
        <div className="demo-card">
          <div className="demo-card-header">
            <div className="demo-card-title">
              <ShieldCheck size={20} className="demo-card-title-icon" />
              Cloaking Demo
            </div>
            <button
              id="run-cloaking-demo-btn"
              className="btn-run-demo"
              onClick={runDemo}
              disabled={loading}
              aria-label="Run cloaking demonstration"
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              {loading ? 'Running…' : result ? 'Run Again' : 'Run Demo'}
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="demo-loading">
              Sending request to the backend… inspecting context…
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="demo-error">
              ⚠ {error}
            </div>
          )}

          {/* Result */}
          {!loading && result && (
            <div className="demo-result">

              {/* Request Context */}
              <InfoRow label="User-Agent (detected)">
                <code>{result.meta?.userAgent || '—'}</code>
              </InfoRow>

              <InfoRow label="Authentication">
                {result.meta?.isAuthenticated
                  ? '✅ Authenticated'
                  : '🔒 Unauthenticated'}
              </InfoRow>

              <InfoRow label="Request ID">
                <code>{result.requestId || '—'}</code>
              </InfoRow>

              <hr className="lab-divider" />

              {/* Selected Profile */}
              <InfoRow label="Selected Profile">
                <ProfileBadge profile={result.profile} />
              </InfoRow>

              {/* Reason */}
              <InfoRow label="Selection Reason">
                {result.reason}
              </InfoRow>

              <hr className="lab-divider" />

              {/* Response Preview */}
              <InfoRow label="Response Preview">
                <div className="response-preview">{result.content}</div>
              </InfoRow>

            </div>
          )}

          {/* Empty state */}
          {!loading && !result && !error && (
            <div className="demo-loading">
              Click <strong>Run Demo</strong> to send a request and see how the server selects a profile.
            </div>
          )}
        </div>

        {/* ── Educational Explanation ────────────────────────────────────── */}
        <div className="education-section">
          <div className="education-title">
            <BookOpen size={20} className="education-title-icon" />
            What is Cloaking?
          </div>

          <p className="edu-q">Definition</p>
          <p className="edu-a">
            Cloaking is the practice of presenting different content to different
            clients based on request metadata — such as the User-Agent header,
            IP address, or authentication state.
          </p>

          <p className="edu-q">Legitimate uses</p>
          <p className="edu-a">
            A/B testing, personalisation, mobile vs. desktop rendering, and
            progressive enhancement all involve returning different content based
            on context.  These are normal engineering practices.
          </p>

          <p className="edu-q">Why it can be suspicious</p>
          <p className="edu-a">
            Malicious actors use cloaking to hide harmful content from security
            scanners while showing it to real users, or to serve different pages
            to search-engine crawlers than to visitors.  This can constitute spam,
            SEO fraud, or malware delivery.
          </p>

          <p className="edu-q">How defenders investigate it</p>
          <p className="edu-a">
            Analysts can replay a request with a modified User-Agent, compare
            responses, and check whether the server behaves consistently.  Log
            correlation tools can also flag when the same URL returns structurally
            different responses over time.
          </p>

          <p className="edu-q">What this demo shows</p>
          <p className="edu-a">
            The server inspects the User-Agent to select one of two <em>harmless</em>{' '}
            content profiles.  Both profiles contain only illustrative text.  The
            decision is written to the server log so it is fully observable — the
            opposite of covert cloaking.
          </p>
        </div>

        {/* ── Safety Banner ──────────────────────────────────────────────── */}
        <div className="safety-banner">
          <ShieldCheck size={20} className="safety-banner-icon" />
          <span>
            This is a controlled educational demonstration.  It does <strong>not</strong>{' '}
            implement security-tool evasion, antivirus detection, WAF bypass,
            crawler deception, or any form of stealth or malicious behaviour.
          </span>
        </div>

      </main>
    </div>
  );
};

export default SecurityLab;
