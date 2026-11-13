import { readFileSync, readdirSync } from "node:fs";
import { parse } from "yaml";
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
];
export const bodyGroups = ["news", "exhibitions", "workshops", "pages"];
export const locales = ["en", "fr", "de"];
export const json = (path) => JSON.parse(readFileSync(path, "utf8"));
export const yaml = (path) => parse(readFileSync(path, "utf8"));
export function records(group) {
  return readdirSync(`content/${group}`)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      id: f.replace(/\.json$/, ""),
      path: `content/${group}/${f}`,
      data: json(`content/${group}/${f}`),
    }));
}
export function stories(group) {
  return readdirSync(`content/${group}-stories`)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const path = `content/${group}-stories/${f}`;
      const raw = readFileSync(path, "utf8");
      const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
      if (!match) throw new Error(`Missing story frontmatter: ${path}`);
      return { path, data: parse(match[1]), body: match[2] };
    });
}
export function route(group, id, data, locale = "en") {
  const prefix = locale === "en" ? "" : `/${locale}`;
  let path = `/${group}/${id}`;
  if (group === "artworks")
    path = `/${data.availability === "not-for-sale" ? "private-collection" : "artworks"}/${id}`;
  if (group === "pages") path = `/${id}`;
  if (["homepage", "site", "photos"].includes(group)) path = "/";
  if (group === "about") path = "/about";
  return path === "/" && prefix ? prefix : prefix + path;
}
