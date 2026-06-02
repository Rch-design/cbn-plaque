import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'node-appwrite';

function getMailConfig() {
  const resendFromRaw = (process.env.RESEND_FROM ?? 'onboarding@resend.dev').trim();
  const match = resendFromRaw.match(/<([^>]+)>/);
  const from = (match ? match[1] : resendFromRaw).trim();

  return {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? '',
    apiKey: (process.env.APPWRITE_API_KEY ?? '').trim(),
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? 'main',
    messagesCol: process.env.NEXT_PUBLIC_APPWRITE_COL_MESSAGES ?? 'messages',
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

async function saveMessage(
  cfg: ReturnType<typeof getMailConfig>,
  data: { name: string; email: string; phone: string; body: string }
): Promise<boolean> {
  if (!cfg.projectId || !cfg.apiKey) return false;

  const client = new Client()
    .setEndpoint(cfg.endpoint)
    .setProject(cfg.projectId)
    .setKey(cfg.apiKey);
  const db = new Databases(client);

  await db.createDocument(cfg.databaseId, cfg.messagesCol, ID.unique(), {
    name: data.name,
    email: data.email,
    phone: data.phone,
    body: data.body,
    is_read: false
  });
  return true;
}

async function sendNotifyEmail(
  cfg: ReturnType<typeof getMailConfig>,
  data: { name: string; email: string; phone: string; body: string }
): Promise<{ ok: boolean; reason?: string; detail?: string }> {
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

  return { ok: true };
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
    const saved = await saveMessage(cfg, payload);

    if (!saved) {
      return NextResponse.json({ ok: false, fallback: true });
    }

    let emailed = false;
    let emailReason: string | undefined;
    let emailDetail: string | undefined;

    const mail = await sendNotifyEmail(cfg, payload);
    emailed = mail.ok;
    if (!emailed) {
      emailReason = mail.reason ?? 'resend_rejected';
      emailDetail = mail.detail;
    }

    return NextResponse.json({
      ok: true,
      emailed,
      emailReason,
      mailTo: cfg.notifyEmail,
      ...(emailDetail ? { emailDetail } : {})
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
