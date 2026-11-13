import { readFileSync, realpathSync } from "node:fs";
import { resolve, sep } from "node:path";
import { imageSize } from "image-size";
import type { ImageMetadata } from "astro";
import type { Locale } from "@/i18n/config";
import { text, type LocalizedInput } from "@/i18n/localized";

/** Decorative source assets remain imported; editable media is read from public. */
const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/images/**/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

/** Anything with an image path and a localised alt text — every content type stores images this way. */
export interface PictureSource {
  image?: string | null;
  imageAlt?: LocalizedInput | null;
}

/** What `<Image>` needs. Output width stays with the caller: it is a layout fact. */
export interface Picture {
  src: ImageMetadata;
  alt: string;
}

/**
 * Resolve a stored image path to the imported image Astro optimises at build
 * time, paired with its alt text for the locale (falling back to
 * `fallbackAlt`, typically the entry's title).
 *
 * Returns `null` when the field is empty. Throws when the field names a file
 * that does not exist: a content error should fail the build, not ship a
 * blank card.
 */
export function picture(
  source: PictureSource,
  locale: Locale,
  fallbackAlt = "",
): Picture | null {
  if (!source.image) return null;
  const path = source.image.startsWith("/") ? source.image : `/${source.image}`;
  let found = images[`/src/assets${path}`];
  if (
    path.startsWith("/images/") &&
    !path.includes("..") &&
    !path.includes("\\")
  ) {
    try {
      const root = realpathSync(resolve("public"));
      const file = realpathSync(resolve(root, path.slice(1)));
      if (!file.startsWith(root + sep)) throw new Error("Image outside public");
      const size = imageSize(readFileSync(file));
      found = {
        default: {
          src: path,
          width: size.width,
          height: size.height,
          format: size.type === "jpg" ? "jpeg" : size.type,
          fsPath: file,
        } as ImageMetadata,
      };
    } catch {
      /* Report the same useful content error below. */
    }
  }
  if (!found) {
    throw new Error(
      `Image not found: "${source.image}" (expected public${path} or a decorative src/assets image). Fix the path or restore the file.`,
    );
  }
  return {
    src: found.default,
    alt: text(source.imageAlt, locale) || fallbackAlt,
  };
}

/** `picture` over a list, dropping entries with no image. */
export function pictures<S extends PictureSource>(
  sources: S[],
  locale: Locale,
  fallbackAlt: (source: S) => string = () => "",
): (Picture & { source: S })[] {
  return sources.flatMap((source) => {
    const p = picture(source, locale, fallbackAlt(source));
    return p ? [{ ...p, source }] : [];
  });
}
