# Getting Started From GitHub

This guide walks you through downloading Reakt WebKit from GitHub, running it locally, editing the website, and preparing it for deployment.

## Requirements

- For the easiest path: a GitHub account and a browser
- For local development: Node.js 18 or newer, npm, a terminal, and a code editor
- For container setup: Docker Desktop

## Option 1: Use The Template

This is the cleanest way to start your own website from Reakt WebKit.

1. Open the repository on GitHub.
2. Click **Use this template**.
3. Choose **Create a new repository**.
4. Name your new repository.
5. Continue with Codespaces, Docker, or deployment.

If the **Use this template** button is missing, the repository owner needs to enable **Settings > General > Template repository**.

## Option 2: GitHub Codespaces

This is the best path for users who do not have Node.js, npm, or a local code editor ready.

1. Click the **Open in GitHub Codespaces** button in the README.
2. Wait for setup to finish.
3. Open the forwarded `5173` port.

The included devcontainer installs dependencies and starts the website automatically.

## Option 3: Docker

Install Docker Desktop, then run:

```bash
docker compose up
```

Then open:

- Website: `http://localhost:5173`
- Admin: `http://localhost:5173/admin/login`

## Option 4: Clone With Git

```bash
git clone https://github.com/ReaktDev/reakt-webkit.git
cd reakt-webkit
npm install
npm run dev
```

Then open:

- Website: `http://localhost:5173`
- Admin: `http://localhost:5173/admin/login`

## Option 5: Download ZIP

1. Open the GitHub repository.
2. Click **Code**.
3. Click **Download ZIP**.
4. Unzip the folder.
5. Open the folder in your terminal.
6. Run:

```bash
npm install
npm run dev
```

## Admin Login

Local Vite development uses a demo-only fallback password:

```txt
demo
```

For deployed sites, set server-only environment variables on Vercel, Netlify, or your Node host:

```txt
ADMIN_PASSWORD=your-password-here
ADMIN_SESSION_SECRET=your-long-random-session-secret
```

Do not prefix admin auth values with `VITE_`. Vite exposes `VITE_*` values to the public browser bundle.

## Edit The Website

1. Go to `/admin/login`.
2. Sign in with your password.
3. Use the dashboard to update:
   - Brand, logo, header, footer, and social links
   - Pages and page sections
   - Hero, services, about, testimonials, process, FAQ, contact, and CTA content
   - Theme presets, colors, fonts, layout presets, and hero presets
4. Click **Save changes**.

By default, saved content is stored in your browser using `localStorage`. You can switch to Supabase, Firebase Firestore, or Strapi in **Launch tools > Integrations**.

## Back Up Your Content

Before clearing your browser data or moving to another computer:

1. Open the admin dashboard.
2. Go to **Publish workflow**.
3. Download or copy the backup JSON.
4. Restore it later from the same tab.

## Choose Backend Or CMS Integrations

Open the admin dashboard and go to **Launch tools > Integrations**.

From there you can:

- Choose local storage, Supabase, Firebase, or Strapi as a backend path
- Choose no CMS, Sanity, Contentful, or WordPress API as a content source
- Copy or download the generated `.env.local` values
- Store public project IDs, record IDs, table/collection names, Strapi endpoints, and deploy webhook URLs
- Test the selected backend connection
- Push the current workspace to the backend
- Pull the latest backend config into the dashboard

Local browser storage stays active as a cache/fallback even when a backend adapter is selected.

## Help Users Without A Developer Setup

Open **Launch tools > Setup Help** in the admin dashboard.

This tab gives a plain-English setup path for:

- GitHub Codespaces
- Docker
- Hosted deployment through Vercel or Netlify
- Traditional local Node.js setup

## Build For Production

Run:

```bash
npm run build
```

This creates a production-ready `dist/` folder.

To preview the production build locally:

```bash
npm run preview
```

## Deploy

### Vercel

1. Push the project to GitHub.
2. Click the **Deploy to Vercel** button in the README, or import the repository in Vercel.
3. Confirm the prefilled Vite settings:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in Vercel environment variables.
5. Deploy.

### Netlify

1. Click the **Deploy to Netlify** button in the README, or create a new site from Git.
2. Confirm the prefilled settings from `netlify.toml`:

```txt
Build command: npm run build
Publish directory: dist
```

3. Add `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in Netlify environment variables.

## Important Notes

- The starter uses browser `localStorage` for demo editing.
- For a live production site with team editing, connect a real backend or CMS.
- Admin login uses server-side password verification on Vercel/Netlify. Static-only hosts can still show the public site, but they cannot protect `/admin` without an auth backend.
- Do not commit `.env.local` to GitHub.

## Troubleshooting

If dependencies fail to install:

```bash
rm -rf node_modules package-lock.json
npm install
```

If the deployed admin password does not update:

1. Check `ADMIN_PASSWORD` in your host environment variables.
2. Redeploy the site after changing host env vars.

If saved content seems missing, check whether you are using a different browser or cleared browser storage.
