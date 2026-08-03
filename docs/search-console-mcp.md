# Google Search Console MCP server

Wired into `.mcp.json` as `gsc`, using [AminForou/mcp-gsc](https://github.com/AminForou/mcp-gsc)
(published to PyPI as `mcp-search-console`). It gives Claude 21 tools over the
Search Console API — the ones that matter here being `submit_sitemap`,
`inspect_url_enhanced`, `check_indexing_issues`, and `get_search_analytics`.

Verified working in this repo's environment: `uvx mcp-search-console` starts,
reports `gsc-server 1.29.0`, and lists all 21 tools. Without credentials every
tool returns a readable error rather than crashing the server, so a broken
credential setup degrades to "that tool does not work" rather than taking the
whole MCP connection down.

## It does nothing until you add credentials

The config deliberately ships with no credential path, so nothing in this repo
is a secret. Two ways to supply one.

### Service account — the right choice for Claude Code on the web

The remote container is headless, so an OAuth browser flow cannot complete
there. `GSC_SKIP_OAUTH=true` is set in `.mcp.json` for that reason.

1. Google Cloud Console → create (or pick) a project → **APIs & Services →
   Library** → enable **Google Search Console API**.
2. **APIs & Services → Credentials → Create credentials → Service account.**
   No project roles are needed; Search Console grants access separately.
3. On the new service account → **Keys → Add key → Create new key → JSON.**
   Download it. Note the `client_email` inside.
4. Search Console → property `happilyeverafteragain.com` → **Settings → Users
   and permissions → Add user** → paste that `client_email` → permission
   **Owner** (needed for sitemap submission; **Full** is enough to read data).
5. Put the JSON file somewhere outside the repo and point the env var at it
   with an **absolute** path:

   ```bash
   export GSC_CREDENTIALS_PATH=/absolute/path/to/service_account.json
   ```

   It must be absolute. `uvx` runs the server from its own working directory,
   so a relative path resolves somewhere unexpected and the server will tell
   you so.

Its error message offers a fallback: dropping a file called
`service_account_credentials.json` in the project root. That works, but it puts
a live credential inside the repo, so `.gitignore` names that exact file too.
Prefer the environment variable and a path outside the repo — a key that is
never in the working tree cannot be committed by a mistake no rule anticipated.

### OAuth — simpler if you only ever run Claude Code locally

Download an OAuth client ID JSON from the same Credentials screen, then in
`.mcp.json` replace the `env` block with:

```json
"env": { "GSC_OAUTH_CLIENT_SECRETS_FILE": "/absolute/path/to/client_secrets.json" }
```

Drop `GSC_SKIP_OAUTH`. A browser opens on first use and the token is cached
afterwards. This cannot work in the web/remote environment.

## Two things to expect

**It is not available in the session that added it.** `.mcp.json` is read when
a session starts, so the `gsc` tools appear in the *next* session.

**The remote container is ephemeral.** Anything written to disk there —
including a credentials file — is gone when the container is reclaimed. For
the web environment, either re-supply the file each session or set
`GSC_CREDENTIALS_PATH` in the environment's configuration and keep the file on
persistent storage. Locally there is nothing to do; the path just stays valid.

## What it can reach

A service-account key here is a live credential for the Search Console
property, and this is a third-party server, not a Google-operated one — it runs
locally on your machine or in the container and talks to Google directly, but
it does hold that key while running. Scope the service account to this one
property and nothing else, which is what step 4 above does: the account starts
with no access to anything and is granted exactly one property.

`.gitignore` carries patterns for `service_account.json`, `client_secrets.json`,
`gsc-*.json` and `.gsc/` so a stray `git add .` cannot commit a key.
