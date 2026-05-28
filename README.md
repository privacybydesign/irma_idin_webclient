# irma_idin_webclient
The IRMA iDIN attribute issuance webapp can be used as a front-end for the [IRMA iDIN issuer](https://github.com/privacybydesign/irma_idin_issuer).

## Building

The webapp is built with [Vite](https://vitejs.dev/). The build language and runtime URLs are passed via environment variables and baked into the output (the language strings into the HTML, the URLs into `conf.json`).

Install dependencies:

```sh
yarn install
```

Build for a single language (the output ends up in `build/`):

```sh
WEBCLIENT_LANG=en \
IDIN_SERVER_URL="<URL1>" \
IRMA_SERVER_URL="<URL2>" \
yarn build
```

Shortcuts that just set the language:

```sh
yarn build:en
yarn build:nl
```

If you do not pass `IDIN_SERVER_URL` / `IRMA_SERVER_URL` at build time, the resulting `build/conf.json` contains placeholder values that you can edit afterwards.

Optional environment variable: `IDIN_CREDENTIAL_ID` (defaults to `pbdf.pbdf.idin`).

## Development

```sh
WEBCLIENT_LANG=en yarn dev
```

Starts the Vite dev server with hot module replacement.

Page scripts live under `src/js/` and are written in TypeScript with no
runtime framework (no jQuery). Run a type-check with:

```sh
yarn typecheck
```

`yarn install` will emit a `@popperjs/core` unmet-peer-dependency warning
from Bootstrap; it is safe to ignore. We only import Bootstrap's CSS
(`bootstrap/dist/css/bootstrap.min.css`), not the JS components that depend
on Popper, so Popper is not actually needed at runtime.
