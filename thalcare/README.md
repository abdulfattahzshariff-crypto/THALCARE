# ThalCare — Thalassemia Care Companion Web App

A personal health tracker for thalassemia major patients. Sign in, log transfusions, track daily Desferrioxamine medication, and monitor your care cycle — from any device, any browser.

---

## Tech stack

| Layer      | Tool                        | Cost         |
|------------|-----------------------------|--------------|
| Frontend   | React (Create React App)    | Free         |
| Hosting    | Vercel                      | Free tier    |
| Auth + DB  | Supabase                    | Free tier    |
| Domain     | Any registrar (optional)    | ~$12/yr      |

---

## Step 1 — Set up Supabase (database + auth)

1. Go to https://supabase.com and create a free account
2. Click **New project** — give it a name like "thalcare"
3. Once created, go to **SQL Editor** → **New query**
4. Paste the entire contents of `supabase_schema.sql` and click **Run**
5. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## Step 2 — Configure the app

1. Copy `.env.example` to a new file called `.env.local`
2. Fill in your Supabase values:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...your_anon_key...
```

---

## Step 3 — Run locally (optional, to test first)

You need Node.js installed (https://nodejs.org — download LTS version).

```bash
# Install dependencies
npm install

# Start the dev server
npm start
```

The app opens at http://localhost:3000. Create an account and test everything.

---

## Step 4 — Deploy to Vercel (free, takes 2 minutes)

1. Push your project to GitHub:
   - Go to https://github.com, create a new repo
   - Upload all the files (or use `git push` if you know Git)

2. Go to https://vercel.com and sign in with GitHub

3. Click **Add New Project** → import your GitHub repo

4. In the **Environment Variables** section, add:
   - `REACT_APP_SUPABASE_URL` = your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your Supabase anon key

5. Click **Deploy** — done! Vercel gives you a free URL like `thalcare.vercel.app`

---

## Step 5 — Custom domain (optional)

1. Buy a domain like `thalcare.app` from Namecheap or Google Domains (~$12/yr)
2. In Vercel: go to your project → Settings → Domains → add your domain
3. Follow the DNS instructions Vercel gives you

---

## Enabling email confirmation (recommended for production)

By default Supabase requires email confirmation before users can sign in.
To disable this for easier testing:
- Supabase dashboard → Authentication → Settings → **Disable email confirmations** (toggle off)

Re-enable it before sharing with others.

---

## Project structure

```
thalcare/
├── public/
│   └── index.html
├── src/
│   ├── lib/
│   │   ├── supabase.js       ← Supabase client
│   │   └── AuthContext.js    ← Sign in / sign out / session
│   ├── components/
│   │   └── Layout.js         ← Nav bar + page shell
│   ├── pages/
│   │   ├── AuthPage.js       ← Sign in / create account
│   │   ├── Dashboard.js      ← Overview + cycle tracker
│   │   ├── Transfusions.js   ← Log + history
│   │   ├── Medication.js     ← Daily DFO tracker
│   │   └── Info.js           ← About thalassemia
│   ├── App.js                ← Routing
│   ├── index.js              ← Entry point
│   └── index.css             ← Global styles
├── supabase_schema.sql       ← Run this in Supabase SQL editor
├── .env.example              ← Copy to .env.local and fill in values
└── package.json
```

---

## Security notes

- Each user can **only see their own data** (enforced by Supabase Row Level Security)
- Passwords are handled entirely by Supabase — never stored in your database
- The anon key is safe to include in the frontend (it only allows what RLS permits)
