import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'node-appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? '';
const apiKey = process.env.APPWRITE_API_KEY ?? '';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? 'main';
const messagesCol = process.env.NEXT_PUBLIC_APPWRITE_COL_MESSAGES ?? 'messages';

const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL ?? 'cbnplaque@gmail.com';
const resendKey = process.env.RESEND_API_KEY ?? '';
const resendFromRaw = process.env.RESEND_FROM ?? 'onboarding@resend.dev';

/** "CBN Plaque <onboarding@resend.dev>" → onboarding@resend.dev */
function parseFromAddress(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return (match ? match[1] : raw).trim();
}

const resendFrom = parseFromAddress(resendFromRaw);

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
  if (!projectId || !apiKey) return false;

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const db = new Databases(client);

  await db.createDocument(databaseId, messagesCol, ID.unique(), {
    name: data.name,
    email: data.email,
    phone: data.phone,
    body: data.body,
    is_read: false
  });
  return true;
}

async function sendNotifyEmail(data: {
  name: string;
  email: string;
  phone: string;
  body: string;
}): Promise<{ ok: boolean; reason?: string }> {
  if (!resendKey) return { ok: false, reason: 'missing_resend_key' };

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
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [notifyEmail],
      reply_to: data.email,
      subject: `[CBN Plaque] Message de ${data.name}`,
      html
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[contact] Resend error:', res.status, errText);
    if (errText.includes('only send testing emails to your own email')) {
      return { ok: false, reason: 'resend_test_mode_wrong_recipient' };
    }
    return { ok: false, reason: 'resend_rejected' };
  }

  return { ok: true };
}

export async function POST(req: NextRequest) {
  try {
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
    const saved = await saveMessage(payload);

    if (!saved) {
      return NextResponse.json({ ok: false, fallback: true });
    }

    let emailed = false;
    let emailReason: string | undefined;
    if (!resendKey) {
      emailReason = 'missing_resend_key';
    } else {
      try {
        const mail = await sendNotifyEmail(payload);
        emailed = mail.ok;
        if (!emailed) emailReason = mail.reason ?? 'resend_rejected';
      } catch {
        emailReason = 'resend_error';
      }
    }

    return NextResponse.json({ ok: true, emailed, emailReason });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
