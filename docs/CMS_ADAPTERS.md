# Backend/CMS Adapters

Reakt WebKit can save and load the full `SiteConfig` through local browser storage, Supabase, Firebase Firestore, or Strapi.

Open **Admin > Launch tools > Integrations** to choose a provider, test the connection, push the current workspace, or pull the latest remote config.

## Supabase

Create a table named `site_config`:

```sql
create table if not exists public.site_config (
  id text primary key,
  config jsonb not null,
  updated_at timestamptz default now()
);
```

For public demo editing, your Row Level Security policy must allow the operations you need for the anon key. For production, put writes behind real auth or a server function.

Environment variables:

```txt
VITE_REAKT_BACKEND_PROVIDER=supabase
VITE_REAKT_CONFIG_ID=site
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_SUPABASE_TABLE=site_config
```

## Firebase Firestore

The adapter stores one document with a `configJson` string field.

Default path:

```txt
site_config/site
```

Environment variables:

```txt
VITE_REAKT_BACKEND_PROVIDER=firebase
VITE_REAKT_CONFIG_ID=site
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_API_KEY=your-public-firebase-api-key
VITE_FIREBASE_COLLECTION=site_config
```

Your Firestore rules must allow the read/write behavior you want. For production, require authenticated editors.

## Strapi

Create a single type with a JSON field named `config`.

Default endpoint:

```txt
/api/reakt-webkit-config
```

Environment variables:

```txt
VITE_REAKT_BACKEND_PROVIDER=strapi
VITE_STRAPI_URL=https://cms.yourdomain.com
VITE_STRAPI_PUBLIC_TOKEN=your-public-or-editor-token
VITE_STRAPI_CONFIG_ENDPOINT=/api/reakt-webkit-config
```

The dashboard uses `GET` to load and `PUT` to save. If your Strapi permissions require a token, add it as `VITE_STRAPI_PUBLIC_TOKEN`.

## Admin Controls

The **Integrations** tab includes:

- **Test connection**: verifies the selected adapter can be reached.
- **Push to backend**: saves the current dashboard workspace to the selected backend.
- **Pull from backend**: loads the remote config into the dashboard and local cache.

Local storage remains active as a cache/fallback.
