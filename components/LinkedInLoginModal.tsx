"use client";

import { useState, useEffect } from "react";

interface LinkedInLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (username: string) => void;
}

export default function LinkedInLoginModal({ isOpen, onClose, onSuccess }: LinkedInLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"login" | "success">("login");

  if (!isOpen) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _path: "/api/v1/linkedin/login", email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStep("success");
        onSuccess(data.username || email.split("@")[0]);
        setTimeout(() => { onClose(); setStep("login"); }, 2000);
      } else {
        setError(data.error || "Login failed. Check your credentials.");
      }
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        padding: "40px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
        position: "relative",
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px",
          background: "none", border: "none", cursor: "pointer",
          color: "var(--ink-tertiary)", fontSize: "1.2rem",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        </button>

        {step === "login" ? (
          <>
            {/* LinkedIn logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", margin: 0, color: "var(--ink-primary)" }}>
                  Connect LinkedIn
                </h2>
                <p style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)", margin: "4px 0 0" }}>
                  Log in once — scrape unlimited prospects
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-field" style={{ marginBottom: "16px" }}>
                <label className="form-label">LinkedIn email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-field" style={{ marginBottom: "16px" }}>
                <label className="form-label">LinkedIn password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Your LinkedIn password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div style={{
                  background: "rgba(200,75,49,0.1)",
                  border: "1px solid var(--danger)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "0.85rem",
                  color: "var(--danger)",
                }}>
                  {error}
                </div>
              )}

              <div style={{
                background: "var(--surface-inset)",
                borderRadius: "8px",
                padding: "12px 14px",
                marginBottom: "20px",
                fontSize: "0.78rem",
                color: "var(--ink-tertiary)",
                lineHeight: "1.5",
              }}>
                <strong style={{ color: "var(--ink-secondary)" }}>Why we need this:</strong> LinkedIn requires login to access profile data and posts. Your credentials are encrypted and stored securely — only used to scrape public LinkedIn data for your prospects.
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Connecting..." : "Connect LinkedIn"}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "var(--ink-primary)", marginBottom: "8px" }}>
              Connected!
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
              LinkedIn is now linked to your account. Go track some prospects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
