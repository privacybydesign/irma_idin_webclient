import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ejs from 'ejs';

const language = process.env.WEBCLIENT_LANG || 'nl';
const idinServerUrl = process.env.IDIN_SERVER_URL || '<IDIN_SERVER_URL>';
const irmaServerUrl = process.env.IRMA_SERVER_URL || '<IRMA_SERVER_URL>';
const idinCredentialId = process.env.IDIN_CREDENTIAL_ID || 'pbdf.pbdf.idin';

const srcRoot = resolve(import.meta.dirname, 'src');
const languageFile = resolve(srcRoot, `languages/${language}.json`);

// Replicate grunt-multi-lang-site-generator's parse_vocab_item(): rewrite the
// {URL=X}Y{/URL}, {B}…{/B}, and {P}…{/P} markers used in src/languages/*.json
// into real HTML. Without this, e.g. error_text1 leaks "{URL=index.html}…{/URL}"
// straight into the rendered error page.
function parseVocabItem(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\{URL=([^}]+)\}([\s\S]*?)\{\/URL\}/g, '<a href="$1" target="_top">$2</a>')
    .replace(/\{B\}([\s\S]*?)\{\/B\}/g, '<strong>$1</strong>')
    .replace(/\{P\}([\s\S]*?)\{\/P\}/g, '<p>$1</p>');
}

function processStrings(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw)) out[k] = parseVocabItem(v);
  return out;
}

function loadStrings() {
  const raw = JSON.parse(readFileSync(languageFile, 'utf-8'));
  return { raw, processed: processStrings(raw) };
}

const { processed: strings } = loadStrings();

const conf = {
  idin_server_url: idinServerUrl,
  irma_server_url: `${irmaServerUrl}/api/v2`,
  language,
  idin_credential_id: idinCredentialId,
};

console.log('Configuration:', conf);

function ejsTemplates() {
  return {
    name: 'irma-idin-ejs',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return ejs.render(html, strings);
      },
    },
  };
}

function runtimeAssets() {
  const confBody = `${JSON.stringify(conf, null, 2)}\n`;
  const languagesBody = `${JSON.stringify(processStrings(JSON.parse(readFileSync(languageFile, 'utf-8'))), null, 2)}\n`;
  const languagesPath = `/languages/${language}.json`;

  return {
    name: 'irma-idin-runtime-assets',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'conf.json', source: confBody });
      this.emitFile({
        type: 'asset',
        fileName: `languages/${language}.json`,
        source: languagesBody,
      });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const path = req.url.split('?')[0];
        if (path === '/conf.json') {
          res.setHeader('Content-Type', 'application/json');
          res.end(confBody);
          return;
        }
        if (path === languagesPath) {
          res.setHeader('Content-Type', 'application/json');
          res.end(languagesBody);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../build',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        index: resolve(srcRoot, 'index.html'),
        enroll: resolve(srcRoot, 'enroll.html'),
        done: resolve(srcRoot, 'done.html'),
        error: resolve(srcRoot, 'error.html'),
      },
    },
  },
  plugins: [ejsTemplates(), runtimeAssets()],
});
