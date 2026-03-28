"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getICPStatus } from "../../../lib/api";
import type { ICPProfile, SignalDefinition, ServiceCategory } from "../../../lib/types";

// ---------------------------------------------------------------------------
// Default signal definitions by service category
// ---------------------------------------------------------------------------
const DEFAULT_SIGNALS: Record<string, Omit<SignalDefinition, "id">> = {
  linkedin: {
    signal_type: "linkedin",
    look_keywords: ["hiring", "growing", "expanding", "launching", "looking for"],
    pain_keywords: ["frustrated", "struggling", "overwhelmed", "behind", "issues"],
    action_keywords: ["looking for", "evaluating", "comparing", "seeking"],
    category_keywords: ["video", "design", "marketing", "agency"],
    keyword_scores: { look: 10, pain: 15, action: 10, category: 5, recency_7: 20, recency_30: 10, frustrated: 15, negative: 10 },
    recency_days: 90,
    signal_weight: 1.0,
    max_contribution: 25,
    is_enabled: true,
  },
  hiring: {
    signal_type: "hiring",
    look_keywords: ["hiring", "join our team", "we're growing", "open role"],
    pain_keywords: ["short-staffed", "overworked", "capacity issue"],
    action_keywords: ["looking for", "need help", "seeking"],
    category_keywords: ["video", "design", "web", "marketing"],
    keyword_scores: { look: 10, pain: 10, action: 15, category: 5, recency_7: 15, recency_30: 8, frustrated: 5, negative: 5 },
    recency_days: 60,
    signal_weight: 1.0,
    max_contribution: 15,
    is_enabled: true,
  },
  funding: {
    signal_type: "funding",
    look_keywords: ["raised", "series", "funding", "invested in"],
    pain_keywords: ["scaling", "growing pains", "need to scale"],
    action_keywords: ["expanding", "building", "growing"],
    category_keywords: ["saas", "marketing", "tech"],
    keyword_scores: { look: 15, pain: 5, action: 10, category: 5, recency_7: 15, recency_30: 8, frustrated: 0, negative: 0 },
    recency_days: 180,
    signal_weight: 1.5,
    max_contribution: 15,
    is_enabled: true,
  },
  instagram: {
    signal_type: "instagram",
    look_keywords: ["new content", "rebrand", "visual", "creative"],
    pain_keywords: ["low engagement", "not growing", "need content"],
    action_keywords: ["looking for", "seeking creator", "need photographer"],
    category_keywords: ["video", "design", "creative"],
    keyword_scores: { look: 10, pain: 10, action: 10, category: 5, recency_7: 15, recency_30: 8, frustrated: 5, negative: 5 },
    recency_days: 60,
    signal_weight: 1.0,
    max_contribution: 15,
    is_enabled: true,
  },
  meta_ads: {
    signal_type: "meta_ads",
    look_keywords: ["campaign", "ads", "facebook", "instagram ads"],
    pain_keywords: ["low roas", "not converting", "ad fatigue"],
    action_keywords: ["testing", "optimizing", "need agency"],
    category_keywords: ["marketing", "agency", "ecommerce"],
    keyword_scores: { look: 10, pain: 10, action: 10, category: 5, recency_7: 15, recency_30: 8, frustrated: 5, negative: 5 },
    recency_days: 90,
    signal_weight: 1.0,
    max_contribution: 15,
    is_enabled: true,
  },
  google_ads: {
    signal_type: "google_ads",
    look_keywords: ["search ads", "google ads", "ppc", "sem"],
    pain_keywords: ["low quality score", "high cpc", "not ranking"],
    action_keywords: ["need help", "looking for agency", "optimizing"],
    category_keywords: ["saas", "marketing", "web"],
    keyword_scores: { look: 10, pain: 10, action: 10, category: 5, recency_7: 15, recency_30: 8, frustrated: 5, negative: 5 },
    recency_days: 90,
    signal_weight: 1.0,
    max_contribution: 15,
    is_enabled: true,
  },
  reddit: {
    signal_type: "reddit",
    look_keywords: ["recommend", "alternatives", "better than"],
    pain_keywords: ["expensive", "doesn't work", "frustrated", "overpriced"],
    action_keywords: ["switching from", "looking for alternatives", "help"],
    category_keywords: ["saas", "design", "marketing"],
    keyword_scores: { look: 8, pain: 12, action: 8, category: 4, recency_7: 12, recency_30: 6, frustrated: 10, negative: 8 },
    recency_days: 90,
    signal_weight: 0.8,
    max_contribution: 10,
    is_enabled: false,
  },
  reviews: {
    signal_type: "reviews",
    look_keywords: ["switching", "migrating", "replacing"],
    pain_keywords: ["slow", "expensive", "difficult", "broken"],
    action_keywords: ["looking for", "considering", "evaluating"],
    category_keywords: ["saas", "design", "marketing", "web"],
    keyword_scores: { look: 10, pain: 15, action: 10, category: 5, recency_7: 15, recency_30: 8, frustrated: 15, negative: 15 },
    recency_days: 180,
    signal_weight: 1.0,
    max_contribution: 15,
    is_enabled: true,
  },
};

