The Netlify deploy errored, with the following guidance provided:

Diagnosis — relevant log lines
- [line 21](#L21) shows npm error code E404.
- [line 22](#L22) shows npm tried to GET the package and it was not found.
- [line 24](#L24) states "'@jsr/supabase__supabase-js@^2.49.8' is not in this registry."
- [line 29](#L29) / [line 30](#L30) show the build failed during npm install.

Error type and cause
- npm install failed with an E404 because the dependency name npm attempted to fetch, @jsr/supabase__supabase-js@^2.49.8, does not exist in the npm registry.
- Most likely cause: a wrong dependency name/alias in package.json or in the lockfile (package-lock.json/yarn.lock). This looks like a mangled/aliased version of the official package @supabase/supabase-js (or a misconfigured private scope), so npm cannot find it.

Solution
1) Verify where the bad name lives
- Check package.json and lockfiles for the offending name before making changes:
  - package.json: https://github.com/primarynav/Haply/blob/main/package.json
  - Also search lockfiles:
    - package-lock.json: https://github.com/primarynav/Haply/blob/main/package-lock.json (if present)
    - yarn.lock: https://github.com/primarynav/Haply/blob/main/yarn.lock (if present)
- Locally you can run:
```bash
# from repo root
grep -R "@jsr" package.json package-lock.json yarn.lock || true
```

2) Fix the dependency entry
- If package.json contains a line like:
  "@jsr/supabase__supabase-js": "^2.49.8"
  replace it with the correct dependency name. For example, if you intended to use the official Supabase client, use:
```json
"@supabase/supabase-js": "^2.49.8"
```
- If you intended to create an alias, use npm alias syntax and a non-scoped alias key, e.g.:
```json
"supabase-js": "npm:@supabase/supabase-js@^2.49.8"
```
(Do not name an alias with a scope-like string that looks for a registry-scoped package unless that scoped package actually exists in a registry.)

3) Clean and reinstall, commit fix
```bash
# locally
rm -rf node_modules package-lock.json
npm install
# verify install succeeds
git add package.json package-lock.json
git commit -m "fix dependency name for supabase package"
git push
```
- Pushing the corrected package.json and updated lockfile will allow Netlify to install successfully.

4) If the package is meant to come from a private registry or a different scope
- Verify the package actually exists in that registry and that any required .npmrc or auth tokens are present on Netlify. If you use a private scope like @jsr, ensure the package is published there and that Netlify has credentials to fetch it.
- If you rely on a private registry, make sure .npmrc is present in the repo or configure Netlify environment variables and build settings accordingly.

Why this fixes it
- The 404 shows npm can't find the given package name. Correcting the dependency name (or properly configuring a private registry/alias) ensures npm requests a valid package and the install will succeed.

If you want, I can point to the exact lines in your package.json or lockfile and suggest the exact edit if you paste those snippets here.

The relevant error logs are:

Line 0: build-image version: 207bd4d38e2cd3af6515aa37c5942e41499b616a (noble-new-builds)
Line 1: buildbot version: 420ff06ebdfb3fd8215b1a0a158ab916a07fe5a9
Line 2: Fetching cached dependencies
Line 3: Failed to fetch cache, continuing with build
Line 4: Starting to prepare the repo for build
Line 5: No cached dependencies found. Cloning fresh repo
Line 6: git clone --filter=blob:none https://github.com/primarynav/Haply
Line 7: Preparing Git Reference refs/heads/main
Line 8: Installing dependencies
Line 9: mise [36m~/.config/mise/config.toml[0m tools: [34mpython[0m@3.14.3
Line 10: mise [36m~/.config/mise/config.toml[0m tools: [34mruby[0m@3.4.8
Line 11: mise [36m~/.config/mise/config.toml[0m tools: [34mgo[0m@1.26.0
Line 12: Downloading and installing node v22.22.1...
Line 13: Downloading https://nodejs.org/dist/v22.22.1/node-v22.22.1-linux-x64.tar.xz...
Line 14: Computing checksum with sha256sum
Line 15: Checksums matched!
Line 16: Now using node v22.22.1 (npm v10.9.4)
Line 17: Enabling Node.js Corepack
Line 18: No npm workspaces detected
Line 19: Installing npm packages using npm version 10.9.4
Line 20: Failed during stage 'Install dependencies': dependency_installation script returned non-zero exit code: 1
Line 21: npm error code E404
Line 22: npm error 404 Not Found - GET https://registry.npmjs.org/@jsr%2fsupabase__supabase-js - Not found
Line 23: npm error 404
Line 24: npm error 404  '@jsr/supabase__supabase-js@^2.49.8' is not in this registry.
Line 25: npm error 404
Line 26: npm error 404 Note that you can also install from a
Line 27: npm error 404 tarball, folder, http url, or git url.
Line 28: npm error A complete log of this run can be found in: /opt/buildhome/.npm/_logs/2026-03-15T02_16_35_740Z-debug-0.log
Line 29: Error during npm install
Line 30: Failing build: Failed to install dependencies
Line 31: Finished processing build request in 17.821s