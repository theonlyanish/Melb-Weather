# LocalSky

LocalSky is a weather app for Australian cities built with Next.js. It pulls live forecast data, blends it with city-specific copy, and presents it in a more editorial, local-feeling dashboard instead of a plain utility layout.

The app currently focuses on Melbourne, Sydney, Brisbane, Hobart, and Perth, with regional city switching for places like Geelong, Ballarat, Newcastle, Wollongong, Gold Coast, Cairns, Fremantle, and more.

## What it does

- Shows current conditions with animated weather states
- Displays the next 24 hours of forecast data
- Displays a 7-day forecast
- Lets you switch between major cities and supported regional cities
- Generates city-specific weather microcopy and local "story" cards
- Supports light and dark themes
- Caches weather responses to keep the UI fast

## What makes it different

Most weather apps stop at temperature, rain chance, and wind. LocalSky adds a layer of local context.

Instead of generic side cards, it generates city-aware indicators like:

- `Tram Delays` and `Yarra River Level` for Melbourne
- `Beach Day Score` and surf-related context for coastal cities
- `Storm Risk` and `River Level` for Brisbane and Queensland cities
- `Aurora Chance` and `Fireplace Index` for Tasmania
- `Fremantle Doctor` and `Beach Perfect` for Perth and nearby coastal areas

It also rotates short bits of location-specific microcopy so the app feels closer to local weather radio than a bare forecast table.

## Stack

- `Next.js 16` with the App Router
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `Framer Motion` for animation
- `next-themes` for theme switching
- `Open-Meteo` for live forecast data
- `Vercel Analytics`

## How it works

Weather data is fetched server-side from Open-Meteo and revalidated every 5 minutes. Static city data in `data/cities.json` fills in local microcopy, state groupings, and regional city lists. The app then merges both sources into a single location model used across the dashboard and the `/api/weather` route.

The result is a forecast app with live data underneath, but a more opinionated presentation layer on top.

## Running locally

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000`

## Environment

No required environment variables are needed for local development.

Optional:

- `NEXT_PUBLIC_SITE_URL` for canonical metadata, Open Graph tags, and structured data

Example:

```bash
NEXT_PUBLIC_SITE_URL=https://localsky.vercel.app
```

## Project structure

```text
app/
  api/weather/route.ts      API route for weather lookups
  [city]/page.tsx           server-rendered city page (one route per city)
components/
  WeatherDashboard.tsx      main client dashboard
  Hero.tsx                  current conditions hero panel
  SidebarStories.tsx        local context and story cards
lib/
  weatherService.ts         Open-Meteo fetch and transform logic
data/
  cities.json               city groupings, microcopy, fallback story data
```

## Notes

- Weather responses are cached for 5 minutes with stale-while-revalidate behaviour
- If a live weather fetch fails, the app falls back to static city data so the page still renders
- Air quality fetching exists in the service layer, but it is currently not surfaced in the UI

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
