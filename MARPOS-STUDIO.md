# Five-minute gallery demo

1. Install dependencies, then open this folder with **Open local repository** in Marpos Studio. The separate fork is `marcelposdijk/marpos-studio-domus-picturae`.
2. Open **Artworks → the-blue-interval**. Edit `title.en`, `title.fr` or `title.de`, and the corresponding medium/description/alt text. These are per-field translations in one record, not three independent artworks. Artist, dimensions, image and availability are shared. Use the Artist reference picker to see real local artists.
3. Preview the artwork's English, French and German addresses. Change Availability to see catalogue/private-collection behaviour; if it moves sections, refresh the mapping with `pnpm studio:previews` and reopen Studio's preview.
4. Open **News stories**, filter `locale` to `fr`, and edit a story. The parent `entry` picker links to the News record; `locale` selects the rendered language. Edit prose in the visual or source editor. English is the fallback for a missing/blank translation. News, Exhibitions, Workshops and Pages all use this pattern.
5. Open **Photos**. Confirm the thumbnail grid, search and Category/Visibility filters. The library starts with 77 entries. Choose **Upload image**, set a title and alt text, and save. Files go to `public/images/library/`; records go to `content/photos/`. Unsaved file selection alone does not upload.
6. Return to an artwork, artist, homepage image or programme image. Its image control opens the same Photos chooser. Choose the uploaded image, save and preview. Localised alt text remains on the consuming record; the library also carries general alt text. Story image insertion uses the same library. Cropping a library image creates a new URL; choose that new URL on existing records when replacing their image.
7. Open Homepage, About and Site for shared site details and localised copy. Saves write to this local Git checkout; use Git to commit/push. Selecting the GitHub fork instead uses Studio's normal draft/review/publish workflow after its setup.

## Add content

Create a catalogue/programme/page record in its normal collection, fill required fields and choose related artists/images. Titles and other localisable fields are nested by `en`, `fr`, `de`; required English values must be nonempty. For a long body, create a matching story in the corresponding Stories collection, select its parent `entry` and `locale`, and write Markdown. Use one story per parent and locale. Story filenames do not need to match the parent.

Run `pnpm studio:previews` after creating or renaming entries/stories to regenerate source preview mappings, then refresh local content. A new story can also use **Set preview page** immediately. New catalogue/programme entries get their normal dynamic detail routes. New plain pages get `/slug`, `/fr/slug`, `/de/slug`; use a unique address that does not collide with existing routes, and add navigation links separately when wanted. Renaming the built-in terms/privacy pages requires updating their fixed route files.

The `/template` developer page remains English-only, as upstream intended. Shared JSON records preview in all three locales; Studio's language menu is not used because these records store all translations together. Stories have an explicit Locale filter.

## Verification and status

`pnpm check`, `pnpm test`, `pnpm build`, `pnpm format:check`, `pnpm verify:demo` and the optional real Studio integration check are the reproducible checks. The integration check validates collection/library discovery, parent and artist pickers, native validation, creation, a real upload destination and a save/reopen round trip on temporary content.

The fork is prepared for local demonstration and pushed to GitHub. **It is not deployed.** The canonical origin is a reserved placeholder until `SITE_URL` is configured. Forms stay in demo mode without service configuration.

## Current Studio presentation limits

Shared JSON titles may appear as a translation object in the editor heading while the nested locale inputs work normally. Collection cards can show the content address; use the preview destination menu for the mapped English/French/German page, especially private-collection artworks. Existing records with multiple mapped routes may keep the Slug control read-only. Identifier changes for those records require developer changes and regenerated preview mappings. These are desktop presentation limits; no unrelated Studio source was changed for this demonstration.
