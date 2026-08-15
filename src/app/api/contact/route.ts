import { NextRequest, NextResponse } from 'next/server';
import { d1Run, isD1Configured, newId } from '@/lib/d1';

export const runtime = 'nodejs';

function getMailConfig() {
  const resendFromRaw = (process.env.RESEND_FROM ?? 'onboarding@resend.dev').trim();
  const match = resendFromRaw.match(/<([^>]+)>/);
  const from = (match ? match[1] : resendFromRaw).trim();

  return {
    notifyEmail: (process.env.CONTACT_NOTIFY_EMAIL ?? 'sertaccoban@gmail.com').trim(),
    resendKey: (process.env.RESEND_API_KEY ?? '').trim(),
    resendFrom: from
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function saveMessage(data: {
  name: string;
  email: string;
  phone: string;
  body: string;
}): Promise<boolean> {
  if (!isD1Configured()) return false;

  await d1Run(
    `INSERT INTO messages (id, name, email, phone, body, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
    [newId(), data.name, data.email, data.phone, data.body, new Date().toISOString()]
  );
  return true;
}

async function sendNotifyEmail(
  cfg: ReturnType<typeof getMailConfig>,
  data: { name: string; email: string; phone: string; body: string }
): Promise<{ ok: boolean; reason?: string; detail?: string; resendId?: string }> {
  if (!cfg.resendKey) return { ok: false, reason: 'missing_resend_key' };

  const html = `
    <h2>Nouveau message — cbnplaque.com</h2>
    <p><strong>Nom :</strong> ${escapeHtml(data.name)}</p>
    <p><strong>E-mail :</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
    ${data.phone ? `<p><strong>Téléphone :</strong> ${escapeHtml(data.phone)}</p>` : ''}
    <p><strong>Message :</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(data.body)}</p>
    <hr>
    <p style="color:#666;font-size:12px">Répondre directement à ${escapeHtml(data.email)}</p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: cfg.resendFrom,
      to: [cfg.notifyEmail],
      reply_to: data.email,
      subject: `[CBN Plaque] Message de ${data.name}`,
      html
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[contact] Resend error:', res.status, errText);
    let detail = errText.slice(0, 200);
    try {
      const parsed = JSON.parse(errText) as { message?: string };
      if (parsed.message) detail = parsed.message;
    } catch {
      /* keep raw */
    }
    if (detail.includes('only send testing emails to your own email')) {
      return { ok: false, reason: 'resend_test_mode_wrong_recipient', detail };
    }
    if (res.status === 401 || detail.toLowerCase().includes('api key')) {
      return { ok: false, reason: 'invalid_resend_key', detail };
    }
    return { ok: false, reason: 'resend_rejected', detail };
  }

  const resBody = (await res.json()) as { id?: string };
  return { ok: true, resendId: resBody.id };
}

export async function POST(req: NextRequest) {
  try {
    const cfg = getMailConfig();
    const json = (await req.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      body?: string;
    };

    const name = String(json.name ?? '').trim().slice(0, 255);
    const email = String(json.email ?? '').trim().slice(0, 255);
    const phone = String(json.phone ?? '').trim().slice(0, 50);
    const body = String(json.body ?? '').trim().slice(0, 5000);

    if (!name || !email || !body) {
      return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
    }

    const payload = { name, email, phone, body };

    // Kayit ile e-posta birbirinden bagimsiz; biri calisirsa mesaj kaybolmaz.
    let saved = false;
    try {
      saved = await saveMessage(payload);
    } catch (e) {
      console.error('[contact] D1 kayit hatasi:', e instanceof Error ? e.message : e);
    }

    const mail = await sendNotifyEmail(cfg, payload);

    if (!saved && !mail.ok) {
      return NextResponse.json(
        { ok: false, error: 'not_delivered', emailReason: mail.reason },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      saved,
      emailed: mail.ok,
      mailTo: cfg.notifyEmail,
      ...(mail.resendId ? { resendId: mail.resendId } : {}),
      ...(mail.ok ? {} : { emailReason: mail.reason, emailDetail: mail.detail })
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
