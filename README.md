# Memorable — AI-Powered Recipe Finder & Sharing Platform

A full-stack B.Tech major project: a recipe discovery and sharing platform
that blends the Spoonacular recipe database with user-generated recipes,
a Google Gemini-powered cooking assistant, and social features (likes, saves,
reviews, comments, follows).

**Status: code-complete for the features listed below, but never actually
run.** This was built in an environment with no network access, so
`npm install` has never been executed and nothing has been opened in a
browser — only TypeScript's `tsc --noEmit` has checked the code for syntax
errors. Treat this as a strong, internally-consistent starting point, not
a verified, production-tested app. Run it yourself, see what breaks, and
go from there.

## Structure

```
memorable/
├── backend/     Express + TypeScript API
└── frontend/    Next.js (App Router) + TypeScript + Tailwind
```

## Backend

**Stack:** Node.js, Express, TypeScript, Mongoose (MongoDB), JWT auth,
Google OAuth, Spoonacular API, Google Gemini API, Cloudinary, Zod.

```
cd backend
cp .env.example .env      # fill in your keys (see below)
npm install
npm run dev                # starts on http://localhost:5000
```

### What's implemented
- **13 Mongoose models**: User, Recipe, Category, Ingredient, SavedRecipe,
  Like, Review, Comment, Notification, SearchHistory,
  AIRecommendationHistory, Report, PageView
- **Auth**: register/login (bcrypt + JWT access+refresh tokens), Google
  OAuth, refresh, logout — all validated with Zod schemas
