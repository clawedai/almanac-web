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
  score_description: string;
  pain_points: Array<{ pain_description: string; sentiment: string }>;
  draft_email?: { first_line: string; subject_line: string };
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTierLabel(tier: string): string {
  if (tier === "hot") return "Hot";
  if (tier === "warm") return "Warm";
  return "Cold";
}

function getSignalPills(breakdown: Record<string, number>) {
  const pills: Array<{ label: string; value: number }> = [];
  if (breakdown.funding) pills.push({ label: "Funding", value: breakdown.funding });
  if (breakdown.hiring) pills.push({ label: "Hiring", value: breakdown.hiring });
  if (breakdown.review) pills.push({ label: "Competitor issues", value: breakdown.review });
  if (breakdown.linkedin) pills.push({ label: "Social signals", value: breakdown.linkedin });
  if (breakdown.technographic) pills.push({ label: "Tech gap", value: breakdown.technographic });
  if (breakdown.website_visit) pills.push({ label: "Website visit", value: breakdown.website_visit });
  return pills;
}

export default function BriefPage() {
  const router = useRouter();
  const [hot, setHot] = useState<Prospect[]>([]);
  const [warm, setWarm] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const token = document.cookie.match(/token=([^;]+)/)?.[1];
      if (!token) { router.push("/login"); return; }

      try {
        const [hotRes, warmRes] = await Promise.all([
          fetch("/api/prospects/hot?tier=hot", {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }),
          fetch("/api/prospects/hot?tier=warm", {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }),
        ]);

        const [hotData, warmData] = await Promise.all([hotRes.json(), warmRes.json()]);
        setHot(Array.isArray(hotData) ? hotData : []);
        setWarm(Array.isArray(warmData) ? warmData : []);
      } catch {
        setHot([]);
        setWarm([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const greeting = getGreeting();
  const hotCount = hot.length;
  const warmCount = warm.length;
  const hasProspects = hotCount > 0 || warmCount > 0;

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="loading-skeleton" style={{ height: "40px", width: "300px", borderRadius: "8px", marginBottom: "8px" }} />
          <div className="loading-skeleton" style={{ height: "20px", width: "200px", borderRadius: "6px" }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="loading-skeleton skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-greeting">
          {greeting}.
        </h1>
        {hasProspects ? (
          <p className="page-subtitle">
            {hotCount > 0 && `${hotCount} hot prospect${hotCount !== 1 ? "s" : ""}`}
            {hotCount > 0 && warmCount > 0 && " and "}
            {warmCount > 0 && `${warmCount} to follow up`}
            {" ready for you."}
          </p>
        ) : (
          <p className="page-subtitle">
            Add your first prospects to see your morning brief.
          </p>
        )}
      </div>

      {/* Stats row */}
      {hasProspects && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-card-label">Hot Prospects</div>
            <div className="stat-card-value" style={{ color: "var(--hot)" }}>
              {hotCount}
            </div>
            <div className="stat-card-sub">Call this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Warm Leads</div>
            <div className="stat-card-value" style={{ color: "var(--warm)" }}>
              {warmCount}
            </div>
            <div className="stat-card-sub">Keep warm</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Pipeline Status</div>
            <div className="stat-card-value">
              {hotCount > 0 ? "Active" : "Building"}
            </div>
            <div className="stat-card-sub">
              {hasProspects ? "Intelligence flowing" : "Add prospects to start"}
            </div>
          </div>
        </div>
      )}

      {/* Hot prospects */}
      {hot.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2 className="page-title" style={{ fontSize: "1.25rem", color: "var(--hot)" }}>
            Call today
          </h2>

          {hot.map((prospect) => {
            const name = prospect.first_name || prospect.full_name || "Unknown";
            const breakdown = prospect.intent_score?.score_breakdown || {};
            const pills = getSignalPills(breakdown);
            const description = prospect.score_description || "";

            return (
              <div key={prospect.id} className="prospect-card hot-card">
                {/* Top row */}
                <div className="prospect-card-top">
                  <div>
                    <div className="prospect-name">{name}</div>
                    <div className="prospect-company">
                      {prospect.title && <span>{prospect.title} · </span>}
                      {prospect.company}
                    </div>
                  </div>
                  <div className="prospect-score">
                    <span className="prospect-score-num" style={{ color: "var(--hot)" }}>
                      {prospect.intent_score?.score || 0}
                    </span>
                    <span className="proscent-score-label">/100</span>
                  </div>
                </div>

                {/* Insight */}
                {description && (
                  <div className="hot-insight">
                    {description.replace(/Signals: /, "")}
                  </div>
                )}

                {/* Signal pills */}
                {pills.length > 0 && (
                  <div className="signal-pills">
                    {pills.map((pill) => (
                      <span key={pill.label} className="signal-pill">
                        <span className="signal-value">+{pill.value}</span>
                        {pill.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="prospect-meta" style={{ marginTop: "16px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>
                    Added today
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <a
                      href={`/prospects/${prospect.id}`}
                      className="btn-primary"
                      style={{ fontSize: "0.8rem", padding: "6px 14px" }}
                    >
                      View profile
                    </a>
                    {prospect.draft_email?.first_line && (
                      <button className="btn-accent" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
                        Use draft email
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Warm prospects */}
      {warm.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h2 className="page-title" style={{ fontSize: "1.25rem", color: "var(--warm)" }}>
            Warm leads
          </h2>

          {warm.map((prospect) => {
            const name = prospect.first_name || prospect.full_name || "Unknown";
            const breakdown = prospect.intent_score?.score_breakdown || {};
            const pills = getSignalPills(breakdown);

            return (
              <div key={prospect.id} className="prospect-card">
                <div className="prospect-card-top">
                  <div>
                    <div className="prospect-name">{name}</div>
                    <div className="prospect-company">
                      {prospect.title && <span>{prospect.title} · </span>}
                      {prospect.company}
                    </div>
                  </div>
                  <div className="prospect-score">
                    <span className="prospect-score-num" style={{ color: "var(--warm)" }}>
                      {prospect.intent_score?.score || 0}
                    </span>
                    <span className="prospect-score-label">/100</span>
                  </div>
                </div>

                {pills.length > 0 && (
                  <div className="signal-pills">
                    {pills.map((pill) => (
                      <span key={pill.label} className="signal-pill">
                        <span className="signal-value">+{pill.value}</span>
                        {pill.label}
                      </span>
                    ))}
                  </div>
                )}

                <div className="prospect-meta">
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>
                    Warming up
                  </span>
                  <a href={`/prospects/${prospect.id}`} className="btn-secondary" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
                    View
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!hasProspects && !loading && (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="24" cy="24" r="20" />
            <path d="M24 14v10l6 4" />
          </svg>
          <div className="empty-state-title">Your pipeline is empty</div>
          <div className="empty-state-desc">
            Add your first prospects and we&apos;ll surface who you should call first.
          </div>
          <a href="/prospects" className="btn-primary">
            Add prospects
          </a>
        </div>
      )}

      {/* Weekly note */}
      {hasProspects && (
        <div style={{
          marginTop: "48px",
          padding: "20px 24px",
          background: "var(--surface-inset)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--ink-tertiary)" strokeWidth="1.5">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v4l3 2" />
          </svg>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-secondary)", lineHeight: "1.5" }}>
            Almanac refreshes signals every 24 hours. New signals from LinkedIn, G2, and funding databases are processed automatically.
          </p>
        </div>
      )}
    </div>
  );
}
