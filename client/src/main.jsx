import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { MessageSquare, Send, Upload, FileText } from "lucide-react";
import { Landing } from "./Landing.jsx";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function App() {
  const [files, setFiles] = useState([]);
  const [ingestion, setIngestion] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [asking, setAsking] = useState(false);
  const [filters, setFilters] = useState({ platform: [], documentType: [] });

  async function ingestSelectedFiles(event) {
    event.preventDefault();
    if (!files.length) return;

    setUploading(true);
    setIngestion(null);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch(`${API_BASE}/api/ingest`, {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ingestion failed");
      setIngestion(data);
    } catch (error) {
      setIngestion({ error: error.message });
    } finally {
      setUploading(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    const userMessage = { role: "user", content: trimmed };
    setChat((items) => [...items, userMessage]);
    setMessage("");
    setAsking(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, filters: compactFilters(filters) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chat request failed");
      setChat((items) => [...items, { role: "assistant", content: data.answer, citations: data.citations || [] }]);
    } catch (error) {
      setChat((items) => [...items, { role: "assistant", content: error.message, citations: [] }]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <h1>Social Data RAG</h1>
          <p>Upload social exports, build a local knowledge base, and ask grounded questions.</p>
        </div>
      </section>

      <section className="workspace">
        <aside className="ingest-panel">
          <div className="panel-heading">
            <Upload size={20} />
            <h2>Import</h2>
          </div>

          <form onSubmit={ingestSelectedFiles}>
            <label className="dropzone">
              <input
                type="file"
                multiple
                accept=".csv,.json,.html"
                onChange={(event) => setFiles(Array.from(event.target.files || []))}
              />
              <FileText size={26} />
              <span>{files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Choose export files"}</span>
            </label>

            <button className="primary-button" disabled={!files.length || uploading}>
              <Upload size={18} />
              {uploading ? "Importing" : "Import files"}
            </button>
          </form>

          {ingestion && <IngestionSummary summary={ingestion} />}

          <FilterPicker filters={filters} setFilters={setFilters} />
        </aside>

        <section className="chat-panel">
          <div className="panel-heading">
            <MessageSquare size={20} />
            <h2>Chat</h2>
          </div>

          <div className="messages">
            {!chat.length && (
              <div className="empty-state">
                Ask something like “What does this person think about remote work?”
              </div>
            )}
            {chat.map((item, index) => (
              <article className={`message ${item.role}`} key={`${item.role}-${index}`}>
                <div className="bubble">{item.content}</div>
                {item.citations?.length > 0 && <CitationList citations={item.citations} />}
              </article>
            ))}
            {asking && <article className="message assistant"><div className="bubble">Thinking...</div></article>}
          </div>

          <form className="composer" onSubmit={sendMessage}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about the imported social data"
            />
            <button className="icon-button" disabled={asking || !message.trim()} aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

function IngestionSummary({ summary }) {
  if (summary.error) return <div className="summary error">{summary.error}</div>;
  const rows = [
    ["Files", summary.filesReceived],
    ["Documents", summary.documentsParsed],
    ["Chunks", summary.chunksCreated],
    ["Duplicates", summary.chunksSkippedAsDuplicates],
    ["Embedded", summary.chunksEmbedded]
  ];
  return (
    <div className="summary">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
      {summary.errors?.length > 0 && <p>{summary.errors.length} file issue(s) reported.</p>}
    </div>
  );
}

function FilterPicker({ filters, setFilters }) {
  return (
    <div className="filters">
      <h3>Filters</h3>
      <SegmentGroup
        label="Platforms"
        values={["linkedin", "twitter", "instagram"]}
        selected={filters.platform}
        onChange={(platform) => setFilters((current) => ({ ...current, platform }))}
      />
      <SegmentGroup
        label="Types"
        values={["profile", "post", "tweet", "reply", "caption", "comment", "article"]}
        selected={filters.documentType}
        onChange={(documentType) => setFilters((current) => ({ ...current, documentType }))}
      />
    </div>
  );
}

function SegmentGroup({ label, values, selected, onChange }) {
  function toggle(value) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  return (
    <fieldset>
      <legend>{label}</legend>
      <div className="segments">
        {values.map((value) => (
          <button
            type="button"
            className={selected.includes(value) ? "selected" : ""}
            key={value}
            onClick={() => toggle(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function CitationList({ citations }) {
  return (
    <div className="citations">
      {citations.map((citation) => (
        <div className="citation" key={citation.id}>
          <div>
            <strong>{citation.platform}</strong>
            <span>{citation.documentType}</span>
            {citation.createdAt && <span>{new Date(citation.createdAt).toLocaleDateString()}</span>}
          </div>
          <p>{citation.snippet}</p>
          <small>{citation.sourceFile}</small>
        </div>
      ))}
    </div>
  );
}

function compactFilters(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => Array.isArray(value) && value.length));
}

function Root() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return hash === "#app" ? <App /> : <Landing />;
}

createRoot(document.getElementById("root")).render(<Root />);
