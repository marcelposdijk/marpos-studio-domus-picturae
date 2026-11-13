# Five-minute gallery demo

Open this repository with **Open local repository** in the current Marpos Studio development app.

1. Open **News** and select the gallery opening article. The list contains seven articles, not 21 separate translation records. Details holds the shared image, date and translated titles/descriptions.
2. Switch between **English**, **Français** and **Deutsch** to edit the article’s full text visually or as Markdown. All tabs belong to the same document and save together. A blank translation falls back to English on the website. When preview is open, switching language tabs selects the corresponding declared page.
3. Try the same workflow in **Exhibitions**, **Workshops** and **Pages**. Creating content prepares all three language tabs automatically. Workshop **Hover preview clip (MP4)** is a separate local path for the original card animation.
4. Open **Artworks**. Translated titles, descriptions and alt text have full language labels. Artist, availability, image and dimensions are shared. The list and editor show a readable title and artwork thumbnail. Artist and featured-artwork fields use real reference pickers.
5. Open **Photos** to browse the 77-image grid, search, or filter by category/visibility. Upload an image, add its title/alt text and save. Files go to `public/images/library`; records go to `content/photos`. Image controls and story image insertion use this same library.
6. Open **Videos**. The initial entry is the National Gallery teaser already linked by the upstream template. Add a YouTube link or ID, title, categories and optional thumbnail selected from Photos. Without a custom thumbnail, Studio displays YouTube’s thumbnail. Save, then use **Choose video** in a story editor to insert it. Videos are linked YouTube records, not MP4 uploads. The configured thumbnail upload destination is `public/images/video-thumbnails`.
7. Open **Homepage**, **About the gallery** and **Gallery settings** for site-wide content. Distinct icons distinguish catalogue, programme, pages, settings and media collections.

## Adding and previewing content

Fill the required English details, select shared images/relations, then continue to the language tabs. Start with English and add French/German when ready. There are no parent-entry links or separate Stories records to manage.

Existing entries have all three preview addresses in `studio.preview.json`. For a new entry, use **Set preview page** or regenerate mappings with `pnpm studio:previews` and refresh local content. Moving an artwork between the catalogue and private collection also needs refreshed mappings. New plain pages get `/slug`, `/fr/slug`, `/de/slug`; add navigation links separately if wanted.

An item used on several pages has a shared identifier; Studio explains why its existing slug is read-only. Display titles can be edited freely. Developer identifier changes must preserve incoming references and regenerate preview mappings.

All saves write to this separate local checkout. GitHub source hosting is separate from website deployment. **This fork is not deployed.**

## Verification

Run the README’s checks. `verify:demo` checks both libraries, all translated body slots, real rendered routes and images. `verify:studio` edits French text while proving English/German remain intact, creates all six entity types, uploads a photo, creates/selects a video and verifies a rendered French video embed on a temporary site copy.
