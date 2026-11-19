import { parse } from "yaml";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, unlinkSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const photos = /\.(?:jpe?g|png|webp|gif|avif)$/i;
function files(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? ["node_modules", "dist", ".git", ".astro"].includes(entry.name)
        ? []
        : files(join(directory, entry.name))
      : entry.isFile()
        ? [join(directory, entry.name)]
        : [],
  );
}
const hash = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");

function originalHashes(root) {
  const config = parse(readFileSync(join(root, ".navigation.yml"), "utf8"));
  const mediaRoot = config.studio.mediaRoot;
  assert.ok(
    typeof mediaRoot === "string" &&
      !mediaRoot.startsWith("/") &&
      !mediaRoot.includes("\\") &&
      (mediaRoot === "." ||
        mediaRoot
          .split("/")
          .every((part) => part && part !== "." && part !== "..")),
    "Media root must be project-relative",
  );
  const paths = new Set([join(root, "src/assets"), join(root, mediaRoot)]);
  return new Set(
    [...paths]
      .flatMap(files)
      .filter((p) => photos.test(p))
      .map(hash),
  );
}

/** Originals must never be deployed, including unused imports emitted by Vite. */
export function verifyMediaOutput(root, output) {
  const originals = originalHashes(root);
  for (const file of files(output)) {
    if (photos.test(file))
      assert.ok(
        !originals.has(hash(file)),
        `Original image published: ${file}`,
      );
    if (/\.(?:html|css|js|json)$/i.test(file)) {
      const text = readFileSync(file, "utf8");
      assert.ok(
        !/\/src\/assets\/[^\s"'<>)]*\.(?:jpe?g|png|webp|gif|avif)\b/i.test(
          text,
        ),
        `Source image reference published: ${file}`,
      );
      assert.ok(
        !/\/images\/[^\s"'<>)]*\.(?:jpe?g|png|webp|gif|avif)\b/i.test(text),
        `Unprocessed image reference published: ${file}`,
      );
    }
  }
  assert.equal(
    files(join(output, "images")).filter((p) => photos.test(p)).length,
    0,
    "Original photos copied to public output",
  );
}

/** Drop unused emitted originals; a referenced original is a build error. */
export function optimizedMediaOnly() {
  let root;
  return {
    name: "optimized-media-only",
    hooks: {
      "astro:config:done": ({ config }) => {
        root = fileURLToPath(config.root);
      },
      "astro:build:done": ({ dir }) => {
        const output = fileURLToPath(dir);
        const originals = originalHashes(root);
        const emitted = files(output);
        const documents = emitted
          .filter((p) => /\.(?:html|css|js|json)$/i.test(p))
          .map((p) => [p, readFileSync(p, "utf8")]);
        for (const file of emitted.filter(
          (p) => photos.test(p) && originals.has(hash(p)),
        )) {
          const url = "/" + relative(output, file).replaceAll("\\", "/");
          for (const [document, text] of documents) {
            assert.ok(
              !text.includes(url),
              `Original image ${url} is referenced by ${document}; use an Astro image transform.`,
            );
          }
          unlinkSync(file);
        }
        verifyMediaOutput(root, output);
      },
    },
  };
}
