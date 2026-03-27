"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Alert } from "../lib/types";
import {
  getNotificationAlerts,
  getUnreadAlertCount,
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

  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHr > 0) return `${diffHr}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "just now";
}

// ---------------------------------------------------------------------------
// Alert type icon (inline SVG)
// ---------------------------------------------------------------------------

function AlertTypeIcon({ type }: { type: Alert["type"] }) {
  if (type === "score_spike") {
    // Trending-up arrow
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "var(--accent)" }}
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
  }
  // tier_change — swap/arrow icon
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--hot)" }}
    >
      <path d="M7 16V4m0 0L3 8m4-4l4 4" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Skeleton rows
// ---------------------------------------------------------------------------

function AlertSkeleton() {
  return (
    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div
            className="loading-skeleton"
            style={{ width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0 }}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="loading-skeleton" style={{ height: "12px", width: "70%" }} />
            <div className="loading-skeleton" style={{ height: "10px", width: "45%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AlertNotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------------------
  // Fetch unread count on mount and set up polling
  // -------------------------------------------------------------------------
  const fetchCount = useCallback(async () => {
    try {
      const count = await getUnreadAlertCount();
      setUnreadCount(count);
    } catch {
      // Silently fail — count is non-critical
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotificationAlerts(10);
      setAlerts(data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Open: fetch fresh alerts
  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen, fetchAlerts]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  async function handleBellClick() {
    setIsOpen((prev) => !prev);
  }

  async function handleAlertClick(alert: Alert) {
    // Mark read optimistically
    if (!alert.read) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, read: true } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markAlertRead(alert.id);
      } catch {
        // Restore on failure
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? { ...a, read: false } : a))
        );
        setUnreadCount((prev) => prev + 1);
      }
    }
    setIsOpen(false);
    router.push(`/prospects/${alert.prospect_id}`);
  }

  async function handleMarkAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    setUnreadCount(0);
    try {
      await markAllAlertsRead();
    } catch {
      fetchAlerts();
      fetchCount();
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      {/* Bell button */}
      <button
        onClick={handleBellClick}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          background: isOpen ? "var(--surface-inset)" : "transparent",
          border: "1px solid transparent",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          color: unreadCount > 0 ? "var(--accent)" : "var(--ink-secondary)",
          transition: "all 150ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-inset)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
          }
        }}
      >
        {/* Bell SVG */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "3px",
              right: "3px",
              minWidth: "16px",
              height: "16px",
              padding: "0 4px",
              background: "var(--danger)",
              color: "#fff",
              fontSize: "0.6rem",
              fontWeight: "800",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              border: "1.5px solid var(--surface-base)",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "340px",
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-elevated)",
            zIndex: 9999,
            overflow: "hidden",
            animation: "fadeIn 150ms ease",
          }}
        >
          {/* Dropdown header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--ink-primary)",
              }}
            >
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "var(--accent)",
                  fontWeight: "600",
                  padding: "2px 0",
                  transition: "color 150ms",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLButtonElement).style.color = "var(--accent-hover)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLButtonElement).style.color = "var(--accent)")
                }
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Alert list */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {loading ? (
              <AlertSkeleton />
            ) : alerts.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 16px" }}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ color: "var(--ink-muted)", margin: "0 auto 8px" }}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--ink-tertiary)",
                    fontWeight: "500",
                  }}
                >
                  No alerts yet
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    padding: "10px 16px",
                    cursor: "pointer",
                    background: alert.read
                      ? "transparent"
                      : "rgba(217, 164, 70, 0.04)",
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (alert.read) {
                      (e.currentTarget as HTMLDivElement).style.background =
                        "var(--surface-inset)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (alert.read) {
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }
                  }}
                >
                  {/* Type icon circle */}
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: alert.read
                        ? "var(--surface-inset)"
                        : alert.type === "score_spike"
                          ? "rgba(217, 164, 70, 0.1)"
                          : "rgba(200, 75, 49, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    <AlertTypeIcon type={alert.type} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: alert.read ? "500" : "700",
                        color: "var(--ink-primary)",
                        lineHeight: "1.4",
                        marginBottom: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {alert.title}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--ink-tertiary)",
                        lineHeight: "1.4",
                        marginBottom: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {alert.company}
                    </p>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--ink-muted)",
                      }}
                    >
                      {timeAgo(alert.created_at)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!alert.read && (
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                        flexShrink: 0,
                        marginTop: "6px",
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div
              style={{
                padding: "10px 16px",
                borderTop: "1px solid var(--border-subtle)",
                textAlign: "center",
              }}
            >
              <a
                href="/alerts"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  router.push("/alerts");
                }}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--accent)",
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
                View all alerts
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
