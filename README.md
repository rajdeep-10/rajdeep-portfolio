# Rajdeep Portfolio — Setup & Deploy Guide

Your site is now a real project (Vite + React) instead of a single file, with:
- **Admin Login** (top nav, where "Let's Connect" used to be) — only you can sign in
- **Live-editable content** for THM stats, HTB stats, CTF timeline, CTF events — saved to Supabase, visible to *every* visitor, not just your browser
- **CV upload/download** — upload a PDF once logged in, visitors download the latest version

---

## 1. Supabase setup

1. Go to [supabase.com](https://supabase.com) → sign up → **New Project**
   - Name: `rajdeep-portfolio` (or anything)
   - Set a strong database password — save it somewhere safe
   - Pick a region close to you (e.g. Mumbai / Singapore)
   - Wait ~2 min for provisioning

2. **Run the schema**: in the Supabase dashboard, go to **SQL Editor → New query**, paste the entire contents of `supabase_schema.sql` (included in this project), and click **Run**. This creates:
   - `site_content` table (stores all editable stats/timeline/events as JSON)
   - Row Level Security policies (public can read, only you can write)
   - A `cv` storage bucket (public read, only you can upload)

3. **Create your admin login**: go to **Authentication → Users → Add user**
   - Enter your email + a password
   - This is the ONLY account that will exist — that's what makes it "admin". Anyone who logs in with these exact credentials is treated as admin.
   - Do NOT enable public sign-ups (they're off by default — leave it that way)

4. **Get your API keys**: go to **Project Settings → API**
   - Copy the **Project URL**
   - Copy the **anon public** key (NOT the service_role key — never expose that one)

---

## 2. Local setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and paste in your Supabase URL and anon key:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Run locally:
```bash
npm run dev
```

Open the local URL it prints, click **Admin Login** in the nav, sign in with the account you created in step 1.3. You should now see settings/pencil icons appear on the THM/HTB stat cards and timeline — those are invisible to anyone not logged in.

---

## 3. Deploy to Vercel

1. Push this project to a GitHub repo (create a new repo, then):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/rajdeep-portfolio.git
   git push -u origin main
   ```
   (`.env` is gitignored — your keys won't be committed, which is correct. The anon key is safe to expose client-side, but we still keep it in env vars as good practice.)

2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo

3. Vercel auto-detects Vite. Before deploying, add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

4. Click **Deploy**. Done — you'll get a live URL like `rajdeep-portfolio.vercel.app`.

5. (Optional) Add a custom domain under **Project Settings → Domains**.

---

## 4. How the admin flow works

- Click **Admin Login** in the nav → enter your Supabase email/password
- Once logged in, edit controls (pencil/settings icons) appear on:
  - TryHackMe stats card
  - HackTheBox stats card
  - CTF Activity Timeline
  - CTF Events card
- Edits save instantly to Supabase and appear for all visitors immediately (no publish step, as you asked for)
- **CV**: next to the "Download CV" button, you'll see an upload icon (⇧) only when logged in. Click it, pick a PDF, and it replaces the file everyone downloads.
- Click **Admin Mode — Sign Out** to log out (button replaces Admin Login while logged in)

---

## 5. Suggestions for what else to make editable in Admin Mode

Your current setup covers stats/timeline/CV. Natural next additions, all following the same `useSiteContent` pattern already wired in (`src/lib/useSiteContent.js`):

- **Projects section** — add/edit/remove project cards (title, description, tags, links, screenshots)
- **Skills section** — add/remove skill badges without touching code
- **Bug bounty / write-ups list** — same pattern as CTF timeline
- **Hero tagline & description text** — small text edits without redeploying
- **Contact email / social links** — update without a new deploy
- **Profile photo** — same upload pattern as the CV, swap the hero image
- **Simple analytics** — Supabase can log page views/CV downloads to a table so you know if your site's actually being seen

I kept these out of this pass since you didn't ask for them yet — happy to wire any of them in following the same pattern once you've got the current setup live and confirmed it works end-to-end.

---

## Files reference

- `supabase_schema.sql` — run once in Supabase SQL Editor
- `.env.example` — copy to `.env`, fill in your keys
- `src/lib/supabaseClient.js` — Supabase connection
- `src/lib/AuthContext.jsx` — admin login/session state
- `src/lib/useSiteContent.js` — generic hook: any editable content reads/writes Supabase instead of localStorage
- `src/components/AdminLoginModal.jsx` — the login popup
- `src/components/CVButton.jsx` — download button + admin upload control
- `src/App.jsx` — your full site, now wired to the above
