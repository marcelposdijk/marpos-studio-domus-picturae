import { describe, expect, it, vi } from "vitest";

vi.mock("astro:assets", () => ({
  getImage: vi.fn(async ({ width }: { width: number }) => ({
    src: `/_astro/story-${width}.webp`,
    attributes: { width, height: width / 2 },
  })),
}));
import { optimizeStoryImages } from "./story-images";

const source = "/src/assets/images/artworks/the-blue-interval/image.jpg";

describe("optimized story images", () => {
  it("transforms inserted HTML and Markdown-rendered images and linked originals", async () => {
    const result = await optimizeStoryImages(
      `<p><a href="${source}"><img src="${source}" alt="Blue &amp; gold"></a></p>`,
    );
    expect(result).not.toContain("/src/assets/");
    expect(result).toContain('href="/_astro/story-');
    expect(result).toContain('srcset="/_astro/story-');
    expect(result).toContain('alt="Blue &amp; gold"');
    expect(result).toContain('loading="lazy"');
  });

  it("transforms picture source candidates and keeps remote images and videos", async () => {
    const result = await optimizeStoryImages(
      `<picture><source srcset="${source} 480w"><img src="${source}"></picture><img src="https://example.test/photo.jpg"><iframe src="https://www.youtube-nocookie.com/embed/abc"></iframe>`,
    );
    expect(result).not.toContain("/src/assets/");
    expect(result).toContain('srcset="/_astro/story-480.webp 480w"');
    expect(result).toContain("https://example.test/photo.jpg");
    expect(result).toContain("youtube-nocookie.com/embed/abc");
  });

  it("fails the build for missing local images", async () => {
    await expect(
      optimizeStoryImages('<img src="/src/assets/images/missing.jpg">'),
    ).rejects.toThrow("Image not found");
  });
});
