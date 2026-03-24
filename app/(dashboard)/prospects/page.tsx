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
  full_name: string;
  first_name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  linkedin_url: string;
  company_domain: string;
  prospect_type: string;
  notes: string;
  intent_score: IntentScore | null;
  created_at: string;
}

type TabFilter = "all" | "hot" | "warm" | "cold";

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

export default function ProspectsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<TabFilter>("all");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  // Form state — minimal to add
  const [form, setForm] = useState({
    full_name: "",
    company: "",
    title: "",
    email: "",
    phone: "",
    notes: "",
    linkedin_url: "",
    company_domain: "",
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
      .then((data) => setProspects(Array.isArray(data) ? data : []))
      .catch(() => setProspects([]))
      .finally(() => setLoading(false));
  }, [router]);

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) return;

    setAddLoading(true);
    setAddError("");
    setAddSuccess("");

    const names = form.full_name.trim().split(" ");
    const hasTracking = form.linkedin_url.trim() || form.company_domain.trim();

    const payload = {
      full_name: form.full_name,
      first_name: names[0] || form.full_name,
      last_name: names.length > 1 ? names.slice(1).join(" ") : "",
      company: form.company,
      title: form.title,
      email: form.email || null,
      phone: form.phone || null,
      linkedin_url: form.linkedin_url || null,
      company_domain: form.company_domain || null,
      notes: form.notes || null,
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
        // Refresh list
        const refresh = await fetch("/api/prospects", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (refresh.ok) setProspects(await refresh.json());

        setForm({ full_name: "", company: "", title: "", email: "", phone: "", notes: "", linkedin_url: "", company_domain: "" });
        setShowAdd(false);
        setAddSuccess("Added to pipeline!");
        setTimeout(() => setAddSuccess(""), 3000);
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
  for (const t of ["hot", "warm", "cold"] as TabFilter[]) {
    counts[t] = prospects.filter((p) => p.intent_score?.tier === t).length;
  }

  const isTracking = (p: Prospect) => p.linkedin_url || p.company_domain;

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

      {/* Add form — minimal, split into Basic + Track */}
      {showAdd && (
        <div style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "28px",
          marginBottom: "24px",
          boxShadow: "var(--shadow-card)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", margin: 0, color: "var(--ink-primary)" }}>
              Add to pipeline
            </h3>
            {addSuccess && (
              <span style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600 }}>{addSuccess}</span>
            )}
          </div>

          <form onSubmit={handleAdd}>
            {/* --- BASIC INFO --- */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ink-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                Who is this?
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div className="form-field" style={{ gridColumn: "1" }}>
                  <label className="form-label">Full name *</label>
                  <input className="form-input" placeholder="Sarah Chen"
                    value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Company</label>
                  <input className="form-input" placeholder="TechFlow Inc"
                    value={form.company} onChange={(e) => setField("company", e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">Job title</label>
                  <input className="form-input" placeholder="VP of Sales"
                    value={form.title} onChange={(e) => setField("title", e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="sarah@techflow.io"
                    value={form.email} onChange={(e) => setField("email", e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+1 415 555 0100"
                    value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
                </div>
              </div>
            </div>

            {/* --- TRACKING --- */}
            <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ink-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                  Track signals
                </p>
                <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)", background: "var(--surface-inset)", padding: "2px 8px", borderRadius: "20px" }}>
                  Optional — provides URL to activate monitoring
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-field">
                  <label className="form-label">
                    LinkedIn URL
                    {form.linkedin_url && (
                      <span style={{ marginLeft: "8px", fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600 }}>Tracking active</span>
                    )}
                  </label>
                  <input className="form-input" placeholder="https://linkedin.com/in/sarahchen"
                    value={form.linkedin_url} onChange={(e) => setField("linkedin_url", e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">
                    Company website
                    {form.company_domain && (
                      <span style={{ marginLeft: "8px", fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600 }}>Tracking active</span>
                    )}
                  </label>
                  <input className="form-input" placeholder="techflow.io"
                    value={form.company_domain} onChange={(e) => setField("company_domain", e.target.value)} />
                </div>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--ink-muted)", marginTop: "8px" }}>
                When you provide a LinkedIn or company URL, we'll monitor for funding news, hiring activity, reviews, and social signals. Your pipeline will update automatically.
              </p>
            </div>

            {/* --- NOTES --- */}
            <div style={{ marginBottom: "20px" }}>
              <div className="form-field">
                <label className="form-label">Notes</label>
                <textarea className="form-input" placeholder="Met at SaaStr, interested in Q4 expansion..."
                  value={form.notes} rows={2} style={{ resize: "vertical", fontFamily: "inherit" }}
                  onChange={(e) => setField("notes", e.target.value)} />
              </div>
            </div>

            {addError && (
              <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginBottom: "12px" }}>{addError}</p>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-primary" disabled={addLoading}>
                {addLoading ? "Adding..." : hasTracking(form as any) ? "Add & start tracking" : "Add to pipeline"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
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
            {filter === "all" ? "Your pipeline is empty" : `No ${filter} prospects`}
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
          const score = prospect.intent_score?.score ?? 0;
          const tier = prospect.intent_score?.tier ?? "cold";
          const tracking = isTracking(prospect);

          return (
            <div key={prospect.id} className="prospect-card">
              <div className="prospect-card-top">
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <div className="prospect-name">{name}</div>
                    {tracking && (
                      <span style={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color: "var(--accent)",
                        background: "rgba(217,164,70,0.12)",
                        padding: "2px 7px",
                        borderRadius: "20px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}>
                        <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>
                        Tracking
                      </span>
                    )}
                    {!tracking && (
                      <span style={{
                        fontSize: "0.65rem",
                        color: "var(--ink-muted)",
                        background: "rgba(0,0,0,0.05)",
                        padding: "2px 7px",
                        borderRadius: "20px",
                      }}>
                        Not tracked
                      </span>
                    )}
                  </div>
                  <div className="prospect-company">
                    {prospect.title && <span>{prospect.title} · </span>}
                    {prospect.company || <em style={{ color: "var(--ink-muted)" }}>No company</em>}
                    {prospect.email && (
                      <span style={{ color: "var(--ink-muted)", fontSize: "0.8rem" }}> · {prospect.email}</span>
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
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--ink-tertiary)" }}>
                    Added {new Date(prospect.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  {prospect.linkedin_url && (
                    <a href={prospect.linkedin_url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "0.78rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: "3px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn
                    </a>
                  )}
                  {prospect.phone && (
                    <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)" }}>{prospect.phone}</span>
                  )}
                </div>
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
