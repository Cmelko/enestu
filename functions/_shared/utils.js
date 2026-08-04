/** Shared helpers for Enestu Pages Functions */

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

export function corsHeaders(env, request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = env.ALLOWED_ORIGIN || "*";
  let allow = allowed;
  if (allowed !== "*") {
    const list = allowed.split(",").map((s) => s.trim());
    allow = list.includes(origin) ? origin : list[0];
  }
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleOptions(env, request) {
  return new Response(null, { status: 204, headers: corsHeaders(env, request) });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function isEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function clean(value, max = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function clientIp(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function uid(prefix = "id") {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

/**
 * Simple sliding rate limit via KV. Returns true if allowed.
 */
export async function rateLimit(env, key, limit = 8, windowSeconds = 3600) {
  if (!env.RATE_LIMIT) return true;
  const now = Math.floor(Date.now() / 1000);
  const raw = await env.RATE_LIMIT.get(key);
  let bucket = { count: 0, reset: now + windowSeconds };
  if (raw) {
    try {
      bucket = JSON.parse(raw);
    } catch {
      /* reset */
    }
  }
  if (now > bucket.reset) {
    bucket = { count: 0, reset: now + windowSeconds };
  }
  bucket.count += 1;
  await env.RATE_LIMIT.put(key, JSON.stringify(bucket), {
    expirationTtl: Math.max(60, bucket.reset - now + 10),
  });
  return bucket.count <= limit;
}

export async function sendResend(env, { to, subject, html, replyTo }) {
  const key = (env.RESEND_API_KEY || "").trim();
  if (!key) {
    console.log("[dev] Resend skipped:", { to, subject });
    return { ok: true, id: "dev-skip", skipped: true };
  }
  const from = env.FROM_EMAIL || "Enestu <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: replyTo,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Resend error", data);
    return { ok: false, error: data };
  }
  return { ok: true, id: data.id };
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function stripeRequest(env, path, { method = "POST", body } = {}) {
  const key = (env.STRIPE_SECRET_KEY || "").trim();
  if (!key) {
    return { ok: false, status: 503, data: { error: "Stripe is not configured" } };
  }
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function priceIdFor(env, plan, billing) {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${billing.toUpperCase()}`;
  return env[key] || null;
}
