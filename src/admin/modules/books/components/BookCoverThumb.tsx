import { IconBook } from "@/admin/icons";

const PLACEHOLDER_GRADIENTS = [
  "from-cream to-beige",
  "from-lavender/30 to-mauve/25",
  "from-gold/15 to-cream",
  "from-mauve/25 to-cream",
  "from-beige to-lavender/20",
];

function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 997;
  return PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length];
}

interface BookCoverThumbProps {
  id: string;
  cover: string | null;
  title: string;
  className?: string;
}

/** Real cover when one exists; otherwise a calm brand-toned gradient tile
 * with a book glyph — never a broken <img> icon. */
export function BookCoverThumb({ id, cover, title, className = "" }: BookCoverThumbProps) {
  if (cover) {
    return (
      <div className={`overflow-hidden rounded-md bg-beige ${className}`}>
        <img src={cover} alt={title} loading="lazy" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-md bg-gradient-to-br text-gold-deep/50 ${gradientFor(
        id
      )} ${className}`}
    >
      <IconBook className="h-1/3 w-1/3" />
    </div>
  );
}
