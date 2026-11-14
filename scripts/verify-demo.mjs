import { verifyMediaOutput } from "./verify-media.mjs";
import assert from "node:assert/strict";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { resolve, sep } from "node:path";
import {
  groups,
  bodyGroups,
  locales,
  records,
  stories,
  route,
  json,
  yaml,
} from "./content-files.mjs";
const photos = records("photos");
const library = yaml("content/.navigation.yml").studio.libraries.images;
assert.equal(library, "photos");
const media = yaml(`content/${library}/.navigation.yml`).studio;
assert.equal(media.view, "media");
assert.equal(yaml(".navigation.yml").studio.mediaRoot, "src/assets/images");
assert.equal(media.media.directory, "library");
assert.ok(media.media.maxBytes > 0 && media.media.maxBytes <= 10485760);
assert.ok(media.media.formats.includes("webp"));
assert.ok(photos.length >= 77);
assert.equal(yaml("content/.navigation.yml").studio.libraries.videos, "videos");
const videos = records("videos");
assert.ok(videos.length > 0);
assert.equal(yaml("content/videos/.navigation.yml").studio.media.kind, "video");
for (const video of videos)
  assert.match(video.data.youtubeId, /^[A-Za-z0-9_-]{11}$/);
const imagePaths = new Set();
const checkImage = (url) => {
  assert.match(url, /^\/src\/assets\/images\/.+\.(jpe?g|png|webp|gif|avif)$/i);
  const file = realpathSync(resolve(url.slice(1)));
  assert.ok(file.startsWith(realpathSync("src/assets/images") + sep));
  imagePaths.add(url);
};
for (const photo of photos) {
  assert.ok(photo.data.title && photo.data.image.alt);
  checkImage(photo.data.image.src);
  if (photo.data.thumbnail) checkImage(photo.data.thumbnail.src);
}
const librarySources = new Set(photos.map((p) => p.data.image.src));
const preview = json("studio.preview.json");
const htmlFile = (path) => `dist${path === "/" ? "" : path}/index.html`;
const assets = new Set();
let routesChecked = 0;
const assertRoute = (path, locale) => {
  const file = htmlFile(path);
  assert.ok(existsSync(file), `Missing route ${path}`);
  const html = readFileSync(file, "utf8");
  assert.match(html, new RegExp(`<html[^>]+lang=["']${locale}`));
  for (const match of html.matchAll(
    /(?:src|href)=["'](\/(?:_astro|images)\/[^"']+)["']/g,
  )) {
    const src = match[1].split(/[?#]/)[0];
    assert.ok(
      existsSync(`dist${decodeURIComponent(src)}`),
      `Missing rendered asset ${src} on ${path}`,
    );
    assets.add(src);
  }
  routesChecked++;
};
const visit = (v) => {
  if (
    typeof v === "string" &&
    /^\/src\/assets\/images\/.+\.(jpe?g|png|webp|gif|avif)$/i.test(v)
  ) {
    checkImage(v);
    assert.ok(librarySources.has(v), `Missing library record for ${v}`);
  } else if (v && typeof v === "object") Object.values(v).forEach(visit);
};
for (const group of groups.filter((g) => !["photos", "videos"].includes(g))) {
  for (const record of records(group)) {
    visit(record.data);
    const expected = locales.map((locale) =>
      route(group, record.id, record.data, locale),
    );
    assert.deepEqual(
      preview[record.path],
      expected,
      `Stale preview ${record.path}; run pnpm studio:previews`,
    );
    expected.forEach((path, i) => assertRoute(path, locales[i]));
  }
}
let storyCount = 0;
for (const group of bodyGroups) {
  const parents = new Set(records(group).map((r) => r.id));
  const seen = new Set();
  for (const story of stories(group)) {
    assert.ok(parents.has(story.data.entry), `Dangling story ${story.path}`);
    assert.ok(locales.includes(story.data.locale));
    assert.ok(story.data.title);
    const key = `${story.data.entry}/${story.data.locale}`;
    assert.ok(!seen.has(key), `Duplicate story ${key}`);
    seen.add(key);
    const expected = route(group, story.data.entry, {}, story.data.locale);
    assert.ok(preview[story.path].includes(expected));
    assertRoute(expected, story.data.locale);
    // Compare rendered prose after Markdown/HTML formatting, not source punctuation.
    const { marked } = await import("marked");
    const plain = (value) =>
      value
        .replace(/<[^>]*>/g, " ")
        .replace(/&(?:#39|apos);/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/\s+/g, " ")
        .trim();
    const excerpt = plain(await marked.parse(story.body)).slice(0, 70);
    if (excerpt)
      assert.ok(
        plain(readFileSync(htmlFile(expected), "utf8")).includes(excerpt),
        `Story missing from ${expected}`,
      );
    storyCount++;
  }
}
const artists = new Set(records("artists").map((r) => r.id));
const artworks = new Map(records("artworks").map((r) => [r.id, r.data]));
for (const art of artworks.values())
  assert.ok(artists.has(art.artist), `Unknown artist ${art.artist}`);
for (const featured of records("homepage")[0].data.collection) {
  assert.ok(artworks.has(featured.artwork));
  assert.notEqual(artworks.get(featured.artwork).availability, "not-for-sale");
}
console.log(
  `Verified ${photos.length} image records, ${storyCount} consolidated locale stories, ${routesChecked} route mappings and ${assets.size} rendered image/asset URLs.`,
);

verifyMediaOutput(process.cwd(), resolve("dist"));