- **Recipes**: search/filter (text, cuisine, diet, meal type, ingredient
  list, and a `season` filter — `Spring`/`Summer`/`Autumn`/`Winter`, or
  `season=current` to let the server resolve today's date to a season
  via `utils/season.ts`; a `sort` param: `recent` / `trending` /
  `topRated` / `mostSaved`), CRUD
  for user-created recipes, like/save toggles (saves support named
  collections), reviews (submit + list, running average rating),
  comments, similar-recipes lookup, a `/recommended` endpoint that
  blends the viewer's preferences + recent searches with a trending
  fallback. On page 1, a text search also queries Spoonacular live
  and merges the (normalized - same shape as our own Recipe documents,
  not Spoonacular's raw response) results in after the local ones, so
  search isn't limited to whatever's already been imported. A recipe
  detail request for an id prefixed `spoonacular:<id>` fetches and
  normalizes that single recipe the same way. Since Spoonacular
  recipes aren't real documents in our database, liking/saving/
  reviewing/commenting on one is rejected with a clean 400
  (`middleware/validateObjectId.ts`) rather than crashing, and the
  frontend hides those actions for externally-sourced recipes.
  Search/detail use `optionalAuth` so a signed-in
  viewer's own liked/saved/rated state comes back as `viewerState`
- **AI routes** (`/api/ai/*`) — powered by **Google Gemini**
  (`services/gemini.service.ts`, model `gemini-2.5-flash`; swap the
  `MODEL` constant for a different one): cooking assistant, ingredient
  substitute, meal planner (returns structured day-by-day JSON, saved
  as a real `MealPlan` document rather than a wall of text — see
  below), recipe summarizer, nutrition explainer, a natural-language
  `smart-search` (turns "something spicy and quick, no meat" into
  structured filters, wired into the `/search` page), and a
  conversational `chat` endpoint for the floating widget — each
  logged to `AIRecommendationHistory`, all Zod-validated
- **Meal plans**: `/api/meal-plans/mine`, `/:id` (get/update/delete,
  owner-only) — generating one via `/api/ai/meal-plan` saves it here
  instead of just returning text, so it shows up as a real page users
  can revisit, edit day-by-day, or delete
- **Users**: profile (get/update), public profile + their recipes,
  saved/liked recipes, move a saved recipe between named collections,
  follow/unfollow (fires a notification), notifications, `/featured`
  (top authors by recipe count + total likes), `/me/feed` (chronological
  activity - new recipes/likes/comments/reviews - from people you follow)
- **Uploads**: `POST /api/uploads/image` and `/api/uploads/video` —
  multer in-memory buffering straight to Cloudinary, no disk writes
- **Newsletter**: `POST /api/newsletter/subscribe` and
  `GET /api/newsletter/unsubscribe/:token` — a real `NewsletterSubscriber`
  collection (not just a form), with a nodemailer-backed
  `services/email.service.ts` that sends a confirmation email when SMTP
  is configured and otherwise just logs it (same graceful-degradation
  pattern as the Spoonacular/Gemini/Cloudinary services) so signups
  still succeed either way
- **Reports**: any signed-in user can report a recipe/comment/review/user
  (`POST /api/reports`); admins list/resolve/dismiss them
- **Blog**: `GET /api/blog` / `GET /api/blog/:slug` (public, published
  only). Any signed-in user can `POST /api/blog` (saved as draft),
  `PATCH`/`DELETE` their own post, and `GET /api/blog/me/mine` to see
  their drafts + published posts. Admin moderates at `/api/admin/blog/*`
  — `pending` queue, `:id/approve`, full edit override, delete any post
- **Contact**: `POST /api/contact` saves to `ContactMessage` and emails
  `CONTACT_EMAIL` via `email.service.ts` (same best-effort pattern as
  newsletter - the submission still succeeds if the email fails); admin
  lists/updates status at `/api/admin/contact-messages/*`
- **Admin**: dashboard stats (including daily/weekly visitor counts from
  `PageView` and active newsletter subscriber count), user list + role
  management, recipe moderation (approve/delete), category CRUD, comment
  moderation, review moderation, report moderation, subscriber list,
  blog post management, contact message inbox — 10 tabs total
- **Analytics**: `POST /api/analytics/track` — a minimal, fire-and-forget
  page-view logger (path + timestamp, no cookies or session stitching)
  that feeds the admin dashboard's visitor counts
- **Notification triggers actually fire**: `recipe_approved` (on admin
  approve), `recipe_liked` (on like, skips self-likes), `new_follower`,
  `new_comment` — all wired into the relevant controllers, not just
  defined on the model
- **Security**: helmet, CORS locked to `CLIENT_URL`, rate limiting
  (general/auth/AI tiers), mongo-sanitize, xss-clean, centralized error
  handling (Multer errors like "file too large" caught as 400s)

### Standalone scripts
Three scripts live in `src/scripts/`. Two are jobs that need real
infrastructure (a cron scheduler, a task queue) to run on a schedule —
that's outside what this environment can set up, so they're plain
scripts you point cron/Task Scheduler at yourself. The third is a
one-time demo data seeder:

- `npm run import:spoonacular` — pulls recipes for a fixed list of search
  terms from Spoonacular and upserts them into the `recipes` collection,
  so search doesn't hit the third-party API live on every request
- `npm run recommendations:weekly` — for every user, asks the AI to
  explain why a short list of recipes suits their preferences, logs it,
  and drops a `weekly_ai_recommendation` notification
- `npm run seed:demo` — the odd one out: not a cron job, just a
  one-time seeder for demoing/presenting the project. Wipes and
  repopulates users, recipes across 10 cuisines (each tagged with
  inferred seasons so the homepage's seasonal rail isn't empty),
  categories, likes,
  saves (into named collections), reviews, comments, follows,
  notifications, search history, AI history, reports, and page views.
  Only needs `MONGODB_URI` — AI history entries use canned text, not
  real Gemini calls. **Every seeded user's password is
  `Password123!`**; the seeded admin is `admin@memorable.dev`. Only
  run this against a dev/demo database, never production — it clears
  collections first

Both cron-style scripts need `MONGODB_URI` set; the first also needs
`SPOONACULAR_API_KEY`, the second `GEMINI_API_KEY`.

### Required environment variables
See `backend/.env.example`. At minimum you need `MONGODB_URI`,
`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` to boot; `SPOONACULAR_API_KEY`
and `GEMINI_API_KEY` for the recipe/AI features to actually respond;
`CLOUDINARY_*` for image/video uploads; `GOOGLE_CLIENT_ID`/
`GOOGLE_CLIENT_SECRET` for Google sign-in; `SMTP_HOST`/`SMTP_USER`/
`SMTP_PASS` for newsletter confirmation emails to actually send (any
provider's SMTP works - Gmail app password, SendGrid, Resend, etc.).
Without SMTP configured, subscriptions still save correctly, the email
just gets logged to the console instead of sent.

## Frontend

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, React
Query, Axios, react-hook-form, lucide-react.

```
cd frontend
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm install
npm run dev                  # starts on http://localhost:3000
```

### What's implemented
- Design system in `tailwind.config.ts` / `globals.css` — a warm,
  ink-on-paper palette (see `DESIGN.md`) instead of default Tailwind
- **21 pages**: home, search, recipe detail, recipe edit, create recipe,
  AI tools hub, dashboard, admin, public profile, settings, login,
  register, activity feed, unsubscribe, about, blog + write + edit
  post, contact, meal plan detail
- **Real auth context** (`context/AuthContext.tsx`) — access token lives
  in memory only, re-minted from the httpOnly refresh cookie on load.
  `ProtectedRoute` gates dashboard/create-recipe/edit/admin/ai-tools/
  settings, redirecting to `/login` (or `/` for non-admins on
  admin-only pages)
- **Home page** (server component, ISR-revalidated every 60s): hero,
  mood-based browse links, a **Seasonal picks rail** (title changes with
  the actual current season via `getCurrentSeason()`, e.g. "Winter
  picks"), Trending / Recently Added / Top Rated / Community Picks
  rails (each a different `sort` param), Featured
  Creators, and a presentational newsletter signup (no email service is
  wired up — see the comment in `app/page.tsx`)
- **Recipe detail**: optimistic like/save, star-rating reviews, threaded
  comments, video playback, an Edit button for the recipe's own author,
  and a Report button
- **Search**: debounced text input (350ms, syncs to the URL), filter
  chips (cuisine/diet/meal type/season), an inline AI cooking-assistant
  panel, and real infinite scroll
  (IntersectionObserver sentinel + `useInfiniteQuery`) instead of a
  "Load more" button or plain pagination
- **Create/edit recipe** — one shared `RecipeForm` component for both
  flows, with dynamic ingredient/step lists, category tag-pickers
  (cuisine/meal type/diet/season), an
  image uploader, and an optional video uploader (Cloudinary)
- **Dashboard** — tabbed: My recipes / Saved (grouped into named
  collections, with a "move to collection" control) / Liked / AI
  history / Notifications, all backed by real `useQuery` calls
- **Admin dashboard** — 7 tabs: overview stats, pending-recipe queue,
  users (role management), categories (create/delete), comments
  (moderate/delete), reviews (moderate/delete), reports
  (resolve/dismiss) — all gated by `ProtectedRoute requireAdmin`
- **Public profiles + follow/unfollow** (`/users/[id]`) with an
  optimistic follow toggle
- **Profile settings** — name, bio, avatar upload, cooking preferences
  (feeds into `/recipes/recommended` and the weekly AI job)
- **AI tools hub** (`/ai-tools`) — all 5 AI features in one tabbed page
- **Floating AI chat widget** (`components/FloatingChatWidget.tsx`) —
  mounted globally in the root layout, so it's available on every page,
  not just `/ai-tools`. One conversational endpoint (`POST /api/ai/chat`)
  handles three jobs in the same conversation:
  - **Finding real recipes** — uses actual Gemini function-calling (not
    just a prompt instruction): the model can call a `search_recipes`
    tool with keywords/cuisine/diet/mealType, the backend runs that
    against the real `Recipe` collection, and the matches come back to
    the widget as clickable recipe cards (image, title, time) inside
    the chat bubble, linking to the real recipe pages. The system
    prompt is explicit that only tool results are real site recipes —
    anything else it describes is conversational advice, not a link
  - **Cooking help** — substitutes, meal plans, recipe summaries,
    nutrition explanations (no tool call needed)
  - **Site support** — "how do I save a recipe" or "how many recipes
    have I published" get real answers, because the backend builds a
    `SITE_HELP` reference block (what each page/feature does) plus a
    live snapshot of the signed-in user's own account (recipe/saved/
    liked counts, preferences, unread notifications) and feeds both
    into the system prompt
  It's read-only by design — the assistant can describe the account
  and find recipes, but it's told explicitly never to claim it changed
  anything, and to point elsewhere for billing/account deletion. Sends
  up to the last 20 turns per request; each exchange is logged to
  `AIRecommendationHistory` as type `"chat"`, with any matched recipes
  in `relatedRecipes`. Shows a sign-in prompt instead of the input box
  when signed out
- **Smart search** — wired into `/search` behind an "Or describe what
  you want in your own words" toggle. Runs alongside the regular
  filtered grid rather than replacing it: results show in their own
  section with a chip summary of what the AI understood
  (keywords/cuisine/diet/meal type), with a clear button to dismiss it
- **Activity feed** (`/feed`) — a chronological feed of what people you
  follow have been doing: new recipes published, likes, comments, and
  reviews, each linking to the actor's profile and the recipe. Built
  as a read-only merge across the existing `Recipe`/`Like`/`Comment`/
  `Review` collections (`GET /api/users/me/feed`) rather than a new
  write-on-every-action feed table — simpler, and correct at this
  scale. Empty state points new users toward following someone
- **Newsletter** (`components/NewsletterForm.tsx` on the home page) —
  a real submit against `POST /api/newsletter/subscribe`, with loading/
  success/error states instead of the earlier do-nothing form.
  `/unsubscribe/[token]` is a proper confirmation page (not raw JSON)
  that the email's unsubscribe link lands on. Admin has a "Newsletter"
  tab listing active subscribers
- **Hero carousel** (`components/HeroCarousel.tsx`) — auto-advancing
  every 5s (pauses on hover), manual prev/next arrows, dot navigation,
  each slide links to a real page (`/search?query=...`, `/ai-tools`).
  Hotlinks curated Unsplash food photography per Unsplash's own API
  guidelines; each slide falls back to a plain gradient if its image
  ever fails to load, so the hero never shows a broken-image icon.
  Swap `SLIDES` in the component for your own photography any time
- **Search autocomplete** (`components/SearchBar.tsx`, used on the
  homepage) — a short-debounce (250ms) dropdown of up to 5 matching
  recipes as you type, each a direct link to that recipe; closes on
  outside click or selection. The `/search` page's own input doesn't
  duplicate this — it already live-updates the results grid below it
  as you type, so a second dropdown would be redundant there
- **Recipe photo gallery** — `images: string[]` alongside the existing
  `imageUrl` cover photo; `GalleryUploader` on the recipe form lets an
  author add up to 6 extra photos (different angles, plating, etc.),
  and the recipe detail page shows a main image with a clickable
  thumbnail strip beneath it (only when there's more than one photo)
- **Blog related posts** — the post detail page shows up to 3 other
  published posts (recency-based, since posts don't have tags/
  categories yet) below the article
- **Navbar** — now includes a Blog link, and an avatar circle (first
  initial) next to the name when signed in, both linking to `/settings`
- **Meal plan pages** (`/meal-plans/[id]`) — generating a plan from
  `/ai-tools` redirects here instead of showing raw text: each day is
  its own card (breakfast/lunch/dinner), editable inline per day, with
  a delete-plan button. Listed on a new "Meal plans" dashboard tab
- **Hindi/English language support** — a lightweight custom system
  (`lib/i18n/`, `context/LocaleContext.tsx`), not `next-intl` or
  URL-prefixed routing (`/en/...`, `/hi/...`). Deliberate choice: this
  environment can't `npm install` or run a build, so restructuring
  every route into an `app/[locale]/` tree with middleware isn't
  something that could be verified — a client-side context (same
  pattern as `AuthContext`) is safer to get right without ever running
  it. `en.ts` is the source of truth; a `DeepStringify<typeof en>`
  type means `hi.ts` must have every key `en.ts` has (TypeScript
  errors if one's missing) but isn't forced to hold the literal
  English text. The switcher (`components/LanguageSwitcher.tsx`, in
  the navbar) persists the choice to `localStorage`; `useLocale().t()`
  resolves dotted keys ("nav.discover") with `{placeholder}`
  interpolation, falling back to the key itself if a translation is
  missing (so gaps are visible, not blank).
  **Scope: UI chrome only** (nav, buttons, labels, headings, empty
  states) — covers Navbar, Footer, home page, search, login/register,
  AI tools hub, dashboard (tabs + headings), settings, the recipe
  create/edit form, recipe detail (action buttons + section headings),
  contact, and the blog list/detail page's chrome. **Not translated,
  deliberately**: user-generated content (recipe titles/steps, blog
  post bodies, comments, reviews) — that's data typed by a real
  person, not UI copy, so auto-translating it would misrepresent what
  they wrote; AI responses (the model already replies in whatever
  language it's asked, independent of this system); backend
  validation/error messages (would need a second, server-side i18n
  layer - a real follow-up, not done here); the admin panel (internal
  tool); and the About page's longer marketing paragraphs (its
  headings/CTAs are translated, the prose itself wasn't - a good
  chunk of new copy to translate well, and lower priority than the
  pages above)
- **Skeleton loading states** (`components/skeletons/`) — every
  `isLoading` branch across the app (search results, recipe detail,
  comments/reviews, dashboard tabs, feed, all 10 admin panels) renders a
  shimmering placeholder shaped like the real content instead of a
  "Loading..." string, using a shared `.skeleton` shimmer-sweep
  animation defined in `globals.css` (styled with the site's own
  parchment/line tones, not generic gray). `RecipeCardSkeleton`/
  `RecipeGridSkeleton` mirror `RecipeCard`'s exact markup so there's no
  layout shift when real data swaps in. `app/loading.tsx`,
  `app/search/loading.tsx`, and `app/recipes/[id]/loading.tsx` are
  Next.js route-level loading states (shown during navigation, before
  the page's own `isLoading` logic even runs)
- **About** — a full, data-driven page rather than static copy: a live
  recipe count, a "Latest from the blog" rail pulling real published
  posts, and a "Cooked up by the community" strip from the same
  `/users/featured` endpoint the homepage uses. Built as an async
  server component (same `fetchJson` pattern as the homepage rails)
- **Blog** — same moderation model as recipes: any signed-in user can
  write a post (`/blog/write`, or edit their own at
  `/blog/[slug]/edit`), but it saves as a draft and only appears on
  the public `/blog` once an admin approves it. Editing a *published*
  post pulls it back to pending review, same reasoning as re-reviewing
  an edited recipe. Authors track their own posts (draft vs. live) from
  a "My posts" tab on the dashboard, and get a notification when a post
  is approved. Admin's "Blog" tab is a pending-review queue (approve/
  delete) plus an "all posts" view (unpublish/delete any)
- **Contact** — a real form against `POST /api/contact` (stored in
  `ContactMessage` and emailed to `CONTACT_EMAIL` via the same
  `email.service.ts` the newsletter uses). Admin's "Messages" tab lists
  submissions with mark-read/resolve actions. About/Blog/Contact are
  linked from a "Company"/"Explore" column in the footer, and the blog
  list and post pages are included in `sitemap.ts`
- **Google sign-in** (`components/GoogleSignInButton.tsx`) — needs
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set, otherwise shows a placeholder
- **Page-view tracking** (`components/PageViewTracker.tsx`) — mounted in
  the root layout, pings `POST /api/analytics/track` on every route
  change so the admin overview's visitor counts aren't always zero
- **SEO**: dynamic `<title>`/OpenGraph metadata for recipe and profile
  pages (via server `layout.tsx` files wrapping the client pages),
  static metadata for public pages, `robots: noindex` on private pages,
  plus `app/sitemap.ts` and `app/robots.ts`

### Deliberately out of scope
A few things from the original spec need infrastructure or design
decisions beyond what a scaffold should guess at, so they're left out
rather than faked:
- **Zod schemas** cover auth, recipes, reviews, comments, AI routes, and
  profile updates — not every single admin endpoint
- Video is uploaded straight to Cloudinary with no transcoding/adaptive
  streaming — fine for short clips, not a real video pipeline
- The newsletter sends one transactional confirmation email on
  signup (see below) — there's no weekly-digest email content or
  scheduled send job, just the subscribe/unsubscribe capture

## Design direction

See `DESIGN.md` for the visual identity (palette, type, and the
signature "recipe index card" motif used for nutrition/data chips) so
any pages you add can stay consistent.
