import { writeFileSync } from "node:fs";
import {
  groups,
  bodyGroups,
  locales,
  records,
  stories,
  route,
} from "./content-files.mjs";
const preview = {};
for (const group of groups) {
  for (const { id, path, data } of records(group))
    preview[path] =
      group === "photos"
        ? "/"
        : locales.map((locale) => route(group, id, data, locale));
}
for (const group of bodyGroups) {
  const parents = new Map(records(group).map((r) => [r.id, r.data]));
  const seen = new Set();
  for (const story of stories(group)) {
    const { entry, locale } = story.data;
    if (!parents.has(entry) || !locales.includes(locale))
      throw new Error(`Invalid parent/locale: ${story.path}`);
    const key = `${entry}/${locale}`;
    if (seen.has(key))
      throw new Error(`Duplicate parent/locale: ${story.path}`);
    seen.add(key);
    preview[story.path] = route(group, entry, parents.get(entry), locale);
  }
}
writeFileSync("studio.preview.json", JSON.stringify(preview, null, 2) + "\n");
console.log(
  `Mapped ${Object.keys(preview).length} records and stories to real routes.`,
);
