# FastFitWell — approved online + offline architecture

**Status (2026-11-23): isolated Supabase project and private table deployed; optional account UI and cloud-sync beta committed to GitHub.**
Email confirmation/redirects and full end-to-end account and conflict testing are still required. Guest mode remains available.

## User flow

1. Welcome: **Continue as Guest** or **Create Account / Sign In** (email and password).
2. First-time assessment (already implemented): BMI, safety questions, sleep and meal times,
   physical activity, food preferences and goals.
3. Guest: no cloud transfer; save local entries; export JSON backup anytime.
4. Account: consent to cloud syncing health-related data; sync only this user's records.
5. A signed-in user switching devices gets their records after signing in online once;
   if offline, previously downloaded local data remains usable.

## Data strategy

- Account identity: Supabase Auth; email confirmation and recovery flows.
- User data: `public.fastwell_user_data` (one row per auth user) with strict owner-only RLS.
- Clients must use the **publishable/anon** key, NEVER service_role/secret.
- Local tracker: currently uses `fastwell-data-v1` in browser localStorage.
  Later implement migration to IndexedDB for larger datasets and an explicit sync queue.
- Use optimistic concurrency: select `snapshot,revision`; write with
  `update(...).eq('user_id',uid).eq('revision',expectedRevision)`
  to avoid blindly overwriting other devices' data.
- If revision changed or two offline devices edited same records: stop and show a
  **review/merge** flow. Do not silently replace, duplicate or discard history.
- Guest -> account: current beta offers **use cloud** or **upload local** choices (replacement, not a true merge). Export backups before switching; implement safe merge before production.
- On sign-out: do not expose a prior user's local health information to a new account
  or a guest. Isolate local caches per user, or clear active state after backing up.
- Backup/export, restore and delete own data must work for signed-in users as well.
- Cloud syncing is opt-in: consent covers storing fasting, weight, habits and
  potentially health screening answers with the service provider.
- Offline mode never implies data are already synchronized.

## Safety and privacy

- Fasting recommendations are not medical diagnoses. Do not recommend fasting
  solely from BMI. Existing safety gating is a starting point, not comprehensive
  clinical screening.
- Minimize medical questions and explain why each is asked.
- Apply owner-only RLS. `authenticated` alone is insufficient.
- Supabase project administrators and service infrastructure may access database
  data; user-to-user isolation is not end-to-end encryption.
- Verify backups, authentication redirect URLs, allowed email domains (if any),
  policies, restore and cross-account access before making registration public.
- Ensure privacy policy, consent, data export and deletion workflow are in place
  before handling real users' health-related data.

## Infrastructure

- PWA web: official https://fastfitwell.xbalanced.net/; legacy GitHub Pages URL https://xbalancedvpn.github.io/fastwell/.
- Host cutover requires GitHub Settings → Pages → Custom domain (GitHub Actions ignores CNAME files); HTTPS enforcement after certificate approval.
- Supabase Auth allowed redirect URLs must include both origins during cutover; set Site URL to the custom domain after cutover.
- Browser localStorage is scoped to an origin; export/import backup to move prior guest data across hosts.
- Database and auth: dedicated FastFitWell Supabase project `rgdkkswwlglkqeepgear`, not Coach Kazu.
- Offline: current service worker + localStorage, with IndexedDB-based persistent records planned.
- Sync UI: online/offline status + last synchronized timestamp + retry button;
  no false 'Synced' state when updates remain locally queued.

## Implementation sequence

1. User selects the Supabase organization / confirms any charges for a new project.
2. Provision **FastFitWell** as a new, isolated project; run `supabase/schema.sql`.
3. Verify RLS: owner can CRUD, anonymous and other users cannot read/write.
4. Configure Supabase Auth email confirmation + allowed redirect URLs.
5. Add account UI and local-first sync to PWA. Maintain guest access.
6. Test offline write, reinstall, new device, conflict handling, account switching,
   signout, backup/restore and deletion before enabling public registration.
