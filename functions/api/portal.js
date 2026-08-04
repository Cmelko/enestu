import {
  clean,
  corsHeaders,
  handleOptions,
  isEmail,
  json,
  readJson,
  stripeRequest,
} from "../_shared/utils.js";

export async function onRequestOptions(context) {
  return handleOptions(context.env, context.request);
}

/** Create Stripe Customer Portal session (manage subscription). */
export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = corsHeaders(env, request);
  const body = await readJson(request);
  const email = clean(body?.email || "", 200).toLowerCase();
  const site = (env.PUBLIC_SITE_URL || "").replace(/\/$/, "");

  if (!env.STRIPE_SECRET_KEY) {
    return json(
      {
        ok: false,
        error: "Stripe není nakonfigurovaný.",
        demo: true,
      },
      503,
      headers
    );
  }

  if (!isEmail(email)) {
    return json({ ok: false, error: "Zadejte e-mail účtu." }, 400, headers);
  }

  // Find customer by email
  const search = await stripeRequest(env, `/customers?email=${encodeURIComponent(email)}&limit=1`, {
    method: "GET",
  });
  const customer = search.data?.data?.[0];
  if (!customer) {
    return json({ ok: false, error: "Účet s tímto e-mailem jsme nenašli." }, 404, headers);
  }

  const portal = await stripeRequest(env, "/billing_portal/sessions", {
    body: {
      customer: customer.id,
      return_url: `${site}/cenik.html`,
    },
  });

  if (!portal.ok) {
    return json(
      { ok: false, error: portal.data?.error?.message || "Portal selhal." },
      portal.status || 502,
      headers
    );
  }

  return json({ ok: true, url: portal.data.url }, 200, headers);
}
