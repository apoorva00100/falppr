import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { MessageSquare, Upload, Send, FileText, Library, ChevronLeft, ChevronRight, Moon, Paperclip, RefreshCw, ExternalLink, ChevronDown, ChevronUp, Database, LogOut, Github } from "lucide-react";
import { Landing } from "./Landing.jsx";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function compactFilters(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, v]) => Array.isArray(v) && v.length));
}

// ── Platform icon ────────────────────────────────────────────
function PlatformIcon({ platform, size = 18 }) {
  const s = { width: size, height: size, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, fontWeight: 700, flexShrink: 0 };
  if (platform === "linkedin")  return <span style={{ ...s, background: "#0a66c2", color: "#fff" }}>in</span>;
  if (platform === "twitter")   return <span style={{ ...s, background: "#1a1a1a", color: "#fff", border: "1px solid #333" }}>X</span>;
  if (platform === "instagram") return <span style={{ ...s, background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", color: "#fff" }}>IG</span>;
  if (platform === "pdf")       return <span style={{ ...s, background: "#b91c1c", color: "#fff", fontSize: size * 0.42 }}>PDF</span>;
  if (platform === "image")     return <span style={{ ...s, background: "#f97316", color: "#fff", fontSize: size * 0.42 }}>IMG</span>;
  return <span style={{ ...s, background: "#1c1c1e", color: "#9a9a9a" }}>{(platform || "?")[0].toUpperCase()}</span>;
}

// ── Left sidebar ─────────────────────────────────────────────
function LeftSidebar({ collapsed, onCollapse, page, setPage, ingestion, user, onLogout }) {
  const navItems = [
    { id: "chat",    label: "Chat",    Icon: MessageSquare },
    { id: "import",  label: "Import",  Icon: Upload },
    { id: "library", label: "Library", Icon: Library },
  ];

  return (
    <aside className={`flex flex-col h-full border-r border-[#262628] bg-[#0f0f10] transition-all duration-200 ${collapsed ? "w-[60px]" : "w-[200px]"}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-[#262628]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Database size={18} className="text-[#f97316]" />
            <span className="font-semibold text-[15px] text-[#f5f5f5]">Memex</span>
          </div>
        )}
        {collapsed && <Database size={18} className="text-[#f97316] mx-auto" />}
        <button onClick={onCollapse} className="text-[#4a4a4a] hover:text-[#9a9a9a] cursor-pointer bg-transparent border-none p-0.5 ml-auto">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {navItems.map(({ id, label, Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] cursor-pointer border-none w-full text-left transition-colors duration-150
                ${active
                  ? "bg-[#2d1200] text-[#f97316] font-medium"
                  : "bg-transparent text-[#9a9a9a] hover:bg-[#1c1c1e] hover:text-[#f5f5f5]"}`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Knowledge base */}
      {ingestion && !collapsed && (
        <div className="px-3 py-3 border-t border-[#262628]">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#f97316] inline-block flex-shrink-0" />
            <span className="text-[11px] font-semibold text-[#f5f5f5]">Knowledge Base</span>
          </div>
          <p className="text-[10px] text-[#4a4a4a] mb-2">{ingestion.documentsParsed} documents · {ingestion.chunksEmbedded} chunks</p>
          {[["Documents", ingestion.documentsParsed], ["Chunks", ingestion.chunksCreated], ["Duplicates", ingestion.chunksSkippedAsDuplicates], ["Embedded", ingestion.chunksEmbedded]].map(([label, val]) => (
            <div key={label} className="flex justify-between text-[11px] text-[#9a9a9a] py-0.5">
              <span>{label}</span><span className="font-medium text-[#f5f5f5]">{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* User */}
      <div className={`flex items-center gap-2 px-3 py-3 border-t border-[#262628] ${collapsed ? "justify-center" : ""}`}>
        {user ? (
          <>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#f97316] text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                {(user.name || user.login || "?")[0].toUpperCase()}
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#f5f5f5] truncate">{user.name || user.login}</p>
                <p className="text-[10px] text-[#4a4a4a] truncate">@{user.login}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={onLogout} className="text-[#4a4a4a] hover:text-[#f97316] bg-transparent border-none cursor-pointer p-0.5 flex-shrink-0" aria-label="Sign out">
                <LogOut size={13} />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => { window.location.hash = "signin"; }}
            className={`flex items-center gap-2 text-[12px] font-medium text-[#f5f5f5] hover:text-[#f97316] bg-transparent border-none cursor-pointer p-0 w-full ${collapsed ? "justify-center" : ""}`}
          >
            <Github size={18} className="flex-shrink-0" />
            {!collapsed && <span>Sign in</span>}
          </button>
        )}
      </div>
    </aside>
  );
}

// ── Right panel ───────────────────────────────────────────────
function RightPanel({ citations, filters, setFilters }) {
  const platforms = ["all", "linkedin", "twitter", "instagram", "pdf", "image"];
  const [dateRange, setDateRange] = useState("All time");
  const [contentType, setContentType] = useState("All");

  function togglePlatform(p) {
    if (p === "all") { setFilters(f => ({ ...f, platform: [] })); return; }
    setFilters(f => {
      const curr = f.platform || [];
      const next = curr.includes(p) ? curr.filter(x => x !== p) : [...curr, p];
      return { ...f, platform: next };
    });
  }

  const activePlatforms = filters.platform || [];

  return (
    <aside className="w-[240px] flex flex-col h-full border-l border-[#262628] bg-[#0f0f10] overflow-y-auto flex-shrink-0">
      {/* Sources */}
      <div className="p-4 border-b border-[#262628]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-semibold text-[#f5f5f5]">Sources</span>
          {citations.length > 0 && <span className="text-[11px] bg-[#2d1200] text-[#f97316] px-1.5 py-0.5 rounded font-medium">{citations.length}</span>}
        </div>
        {citations.length === 0 ? (
          <p className="text-[12px] text-[#4a4a4a]">Sources will appear here after you ask a question.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {citations.map((c) => (
              <div key={c.id} className="bg-[#141415] border border-[#262628] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <PlatformIcon platform={c.platform} size={16} />
                    <span className="text-[11px] font-medium text-[#f5f5f5] capitalize">{c.platform}</span>
                    <span className="text-[11px] text-[#4a4a4a]">· {c.documentType}</span>
                  </div>
                  <button className="text-[#4a4a4a] hover:text-[#9a9a9a] bg-transparent border-none cursor-pointer p-0">
                    <span className="text-[14px] leading-none">⋮</span>
                  </button>
                </div>
                {c.createdAt && <p className="text-[10px] text-[#4a4a4a] mb-1.5">{new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>}
                <p className="text-[12px] text-[#9a9a9a] leading-relaxed line-clamp-3 mb-2">{c.snippet}</p>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-[#f97316] hover:underline font-medium">
                    View source <ExternalLink size={10} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-semibold text-[#f5f5f5]">Filters</span>
          {activePlatforms.length > 0 && (
            <button onClick={() => setFilters(f => ({ ...f, platform: [] }))} className="text-[11px] text-[#f97316] bg-transparent border-none cursor-pointer hover:underline">Clear all</button>
          )}
        </div>

        {/* Platform pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {platforms.map(p => {
            const active = p === "all" ? activePlatforms.length === 0 : activePlatforms.includes(p);
            return (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border cursor-pointer transition-colors duration-150
                  ${active
                    ? "bg-[#f97316] text-white border-[#f97316]"
                    : "bg-[#141415] text-[#9a9a9a] border-[#262628] hover:border-[#f97316] hover:text-[#f97316]"}`}
              >
                {p !== "all" && <PlatformIcon platform={p} size={12} />}
                <span className="capitalize">{p === "all" ? "All" : p}</span>
              </button>
            );
          })}
        </div>

        {/* Date range */}
        <div className="mb-3">
          <label className="text-[11px] text-[#4a4a4a] block mb-1">Date range</label>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="w-full text-[12px] text-[#f5f5f5] bg-[#141415] border border-[#262628] rounded-lg px-2.5 py-1.5 cursor-pointer"
          >
            {["All time", "Last 7 days", "Last 30 days", "Last year"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {/* Content type */}
        <div className="mb-3">
          <label className="text-[11px] text-[#4a4a4a] block mb-1">Content type</label>
          <select
            value={contentType}
            onChange={e => setContentType(e.target.value)}
            className="w-full text-[12px] text-[#f5f5f5] bg-[#141415] border border-[#262628] rounded-lg px-2.5 py-1.5 cursor-pointer"
          >
            {["All", "Post", "Tweet", "Article", "Reply", "Caption", "Profile"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <button className="text-[11px] text-[#9a9a9a] hover:text-[#f97316] bg-transparent border-none cursor-pointer flex items-center gap-1 transition-colors">
          More filters <ChevronDown size={12} />
        </button>
      </div>
    </aside>
  );
}

// ── Chat main ─────────────────────────────────────────────────
function ChatMain({ chat, asking, message, setMessage, onSend, userName }) {
  const messagesEndRef = useRef(null);
  const [expandedSources, setExpandedSources] = useState({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, asking]);

  function toggleSources(idx) {
    setExpandedSources(s => ({ ...s, [idx]: !s[idx] }));
  }

  return (
    <div className="flex flex-col h-full bg-[#080809]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#262628]">
        <h2 className="text-[20px] font-semibold text-[#f5f5f5]">Good {greeting()}, {userName} 👋</h2>
        <p className="text-[13px] text-[#4a4a4a] mt-0.5">Ask yourself what you've been up to for 5 years.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        {chat.length === 0 && (
          <div className="m-auto text-center max-w-sm">
            <MessageSquare size={32} className="text-[#262628] mx-auto mb-3" />
            <p className="text-[14px] text-[#4a4a4a]">Ask something like "What does this person think about remote work?"</p>
          </div>
        )}

        {chat.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {msg.role === "user" ? (
              <>
                <div className="max-w-[75%] bg-[#f97316] text-white text-[14px] leading-relaxed px-4 py-2.5 rounded-2xl rounded-br-sm">{msg.content}</div>
                <span className="text-[11px] text-[#4a4a4a] mt-1 mr-0.5">
                  {msg.createdAt ? fmtTime(msg.createdAt) : ""} ✓
                </span>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2.5 max-w-[80%]">
                  <div className="w-7 h-7 rounded-full bg-[#2d1200] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Database size={13} className="text-[#f97316]" />
                  </div>
                  <div>
                    <div className="bg-[#1c1c1e] text-[#f5f5f5] text-[14px] leading-relaxed px-4 py-2.5 rounded-2xl rounded-bl-sm">{msg.content}</div>
                    {msg.citations?.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleSources(idx)}
                          className="flex items-center gap-1 text-[11px] text-[#9a9a9a] hover:text-[#f97316] bg-transparent border-none cursor-pointer font-medium transition-colors"
                        >
                          Sources ({msg.citations.length})
                          {expandedSources[idx] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        {expandedSources[idx] && (
                          <div className="flex flex-col gap-2 mt-2">
                            {msg.citations.map((c) => (
                              <div key={c.id} className="flex items-start gap-2 bg-[#141415] border border-[#262628] rounded-lg px-3 py-2">
                                <PlatformIcon platform={c.platform} size={14} />
                                <div className="min-w-0">
                                  <p className="text-[11px] text-[#9a9a9a] font-medium capitalize">{c.platform} · {c.documentType} {c.createdAt ? `· ${new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}</p>
                                  <p className="text-[12px] text-[#f5f5f5] mt-0.5 leading-relaxed line-clamp-2">"{c.snippet}"</p>
                                  {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-[11px] text-[#f97316] hover:underline flex items-center gap-0.5 mt-1 font-medium">View <ExternalLink size={9} /></a>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <span className="text-[11px] text-[#4a4a4a] mt-1 block ml-0.5">{msg.createdAt ? fmtTime(msg.createdAt) : ""}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {asking && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#2d1200] flex items-center justify-center flex-shrink-0">
              <Database size={13} className="text-[#f97316]" />
            </div>
            <div className="bg-[#1c1c1e] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-bounce opacity-70" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="px-6 pb-5 pt-3">
        <form onSubmit={onSend} className="flex items-center gap-3 border border-[#262628] bg-[#141415] rounded-xl px-4 py-2.5">
          <button type="button" className="text-[#4a4a4a] hover:text-[#f97316] bg-transparent border-none cursor-pointer p-0 flex-shrink-0 transition-colors" aria-label="Attach file">
            <Paperclip size={16} />
          </button>
          <button type="button" className="text-[#4a4a4a] hover:text-[#f97316] bg-transparent border-none cursor-pointer p-0 flex-shrink-0 transition-colors" aria-label="Refresh">
            <RefreshCw size={15} />
          </button>
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Ask anything about this person..."
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#f5f5f5] placeholder-[#4a4a4a]"
          />
          <button
            type="submit"
            disabled={asking || !message.trim()}
            aria-label="Send"
            className="w-8 h-8 rounded-lg bg-[#f97316] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#ea6c0d] transition-colors border-none cursor-pointer"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Import page ───────────────────────────────────────────────
function ImportPage({ files, setFiles, ingestion, uploading, onIngest }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#080809] p-8">
      <h2 className="text-[18px] font-semibold text-[#f5f5f5] mb-1">Import data</h2>
      <p className="text-[13px] text-[#9a9a9a] mb-6">Upload your social media exports, PDFs, or images to build your knowledge base.</p>

      <div className="max-w-lg">
        <form onSubmit={onIngest}>
          <label className="flex flex-col items-center justify-center gap-3 min-h-[140px] border border-dashed border-[#2a2a2a] rounded-xl bg-[#141415] text-[#9a9a9a] cursor-pointer hover:border-[#f97316] hover:text-[#f97316] transition-colors mb-4">
            <input type="file" multiple accept=".csv,.json,.html,.pdf,.png,.jpg,.jpeg,.webp,.bmp" className="hidden" onChange={e => setFiles(Array.from(e.target.files || []))} />
            <FileText size={28} />
            <span className="text-[13px]">{files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Choose files (CSV, JSON, HTML, PDF, Images)"}</span>
          </label>

          <button
            type="submit"
            disabled={!files.length || uploading}
            className="w-full flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6c0d] text-white text-[14px] font-medium py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-none cursor-pointer"
          >
            <Upload size={16} />
            {uploading ? "Importing…" : "Import files"}
          </button>
        </form>

        {ingestion && (
          <div className="mt-5">
            {ingestion.error ? (
              <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-[13px] text-red-400">{ingestion.error}</div>
            ) : (
              <div className="bg-[#141415] border border-[#262628] rounded-xl overflow-hidden">
                {[["Files received", ingestion.filesReceived], ["Documents parsed", ingestion.documentsParsed], ["Chunks created", ingestion.chunksCreated], ["Duplicates skipped", ingestion.chunksSkippedAsDuplicates], ["Chunks embedded", ingestion.chunksEmbedded]].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center px-4 py-2.5 border-b border-[#262628] last:border-b-0">
                    <span className="text-[13px] text-[#9a9a9a]">{label}</span>
                    <span className="text-[13px] font-semibold text-[#f97316]">{val}</span>
                  </div>
                ))}
                {ingestion.errors?.length > 0 && (
                  <div className="px-4 py-2.5 text-[12px] text-amber-400 bg-amber-950">{ingestion.errors.length} file issue(s) reported.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Library page ──────────────────────────────────────────────
function LibraryPage({ history }) {
  const [expanded, setExpanded] = useState(null);

  function dateLabel(iso) {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }

  // group by date label
  const groups = history.reduceRight((acc, entry) => {
    const label = dateLabel(entry.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(entry);
    return acc;
  }, {});

  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#080809]">
        <Library size={36} className="mb-3 text-[#262628]" />
        <p className="text-[14px] font-medium text-[#9a9a9a]">No chat history yet</p>
        <p className="text-[12px] text-[#4a4a4a] mt-1">Your conversations will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#080809] p-8">
      <h2 className="text-[18px] font-semibold text-[#f5f5f5] mb-1">Library</h2>
      <p className="text-[13px] text-[#4a4a4a] mb-7">Your chat history, organized by date.</p>

      <div className="max-w-2xl flex flex-col gap-8">
        {Object.entries(groups).map(([label, entries]) => (
          <div key={label}>
            <p className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-widest mb-3">{label}</p>
            <div className="flex flex-col gap-2">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="border border-[#262628] rounded-xl overflow-hidden bg-[#0f0f10]"
                >
                  {/* question row */}
                  <button
                    onClick={() => setExpanded(e => e === entry.id ? null : entry.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-transparent border-none cursor-pointer hover:bg-[#141415] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MessageSquare size={14} className="text-[#f97316] flex-shrink-0" />
                      <span className="text-[13px] text-[#f5f5f5] truncate">{entry.question}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-[11px] text-[#4a4a4a]">
                        {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {entry.citations?.length > 0 && (
                        <span className="text-[10px] bg-[#2d1200] text-[#f97316] px-1.5 py-0.5 rounded font-medium">
                          {entry.citations.length} src
                        </span>
                      )}
                      {expanded === entry.id ? <ChevronUp size={13} className="text-[#4a4a4a]" /> : <ChevronDown size={13} className="text-[#4a4a4a]" />}
                    </div>
                  </button>

                  {/* expanded answer */}
                  {expanded === entry.id && (
                    <div className="px-4 pb-4 border-t border-[#262628]">
                      <p className="text-[13px] text-[#9a9a9a] leading-relaxed pt-3">{entry.answer}</p>
                      {entry.citations?.length > 0 && (
                        <div className="flex flex-col gap-2 mt-3">
                          {entry.citations.map(c => (
                            <div key={c.id} className="flex items-start gap-2 bg-[#141415] border border-[#262628] rounded-lg px-3 py-2">
                              <PlatformIcon platform={c.platform} size={14} />
                              <div className="min-w-0">
                                <p className="text-[11px] text-[#9a9a9a] capitalize">{c.platform} · {c.documentType}{c.createdAt ? ` · ${new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}</p>
                                <p className="text-[12px] text-[#f5f5f5] mt-0.5 line-clamp-2">"{c.snippet}"</p>
                                {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-[11px] text-[#f97316] hover:underline flex items-center gap-0.5 mt-1">View <ExternalLink size={9} /></a>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Placeholder pages ─────────────────────────────────────────
function PlaceholderPage({ icon: Icon, title }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#080809] text-[#4a4a4a]">
      <Icon size={36} className="mb-3 text-[#262628]" />
      <p className="text-[14px] font-medium text-[#9a9a9a]">{title}</p>
      <p className="text-[12px] mt-1">Coming soon</p>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────
function App({ user, onLogout }) {
  const [page, setPage] = useState("chat");
  const userName = user?.name?.split(" ")[0] || user?.login || "there";

  useEffect(() => {
    function onMouseMove(e) {
      document.documentElement.style.setProperty("--glow-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--glow-y", `${e.clientY}px`);
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [files, setFiles] = useState([]);
  const [ingestion, setIngestion] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [asking, setAsking] = useState(false);
  const [filters, setFilters] = useState({ platform: [], documentType: [] });
  const [lastCitations, setLastCitations] = useState([]);
  const [history, setHistory] = useState([]);

  async function handleIngest(e) {
    e.preventDefault();
    if (!files.length) return;
    setUploading(true);
    setIngestion(null);
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    try {
      const res = await fetch(`${API_BASE}/api/ingest`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ingestion failed");
      setIngestion(data);
      setPage("chat");
    } catch (err) {
      setIngestion({ error: err.message });
    } finally {
      setUploading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    const userMsg = { role: "user", content: trimmed, createdAt: new Date().toISOString() };
    setChat(c => [...c, userMsg]);
    setMessage("");
    setAsking(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, filters: compactFilters(filters) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      const citations = data.citations || [];
      setLastCitations(citations);
      const now = new Date().toISOString();
      setChat(c => [...c, { role: "assistant", content: data.answer, citations, createdAt: now }]);
      setHistory(h => [...h, { id: `${Date.now()}`, question: trimmed, answer: data.answer, citations, createdAt: now }]);
    } catch (err) {
      setChat(c => [...c, { role: "assistant", content: err.message, citations: [], createdAt: new Date().toISOString() }]);
    } finally {
      setAsking(false);
    }
  }

  const mainContent = () => {
    if (page === "chat")      return <ChatMain chat={chat} asking={asking} message={message} setMessage={setMessage} onSend={handleSend} userName={userName} />;
    if (page === "import")    return <ImportPage files={files} setFiles={setFiles} ingestion={ingestion} uploading={uploading} onIngest={handleIngest} />;
    if (page === "library")   return <LibraryPage history={history} />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#080809] font-[Inter,ui-sans-serif,system-ui,sans-serif] relative">
      {/* cursor glow */}
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle 800px at var(--glow-x, 50%) var(--glow-y, 50%), rgba(249,115,22,0.07), rgba(249,115,22,0.02) 40%, transparent 70%)"
      }} />
      <LeftSidebar
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(s => !s)}
        page={page}
        setPage={setPage}
        ingestion={ingestion}
        user={user}
        onLogout={onLogout}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {mainContent()}
      </main>
      <RightPanel citations={lastCitations} filters={filters} setFilters={setFilters} />
    </div>
  );
}

// ── Auth page (sign in / sign up) ────────────────────────────
function AuthPage({ onAuthed }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body = mode === "signup" ? { email, password, name } : { email, password };
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      onAuthed(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full bg-[#141415] border border-[#262628] rounded-xl px-4 py-3 text-[14px] text-[#f5f5f5] placeholder-[#5a5a5a] outline-none focus:border-[#f97316] transition-colors";

  return (
    <div className="flex h-screen items-center justify-center bg-[#080809] px-4">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email" required placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} className={inputClass}
          />
          <input
            type="password" required minLength={8} placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} className={inputClass}
          />
          {mode === "signup" && (
            <input
              type="text" placeholder="Name (optional)" value={name}
              onChange={e => setName(e.target.value)} className={inputClass}
            />
          )}
          {error && <p className="text-[12px] text-red-400">{error}</p>}
          <button
            type="submit" disabled={submitting}
            className="w-full bg-[#f97316] hover:bg-[#ea6c0d] disabled:opacity-50 text-white text-[15px] font-semibold py-3 rounded-xl border-none cursor-pointer transition-colors shadow-[0_0_24px_rgba(249,115,22,0.35)]"
          >
            {submitting ? "Please wait…" : mode === "signup" ? "Sign up" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#262628]" />
          <span className="text-[12px] text-[#5a5a5a]">or</span>
          <div className="flex-1 h-px bg-[#262628]" />
        </div>

        <a
          href={`${API_BASE}/api/auth/github`}
          className="flex items-center justify-center gap-2 w-full border border-[#262628] hover:border-[#f97316] text-[#f5f5f5] hover:text-[#f97316] text-[14px] font-medium py-3 rounded-xl no-underline transition-colors"
        >
          <Github size={16} /> Continue with GitHub
        </a>

        <p className="text-center text-[13px] text-[#9a9a9a] mt-6">
          {mode === "signup" ? (
            <>Already have an account?{" "}
              <button type="button" onClick={() => setMode("signin")} className="text-[#f97316] bg-transparent border-none cursor-pointer p-0 font-medium">Sign in</button>
            </>
          ) : (
            <>No account yet?{" "}
              <button type="button" onClick={() => setMode("signup")} className="text-[#f97316] bg-transparent border-none cursor-pointer p-0 font-medium">Sign up</button>
            </>
          )}
        </p>

        <button
          type="button"
          onClick={() => { window.location.hash = ""; }}
          className="block mx-auto mt-5 text-[12px] text-[#5a5a5a] hover:text-[#f97316] bg-transparent border-none cursor-pointer transition-colors"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────
function useSession() {
  const [status, setStatus] = useState("loading"); // loading | authed | anon
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`)
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => { setUser(data.user); setStatus("authed"); })
      .catch(() => setStatus("anon"));
  }, []);

  return { status, user, setStatus, setUser };
}

function Root() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const session = useSession();

  async function handleLogout() {
    await fetch(`${API_BASE}/api/auth/logout`, { method: "POST" });
    session.setStatus("anon");
    window.location.hash = "";
  }

  function handleAuthed(user) {
    session.setUser(user);
    session.setStatus("authed");
    window.location.hash = "app";
  }

  if (hash === "#signin") return <AuthPage onAuthed={handleAuthed} />;
  if (hash !== "#app") return <Landing />;
  if (session.status === "loading") return <div className="h-screen bg-[#080809]" />;

  return <App user={session.status === "authed" ? session.user : null} onLogout={handleLogout} />;
}

// createRoot(document.getElementById("root")).render(<Landing />);
createRoot(document.getElementById("root")).render(<Root />);

