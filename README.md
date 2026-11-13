# Domus Picturae · Marpos Studio + Astro

A multilingual gallery demonstration adapted from [mearashadowfax/DomusPicturae](https://github.com/mearashadowfax/DomusPicturae), MIT. The gallery design, animations and English/French/German content are preserved. Marpos Studio provides the editing workspace.

**This fork is not deployed.** The upstream Vercel website is not this demonstration. `SITE_URL` defaults to the reserved origin `https://domus-picturae.example` until a production host is chosen.

## Try it

Use Node **22.23.3+** (Node 24 recommended) and pnpm 10.33.3:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the repository with **Open local repository** in the current Marpos Studio development build. See [the demo guide](MARPOS-STUDIO.md).

## Editing

Each news item, exhibition, workshop and ordinary page is now **one Markdown document** with Details, English, Français and Deutsch tabs. One save includes shared details and all three translations. The separate Stories collections have been consolidated and removed; all 45 existing translated texts are preserved.

Artists, artworks, Homepage, About and gallery settings retain their structured fields. Localisable fields show full language names; shared dates, dimensions, relations and images stay shared. Collection navigation has distinct icons, labels and useful property filters. Language story tabs choose the matching page in an open preview.

**Photos** contains 77 native image records. **Videos** is a real YouTube library, seeded with the existing upstream showreel link (IAG Cargo’s National Gallery teaser). Both libraries have native schemas, `.navigation.yml` media settings and root `studio.libraries` references. The same libraries serve field choosers and story insertion. Photo uploads go to `public/images/library/`; video thumbnails can reuse a photo, use YouTube’s display fallback, or upload via the configured `public/images/video-thumbnails/` destination. Workshop-card hover previews remain their original local MP4 clips, clearly labelled separately from the YouTube library.

## Content contract

- `src/content-model/collections.ts` describes editorial fields once; `zod.ts` derives native Astro schemas. `src/content.config.ts` declares local globs. `studio.ts` defines photo/video schemas.
- `content/news`, `exhibitions`, `workshops` and `pages` contain `.md` records, with the original structured details in frontmatter and all language bodies in one `::localized-story` wrapper.
- `studio.blocks` maps each language tab to one protected Markdown slot. The website’s reader removes the wrapper and renders only the requested locale, falling back to English. No Vue component or Nuxt dependency is involved. Fenced code and HTML are protected when reading boundaries.
- New content receives the language tabs and an empty, valid body template through the native schema defaults and collection `studio.bodyTemplate`. Use a Studio build with that support.
- Artists, artworks and fixed site settings remain JSON. Original source image bytes live in `public/images`; decorative hero, 404 and template screenshots remain imported assets.
- `studio.preview.json` maps existing entries to all three locale routes. After creating or renaming entries, use **Set preview page** immediately or run `pnpm studio:previews` to regenerate project mappings. New generic pages have routes in every locale; navigation links are configured separately.

Astro is pinned to **7.4.0** for compatibility with Studio’s Node 22.23.3 runtime. Keystatic was removed because Studio now manages the native documents and media.

## Verify

```sh
pnpm check
pnpm test
pnpm build
pnpm verify:demo
pnpm format:check
MARPOS_STUDIO_ROOT=/absolute/path/to/marpos-studio pnpm verify:studio
```

The optional integration check requires Studio’s `content_cli` example to be built. It runs on a disposable copy and checks native discovery, one-document language editing/save/reopen, all six entity creation forms, photo/video choosers, actual uploads, video validation and rendering in a fresh website build.

The site builds to static `dist/`. Before deployment, configure `SITE_URL`, clean URLs and any intended form services. Forms keep upstream demo mode until configured. GitHub Pages needs an explicit base-path review; it has not been enabled.

See [content](docs/content.md), [locale conventions](docs/i18n.md), [deployment](docs/deployment.md), [source provenance](docs/SOURCE-PROVENANCE.md), the [original README](docs/UPSTREAM-README.md) and [LICENSE](LICENSE).
