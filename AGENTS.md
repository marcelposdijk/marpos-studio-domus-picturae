# Domus Picturae

A multilingual Astro + Marpos Studio website template for contemporary art galleries. Static output, one view per page type shared across locales, all editorial text localised per field.

- Read `CONTEXT.md` for the vocabulary (Artwork, Availability, Private Collection, Exhibition, Workshop, Locale…) and use it in code and issues.
- The styling system (plain CSS, no utility framework), the i18n routing (thin per-locale routes rendering shared views), the static-only deployment and the generated content model are deliberate decisions; `docs/adr/` records the reasoning where present locally. The one exception is `/template`, which describes the codebase to developers rather than being part of the gallery. It is English-only on purpose: it is listed in `untranslatedPaths` in `src/routes.ts`, and its copy is written in `TemplateView.astro` rather than in `ui.ts` or the content model. Don't translate it.
- The content model lives once in `src/content-model/collections.ts`; `src/content.config.ts` derives native schemas and should not gain hand-written fields; `src/content-model/studio.ts` owns the linked-story and media extension.
- Internal URLs come from `src/routes.ts` (never a path literal in a component); images go through `picture()` in `src/utils/images.ts`; an artwork's section, theme and badge come from `presentArtwork()`; GSAP is imported from `src/assets/scripts/motion.ts`; JSON-LD comes from `src/utils/seo.ts`.
- Run `pnpm check`, `pnpm test` and `pnpm build` before finishing; CI runs all three plus `pnpm format:check`.

## Agent skills

### Issue tracker

Issues are tracked as GitHub Issues on `mearashadowfax/DomusPicturae` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Marpos Studio fork

- Editable records and linked locale stories live in `content/`; editable media lives in `public/images`. Decorative imported assets remain in `src/assets`.
- See `MARPOS-STUDIO.md`. Do not reintroduce Keystatic paths or an additional admin.
- Preserve the full media contract: native photo schema, JSON records, root library reference and collection upload settings.
- Run `pnpm verify:demo` after build. For the optional real Studio integration check use `MARPOS_STUDIO_ROOT` with `pnpm verify:studio`.
- This fork is not deployed. Never describe the upstream Vercel URL as its deployment.
