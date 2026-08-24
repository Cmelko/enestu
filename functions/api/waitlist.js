import {
  clean,
  clientIp,
  corsHeaders,
  handleOptions,
  isEmail,
  json,
  rateLimit,
  readJson,
  sendResend,
  escapeHtml,
  uid,
} from "../_shared/utils.js";

export async function onRequestOptions(context) {
  return handleOptions(context.env, context.request);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = corsHeaders(env, request);
  const ip = clientIp(request);

  if (!(await rateLimit(env, `waitlist:${ip}`, 10, 3600))) {
    return json({ ok: false, error: "Too many requests. Try again later." }, 429, headers);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ ok: false, error: "Invalid JSON" }, 400, headers);
  }

  if (body.website || body.company_url) {
    return json({ ok: true }, 200, headers);
  }

  const email = clean(body.email, 200).toLowerCase();
  const source = clean(body.source || "website", 80);
  const consent = body.consent !== false;
  const marketing = body.marketing !== false;

  if (!isEmail(email)) {
    return json({ ok: false, error: "Zadejte platný e-mail." }, 400, headers);
  }

  const id = uid("wait");
  const consentAt = new Date().toISOString();

  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO waitlist (id, email, source, consent_at, ip) VALUES (?, ?, ?, ?, ?)`
      )
        .bind(id, email, source, consent ? consentAt : null, ip)
        .run();
    } catch (err) {
      // unique email — treat as success (idempotent)
      if (String(err?.message || err).includes("UNIQUE")) {
        return json({ ok: true, id, existing: true }, 200, headers);
      }
      console.error(err);
      return json({ ok: false, error: "Nepodařilo se uložit. Zkuste to znovu." }, 500, headers);
    }
  }

  const to = env.CONTACT_TO || "ahoj@enestu.cz";
  await sendResend(env, {
    to,
    subject: `[Enestu waitlist] ${email}`,
    html: `<p>Nový zájem o založení domova: <strong>${escapeHtml(email)}</strong></p>
           <p>Zdroj: ${escapeHtml(source)} · marketing: ${marketing ? "ano" : "ne"} · ${consentAt}</p>`,
  });

  await sendResend(env, {
    to: email,
    subject: "Jste na seznamu — Enestu",
    html: `
      <p>Děkujeme! E-mail <strong>${escapeHtml(email)}</strong> jsme zaregistrovali.</p>
      <p>Ozveme se, jakmile bude digitální domov připravený ke spuštění — prvních 6 měsíců zdarma, bez karty na začátek.</p>
      <p>Tým Enestu</p>
    `,
  });

  return json({ ok: true, id }, 200, headers);
}
