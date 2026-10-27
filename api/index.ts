import app from '../server.js';

export default function handler(req: any, res: any) {
  // Restore original request path if Vercel rewrite altered req.url
  const matchedPath =
    req.headers['x-matched-path'] ||
    req.headers['x-forwarded-uri'] ||
    req.headers['x-vercel-matched-path'] ||
    req.headers['x-original-url'];

  if (typeof matchedPath === 'string' && matchedPath.length > 0) {
    if (req.url === '/api' || req.url === '/api/' || req.url === '/' || !req.url) {
      req.url = matchedPath;
    }
  }

  return (app as any)(req, res);
}

