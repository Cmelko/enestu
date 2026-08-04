import { json, uid } from "../_shared/utils.js";

/**
 * Stripe webhook — verifies signature when STRIPE_WEBHOOK_SECRET is set.
 * Updates subscriptions table in D1.
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  const payload = await request.text();
  const sig = request.headers.get("Stripe-Signature") || "";

  let event;
  try {
    if (env.STRIPE_WEBHOOK_SECRET) {
      event = await verifyStripeSignature(payload, sig, env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(payload);
      console.warn("[dev] Stripe webhook signature skipped");
    }
  } catch (err) {
    console.error("Webhook verify failed", err);
    return json({ ok: false, error: "Invalid signature" }, 400);
  }

  const type = event.type;
  const obj = event.data?.object;

  if (
    type === "customer.subscription.created" ||
    type === "customer.subscription.updated" ||
    type === "customer.subscription.deleted" ||
    type === "checkout.session.completed"
  ) {
    await upsertSubscription(env, type, obj);
  }

  return json({ ok: true, received: true });
}

async function upsertSubscription(env, type, obj) {
  if (!env.DB || !obj) return;

  let stripeSubscriptionId = obj.id;
  let stripeCustomerId = typeof obj.customer === "string" ? obj.customer : obj.customer?.id;
  let email = obj.customer_details?.email || obj.customer_email || null;
  let status = obj.status || "unknown";
  let plan = obj.metadata?.plan || null;
  let billing = obj.metadata?.billing || null;

  if (type === "checkout.session.completed") {
    stripeSubscriptionId = obj.subscription || `cs_${obj.id}`;
    status = obj.status || "complete";
    plan = obj.metadata?.plan || plan;
    billing = obj.metadata?.billing || billing;
  }

  if (type.startsWith("customer.subscription.")) {
    plan = obj.metadata?.plan || plan;
    billing = obj.metadata?.billing || billing;
  }

  const id = uid("sub");
  const existing = await env.DB.prepare(
    `SELECT id FROM subscriptions WHERE stripe_subscription_id = ?`
  )
    .bind(String(stripeSubscriptionId))
    .first();

  if (existing?.id) {
    await env.DB.prepare(
      `UPDATE subscriptions
       SET stripe_customer_id = ?, email = COALESCE(?, email), plan = COALESCE(?, plan),
           billing = COALESCE(?, billing), status = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(stripeCustomerId || null, email, plan, billing, status, existing.id)
      .run();
  } else {
    await env.DB.prepare(
      `INSERT INTO subscriptions
        (id, stripe_customer_id, stripe_subscription_id, email, plan, billing, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        stripeCustomerId || null,
        String(stripeSubscriptionId),
        email,
        plan,
        billing,
        status
      )
      .run();
  }
}

async function verifyStripeSignature(payload, header, secret) {
  // Stripe-Signature: t=timestamp,v1=signature
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), v];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) throw new Error("Missing signature parts");

  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (age > 300 || age < -30) throw new Error("Timestamp outside tolerance");

  const signed = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");

  if (!timingSafeEqual(hex, signature)) throw new Error("Signature mismatch");
  return JSON.parse(payload);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