// ---------------------------------------------------------------------------
// Service categories
// ---------------------------------------------------------------------------
const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; icon: string; desc: string }[] = [
  { value: "VIDEO", label: "Video Production & Editing", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z", desc: "Commercials, social content, documentaries" },
  { value: "DESIGN", label: "Graphic & Brand Design", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", desc: "Logos, brand identity, print, digital" },
  { value: "WEB", label: "Web Design & Development", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", desc: "Sites, apps, UX/UI, e-commerce" },
  { value: "SAAS", label: "B2B SaaS / Software", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", desc: "Tools, platforms, enterprise software" },
  { value: "MARKETING", label: "Marketing & Advertising", icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z", desc: "Campaigns, SEO, content, paid ads" },
  { value: "CONSULTING", label: "Consulting & Advisory", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", desc: "Strategy, operations, growth" },
  { value: "OTHER", label: "Other", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", desc: "Custom or mixed offerings" },
];

const INDUSTRIES = [
  "Technology", "Healthcare", "E-commerce & Retail", "Finance & Fintech",
  "Education & EdTech", "Media & Entertainment", "Real Estate", "Hospitality",
  "Manufacturing", "Professional Services", "Agency", "Non-profit", "Government",
];

const COMPANY_SIZES = ["0-1", "2-10", "11-50", "51-200", "201-1000", "1000+"];
const REVENUE_RANGES = ["Under $100K", "$100K-$1M", "$1M-$10M", "$10M-$50M", "$50M+"];

const LOCATIONS = [
  "United States", "United Kingdom", "Canada", "Australia",
  "India", "European Union", "Asia", "Africa", "South America", "Global",
];

const BUYER_ROLES_SUGGESTIONS = [
  "Marketing Manager", "CEO", "VP Marketing", "Founder",
  "Operations Manager", "Creative Director", "Sales Manager",
];

const URGENCY_SIGNALS = [
  { value: "funding", label: "Funding raised" },
  { value: "rebranding", label: "Rebranding" },
  { value: "product_launch", label: "Product launch" },
  { value: "website_redesign", label: "Website redesign" },
  { value: "rapid_growth", label: "Rapid team growth" },
  { value: "new_marketing_push", label: "New marketing push" },
  { value: "losing_market_share", label: "Losing market share" },
  { value: "firing_vendor", label: "Firing vendor" },
  { value: "seasonal_peak", label: "Seasonal peak" },
  { value: "conference_event", label: "Conference/event" },
  { value: "pr_crisis", label: "PR crisis" },
  { value: "new_leadership", label: "New leadership hire" },
];

const DECISION_MAKERS = [
  "Solo (CEO/Owner)", "Marketing team influence", "Creative/Design influence",
  "Sales team influence", "Committee/board", "IT involvement",
];

const TIMELINES = [
  { value: "immediate", label: "Immediate", desc: "Actively looking now" },
  { value: "short_term", label: "Short-term (1-3 months)", desc: "Planning within a quarter" },
  { value: "medium_term", label: "Medium-term (3-6 months)", desc: "Building a shortlist" },
  { value: "long_term", label: "Long-term (6+ months)", desc: "Early research stage" },
  { value: "no_timeline", label: "No specific timeline", desc: "Open-ended exploration" },
];

const PRICE_RANGES = [
  "Not sure yet", "Under $500", "$500-2k", "$2k-10k", "$10k-50k", "$50k+",
];

const SERVICE_FORMATS = [
  { value: "FREELANCE", label: "Freelance", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { value: "AGENCY", label: "Agency", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { value: "SaaS", label: "SaaS Product", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { value: "PRODUCT", label: "Product", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { value: "CONSULTING", label: "Consulting", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

// ---------------------------------------------------------------------------
// Tag input helper
// ---------------------------------------------------------------------------
function useTagInput(initialTags: string[] = []): {
  tags: string[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
} {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function addTag() {
    const trimmed = input.trim().replace(/,$/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  return { tags, input, setInput, handleKeyDown, addTag, removeTag, setTags };
}

// ---------------------------------------------------------------------------
// Multi-checkbox field
// ---------------------------------------------------------------------------
function MultiCheckbox({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div className="checkbox-grid">
        {options.map((opt) => (
          <label key={opt} className={`checkbox-card${selected.includes(opt) ? " checked" : ""}`}>
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              style={{ display: "none" }}
            />
            <span className="checkbox-label">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Keyword chip editor
// ---------------------------------------------------------------------------
function KeywordChips({
  label,
  keywords,
  onChange,
}: {
  label: string;
  keywords: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    }
  }

  function add() {
    const trimmed = input.trim().replace(/,$/, "");
    if (trimmed && !keywords.includes(trimmed)) {
      onChange([...keywords, trimmed]);
    }
    setInput("");
  }

  function remove(kw: string) {
    onChange(keywords.filter((k) => k !== kw));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", width: "56px", flexShrink: 0 }}>{label}</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", flex: 1 }}>
          {keywords.map((kw) => (
            <span key={kw} className="keyword-chip">
              {kw}
              <button type="button" onClick={() => remove(kw)} className="chip-remove" aria-label={`Remove ${kw}`}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l6 6M8 2l-6 6"/></svg>
              </button>
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px", paddingLeft: "56px" }}>
        <input
          className="form-input chip-input"
          placeholder="Add keyword..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={add}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Signal source card
// ---------------------------------------------------------------------------
function SignalCard({
  signal,
  onChange,
  onReset,
}: {
  signal: SignalDefinition;
  onChange: (updated: SignalDefinition) => void;
  onReset: () => void;
}) {
  const signalLabels: Record<string, string> = {
    linkedin: "LinkedIn / Social Posts",
    hiring: "Hiring Signals",
    funding: "Funding Announcements",
    instagram: "Instagram",
    meta_ads: "Meta Ads",
    google_ads: "Google Ads",
    reddit: "Reddit",
    reviews: "Competitor Reviews",
  };

  const signalIcons: Record<string, React.ReactNode> = {
    linkedin: <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    hiring: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    funding: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0h12zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    meta_ads: <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    google_ads: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
    reddit: <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>,
    reviews: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11.549 2.917c.276-.243.692-.243.968 0l1.715 1.637 2.39.344c.324.047.572.274.618.594l.34 2.387 1.93.243c.315.039.555.276.59.594l-.243 2.388 1.715 1.638c.276.242.276.635 0 .877l-1.715 1.637.243 2.388c.035.318-.275.555-.59.594l-2.388.344-1.716 1.637c-.276.242-.692.242-.968 0l-1.715-1.637-2.388-.344a.604.604 0 01-.618-.594l.244-2.388-1.715-1.638c-.276-.242-.276-.635 0-.877l1.715-1.637-.243-2.388a.604.604 0 01.618-.594l2.388-.344 1.715-1.637z"/></svg>,
  };

  function update<K extends keyof SignalDefinition>(key: K, value: SignalDefinition[K]) {
    onChange({ ...signal, [key]: value });
  }

  return (
    <div className={`signal-card${signal.is_enabled ? " enabled" : " disabled"}`}>
      <div className="signal-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ color: signal.is_enabled ? "var(--accent)" : "var(--ink-muted)" }}>
            {signalIcons[signal.signal_type] || signalIcons.linkedin}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: signal.is_enabled ? "var(--ink-primary)" : "var(--ink-tertiary)" }}>
              {signalLabels[signal.signal_type] || signal.signal_type}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--ink-muted)" }}>
              Max {signal.max_contribution}pts · {signal.recency_days}d recency
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={onReset}
            style={{
              fontSize: "0.72rem",
              color: "var(--ink-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Reset
          </button>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={signal.is_enabled}
              onChange={(e) => update("is_enabled", e.target.checked)}
            />
            <span className="toggle-slider"/>
          </label>
        </div>
      </div>

      {signal.is_enabled && (
        <div className="signal-card-body">
          {/* Settings row */}
          <div className="signal-settings-row">
            <div className="signal-setting">
              <label className="signal-setting-label">Recency</label>
              <select
                className="signal-select"
                value={signal.recency_days}
                onChange={(e) => update("recency_days", parseInt(e.target.value))}
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>365 days</option>
              </select>
            </div>
            <div className="signal-setting">
              <label className="signal-setting-label">Weight</label>
              <select
                className="signal-select"
                value={signal.signal_weight}
                onChange={(e) => update("signal_weight", parseFloat(e.target.value))}
              >
                <option value={0.5}>0.5x</option>
                <option value={1.0}>1.0x</option>
                <option value={1.5}>1.5x</option>
                <option value={2.0}>2.0x</option>
              </select>
            </div>
            <div className="signal-setting">
              <label className="signal-setting-label">Max pts</label>
              <input
                type="number"
                className="signal-number"
                value={signal.max_contribution}
                min={1}
                max={50}
                onChange={(e) => update("max_contribution", parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Keywords */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <KeywordChips label="Look" keywords={signal.look_keywords} onChange={(v) => update("look_keywords", v)} />
            <KeywordChips label="Pain" keywords={signal.pain_keywords} onChange={(v) => update("pain_keywords", v)} />
            <KeywordChips label="Action" keywords={signal.action_keywords} onChange={(v) => update("action_keywords", v)} />
            <KeywordChips label="Category" keywords={signal.category_keywords} onChange={(v) => update("category_keywords", v)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
const STEPS = [
  { num: 1, label: "Your Service" },
  { num: 2, label: "Your Customer" },
  { num: 3, label: "Trigger Signals" },
  { num: 4, label: "Signal Sources" },
  { num: 5, label: "Review & Launch" },
];

function StepIndicator({ currentStep, onGoTo }: { currentStep: number; onGoTo: (n: number) => void }) {
  return (
    <div className="step-indicator">
      {STEPS.map((step, idx) => {
        const isActive = step.num === currentStep;
        const isDone = step.num < currentStep;
        return (
          <div key={step.num} style={{ display: "flex", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => isDone ? onGoTo(step.num) : undefined}
              className={`step-item${isActive ? " active" : ""}${isDone ? " done" : ""}`}
              disabled={!isDone && !isActive}
            >
              <div className={`step-circle${isDone ? " done" : ""}`}>
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2 6l3 3 5-5"/>
                  </svg>
                ) : (
                  <span>{step.num}</span>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`step-connector${isDone ? " done" : ""}`}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast notification
// ---------------------------------------------------------------------------
function Toast({ message, type, onDismiss }: { message: string; type: "success" | "error"; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13.5 4.5l-7 7L3 8"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="8" cy="8" r="6"/><path d="M8 5v4M8 11v.5"/>
        </svg>
      )}
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------
export default function SetupPage() {
  const router = useRouter();

  // ── Current step ──
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [icp, setIcp] = useState<ICPProfile | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [alertHot, setAlertHot] = useState(true);
  const [alertDigest, setAlertDigest] = useState(false);

  // ── Section 1: Service ──
  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | "">("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [coreProblem, setCoreProblem] = useState("");
  const [primaryDeliverable, setPrimaryDeliverable] = useState("");
  const [serviceFormat, setServiceFormat] = useState("");
  const [priceRange, setPriceRange] = useState("");

  // ── Section 2: Customer ──
  const [buyerRole, setBuyerRole] = useState("");
  const buyerRoleInput = useTagInput(buyerRole ? buyerRole.split(",").map((r) => r.trim()).filter(Boolean) : []);
  const [industries, setIndustries] = useState<string[]>([]);
  const [companySizes, setCompanySizes] = useState<string[]>([]);
  const [revenueRanges, setRevenueRanges] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const toolsUsed = useTagInput();
  const toolsUnhappy = useTagInput();

  // ── Section 3: Signals ──
  const problemsExpressed = useTagInput();
  const [frustrationDisplay, setFrustrationDisplay] = useState("");
  const [urgencySignals, setUrgencySignals] = useState<string[]>([]);
  const [decisionMaker, setDecisionMaker] = useState("");
  const [timeline, setTimeline] = useState("");

  // ── Section 4: Signal definitions ──
  const [signals, setSignals] = useState<SignalDefinition[]>([]);

  // ── Derived: enabled signal count ──
  const enabledSignals = signals.filter((s) => s.is_enabled);
  const totalKeywords = signals.reduce(
    (sum, s) => sum + s.look_keywords.length + s.pain_keywords.length + s.action_keywords.length + s.category_keywords.length,
    0
  );

  // ---------------------------------------------------------------------------
  // Load existing ICP on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    fetch("/api/icp", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data: ICPProfile | null) => {
        if (data) {
          setIcp(data);
          // Populate all form fields
          setServiceName(data.service_name || "");
          setServiceCategory((data.service_category || "") as ServiceCategory | "");
          setServiceDescription(data.service_description || "");
          setCoreProblem(data.core_problem_solved || "");
          setPrimaryDeliverable(data.primary_deliverable || "");
          setServiceFormat(data.service_format || "");
          setPriceRange(data.budget_range || "");
          setBuyerRole(data.buyer_role || "");
          if (data.buyer_role) {
            buyerRoleInput.setTags(data.buyer_role.split(",").map((r) => r.trim()).filter(Boolean));
          }
          setIndustries(data.buyer_industry || []);
          setCompanySizes(data.buyer_company_size || []);
          setRevenueRanges(data.buyer_revenue_range || []);
          setLocations(data.buyer_location || []);
          if (data.problems_expressed) {
            problemsExpressed.setTags(data.problems_expressed);
          }
          setFrustrationDisplay(data.problems_expressed?.[0] || "");
          setUrgencySignals(data.buying_urgency_signals || []);
          setDecisionMaker(data.decision_maker || "");
          setSignals(
            data.signal_definitions?.length
              ? data.signal_definitions
              : buildDefaultSignals(data.service_category)
          );
        } else {
          // Start with empty signals — will populate when category is chosen
          setSignals(Object.values(DEFAULT_SIGNALS).map((s, i) => ({ ...s, id: `s${i}` })));
        }
      })
      .catch(() => {
        setSignals(Object.values(DEFAULT_SIGNALS).map((s, i) => ({ ...s, id: `s${i}` })));
      })
      .finally(() => setLoading(false));
  }, [router]);

  // ---------------------------------------------------------------------------
  // Build default signals when category changes
  // ---------------------------------------------------------------------------
  function buildDefaultSignals(category: string): SignalDefinition[] {
    const categoryMap: Record<string, string[]> = {
      VIDEO: ["linkedin", "hiring", "instagram", "meta_ads", "reviews"],
      DESIGN: ["linkedin", "hiring", "instagram", "meta_ads", "reviews"],
      WEB: ["linkedin", "hiring", "google_ads", "reviews"],
      SAAS: ["linkedin", "hiring", "funding", "google_ads", "reviews"],
      MARKETING: ["linkedin", "hiring", "funding", "meta_ads", "reviews"],
      CONSULTING: ["linkedin", "hiring", "funding", "reviews"],
      OTHER: ["linkedin", "hiring", "reviews"],
    };
    const enabled = categoryMap[category] || categoryMap.OTHER;
    return Object.entries(DEFAULT_SIGNALS).map(([key, def], i) => ({
      ...def,
      id: `s${i}`,
      is_enabled: enabled.includes(key),
    }));
  }

  // ---------------------------------------------------------------------------
  // Auto-populate signals when category changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!serviceCategory && !icp?.service_category) return;
    const cat = serviceCategory || icp?.service_category;
    if (cat) {
      setSignals(buildDefaultSignals(cat));
    }
  }, [serviceCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Save to backend
  // ---------------------------------------------------------------------------
  async function saveToBackend(data: Partial<ICPProfile>) {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch("/api/icp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, service_category: serviceCategory || icp?.service_category }),
      });
      if (res.ok) {
        const saved = await res.json();
        setIcp(saved);
      } else {
        const err = await res.json().catch(() => ({}));
        setToast({ message: err.error || "Failed to save", type: "error" });
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function saveSignals() {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch("/api/icp/signal-definitions/bulk", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signals),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setToast({ message: err.error || "Failed to save signals", type: "error" });
      }
    } catch {
      setToast({ message: "Network error saving signals", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Build payload from current form state
  // ---------------------------------------------------------------------------
  function buildPayload(): Partial<ICPProfile> {
    return {
      service_name: serviceName,
      service_category: serviceCategory || icp?.service_category || "",
      service_description: serviceDescription,
      core_problem_solved: coreProblem,
      primary_deliverable: primaryDeliverable,
      service_format: serviceFormat,
      budget_range: priceRange,
      buyer_role: buyerRoleInput.tags.join(", "),
      buyer_industry: industries,
      buyer_company_size: companySizes,
      buyer_revenue_range: revenueRanges,
      buyer_location: locations,
      problems_expressed: problemsExpressed.tags,
      buying_urgency_signals: urgencySignals,
      decision_maker: decisionMaker,
      signal_definitions: signals,
      is_complete: currentStep === 5,
    };
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  async function goNext() {
    const payload = buildPayload();
    await saveToBackend(payload);
    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function goBack() {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goToStep(n: number) {
    setCurrentStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleComplete() {
    const payload = buildPayload();
    await saveToBackend({ ...payload, is_complete: true });
    await saveSignals();
    // Refresh ICP status so sidebar badge updates
    try {
      const status = await getICPStatus();
      // Store in sessionStorage so layout picks it up without re-mounting
      sessionStorage.setItem("icp_status_complete", String(status.setup_complete));
    } catch { /* noop */ }
    setToast({ message: "ICP setup complete! Starting prospect tracking...", type: "success" });
    setTimeout(() => router.push("/prospects"), 1800);
  }

  // ---------------------------------------------------------------------------
  // Problem suggestions based on category
  // ---------------------------------------------------------------------------
  const problemSuggestions: Record<string, string[]> = {
    VIDEO: ["Not enough content", "Low engagement", "No time to film", "Expensive production", "Inconsistent brand voice"],
    DESIGN: ["Outdated brand", "No visual identity", "Inconsistent graphics", "Need a rebrand", "Cheap looking materials"],
    WEB: ["Slow website", "Not mobile friendly", "Outdated design", "Low conversions", "No SEO"],
    SAAS: ["User churn", "Feature gaps", "Onboarding issues", "Integrations missing", "Scalability problems"],
    MARKETING: ["Not enough leads", "Low ROI", "No brand awareness", "Unclear positioning", "Content bottleneck"],
    CONSULTING: ["Scaling challenges", "Process inefficiencies", "Lack of strategy", "Resource constraints"],
    OTHER: ["Growing pains", "Operational bottlenecks", "Need better systems", "Scaling issues"],
  };

  const catKey = (serviceCategory || icp?.service_category || "OTHER") as keyof typeof problemSuggestions;
  const suggestions = problemSuggestions[catKey] || problemSuggestions.OTHER;

  // ---------------------------------------------------------------------------
  // Render sections
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", border: "2px solid var(--border-default)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--ink-muted)", fontSize: "0.875rem" }}>Loading your ICP profile...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="topbar">
        <h1 className="page-title">ICP Setup Wizard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {saving && (
            <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "12px", border: "1.5px solid var(--border-default)", borderTopColor: "var(--accent)", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              Saving...
            </span>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} onGoTo={goToStep} />

      {/* ── SECTION 1: Your Service ── */}
      {currentStep === 1 && (
        <div className="wizard-section">
          <div className="wizard-section-header">
            <div className="wizard-section-number">01</div>
            <div>
              <h2 className="wizard-section-title">Your Service</h2>
              <p className="wizard-section-desc">Tell us what you offer so we know what signals to look for.</p>
            </div>
          </div>

          <div className="wizard-form">
            {/* Q1: What do you offer? */}
            <div className="form-field">
              <label className="form-label">What do you offer?</label>
              <input
                className="form-input"
                placeholder="e.g., Video editing for brands, CRM consulting..."
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>

            {/* Q2: Category selector */}
            <div className="form-field">
              <label className="form-label">What category best describes your service?</label>
              <div className="category-grid">
                {SERVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setServiceCategory(cat.value)}
                    className={`category-card${serviceCategory === cat.value ? " selected" : ""}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="category-icon">
                      <path d={cat.icon} strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="category-card-label">{cat.label}</div>
                    <div className="category-card-desc">{cat.desc}</div>
                    {serviceCategory === cat.value && (
                      <div className="category-check">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M2.5 7l3 3 6-6"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: Describe service */}
            <div className="form-field">
              <label className="form-label">Describe your service</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="I help [who] who have [problem] by providing [solution]..."
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {/* Q4: Core problem */}
            <div className="form-field">
              <label className="form-label">What problem do you solve?</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="The specific problem clients hire you to fix..."
                value={coreProblem}
                onChange={(e) => setCoreProblem(e.target.value)}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {/* Q5: Primary deliverable */}
            <div className="form-field">
              <label className="form-label">What do you deliver?</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="e.g., 30-second social videos, a complete brand identity..."
                value={primaryDeliverable}
                onChange={(e) => setPrimaryDeliverable(e.target.value)}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {/* Q6: Service format */}
            <div className="form-field">
              <label className="form-label">How do you deliver this service?</label>
              <div className="format-grid">
                {SERVICE_FORMATS.map((fmt) => (
                  <button
                    key={fmt.value}
                    type="button"
                    onClick={() => setServiceFormat(fmt.value)}
                    className={`format-card${serviceFormat === fmt.value ? " selected" : ""}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d={fmt.icon} strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{fmt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Q7: Price range */}
            <div className="form-field">
              <label className="form-label">Typical price range?</label>
              <select
                className="form-input"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                style={{ cursor: "pointer" }}
              >
                <option value="">Select a price range...</option>
                {PRICE_RANGES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="wizard-nav">
              <button type="button" className="btn-primary" onClick={goNext} disabled={saving}>
                Save &amp; Continue
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7h8M8 4l3 3-3 3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 2: Your Ideal Customer ── */}
      {currentStep === 2 && (
        <div className="wizard-section">
          <div className="wizard-section-header">
            <div className="wizard-section-number">02</div>
            <div>
              <h2 className="wizard-section-title">Your Ideal Customer</h2>
              <p className="wizard-section-desc">Define who you sell to so we can find the right prospects.</p>
            </div>
          </div>

          <div className="wizard-form">
            {/* Q1: Buyer role */}
            <div className="form-field">
              <label className="form-label">Who is your buyer?</label>
              <input
                className="form-input"
                placeholder="Marketing Manager, CEO, Founder..."
                value={buyerRoleInput.input}
                onChange={(e) => buyerRoleInput.setInput(e.target.value)}
                onKeyDown={buyerRoleInput.handleKeyDown}
                onBlur={buyerRoleInput.addTag}
              />
              <div style={{ marginTop: "8px" }}>
                {buyerRoleInput.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button type="button" onClick={() => buyerRoleInput.removeTag(tag)} className="chip-remove">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l6 6M8 2l-6 6"/></svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="chip-suggestions">
                {BUYER_ROLES_SUGGESTIONS.filter((s) => !buyerRoleInput.tags.includes(s)).map((s) => (
                  <button key={s} type="button" className="chip-suggestion" onClick={() => buyerRoleInput.setTags([...buyerRoleInput.tags, s])}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <MultiCheckbox
              label="What industries?"
              options={INDUSTRIES}
              selected={industries}
              onChange={setIndustries}
            />

            <MultiCheckbox
              label="Company sizes?"
              options={COMPANY_SIZES}
              selected={companySizes}
              onChange={setCompanySizes}
            />

            <MultiCheckbox
              label="Annual revenue?"
              options={REVENUE_RANGES}
              selected={revenueRanges}
              onChange={setRevenueRanges}
            />

            <MultiCheckbox
              label="Customer locations?"
              options={LOCATIONS}
              selected={locations}
              onChange={setLocations}
            />

            {/* Tools they use */}
            <div className="form-field">
              <label className="form-label">Tools they already use</label>
              <input
                className="form-input"
                placeholder="Type a tool and press Enter or comma..."
                value={toolsUsed.input}
                onChange={(e) => toolsUsed.setInput(e.target.value)}
                onKeyDown={toolsUsed.handleKeyDown}
                onBlur={toolsUsed.addTag}
              />
              <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {toolsUsed.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button type="button" onClick={() => toolsUsed.removeTag(tag)} className="chip-remove">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l6 6M8 2l-6 6"/></svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tools they're unhappy with */}
            <div className="form-field">
              <label className="form-label">Tools they&apos;re unhappy with</label>
              <input
                className="form-input"
                placeholder="Type a tool and press Enter or comma..."
                value={toolsUnhappy.input}
                onChange={(e) => toolsUnhappy.setInput(e.target.value)}
                onKeyDown={toolsUnhappy.handleKeyDown}
                onBlur={toolsUnhappy.addTag}
              />
              <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {toolsUnhappy.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button type="button" onClick={() => toolsUnhappy.removeTag(tag)} className="chip-remove">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l6 6M8 2l-6 6"/></svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="wizard-nav">
              <button type="button" className="btn-secondary" onClick={goBack}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 7H3M6 4l-3 3 3 3"/>
                </svg>
                Back
              </button>
              <button type="button" className="btn-primary" onClick={goNext} disabled={saving}>
                Save &amp; Continue
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7h8M8 4l3 3-3 3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 3: What Signals "They Need You" ── */}
      {currentStep === 3 && (
        <div className="wizard-section">
          <div className="wizard-section-header">
            <div className="wizard-section-number">03</div>
            <div>
              <h2 className="wizard-section-title">What Signals &quot;They Need You&quot;</h2>
              <p className="wizard-section-desc">What events and behaviors tell you a prospect is ready to buy?</p>
            </div>
          </div>

          <div className="wizard-form">
            {/* Q1: Problems they complain about */}
            <div className="form-field">
              <label className="form-label">What problems do they complain about?</label>
              <input
                className="form-input"
                placeholder="Type a problem and press Enter or comma..."
                value={problemsExpressed.input}
                onChange={(e) => problemsExpressed.setInput(e.target.value)}
                onKeyDown={problemsExpressed.handleKeyDown}
                onBlur={problemsExpressed.addTag}
              />
              <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {problemsExpressed.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button type="button" onClick={() => problemsExpressed.removeTag(tag)} className="chip-remove">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l6 6M8 2l-6 6"/></svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="chip-suggestions">
                {suggestions.filter((s) => !problemsExpressed.tags.includes(s)).slice(0, 5).map((s) => (
                  <button key={s} type="button" className="chip-suggestion" onClick={() => problemsExpressed.setTags([...problemsExpressed.tags, s])}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: Frustration display */}
            <div className="form-field">
              <label className="form-label">How do they show frustration?</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Describe what frustrated customers look like or say — their exact words, behaviors, or complaints..."
                value={frustrationDisplay}
                onChange={(e) => setFrustrationDisplay(e.target.value)}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {/* Q3: Urgency signals */}
            <div className="form-field">
              <label className="form-label">What events trigger urgency?</label>
              <div className="urgency-grid">
                {URGENCY_SIGNALS.map((sig) => (
                  <label key={sig.value} className={`urgency-card${urgencySignals.includes(sig.value) ? " checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={urgencySignals.includes(sig.value)}
                      onChange={() => {
                        if (urgencySignals.includes(sig.value)) {
                          setUrgencySignals(urgencySignals.filter((v) => v !== sig.value));
                        } else {
                          setUrgencySignals([...urgencySignals, sig.value]);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                    <span className="urgency-label">{sig.label}</span>
                    {urgencySignals.includes(sig.value) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" className="urgency-check">
                        <path d="M2 6l3 3 5-5"/>
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Q4: Decision maker */}
            <div className="form-field">
              <label className="form-label">Who decides?</label>
              <div className="decision-grid">
                {DECISION_MAKERS.map((dm) => (
                  <label key={dm} className={`radio-card${decisionMaker === dm ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="decision_maker"
                      checked={decisionMaker === dm}
                      onChange={() => setDecisionMaker(dm)}
                      style={{ display: "none" }}
                    />
                    <span>{dm}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q5: Timeline */}
            <div className="form-field">
              <label className="form-label">Typical buying timeline</label>
              <div className="timeline-grid">
                {TIMELINES.map((tl) => (
                  <label key={tl.value} className={`radio-card${timeline === tl.value ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="timeline"
                      checked={timeline === tl.value}
                      onChange={() => setTimeline(tl.value)}
                      style={{ display: "none" }}
                    />
                    <span className="timeline-label">{tl.label}</span>
                    <span className="timeline-desc">{tl.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="wizard-nav">
              <button type="button" className="btn-secondary" onClick={goBack}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 7H3M6 4l-3 3 3 3"/>
                </svg>
                Back
              </button>
              <button type="button" className="btn-primary" onClick={goNext} disabled={saving}>
                Save &amp; Continue
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7h8M8 4l3 3-3 3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 4: Signal Sources ── */}
      {currentStep === 4 && (
        <div className="wizard-section">
          <div className="wizard-section-header">
            <div className="wizard-section-number">04</div>
            <div>
              <h2 className="wizard-section-title">Signal Sources</h2>
              <p className="wizard-section-desc">
                Keywords and settings for each signal source. Auto-populated based on your service category.
                {serviceCategory && <span style={{ color: "var(--accent)", fontWeight: 600 }}> ({SERVICE_CATEGORIES.find((c) => c.value === serviceCategory)?.label})</span>}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="stat-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              {signals.filter((s) => s.is_enabled).length} sources active
            </div>
            <div className="stat-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 7h10M7 12h7M7 17h4"/>
              </svg>
              {totalKeywords} keywords
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {signals.map((signal) => (
              <SignalCard
                key={signal.id || signal.signal_type}
                signal={signal}
                onChange={(updated) => setSignals(signals.map((s) => (s.id === updated.id ? updated : s)))}
                onReset={() => {
                  const defaultDef = DEFAULT_SIGNALS[signal.signal_type];
                  if (defaultDef) {
                    setSignals(signals.map((s) =>
                      s.signal_type === signal.signal_type ? { ...s, ...defaultDef } : s
                    ));
                  }
                }}
              />
            ))}
          </div>

          <div className="wizard-nav" style={{ marginTop: "24px" }}>
            <button type="button" className="btn-secondary" onClick={goBack}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 7H3M6 4l-3 3 3 3"/>
              </svg>
              Back
            </button>
            <button type="button" className="btn-primary" onClick={goNext} disabled={saving}>
              Save &amp; Continue
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h8M8 4l3 3-3 3"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION 5: Review & Launch ── */}
      {currentStep === 5 && (
        <div className="wizard-section">
          <div className="wizard-section-header">
            <div className="wizard-section-number">05</div>
            <div>
              <h2 className="wizard-section-title">Review &amp; Launch</h2>
              <p className="wizard-section-desc">Confirm your ICP and start tracking prospects.</p>
            </div>
          </div>

          <div className="wizard-form">
            {/* Summary cards */}
            <div className="review-grid">
              <div className="review-card">
                <div className="review-card-header">
                  <div className="review-card-title">Service</div>
                  <button type="button" className="review-edit-btn" onClick={() => goToStep(1)}>Edit</button>
                </div>
                <div className="review-service-name">{serviceName || icp?.service_name || "Not set"}</div>
                {serviceCategory && (
                  <div className="review-badge">{SERVICE_CATEGORIES.find((c) => c.value === serviceCategory)?.label || serviceCategory}</div>
                )}
                {serviceFormat && (
                  <div style={{ marginTop: "6px", fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                    {SERVICE_FORMATS.find((f) => f.value === serviceFormat)?.label || serviceFormat}
                  </div>
                )}
              </div>

              <div className="review-card">
                <div className="review-card-header">
                  <div className="review-card-title">Customer Profile</div>
                  <button type="button" className="review-edit-btn" onClick={() => goToStep(2)}>Edit</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {buyerRoleInput.tags.length > 0 && (
                    <div className="review-row">
                      <span className="review-label">Buyers</span>
                      <span className="review-value">{buyerRoleInput.tags.join(", ")}</span>
                    </div>
                  )}
                  {industries.length > 0 && (
                    <div className="review-row">
                      <span className="review-label">Industries</span>
                      <span className="review-value">{industries.length} selected</span>
                    </div>
                  )}
                  {companySizes.length > 0 && (
                    <div className="review-row">
                      <span className="review-label">Size</span>
                      <span className="review-value">{companySizes.join(", ")}</span>
                    </div>
                  )}
                  {locations.length > 0 && (
                    <div className="review-row">
                      <span className="review-label">Locations</span>
                      <span className="review-value">{locations.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="review-card">
                <div className="review-card-header">
                  <div className="review-card-title">Trigger Signals</div>
                  <button type="button" className="review-edit-btn" onClick={() => goToStep(3)}>Edit</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {urgencySignals.length > 0 && (
                    <div className="review-row">
                      <span className="review-label">Urgency</span>
                      <span className="review-value">{urgencySignals.length} triggers</span>
                    </div>
                  )}
                  {decisionMaker && (
                    <div className="review-row">
                      <span className="review-label">Decision</span>
                      <span className="review-value">{decisionMaker}</span>
                    </div>
                  )}
                  {timeline && (
                    <div className="review-row">
                      <span className="review-label">Timeline</span>
                      <span className="review-value">{TIMELINES.find((t) => t.value === timeline)?.label || timeline}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="review-card">
                <div className="review-card-header">
                  <div className="review-card-title">Signal Sources</div>
                  <button type="button" className="review-edit-btn" onClick={() => goToStep(4)}>Edit</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div className="review-row">
                    <span className="review-label">Active sources</span>
                    <span className="review-value" style={{ color: enabledSignals.length > 0 ? "var(--accent)" : "var(--ink-muted)" }}>
                      {enabledSignals.length} of {signals.length}
                    </span>
                  </div>
                  <div className="review-row">
                    <span className="review-label">Keywords</span>
                    <span className="review-value">{totalKeywords}</span>
                  </div>
                  {problemsExpressed.tags.length > 0 && (
                    <div className="review-row">
                      <span className="review-label">Pain keywords</span>
                      <span className="review-value">{problemsExpressed.tags.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alert preferences */}
            <div className="review-card" style={{ gridColumn: "1 / -1" }}>
              <div className="review-card-title" style={{ marginBottom: "16px" }}>Alert Preferences</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label className={`alert-toggle${alertHot ? " active" : ""}`}>
                  <input type="checkbox" checked={alertHot} onChange={(e) => setAlertHot(e.target.checked)} style={{ display: "none" }} />
                  <div className="alert-toggle-body">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--ink-primary)" }}>Hot prospect alerts</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--ink-muted)" }}>Get notified when a prospect hits Hot tier</div>
                    </div>
                    <div className="alert-dot" style={{ background: alertHot ? "var(--accent)" : "var(--border-emphasis)" }} />
                  </div>
                </label>
                <label className={`alert-toggle${alertDigest ? " active" : ""}`}>
                  <input type="checkbox" checked={alertDigest} onChange={(e) => setAlertDigest(e.target.checked)} style={{ display: "none" }} />
                  <div className="alert-toggle-body">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--ink-primary)" }}>Daily digest</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--ink-muted)" }}>Receive a morning summary of all prospect activity</div>
                    </div>
                    <div className="alert-dot" style={{ background: alertDigest ? "var(--accent)" : "var(--border-emphasis)" }} />
                  </div>
                </label>
              </div>
            </div>

            <div className="wizard-nav">
              <button type="button" className="btn-secondary" onClick={goBack}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 7H3M6 4l-3 3 3 3"/>
                </svg>
                Back
              </button>
              <button
                type="button"
                className="btn-launch"
                onClick={handleComplete}
                disabled={saving}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                {saving ? "Saving..." : "Start Tracking Prospects"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* Wizard styles — scoped */}
      <style>{`
        /* Step indicator */
        .step-indicator {
          display: flex;
          align-items: center;
          margin-bottom: 32px;
          padding: 20px 24px;
          background: var(--surface-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          overflow-x: auto;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          transition: all 150ms ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .step-item:disabled { cursor: default; }
        .step-item:not(:disabled):hover { background: var(--surface-inset); }
        .step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid var(--border-emphasis);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--ink-muted);
          transition: all 200ms ease;
          flex-shrink: 0;
        }
        .step-item.active .step-circle {
          border-color: var(--accent);
          background: var(--accent-muted);
          color: var(--accent);
        }
        .step-item.done .step-circle {
          border-color: var(--accent);
          background: var(--accent);
          color: #fff;
        }
        .step-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--ink-muted);
          transition: color 150ms;
        }
        .step-item.active .step-label { color: var(--ink-primary); font-weight: 600; }
        .step-item.done .step-label { color: var(--ink-secondary); }
        .step-connector {
          width: 24px;
          height: 2px;
          background: var(--border-emphasis);
          flex-shrink: 0;
          margin: 0 4px;
          transition: background 200ms;
        }
        .step-connector.done { background: var(--accent); }

        /* Wizard sections */
        .wizard-section {
          animation: fadeIn 300ms ease forwards;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .wizard-section-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 32px;
        }
        .wizard-section-number {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 3rem;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, #F59E0B 0%, #FFB800 40%, #FCD34D 60%, #F59E0B 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          flex-shrink: 0;
          opacity: 0.4;
        }
        .wizard-section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2rem;
          font-weight: 600;
          color: var(--ink-primary);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .wizard-section-desc {
          font-size: 0.9rem;
          color: var(--ink-secondary);
          line-height: 1.5;
        }

        .wizard-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Category grid */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .category-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          padding: 16px;
          background: var(--surface-card);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 200ms ease;
          text-align: left;
        }
        .category-card:hover {
          border-color: var(--border-emphasis);
          background: var(--surface-elevated);
          transform: translateY(-1px);
        }
        .category-card.selected {
          border-color: var(--accent);
          background: var(--accent-muted);
          box-shadow: 0 0 0 1px var(--accent);
        }
        .category-icon {
          color: var(--ink-tertiary);
          margin-bottom: 4px;
        }
        .category-card.selected .category-icon { color: var(--accent); }
        .category-card-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--ink-primary);
          line-height: 1.3;
        }
        .category-card-desc {
          font-size: 0.72rem;
          color: var(--ink-muted);
          line-height: 1.4;
        }
        .category-check {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Format grid */
        .format-grid {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .format-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--surface-card);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 150ms ease;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--ink-secondary);
        }
        .format-card:hover { border-color: var(--border-emphasis); color: var(--ink-primary); }
        .format-card.selected { border-color: var(--accent); background: var(--accent-muted); color: var(--accent); }

        /* Checkbox grid */
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 8px;
        }
        .checkbox-card {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: var(--surface-card);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 150ms ease;
        }
        .checkbox-card:hover { border-color: var(--border-emphasis); }
        .checkbox-card.checked { border-color: var(--accent); background: var(--accent-muted); }
        .checkbox-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--ink-secondary);
          line-height: 1.3;
        }
        .checkbox-card.checked .checkbox-label { color: var(--accent); }

        /* Tag chips */
        .tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: var(--surface-elevated);
          border: 1px solid var(--border-default);
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--ink-secondary);
          margin-right: 4px;
          margin-bottom: 4px;
        }
        .chip-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--ink-muted);
          padding: 0;
          line-height: 1;
          transition: color 150ms;
        }
        .chip-remove:hover { color: var(--danger); }

        .chip-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }
        .chip-suggestion {
          padding: 4px 10px;
          background: none;
          border: 1px dashed var(--border-emphasis);
          border-radius: 9999px;
          font-size: 0.75rem;
          color: var(--ink-muted);
          cursor: pointer;
          transition: all 150ms ease;
        }
        .chip-suggestion:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-muted); }

        /* Urgency grid */
        .urgency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 8px;
        }
        .urgency-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--surface-card);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 150ms ease;
        }
        .urgency-card:hover { border-color: var(--border-emphasis); }
        .urgency-card.checked { border-color: var(--warm); background: var(--warm-muted); }
        .urgency-label { font-size: 0.8rem; font-weight: 500; color: var(--ink-secondary); }
        .urgency-card.checked .urgency-label { color: var(--warm); }
        .urgency-check { color: var(--warm); flex-shrink: 0; }

        /* Decision / timeline grids */
        .decision-grid, .timeline-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .radio-card {
          display: flex;
          flex-direction: column;
          padding: 12px 16px;
          background: var(--surface-card);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 150ms ease;
          gap: 2px;
        }
        .radio-card:hover { border-color: var(--border-emphasis); }
        .radio-card.selected { border-color: var(--accent); background: var(--accent-muted); }
        .radio-card span:first-child { font-size: 0.875rem; font-weight: 600; color: var(--ink-secondary); }
        .radio-card.selected span:first-child { color: var(--accent); }
        .timeline-label { font-size: 0.875rem !important; font-weight: 600 !important; }
        .timeline-desc { font-size: 0.75rem !important; color: var(--ink-muted) !important; }
        .radio-card.selected .timeline-desc { color: var(--accent) !important; opacity: 0.7; }

        /* Signal cards */
        .signal-card {
          background: var(--surface-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all 200ms ease;
        }
        .signal-card.enabled { border-color: rgba(245,158,11,0.2); }
        .signal-card.disabled { opacity: 0.6; }
        .signal-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .signal-card-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .signal-settings-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .signal-setting {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .signal-setting-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--ink-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .signal-select {
          padding: 6px 10px;
          background: var(--surface-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          color: var(--ink-primary);
          cursor: pointer;
          outline: none;
        }
        .signal-select:focus { border-color: var(--accent); }
        .signal-number {
          width: 60px;
          padding: 6px 8px;
          background: var(--surface-elevated);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          color: var(--ink-primary);
          outline: none;
        }
        .signal-number:focus { border-color: var(--accent); }

        /* Toggle switch */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
          flex-shrink: 0;
        }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: var(--border-emphasis);
          border-radius: 11px;
          transition: 200ms;
        }
        .toggle-slider::before {
          content: "";
          position: absolute;
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 200ms;
        }
        .toggle-switch input:checked + .toggle-slider { background: var(--accent); }
        .toggle-switch input:checked + .toggle-slider::before { transform: translateX(18px); }

        /* Keyword chips */
        .keyword-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          background: var(--surface-elevated);
          border: 1px solid var(--border-default);
          border-radius: 9999px;
          font-size: 0.72rem;
          color: var(--ink-secondary);
        }
        .chip-input {
          font-size: 0.8rem !important;
          padding: 5px 10px !important;
          flex: 1;
          min-width: 120px;
        }

        /* Review section */
        .review-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .review-grid { grid-template-columns: 1fr; }
        }
        .review-card {
          background: var(--surface-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 20px;
        }
        .review-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .review-card-title {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--ink-muted);
        }
        .review-edit-btn {
          font-size: 0.72rem;
          color: var(--accent);
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: opacity 150ms;
        }
        .review-edit-btn:hover { opacity: 0.7; }
        .review-service-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--ink-primary);
          margin-bottom: 6px;
        }
        .review-badge {
          display: inline-block;
          padding: 3px 10px;
          background: var(--accent-muted);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--accent);
        }
        .review-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid var(--border-subtle);
          gap: 8px;
        }
        .review-row:last-child { border-bottom: none; }
        .review-label {
          font-size: 0.78rem;
          color: var(--ink-muted);
          flex-shrink: 0;
        }
        .review-value {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--ink-secondary);
          text-align: right;
        }

        /* Alert toggles */
        .alert-toggle {
          display: block;
          cursor: pointer;
        }
        .alert-toggle-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: var(--surface-card);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-md);
          transition: all 150ms ease;
        }
        .alert-toggle:hover .alert-toggle-body { border-color: var(--border-emphasis); }
        .alert-toggle.active .alert-toggle-body { border-color: var(--accent); background: var(--accent-muted); }
        .alert-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background 200ms;
        }

        /* Launch button */
        .btn-launch {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #F59E0B 0%, #FFB800 40%, #FCD34D 60%, #F59E0B 100%);
          color: #0a0800;
          border: none;
          border-radius: var(--radius-lg);
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 20px rgba(245,158,11,0.4);
          letter-spacing: 0.02em;
        }
        .btn-launch:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 30px rgba(245,158,11,0.5);
        }
        .btn-launch:active:not(:disabled) { transform: scale(1.01); }
        .btn-launch:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Nav */
        .wizard-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid var(--border-subtle);
        }

        /* Stat chip */
        .stat-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: var(--surface-card);
          border: 1px solid var(--border-default);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--ink-secondary);
        }

        /* Toast */
        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: var(--radius-lg);
          font-size: 0.85rem;
          font-weight: 600;
          z-index: 9999;
          animation: slideUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .toast-success {
          background: var(--success);
          color: #fff;
        }
        .toast-error {
          background: var(--danger);
          color: #fff;
        }

        @media (max-width: 640px) {
          .category-grid { grid-template-columns: 1fr 1fr; }
          .step-label { display: none; }
          .wizard-section-number { font-size: 2rem; }
          .urgency-grid { grid-template-columns: 1fr 1fr; }
          .checkbox-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
