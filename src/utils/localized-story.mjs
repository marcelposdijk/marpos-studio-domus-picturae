import { marked } from "marked";

export const storyLocales = ["en", "fr", "de"];
/** @type {Array<{id: string, label: string, icon: string, type: "markdown", component: string, slot: string, locale: string}>} */
export const storyBlocks = [
  {
    id: "story",
    label: "English",
    icon: "i-lucide-languages",
    type: "markdown",
    component: "localized-story",
    slot: "en",
    locale: "en",
  },
  {
    id: "french",
    label: "Français",
    icon: "i-lucide-languages",
    type: "markdown",
    component: "localized-story",
    slot: "fr",
    locale: "fr",
  },
  {
    id: "german",
    label: "Deutsch",
    icon: "i-lucide-languages",
    type: "markdown",
    component: "localized-story",
    slot: "de",
    locale: "de",
  },
];
export const storyTemplate =
  "::localized-story\n#en\n\n\n#fr\n\n\n#de\n\n\n::\n";

/** Read the three editable slots, shielding fenced code and HTML with Markdown's lexer.
 * The wrapper is an editor storage convention; it is removed before Astro renders prose.
 * @param {string} source
 * @returns {Record<string, string>}
 */
export function readLocalizedStory(source) {
  const protectedRanges = [];
  let tokenOffset = 0;
  for (const token of marked.lexer(source)) {
    if (token.type === "code" || token.type === "html")
      protectedRanges.push([tokenOffset, tokenOffset + token.raw.length]);
    tokenOffset += token.raw.length;
  }
  let offset = 0;
  let opened = false;
  let closed = false;
  let active = "";
  const found = new Set();
  const result = Object.fromEntries(storyLocales.map((locale) => [locale, ""]));
  for (const line of source.split(/(?<=\n)/)) {
    const marker = line.trimEnd();
    const protectedLine = protectedRanges.some(
      ([start, end]) => offset >= start && offset < end,
    );
    if (!protectedLine && marker === "::localized-story") {
      if (opened || closed)
        throw new Error("Expected one localized story wrapper.");
      opened = true;
    } else if (!protectedLine && marker === "::" && opened && !closed) {
      closed = true;
      active = "";
    } else if (
      !protectedLine &&
      /^#(?:en|fr|de)$/.test(marker) &&
      opened &&
      !closed
    ) {
      active = marker.slice(1);
      if (found.has(active)) throw new Error(`Duplicate ${active} story.`);
      found.add(active);
    } else if (active) {
      result[active] += line;
    } else if (line.trim()) {
      throw new Error(
        "Story text must be inside an English, French or German slot.",
      );
    }
    offset += line.length;
  }
  if (!opened || !closed || found.size !== storyLocales.length)
    throw new Error(
      "Expected English, French and German story slots inside one closed wrapper.",
    );
  return Object.fromEntries(
    Object.entries(result).map(([locale, text]) => [locale, text.trim()]),
  );
}
