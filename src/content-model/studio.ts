/** Native Studio collections derived from the same content model. */
import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { collections } from "./collections";
import { locales } from "../i18n/config";

const image = z.object({
  src: z
    .string()
    .startsWith("/images/")
    .regex(/\.(jpe?g|png|webp|gif|avif)$/i)
    .meta({ $content: { editor: { input: "media" } } }),
  alt: z.string(),
});

export const photoSchema = z.object({
  title: z.string().min(1),
  image,
  thumbnail: image.optional(),
  categories: z.array(z.string()).default([]),
  credit: z.string().default(""),
  visible: z.boolean().default(true),
  order: z.number().default(0),
});

// The explicit keys retain Astro's generated type information. Field definitions
// and the set of collections that have stories still come from the model.
export function studioCollections() {
  const story = (name: keyof typeof collections) => {
    if (!Object.values(collections[name].fields).some((f) => f.kind === "body"))
      throw new Error(`${name} has no body field`);
    return defineCollection({
      loader: glob({ base: `./content/${name}-stories`, pattern: "*.md" }),
      schema: z.object({
        title: z.string().min(1),
        entry: reference(name),
        locale: z.enum(locales),
      }),
    });
  };
  return {
    newsStories: story("news"),
    exhibitionsStories: story("exhibitions"),
    workshopsStories: story("workshops"),
    pagesStories: story("pages"),
    photos: defineCollection({
      loader: glob({ base: "./content/photos", pattern: "*.json" }),
      schema: photoSchema,
    }),
  };
}
