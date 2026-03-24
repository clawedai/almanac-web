import Link from "next/link";

export default function SanctumTools() {
  return (
    <main className="tools-root">
      <div className="tools-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <h1 className="tools-title">Sanctum</h1>
      <p className="tools-subtitle">Your private intelligence layer.</p>
      <p className="tools-desc">
        Sanctum is your personal research sanctuary — privately track sensitive competitive
        moves before they go public. No signals, no traces, just you and your intelligence.
      </p>
      <div className="tools-cta">
        <Link href="/signup" className="almanac-btn">Get started free</Link>
        <Link href="/almanac" className="almanac-back" style={{ marginTop: "0.5rem" }}>
          &larr; Back to Almanac
        </Link>
      </div>
    </main>
  );
}
