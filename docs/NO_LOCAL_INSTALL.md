# Run Reakt WebKit Without Installing React Locally

Use this guide for users who do not have Node.js, npm, or a code editor ready on their computer.

## Easiest Path: GitHub Codespaces

1. Open the Reakt WebKit repository on GitHub.
2. Click **Open in GitHub Codespaces** in the README.
3. Wait for the browser editor to finish setup.
4. Open the forwarded port for `5173`.

The devcontainer installs dependencies automatically and starts the Vite dev server.

Open:

```txt
/admin/login
```

Default password:

```txt
demo
```

## Local Path Without Installing Node: Docker

Install Docker Desktop, then run:

```bash
docker compose up
```

Open:

```txt
http://localhost:5173
http://localhost:5173/admin/login
```

## Hosted Path: Vercel Or Netlify

For users who only want to publish:

1. Push or fork the repository on GitHub.
2. Import it into Vercel or Netlify.
3. Add `VITE_ADMIN_PASSWORD` as an environment variable.
4. Deploy.

This avoids local setup entirely.
