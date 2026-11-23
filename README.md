# FastWell — offline-first fasting & wellness companion

**Hosting:** GitHub Pages + GitHub Actions. **Accounts:** optional Supabase Auth (email/password).
**Data:** guest records on device; signed-in users may explicitly opt into cloud sync.
**Status:** beta — do not rely on multi-device sync for critical health records until tested.

## URLs

- Existing GitHub Pages: https://xbalancedvpn.github.io/fastwell/
- Intended custom domain: https://fastfitwell.xbalanced.net/
- Supabase project: rgdkkswwlglkqeepgear (dedicated FastFitWell project)

## Domain activation (manual owner settings required)

1. Before switching domains, **export a JSON backup** on the existing site if you
   have used it. Browser storage is origin-specific and records from
   `xbalancedvpn.github.io` do not automatically move to `fastfitwell.xbalanced.net`.
2. Cloudflare DNS: CNAME name `fastfitwell`, target `xbalancedvpn.github.io`, DNS only initially.
3. GitHub repo **Settings → Pages → Custom domain**: `fastfitwell.xbalanced.net` → Save.
   The Pages build source is **GitHub Actions**. Do not change it to "Deploy from a branch."
   A repository `CNAME` file does not configure a custom domain in GitHub Actions mode.
4. After GitHub DNS checks/certificate complete, enable **Enforce HTTPS**.
5. Supabase project **Authentication → URL Configuration**:
   Site URL `https://fastfitwell.xbalanced.net/`.
   Redirect URL allow list should contain both
   `https://fastfitwell.xbalanced.net/**` and
   `https://xbalancedvpn.github.io/fastwell/**` during the transition.
6. On the custom domain, import your previous JSON backup as needed.
7. Test guest mode, sign-up, email confirmation, password recovery, sign-in/out,
   local and cloud data reconciliation, cross-account isolation and offline behavior.

## Features

- First-time health assessment: age, height, weight, BMI context, safety questions,
  sleep/wake times, meals, physical activity, eating habits, and goals.
- Conservative fasting starter suggestions for screened eligible adults.
- Fasting timer, history, food journal, editable weekly meal planner, hydration
  and weight tracking.
- Offline asset caching with a service worker and local record storage.
- Guest mode, account UI, optional per-account backups with owner-only RLS.
- JSON export/import backups.

## How to develop

All app files are static and deployed from the repository root through
`.github/workflows/deploy.yml`. Do not publish secrets in GitHub Pages.
The Supabase publishable key is intentionally used in browser code; database
access is protected by Row Level Security. NEVER use a service-role key in
frontend code.

## Limitations and safety

- Online account/sync flows are a beta. Multi-device conflicts need explicit
  review; never assume a record uploaded just because the device is online.
- Guest data are local to each browser and domain. Export backups before switching.
- Fasting is optional and not suitable for everyone. BMI is not a clinical
  suitability test. Users who require medical review must not be given
  automatic fasting targets.
- The app is educational and does not replace medical care.

Copyright: original FastWell prototype. No FitFast branding, code or imagery used.
