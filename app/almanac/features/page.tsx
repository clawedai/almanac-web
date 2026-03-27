import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D9A446" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Signal Velocity",
    desc: "Measure how fast competitor moves spread through the market. Track which accounts are accelerating or decelerating — updated in real-time.",
    accent: "#D9A446",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    title: "Anomaly Detection",
    desc: "Statistical engine flags anything that deviates from a competitor's norm. Funding rounds, unexpected hiring, pivots — hours before mainstream sources pick them up.",
    accent: "#38BDF8",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D9A446" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    title: "Competitive Benchmarks",
    desc: "Compare performance against any competitive set. Share of attention, delta week-over-week, industry rank — all updated live.",
    accent: "#D9A446",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10"/>
        <path d="M12 12 12 6"/>
        <path d="M12 12l5 5"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    title: "Predictive Intelligence",
    desc: "AI learns from historical patterns to predict what competitors will do next. Pattern recognition across 12-week history with confidence scoring.",
    accent: "#34D399",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    title: "Real-time Alerts",
    desc: "Set up alerts for exactly what matters — funding rounds, key hires, product launches. Get notified the instant they happen via email or webhook.",
    accent: "#F472B6",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D9A446" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Prospect Pipeline",
    desc: "Your full prospect list with intent scores, signal breakdowns, and enrichment data. Track who to call and when — all in one view.",
    accent: "#D9A446",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
    ),
    title: "Multi-Channel Signals",
    desc: "LinkedIn posts, Meta Ads, Google Ads, Reddit mentions, Instagram organic, review sites — 50+ signal sources unified into one score.",
    accent: "#FB923C",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    title: "AI Email Drafts",
    desc: "Generate personalized outreach emails from prospect signals. Pain points extracted from LinkedIn, funding data, and review sentiment — ready to send.",
    accent: "#A78BFA",
  },
];

export default function FeaturesPage() {
  return (
    <main className="features-root">
      {/* Nav */}
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

      {/* Hero */}
      <div className="features-hero">
        <p className="landing-eyebrow">Platform Features</p>
        <h1 className="features-title">Complete Competitive Intelligence</h1>
        <p className="features-sub">
          From real-time signals to AI-powered predictions — every pillar of your competitive advantage, built into one platform.
        </p>
      </div>

      {/* Feature grid */}
      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card-dark">
            <div className="feature-card-icon" style={{ color: f.accent }}>
              {f.icon}
            </div>
            <h3 className="feature-card-title">{f.title}</h3>
            <p className="feature-card-desc">{f.desc}</p>
            <div className="feature-card-accent" style={{ background: f.accent }} />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="features-cta-footer">
        <h2 className="cta-footer-title">Ready to know more than your competitors?</h2>
        <p className="cta-footer-sub">Join teams already using Almanac to close more deals, faster.</p>
        <div className="landing-cta-row landing-cta-row-center">
          <Link href="/signup" className="landing-btn-primary">Get started free</Link>
          <Link href="/almanac/book" className="landing-btn-ghost">Book a Demo</Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-page-footer">
        <p>Almanac &copy; 2026 &mdash; Built for teams that refuse to be surprised.</p>
      </footer>
    </main>
  );
}
