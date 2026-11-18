import app from '../server.js';

export default function handler(req: any, res: any) {
  const rawUrl = typeof req.url === 'string' && req.url.length > 0 ? req.url : '/';
  const qIndex = rawUrl.indexOf('?');
  const pathPart = qIndex >= 0 ? rawUrl.slice(0, qIndex) : rawUrl;
  const queryPart = qIndex >= 0 ? rawUrl.slice(qIndex) : '';

  const isBareApiEntry =
    pathPart === '/api' ||
    pathPart === '/api/' ||
    pathPart === '/api/index' ||
    pathPart === '/api/index.ts';

  if (isBareApiEntry) {
    const candidateHeaders = [
      req.headers['x-vercel-original-path'],
      req.headers['x-original-url'],
      req.headers['x-forwarded-uri'],
      req.headers['x-rewrite-url'],
      req.headers['x-matched-path'],
      req.headers['x-vercel-matched-path'],
    ];

    const restoredPath = candidateHeaders.find((val): val is string => {
      if (typeof val !== 'string' || !val.startsWith('/')) return false;
      const cleanVal = val.split('?')[0];
      return (
        cleanVal !== '/api' &&
        cleanVal !== '/api/' &&
        cleanVal !== '/api/index' &&
        cleanVal !== '/api/index.ts'
      );
    });

    if (restoredPath) {
      req.url = restoredPath.includes('?') || !queryPart ? restoredPath : `${restoredPath}${queryPart}`;
    } else {
      req.url = `/${queryPart}`;
    }
  }

  return (app as any)(req, res);
}

