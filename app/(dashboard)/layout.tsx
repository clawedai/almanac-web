"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import LinkedInLoginModal from "../../components/LinkedInLoginModal";
import AlertNotificationBell from "../../components/AlertNotificationBell";
import { getToken, getICPStatus } from "../../lib/api";
import type { ICPStatus, LinkedInStatus } from "../../lib/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInStatus, setLinkedInStatus] = useState<LinkedInStatus | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [icpStatus, setIcpStatus] = useState<ICPStatus | null>(null);
  const [icpBannerDismissed, setIcpBannerDismissed] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
    } else {
      setChecking(false);
      // Check LinkedIn status
      fetch("/api/linkedin", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
        .then((r) => r.ok ? r.json() : { logged_in: false })
        .then((d) => setLinkedInStatus(d))
        .catch(() => setLinkedInStatus({ logged_in: false }));
    }
  }, [router]);

  // Check if ICP banner was dismissed in this session
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem("icp_banner_dismissed");
      if (dismissed === "true") setIcpBannerDismissed(true);
    } catch {
      // sessionStorage not available
    }
  }, []);

  // Fetch ICP status
  useEffect(() => {
    if (!checking) {
      const token = getToken();
      if (!token) return;
      getICPStatus()
        .then((status) => setIcpStatus(status))
        .catch(() => setIcpStatus(null));
    }
  }, [checking]);

  if (checking) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        color: "var(--ink-tertiary)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Loading...
      </div>
    );
  }

  const navItems = [
    {
      href: "/brief",
      label: "Morning Brief",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v7l3 3M13.5 5.5a6 6 0 11-11 0" />
          <circle cx="8" cy="8" r="6" />
        </svg>
      ),
    },
    {
      href: "/prospects",
      label: "Pipeline",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4h12M2 8h8M2 12h5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="dashboard-shell">
      {/* Mobile header */}
      <header className="mobile-header">
        <div className="mobile-header-logo">Almanac</div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <AlertNotificationBell />
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileNavOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* ICP Setup Banner */}
      {icpStatus && !icpStatus.setup_complete && !icpBannerDismissed && pathname !== "/setup" && (
        <div style={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          color: "#fff",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          fontSize: "0.875rem",
          fontFamily: "'DM Sans', sans-serif",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span style={{ fontWeight: 600 }}>Complete your ICP to unlock intelligent scoring</span>
            <span style={{ opacity: 0.85 }}>Tell us what service you offer and who your customers are.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <a
              href="/setup"
              style={{
                background: "#fff",
                color: "#ea580c",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "0.8125rem",
                fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Set up now
            </a>
            <button
              onClick={() => {
                setIcpBannerDismissed(true);
                try { sessionStorage.setItem("icp_banner_dismissed", "true"); } catch { /* noop */ }
              }}
              aria-label="Dismiss banner"
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                opacity: 0.8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)}>
          <aside className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)", paddingBottom: "var(--space-5)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="sidebar-logo" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: "none" }}>Almanac</div>
            </div>
            <nav className="sidebar-nav">
              <span className="sidebar-section-label">Today</span>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`sidebar-nav-item${pathname === item.href ? " active" : ""}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
              <span className="sidebar-section-label" style={{ marginTop: "24px" }}>Settings</span>
              <a
                href="#"
                className="sidebar-nav-item"
                onClick={(e) => { e.preventDefault(); setMobileNavOpen(false); setShowLinkedInModal(true); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn {linkedInStatus?.logged_in ? `(${linkedInStatus.username})` : "— not connected"}
              </a>
              <a
                href="/setup"
                className={`sidebar-nav-item${pathname === "/setup" ? " active" : ""}`}
                onClick={() => setMobileNavOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
                ICP Setup
                {icpStatus?.setup_complete ? (
                  <span style={{ marginLeft: "auto", color: "#22c55e", display: "flex", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                ) : (
                  <span style={{ marginLeft: "auto", color: "#f97316", display: "flex", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    </svg>
                  </span>
                )}
              </a>
              <a
                href="#"
                className="sidebar-nav-item"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileNavOpen(false);
                  document.cookie = "token=; path=/; max-age=0";
                  router.push("/login");
                }}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2l3 3 5-5M13 11v3a1 1 0 01-1 1H4a1 1 0 01-1-1V5" />
                </svg>
                Sign out
              </a>
            </nav>
          </aside>
        </div>
      )}

      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-8)", paddingBottom: "var(--space-6)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="sidebar-logo" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: "none" }}>Almanac</div>
          <AlertNotificationBell />
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Today</span>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item${pathname === item.href ? " active" : ""}`}
            >
              {item.icon}
              {item.label}
            </a>
          ))}

          <span className="sidebar-section-label" style={{ marginTop: "24px" }}>Settings</span>
          <a
            href="#"
            className="sidebar-nav-item"
            onClick={(e) => { e.preventDefault(); setShowLinkedInModal(true); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn {linkedInStatus?.logged_in ? `(${linkedInStatus.username})` : "— not connected"}
          </a>
          <a
            href="/setup"
            className={`sidebar-nav-item${pathname === "/setup" ? " active" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            ICP Setup
            {icpStatus?.setup_complete ? (
              <span style={{ marginLeft: "auto", color: "#22c55e", display: "flex", alignItems: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
            ) : (
              <span style={{ marginLeft: "auto", color: "#f97316", display: "flex", alignItems: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </span>
            )}
          </a>
          <a
            href="#"
            className="sidebar-nav-item"
            onClick={(e) => {
              e.preventDefault();
              document.cookie = "token=; path=/; max-age=0";
              router.push("/login");
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2l3 3 5-5M13 11v3a1 1 0 01-1 1H4a1 1 0 01-1-1V5" />
            </svg>
            Sign out
          </a>
        </nav>

        <div style={{
          paddingTop: "24px",
          borderTop: "1px solid var(--border-subtle)",
          marginTop: "auto",
        }}>
          <a href="/brief" className="sidebar-nav-item" style={{ fontSize: "0.75rem", color: "var(--ink-muted)" }}>
            Help &amp; docs
          </a>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>

      <LinkedInLoginModal
        isOpen={showLinkedInModal}
        onClose={() => setShowLinkedInModal(false)}
        onSuccess={(username) => setLinkedInStatus({ logged_in: true, username })}
      />
    </div>
  );
}
