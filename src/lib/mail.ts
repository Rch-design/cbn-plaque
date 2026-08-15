/** Resend uzerinden basit e-posta gonderimi (sunucu tarafi). */
export async function sendMail({
  subject,
  html
}: {
  subject: string;
  html: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = (process.env.RESEND_API_KEY ?? '').trim();
  const to = (process.env.CONTACT_NOTIFY_EMAIL ?? '').trim();

  const fromRaw = (process.env.RESEND_FROM ?? 'onboarding@resend.dev').trim();
  const match = fromRaw.match(/<([^>]+)>/);
  const from = (match ? match[1] : fromRaw).trim();

  if (!apiKey) return { ok: false, reason: 'missing_resend_key' };
  if (!to) return { ok: false, reason: 'missing_recipient' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to: [to], subject, html })
    });

    if (!res.ok) {
      console.error('[mail] Resend error:', res.status, await res.text());
      return { ok: false, reason: `resend_${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error('[mail] fetch failed:', e);
    return { ok: false, reason: 'fetch_failed' };
  }
}
