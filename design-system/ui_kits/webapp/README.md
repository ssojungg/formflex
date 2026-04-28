# FormFlex Web App UI Kit

Interactive click-through prototype of the FormFlex web application.

## Screens
- **My Forms** — authenticated user's survey grid with stats, filters, and card actions (default view)
- **Dashboard** — public survey discovery with search, filter tabs, hashtag filters
- **Analytics** — weekly response bar chart, completion ring chart, per-survey table
- **My Page** — user profile and settings

## Usage

Open `index.html` directly in a browser. Navigate between screens using the left sidebar.

## Components

All components are inline in `index.html` as React + Babel:

- `Sidebar` — dark nav sidebar with logo, nav items, user footer
- `SurveyCard` — survey card with theme-color header gradient, status badge, dropdown menu
- `PublicSurveyCard` — public-facing card for dashboard browsing
- `StatsCard` — stat with colored icon container + large number
- `MyFormsPage` — full page with stats + filter tabs + card grid
- `DashboardPage` — search bar + hashtag filters + public survey grid
- `AnalyticsPage` — bar chart + completion ring + table
- `ProfilePage` — user profile card + settings rows

## Design Tokens

All tokens sourced from `../../colors_and_type.css` and Tailwind config.

- Primary: `#6366f1` (indigo-500)
- Sidebar bg: `#111827` (neutral-900)
- Page bg: `#f9fafb`
- Card radius: 14px, shadow: `0 1px 3px rgba(0,0,0,0.08)`
- Font: Pretendard (CDN)
