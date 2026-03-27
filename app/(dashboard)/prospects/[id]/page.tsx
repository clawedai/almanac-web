"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getToken } from "../../../../lib/api";
import type { Prospect } from "../../../../lib/types";
import MetaAdSignalsCard from "../../../../components/MetaAdSignalsCard";
import GoogleAdsSignalsCard from "../../../../components/GoogleAdsSignalsCard";
import RedditSignalsCard from "../../../../components/RedditSignalsCard";
import InstagramSignalsCard from "../../../../components/InstagramSignalsCard";

function ScoreBar({ score, tier }: { score: number; tier: string }) {
  const filled = Math.round(score / 10);
  const color = tier === "hot" ? "var(--hot)" : tier === "warm" ? "var(--warm)" : "var(--cold)";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <span style={{ fontSize: "2rem", fontWeight: 700, color }}>{score}</span>
        <span style={{ color: "var(--ink-tertiary)", fontSize: "0.9rem" }}>/100</span>
        <span style={{
          background: color, color: "#fff", padding: "2px 10px", borderRadius: "20px",
          fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
        }}>
          {tier}
        </span>
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {[1,2,3,4,5,6,7,8,9,10].map((i) => (
          <div key={i} style={{
            height: "8px", flex: 1, borderRadius: "4px",
            background: i <= filled ? color : "var(--border-default)",
          }} />
        ))}
      </div>
    </div>
  );
}

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
    <span key={label} className="signal-pill" style={{ marginRight: "6px", marginBottom: "6px" }}>
      <span className="signal-value">+{value}</span>
      {labels[label] || label}
    </span>
  );
}

