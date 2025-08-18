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

    const res = await fetch(APPSCRIPT_URL, {
      method: 'POST',
      body: formData,          // forward as-is (no headers -> no preflight)
      redirect: 'follow'
    });

    const text = await res.text();
    // Return Apps Script status + body for debugging
    return new Response(text, {
      status: res.status,
      headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' }
    });
  } catch (err) {
    return new Response(`proxy_error:${String(err)}`, { status: 500 });
  }
}
