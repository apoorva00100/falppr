import React, { useEffect, useRef } from "react";

const HEALTH_URL = (import.meta.env.VITE_API_BASE || "") + "/api/health";

export function Landing() {
  const toastRef = useRef(null);
  const botWrapRef = useRef(null);
  const thinkingRef = useRef(null);

  // cursor-following glow
  useEffect(() => {
    function onMouseMove(e) {
      document.documentElement.style.setProperty("--glow-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--glow-y", `${e.clientY}px`);
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    const statIds = ["ls1", "ls2", "ls3", "ls4"];
    const delays = [1650, 1900, 2150, 2400];
    statIds.forEach((id, i) => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.classList.add("ls-visible");
      }, delays[i]);
    });

    const botTimer = setTimeout(() => {
      if (thinkingRef.current) thinkingRef.current.style.display = "none";
      if (botWrapRef.current) botWrapRef.current.style.display = "block";
    }, 4100);

    return () => clearTimeout(botTimer);
  }, []);

  async function handleCta() {
    try {
      const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2000) });
      if (res.ok) { window.location.hash = "app"; return; }
    } catch {}
    showToast();
  }

  function showToast() {
    const el = toastRef.current;
    if (!el) return;
    el.style.opacity = "1";
    setTimeout(() => { el.style.opacity = "0"; }, 3500);
  }

  return (
    <div className="lp-shell">
      <div className="lp-cursor-glow" aria-hidden="true" />

      {/* ── hero + mockup side by side ── */}
      <div className="lp-above-fold">

        {/* left: hero + process */}
        <div>
          <section className="lp-hero">
            <div className="lp-badge">personal knowledge base</div>
            <h1 className="lp-title">Mem<span>ex</span></h1>
            <p className="lp-tagline">Ask yourself what you've been up to for 5 years.</p>
          </section>

          <section className="lp-process">
            <p className="lp-process-head">How it works</p>
            <div className="lp-steps">
              {[
                { n: 1, title: "Export your data",          body: "Download archives from LinkedIn, Twitter/X, or Instagram. CSV, JSON, and HTML all work." },
                { n: 2, title: "Build your knowledge base", body: "Drop in your files. Memex parses, chunks, and embeds everything — deduplication included." },
                { n: 3, title: "Ask anything",              body: "Chat with your history. Get grounded answers with cited sources pulled from your own words." }
              ].map(({ n, title, body }) => (
                <div className="lp-step" key={n} style={{ animationDelay: `${(n - 1) * 0.15}s` }}>
                  <div className="lp-step-num">{n}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* right: mockup */}
        <div className="lp-frame-wrap">
          <div className="lp-frame">
            <div className="lp-topbar">
              <span className="lp-dot" /><span className="lp-dot" /><span className="lp-dot" />
            </div>

            <div className="lp-app">
              {/* left sidebar */}
              <div className="lp-app-sidebar">
                <div className="lp-app-logo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><ellipse cx="12" cy="12" rx="10" ry="4"/><path d="M2 12c0 2.21 4.48 4 10 4s10-1.79 10-4"/><path d="M2 12v4c0 2.21 4.48 4 10 4s10-1.79 10-4v-4"/></svg>
                  <span>Memex</span>
                </div>
                <div className="lp-app-nav">
                  {[
                    { label: "Chat",    active: true,  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                    { label: "Import",  active: false, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
                    { label: "Library", active: false, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
                  ].map(({ label, active, icon }) => (
                    <div key={label} className={`lp-app-nav-item${active ? " lp-app-nav-active" : ""}`}>
                      {icon}<span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="lp-app-kb">
                  <div className="lp-app-kb-dot" /><span>Knowledge Base</span>
                  <div className="lp-app-kb-rows">
                    <div className="lp-app-kb-row"><span>Documents</span><strong id="ls1">10</strong></div>
                    <div className="lp-app-kb-row"><span>Chunks</span><strong id="ls2">10</strong></div>
                    <div className="lp-app-kb-row"><span>Duplicates</span><strong id="ls3">0</strong></div>
                    <div className="lp-app-kb-row"><span>Embedded</span><strong id="ls4">10</strong></div>
                  </div>
                </div>
                <div className="lp-app-user">
                  <div className="lp-app-avatar">A</div>
                  <div>
                    <div className="lp-app-user-name">Arjun Sharma</div>
                    <div className="lp-app-user-sub">Local Workspace</div>
                  </div>
                </div>
              </div>

              {/* chat main */}
              <div className="lp-app-chat">
                <div className="lp-app-chat-header">
                  <div className="lp-app-chat-title">Good afternoon, Arjun 👋</div>
                  <div className="lp-app-chat-sub">Ask yourself what you've been up to for 5 years.</div>
                </div>
                <div className="lp-app-messages">
                  <div className="lp-app-msg-user">What does this person think about remote work?</div>
                  <div className="lp-thinking" ref={thinkingRef} style={{ alignSelf: "flex-start" }}>
                    <span /><span /><span />
                  </div>
                  <div className="lp-bot-wrap" ref={botWrapRef} style={{ display: "none", alignSelf: "flex-start" }}>
                    <div className="lp-app-msg-bot-row">
                      <div className="lp-app-bot-avatar">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><ellipse cx="12" cy="12" rx="10" ry="4"/><path d="M2 12c0 2.21 4.48 4 10 4s10-1.79 10-4"/></svg>
                      </div>
                      <div>
                        <div className="lp-app-msg-bot">They're a strong advocate for async-first remote work — believing it forces better documentation and consistently outperforms co-located teams. [1]</div>
                        <div className="lp-citation">📎 linkedin · post · Mar 2024 — "Remote work changed everything for me..."</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lp-app-composer">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a4a4a" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  <span>Ask anything about this person...</span>
                  <button className="lp-app-send" aria-label="send">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </div>

              {/* right panel */}
              <div className="lp-app-right">
                <div className="lp-app-right-section">
                  <div className="lp-app-right-title">Sources</div>
                  <div className="lp-app-source-card" style={{ opacity: 0, animation: "lp-fadeIn .4s ease forwards 4.8s" }}>
                    <div className="lp-app-source-top">
                      <span className="lp-app-platform-in">in</span>
                      <span className="lp-app-source-name">linkedin</span>
                      <span className="lp-app-source-type">· post</span>
                    </div>
                    <div className="lp-app-source-date">Mar 2024</div>
                    <div className="lp-app-source-snippet">"Remote work changed everything for me — async-first teams consistently outperform..."</div>
                  </div>
                </div>
                <div className="lp-app-right-section">
                  <div className="lp-app-right-title">Filters</div>
                  <div className="lp-app-filter-pills">
                    <span className="lp-app-pill lp-app-pill-active">All</span>
                    <span className="lp-app-pill">
                      <span className="lp-app-platform-in" style={{ fontSize: 8, width: 14, height: 14 }}>in</span>
                      Linkedin
                    </span>
                    <span className="lp-app-pill">
                      <span className="lp-app-platform-x">X</span>
                      Twitter
                    </span>
                  </div>
                  <div className="lp-app-filter-label">Date range</div>
                  <div className="lp-app-filter-select">All time ▾</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── how it works ── */}
      {/* ── cta ── */}
      <div className="lp-cta">
        <div className="lp-toast-wrap">
          <button className="lp-dig-btn" onClick={handleCta}>
            Let's dig in
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <div className="lp-toast" ref={toastRef}>
            Server not running — start it with <code>npm run dev</code>
          </div>
        </div>
      </div>
    </div>
  );
}
