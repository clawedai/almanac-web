"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import LinkedInLoginModal from "../../components/LinkedInLoginModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInStatus, setLinkedInStatus] = useState<{ logged_in: boolean; username?: string } | null>(null);

  useEffect(() => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
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

  useEffect(() => {
    const token = document.cookie.match(/token=([^;]+)/)?.[1];
    if (!token) {
      router.push("/login");
    } else {
      setChecking(false);
    }
  }, [router]);

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
      <aside className="sidebar">
        <div className="sidebar-logo">Almanac</div>

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
