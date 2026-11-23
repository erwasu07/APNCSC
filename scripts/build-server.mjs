import fs from 'fs';
import path from 'path';
import { build } from 'esbuild';

const rootDir = process.cwd();
const distIndexPath = path.join(rootDir, 'dist', 'index.html');

if (!fs.existsSync(distIndexPath)) {
  console.error(`[build-server] ERROR: ${distIndexPath} not found. Run "vite build" first.`);
  process.exit(1);
}

const distIndexHtml = fs.readFileSync(distIndexPath, 'utf-8');
if (!distIndexHtml.includes('/assets/') || distIndexHtml.includes('/src/main.tsx')) {
  console.error('[build-server] ERROR: dist/index.html does not appear to be a compiled Vite production HTML file.');
  process.exit(1);
}

const sharedOptions = {
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  packages: 'external',
  sourcemap: true,
  define: {
    __EMBEDDED_DIST_INDEX_HTML__: JSON.stringify(distIndexHtml),
  },
};

await Promise.all([
  build({ ...sharedOptions, format: 'esm', outfile: 'server.js' }),
  build({ ...sharedOptions, format: 'esm', outfile: 'dist/server.js' }),
  build({ ...sharedOptions, format: 'cjs', outfile: 'dist/server.cjs' }),
]);

console.log('[build-server] Bundled server.js, dist/server.js, and dist/server.cjs with embedded dist/index.html.');
