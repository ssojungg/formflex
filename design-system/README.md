# FormFlex Design System

## Product Overview

**FormFlex** is an AI-powered survey platform (설문 플랫폼) that allows users to create, share, and analyze surveys. It is a Korean-language SaaS product with a clean, modern web UI and PWA mobile support.

**Source repository:** `ssojungg/formflex` (GitHub — private, requires access)  
Full path: `https://github.com/ssojungg/formflex`  
Also see: `SV-Winter-BootCamp-Team-C/FormFlex` (monorepo wrapper)

### Core Product Surfaces
1. **Marketing landing page** (`/`) — public hero, features, CTAs
2. **Auth screens** (`/login`, `/signup`) — split-panel login with branding left, form right
3. **Survey dashboard** (`/surveys`) — public survey grid, searchable, filterable
4. **My Forms** (`/myform`) — authenticated user's survey management (grid/list view)
5. **Template library** (`/templates`) — community survey templates
6. **Survey creator** (`/create`) — editor for building surveys
7. **Results / Analytics** (`/result`) — charts and analysis
8. **Response form** (`/responseform`) — public-facing survey fill-out
9. **My Page** (`/mypage`) — profile and settings

### Tech Stack
- React + TypeScript + Vite
- Tailwind CSS (custom config)
- Framer Motion (animations)
- React Query + Zustand

---

## CONTENT FUNDAMENTALS

### Language & Tone
- **Primary language:** Korean (한국어). All UI copy is in Korean; status labels (Active, Closed, Draft) remain in English.
- **Voice:** Friendly, concise, encouraging. Uses informal/neutral speech — not overly formal.
- **Perspective:** 2nd person implied — never "저희" corporate speak; speaks directly to the user.
- **CTAs:** Short and action-forward — e.g. "무료로 시작하기" (Start for free), "새 설문 만들기" (Create new survey), "설문 참여하기" (Take survey).
- **Tagline pattern:** "설문을 만들고, 분석하고, 공유하세요" — list of verbs, comma-separated.
- **Trust copy:** "신용카드 없이 시작 가능 · 무제한 설문 생성" — bullet-dot separated features.
- **Numbers:** Korean locale formatting (toLocaleString), e.g. "18,432명", "1,000+ 사용자".
- **Emoji:** Not used in UI copy or navigation. Clean text-only interface.
- **Error messages:** Polite, full Korean sentences. e.g. "로그인에 실패했습니다."
- **English in UI:** Status badges (Active / Closed / Draft), section labels (Navigation, Pro Plan), and technical terms only.

---

## VISUAL FOUNDATIONS

### Color System
- **Primary:** Indigo `#6366f1` (primary-500) — buttons, active states, links, focus rings, badges
- **Primary range:** 50 (`#eef2ff`) → 900 (`#312e81`) — full Tailwind indigo scale
- **Backgrounds:** White (#fff) primary, `#f9fafb` (secondary/page bg), `#f3f4f6` (tertiary)
- **Sidebar:** Deep dark `#111827` → `#1f2937` gradient (near-black, not pure black)
- **Text:** Primary `#111827`, Secondary `#4b5563`, Tertiary `#6b7280`, Muted `#9ca3af`
- **Status:** Active = emerald `#10b981`, Closed = red `#ef4444`, Draft = gray `#9ca3af`
- **Semantic:** Success emerald, Warning amber `#f59e0b`, Error red `#ef4444`, Info blue `#3b82f6`
- **Legacy (deprecated):** darkPurple `#66629F`, purple `#918DCA`, skyBlue `#A3C9F0`
- **Gradients:** `linear-gradient(135deg, #f9fafb → #eef2ff → #e0e7ff)` for hero; `linear-gradient(135deg, indigo-500 → violet-600)` for CTA banners; per-survey theme color gradients on card headers

### Typography
- **Primary font:** Pretendard-Regular (CDN via noonfonts) — used for all body text, UI labels, headings
- **Display accent fonts (survey themes):** TmoneyRoundWindExtraBold, NPSfontBold, NPSfont (local TTF), omyu_pretty, seolleimcool-SemiBold — selectable per survey for personality
- **Base size:** 16px / line-height 1.5
- **Scale:** xs (10–12px), sm (13–14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px), 4xl (36px), 5xl (48px), 6xl (60px)
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Heading style:** Bold, tight leading, `text-secondary-900`

### Spacing & Layout
- **Sidebar width:** 200px desktop, 280px mobile drawer
- **Header height:** 64px mobile
- **Page padding:** 16px mobile → 32px desktop (p-4 → p-8)
- **Card gap:** 12–16px (gap-3 → gap-4)
- **Content max-width:** 7xl (1280px)

### Border Radius
- Buttons / inputs: `rounded-xl` (12px)
- Cards: `rounded-2xl` (16px)  
- Large cards / sections: `rounded-3xl` (24px), `rounded-[2rem]`
- Badges / pills: `rounded-full`
- Icon containers: `rounded-lg` (8px) or `rounded-xl`

### Shadows
- Card resting: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)`
- Card hover: `0 10px 40px rgba(0,0,0,0.08)`
- Sidebar: `4px 0 24px rgba(0,0,0,0.08)`
- Dropdown: `0 4px 20px rgba(0,0,0,0.12)`
- Modal: `0 20px 60px rgba(0,0,0,0.15)`

### Cards
- White background, `rounded-2xl`, `shadow-card`
- Hover: `shadow-card-hover` + `scale(1.02)` transform
- Survey card headers: theme-color gradient (per-survey accent), with decorative horizontal lines bottom-right
- Stats cards: icon container with colored bg (primary-100, blue-100, amber-100, emerald-100) + large bold number

### Animations & Motion
- Framer Motion for grid/list transitions, modals (scale + opacity)
- CSS keyframes: slideIn (translateX -100%→0), fadeIn (opacity 0→1), scaleIn (scale 0.95→1 + opacity)
- Duration: 200ms (fast transitions), 300ms (slide), 250ms/350ms extended
- Easing: `ease-out` for entrances, `ease-in` for exits
- Hover: subtle `hover:-translate-y-0.5` lift on primary CTAs; `active:scale-[0.98]` press state
- Reduced motion: all animations disabled when `prefers-reduced-motion: reduce`

### Backgrounds & Imagery
- **Page backgrounds:** Flat `#f9fafb` — no textures, no patterns
- **Hero section:** Gradient blob (`from-primary-100 via-primary-50 to-white`) around a browser mockup
- **Left auth panel:** `from-primary-500 via-primary-600 to-primary-700` + subtle blurred white circle overlays (opacity-10) for depth
- **Imagery:** No photography in UI; uses browser/MacBook mockup illustrations
- **No hand-drawn illustrations, no textures, no grain**

