# Publishing Reakt WebKit On GitHub

Use this checklist after pushing the repository to GitHub.

## Confirm Repository Links

The README buttons are configured for:

```txt
ReaktDev/reakt-webkit
```

Confirm these links open correctly after the repository is public:

- Use this template
- Open in GitHub Codespaces
- Deploy to Vercel
- Deploy to Netlify

## Enable Template Repository

GitHub template status is a repository setting, not a code file.

1. Open the repository on GitHub.
2. Go to **Settings**.
3. Open **General**.
4. Enable **Template repository**.
5. Save the setting.

After this, visitors can click **Use this template** to create their own clean copy.

## Confirm Codespaces

1. Click **Open in GitHub Codespaces** from the README.
2. Wait for dependencies to install.
3. Confirm the forwarded `5173` port opens the site.
4. Visit `/admin/login`.

## Confirm One-Click Deploy

Test both deploy buttons:

- Vercel should use `npm run build` and `dist`.
- Netlify should use `npm run build` and `dist`.

Add `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in the host environment variables before sharing a production site.
