/** Exercise the real Studio backend and language tabs on a disposable website copy. */
import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  realpathSync,
  readFileSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { readLocalizedStory } from "../src/utils/localized-story.mjs";
const studio = process.env.MARPOS_STUDIO_ROOT;
assert.ok(
  studio,
  "Set MARPOS_STUDIO_ROOT to a Marpos Studio source checkout with content_cli built.",
);
const root = process.cwd();
const temporary = realpathSync(
  mkdtempSync(join(tmpdir(), "domus-unified-check-")),
);
const inspector = resolve(studio, "scripts/inspect-project.mjs");
const cli = resolve(studio, "target/debug/examples/content_cli");
const run = (command, args, input) => {
  const p = spawnSync(command, args, {
    input,
    encoding: "utf8",
    cwd: root,
    maxBuffer: 20 * 1024 * 1024,
  });
  assert.equal(p.status, 0, p.stderr || p.stdout);
  return p.stdout;
};
try {
  for (const name of [
    ".navigation.yml",
    "content",
    "src",
    "public",
    "package.json",
    "astro.config.mjs",
    "tsconfig.json",
    "studio.preview.json",
    "scripts",
  ])
    cpSync(join(root, name), join(temporary, name), { recursive: true });
  symlinkSync(
    join(root, "node_modules"),
    join(temporary, "node_modules"),
    "dir",
  );
  const schemaPath = join(temporary, "schema.json");
  run(process.execPath, [inspector, temporary, schemaPath]);
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  assert.equal(schema.collections.length, 11);
  assert.ok(
    schema.collections.every((c) => !c.warning && !c.id.endsWith("Stories")),
  );
  for (const id of [
    "artists",
    "artworks",
    "news",
    "exhibitions",
    "workshops",
    "pages",
    "photos",
    "videos",
  ])
    assert.ok(schema.collections.find((c) => c.id === id).canCreate);
  const newsSchema = schema.collections.find((c) => c.id === "news");
  assert.equal(newsSchema.extension, "md");
  assert.ok(newsSchema.studio.bodyTemplate.includes("#en"));
  assert.equal(
    schema.collections.find((c) => c.id === "artworks").schema.properties.image
      .$content.editor.input,
    "media",
  );
  const call = (command, args = {}) => {
    const output = JSON.parse(
      run(cli, [temporary, schemaPath], JSON.stringify({ command, args })),
    );
    assert.ok(!output.error, output.error);
    return output.result;
  };
  const items = call("list_content");
  const folders = items.flatMap((item) => Object.values(item.folders || {}));
  assert.equal(
    folders.find((f) => f.libraries?.images)?.libraries.images,
    "photos",
  );
  assert.equal(
    folders.find((f) => f.libraries?.videos)?.libraries.videos,
    "videos",
  );
  const photos = items.filter((item) => item.collection === "photos");
  const videos = items.filter((item) => item.collection === "videos");
  assert.ok(photos.length >= 77 && videos.length >= 1);
  assert.ok(photos.every((item) => item.folders.photos.studioView === "media"));
  assert.equal(photos[0].folders.photos.media.directory, "library");
  assert.equal(videos[0].folders.videos.media.kind, "video");
  assert.equal(videos[0].folders.videos.media.thumbnailAspectRatio, "16:9");
  assert.deepEqual(
    call("validate_content", {
      document: call("read_content", { path: videos[0].path }),
    }),
    [],
  );
  const artwork = items.find(
    (item) => item.path === "content/artworks/alpine-echo-field.json",
  );
  assert.equal(artwork.title, "Alpine Echo Field");
  assert.ok(artwork.image);
  const { contentBlocks, readMarkdownBlock, writeMarkdownBlock } = await import(
    pathToFileURL(resolve(studio, "ui/content-blocks.js"))
  );
  let news = call("read_content", {
    path: "content/news/domus-picturae-grand-opening.md",
  });
  const blocks = contentBlocks(news.data);
  assert.deepEqual(
    blocks.map((b) => b.label),
    ["English", "Français", "Deutsch"],
  );
  const original = readLocalizedStory(news.body);
  const french = blocks.find((b) => b.slot === "fr");
  const marker = "Vérification du contenu multilingue dans un seul éditeur.";
  news.body = writeMarkdownBlock(
    news.body,
    french,
    readMarkdownBlock(news.body, french) + "\n\n" + marker,
  );
  const translated = readLocalizedStory(news.body);
  assert.equal(translated.en, original.en);
  assert.equal(translated.de, original.de);
  news.data.title.fr = "Actualités de la galerie";
  assert.deepEqual(call("validate_content", { document: news }), []);
  news = call("write_content", { document: news });
  assert.ok(call("read_content", { path: news.path }).body.includes(marker));
  const invalid = structuredClone(news);
  invalid.data.title.en = "";
  assert.ok(call("validate_content", { document: invalid }).length);
  const added = {};
  for (const collection of [
    "artists",
    "artworks",
    "news",
    "exhibitions",
    "workshops",
    "pages",
  ]) {
    const definition = schema.collections.find((c) => c.id === collection);
    const sample = items.find((item) => item.collection === collection);
    const document = call("new_content", {
      collection,
      directory: definition.directory,
      title: `Demo new ${collection}`,
    });
    if (collection !== "artists")
      assert.equal(document.data.title.en, `Demo new ${collection}`);
    document.data = structuredClone(sample.data);
    if (collection === "artists")
      document.data.name = "New demonstration artist";
    else
      document.data.title = {
        en: `New ${collection}`,
        fr: `Nouveau ${collection}`,
        de: `Neue ${collection}`,
      };
    if (document.body !== null) {
      assert.deepEqual(readLocalizedStory(document.body), {
        en: "",
        fr: "",
        de: "",
      });
      assert.equal(contentBlocks(document.data).length, 3);
      document.body = writeMarkdownBlock(
        document.body,
        contentBlocks(document.data)[0],
        "New English text.",
      );
      document.body = writeMarkdownBlock(
        document.body,
        contentBlocks(document.data)[1],
        "Nouvelle page française créée dans Marpos Studio.",
      );
    }
    assert.deepEqual(call("validate_content", { document }), []);
    added[collection] = call("write_content", { document });
  }
  const { default: sharp } = await import("sharp");
  const png = Array.from(
    await sharp({
      create: { width: 16, height: 16, channels: 3, background: "#235aac" },
    })
      .png()
      .toBuffer(),
  );
  const upload = call("upload_image", {
    name: "library-check.png",
    bytes: png,
    contentPath: photos[0].path,
    directory: "photos",
  });
  const src = typeof upload === "string" ? upload : upload.src;
  assert.match(src, /^\/src\/assets\/images\/library\//);
  const photo = call("new_content", {
    collection: "photos",
    title: "Library upload check",
  });
  photo.data = {
    title: "Library upload check",
    image: { src, alt: "Test image" },
    categories: [],
    credit: "",
    visible: true,
    order: 100,
  };
  assert.deepEqual(call("validate_content", { document: photo }), []);
  call("write_content", { document: photo });
  let art = call("read_content", { path: artwork.path });
  art.data.image = src;
  art = call("write_content", { document: art });
  assert.equal(art.data.image, src);
  const videoUpload = call("upload_image", {
    name: "video-thumbnail-check.png",
    bytes: png,
    contentPath: videos[0].path,
    directory: "videos",
  });
  const videoThumbnail =
    typeof videoUpload === "string" ? videoUpload : videoUpload.src;
  assert.match(videoThumbnail, /^\/src\/assets\/images\/video-thumbnails\//);
  const video = call("new_content", {
    collection: "videos",
    title: "Video library check",
  });
  video.data = {
    title: "Video library check",
    youtubeId: videos[0].data.youtubeId,
    image: { src: videoThumbnail, alt: "Video thumbnail" },
    categories: ["Gallery"],
    visible: true,
    order: 1,
  };
  assert.deepEqual(call("validate_content", { document: video }), []);
  call("write_content", { document: video });
  const malformedVideo = structuredClone(video);
  malformedVideo.data.youtubeId = "invalid";
  assert.ok(call("validate_content", { document: malformedVideo }).length);
  news = call("read_content", { path: news.path });
  const embed = `<iframe src="https://www.youtube-nocookie.com/embed/${video.data.youtubeId}" title="Gallery video" allowfullscreen></iframe>`;
  news.body = writeMarkdownBlock(
    news.body,
    french,
    readMarkdownBlock(news.body, french) +
      "\n\n" +
      embed +
      `\n\n![Library image](${src})\n\n<img src="${videoThumbnail}" alt="Video thumbnail">`,
  );
  call("write_content", { document: news });
  const buildSite = () => {
    const build = spawnSync(
      process.execPath,
      [
        join(root, "node_modules/astro/bin/astro.mjs"),
        "build",
        "--root",
        temporary,
      ],
      { cwd: temporary, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
    );
    assert.equal(build.status, 0, build.stderr + build.stdout);
  };
  buildSite();
  const pageId = added.pages.path.split("/").pop().replace(/\.md$/, "");
  const frenchPage = readFileSync(
    join(temporary, `dist/fr/${pageId}/index.html`),
    "utf8",
  );
  assert.ok(
    frenchPage.includes("Nouvelle page française créée dans Marpos Studio."),
  );
  const frenchNews = readFileSync(
    join(temporary, "dist/fr/news/domus-picturae-grand-opening/index.html"),
    "utf8",
  );
  assert.ok(frenchNews.includes(marker));
  assert.ok(frenchNews.includes("youtube-nocookie.com/embed/"));
  assert.ok(frenchNews.includes("Library image"));
  assert.ok(!frenchNews.includes("/src/assets/images/"));
  assert.ok(frenchNews.includes("srcset="));
  const englishNews = readFileSync(
    join(temporary, "dist/news/domus-picturae-grand-opening/index.html"),
    "utf8",
  );
  assert.ok(!englishNews.includes(marker));
  // The developer can choose a folder outside src/assets without changing the resolver.
  writeFileSync(
    join(temporary, ".navigation.yml"),
    "studio:\n  mediaRoot: media/originals\n",
  );
  const customUpload = call("upload_image", {
    name: "custom-root.png",
    bytes: png,
    contentPath: photos[0].path,
    directory: "photos",
  });
  const customSrc =
    typeof customUpload === "string" ? customUpload : customUpload.src;
  assert.match(customSrc, /^\/media\/originals\/library\//);
  assert.ok(
    call("image_preview", { path: customSrc }).startsWith(
      "data:image/png;base64,",
    ),
  );
  news = call("read_content", { path: news.path });
  news.body = writeMarkdownBlock(
    news.body,
    french,
    readMarkdownBlock(news.body, french) +
      `\n\n![Custom media folder](${customSrc})`,
  );
  call("write_content", { document: news });
  buildSite();
  const customHtml = readFileSync(
    join(temporary, "dist/fr/news/domus-picturae-grand-opening/index.html"),
    "utf8",
  );
  assert.ok(customHtml.includes("Custom media folder"));
  assert.ok(!customHtml.includes(customSrc));
  console.log(
    "Verified 11 collections, unified language editing and save/reopen, all six creation forms, both media choosers, real upload destinations, video record validation rendered French image/video insertion, optimized-only output and a custom media folder outside src/assets on a temporary website copy.",
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
