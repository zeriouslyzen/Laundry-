import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/how-it-works",
    "/pricing",
    "/about",
    "/contact",
    "/news",
    "/community",
    "/book/new",
    "/docs/terms",
  ];

  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/news" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/book/new" ? 0.9 : 0.7,
  }));
}
