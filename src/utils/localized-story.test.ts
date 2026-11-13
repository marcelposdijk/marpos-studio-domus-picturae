import { describe, it, expect } from "vitest";
import { readLocalizedStory, storyTemplate } from "./localized-story.mjs";
import { bodyMarkdown } from "./body";
describe("unified multilingual stories", () => {
  it("reads independent locale slots, retaining fenced marker examples and video HTML", () => {
    const source =
      '::localized-story\n#en\n\nEnglish.\n\n```md\n#fr\n::\n```\n\n#fr\n\nFrançais.\n\n<iframe src="https://www.youtube-nocookie.com/embed/WBwNw4WjV7g"></iframe>\n\n#de\n\nDeutsch.\n\n::\n';
    const result = readLocalizedStory(source);
    expect(result.en).toContain("```md\n#fr\n::\n```");
    expect(result.fr).toContain("Français.");
    expect(result.fr).toContain("youtube-nocookie.com/embed/WBwNw4WjV7g");
    expect(result.de).toBe("Deutsch.");
  });
  it("provides all slots on new content without inventing translations", () => {
    expect(readLocalizedStory(storyTemplate)).toEqual({
      en: "",
      fr: "",
      de: "",
    });
  });
  it("rejects missing, repeated and broken language boundaries", () => {
    expect(() => readLocalizedStory("Text outside the wrapper")).toThrow();
    expect(() =>
      readLocalizedStory(storyTemplate.replace("#fr", "#en")),
    ).toThrow();
    expect(() =>
      readLocalizedStory(storyTemplate.replace(/::\n$/, "")),
    ).toThrow();
  });
  it("keeps English fallback when a translation is empty", () => {
    expect(
      bodyMarkdown(
        {
          "/content/news/test.md#en": "English.",
          "/content/news/test.md#fr": "",
        },
        "news",
        "test",
        "fr",
      ),
    ).toBe("English.");
  });
});
