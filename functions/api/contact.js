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

  if (!(await rateLimit(env, `contact:${ip}`, 6, 3600))) {
    return json({ ok: false, error: "Too many requests. Try again later." }, 429, headers);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ ok: false, error: "Invalid JSON" }, 400, headers);
  }

  // Honeypot
  if (body.website || body.company_url) {
    return json({ ok: true }, 200, headers);
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const subject = clean(body.subject, 200);
  const message = clean(body.message, 5000);
  const consent = Boolean(body.consent);

  if (!name || !isEmail(email) || !subject || !message) {
    return json({ ok: false, error: "Vyplňte všechna povinná pole." }, 400, headers);
  }
  if (!consent) {
    return json({ ok: false, error: "Je potřeba souhlas se zpracováním údajů." }, 400, headers);
  }

  const id = uid("contact");
  const consentAt = new Date().toISOString();
  const ua = request.headers.get("User-Agent") || "";

  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO contact_leads (id, name, email, subject, message, consent_at, ip, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(id, name, email, subject, message, consentAt, ip, ua.slice(0, 400))
        .run();
    } catch (err) {
      console.error("D1 contact insert", err);
      return json(
        { ok: false, error: "Nepodařilo se uložit. Zkontrolujte databázi (npm run db:migrate:local)." },
        500,
        headers
      );
    }
  }

  const to = env.CONTACT_TO || "ahoj@enestu.cz";
  await sendResend(env, {
    to,
    subject: `[Enestu kontakt] ${subject}`,
    replyTo: email,
    html: `
      <h2>Nová zpráva z webu</h2>
      <p><strong>Jméno:</strong> ${escapeHtml(name)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
      <p><strong>Předmět:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Zpráva:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      <hr>
      <p style="color:#666;font-size:12px">ID ${id} · ${consentAt} · IP ${escapeHtml(ip)}</p>
    `,
  });

  await sendResend(env, {
    to: email,
    subject: "Děkujeme za zprávu — Enestu",
    html: `
      <p>Dobrý den${name ? `, ${escapeHtml(name)}` : ""},</p>
      <p>děkujeme za vaši zprávu. Ozveme se obvykle do jednoho pracovního dne (Po–Pá, 9:00–17:00).</p>
      <p>S pozdravem,<br>Tým Enestu</p>
    `,
  });

  return json({ ok: true, id }, 200, headers);
}
