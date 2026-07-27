import { useMedia } from "../admin/context/MediaContext";

export interface AssetDimensions {
  width: number;
  height: number;
}

/**
 * Looks up a media URL's real, recorded pixel dimensions from the shared
 * Media Library (src/admin/context/MediaContext.tsx) — the same store the
 * Admin uploads/replaces images through. Used to set real `width`/`height`
 * attributes on public `<img>` tags (layout-shift prevention) without ever
 * guessing: an asset not registered in the library simply returns `null`,
 * and the caller omits the attributes rather than reporting a wrong size.
 */
export function useAssetDimensions() {
  const { assets } = useMedia();

  return (url: string | null | undefined): AssetDimensions | null => {
    if (!url) return null;
    const asset = assets.find((a) => a.url === url);
    if (!asset || asset.width === null || asset.height === null) return null;
    return { width: asset.width, height: asset.height };
  };
}
