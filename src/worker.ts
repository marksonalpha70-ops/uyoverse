/**
 * Cloudflare Worker Entry Point for Uyoverse 3D
 * Handles Static Asset serving, SPA fallback routing, and Edge Performance Headers.
 */

interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Fetch static asset from Cloudflare Workers Static Assets binding
    const response = await env.ASSETS.fetch(request);

    // Clone response to add performance & PWA security headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-Frame-Options', 'SAMEORIGIN');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Enable SharedArrayBuffer and High-Performance WebGL/WebGPU if needed
    newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
    newHeaders.set('Cross-Origin-Embedder-Policy', 'credentialless');

    // Immutable caching for hashed static assets
    if (url.pathname.startsWith('/assets/')) {
      newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
