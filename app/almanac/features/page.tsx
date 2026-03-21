import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Lead Monitoring",
    tagline: "Know who is winning before you do",
    description: "Track every competitor move in real-time across all channels. From funding announcements to hiring surges to partnership deals — see exactly who is gaining ground and who is falling behind.",
    bullets: [
      "Track 50+ signals across all competitor channels",
      "Market share of attention — updated hourly",
      "Deal flow tracking and win/loss intelligence",
      "Competitor momentum scores at a glance",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    title: "Signal Velocity",
    tagline: "Track momentum shifts the moment they happen",
    description: "Measure how fast information spreads through the market. Track which competitors are accelerating and which are decelerating across all tracked signals — updated in real-time.",
    bullets: [
      "Week-over-week momentum tracking",
      "Velocity comparison across competitors",
      "Industry heat index calculation",
      "Momentum direction indicators",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    title: "Real-time Signal Detection",
    tagline: "Every move, captured the instant it happens",
    description: "Monitor all competitor channels simultaneously. From news articles to SEC filings to LinkedIn posts — every signal is captured, categorized, and surfaced the moment it publishes.",
    bullets: [
      "Automated signal categorization",
      "Source attribution and credibility scoring",
      "Deduplication across sources",
      "Sentiment analysis on every signal",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Share of Attention",
    tagline: "See which competitor owns the conversation",
    description: "Quantify how much market attention each competitor commands. Understand who is dominating the narrative, who is losing mindshare, and track share shifts week over week.",
    bullets: [
      "Total share of attention per competitor",
      "Share delta week-over-week",
      "Attention source breakdown",
      "Competitive narrative ownership",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    title: "Anomaly Detection",
    tagline: "Catch the signals others miss",
    description: "Our statistical engine monitors every competitor's behavior and flags anything that deviates from the norm. Funding rounds, unexpected hiring, pivot announcements — get alerted hours before mainstream sources pick them up.",
    bullets: [
      "Statistical baseline for every tracked metric",
      "Hours of lead time before news breaks",
      "Customizable sensitivity thresholds",
      "Trend break alerts with confidence scores",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Competitive Benchmarks",
    tagline: "See exactly where you stand",
    description: "Compare performance against any group of competitors — auto-grouped by industry or your custom groups. Share of attention, competitive delta, industry rank — all updated live.",
    bullets: [
      "Auto-industry grouping by sector",
      "Manual competitive set creation",
      "Share of attention breakdown",
      "Competitive delta week-over-week",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10"/>
        <path d="M12 12 12 6"/>
        <path d="M12 12l5 5"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    title: "Predictive Intelligence",
    tagline: "Know what competitors will do next",
    description: "AI learns from historical patterns to predict what competitors will do next. Pattern recognition across 12-week insight history, confidence scoring, natural language forecasts.",
    bullets: [
      "Pattern detection across 12-week history",
      "Antecedent → consequence forecasting",
      "Confidence scores on every prediction",
      "AI-generated natural language insights",
    ],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    title: "Real-time Alerts",
    tagline: "Never miss a critical signal",
    description: "Stop monitoring manually. Set up alerts for exactly what matters — funding rounds, key hires, product launches — and get notified the instant they happen. Three tiers: signal, trend, and anomaly alerts.",
    bullets: [
      "Signal, trend, and anomaly alert tiers",
      "Email and webhook delivery",
      "Custom keyword matching",
      "Velocity spike notifications",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F4F4F5" }}>
      <div className="features-root">
        <Link href="/almanac" className="features-back">
          &larr; Back to Almanac
        </Link>
        <div className="features-header">
          <h1 className="features-title">Complete Competitive Intelligence Platform</h1>
          <p className="features-subtitle">
            From real-time signals to predictive intelligence — every pillar of competitive advantage, built.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className={`feature-card feature-card-${(index % 3) + 1}`}>
              <div className="feature-card-inner">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-content">
                  <h2 className="feature-title">{feature.title}</h2>
                  <p className="feature-tagline">{feature.tagline}</p>
                  <p className="feature-desc">{feature.description}</p>
                  <ul className="feature-bullets">
                    {feature.bullets.map((bullet, i) => (
                      <li key={i}>
                        <span className="feature-bullet-dot" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="features-cta">
          <p className="features-cta-label">Ready to get started?</p>
          <div className="features-cta-btns">
            <Link href="/almanac/book" className="almanac-btn">Book a Demo</Link>
            <Link href="/almanac/tools" className="almanac-btn-secondary">Try Sanctum Free</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
