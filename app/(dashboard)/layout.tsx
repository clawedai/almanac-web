"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

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

          <span className="sidebar-section-label" style={{ marginTop: "24px" }}>Account</span>
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
    </div>
  );
}
