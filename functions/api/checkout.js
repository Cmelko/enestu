import {
  clean,
  corsHeaders,
  handleOptions,
  isEmail,
  json,
  priceIdFor,
  readJson,
  stripeRequest,
} from "../_shared/utils.js";

const PLANS = new Set(["starter", "standard", "premium"]);
const BILLINGS = new Set(["monthly", "yearly"]);

export async function onRequestOptions(context) {
  return handleOptions(context.env, context.request);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = corsHeaders(env, request);
  const body = await readJson(request);
  if (!body) {
    return json({ ok: false, error: "Invalid JSON" }, 400, headers);
  }

  const plan = clean(body.plan || "standard", 40).toLowerCase();
  const billing = clean(body.billing || "monthly", 20).toLowerCase();
  const email = clean(body.email || "", 200).toLowerCase();

  if (!PLANS.has(plan) || !BILLINGS.has(billing)) {
    return json({ ok: false, error: "Neplatný tarif." }, 400, headers);
  }

  const priceId = priceIdFor(env, plan, billing);
  const site = (env.PUBLIC_SITE_URL || "").replace(/\/$/, "");

  // Dev / not configured: redirect to thank-you with query so UI still works
  if (!(env.STRIPE_SECRET_KEY || "").trim() || !priceId) {
    const url = `${site || ""}/dekujeme.html?plan=${encodeURIComponent(plan)}&billing=${encodeURIComponent(billing)}&demo=1`;
    return json(
      {
        ok: true,
        demo: true,
        url,
        message:
          "Stripe není nakonfigurovaný. Nastavte STRIPE_SECRET_KEY a price IDs ve Wrangleru.",
      },
      200,
      headers
    );
  }

  const trialDays = Number(env.STRIPE_TRIAL_DAYS || 180);
  const params = {
    "mode": "subscription",
    "success_url": `${site}/dekujeme.html?session_id={CHECKOUT_SESSION_ID}`,
    "cancel_url": `${site}/cenik.html?canceled=1`,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    "allow_promotion_codes": "true",
    "billing_address_collection": "required",
    "metadata[plan]": plan,
    "metadata[billing]": billing,
    "subscription_data[metadata][plan]": plan,
    "subscription_data[metadata][billing]": billing,
  };

  // Starter is €0 — still use Checkout; trial applies to paid plans
  if (plan !== "starter" && trialDays > 0) {
    params["subscription_data[trial_period_days]"] = String(trialDays);
  }

  if (email && isEmail(email)) {
    params.customer_email = email;
  }

  const result = await stripeRequest(env, "/checkout/sessions", { body: params });
  if (!result.ok) {
    console.error(result.data);
    return json(
      { ok: false, error: result.data?.error?.message || "Stripe Checkout selhal." },
      result.status || 502,
      headers
    );
  }

  return json({ ok: true, url: result.data.url, id: result.data.id }, 200, headers);
}
