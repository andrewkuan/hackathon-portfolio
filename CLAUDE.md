# Hackathon Participant Portfolio Website

A Next.js 14 portfolio site showcasing hackathon participants. Public grid of participant cards (photo, name, LinkedIn, Instagram). Password-protected admin panel to add/edit/delete participants.

## Tech Stack
- Next.js 14 (App Router, TypeScript, Tailwind CSS)
- Data: Vercel KV (production) / `data/participants.json` (local dev)
- Auth: bcrypt password compare → JWT cookie (`jose`, Edge-compatible)
- Uploads: local `public/uploads/` in dev; Vercel Blob in production
- LinkedIn scraping: server-side fetch for `og:image` meta tag — may return null (LinkedIn blocks bots)

## Commands
```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run start    # run production build
```

## Environment Variables

`.env.local` (never commit):
```
ADMIN_PASSWORD_HASH=   # bcrypt hash of admin password (see below)
JWT_SECRET=            # random string, at least 32 chars
BLOB_READ_WRITE_TOKEN= # auto-set by Vercel when Blob store is linked
KV_REST_API_URL=       # auto-set by Vercel when KV store is linked
KV_REST_API_TOKEN=     # auto-set by Vercel when KV store is linked
```

Generate password hash:
```bash
node -e "require('bcryptjs').hash('yourpassword', 12).then(console.log)"
```

## Data Storage
- **Production (Vercel KV)**: active when `KV_REST_API_URL` + `KV_REST_API_TOKEN` are set. Data persists permanently.
- **Local dev**: falls back to `data/participants.json` when KV vars are absent.
- Storage key: `"participants"` (array of Participant objects).

## Data Model

```typescript
{
  id: string;           // crypto.randomUUID()
  name: string;
  linkedinUrl: string;  // full URL, e.g. https://linkedin.com/in/handle
  instagramUrl: string; // full URL, e.g. https://instagram.com/handle
  photoUrl: string;     // "/uploads/<file>", LinkedIn CDN URL, or ""
  photoSource: "linkedin" | "upload" | "none";
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}
```

## Key Files
- `src/lib/db.ts` — KV (production) or JSON file (local) with identical API
- `src/lib/scrape.ts` — fetch LinkedIn og:image server-side
- `src/lib/storage.ts` — file upload (local fs or Vercel Blob)
- `src/lib/auth.ts` — signJwt / verifyJwt using `jose`
- `middleware.ts` — protects all `/admin/*` routes (Edge runtime)
- `src/components/ParticipantForm.tsx` — shared add/edit form with scrape + upload
- `src/app/page.tsx` — public portfolio grid
- `src/app/login/page.tsx` — admin login
- `src/app/admin/` — admin panel pages

## API Routes
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | none | Verify password, set JWT cookie |
| POST | `/api/auth/logout` | none | Clear JWT cookie |
| GET | `/api/participants` | none | List all participants |
| POST | `/api/participants` | JWT | Create participant |
| PUT | `/api/participants/[id]` | JWT | Update participant |
| DELETE | `/api/participants/[id]` | JWT | Delete participant |
| POST | `/api/scrape-linkedin` | JWT | Fetch og:image from LinkedIn URL |
| POST | `/api/upload` | JWT | Upload photo (5MB max, images only) |

## LinkedIn Scraping Notes
- Server-side fetch with browser User-Agent to LinkedIn profile URL
- Extracts `og:image` content via regex
- Returns `null` on HTTP 999 (bot-block), 429, network error, or no match
- Admin form always shows manual upload option as fallback

## Vercel Deployment
1. Push to GitHub
2. Import repo in Vercel dashboard
3. Set env vars: `ADMIN_PASSWORD_HASH`, `JWT_SECRET`
4. **Storage → KV → Create store → link to project** (auto-sets `KV_REST_API_URL` + `KV_REST_API_TOKEN`)
5. **Storage → Blob → Create store → link to project** (auto-sets `BLOB_READ_WRITE_TOKEN`)
6. Deploy — no build config changes needed
