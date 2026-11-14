import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  optimizedMediaOnly,
  verifyMediaOutput,
} from "../../scripts/verify-media.mjs";

let root: string;
let output: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "domus-media-"));
  output = join(root, "dist");
  writeFileSync(
    join(root, ".navigation.yml"),
    "studio:\n  mediaRoot: src/assets/images\n",
  );
  mkdirSync(join(root, "src/assets/images"), { recursive: true });
  mkdirSync(join(output, "_astro"), { recursive: true });
  writeFileSync(join(root, "src/assets/images/photo.jpg"), "original bytes");
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("media publication checks", () => {
  it("rejects originals even under a hashed output name", () => {
    writeFileSync(join(output, "_astro/photo.hash.jpg"), "original bytes");
    expect(() => verifyMediaOutput(root, output)).toThrow(
      "Original image published",
    );
  });

  it("removes unused emitted originals and retains transformed images", async () => {
    writeFileSync(join(output, "_astro/photo.hash.jpg"), "original bytes");
    writeFileSync(join(output, "_astro/photo.variant.webp"), "optimized bytes");
    const integration = optimizedMediaOnly();
    integration.hooks["astro:config:done"]({
      config: { root: pathToFileURL(root + "/") },
    });
    await integration.hooks["astro:build:done"]({
      dir: pathToFileURL(output + "/"),
    });
    expect(existsSync(join(output, "_astro/photo.hash.jpg"))).toBe(false);
    expect(existsSync(join(output, "_astro/photo.variant.webp"))).toBe(true);
  });

  it("fails before deleting an original still referenced by a page", async () => {
    writeFileSync(join(output, "_astro/photo.hash.jpg"), "original bytes");
    writeFileSync(
      join(output, "index.html"),
      '<img src="/_astro/photo.hash.jpg">',
    );
    const integration = optimizedMediaOnly();
    integration.hooks["astro:config:done"]({
      config: { root: pathToFileURL(root + "/") },
    });
    await expect(
      integration.hooks["astro:build:done"]({
        dir: pathToFileURL(output + "/"),
      }),
    ).rejects.toThrow("is referenced");
  });
});
