# Source and preservation

Adapted from [mearashadowfax/DomusPicturae](https://github.com/mearashadowfax/DomusPicturae), MIT, at commit `00844616bb97d549343fe8cfbb8d86a57a2a462a`. Original `LICENSE` and author credit are retained; the footer source link points to this fork. The gallery's placeholder content is demonstration material.

The preparation compared every migrated record and body against the original Git blobs:

- **45 JSON records** preserved field-for-field, except the intentional `site.sourceUrl` change to this fork.
- **45 Markdown bodies** preserved byte-for-byte after removing the newly added story frontmatter.
- **77 editable source images** moved byte-for-byte into `public/images`.
- Original public workshop MP4 previews remain public files and are excluded from the photo library.
- **77 image records** make the existing editable gallery images discoverable in Studio; root library references, native schema, collection media settings and media hints are all included.

The original design components, CSS, locale UI strings, artist/artwork presentation and programme logic remain in place. The English-only developer template page now explains the Studio workflow. Native linked stories replace the old external-body storage convention; the rendering helpers retain locale fallback and split closing paragraphs.

Verified with Studio's exact Node 22.23.3 runtime, pinned Astro 7.4.0, native collection inspection and the actual ContentStore upload/save service. The desktop app showed the 77-image library, the artwork image chooser, structured locale fields and live English/French/German artwork previews. See `MARPOS-STUDIO.md` for the demo steps and check commands.

This fork has not been deployed. No production publication or GitHub Pages configuration was performed.
