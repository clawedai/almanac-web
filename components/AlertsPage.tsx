"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Alert } from "../lib/types";
import {
  getNotificationAlerts,
  markAlertRead,
  markAllAlertsRead,
} from "../lib/api";

// ---------------------------------------------------------------------------
// Time ago helper
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffMin > 0) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  return "just now";
}

// ---------------------------------------------------------------------------
// Type label
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<Alert["type"], string> = {
  score_spike: "Score Spike",
  tier_change: "Tier Change",
};

const TYPE_COLORS: Record<Alert["type"], { bg: string; fg: string }> = {
  score_spike: { bg: "rgba(217, 164, 70, 0.12)", fg: "var(--accent)" },
  tier_change: { bg: "rgba(200, 75, 49, 0.12)", fg: "var(--hot)" },
};

// ---------------------------------------------------------------------------
// Single alert card
// ---------------------------------------------------------------------------

function AlertCard({
  alert,
  onMarkRead,
}: {
  alert: Alert;
  onMarkRead: (id: string) => void;
}) {
  const typeStyle = TYPE_COLORS[alert.type];

  return (
    <div
      style={{
        background: alert.read
          ? "var(--surface-card)"
          : "var(--surface-card)",
        border: `1px solid ${alert.read ? "var(--border-subtle)" : "rgba(217, 164, 70, 0.2)"}`,
        borderLeft: alert.read
          ? "3px solid var(--border-subtle)"
          : "3px solid var(--accent)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
        boxShadow: "var(--shadow-card)",
        marginBottom: "12px",
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        transition: "all 200ms ease",
      }}
    >
      {/* Type badge */}
      <div
        style={{
          padding: "4px 10px",
          background: typeStyle.bg,
          color: typeStyle.fg,
          borderRadius: "9999px",
          fontSize: "0.7rem",
          fontWeight: "700",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        {TYPE_LABELS[alert.type]}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "6px",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: alert.read ? "600" : "700",
              color: "var(--ink-primary)",
              lineHeight: "1.4",
              margin: 0,
            }}
          >
            {alert.title}
          </h3>
          {!alert.read && (
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--accent)",
                flexShrink: 0,
                marginTop: "6px",
              }}
            />
          )}
        </div>

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--ink-secondary)",
            lineHeight: "1.5",
            marginBottom: "8px",
          }}
        >
          {alert.message}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "0.75rem",
            color: "var(--ink-muted)",
          }}
        >
          <a
            href={`/prospects/${alert.prospect_id}`}
            onClick={(e) => {
              e.preventDefault();
              if (!alert.read) onMarkRead(alert.id);
              window.location.href = `/prospects/${alert.prospect_id}`;
            }}
            style={{
              color: "var(--accent)",
              fontWeight: "600",
              textDecoration: "none",
              transition: "color 150ms",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "var(--accent-hover)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "var(--accent)")
            }
          >
            {alert.prospect_name} &middot; {alert.company}
          </a>
          <span>&middot;</span>
          <span>{timeAgo(alert.created_at)}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ flexShrink: 0 }}>
        {!alert.read ? (
          <button
            onClick={() => onMarkRead(alert.id)}
            style={{
              padding: "6px 12px",
              background: "transparent",
              border: "1.5px solid var(--border-emphasis)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "var(--ink-secondary)",
              cursor: "pointer",
              transition: "all 150ms ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "var(--surface-inset)";
              el.style.borderColor = "var(--ink-secondary)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "transparent";
              el.style.borderColor = "var(--border-emphasis)";
            }}
          >
            Mark read
          </button>
        ) : (
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--ink-muted)",
              fontWeight: "500",
            }}
          >
            Read
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function AlertsSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="loading-skeleton skeleton-card"
          style={{ height: "120px", marginBottom: "12px" }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------

type FilterType = "all" | "score_spike" | "tier_change";

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "score_spike", label: "Score Spikes" },
  { value: "tier_change", label: "Tier Changes" },
];

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  const [hasMore, setHasMore] = useState(true);

  const fetchAlerts = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const all = await getNotificationAlerts(100);
      if (reset) {
        setAlerts(all);
        setPage(0);
      } else {
        setAlerts(all);
      }
      setHasMore(all.length >= 100);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts(true);
  }, [fetchAlerts]);

  async function handleMarkRead(alertId: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
    try {
      await markAlertRead(alertId);
    } catch {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, read: false } : a))
      );
    }
  }

  async function handleMarkAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    try {
      await markAllAlertsRead();
    } catch {
      fetchAlerts(true);
    }
  }

  const filtered = alerts.filter(
    (a) => filter === "all" || a.type === filter
  );

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a href="/brief" className="back-link">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </a>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "16px",
          }}
        >
          <div>
            <h1 className="page-title" style={{ marginBottom: "4px" }}>
              Alerts
            </h1>
            <p className="page-subtitle">
              {unreadCount > 0
                ? `${unreadCount} unread alert${unreadCount !== 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary"
              style={{ fontSize: "0.8rem" }}
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tier-tabs">
        {FILTERS.map((f) => {
          const count =
            f.value === "all"
              ? alerts.length
              : alerts.filter((a) => a.type === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`tier-tab${filter === f.value ? " active" : ""}`}
            >
              {f.label}
              <span className="tier-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      {loading ? (
        <AlertsSkeleton />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg
            className="empty-state-icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p className="empty-state-title">
            {filter === "all" ? "No alerts yet" : `No ${TYPE_LABELS[filter as Alert["type"]]}s`}
          </p>
          <p className="empty-state-desc">
            {filter === "all"
              ? "We'll notify you when prospects show signals like score spikes or tier changes."
              : `No alerts matching this filter right now.`}
          </p>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="btn-secondary"
              style={{ marginTop: "8px" }}
            >
              View all alerts
            </button>
          )}
        </div>
      ) : (
        <div>
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkRead={handleMarkRead}
            />
          ))}

          {hasMore && (
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
