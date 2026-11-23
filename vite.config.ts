import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {build as esbuild} from 'esbuild';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin, type ResolvedConfig} from 'vite';

function buildExpressServerPlugin(): Plugin {
  let resolvedConfig: ResolvedConfig | null = null;
  return {
    name: 'csc-dost-build-express-server',
    apply: 'build',
    configResolved(config) {
      resolvedConfig = config;
    },
    async closeBundle() {
      const rootDir = resolvedConfig?.root || process.cwd();
      const outDir = path.resolve(rootDir, resolvedConfig?.build.outDir || 'dist');
      const distIndexPath = path.join(outDir, 'index.html');
      const serverEntry = path.join(rootDir, 'server.ts');

      if (!fs.existsSync(serverEntry)) {
        return;
      }
      if (!fs.existsSync(distIndexPath)) {
        throw new Error(`[build-express-server] Compiled index.html not found at ${distIndexPath}`);
      }

      const distIndexHtml = fs.readFileSync(distIndexPath, 'utf-8');
      if (!distIndexHtml.includes('/assets/') || distIndexHtml.includes('/src/main.tsx')) {
        throw new Error(`[build-express-server] ${distIndexPath} is not a compiled Vite production HTML file`);
      }

      const sharedOptions = {
        entryPoints: [serverEntry],
        bundle: true,
        platform: 'node' as const,
        packages: 'external' as const,
        sourcemap: true,
        define: {
          __EMBEDDED_DIST_INDEX_HTML__: JSON.stringify(distIndexHtml),
        },
      };

      const targets = Array.from(
        new Set([
          path.join(rootDir, 'server.js'),
          path.join(outDir, 'server.js'),
        ])
      );

      await Promise.all([
        ...targets.map((outfile) => esbuild({...sharedOptions, format: 'esm', outfile})),
        esbuild({...sharedOptions, format: 'cjs', outfile: path.join(outDir, 'server.cjs')}),
      ]);

      console.log(
        `[build-express-server] Bundled Express entry files with embedded ${path.relative(rootDir, distIndexPath)}`
      );
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), buildExpressServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('pdfjs-dist')) return 'vendor-pdfjs';
              if (id.includes('pdf-lib') || id.includes('@pdf-lib')) return 'vendor-pdf-lib';
              if (id.includes('jszip')) return 'vendor-jszip';
              if (id.includes('qrcode')) return 'vendor-qrcode';
              if (id.includes('firebase')) return 'vendor-firebase';
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (
                id.includes('/react/') ||
                id.includes('/react-dom/') ||
                id.includes('/scheduler/')
              ) {
                return 'vendor-react';
              }
            }
            if (id.includes('/src/data/sarkariData')) return 'data-sarkari';
            if (id.includes('/src/data/guidesData')) return 'data-guides';
            if (id.includes('/src/servicesData')) return 'data-services';
            return undefined;
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
