# BDRIS Cloud UI

React dashboard frontend for a separately hosted BDRIS Bot backend.

## Deploy to Vercel
1. Import this GitHub repository into Vercel.
2. Framework preset: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variable `VITE_BOT_API_URL` with the HTTPS base URL of the Bot computer's Cloudflare Tunnel (do not include the review query string).
6. Redeploy after setting the variable.

## Current backend endpoints used
- `GET /health`
- `GET /api/application-mappings`
- `GET /api/otp/current`

## Pending backend work
The supplied V153 ZIP does not currently expose a secured dashboard API for Bot start/stop, WhatsApp connection state, V153 controls, remote React Parser execution, or reports/delivery history. The UI intentionally keeps unsupported controls disabled rather than sending unsafe requests.

**Security:** The current backend routes shown in the supplied ZIP do not implement dashboard authentication. Do not expose control or sensitive data endpoints publicly until authentication, authorization, CORS allowlisting, and request validation are implemented. Never put API secrets in Vite client environment variables.
