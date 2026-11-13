# Deployment

This demonstration is **not deployed**. GitHub source hosting does not publish a website. The original upstream Vercel URL serves the upstream project, not this fork.

The site builds fully static with `pnpm build`. Use Node 22.23.3+ (Node 24 recommended), the committed pnpm lockfile, and set `SITE_URL` to the intended real HTTPS origin. Without it, canonical/sitemap output intentionally uses the reserved placeholder `https://domus-picturae.example`.

Deploy `dist/` to a chosen static host only when requested. Preserve clean URLs and verify all three locale prefixes, generated image URLs and form endpoints. GitHub Pages project subpaths require an explicit base-path review: the template uses root-relative public media and routes. No deployment/Pages workflow has been configured.

There is no Keystatic admin or SSR adapter. Marpos Studio edits content locally or through its GitHub workflow. Forms preserve upstream demo mode until their documented public service environment values are supplied; see `.env.template`.
