import Link from "next/link";

const tools = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D9A446" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    name: "Sanctum",
    tagline: "Private intelligence layer",
    desc: "Track sensitive competitive moves before they go public. No signals, no traces — just you and your intelligence. Sanctum is your private research sanctuary for accounts you don't want competitors to know you're watching.",
    color: "#D9A446",
    href: "/signup",
    cta: "Get started free",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    name: "Morning Brief",
    tagline: "Daily signal digest",
    desc: "Every morning at 8AM, get a curated briefing of the most important competitive moves from the past 24 hours. Fundings, hires, ads, posts — all ranked by relevance to your pipeline.",
    color: "#38BDF8",
    href: "/brief",
    cta: "View your brief",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    name: "Email Drafts",
    tagline: "AI-powered outreach",
    desc: "Generate personalized cold emails from prospect signals. Pain points extracted from LinkedIn activity, funding history, and review sentiment — context-rich emails that actually get responses.",
    color: "#34D399",
    href: "/prospects",
    cta: "Try it now",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    name: "Alert Engine",
    tagline: "Instant notifications",
    desc: "Configure alerts for exactly what matters — a competitor raising funding, posting a key hire, launching a campaign. Get notified via email or webhook the instant the signal fires.",
    color: "#F472B6",
    href: "/alerts",
    cta: "Set up alerts",
  },
];

export default function ToolsPage() {
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
        <p className="landing-eyebrow">Tools</p>
        <h1 className="features-title">Every tool your team needs.</h1>
        <p className="features-sub">
          Signal monitoring, daily briefs, AI drafts, and instant alerts — all built into Almanac, all working together.
        </p>
      </div>

      {/* Tools grid */}
      <div className="tools-grid">
        {tools.map((tool, i) => (
          <div key={i} className="tool-card">
            <div className="tool-icon-wrap" style={{ color: tool.color }}>
              {tool.icon}
            </div>
            <div className="tool-info">
              <div className="tool-header">
                <h3 className="tool-name">{tool.name}</h3>
                <span className="tool-tagline" style={{ color: tool.color }}>{tool.tagline}</span>
              </div>
              <p className="tool-desc">{tool.desc}</p>
              <Link href={tool.href} className="tool-cta" style={{ borderColor: tool.color, color: tool.color }}>
                {tool.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="features-cta-footer">
        <h2 className="cta-footer-title">Know exactly who to call.<br />And when.</h2>
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
