import type { AdminMediaAsset } from "@/admin/types/media";
import { formatBytes } from "@/admin/lib/formatBytes";
import { IconCheck } from "@/admin/icons";

interface MediaAssetCardProps {
  asset: AdminMediaAsset;
  onClick: () => void;
  selected?: boolean;
}

export function MediaAssetCard({ asset, onClick, selected = false }: MediaAssetCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col overflow-hidden rounded-[10px] border bg-white/70 text-start backdrop-blur transition-all duration-200 ${
        selected ? "border-gold ring-2 ring-gold/40" : "border-beige hover:border-gold/50 hover:shadow-[0_14px_30px_-16px_rgba(44,36,32,0.35)]"
      }`}
    >
      <div className="aspect-square w-full overflow-hidden bg-cream">
        <img
          src={asset.url}
          alt={asset.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      {selected && (
        <span className="absolute end-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-gold text-ink">
          <IconCheck className="h-3.5 w-3.5" />
        </span>
      )}
      <div className="flex flex-col gap-0.5 px-3 py-2.5">
        <p className="truncate text-xs text-ink">{asset.name}</p>
        <p className="text-[11px] text-ink-faint">{formatBytes(asset.size)}</p>
      </div>
    </button>
  );
}
