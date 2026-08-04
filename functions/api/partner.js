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

  if (!(await rateLimit(env, `partner:${ip}`, 5, 3600))) {
    return json({ ok: false, error: "Too many requests. Try again later." }, 429, headers);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ ok: false, error: "Invalid JSON" }, 400, headers);
  }

  if (body.website || body.company_url) {
    return json({ ok: true }, 200, headers);
  }

  const firma = clean(body.firma, 200);
  const ico = clean(body.ico, 20).replace(/\s/g, "");
  const region = clean(body.region, 80);
  const specialization = clean(body.specialization || body.spec, 200);
  const email = clean(body.email, 200).toLowerCase();
  const consent = Boolean(body.consent);

  if (!firma || !ico || !region || !specialization || !isEmail(email)) {
    return json({ ok: false, error: "Vyplňte všechna povinná pole." }, 400, headers);
  }
  if (!/^\d{8}$/.test(ico)) {
    return json({ ok: false, error: "IČO musí mít 8 číslic." }, 400, headers);
  }
  if (!consent) {
    return json({ ok: false, error: "Je potřeba souhlas se zpracováním údajů." }, 400, headers);
  }

  const id = uid("partner");
  const consentAt = new Date().toISOString();

  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO partner_applications
          (id, firma, ico, region, specialization, email, consent_at, ip)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(id, firma, ico, region, specialization, email, consentAt, ip)
        .run();
    } catch (err) {
      console.error("D1 partner insert", err);
      return json(
        { ok: false, error: "Nepodařilo se uložit. Zkontrolujte databázi (npm run db:migrate:local)." },
        500,
        headers
      );
    }
  }

  const to = env.PARTNER_TO || env.CONTACT_TO || "partner@enestu.cz";
  await sendResend(env, {
    to,
    subject: `[Enestu partner] ${firma} · ${region}`,
    replyTo: email,
    html: `
      <h2>Nová partnerská žádost</h2>
      <p><strong>Firma:</strong> ${escapeHtml(firma)}</p>
      <p><strong>IČO:</strong> ${escapeHtml(ico)}</p>
      <p><strong>Region:</strong> ${escapeHtml(region)}</p>
      <p><strong>Specializace:</strong> ${escapeHtml(specialization)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
      <p style="color:#666;font-size:12px">ID ${id} · ${consentAt}</p>
    `,
  });

  await sendResend(env, {
    to: email,
    subject: "Žádost přijata — Enestu partneři",
    html: `
      <p>Dobrý den,</p>
      <p>děkujeme za zájem o partnerství. Žádost pro region <strong>${escapeHtml(region)}</strong> jsme přijali a ozveme se s dalším postupem.</p>
      <p>Tým Enestu</p>
    `,
  });

  return json({ ok: true, id }, 200, headers);
}