### Hover & Interactive States
- Buttons: `hover:bg-primary-600` (darker shade)
- Ghost/secondary buttons: `hover:bg-secondary-50` or `hover:bg-secondary-200`
- Nav items: `hover:bg-secondary-800 hover:text-white` (sidebar), `hover:text-secondary-900` (top nav)
- Cards: scale + shadow lift
- Press/active: `active:scale-[0.98]` slight shrink

### Icons
- All inline SVG, `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap="round"`, `strokeLinejoin="round"` — Lucide-style line icons
- Size: 16×16 (small), 20×20 (standard), 24×24 (large)
- No icon font; no emoji; no PNG icons in UI

---

## ICONOGRAPHY

FormFlex uses **custom inline SVG line icons** styled after the Lucide icon family (stroke-based, rounded caps/joins, strokeWidth=2). There is no icon font or sprite sheet — all icons are defined as React functional components inline in each file.

- **Style:** Outlined / stroke, not filled. Consistent `w-px h-px` Tailwind sizing.
- **Color:** Inherits `currentColor` — adapts to parent text color.
- **No emoji used in icons or navigation.**
- **CDN substitute:** If needed externally, use [Lucide Icons](https://lucide.dev) — the closest CDN match. Load via `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`.

### Copied SVG Assets (`assets/icons/`)
| File | Usage |
|------|-------|
| `navAll.svg` | Nav: All surveys |
| `navForm.svg` | Nav: My forms |
| `navRes.svg` | Nav: Responses |
| `add.svg` | Add/create action |
| `delete.svg` | Delete action |
| `editPencil.svg` | Edit action |
| `copy.svg` | Copy/duplicate |
| `logout.svg` | Logout |
| `check.svg` | Confirm/done |
| `menuAnalysis.svg` | Dropdown: analytics |
| `menuEdit.svg` | Dropdown: edit |
| `menuDel.svg` | Dropdown: delete |
| `menuLink.svg` | Dropdown: share link |
| `menuSee.svg` | Dropdown: preview |
| `flexLine.svg` | Decorative flex line |
| `email.svg` | Email field icon |
| `drop.svg` | Dropdown chevron |

**Logo:** `assets/logo.svg` — the FormFlex wordmark/symbol.

---

## FILE INDEX

```
/
├── README.md                  ← You are here
├── SKILL.md                   ← Agent skill entrypoint
├── colors_and_type.css        ← CSS custom properties (colors, type, spacing)
├── assets/
│   ├── logo.svg               ← FormFlex logo
│   └── icons/                 ← SVG icon assets (19 files)
├── fonts/
│   └── NPSfont_regular.ttf    ← Local NPS font (display weight)
├── preview/                   ← Design system card previews
│   ├── colors-primary.html
│   ├── colors-neutral.html
│   ├── colors-semantic.html
│   ├── colors-status.html
│   ├── type-scale.html
│   ├── type-fonts.html
│   ├── spacing-tokens.html
│   ├── shadows-radius.html
│   ├── components-buttons.html
│   ├── components-inputs.html
│   ├── components-badges.html
│   ├── components-cards.html
│   └── logo-brand.html
└── ui_kits/
    └── webapp/
        ├── README.md
        ├── index.html          ← Interactive UI prototype
        ├── Sidebar.jsx
        ├── SurveyCard.jsx
        ├── StatsCard.jsx
        └── Topbar.jsx
```
