# Domus Picturae · Marpos Studio + Astro

A separate multilingual gallery demonstration adapted from [mearashadowfax/DomusPicturae](https://github.com/mearashadowfax/DomusPicturae). Original gallery design, animations, English/French/German content and MIT attribution are preserved. Marpos Studio replaces Keystatic as the editing workspace.

**Source is pushed to GitHub; this fork is not deployed.** The upstream Vercel website is not this demo. `SITE_URL` defaults to the reserved placeholder `https://domus-picturae.example`; set the real production origin when deploying.

## Try it

Use Node **22.23.3 or newer** (Node 24 is recommended) and pnpm 10.33.3:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the repository folder with **Open local repository** in Marpos Studio. All editing happens in this separate working directory. See [the short demo guide](MARPOS-STUDIO.md) for multilingual editing, image uploads, references and previews.

```sh
pnpm check
pnpm test
pnpm build
pnpm format:check
pnpm verify:demo
```

`verify:demo` checks the complete rendered route and image graph, content references, locale stories and media configuration after a build. To additionally exercise the real Studio backend, run `MARPOS_STUDIO_ROOT=/absolute/path/to/marpos-studio pnpm verify:studio`; the Studio checkout must have its `content_cli` example built. The integration check uses a temporary content copy and never edits your actual demo content.

## Content contract

- `src/content-model/collections.ts` remains the shared editorial model. `zod.ts` derives native Astro schemas; `studio.ts` adds model-derived story collections and the native photo schema.
- `content/artists`, `artworks`, `news`, `exhibitions`, `workshops` and `pages` contain ordinary JSON records. Shared fields stay shared; localisable fields contain `en`, `fr` and `de` values with English fallback.
- Homepage, About and site settings are fixed JSON singletons. No duplicate settings records can be created in Studio.
- `content/<type>-stories/*.md` holds long text. Each story has a title, parent `entry` reference and `locale`, plus a normal Markdown body. Filenames can change independently of the parent. Duplicate parent/locale stories fail verification and rendering.
- `content/photos/*.json` contains **77 real media records**, backed by `public/images`. `content/.navigation.yml` registers `studio.libraries.images: photos`; the photo folder enables the media view and uploads to `public/images/library`. Nested image fields expose Studio media controls. No YouTube library is declared: workshop previews remain the original local MP4 files.
- `studio.preview.json` maps existing records and stories to the actual locale routes. After adding or renaming entries, run `pnpm studio:previews`, or use **Set preview page** for a new story. Plain pages also have generic routes in all three locales.

The old directory `index.json` + `body/<locale>.md` convention was migrated to flat records and linked stories so Studio can create both through native globs. The original JSON fields, Markdown prose and image bytes were preserved. Keystatic and its adapter were removed because their old paths and separate authoring UI no longer match this workflow. Decorative hero, 404 and template screenshot assets stay in `src/assets`; editable gallery images use `public` and still pass through `picture()` and Astro optimisation.

Astro is pinned to **7.4.0**, whose Node requirements work with Studio's bundled Node 22.23.3. Later upstream patches require a newer Node patch; do not upgrade without rechecking the desktop preview runtime. No Marpos Studio source changes are required.

## Deployment and forms

This is a static Astro build. No deployment has been performed or requested. Before deploying, set `SITE_URL`, configure hosting to serve Astro's generated clean URLs, and supply any intended form service endpoints. Newsletter and workshop registration keep upstream's demo mode until configured. GitHub Pages would additionally need a deliberate base-path and URL review; no Pages workflow has been enabled.

See [deployment notes](docs/deployment.md), [content notes](docs/content.md), [locale conventions](docs/i18n.md), the [original README](docs/UPSTREAM-README.md) and [LICENSE](LICENSE).
