import Link from "next/link";

export default function AlmanacHome() {
  return (
    <main className="almanac-root">

      {/* ── FLOATING ORBS ── */}
      <div className="almanac-orb almanac-orb-1" />
      <div className="almanac-orb almanac-orb-2" />
      <div className="almanac-orb almanac-orb-3" />
      <div className="almanac-orb almanac-orb-4" />

      {/* ── HERO CONTENT ── */}
      <div className="almanac-content">

        {/* Label above title */}
        <p className="almanac-label">Your personal</p>

        {/* Main title — MASSIVE */}
        <h1 className="almanac-title">ALMANAC</h1>

        {/* Subtitle */}
        <p className="almanac-subtitle">Your Competitive Edge.</p>

        {/* Description */}
        <p className="almanac-desc">
          Stop reacting. Start anticipating. Almanac tracks your competitors
          <br />
          in real-time — surfacing signals, anomalies, and predictions before
          <br />
          they become your problems.
        </p>

        {/* Interest-building Banner */}
        <div className="almanac-banner">
          <div className="almanac-banner-inner">
            <p className="almanac-banner-headline">
              Your competitors are making moves right now.
            </p>
            <p className="almanac-banner-sub">
              What Almanac Tracks For You
            </p>
            <p className="almanac-banner-body">
              While you&apos;re reading this, a competitor just filed an SEC form, posted a job listing,
              launched a product, or lost a major deal. Almanac monitors 50+ live signals across
              every competitor channel — funding rounds, hiring surges, partnership announcements,
              SEC filings, news coverage, and social momentum — surfacing anomalies and momentum
              shifts in real-time, hours before they hit mainstream news.
            </p>
            <p className="almanac-banner-sub" style={{ marginTop: "0.75rem" }}>
              Signal Velocity &middot; Anomaly Detection &middot; Competitive Benchmarks &middot;
              Predictive Intelligence &middot; Real-time Alerts
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="almanac-btn-group">
          <span className="almanac-cta-label">test it now</span>
          <Link href="/almanac/features" className="almanac-btn">
            Features
          </Link>
          <Link href="/almanac/tools" className="almanac-btn-secondary">
            Sanctum
          </Link>
          <Link href="/almanac/book" className="almanac-btn">
            Book a Demo
          </Link>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="almanac-footer">
        <p>&copy; 2026 Almanac. Built for teams that refuse to be surprised.</p>
      </footer>

    </main>
  );
}
