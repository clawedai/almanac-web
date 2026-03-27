/**
 * Shared TypeScript interfaces — single source of truth for all frontend components.
 * Replaces 3 duplicate interface definitions across brief/page.tsx, prospects/page.tsx, and prospects/[id]/page.tsx.
 */

// ---------- Intent Score ---------------------------------------------

export interface IntentScore {
  score: number;
  tier: "hot" | "warm" | "cold";
  score_breakdown: Record<string, number>;
  funding_signal?: boolean;
  hiring_signal?: boolean;
  review_signal?: boolean;
  linkedin_signal?: boolean;
  technographic_signal?: boolean;
  website_visit_signal?: boolean;
  last_updated_at?: string;
}

export type IntentTier = "hot" | "warm" | "cold";

// ---------- Pain Points ----------------------------------------------

export interface PainPoint {
  id: string;
  prospect_id: string;
  pain_category: string;
  pain_description: string;
  tools_mentioned: string[];
  goals_expressed: string[];
  sentiment: "positive" | "neutral" | "frustrated" | "negative";
  confidence_score: number;
  extracted_at: string;
}

// ---------- LinkedIn Posts -------------------------------------------

export interface LinkedInPost {
  id: string;
  prospect_id: string;
  post_text: string;
  engagement_likes: number;
  engagement_comments: number;
  engagement_shares: number;
  posted_at: string;
}

// ---------- Draft Email -----------------------------------------------

export interface DraftEmail {
  id: string;
  subject_line: string;
  first_line: string;
  full_email_body?: string;
  signal_context?: string;
  approved: boolean;
  sent: boolean;
  created_at: string;
}

// ---------- Prospect --------------------------------------------------

export interface Prospect {
  id: string;
  full_name: string;
  first_name: string;
  company: string;
  title: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  company_domain?: string;
  instagram_handle?: string;
  twitter_handle?: string;
  notes?: string;
  prospect_type?: string;
  intent_score: IntentScore | null;
  score_description?: string;
  pain_points?: PainPoint[];
  draft_email?: Pick<DraftEmail, "first_line" | "subject_line">;
  created_at: string;
  last_enriched_at?: string | null;
  signals?: {
    intent_scores?: IntentScore;
    linkedin_posts?: LinkedInPost[];
    pain_points?: PainPoint[];
    draft_emails?: DraftEmail[];
    funding_signals?: FundingSignal[];
    technographics?: Technographic[];
    review_signals?: ReviewSignal[];
  };
}

// ---------- Funding Signals -----------------------------------------

export interface FundingSignal {
  id: string;
  prospect_id: string;
  company_name: string;
  funding_amount: string;
  funding_stage: string;
  announced_date?: string;
  intent_score_boost?: number;
  created_at: string;
}

// ---------- Technographics ---------------------------------------

export interface Technographic {
  id: string;
  prospect_id: string;
  company_domain: string;
  tool_name: string;
  tool_category: string;
  is_competitor_tool?: boolean;
  created_at: string;
}

// ---------- Review Signals --------------------------------------

export interface ReviewSignal {
  id: string;
  prospect_id: string;
  competitor_name: string;
  review_platform: string;
  rating: number;
  review_text: string;
  switching_intent: boolean;
  pain_mentioned: string;
  created_at: string;
}

// ---------- Meta Ad ---------------------------------------------

export interface MetaAd {
  id: string;
  ad_id: string;
  page_id?: string;
  ad_creative_body?: string;
  ad_creative_link?: string;
  ad_snapshot_url?: string;
  ad_status: string;
  ad_delivery_start?: string;
  ad_delivery_end?: string;
  is_lead_gen: boolean;
  is_brand_awareness: boolean;
  is_conversion: boolean;
}

export interface MetaAdSignals {
  id: string;
  company_domain: string;
  company_name: string;
  fb_page_id?: string;
  fb_page_url?: string;
  is_advertiser: boolean;
  ad_count: number;
  meta_ad_intensity: number;
  meta_ad_lead_gen: boolean;
  meta_ad_recency: number;
  meta_ad_active: boolean;
  fetched_at?: string;
  first_seen_at?: string;
  last_seen_at?: string;
  ads: MetaAd[];
}

// ---------- Google Ads -----------------------------------------

export interface GoogleAdsSignals {
  id: string;
  company_domain: string;
  company_name: string;
  is_advertiser: boolean;
  ad_count: number;
  campaigns_found: number;
  keywords_found: number;
  keyword_themes: string[];
  high_intent_keywords: number;
  google_ad_intensity: number;
  google_ad_keyword_themes: number;
  google_ad_recency: number;
  google_ad_active: boolean;
  first_seen_at?: string;
  last_seen_at?: string;
  fetched_at?: string;
}

// ---------- Reddit Signals -----------------------------------------

export interface RedditAdSignals {
  id: string;
  company_domain: string;
  company_name: string;
  is_advertiser: boolean;
  ad_count: number;
  promoted_posts_found: number;
  first_seen_at?: string;
  last_seen_at?: string;
  fetched_at?: string;
}

export interface RedditOrganicSignals {
  id: string;
  company_domain: string;
  company_name: string;
  mention_count: number;
  sentiment_score: number;
  sentiment_label: "positive" | "negative" | "neutral";
  positive_mentions: number;
  negative_mentions: number;
  subreddit_count: number;
  total_upvotes: number;
  total_comments: number;
  reddit_intensity: number;
  reddit_organic_active: boolean;
  last_post_at?: string;
  fetched_at?: string;
}

// ---------- Instagram Signals -----------------------------------------

export interface InstagramSignals {
  id?: string;
  user_id?: string;
  prospect_id?: string;
  instagram_handle: string;
  is_active: boolean;
  followers: number;
  following: number;
  posts: number;
  instagram_intensity: number;
  instagram_active_score: number;
  engagement_rate: number;
  posting_frequency: number;
  follower_growth: number;
  hashtag_themes: string[];
  posts_analyzed: number;
  url?: string;
  fetched_at?: string;
  scraped_at?: string;
  refreshed?: boolean;
  error?: string;
}

// ---------- Alert Notifications -----------------------------------------

export interface Alert {
  id: string;
  user_id: string;
  prospect_id: string;
  prospect_name: string;
  company: string;
  type: "score_spike" | "tier_change";
  title: string;
  message: string;
  payload: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// ---------- LinkedIn Session -----------------------------------------

export interface LinkedInStatus {
  logged_in: boolean;
  username?: string;
  last_used_at?: string;
  is_valid?: boolean;
}

// ---------- API Responses --------------------------------------------

export interface ApiError {
  error: string;
  detail?: string;
}
