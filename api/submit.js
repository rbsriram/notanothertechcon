export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const APPSCRIPT_URL = process.env.APPSCRIPT_URL;
  if (!APPSCRIPT_URL) {
    return new Response('Missing APPSCRIPT_URL', { status: 500 });
  }

  try {
    const formData = await req.formData();

    // Forward the exact FormData to Apps Script
    const res = await fetch(APPSCRIPT_URL, {
      method: 'POST',
      body: formData
      // No custom headers -> keep it simple, no preflight
    });

    const text = await res.text();
    // Pass Apps Script's plain response back to the client
    return new Response(text, {
      status: 200,
      headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' }
    });
  } catch (err) {
    return new Response('proxy_error', { status: 500 });
  }
}
