import React, { useEffect, useRef } from "react";

const APP_URL = "http://localhost:5173/#app";
const HEALTH_URL = `${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/health`;

export function Landing() {
  const toastRef = useRef(null);
  const botWrapRef = useRef(null);
  const thinkingRef = useRef(null);

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
      if (res.ok) {
        window.location.hash = "app";
        return;
      }
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
      <section className="lp-hero">
        <div className="lp-badge">personal knowledge base</div>
        <h1 className="lp-title">Mem<span>ex</span></h1>
        <p className="lp-tagline">Ask yourself what you've been up to for 5 years.</p>
      </section>

      <div className="lp-frame-wrap">
        <div className="lp-frame">
          <div className="lp-topbar">
            <span className="lp-dot" /><span className="lp-dot" /><span className="lp-dot" />
            <div className="lp-urlbar">localhost:5173</div>
          </div>
          <div className="lp-body">
            <aside className="lp-sidebar">
              <div className="lp-sidebar-head">Import</div>
              <div className="lp-dropzone">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>linkedin_posts.csv</span>
              </div>
              <div className="lp-import-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Import files
              </div>
              <div className="lp-progress"><div className="lp-progress-fill" /></div>
              <div className="lp-stats">
                <div className="lp-stat-row"><span>Documents</span><strong id="ls1">10</strong></div>
                <div className="lp-stat-row"><span>Chunks</span><strong id="ls2">10</strong></div>
                <div className="lp-stat-row"><span>Duplicates</span><strong id="ls3">0</strong></div>
                <div className="lp-stat-row"><span>Embedded</span><strong id="ls4">10</strong></div>
              </div>
              <div className="lp-filter-label">Filters</div>
              <div className="lp-pills">
                <span className="lp-pill">linkedin</span>
                <span className="lp-pill">twitter</span>
                <span className="lp-pill">instagram</span>
              </div>
            </aside>
            <div className="lp-chat">
              <div className="lp-msg lp-user">What does this person think about remote work?</div>
              <div className="lp-thinking" ref={thinkingRef}>
                <span /><span /><span />
              </div>
              <div className="lp-bot-wrap" ref={botWrapRef} style={{ display: "none" }}>
                <div className="lp-msg lp-bot">
                  They're a strong advocate for async-first remote work — believing it forces better documentation and consistently outperforms co-located teams. [1]
                </div>
                <div className="lp-citation">
                  📎 linkedin · post · Mar 2024 — "Remote work changed everything for me..."
                </div>
              </div>
              <div className="lp-composer">
                <input type="text" placeholder="Ask about your social data" readOnly />
                <button aria-label="send">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="lp-divider" />

      <section className="lp-process">
        <p className="lp-process-head">How it works</p>
        <div className="lp-steps">
          {[
            { n: 1, title: "Export your data", body: "Download archives from LinkedIn, Twitter/X, or Instagram. CSV, JSON, and HTML all work." },
            { n: 2, title: "Build your knowledge base", body: "Drop in your files. Memex parses, chunks, and embeds everything — deduplication included." },
            { n: 3, title: "Ask anything", body: "Chat with your history. Get grounded answers with cited sources pulled from your own words." }
          ].map(({ n, title, body }) => (
            <div className="lp-step" key={n} style={{ animationDelay: `${(n - 1) * 0.15}s` }}>
              <div className="lp-step-num">{n}</div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

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
