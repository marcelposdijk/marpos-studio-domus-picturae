import { readFileSync, readdirSync } from "node:fs";
import { parse } from "yaml";
import { readLocalizedStory } from "../src/utils/localized-story.mjs";
export const groups = [
  "artists",
  "artworks",
  "news",
  "exhibitions",
  "workshops",
  "pages",
  "homepage",
  "about",
  "site",
  "photos",
  "videos",
];
export const bodyGroups = ["news", "exhibitions", "workshops", "pages"];
export const locales = ["en", "fr", "de"];
export const json = (path) => JSON.parse(readFileSync(path, "utf8"));
export const yaml = (path) => parse(readFileSync(path, "utf8"));
export function records(group) {
  return readdirSync(`content/${group}`)
    .filter((f) => /\.(json|md)$/.test(f))
    .map((f) => {
      const path = `content/${group}/${f}`;
      const raw = readFileSync(path, "utf8");
      if (f.endsWith(".json"))
        return {
          id: f.replace(/\.json$/, ""),
          path,
          data: JSON.parse(raw),
          body: "",
        };
      const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
      if (!match) throw new Error(`Missing frontmatter: ${path}`);
      return {
        id: f.replace(/\.md$/, ""),
        path,
        data: parse(match[1]),
        body: match[2],
      };
    });
}
export function stories(group) {
  return records(group).flatMap((record) =>
    Object.entries(readLocalizedStory(record.body)).map(([locale, body]) => ({
      path: record.path,
      body,
      data: {
        entry: record.id,
        locale,
        title: record.data.title[locale] || record.data.title.en,
      },
    })),
  );
}
export function route(group, id, data, locale = "en") {
  const prefix = locale === "en" ? "" : `/${locale}`;
  let path = `/${group}/${id}`;
  if (group === "artworks")
    path = `/${data.availability === "not-for-sale" ? "private-collection" : "artworks"}/${id}`;
  if (group === "pages") path = `/${id}`;
  if (["homepage", "site", "photos", "videos"].includes(group)) path = "/";
  if (group === "about") path = "/about";
  return path === "/" && prefix ? prefix : prefix + path;
}
