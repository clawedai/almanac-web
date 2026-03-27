/**
 * Shared API utilities — eliminates token extraction duplication across all pages.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9001";

// ---------- token extraction -----------------------------------------

/**
 * Extract JWT from document.cookie (client-side).
 * Use in "use client" components.
 */
export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Extract JWT from a Next.js Request (server-side / API routes).
 */
export function getTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Common fetch options for authenticated requests.
 */
function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ---------- base fetch ------------------------------------------------

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const token = options.token ?? getToken();
  if (!token) throw new Error("Unauthorized: no token");

  const url = path.startsWith("http") ? path : `${API_URL}/api/v1${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(token),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return {} as T;
  return response.json() as Promise<T>;
}

// ---------- Meta Ads -------------------------------------------------

export async function getMetaAdSignals(companyDomain: string): Promise<import("./types").MetaAdSignals | null> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/meta-ads/signals/${encodeURIComponent(companyDomain)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function refreshMetaAdSignals(companyDomain: string, companyName: string): Promise<import("./types").MetaAdSignals> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/meta-ads/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ company_domain: companyDomain, company_name: companyName }),
  });
  if (!res.ok) throw new Error("Failed to refresh Meta ad signals");
  return res.json();
}

export async function searchMetaAds(companyName: string, companyDomain?: string): Promise<import("./types").MetaAdSignals> {
  const token = getToken();
  const params = new URLSearchParams({ company_name: companyName });
  if (companyDomain) params.append("company_domain", companyDomain);
  const res = await fetch(`${API_URL}/api/v1/meta-ads/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to search Meta ads");
  return res.json();
}

// ---------- Google Ads ------------------------------------------------

export async function getGoogleAdsSignals(companyDomain: string): Promise<import("./types").GoogleAdsSignals | null> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/google-ads/signals/${encodeURIComponent(companyDomain)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function refreshGoogleAdsSignals(companyDomain: string, companyName: string): Promise<import("./types").GoogleAdsSignals> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/google-ads/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ company_domain: companyDomain, company_name: companyName }),
  });
  if (!res.ok) throw new Error("Failed to refresh Google Ads signals");
  return res.json();
}

export async function searchGoogleAds(companyName: string, companyDomain?: string): Promise<import("./types").GoogleAdsSignals> {
  const token = getToken();
  const params = new URLSearchParams({ company_name: companyName });
  if (companyDomain) params.append("company_domain", companyDomain);
  const res = await fetch(`${API_URL}/api/v1/google-ads/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to search Google Ads");
  return res.json();
}

// ---------- Reddit Ads ------------------------------------------------

export async function getRedditAdSignals(companyDomain: string): Promise<import("./types").RedditAdSignals | null> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/reddit/ads/${encodeURIComponent(companyDomain)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getRedditOrganicSignals(companyDomain: string): Promise<import("./types").RedditOrganicSignals | null> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/reddit/organic/${encodeURIComponent(companyDomain)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function refreshRedditSignals(companyDomain: string, companyName: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/reddit/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ company_domain: companyDomain, company_name: companyName }),
  });
  if (!res.ok) throw new Error("Failed to refresh Reddit signals");
}

// ---------- Instagram ------------------------------------------------

export async function getInstagramSignals(instagramHandle: string): Promise<import("./types").InstagramSignals | null> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/instagram/signals/${encodeURIComponent(instagramHandle)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function refreshInstagramSignals(
  prospectId: string,
  instagramHandle: string,
): Promise<import("./types").InstagramSignals> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/instagram/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prospect_id: prospectId, instagram_handle: instagramHandle }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to refresh Instagram signals" }));
    throw new Error(err.detail || "Failed to refresh Instagram signals");
  }
  return res.json();
}

// ---------- Notification Alerts -----------------------------------------

export async function getNotificationAlerts(limit = 20): Promise<import("./types").Alert[]> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/alerts/notification-alerts?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getUnreadAlertCount(): Promise<number> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/alerts/notification-alerts/count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count || 0;
}

export async function markAlertRead(alertId: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/alerts/notification-alerts/${alertId}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to mark alert ${alertId} as read`);
  }
}

export async function markAllAlertsRead(): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/v1/alerts/notification-alerts/read-all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to mark all alerts as read");
  }
}

// ---------- convenience methods ---------------------------------------

export async function apiGet<T = unknown>(path: string, token?: string | null): Promise<T> {
  return apiFetch<T>(path, { method: "GET", token });
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    token,
  });
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
    token,
  });
}

export async function apiDelete<T = unknown>(
  path: string,
  token?: string | null,
): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE", token });
}
