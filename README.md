# BDRIS Cloud UI

React dashboard frontend for the BDRIS Bot backend and the local React Parser running on the user's PC.

## Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. Framework preset: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add `VITE_BOT_API_URL` only if the existing Bot backend API is configured.
6. Add `VITE_REACT_PARSER_URL` with the HTTPS Tailscale Funnel base URL, without a trailing slash. Current configured PC URL:
   `https://desktop-18jqpvf.tail3c7dea.ts.net:8443`
7. Redeploy after setting or changing environment variables.

## React Parser connection

The React Parser page checks only the public read-only health endpoint:

- `GET /api/health`
- Opens the Parser UI at `/index.html?v=58`

The current Tailscale Funnel routes port `8443` to the local React Parser server (currently port `50315`). The local server may choose a different port after restart. If that happens, update the Funnel mapping and the Vercel `VITE_REACT_PARSER_URL` value, then redeploy.

## Security notes

- Vite environment variables are public in the browser bundle. Do not put API keys, dashboard tokens, passwords, or other secrets in any `VITE_*` variable.
- The Parser integration in this commit checks health and opens the Parser UI only. It does not expose Bot start/stop, OTP, application data, Parser execution, or Submit endpoints.
- Do not expose sensitive control endpoints through a public Funnel until server-side authentication, authorization, request validation, and appropriate origin protections are implemented.
- The existing `VITE_BOT_API_URL` integration is kept separate and unchanged.
