# Reakt WebKit

Reakt WebKit is a production-ready React + TypeScript + Tailwind CSS starter for service businesses that want a premium site with maximum editability from a clean admin dashboard.

[New to the project? Start here.](./docs/GETTING_STARTED.md) For users without Node.js or React tooling installed, use the [no-local-install guide](./docs/NO_LOCAL_INSTALL.md). Before publishing the repo, review the [GitHub publishing checklist](./docs/GITHUB_PUBLISHING.md).

- [Use this template](https://github.com/ReaktDev/reakt-webkit/generate)
- [Open in GitHub Codespaces](https://codespaces.new/ReaktDev/reakt-webkit)
- [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FReaktDev%2Freakt-webkit&project-name=reakt-webkit&repository-name=reakt-webkit&framework=vite&env=ADMIN_PASSWORD&env=ADMIN_SESSION_SECRET&envDescription=Server-only%20admin%20password%20and%20session%20signing%20secret%20for%20Reakt%20WebKit&envLink=https%3A%2F%2Fgithub.com%2FReaktDev%2Freakt-webkit%2Fblob%2Fmain%2F.env.example)
- [Deploy to Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/ReaktDev/reakt-webkit)

## What this starter is

A Vite-based starter with a modular architecture:

- Dynamic, reorderable page sections
- Multiple pages support from dashboard
- Local content persistence in demo mode
- SEO + analytics hooks
- Accessible, responsive, and conversion-focused defaults
- Open-source and MIT licensed

## Who it is for

- Agencies and consultants
- Coaches and clinics
- Contractors and local service providers
- Small professional firms

## Core features

- React + TypeScript + Tailwind CSS
- Dynamic section registry
  - Add / remove / rename sections
  - Reorder sections per page
  - Toggle section visibility
- Multiple-page support
  - Add / remove pages
  - Configure page labels and slugs
  - Enable/disable pages from dashboard
- Brand and content controls
  - Business name, logo, tagline
  - Hero, About, Testimonials, Process, FAQ, Contact, CTA blocks
  - Logo upload + URL
  - Contact and social details
- SEO title + description helper
- Analytics placeholders (GA4 / Plausible / Meta Pixel)
- Contact form with validation + demo submit state
- Demo localStorage backend with export/import/reset
- Ready-to-use Supabase, Firebase Firestore, and Strapi config adapters
- Beginner setup paths for GitHub Codespaces, Docker, Vercel, and Netlify
- Admin security password override + `.env.local` generator
- Clean component architecture for easy extension

## Project structure

```txt
src/
  components/
    layout/
    sections/
    site/
    ui/
  config/
  context/
  pages/
    admin/
  hooks/
  lib/
  types/
public/
```

## Quick start

### Start from the template

Use the **Use this template** button above to create your own copy of Reakt WebKit without forking history. Then choose one of the setup paths below.

### No local React setup

Use one of these paths if you do not have Node.js installed:

- **GitHub Codespaces:** click the **Open in GitHub Codespaces** button above, or open the repository on GitHub, click **Code**, then **Codespaces**, then **Create codespace**.
- **Docker:** install Docker Desktop, then run `docker compose up`.
- **Hosted:** import the GitHub repository into Vercel or Netlify.

See [Run without installing React locally](./docs/NO_LOCAL_INSTALL.md).

### Local developer setup

1. Install dependencies

```bash
npm install
```

2. Start development

```bash
npm run dev
```

3. Open

- Public site: `http://localhost:5173`
- Admin login: `http://localhost:5173/admin/login`

4. Default demo password is `demo` (from `.env.example`).

## Edit content through the dashboard

1. Open `/admin/login` and sign in.
2. Use **Brand**, **Hero**, **About**, **Services**, **Testimonials**, **Process**, **FAQ**, **Contact**, **Social**, **SEO & Analytics** tabs to edit content.
3. In **Pages & Structure**:
   - Rename section labels (these also drive the header navigation labels)
   - Set per-section heading title + heading description
   - Add/remove/reorder sections
   - Add/remove pages and configure slugs
   - Choose section types including custom blocks
4. In **Security**:
   - Set a custom admin password
   - Copy `.env` snippet directly
   - Download `.env.local`
5. Click **Save changes** to persist to localStorage or the selected backend adapter.
6. Use **Reset demo** to return to starter defaults.

## Design customization

- Update global look in `src/index.css`.
- Change theme presets and density in Theme tab / `src/config/defaultSiteConfig.ts`.
- Extend/add sections in `src/components/sections` and expose them through `src/components/site/SitePageContent.tsx`.
- Add more structure options in `src/types/site.ts` and `src/lib/configStorage.ts`.

## Backend/CMS adapters

This starter uses local browser storage by default and includes production-ready config adapters for Supabase, Firebase Firestore, and Strapi.

The admin dashboard includes an **Integrations** tab where users can:

- Pick Local, Supabase, Firebase, or Strapi as the active backend
- Enter project URL, public API key, record ID, table/collection name, or Strapi endpoint
- Copy or download the matching `.env.local`
- Test the connection
- Push the current workspace to the backend
- Pull the latest config from the backend

Supabase expects a `site_config` table with `id`, `config` JSONB, and `updated_at`.
Firebase stores `configJson` in a Firestore document.
Strapi expects a single type endpoint with a JSON `config` field.

See [Backend/CMS adapter setup](./docs/CMS_ADAPTERS.md).

## Deploy

The template, Codespaces, and deploy buttons are configured for `ReaktDev/reakt-webkit`.

To enable the GitHub template button for users:

1. Open the repository on GitHub.
2. Go to **Settings**.
3. In **General**, enable **Template repository**.
4. Save the setting.

### Vercel

Use the **Deploy to Vercel** button above, or import the project manually.

Vercel settings are preconfigured in `vercel.json`:

```txt
Framework: Vite
Install command: npm install
Build command: npm run build
Output directory: dist
```

Add server-only env vars from `.env.example`, especially `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.

### Netlify

Use the **Deploy to Netlify** button above, or create a new site from Git manually.

Netlify settings are preconfigured in `netlify.toml`:

```txt
Build command: npm run build
Publish directory: dist
```

Add server-only env vars from `.env.example`, especially `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.

### Static hosts

Run `npm run build` and upload `dist`.

Static-only hosts can serve the public website, but the admin dashboard needs the included Vercel or Netlify serverless auth endpoints to protect `/admin`.

## FAQ

- Admin login uses server-side password verification on Vercel/Netlify and a signed session token in the browser.
- Storage is local only in starter mode; connect a real backend for team sync.
- Section names are editable, and sections/pages can be fully restructured in dashboard.

## Roadmap

- [ ] Rich media uploader in dashboard
- [ ] Multi-language content support
- [ ] Role-based editor permissions

## License

MIT License. See [LICENSE](./LICENSE).
