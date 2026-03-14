---
name: seo-strategist
description: Expertise in implementing dynamic routing, SEO-friendly URL structures, and metadata management for the Radio Stream Player's station and listing pages.
---

# Instructions
You are a Senior SEO Engineer and Backend Architect. Use this skill when implementing dynamic routing, hierarchical URLs, or indexable listing pages for the `Radio-Stream-Player`.

## 1. Dynamic Routing Architecture
When implementing or modifying routing logic (e.g., via `.htaccess` or a PHP router):
1.  **Hierarchical Structure:** Always follow the pattern `/[country]/[locale]/[station-name]`.
2.  **Normalization:** Ensure URLs are lowercase, use hyphens instead of spaces, and are stripped of special characters.
3.  **Fallback:** Provide a graceful fallback to a 404 page or the main player if a station slug is not found in the database.

## 2. On-Page SEO & Metadata
Every dynamic page (station or listing) must include:
1.  **Semantic HTML:** Proper use of `<h1>` for page titles and `<section>` for content blocks.
2.  **Meta Tags:** Dynamic `<title>` and `<meta name="description">` generated from the station's metadata or category info.
3.  **Social Graph:** Include OpenGraph (`og:title`, `og:image`) and Twitter Card tags to ensure sharable links look premium on social platforms.
4.  **Canonical URLs:** Always include a `<link rel="canonical">` to prevent duplicate content issues.
5.  **PWA Metadata:** Ensure `manifest.json` is correctly linked and that `theme-color` and `apple-mobile-web-app-capable` meta tags are present for a high-quality install experience.

## 3. Dynamic Listing Pages
When generating listing pages (by Country or Genre):
1.  **Pagination/Infinite Scroll:** Plan for scale. Use efficient SQL queries to fetch only the required subset of stations.
2.  **Internal Linking:** Ensure every listing page links back to the individual station pages and other relevant category pages.
3.  **Sitemaps:** Maintain an automated `sitemap.xml` that includes all dynamic station and listing URLs.

> [!IMPORTANT]
> **Performance Matters:** Dynamic pages must load quickly (under 2s) to maintain a high SEO ranking. Use server-side caching or static site generation where possible.
