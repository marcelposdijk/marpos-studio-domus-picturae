import type { APIRoute } from "astro";

import { sitePath } from "@utils/site-path";

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(sitePath("/sitemap-index.xml"), site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain" },
  });
};
