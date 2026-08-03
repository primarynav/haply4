import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import path from 'path';
import { staticPages } from './scripts/staticPages';

/**
 * Everything the SPA cannot do for itself.
 *
 * 1. `404.html`. GitHub Pages serves static files and has no rewrite rules, so
 *    a request for a client route like `/switch` finds no file and gets GitHub's
 *    own 404 — the React router never runs. Pages does serve a `404.html` when
 *    one exists, so copying the built `index.html` there turns every unmatched
 *    path into the app, which then reads `location.pathname` and routes. It has
 *    to be a copy of the *built* index (hashed asset URLs), not the source one.
 *
 * 2. Static `privacy.html`, `terms.html`, `/guides/*`, `sitemap.xml`,
 *    `robots.txt` — see scripts/staticPages.ts for why these must exist without
 *    JavaScript.
 *
 * These are emitted in `closeBundle`, after Vite has written the output, so the
 * index.html being copied is the finished one.
 *
 * Note the ordering consequence: GitHub Pages resolves an extensionless request
 * to a matching `.html` file before falling back to 404.html, so `/privacy`
 * serves the generated static page while `/switch` falls through to the app.
 * That is the intent — the legal pages should not require JS, and both routes
 * still exist in the SPA for in-app navigation.
 */
function staticSite(outDir: string): Plugin {
  return {
    name: 'haply-static-site',
    apply: 'build',
    closeBundle() {
      const root = path.resolve(__dirname, outDir);
      const index = path.join(root, 'index.html');
      if (!fs.existsSync(index)) {
        this.error(`static-site: ${index} was not built; cannot create the SPA fallback`);
      }
      fs.copyFileSync(index, path.join(root, '404.html'));

      for (const file of staticPages()) {
        const dest = path.join(root, file.fileName);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, file.source);
      }
    }
  };
}

const OUT_DIR = 'build';

export default defineConfig({
  base: '/',
  plugins: [react(), staticSite(OUT_DIR)],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'esnext',
    outDir: OUT_DIR
  },
  server: {
    port: 3000,
    open: true
  }
});
