import { getImage } from "astro:assets";
import { parseFragment, serialize, type DefaultTreeAdapterTypes } from "parse5";
import { picture } from "./images";

type Node = DefaultTreeAdapterTypes.Node;
const localPhoto = (src: string) =>
  /^\/(?![/]|_astro\/).+\.(?:jpe?g|png|webp|gif|avif)$/i.test(src);

/** Studio stores source paths in Markdown and HTML; only variants reach readers. */
export async function optimizeStoryImages(html: string): Promise<string> {
  const fragment = parseFragment(html);
  async function visit(node: Node): Promise<void> {
    if ("tagName" in node) {
      const get = (name: string) =>
        node.attrs.find((a) => a.name === name)?.value;
      const set = (name: string, value: string) => {
        const attr = node.attrs.find((a) => a.name === name);
        if (attr) attr.value = value;
        else node.attrs.push({ name, value });
      };
      const src = get(node.tagName === "a" ? "href" : "src");
      if (src && localPhoto(src) && ["img", "a"].includes(node.tagName)) {
        const image = picture({ image: src }, "en")!.src;
        const widths = [480, 800, 1200, 1600]
          .filter((w) => w < image.width)
          .concat(Math.min(image.width, 1600));
        const variants = await Promise.all(
          widths.map((width) =>
            getImage({ src: image, width, format: "webp", quality: 85 }),
          ),
        );
        const largest = variants.at(-1)!;
        if (node.tagName === "a") set("href", largest.src);
        else {
          set("src", largest.src);
          set(
            "srcset",
            variants.map((v, i) => `${v.src} ${widths[i]}w`).join(", "),
          );
          set("sizes", "(max-width: 800px) 100vw, 800px");
          set("width", String(largest.attributes.width));
          set("height", String(largest.attributes.height));
          set("loading", "lazy");
          set("decoding", "async");
        }
      } else if (["img", "source"].includes(node.tagName) && get("srcset")) {
        const candidates = get("srcset")!.split(",");
        const optimized = await Promise.all(
          candidates.map(async (candidate) => {
            const [url, descriptor] = candidate.trim().split(/\s+/);
            if (!localPhoto(url)) return candidate.trim();
            const image = picture({ image: url }, "en")!.src;
            const width = descriptor?.endsWith("w")
              ? parseInt(descriptor)
              : 1600;
            const result = await getImage({
              src: image,
              width: Math.min(width, image.width),
              format: "webp",
            });
            return `${result.src}${descriptor ? ` ${descriptor}` : ""}`;
          }),
        );
        set("srcset", optimized.join(", "));
      }
    }
    if ("childNodes" in node) await Promise.all(node.childNodes.map(visit));
  }
  await visit(fragment);
  return serialize(fragment);
}
