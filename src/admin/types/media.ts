export type MediaAssetType = "image" | "document";

export interface AdminMediaFolder {
  id: string;
  name: string;
}

export interface AdminMediaAsset {
  id: string;
  url: string;
  name: string;
  type: MediaAssetType;
  /** null = "غير مصنّف" — no folder assigned yet. */
  folderId: string | null;
  size: number;
  width: number | null;
  height: number | null;
  uploadedAt: string;
}
