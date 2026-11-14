# Content and editing

The shared model lives in `src/content-model/collections.ts`. Fields are described once; `zod.ts` derives native Astro schemas and human-readable labels. Add editorial fields there rather than writing them into `src/content.config.ts`.

Artists and artworks use flat JSON records. Fixed settings use `index.json`. News, exhibitions, workshops and pages use `layout: "markdown"`: one `.md` record contains structured frontmatter plus English, French and German body slots. No separate story collection or parent record is needed.

`studio.blocks` gives the editor Details and three language tabs. The protected body layout is:

```md
::localized-story
#en

English text.

#fr

Texte français.

#de

Deutscher Text.

::
```

This is a storage convention shared by Studio’s existing Markdown slot editor and the website’s `readLocalizedStory()` reader. The website removes the wrapper before rendering the selected language. It is not a Vue/Nuxt component and does not require Nuxt. Fenced code and HTML are protected while reading slot boundaries. Missing/duplicate/broken boundaries fail clearly; ordinary edits only replace one slot. Native frontmatter validation and website body rendering remain separate checks.

Schema defaults include `studio.blocks`; collection metadata supplies `studio.bodyTemplate` and `defaultLocale`. The current Studio creates the localized title without flattening it to a string, initializes the body template, preserves declared tab order and follows each language tab’s declared `locale` to a matching preview route.

`studio.ts` contains native photo and video schemas. Photo records use title, image `{src, alt}`, optional thumbnail, categories, credit, visible and order. Video records use title, YouTube ID, optional image thumbnail, categories, visible and order. Root and collection `.navigation.yml` files configure real picker discovery, media views, filters and upload destinations. Existing local workshop MP4s use the clearly labelled `previewClip` field and retain their hover behaviour.

Editable image references use `/src/assets/images/` source paths. `picture()` resolves imported Astro image metadata; page components generate optimized variants at their required sizes. Original photos are build inputs and are not served directly. The gallery website queries the catalogue/programme records; media libraries are reusable authoring sources.

After adding routes/types, update preview generation and verification. Run the README checks and keep all translations and shared fields intact.

Media storage is configured by `studio.mediaRoot` in the project-root `.navigation.yml` (here `src/assets/images`). It can name any project-relative folder. Collection `studio.media.directory` settings select upload subfolders within it. Source references must be resolved through the website’s image pipeline. Astro generates optimized variants; the build rejects direct original references and removes unused emitted originals.
