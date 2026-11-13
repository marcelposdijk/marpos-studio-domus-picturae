// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defaultLocale, locales } from "./src/i18n/config.ts";

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || "https://domus-picturae.example",
  output: "static",
  trailingSlash: "never",

  build: {
    // Every page's CSS is a few KB; inlining it removes the render-blocking
    // stylesheet requests (the CSP already allows inline styles).
    inlineStylesheets: "always",
  },

  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Baskervville",
      cssVariable: "--font-baskervville",
      styles: ["normal"],
      weights: [300, 400, 900],
      fallbacks: ["serif"],
    },
    {
      provider: fontProviders.fontshare(),
      name: "Satoshi",
      cssVariable: "--font-satoshi",
      styles: ["normal"],
      weights: [300, 400, 500, 600, 900],
      fallbacks: ["sans-serif"],
    },
  ],

  experimental: {
    clientPrerender: true,
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale,
        locales: Object.fromEntries(locales.map((locale) => [locale, locale])),
      },
    }),
    react(),
  ],
});
