import { useEffect } from "react";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_NAME,
  stripLanguagePrefix,
  withLanguagePrefix,
} from "../lib/seo";
import { useSettings } from "../admin/context/SettingsContext";
import { useAssetDimensions } from "../lib/mediaDimensions";
import { useLanguage } from "../context/LanguageContext";
import { localizeProperName } from "../lib/properNames";

type OgType = "website" | "book" | "article";

type HelmetProps = {
  title: string;
  /** Falls back to the Dashboard's Settings → SEO description when a page
   * doesn't supply its own, so the description meta tags always have real,
   * page-appropriate content instead of silently keeping whatever the
   * previously-visited page last set (see the always-run block below). */
  description?: string;
  /** Site-relative path in its bare/Arabic shape (e.g. "/books/kuni-hajar")
   * — pass the same value regardless of which language route is currently
   * rendering it. Helmet applies the current language's /en prefix (and
   * normalizes away any prefix already present, e.g. from
   * `location.pathname`) before deriving canonical, og:url, and hreflang,
   * so no page hand-builds a prefixed or absolute URL itself. */
  path: string;
  /** Site-relative or absolute image path. When a page doesn't supply its
   * own, falls back to the Dashboard's Settings → SEO social image (kept in
   * sync across every page instead of each one reading it individually),
   * and only falls back further to the hardcoded sitewide default if the
   * admin hasn't set one. */
  image?: string;
  /** Only applied when `image` is also provided — never guessed, so a
   * custom image without known dimensions simply omits the width/height
   * tags rather than reporting the wrong size. */
  imageWidth?: number;
  imageHeight?: number;
  /** Describes whatever `og:image` actually resolves to. Falls back to
   * `title` when a page doesn't supply one — every page already has a
   * specific, meaningful title, so this is never left empty. */
  imageAlt?: string;
  type?: OgType;
  /** True for transactional/utility/private pages (checkout, payment,
   * order-received, download, search, 404) that should never be indexed. */
  noindex?: boolean;
  /** ISO date strings — set on Article pages only. */
  publishedTime?: string;
  modifiedTime?: string;
};

