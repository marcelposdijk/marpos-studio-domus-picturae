import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { collections as model, singletons } from "./content-model/collections";
import type {
  CollectionDescriptor,
  Shape,
  SingletonDescriptor,
} from "./content-model/fields";
import { defaultLocale } from "./i18n/config";
import { storyTemplate } from "./utils/localized-story.mjs";
import { entryPattern, schemaFor } from "./content-model/zod";

/**
 * Astro content collections, derived from the content model in
 * `src/content-model/collections.ts`. Every collection lives in
 * `content/<name>/`; see docs/content.md for the layouts.
 */

import { studioCollections } from "./content-model/studio";

const deps = { reference };

function define<S extends Shape>(
  name: string,
  descriptor: CollectionDescriptor<S> | SingletonDescriptor<S>,
) {
  const options = {
    loader: glob({
      pattern: entryPattern(descriptor),
      base: `./content/${name}`,
    }),
    schema: schemaFor(descriptor, deps),
    studio:
      "layout" in descriptor && descriptor.layout === "markdown"
        ? { bodyTemplate: storyTemplate, defaultLocale }
        : {},
  };
  return defineCollection(options);
}

export const collections = {
  artists: define("artists", model.artists),
  artworks: define("artworks", model.artworks),
  news: define("news", model.news),
  exhibitions: define("exhibitions", model.exhibitions),
  workshops: define("workshops", model.workshops),
  pages: define("pages", model.pages),
  homepage: define("homepage", singletons.homepage),
  about: define("about", singletons.about),
  site: define("site", singletons.site),
  ...studioCollections(),
};
