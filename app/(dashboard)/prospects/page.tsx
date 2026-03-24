"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface IntentScore {
  score: number;
  tier: string;
  score_breakdown: Record<string, number>;
}

interface Prospect {
  id: string;
  first_name: string;
  full_name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  linkedin_url: string;
  prospect_type: string;
  notes: string;
  intent_score: IntentScore | null;
  created_at: string;
}

type Tier = "hot" | "warm" | "cold";
type TabFilter = Tier | "all";

function getPill(label: string, value: number) {
  if (!value) return null;
  const labels: Record<string, string> = {
    funding: "Funding",
    hiring: "Hiring",
    review: "Competitor issues",
    linkedin_frustrated: "Frustrated",
    linkedin_pain: "Pain point",
    technographic: "Tech gap",
    website_visit: "Website visit",
  };
  return (
    <span key={label} className="signal-pill">
      <span className="signal-value">+{value}</span>
      {labels[label] || label}
    </span>
  );
}

function getTypeLabel(type: string) {
  if (type === "client") return { label: "Client", color: "var(--accent)", bg: "rgba(217,164,70,0.12)" };
  if (type === "competitor") return { label: "Competitor", color: "var(--ink-tertiary)", bg: "rgba(0,0,0,0.06)" };
  return { label: "Prospect", color: "var(--ink-secondary)", bg: "transparent" };
}

