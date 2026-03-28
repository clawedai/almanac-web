"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../../../lib/api";
import type { Prospect } from "../../../lib/types";
import BulkImportModal from "../../../components/BulkImportModal";

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
    instagram_handle: "",
    twitter_handle: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  useEffect(() => {
    const token = getToken();
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
    const token = getToken();
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
      instagram_handle: form.instagram_handle ? form.instagram_handle.replace(/^@/, "") : null,
      twitter_handle: form.twitter_handle ? form.twitter_handle.replace(/^@/, "") : null,
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

        setForm({ full_name: "", company: "", title: "", email: "", phone: "", notes: "", linkedin_url: "", company_domain: "", instagram_handle: "", twitter_handle: "" });
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

  const isTracking = (p: Prospect) =>
    p.linkedin_url || p.company_domain || (p as any).instagram_handle || (p as any).twitter_handle;
  const formHasTracking = () =>
    form.linkedin_url.trim() || form.company_domain.trim() || form.instagram_handle.trim() || form.twitter_handle.trim();

  return (
    <div>
      {/* Header */}
      <div className="topbar">
        <h1 className="page-title">Pipeline</h1>
        <button className="btn-secondary" onClick={() => setShowBulkImport(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Upload CSV
        </button>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }} className="form-grid-3">
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="form-grid-2">
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">
                    LinkedIn URL
                    {form.linkedin_url && (
                      <span style={{ marginLeft: "8px", fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600 }}>LinkedIn active</span>
                    )}
                  </label>
                  <input className="form-input" placeholder="https://linkedin.com/in/sarahchen"
                    value={form.linkedin_url} onChange={(e) => setField("linkedin_url", e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">
                    Company website
                    {form.company_domain && (
                      <span style={{ marginLeft: "8px", fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600 }}>Scanning ads</span>
                    )}
                  </label>
                  <input className="form-input" placeholder="techflow.io"
                    value={form.company_domain} onChange={(e) => setField("company_domain", e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }} className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">
                    Instagram handle
                    {form.instagram_handle && (
                      <span style={{ marginLeft: "8px", fontSize: "0.7rem", color: "#E1306C", fontWeight: 600 }}>IG active</span>
                    )}
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--ink-muted)", fontSize: "0.85rem" }}>@</span>
                    <input className="form-input" placeholder="hubspot" style={{ paddingLeft: "24px" }}
                      value={form.instagram_handle} onChange={(e) => setField("instagram_handle", e.target.value)} />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">
                    Twitter / X handle
                    {form.twitter_handle && (
                      <span style={{ marginLeft: "8px", fontSize: "0.7rem", color: "#1DA1F2", fontWeight: 600 }}>X active</span>
                    )}
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--ink-muted)", fontSize: "0.85rem" }}>@</span>
                    <input className="form-input" placeholder="hubspot" style={{ paddingLeft: "24px" }}
                      value={form.twitter_handle} onChange={(e) => setField("twitter_handle", e.target.value)} />
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--ink-muted)", marginTop: "10px" }}>
                Provide any profile URL or handle above to activate monitoring across LinkedIn, Instagram, Twitter, Meta Ads, Google Ads, and Reddit.
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
                {addLoading ? "Adding..." : formHasTracking() ? "Add & start tracking" : "Add to pipeline"}
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
                  {prospect.instagram_handle && (
                    <a href={`https://instagram.com/${prospect.instagram_handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "0.78rem", color: "#E1306C", display: "flex", alignItems: "center", gap: "3px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0h12zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                      @{prospect.instagram_handle}
                    </a>
                  )}
                  {prospect.twitter_handle && (
                    <a href={`https://twitter.com/${prospect.twitter_handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "0.78rem", color: "#1DA1F2", display: "flex", alignItems: "center", gap: "3px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      @{prospect.twitter_handle}
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

      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={async (created) => {
          if (created > 0) {
            // Refresh list
            const token = getToken();
            if (token) {
              const refresh = await fetch("/api/prospects", {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
              });
              if (refresh.ok) setProspects(await refresh.json());
            }
          }
        }}
      />
    </div>
  );
}
