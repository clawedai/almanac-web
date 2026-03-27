"use client";

import { useEffect, useState } from "react";
import type { InstagramSignals } from "../lib/types";
import { getInstagramSignals, refreshInstagramSignals } from "../lib/api";

interface Props {
  instagramHandle?: string;
  prospectId?: string;
  companyName: string;
}

const STALE_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours

function isStale(signals: InstagramSignals): boolean {
  if (!signals.fetched_at) return false;
  return Date.now() - new Date(signals.fetched_at).getTime() > STALE_THRESHOLD_MS;
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <defs>
        <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#833AB4" />
          <stop offset="50%" stopColor="#E1306C" />
          <stop offset="100%" stopColor="#F77737" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="4"
        stroke="url(#ig-gradient)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="8" cy="8" r="3" stroke="url(#ig-gradient)" strokeWidth="1.5" fill="none" />
      <circle cx="11.5" cy="4.5" r="0.75" fill="url(#ig-gradient)" />
    </svg>
  );
}

function ScoreBar({ value, max = 25, label = "" }: { value: number; max?: number; label?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          flex: 1,
          height: "6px",
          background: "#F0EDE8",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg, #833AB4, #E1306C, #F77737)",
            borderRadius: "3px",
            transition: "width 400ms ease",
          }}
        />
      </div>
      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5C5650", minWidth: "20px" }}>
        {value}
      </span>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function InstagramSignalsCard({ instagramHandle, prospectId, companyName }: Props) {
  const [signals, setSignals] = useState<InstagramSignals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");

  useEffect(() => {
    if (!instagramHandle) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getInstagramSignals(instagramHandle)
      .then((data) => { setSignals(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [instagramHandle]);

  async function handleRefresh() {
    if (!instagramHandle || !prospectId) return;
    setRefreshing(true);
    setRefreshMsg("");
    try {
      const updated = await refreshInstagramSignals(prospectId, instagramHandle);
      setSignals(updated);
      setRefreshMsg("Instagram data refreshed.");
    } catch {
      setRefreshMsg("Refresh failed. Try again.");
    } finally {
      setRefreshing(false);
    }
  }

  if (!instagramHandle) return null;

  if (loading) {
    return (
      <div className="prospect-card" style={{ marginBottom: "20px" }}>
        <div
          className="loading-skeleton"
          style={{ height: "16px", width: "160px", marginBottom: "16px", borderRadius: "6px" }}
        />
        <div
          className="loading-skeleton"
          style={{ height: "12px", width: "100%", marginBottom: "8px", borderRadius: "4px" }}
        />
        <div
          className="loading-skeleton"
          style={{ height: "12px", width: "60%", marginBottom: "16px", borderRadius: "4px" }}
        />
        <div
          className="loading-skeleton"
          style={{ height: "60px", width: "100%", borderRadius: "8px" }}
        />
      </div>
    );
  }

  if (!signals || !signals.is_active) {
    return (
      <div className="prospect-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <InstagramIcon />
          <h2
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#8A837C",
              margin: 0,
            }}
          >
            Instagram Organic
          </h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#8A837C", margin: 0 }}>
          No active Instagram presence detected for {companyName}. Add an Instagram handle to scan their profile.
        </p>
      </div>
    );
  }

  const stale = isStale(signals);

  return (
    <div className="prospect-card" style={{ marginBottom: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <InstagramIcon />
          <h2
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#8A837C",
              margin: 0,
            }}
          >
            Instagram Organic
          </h2>
          {signals.instagram_handle && (
            <a
              href={`https://www.instagram.com/${signals.instagram_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#E1306C",
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              @{signals.instagram_handle}
            </a>
          )}
          {stale && (
            <span
              style={{
                background: "rgba(200, 75, 49, 0.12)",
                color: "#C84B31",
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "9999px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Stale
            </span>
          )}
          {signals.instagram_active_score > 0 && (
            <span
              style={{
                background: "linear-gradient(90deg, rgba(131,58,180,0.12), rgba(227,48,108,0.12))",
                color: "#E1306C",
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "9999px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              +{signals.instagram_active_score} pts
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            background: "#FAF8F5",
            color: "#5C5650",
            border: "1px solid rgba(90, 76, 60, 0.2)",
            borderRadius: "8px",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: refreshing ? "not-allowed" : "pointer",
            opacity: refreshing ? 0.6 : 1,
            transition: "all 150ms ease",
            flexShrink: 0,
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}
          >
            <path d="M10.5 6a4.5 4.5 0 1 1-1.26-3.17" />
            <path d="M10.5 1.5v3h-3" />
          </svg>
          {refreshing ? "Scraping..." : "Refresh"}
        </button>
      </div>

      {refreshMsg && (
        <div
          style={{
            marginBottom: "12px",
            padding: "8px 12px",
            background: refreshMsg.includes("failed")
              ? "rgba(200, 75, 49, 0.08)"
              : "rgba(77, 115, 88, 0.08)",
            borderRadius: "8px",
            fontSize: "0.8rem",
            color: refreshMsg.includes("failed") ? "#C84B31" : "#4D7358",
          }}
        >
          {refreshMsg}
        </div>
      )}

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <div>
          <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            Followers
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1A1714", lineHeight: 1 }}>
            {formatCount(signals.followers)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            Posts
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1A1714", lineHeight: 1 }}>
            {formatCount(signals.posts)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            Intensity
          </div>
          <ScoreBar value={signals.instagram_intensity} />
        </div>
        <div>
          <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            Engagement
          </div>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: signals.engagement_rate > 5 ? "#4D7358" : "#1A1714" }}>
            {signals.engagement_rate > 0 ? `${signals.engagement_rate}/10` : "N/A"}
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
          Signal Breakdown
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", background: "rgba(90,76,60,0.04)", borderRadius: "6px" }}>
            <span style={{ fontSize: "0.75rem", color: "#5C5650" }}>Active</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#833AB4" }}>
              {signals.instagram_active_score > 0 ? `+${signals.instagram_active_score}` : "0"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", background: "rgba(90,76,60,0.04)", borderRadius: "6px" }}>
            <span style={{ fontSize: "0.75rem", color: "#5C5650" }}>Engagement</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E1306C" }}>
              {signals.engagement_rate > 0 ? `+${signals.engagement_rate * 1}` : "0"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", background: "rgba(90,76,60,0.04)", borderRadius: "6px" }}>
            <span style={{ fontSize: "0.75rem", color: "#5C5650" }}>Frequency</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#F77737" }}>
              {signals.posting_frequency > 0 ? `+${signals.posting_frequency}` : "0"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", background: "rgba(90,76,60,0.04)", borderRadius: "6px" }}>
            <span style={{ fontSize: "0.75rem", color: "#5C5650" }}>Followers</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1A1714" }}>
              {signals.follower_growth > 0 ? `+${signals.follower_growth}` : "0"}
            </span>
          </div>
        </div>
      </div>

      {/* Hashtag themes */}
      {signals.hashtag_themes && signals.hashtag_themes.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
            B2B Themes
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {signals.hashtag_themes.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "linear-gradient(90deg, rgba(131,58,180,0.08), rgba(227,48,108,0.08))",
                  color: "#833AB4",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(131,58,180,0.15)",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {signals.fetched_at && (
        <div
          style={{
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px solid rgba(90, 76, 60, 0.07)",
            fontSize: "0.72rem",
            color: "#B5AEA4",
          }}
        >
          Last scraped{" "}
          {new Date(signals.fetched_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
