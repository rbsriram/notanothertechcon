// api/submit.js
export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Get env var (set in Vercel project settings or .env.local for `vercel dev`)
  const APPSCRIPT_URL = process.env.APPSCRIPT_URL;
  if (!APPSCRIPT_URL) {
    return new Response('Missing APPSCRIPT_URL env var', { status: 500 });
  }

  try {
    // Read incoming form data from the browser (name, email, etc.)
    const formData = await req.formData();

    // Basic sanity: block obvious empty payloads
    if (!formData || [...formData.keys()].length === 0) {
      return new Response('empty_form', { status: 400 });
    }

    // Forward to Google Apps Script as FormData (no headers -> no preflight)
    const upstream = await fetch(APPSCRIPT_URL, {
      method: 'POST',
      body: formData,
      redirect: 'follow',
      // No custom headers on purpose — keep it simple
    });

    // Read Apps Script response body as text
    const text = await upstream.text();

    // Pass through the status + body so the client can decide what to show
    // (Your frontend checks for: ok, duplicate:email, rate_limited, too_fast, missing:*, invalid:email, error:*)
    return new Response(text || 'ok', {
      status: upstream.status || 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  } catch (err) {
    // Surface a concise error for the client; log details in Vercel logs
    return new Response(`proxy_error:${String(err)}`, {
      status: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8' }
    });
  }
}
