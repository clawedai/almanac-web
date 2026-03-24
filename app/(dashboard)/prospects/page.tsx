"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Prospect {
  id: string;
  first_name: string;
  full_name: string;
  company: string;
  title: string;
  intent_score: {
    score: number;
    tier: string;
    score_breakdown: Record<string, number>;
  };
  created_at: string;
}

type Tier = "hot" | "warm" | "cold";

function getPill(label: string, value: number) {
  if (!value) return null;
  const labels: Record<string, string> = {
    funding: "Funding",
    hiring: "Hiring",
    review: "Issues",
    linkedin: "Social",
    technographic: "Tech gap",
    website_visit: "Visit",
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
  const [tier, setTier] = useState<Tier>("hot");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    async function fetchProspects() {
      const token = document.cookie.match(/token=([^;]+)/)?.[1];
      if (!token) { router.push("/login"); return; }

      setLoading(true);
      try {
        const res = await fetch(`/api/prospects/hot?tier=${tier}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setProspects(Array.isArray(data) ? data : []);
        } else {
          setProspects([]);
        }
      } catch {
        setProspects([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProspects();
  }, [tier, router]);

  async function handleAddProspect(e: React.FormEvent) {
    e.preventDefault();
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) return;

    setAddLoading(true);
    setAddError("");

    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: newName.split(" ")[0] || newName,
          full_name: newName,
          company: newCompany,
          email: newEmail,
          source: "manual",
        }),
      });

      if (res.ok) {
        setNewName("");
        setNewCompany("");
        setNewEmail("");
        setShowAdd(false);
        // Refresh list
        const refresh = await fetch(`/api/prospects/hot?tier=${tier}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (refresh.ok) {
          const data = await refresh.json();
          setProspects(Array.isArray(data) ? data : []);
        }
      } else {
        const err = await res.json();
        setAddError(err.error || "Failed to add prospect");
      }
    } catch {
      setAddError("Server error");
    } finally {
      setAddLoading(false);
    }
  }

  const tabs: Array<{ tier: Tier; label: string; color: string }> = [
    { tier: "hot", label: "Hot", color: "var(--hot)" },
    { tier: "warm", label: "Warm", color: "var(--warm)" },
    { tier: "cold", label: "Cold", color: "var(--cold)" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="topbar">
        <h1 className="page-title">Your Pipeline</h1>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 1v12M1 7h12" />
          </svg>
          Add prospect
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
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", marginBottom: "16px", color: "var(--ink-primary)" }}>
            Add a prospect
          </h3>
          <form onSubmit={handleAddProspect} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="form-field" style={{ flex: "1 1 200px" }}>
              <label className="form-label">Name</label>
              <input
                className="form-input"
                style={{ width: "100%" }}
                placeholder="Sarah Chen"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="form-field" style={{ flex: "1 1 200px" }}>
              <label className="form-label">Company</label>
              <input
                className="form-input"
                style={{ width: "100%" }}
                placeholder="TechFlow Inc"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
              />
            </div>
            <div className="form-field" style={{ flex: "1 1 200px" }}>
              <label className="form-label">Email (optional)</label>
              <input
                className="form-input"
                style={{ width: "100%" }}
                type="email"
                placeholder="sarah@techflow.io"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            {addError && (
              <p style={{ color: "var(--danger)", fontSize: "0.8rem", width: "100%", margin: 0 }}>
                {addError}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={addLoading}>
              {addLoading ? "Adding..." : "Add prospect"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Tier tabs */}
      <div className="tier-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.tier}
            className={`tier-tab${tier === tab.tier ? " active" : ""}`}
            onClick={() => setTier(tab.tier)}
          >
            <span style={{ color: tier === tab.tier ? tab.color : "inherit", fontWeight: 600 }}>
              {tab.label}
            </span>
            <span className="tier-tab-count">
              {tab.tier === "hot" ? prospects.filter(p => p.intent_score?.tier === "hot").length : 0}
            </span>
          </button>
        ))}
      </div>

      {/* Prospect list */}
      {loading ? (
        <>
          {[1, 2, 3].map((i) => (
            <div key={i} className="loading-skeleton skeleton-card" />
          ))}
        </>
      ) : prospects.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="8" y="8" width="32" height="32" rx="4" />
            <path d="M16 20h16M16 26h10" />
          </svg>
          <div className="empty-state-title">No {tier} prospects yet</div>
          <div className="empty-state-desc">
            {tier === "hot"
              ? "Add more prospects and we'll surface your hottest leads."
              : `Add prospects and they'll appear here as they ${tier === "warm" ? "warm up" : "get scored"}.`}
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            Add your first prospect
          </button>
        </div>
      ) : (
        prospects.map((prospect) => {
          const name = prospect.first_name || prospect.full_name || "Unknown";
          const breakdown = prospect.intent_score?.score_breakdown || {};

          return (
            <a
              key={prospect.id}
              href={`/prospects/${prospect.id}`}
              className="prospect-card"
            >
              <div className="prospect-card-top">
                <div>
                  <div className="prospect-name">{name}</div>
                  <div className="prospect-company">
                    {prospect.title && <span>{prospect.title} · </span>}
                    {prospect.company}
                  </div>
                </div>
                <div className="prospect-score">
                  <span className="prospect-score-num" style={{ color: prospect.intent_score?.tier === "hot" ? "var(--hot)" : prospect.intent_score?.tier === "warm" ? "var(--warm)" : "var(--cold)" }}>
                    {prospect.intent_score?.score || 0}
                  </span>
                  <span className="prospect-score-label">/100</span>
                </div>
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
                  Added{" "}
                  {new Date(prospect.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span style={{ color: "var(--accent)", fontSize: "0.8rem", fontWeight: 600 }}>
                  View →
                </span>
              </div>
            </a>
          );
        })
      )}
    </div>
  );
}
