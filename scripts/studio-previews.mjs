import { writeFileSync } from "node:fs";
import { format } from "prettier";
import { groups, locales, records, route } from "./content-files.mjs";
const preview = {};
for (const group of groups) {
  for (const { id, path, data } of records(group))
    preview[path] = ["photos", "videos"].includes(group)
      ? "/"
      : locales.map((locale) => route(group, id, data, locale));
}
writeFileSync(
  "studio.preview.json",
  await format(JSON.stringify(preview), { parser: "json" }),
);
console.log(
  `Mapped ${Object.keys(preview).length} content and media records to real routes.`,
);
