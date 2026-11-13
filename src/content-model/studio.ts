/** Native photo and video libraries for Marpos Studio. */
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
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
export const videoSchema = z.object({
  title: z.string().min(1),
  youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  image: image.optional(),
  categories: z.array(z.string()).default([]),
  visible: z.boolean().default(true),
  order: z.number().default(0),
});
export function studioCollections() {
  return {
    photos: defineCollection({
      loader: glob({ base: "./content/photos", pattern: "*.json" }),
      schema: photoSchema,
    }),
    videos: defineCollection({
      loader: glob({ base: "./content/videos", pattern: "*.json" }),
      schema: videoSchema,
    }),
  };
}
