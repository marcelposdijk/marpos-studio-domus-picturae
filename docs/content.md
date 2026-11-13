# Content and editing

See [the demo guide](../MARPOS-STUDIO.md) and [README](../README.md) for the current Marpos Studio contract.

The shared model is `src/content-model/collections.ts`; `fields.ts` supplies descriptors and `zod.ts` derives native Astro schemas. Add editorial fields there, not in `src/content.config.ts`. `studio.ts` derives four story collections from model body markers and defines the photo record schema. The old Keystatic adapter is intentionally removed.

JSON records live at `content/<collection>/<slug>.json`; settings at `content/<singleton>/index.json`. Original localisable fields retain `{ en, fr, de }` values. Native Astro references power artist, featured artwork and story-parent pickers. Studio's reference migration can keep declared relationships intact when an identifier changes.

Long text is ordinary Markdown at `content/<collection>-stories/<filename>.md`. Frontmatter has `title`, `entry` (the parent identifier) and `locale` (`en`, `fr`, `de`). Rendering uses the declared relation, not the filename, and preserves English fallback and upstream's split-closing-paragraph layout. A duplicate parent/locale pair is invalid.

Editable image URLs begin `/images/`; actual files live under `public/images`. `picture()` validates local image paths and reads real dimensions before passing metadata to Astro's Image service. Image uploads need no source manifest update. Decorative imports remain under `src/assets/images`.

Photos are native JSON entries with title, image `{src, alt}`, optional thumbnail, categories, credit, visible and order. Root and collection `.navigation.yml` files configure picker discovery, filters and upload destination. All gallery image fields carry a native media input hint. Website gallery cards still query the original artwork/programme records; Photos is the reusable authoring library, not an additional public gallery page.

Add a new type in the shared model, register it in `src/content.config.ts`, add views and locale routes, and update preview generation/verification. New fields on existing types need only the shared descriptor. Run all documented checks before pushing.
