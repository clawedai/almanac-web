"use client";

import { useEffect, useState } from "react";
import type { RedditAdSignals, RedditOrganicSignals } from "../lib/types";
import { getRedditAdSignals, getRedditOrganicSignals, refreshRedditSignals } from "../lib/api";

interface Props {
  companyDomain?: string;
  companyName: string;
}

const STALE_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours

function isStale(signals: RedditAdSignals | RedditOrganicSignals): boolean {
  if (!signals.fetched_at) return false;
  return Date.now() - new Date(signals.fetched_at).getTime() > STALE_THRESHOLD_MS;
}

function RedditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#FF4500" />
      <path
        d="M6.5 5.5C6.5 5.776 6.276 6 6 6s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5zM10 5.5c0 .276-.224.5-.5.5s-.5-.224-.5-.5.224-.5.5-.5.5.224.5.5z"
        fill="#fff"
      />
      <path
        d="M12 8.5c0-.276-.224-.5-.5-.5h-1.25c-.414 0-.75-.336-.75-.75 0-.305.183-.571.453-.686L10.2 6.5c1.105-.63 1.8-1.774 1.8-3.082C12 .837 11.163 0 10.118 0H5.882C4.837 0 4 1.34 4 2.995c0 1.32.708 2.471 1.82 3.1l-.753.065C5.043 6.27 5 6.495 5 6.75c0 .414-.336.75-.75.75H3.5C3.224 7.5 3 7.724 3 8s.224.5.5.5c1.93 0 3.5 1.57 3.5 3.5S8.43 15.5 6.5 15.5 3 13.93 3 12c0-.276.224-.5.5-.5s.5.224.5.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-.276.224-.5.5-.5s.5.224.5.5c0 1.93-1.57 3.5-3.5 3.5S4.5 14.43 4.5 12.5c0-.914.345-1.744.9-2.386.22-.255.52-.414.86-.414h1.25c.276 0 .5.224.5.5s-.224.5-.5.5h-.5c-.138 0-.25.112-.25.25 0 .828.672 1.5 1.5 1.5s1.5-.672 1.5-1.5-.672-1.5-1.5-1.5H8c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h1c.276 0 .5-.224.5-.5 0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5h.5c.276 0 .5.224.5.5z"
        fill="#fff"
      />
    </svg>
  );
}

export default function RedditSignalsCard({ companyDomain, companyName }: Props) {
  const [adSignals, setAdSignals] = useState<RedditAdSignals | null>(null);
  const [organicSignals, setOrganicSignals] = useState<RedditOrganicSignals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");

  useEffect(() => {
    if (!companyDomain) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      getRedditAdSignals(companyDomain),
      getRedditOrganicSignals(companyDomain),
    ])
      .then(([ads, organic]) => {
        setAdSignals(ads);
        setOrganicSignals(organic);
      })
      .catch(() => {
        setAdSignals(null);
        setOrganicSignals(null);
      })
      .finally(() => setLoading(false));
  }, [companyDomain]);

  async function handleRefresh() {
    if (!companyDomain) return;
    setRefreshing(true);
    setRefreshMsg("");
    try {
      await refreshRedditSignals(companyDomain, companyName);
      const [ads, organic] = await Promise.all([
        getRedditAdSignals(companyDomain),
        getRedditOrganicSignals(companyDomain),
      ]);
      setAdSignals(ads);
      setOrganicSignals(organic);
      setRefreshMsg("Signals refreshed successfully.");
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

  const hasAdData = adSignals && adSignals.is_advertiser;
  const hasOrganicData = organicSignals && organicSignals.mention_count > 0;
  const fetchedAt = adSignals?.fetched_at || organicSignals?.fetched_at;
  const stale = fetchedAt && isStale({ fetched_at: fetchedAt } as RedditAdSignals);

  if (!hasAdData && !hasOrganicData) {
    return (
      <div className="prospect-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <RedditIcon />
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
            Reddit Signals
          </h2>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#8A837C", margin: 0 }}>
          No Reddit signals detected for this company. Track the prospect to scan Reddit for ad and organic activity.
        </p>
      </div>
    );
  }

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
          <RedditIcon />
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
            Reddit Signals
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
          {organicSignals && !organicSignals.reddit_organic_active && (
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

      {/* Reddit Ads section */}
      {hasAdData && (
        <>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#B5AEA4",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                background: "#FF4500",
                borderRadius: "50%",
              }}
            />
            Reddit Ads
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <div>
              <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Advertiser
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: adSignals!.is_advertiser ? "#4D7358" : "#B5AEA4",
                }}
              >
                {adSignals!.is_advertiser ? "Yes" : "No"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Ad Count
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1A1714", lineHeight: 1 }}>
                {adSignals!.ad_count}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Promoted Posts
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1A1714", lineHeight: 1 }}>
                {adSignals!.promoted_posts_found}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reddit Organic section */}
      {hasOrganicData && organicSignals && (
        <>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#B5AEA4",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                background: "#FF4500",
                borderRadius: "50%",
              }}
            />
            Reddit Organic
          </div>
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
                Mentions
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1A1714", lineHeight: 1 }}>
                {organicSignals.mention_count}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Sentiment
              </div>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  background:
                    organicSignals.sentiment_label === "positive"
                      ? "rgba(77, 115, 88, 0.15)"
                      : organicSignals.sentiment_label === "negative"
                        ? "rgba(200, 75, 49, 0.15)"
                        : "rgba(90, 76, 60, 0.1)",
                  color:
                    organicSignals.sentiment_label === "positive"
                      ? "#4D7358"
                      : organicSignals.sentiment_label === "negative"
                        ? "#C84B31"
                        : "#8A837C",
                }}
              >
                {organicSignals.sentiment_label}
              </span>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Upvotes
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1A1714", lineHeight: 1 }}>
                {organicSignals.total_upvotes.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#B5AEA4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Subreddits
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1A1714", lineHeight: 1 }}>
                {organicSignals.subreddit_count}
              </div>
            </div>
          </div>

          {/* Positive / Negative breakdown */}
          {(organicSignals.positive_mentions > 0 || organicSignals.negative_mentions > 0) && (
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "14px",
                padding: "8px 12px",
                background: "rgba(90, 76, 60, 0.04)",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "#4D7358", fontWeight: 600 }}>
                  {organicSignals.positive_mentions} positive
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "#C84B31", fontWeight: 600 }}>
                  {organicSignals.negative_mentions} negative
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "#B5AEA4", fontWeight: 600 }}>
                  {organicSignals.total_comments.toLocaleString()} comments
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      {fetchedAt && (
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
          {new Date(fetchedAt).toLocaleDateString("en-US", {
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
