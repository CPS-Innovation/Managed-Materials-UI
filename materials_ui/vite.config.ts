/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import viteCompression from 'vite-plugin-compression';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/materials-ui/',
    define: {
      __MAINTENANCE_MODE__: JSON.stringify(env.VITE_MAINTENANCE_MODE === 'true')
    },
    plugins: [
      svgr(),
      react(),
      viteCompression({ algorithm: 'brotliCompress' }),
      {
        name: 'inject-external-script',
        transformIndexHtml(html) {
          if (env.VITE_GLOBAL_SCRIPT_URL) {
            console.log(env.VITE_GLOBAL_SCRIPT_URL);
            return html.replace(
              '</head>',
              `<script src="${env.VITE_GLOBAL_SCRIPT_URL}" type="module"></script>\n</head>`
            );
          }
          return html;
        }
      },
      {
        name: 'copy-govuk-assets',
        buildStart() {
          const dest = path.resolve(
            import.meta.dirname,
            'public/assets/images'
          );
          fs.mkdirSync(dest, { recursive: true });
          const src = path.resolve(
            import.meta.dirname,
            'node_modules/govuk-frontend/dist/govuk/assets/images'
          );
          for (const file of fs.readdirSync(src)) {
            fs.copyFileSync(path.join(src, file), path.join(dest, file));
          }
        }
      },
      {
        name: 'copy-index-to-root',
        closeBundle() {
          const src = path.resolve(
            import.meta.dirname,
            'build/materials-ui/index.html'
          );
          const dest = path.resolve(import.meta.dirname, 'build/index.html');
          fs.copyFileSync(src, dest);
        }
      },
      {
        name: 'redirect-trailing-slash',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/materials-ui') {
              res.writeHead(302, { Location: '/materials-ui/' });
              res.end();
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: [{ find: 'node_modules', replacement: '/node_modules' }],
      dedupe: ['react', 'react-dom']
    },
    server: { port: 3000 },
    preview: {
      port: 3000,
      headers: {
        // TODO: script-src unsafe-inline is not great, looks like a single GDS setting requiring this
        'Content-Security-Policy': `
          base-uri 'self';
          default-src 'self';
          img-src 'self' data:;
            script-src 'self' 
              https://polaris-dev-notprod.cps.gov.uk/ 
              https://polaris-qa-notprod.cps.gov.uk/
              https://sacpsglobalcomponents.blob.core.windows.net/
              ;
          style-src 'self';
            connect-src 'self' blob: 
              https://fa-redaction-log-dev-reporting.azurewebsites.net/
              https://polaris-dev-notprod.cps.gov.uk/ 
              https://polaris-qa-notprod.cps.gov.uk/
              https://login.microsoftonline.com/
              https://sacpsglobalcomponents.blob.core.windows.net/ 
              https://js.monitor.azure.com/
              ;
        `
          .replace(/\s{2,}/g, ' ')
          .trim()
      }
    },
    esbuild: { drop: mode === 'production' ? ['debugger'] : [] },
    build: {
      outDir: 'build/materials-ui',
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('msal-browser') || id.includes('msal-react')) {
                return 'vendor-auth'; // Microsoft Authentication chunk
              }
              if (id.includes('axios') || id.includes('swr')) {
                return 'vendor-fetch'; // Networking libraries
              }
              if (
                id.includes('govuk-frontend') ||
                id.includes('@ministryofjustice/frontend') ||
                id.includes('home-office-kit')
              ) {
                return 'vendor-govuk'; // UK government UI libraries
              }
              if (
                id.includes('@microsoft/applicationinsights-web') ||
                id.includes('@microsoft/applicationinsights-react-js')
              ) {
                return 'vendor-monitoring'; // Microsoft Application Insights
              }
              return 'vendor'; // Default fallback for other dependencies
            }
          }
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          silenceDeprecations: [
            'legacy-js-api',
            'import',
            'slash-div',
            'global-builtin',
            'function-units'
          ],
          quietDeps: true
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      outputFile: { junit: './unit-test-results.xml' },
      setupFiles: './src/setupTests.ts',
      exclude: ['e2e', 'node_modules']
    }
  };
});
