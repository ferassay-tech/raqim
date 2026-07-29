import { useEffect } from "react";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_NAME,
} from "../lib/seo";
import { useSettings } from "../admin/context/SettingsContext";
import { useAssetDimensions } from "../lib/mediaDimensions";

type OgType = "website" | "book" | "article";

type HelmetProps = {
  title: string;
  description?: string;
  /** Site-relative path (e.g. "/books/kuni-hajar") — canonical and og:url
   * are both derived from this via `absoluteUrl`, so no page hand-builds
   * an "https://r-aqim.com/..." string itself. */
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
  type = "website",
  noindex = false,
  publishedTime,
  modifiedTime,
}: HelmetProps) {
  const { settings } = useSettings();
  const getDimensions = useAssetDimensions();

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

    const url = absoluteUrl(path);

    if (description) {
      setMeta('meta[name="description"]', "name", description);
      setMeta('meta[property="og:description"]', "property", description);
      setMeta('meta[name="twitter:description"]', "name", description);
    }

    setMeta('meta[property="og:site_name"]', "property", SITE_NAME);
    setMeta('meta[property="og:type"]', "property", type);
    setMeta('meta[property="og:title"]', "property", title);
    setMeta('meta[name="twitter:card"]', "name", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", title);

    setMeta('meta[property="og:image"]', "property", resolvedImage);
    setMeta('meta[name="twitter:image"]', "name", resolvedImage);
    if (resolvedWidth) setMeta('meta[property="og:image:width"]', "property", String(resolvedWidth));
    else removeMeta('meta[property="og:image:width"]');
    if (resolvedHeight) setMeta('meta[property="og:image:height"]', "property", String(resolvedHeight));
    else removeMeta('meta[property="og:image:height"]');

    setMeta('meta[property="og:url"]', "property", url);
    setLink("canonical", url);

    setMeta('meta[name="robots"]', "name", noindex ? "noindex,nofollow" : "index,follow");

    if (publishedTime) setMeta('meta[property="article:published_time"]', "property", publishedTime);
    else removeMeta('meta[property="article:published_time"]');
    if (modifiedTime) setMeta('meta[property="article:modified_time"]', "property", modifiedTime);
    else removeMeta('meta[property="article:modified_time"]');
  }, [
    title,
    description,
    path,
    type,
    noindex,
    publishedTime,
    modifiedTime,
    resolvedImage,
    resolvedWidth,
    resolvedHeight,
  ]);

  return null;
}
