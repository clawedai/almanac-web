"use client";

import { useEffect, useState } from "react";
import type { MetaAdSignals } from "../lib/types";
import { getMetaAdSignals, refreshMetaAdSignals } from "../lib/api";

interface Props {
  companyDomain?: string;
  companyName: string;
}

const STALE_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours

function isStale(signals: MetaAdSignals): boolean {
  if (!signals.fetched_at) return false;
  return Date.now() - new Date(signals.fetched_at).getTime() > STALE_THRESHOLD_MS;
}

function IntensityBar({ value, max = 25 }: { value: number; max?: number }) {
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
            background: value > 15 ? "#C84B31" : value > 8 ? "#D9A446" : "#6B7280",
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

function MetaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8c0 2.85 1.84 5.26 4.41 6.11V9.5H3.5V7h2.41v-1.91C5.91 5.09 6.75 4.5 8 4.5s2.09.59 2.09 1.59V7H12.5v2.5h-2.09v4.61C12.66 13.26 14.5 10.85 14.5 8c0-3.59-2.91-6.5-6.5-6.5z"
        fill="#1877F2"
      />
      <path
        d="M10.41 9.5H8v5.11A6.5 6.5 0 0 1 8 14.5a6.5 6.5 0 0 1-6.5-6.5C1.5 4.41 4.41 1.5 8 1.5s6.5 2.91 6.5 6.5v.5h-2.09V8c0-.88-.71-1.59-1.59-1.59S9.73 7.12 9.73 8v1.5H10.41z"
        fill="#1877F2"
      />
    </svg>
  );
}

export default function MetaAdSignalsCard({ companyDomain, companyName }: Props) {
  const [signals, setSignals] = useState<MetaAdSignals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");

  useEffect(() => {
    if (!companyDomain) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getMetaAdSignals(companyDomain)
      .then((data) => { setSignals(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [companyDomain]);

  async function handleRefresh() {
    if (!companyDomain) return;
    setRefreshing(true);
    setRefreshMsg("");
    try {
      const updated = await refreshMetaAdSignals(companyDomain, companyName);
      setSignals(updated);
      setRefreshMsg("Ads refreshed successfully.");
    } catch {
      setRefreshMsg("Refresh failed. Try again.");
    } finally {
      setRefreshing(false);
    }
  }

  if (!companyDomain) return null;

  if (loading) {
    return (
      <div className="prospect-card" style={{ marginBottom: "20px" }}>
        <div
          className="loading-skeleton"
          style={{ height: "16px", width: "140px", marginBottom: "16px", borderRadius: "6px" }}
        />
        <div
          className="loading-skeleton"
          style={{ height: "12px", width: "100%", marginBottom: "8px", borderRadius: "4px" }}
        />
        <div
          className="loading-skeleton"
          style={{ height: "12px", width: "70%", marginBottom: "16px", borderRadius: "4px" }}
        />
        <div
          className="loading-skeleton"
          style={{ height: "60px", width: "100%", borderRadius: "8px" }}
        />
      </div>
    );
  }

  if (!signals || !signals.is_advertiser) {
    return (
      <div className="prospect-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <MetaIcon />
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
            Meta / Facebook Ads
          </h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#8A837C", margin: 0 }}>
          No Meta ads detected for this company. Track the prospect to scan the Meta Ads Library.
        </p>
      </div>
    );
  }

  const stale = isStale(signals);
  const recentAds = signals.ads.slice(0, 3);

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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MetaIcon />
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
            Meta / Facebook Ads
          </h2>
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
          {!signals.meta_ad_active && (
            <span
              style={{
                background: "#F0EDE8",
                color: "#8A837C",
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "9999px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Inactive
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
          {refreshing ? "Refreshing..." : "Refresh"}
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
            Total Ads
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1A1714", lineHeight: 1 }}>
            {signals.ad_count}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            Intensity
          </div>
          <IntensityBar value={signals.meta_ad_intensity} />
        </div>
        <div>
          <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            Lead Gen
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: signals.meta_ad_lead_gen ? "#4D7358" : "#B5AEA4",
            }}
          >
            {signals.meta_ad_lead_gen ? "Yes" : "No"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            Recency
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1A1714" }}>
            {signals.meta_ad_recency}d
          </div>
        </div>
      </div>

      {/* Recent ads */}
      {recentAds.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#B5AEA4",
              marginBottom: "8px",
            }}
          >
            Recent Ads
          </div>
          {recentAds.map((ad, i) => (
            <div
              key={ad.id}
              style={{
                padding: "10px 0",
                borderTop: i > 0 ? "1px solid rgba(90, 76, 60, 0.07)" : "none",
              }}
            >
              {ad.ad_creative_body ? (
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "#5C5650",
                    margin: "0 0 4px",
                    lineHeight: 1.45,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {ad.ad_creative_body.length > 80
                    ? ad.ad_creative_body.slice(0, 80) + "…"
                    : ad.ad_creative_body}
                </p>
              ) : (
                <p style={{ fontSize: "0.82rem", color: "#B5AEA4", margin: "0 0 4px", fontStyle: "italic" }}>
                  No creative body
                </p>
              )}
              <div style={{ display: "flex", gap: "10px", fontSize: "0.72rem", color: "#B5AEA4" }}>
                {ad.ad_delivery_start && (
                  <span>
                    {new Date(ad.ad_delivery_start).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                {ad.is_lead_gen && (
                  <span
                    style={{
                      color: "#4D7358",
                      fontWeight: 600,
                    }}
                  >
                    Lead Gen
                  </span>
                )}
                {ad.is_conversion && (
                  <span style={{ color: "#1877F2", fontWeight: 600 }}>
                    Conversion
                  </span>
                )}
                {ad.is_brand_awareness && (
                  <span style={{ color: "#8A837C" }}>Brand</span>
                )}
              </div>
            </div>
          ))}
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
          Last fetched{" "}
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
