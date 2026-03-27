"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function AlmanacHome() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // subtle parallax on the background layers
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="landing-root">

      {/* ── HERO ── */}
      <div className="landing-hero" ref={heroRef}>

        {/* Navigation */}

        {/* Navigation */}
        <nav className="landing-nav">
          <span className="landing-logo">Almanac</span>
          <div className="landing-nav-links">
            <a href="/almanac/features">Features</a>
            <a href="/almanac/tools">Tools</a>
            <a href="/almanac/book">Book a Demo</a>
          </div>
          <Link href="/login" className="landing-nav-cta">
            Start free
          </Link>
        </nav>

        {/* Hero content — centered */}
        <div className="landing-hero-content">

          {/* Label */}
          <p className="landing-eyebrow">Your personal</p>

          {/* Title */}
          <h1 className="landing-title">ALMANAC</h1>

          {/* Sub */}
          <p className="landing-sub">Your Competitive Edge.</p>

          {/* Desc */}
          <p className="landing-desc">
            Stop reacting. Start anticipating.<br />
            Prospect intelligence that tracks every move before it becomes your problem.
          </p>

          {/* CTA — centered */}
          <div className="landing-cta-group">
            <p className="landing-cta-label">Get started free</p>
            <div className="landing-cta-row">
              <Link href="/almanac/features" className="landing-btn-primary">
                Explore Features
              </Link>
              <Link href="/almanac/book" className="landing-btn-ghost">
                Book a Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="landing-scroll">
          <div className="scroll-line" />
          <span>scroll</span>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <section className="landing-stats">
        <div className="stats-item">
          <span className="stats-num">10,000+</span>
          <span className="stats-label">Prospects Monitored</span>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <span className="stats-num">50+</span>
          <span className="stats-label">Live Signal Sources</span>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <span className="stats-num">Real-time</span>
          <span className="stats-label">Alert Engine</span>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <span className="stats-num">Multiple</span>
          <span className="stats-label">Ad Platforms Tracked</span>
        </div>
      </section>

      {/* ── WHAT ALMANAC TRACKS ── */}
      <section className="landing-tracks">
        <div className="tracks-inner">
          <p className="tracks-eyebrow">What Almanac Tracks</p>
          <h2 className="tracks-title">
            Your competitors are making moves right now.
          </h2>
          <p className="tracks-body">
            While you&apos;re reading this, a competitor just raised funding, posted a job listing,
            launched a campaign, or lost a major deal. Almanac monitors 50+ live signals
            across every channel — surfacing anomalies and momentum shifts in real-time.
          </p>

          {/* Feature pills */}
          <div className="tracks-pills">
            {[
              "Signal Velocity",
              "Anomaly Detection",
              "Competitive Benchmarks",
              "Predictive Intelligence",
              "Real-time Alerts",
              "LinkedIn Monitoring",
              "Meta Ads Intel",
              "Google Ads Intel",
              "Reddit Sentiment",
              "Instagram Organic",
            ].map((pill) => (
              <span key={pill} className="track-pill">{pill}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIGNAL SOURCES GRID ── */}
      <section className="landing-sources">
        <div className="sources-inner">
          <p className="sources-eyebrow">Signal Sources</p>
          <h2 className="sources-title">Every channel. One score.</h2>

          <div className="sources-grid">
            {[
              {
                icon: "01",
                name: "Funding Signals",
                desc: "Series rounds, valuations, and investor mentions",
                color: "#F59E0B",
              },
              {
                icon: "02",
                name: "Hiring Activity",
                desc: "Sales and revops headcount in real-time",
                color: "#F59E0B",
              },
              {
                icon: "03",
                name: "LinkedIn Activity",
                desc: "Frustrated posts, pain points, and engagement",
                color: "#F59E0B",
              },
              {
                icon: "04",
                name: "Meta Ads",
                desc: "Active campaigns, lead gen forms, and spend patterns",
                color: "#F59E0B",
              },
              {
                icon: "05",
                name: "Google Ads",
                desc: "Ad presence, keyword themes, and intensity scores",
                color: "#F59E0B",
              },
              {
                icon: "06",
                name: "Reddit Mentions",
                desc: "Organic sentiment, community buzz, and upvotes",
                color: "#F59E0B",
              },
              {
                icon: "07",
                name: "Instagram Organic",
                desc: "Follower growth, engagement rate, and hashtag themes",
                color: "#F59E0B",
              },
              {
                icon: "08",
                name: "Review Sites",
                desc: "G2, Capterra — switching intent and negative reviews",
                color: "#F59E0B",
              },
            ].map((source) => (
              <div key={source.icon} className="source-card">
                <div className="source-num" style={{ color: source.color }}>{source.icon}</div>
                <div className="source-info">
                  <h3 className="source-name">{source.name}</h3>
                  <p className="source-desc">{source.desc}</p>
                </div>
                <div className="source-dot" style={{ background: source.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="landing-cta-footer">
        <h2 className="cta-footer-title">Know exactly who to call.<br />And when.</h2>
        <p className="cta-footer-sub">Join teams already using Almanac to close more deals, faster.</p>
        <div className="landing-cta-row landing-cta-row-center">
          <Link href="/signup" className="landing-btn-primary">Get started free</Link>
          <Link href="/almanac/book" className="landing-btn-ghost">Book a Demo</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-page-footer">
        <p>Almanac &copy; 2026 &mdash; Built for teams that refuse to be surprised.</p>
      </footer>
    </main>
  );
}