export default function ProspectsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<TabFilter>("all");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addError, setAddError] = useState("");

  // Form state
  const [form, setForm] = useState({
    full_name: "",
    company: "",
    title: "",
    email: "",
    phone: "",
    linkedin_url: "",
    prospect_type: "prospect",
    notes: "",
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    fetch("/api/prospects", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        setProspects(Array.isArray(data) ? data : []);
      })
      .catch(() => setProspects([]))
      .finally(() => setLoading(false));
  }, [router]);

  function updateField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) return;

    setAddLoading(true);
    setAddError("");

    const names = form.full_name.trim().split(" ");
    const payload = {
      full_name: form.full_name,
      first_name: names[0] || form.full_name,
      last_name: names.length > 1 ? names.slice(1).join(" ") : "",
      company: form.company,
      title: form.title,
      email: form.email,
      phone: form.phone,
      linkedin_url: form.linkedin_url,
      prospect_type: form.prospect_type,
      notes: form.notes,
      source: "manual",
    };

    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        // Fetch fresh list
        const refresh = await fetch("/api/prospects", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (refresh.ok) {
          setProspects(await refresh.json());
        }
        setForm({ full_name: "", company: "", title: "", email: "", phone: "", linkedin_url: "", prospect_type: "prospect", notes: "" });
        setShowAdd(false);
      } else {
        const err = await res.json().catch(() => ({}));
        setAddError(err.error || "Failed to add. Try again.");
      }
    } catch {
      setAddError("Network error. Is the backend running?");
    } finally {
      setAddLoading(false);
    }
  }

  const tabs: Array<{ key: TabFilter; label: string; color: string }> = [
    { key: "all", label: "All", color: "var(--ink-secondary)" },
    { key: "hot", label: "Hot", color: "var(--hot)" },
    { key: "warm", label: "Warm", color: "var(--warm)" },
    { key: "cold", label: "Cold", color: "var(--cold)" },
  ];

  const filtered = filter === "all"
    ? prospects
    : prospects.filter((p) => p.intent_score?.tier === filter);

  const counts: Record<string, number> = { all: prospects.length };
  for (const t of ["hot", "warm", "cold"] as Tier[]) {
    counts[t] = prospects.filter((p) => p.intent_score?.tier === t).length;
  }

  return (
    <div>
      {/* Header */}
      <div className="topbar">
        <h1 className="page-title">Pipeline</h1>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 1v12M1 7h12" />
          </svg>
          {showAdd ? "Cancel" : "Add person"}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "var(--shadow-card)",
        }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", marginBottom: "16px", color: "var(--ink-primary)" }}>
            Add to pipeline
          </h3>
          <form onSubmit={handleAdd}>
            {/* Row 1: Name + Company + Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", gap: "12px", marginBottom: "12px" }}>
              <div className="form-field">
                <label className="form-label">Full name *</label>
                <input className="form-input" placeholder="Sarah Chen" value={form.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)} required />
              </div>
              <div className="form-field">
                <label className="form-label">Company</label>
                <input className="form-input" placeholder="TechFlow Inc" value={form.company}
                  onChange={(e) => updateField("company", e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Type</label>
                <select className="form-input" value={form.prospect_type}
                  onChange={(e) => updateField("prospect_type", e.target.value)}
                  style={{ cursor: "pointer" }}>
                  <option value="prospect">Prospect</option>
                  <option value="client">Client</option>
                  <option value="competitor">Competitor</option>
                </select>
              </div>
            </div>

            {/* Row 2: Title + Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div className="form-field">
                <label className="form-label">Job title</label>
                <input className="form-input" placeholder="VP of Sales" value={form.title}
                  onChange={(e) => updateField("title", e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="sarah@techflow.io" value={form.email}
                  onChange={(e) => updateField("email", e.target.value)} />
              </div>
            </div>

            {/* Row 3: Phone + LinkedIn */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div className="form-field">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+1 415 555 0100" value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label">LinkedIn URL</label>
                <input className="form-input" placeholder="https://linkedin.com/in/sarahchen" value={form.linkedin_url}
                  onChange={(e) => updateField("linkedin_url", e.target.value)} />
              </div>
            </div>

            {/* Row 4: Notes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginBottom: "16px" }}>
              <div className="form-field">
                <label className="form-label">Notes</label>
                <textarea className="form-input" placeholder="Met at SaaStr, interested in Q4 expansion..."
                  value={form.notes} rows={2}
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                  onChange={(e) => updateField("notes", e.target.value)} />
              </div>
            </div>

            {addError && (
              <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginBottom: "12px" }}>{addError}</p>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-primary" disabled={addLoading}>
                {addLoading ? "Adding..." : "Add to pipeline"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="tier-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tier-tab${filter === tab.key ? " active" : ""}`}
            onClick={() => setFilter(tab.key)}
          >
            <span style={{ color: filter === tab.key ? tab.color : "inherit", fontWeight: 600 }}>
              {tab.label}
            </span>
            {counts[tab.key] > 0 && (
              <span className="tier-tab-count">{counts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <>{[1, 2, 3].map((i) => <div key={i} className="loading-skeleton skeleton-card" />)}</>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="8" y="8" width="32" height="32" rx="4" />
            <path d="M16 20h16M16 26h10" />
          </svg>
          <div className="empty-state-title">
            {filter === "all" ? "No people in pipeline yet" : `No ${filter} prospects`}
          </div>
          <div className="empty-state-desc">
            {filter === "all"
              ? "Add your first prospect to start building your pipeline."
              : `Add more prospects and they'll surface here as they ${filter === "warm" ? "warm up" : "heat up"}.`}
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            Add your first person
          </button>
        </div>
      ) : (
        filtered.map((prospect) => {
          const name = prospect.full_name || prospect.first_name || "Unknown";
          const breakdown = prospect.intent_score?.score_breakdown || {};
          const typeInfo = getTypeLabel(prospect.prospect_type);
          const score = prospect.intent_score?.score ?? 0;
          const tier = prospect.intent_score?.tier ?? "cold";

          return (
            <div key={prospect.id} className="prospect-card">
              <div className="prospect-card-top">
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <div className="prospect-name">{name}</div>
                    {prospect.prospect_type !== "prospect" && (
                      <span style={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color: typeInfo.color,
                        background: typeInfo.bg,
                        padding: "2px 7px",
                        borderRadius: "20px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}>
                        {typeInfo.label}
                      </span>
                    )}
                  </div>
                  <div className="prospect-company">
                    {prospect.title && <span>{prospect.title} · </span>}
                    {prospect.company || <em style={{ color: "var(--ink-muted)" }}>No company</em>}
                    {prospect.email && (
                      <span style={{ color: "var(--ink-muted)", fontSize: "0.8rem" }}>
                        {" "}· {prospect.email}
                      </span>
                    )}
                  </div>
                  {prospect.notes && (
                    <div style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)", marginTop: "4px", fontStyle: "italic" }}>
                      {prospect.notes}
                    </div>
                  )}
                </div>
                {score > 0 && (
                  <div className="prospect-score">
                    <span className="prospect-score-num" style={{
                      color: tier === "hot" ? "var(--hot)" : tier === "warm" ? "var(--warm)" : "var(--cold)"
                    }}>{score}</span>
                    <span className="prospect-score-label">/100</span>
                  </div>
                )}
              </div>

              {Object.entries(breakdown).filter(([, v]) => v > 0).length > 0 && (
                <div className="signal-pills">
                  {Object.entries(breakdown)
                    .filter(([, v]) => v > 0)
                    .map(([label, value]) => getPill(label, value as number))}
                </div>
              )}

              <div className="prospect-meta">
                <span>
                  Added {new Date(prospect.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {prospect.phone && <span style={{ color: "var(--ink-muted)" }}> · {prospect.phone}</span>}
                </span>
                <a href={`/prospects/${prospect.id}`} style={{ color: "var(--accent)", fontSize: "0.8rem", fontWeight: 600 }}>
                  View →
                </a>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
