# BDRIS Cloud UI

React dashboard frontend for the authenticated local BDRIS Bot dashboard gateway.

## Connect to the Bot running on your Local PC

1. Start the V153 Bot on the Local PC. It starts a separate authenticated Dashboard Gateway on `127.0.0.1:8792`.
2. The Bot starts a dedicated Cloudflare Quick Tunnel to that gateway only. Do not expose the Extension Bridge port `8791` directly.
3. Copy the printed `https://....trycloudflare.com` Dashboard Tunnel URL.
4. Copy the generated `dashboard-access-token.local` contents from the Bot folder. Keep it secret.
5. Open this Vercel UI, select **Connection**, paste the HTTPS URL and token, then save.
6. The token is kept in the current browser session storage. The URL is kept in local storage. Re-enter the token after the browser session ends.

## Optional backend environment

- `DASHBOARD_PORT=8792`
- `DASHBOARD_API_TOKEN`: optional fixed secret (at least 32 characters). If absent, a random local token is generated in `dashboard-access-token.local`.
- `DASHBOARD_ALLOWED_ORIGINS`: comma-separated exact Vercel origins. Configure this on the local Bot process.

## Security and limitations

- The full Extension Bridge API remains local and is not public. The tunnel reaches only the Dashboard Gateway allowlist.
- The gateway requires a Bearer token, limits request rates, checks configured origins, and exposes only health, status, application mappings, current OTP summary, and a guarded Bot start request.
- Bot start is disabled in `V153_EMBEDDED=1` mode to avoid creating a second Baileys socket. No remote Stop action is exposed in this release.
- React Parser remote execution is not exposed until its exact API and authorization rules are audited.
- The Local PC, Bot process, network, and tunnel must already be running. A Vercel page cannot start a powered-off PC or a process that is not reachable.
- Quick Tunnel URLs can change after restart. For stable production use, configure a named Cloudflare Tunnel and Cloudflare Access.
- Never place the Dashboard Token in a `VITE_` variable or commit it to GitHub.
