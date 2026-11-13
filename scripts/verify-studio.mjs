/** Real native inspector + ContentStore round-trip in an isolated temporary copy. */
import assert from "node:assert/strict";
import {
  cpSync,
  realpathSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
const studio = process.env.MARPOS_STUDIO_ROOT;
assert.ok(
  studio,
  "Set MARPOS_STUDIO_ROOT to an installed Marpos Studio source checkout.",
);
const root = process.cwd();
const temporary = realpathSync(
  mkdtempSync(join(tmpdir(), "domus-studio-check-")),
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
    "content",
    "src",
    "public",
    "package.json",
    "astro.config.mjs",
    "tsconfig.json",
    "studio.preview.json",
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
  assert.equal(schema.collections.length, 14);
  assert.ok(schema.collections.every((c) => !c.warning));
  for (const id of [
    "artists",
    "artworks",
    "news",
    "exhibitions",
    "workshops",
    "pages",
    "newsStories",
    "photos",
  ])
    assert.ok(schema.collections.find((c) => c.id === id).canCreate);
  const photoSchema = schema.collections.find((c) => c.id === "photos").schema;
  assert.ok(photoSchema.properties.thumbnail);
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
  // This matches the chooser's actual configured-folder discovery algorithm.
  const configured = items
    .flatMap((item) => Object.values(item.folders || {}))
    .find((folder) => folder.libraries?.images)?.libraries.images;
  assert.equal(configured, "photos");
  const choices = items.filter((item) =>
    item.path.startsWith(`content/${configured}/`),
  );
  assert.equal(choices.length, 77);
  assert.ok(
    choices.every((item) => item.folders.photos.studioView === "media"),
  );
  assert.equal(choices[0].folders.photos.media.directory, "images/library");
  const requestPath = join(temporary, "request.json");
  const choicesPath = join(temporary, "choices.json");
  writeFileSync(
    requestPath,
    JSON.stringify({
      mode: "choices",
      collection: "artists",
      documents: items.map(({ path, collection, data }) => ({
        path,
        collection,
        data,
      })),
    }),
  );
  run(process.execPath, [
    inspector,
    temporary,
    "--request",
    requestPath,
    choicesPath,
  ]);
  const artists = JSON.parse(readFileSync(choicesPath, "utf8"));
  assert.ok(artists.some((artist) => artist.value === "sarah-chen"));
  const story = call("read_content", {
    path: "content/news-stories/domus-picturae-grand-opening.fr.md",
  });
  assert.equal(story.data.locale, "fr");
  assert.equal(story.data.entry, "domus-picturae-grand-opening");
  assert.deepEqual(call("validate_content", { document: story }), []);
  story.body += "\n\nVérification du contenu multilingue.\n";
  const saved = call("write_content", { document: story });
  assert.ok(
    call("read_content", { path: saved.path }).body.includes(
      "Vérification du contenu multilingue.",
    ),
  );
  const invalid = structuredClone(saved);
  invalid.data.entry = "missing-parent";
  assert.ok(call("validate_content", { document: invalid }).length);
  const created = call("new_content", {
    collection: "pagesStories",
    title: "New French story",
  });
  assert.match(created.path, /^content\/pages-stories\/.+\.md$/);
  let art = call("read_content", {
    path: "content/artworks/the-blue-interval.json",
  });
  art.data.title.fr = "Intervalle bleu — essai";
  assert.deepEqual(call("validate_content", { document: art }), []);
  art = call("write_content", { document: art });
  assert.equal(
    call("read_content", { path: art.path }).data.title.fr,
    "Intervalle bleu — essai",
  );
  const { default: sharp } = await import("sharp");
  const png = Array.from(
    await sharp({
      create: { width: 16, height: 16, channels: 3, background: "#235aac" },
    })
      .png()
      .toBuffer(),
  );
  const upload = call("upload_image", {
    name: "studio-library-check.png",
    bytes: png,
    contentPath: choices[0].path,
    directory: "photos",
  });
  const src = typeof upload === "string" ? upload : upload.src;
  assert.match(src, /^\/images\/library\//);
  assert.ok(readFileSync(join(temporary, "public", src.slice(1))).length);
  const photo = call("new_content", {
    collection: "photos",
    title: "Studio upload check",
  });
  photo.data = {
    title: "Studio upload check",
    image: { src, alt: "Test image" },
    categories: ["verification"],
    credit: "",
    visible: true,
    order: 100,
  };
  assert.deepEqual(call("validate_content", { document: photo }), []);
  call("write_content", { document: photo });
  assert.ok(
    call("list_content").some(
      (item) => item.path === photo.path && item.image === src,
    ),
  );
  art.data.image = src;
  assert.deepEqual(call("validate_content", { document: art }), []);
  art = call("write_content", { document: art });
  assert.equal(call("read_content", { path: art.path }).data.image, src);
  // Complete and persist new records as an author does in the structured form.
  const added = {};
  for (const collection of [
    "artists",
    "artworks",
    "news",
    "exhibitions",
    "workshops",
    "pages",
  ]) {
    const sample = items.find((item) => item.collection === collection);
    const document = call("new_content", {
      collection,
      title: `Demo new ${collection}`,
    });
    assert.match(
      document.path,
      new RegExp(`^content/${collection}/.+\\.json$`),
    );
    document.data = structuredClone(sample.data);
    if (collection === "artists")
      document.data.name = "New demonstration artist";
    else
      document.data.title = {
        en: `New ${collection}`,
        fr: `Nouveau ${collection}`,
        de: `Neue ${collection}`,
      };
    assert.deepEqual(call("validate_content", { document }), []);
    added[collection] = call("write_content", { document });
    assert.equal(
      call("read_content", { path: document.path }).path,
      document.path,
    );
  }
  created.data = {
    title: "Nouvelle page française",
    entry: added.pages.path
      .split("/")
      .pop()
      .replace(/\.json$/, ""),
    locale: "fr",
  };
  created.body = "# Nouvelle page\n\nContenu créé dans Marpos Studio.\n";
  assert.deepEqual(call("validate_content", { document: created }), []);
  call("write_content", { document: created });
  // Build the temporary website too: this proves newly created page routes and
  // a freshly uploaded image work without a generated source asset manifest.
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
  const pageId = created.data.entry;
  for (const prefix of ["", "/fr", "/de"])
    assert.ok(
      readFileSync(join(temporary, `dist${prefix}/${pageId}/index.html`))
        .length,
    );
  assert.ok(
    readFileSync(
      join(temporary, `dist/fr/${pageId}/index.html`),
      "utf8",
    ).includes("Contenu créé dans Marpos Studio."),
  );
  assert.ok(
    readFileSync(
      join(temporary, "dist/fr/artworks/the-blue-interval/index.html"),
      "utf8",
    ).includes("Intervalle bleu — essai"),
  );
  console.log(
    "Verified native schema discovery, library chooser configuration, references, French story/artwork save-reopen, creation and a real public/images/library upload + photo record + image-field selection, creation of all six entity types and a fresh multilingual website build on an isolated copy.",
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
