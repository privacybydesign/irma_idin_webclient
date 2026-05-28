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
const strings = JSON.parse(readFileSync(languageFile, 'utf-8'));

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

function emitRuntimeAssets() {
  return {
    name: 'irma-idin-runtime-assets',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'conf.json',
        source: `${JSON.stringify(conf, null, 2)}\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: `languages/${language}.json`,
        source: readFileSync(languageFile, 'utf-8'),
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
  plugins: [ejsTemplates(), emitRuntimeAssets()],
});