export default function ProspectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [scrapeSuccess, setScrapeSuccess] = useState("");
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [instagramHandle, setInstagramHandle] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    fetch(`/api/prospects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setProspect(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, router]);

  async function handleTrack() {
    if (!prospect?.linkedin_url && !prospect?.company_domain) {
      setScrapeError("Add a LinkedIn URL or company website first.");
      return;
    }
    const token = getToken();
    if (!token) return;

    setScraping(true);
    setScrapeError("");
    setScrapeSuccess("");

    try {
      const url = prospect.linkedin_url || `https://www.linkedin.com/company/${prospect.company_domain}`;
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _path: "/api/v1/linkedin/scrape", prospect_id: prospect.id, url }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScrapeSuccess(`Found ${data.posts_found} posts. Hiring: ${data.hiring_active ? "Yes" : "No"}. Score: +${data.score_delta}`);
        // Refresh prospect data
        const refresh = await fetch(`/api/prospects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (refresh.ok) setProspect(await refresh.json());
      } else {
        setScrapeError(data.error || "Scrape failed.");
      }
    } catch {
      setScrapeError("Network error.");
    } finally {
      setScraping(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <div className="loading-skeleton" style={{ height: "40px", width: "300px", marginBottom: "16px" }} />
        <div className="loading-skeleton skeleton-card" />
      </div>
    );
  }

  if (!prospect) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--ink-tertiary)" }}>
        Prospect not found.
      </div>
    );
  }

  const score = prospect.intent_score?.score ?? 0;
  const tier = prospect.intent_score?.tier ?? "cold";
  const breakdown = prospect.intent_score?.score_breakdown || {};
  const signals = prospect.signals || {};
  const posts = signals.linkedin_posts || [];
  const painPoints = signals.pain_points || [];
  const fundingSignals = signals.funding_signals || [];
  const tech = signals.technographics || [];
  const draftEmails = signals.draft_emails || [];

  const name = prospect.full_name || prospect.first_name || "Unknown";
  const hasLinkedIn = prospect.linkedin_url || prospect.company_domain;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div className="detail-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <button onClick={() => router.push("/prospects")} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--ink-tertiary)", fontSize: "0.85rem",
            display: "flex", alignItems: "center", gap: "4px", marginBottom: "12px", padding: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 7H3M5 10L2 7l3-3" />
            </svg>
            Back to pipeline
          </button>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", margin: 0, color: "var(--ink-primary)" }}>
            {name}
          </h1>
          <p style={{ color: "var(--ink-secondary)", margin: "4px 0 0", fontSize: "0.95rem" }}>
            {[prospect.title, prospect.company].filter(Boolean).join(" · ") || <em>No company</em>}
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
            {prospect.email && <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>{prospect.email}</span>}
            {prospect.phone && <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>{prospect.phone}</span>}
            {prospect.linkedin_url && (
              <a href={prospect.linkedin_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "0.8rem", color: "var(--accent)" }}>
                LinkedIn ↗
              </a>
            )}
            {instagramHandle && (
              <a href={`https://www.instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "0.8rem", color: "#E1306C" }}>
                Instagram ↗
              </a>
            )}
          </div>
          {prospect.notes && (
            <p style={{ fontSize: "0.85rem", color: "var(--ink-tertiary)", fontStyle: "italic", marginTop: "8px" }}>
              {prospect.notes}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {hasLinkedIn && (
            <button className="btn-primary" onClick={handleTrack} disabled={scraping} style={{ whiteSpace: "nowrap" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="7" cy="7" r="5" />
                <path d="M7 4v3l2 1" />
              </svg>
              {scraping ? "Scraping..." : "Track now"}
            </button>
          )}
          {!hasLinkedIn && (
            <a href={`/prospects/${id}`} className="btn-secondary" style={{ pointerEvents: "none", opacity: 0.5 }}>
              Add LinkedIn URL to track
            </a>
          )}
        </div>
      </div>

      {/* Feedback messages */}
      {scrapeError && (
        <div style={{ background: "rgba(200,75,49,0.1)", border: "1px solid var(--danger)", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", color: "var(--danger)", fontSize: "0.85rem" }}>
          {scrapeError}
        </div>
      )}
      {scrapeSuccess && (
        <div style={{ background: "rgba(217,164,70,0.1)", border: "1px solid var(--accent)", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", color: "var(--ink-primary)", fontSize: "0.85rem" }}>
          ✅ {scrapeSuccess}
        </div>
      )}

      {/* Score card */}
      <div className="prospect-card" style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-tertiary)", marginBottom: "16px" }}>
          Intent Score
        </h2>
        <ScoreBar score={score} tier={tier} />
        {Object.entries(breakdown).filter(([, v]) => (v as number) > 0).length > 0 && (
          <div className="signal-pills" style={{ marginTop: "16px" }}>
            {Object.entries(breakdown).filter(([, v]) => (v as number) > 0).map(([k, v]) => getPill(k, v as number))}
          </div>
        )}
        <div style={{ marginTop: "12px", fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>
          Last updated: {prospect.last_enriched_at ? new Date(prospect.last_enriched_at).toLocaleDateString() : "Never"}
        </div>
      </div>

      {/* Signal sections */}
      <div className="signal-sections-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {/* Funding / Hiring */}
        <div className="prospect-card">
          <h2 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-tertiary)", marginBottom: "12px" }}>
            💰 Funding & Hiring
          </h2>
          {fundingSignals.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--ink-tertiary)", margin: 0 }}>No signals yet. Track this prospect to detect funding and hiring activity.</p>
          ) : (
            fundingSignals.map((s: any, i: number) => (
              <div key={i} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: i < fundingSignals.length - 1 ? "1px solid var(--border-default)" : "none" }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.funding_stage === "hiring" ? "👥 Hiring" : "💰 Funding"}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-secondary)", marginTop: "2px" }}>{s.funding_amount || s.funding_stage}</div>
              </div>
            ))
          )}
        </div>

        {/* Tech stack */}
        <div className="prospect-card">
          <h2 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-tertiary)", marginBottom: "12px" }}>
            ⚙️ Tech Stack
          </h2>
          {tech.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--ink-tertiary)", margin: 0 }}>No tech data yet. Add a company domain to detect their stack.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {tech.map((t: any, i: number) => (
                <span key={i} style={{
                  background: "var(--surface-inset)", padding: "4px 10px", borderRadius: "6px",
                  fontSize: "0.8rem", color: "var(--ink-secondary)",
                }}>
                  {t.tool_name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LinkedIn Posts */}
      <div className="prospect-card" style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-tertiary)", marginBottom: "12px" }}>
          📝 LinkedIn Posts
        </h2>
        {posts.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "var(--ink-tertiary)", margin: 0 }}>
            No posts scraped yet. Click "Track now" to pull recent LinkedIn posts and detect sentiment.
          </p>
        ) : (
          posts.map((p: any, i: number) => (
            <div key={i} style={{
              padding: "12px 0", borderBottom: i < posts.length - 1 ? "1px solid var(--border-default)" : "none",
            }}>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-primary)", margin: "0 0 6px", lineHeight: 1.5 }}>
                {p.post_text?.slice(0, 300)}{p.post_text?.length > 300 ? "..." : ""}
              </p>
              <div style={{ display: "flex", gap: "12px", fontSize: "0.78rem", color: "var(--ink-tertiary)" }}>
                <span>❤️ {p.engagement_likes || 0}</span>
                <span>💬 {p.engagement_comments || 0}</span>
                {p.posted_at && <span>{new Date(p.posted_at).toLocaleDateString()}</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pain points */}
      {painPoints.length > 0 && (
        <div className="prospect-card" style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-tertiary)", marginBottom: "12px" }}>
            😤 Pain Points Detected
          </h2>
          {painPoints.map((pp: any, i: number) => (
            <div key={i} style={{
              padding: "10px 0", borderBottom: i < painPoints.length - 1 ? "1px solid var(--border-default)" : "none",
            }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                <span style={{
                  fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
                  color: pp.sentiment === "frustrated" ? "var(--hot)" : "var(--warm)",
                }}>
                  {pp.pain_category || "Pain"}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--ink-tertiary)" }}>
                  {pp.sentiment}
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-secondary)", margin: 0 }}>
                {pp.pain_description || "No description."}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Meta / Facebook Ads */}
      <MetaAdSignalsCard
        companyDomain={prospect.company_domain}
        companyName={prospect.company || ""}
      />

      {/* Google Ads */}
      <GoogleAdsSignalsCard
        companyDomain={prospect.company_domain}
        companyName={prospect.company || ""}
      />

      {/* Reddit Signals */}
      <RedditSignalsCard
        companyDomain={prospect.company_domain}
        companyName={prospect.company || ""}
      />

      {/* Instagram Organic */}
      <div className="prospect-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <defs>
              <linearGradient id="ig-g" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#833AB4" />
                <stop offset="50%" stopColor="#E1306C" />
                <stop offset="100%" stopColor="#F77737" />
              </linearGradient>
            </defs>
            <rect x="1" y="1" width="14" height="14" rx="4" stroke="url(#ig-g)" strokeWidth="1.5" fill="none" />
            <circle cx="8" cy="8" r="3" stroke="url(#ig-g)" strokeWidth="1.5" fill="none" />
            <circle cx="11.5" cy="4.5" r="0.75" fill="url(#ig-g)" />
          </svg>
          <h2 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A837C", margin: 0 }}>
            Instagram Organic
          </h2>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="@handle (e.g. salesforce, hubspot)"
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value.replace("@", ""))}
            style={{
              flex: 1,
              padding: "6px 12px",
              border: "1px solid rgba(90,76,60,0.2)",
              borderRadius: "8px",
              fontSize: "0.82rem",
              background: "#FAF8F5",
              color: "#1A1714",
              outline: "none",
            }}
          />
        </div>
        {!instagramHandle && (
          <p style={{ fontSize: "0.82rem", color: "#B5AEA4", margin: "4px 0 0" }}>
            Enter an Instagram handle to scan their profile for organic social signals.
          </p>
        )}
      </div>
      {instagramHandle && (
        <InstagramSignalsCard
          instagramHandle={instagramHandle}
          prospectId={prospect.id}
          companyName={prospect.company || ""}
        />
      )}

      {/* Actions */}
      <div className="prospect-card">
        <h2 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-tertiary)", marginBottom: "12px" }}>
          Actions
        </h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {hasLinkedIn && (
            <button className="btn-primary" onClick={handleTrack} disabled={scraping}>
              {scraping ? "Scraping..." : "🔄 Refresh signals"}
            </button>
          )}
          <a href={`/prospects`} className="btn-secondary">
            ← Back to pipeline
          </a>
        </div>
      </div>
    </div>
  );
}
