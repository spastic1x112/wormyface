# WormGPT Terminal UI

A Vite + React terminal-style interface.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Vite is configured to listen on port 3000.

To verify a production build:

```bash
npm run build
npm run preview
```

## AI chat configuration

The interface can start without an API key, but chat requests will show an error until AI service configuration is provided. The current implementation injects `GEMINI_API_KEY` into the browser bundle, which exposes the key to anyone who can access the app. Do not use a valuable or production API key this way, and do not deploy this configuration publicly. For a deployed app, put model calls behind a server-side endpoint with authentication, rate limiting, and safe usage policies; never ship provider secrets in frontend code.
