# Deployment

The [Marpos gallery demo](https://marcelposdijk.github.io/marpos-studio-domus-picturae/) is published by GitHub Actions. A push to `main` or a manual run verifies the project, builds the static website, and deploys the resulting `dist/` directory to GitHub Pages.

Use Node 24 and the committed pnpm lockfile. For a project-site build, set `SITE_URL` to the origin and `BASE_PATH` to the repository path. The local Studio preview uses `/`.

```sh
pnpm install --frozen-lockfile
SITE_URL=https://marcelposdijk.github.io BASE_PATH=/marpos-studio-domus-picturae pnpm build
BASE_PATH=/marpos-studio-domus-picturae pnpm verify:demo
```

Forms run in demo mode until their public delivery endpoints are configured. See `.env.template`.
