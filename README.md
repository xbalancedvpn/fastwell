# FastWell — Offline-first fasting companion

**Free. No login. No subscription. No analytics. No backend.**

A mobile-friendly progressive web app for tracking fasting windows, meals, water intake, and weight. This is an original wellness tracker, not affiliated with FitFast.

## Features

- Fasting timer: 12:12, 14:10, 16:8 and 18:6 plans. Every completed or early-ended session is stored locally.
- Meal journal with meal types, optional notes, dates and a history.
- Editable seven-day meal planner with Filipino-inspired starter ideas.
- Water log in 250 ml increments and adjustable daily goal.
- Weight entries, trend chart, optional goal weight and a session history.
- Daily streaks, completed goals and 7-day fasting chart.
- Download JSON backups and import them on another device.
- Installation support as a mobile PWA via HTTPS, with fully cached assets for offline use after the first visit.
- No external resources, accounts, ads, tracking or recurring fees.

## Run locally

For a simple **offline HTML file**, use `FastWell-offline.html` (included beside this folder in the delivery). Open it directly on your device or laptop. Whether it stores data across `file://` sessions depends on the browser, so make frequent JSON backups.

To test **PWA install and offline caching** locally, serve the files from this folder:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`. The service worker works on localhost or HTTPS, not `file://`.

## Publish online for free with GitHub Pages

1. Create a GitHub repository, for example `fastwell`.
2. Upload all files from this folder, including `index.html`, `app.js`, `style.css`, `sw.js`, `manifest.webmanifest` and `icons/`.
3. In GitHub repository **Settings → Pages**, select **Deploy from a branch**, branch **main**, folder **/(root)** and save.
4. After the site is available over HTTPS, visit it in Chrome on Android and choose **Install app** or **Add to Home screen** from the browser menu.
5. Open the app online once; then you can use the cached app and log data offline.

## Important limits

- Entries are stored **only on the device/browser where they were entered**. There is **no automatic syncing** across devices; export/import JSON for transfer. Being online does not upload data anywhere.
- The first visit to the hosted version must be online before offline caching is available.
- Clearing browser data, changing browsers, or reinstalling may delete records. Back them up regularly.
- App notifications, background alarms, smartwatch sync, calorie analysis and account login are not included in v1.
- This is not medical advice. Fasting may be unsafe for some people, including people with certain medical conditions or medicines, pregnant or breastfeeding people, minors, or people with eating disorders. Consult a clinician if unsure.

Copyright: original FastWell prototype. No FitFast branding, code or imagery used.