export function Helmet({
  title,
  description,
  path,
  image,
  imageWidth,
  imageHeight,
  imageAlt,
  type = "website",
  noindex = false,
  publishedTime,
  modifiedTime,
}: HelmetProps) {
  const { settings } = useSettings();
  const getDimensions = useAssetDimensions();
  const { language } = useLanguage();

  // Single resolution chain so og:image, twitter:image, and (via the same
  // dashboard value read by structuredData.ts builders) structured-data
  // images all end up showing the same picture: a page's own explicit
  // `image` wins; otherwise the Dashboard's Settings → SEO social image;
  // otherwise the hardcoded sitewide default. Dimensions are only ever
  // reported when they're actually known (page-supplied or looked up in the
  // Media Library) — never guessed.
  const dashboardImage = settings.seo.socialImage;
  const effectiveImage = image ?? dashboardImage ?? DEFAULT_OG_IMAGE;
  const resolvedImage = absoluteUrl(effectiveImage);
  const dashboardDims = !image && dashboardImage ? getDimensions(dashboardImage) : null;
  const resolvedWidth = image ? imageWidth : dashboardImage ? dashboardDims?.width : DEFAULT_OG_IMAGE_WIDTH;
  const resolvedHeight = image ? imageHeight : dashboardImage ? dashboardDims?.height : DEFAULT_OG_IMAGE_HEIGHT;
  // Same "always resolves to something real" pattern as the image chain
  // above — a page's own description wins, otherwise the Dashboard's
  // Settings → SEO description, so these tags are never conditionally
  // skipped (see the always-run block below) and can never go stale.
  const resolvedDescription = description || settings.seo.description;
  const resolvedImageAlt = imageAlt || title;

  useEffect(() => {
    document.title = title;

    const setMeta = (
      selector: string,
      attribute: "name" | "property",
      value: string
    ) => {
      let tag = document.querySelector(selector) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, selector.match(/["'](.+)["']/)?.[1] || "");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    };

    const removeMeta = (selector: string) => {
      document.querySelector(selector)?.remove();
    };

    const setLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // SEO Milestone 2 — `path` may arrive bare or already language-prefixed
    // (every existing page passes the bare/Arabic shape; NotFoundPage
    // passes the raw current pathname, which may already carry /en).
    // Normalizing to bare first, then re-applying the *current* language's
    // prefix, makes this correct either way without requiring every call
    // site to know or care which shape it's passing.
    const barePath = stripLanguagePrefix(path);
    const languagePath = withLanguagePrefix(barePath, language);
    const url = absoluteUrl(languagePath);

    const setHreflang = (hreflang: string, href: string) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "alternate";
        link.hreflang = hreflang;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    const removeHreflang = (hreflang: string) => {
      document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`)?.remove();
    };

    // Always run, never conditionally skipped — resolvedDescription already
    // falls back to the sitewide default above, so these three tags are
    // guaranteed fresh on every navigation instead of possibly keeping
    // whatever the previously-visited page last set.
    setMeta('meta[name="description"]', "name", resolvedDescription);
    setMeta('meta[property="og:description"]', "property", resolvedDescription);
    setMeta('meta[name="twitter:description"]', "name", resolvedDescription);

    setMeta('meta[property="og:site_name"]', "property", localizeProperName(SITE_NAME, language));
    setMeta('meta[property="og:type"]', "property", type);
    setMeta('meta[property="og:title"]', "property", title);
    setMeta('meta[property="og:locale"]', "property", language === "ar" ? "ar_AR" : "en_US");
    setMeta('meta[name="twitter:card"]', "name", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", title);

    setMeta('meta[property="og:image"]', "property", resolvedImage);
    setMeta('meta[name="twitter:image"]', "name", resolvedImage);
    setMeta('meta[property="og:image:alt"]', "property", resolvedImageAlt);
    setMeta('meta[name="twitter:image:alt"]', "name", resolvedImageAlt);
    if (resolvedWidth) setMeta('meta[property="og:image:width"]', "property", String(resolvedWidth));
    else removeMeta('meta[property="og:image:width"]');
    if (resolvedHeight) setMeta('meta[property="og:image:height"]', "property", String(resolvedHeight));
    else removeMeta('meta[property="og:image:height"]');

    setMeta('meta[property="og:url"]', "property", url);
    setLink("canonical", url);

    // Reciprocal hreflang — centralized here rather than hand-written per
    // page, since every indexable route has a mechanical, same-shaped
    // sibling in the other language (see lib/seo.ts). Skipped for noindex
    // pages: hreflang signals indexation, which doesn't apply to them, and
    // a 404 has no real cross-language equivalent to point to anyway.
    // Arabic is x-default, matching Arabic being the unprefixed, canonical
    // default language for this site.
    if (noindex) {
      removeHreflang("ar");
      removeHreflang("en");
      removeHreflang("x-default");
    } else {
      const arUrl = absoluteUrl(barePath);
      const enUrl = absoluteUrl(withLanguagePrefix(barePath, "en"));
      setHreflang("ar", arUrl);
      setHreflang("en", enUrl);
      setHreflang("x-default", arUrl);
    }

    setMeta('meta[name="robots"]', "name", noindex ? "noindex,nofollow" : "index,follow");

    if (publishedTime) setMeta('meta[property="article:published_time"]', "property", publishedTime);
    else removeMeta('meta[property="article:published_time"]');
    if (modifiedTime) setMeta('meta[property="article:modified_time"]', "property", modifiedTime);
    else removeMeta('meta[property="article:modified_time"]');
  }, [
    title,
    resolvedDescription,
    path,
    type,
    noindex,
    publishedTime,
    modifiedTime,
    resolvedImage,
    resolvedWidth,
    resolvedHeight,
    resolvedImageAlt,
    language,
  ]);

  return null;
}
