const SIZE_CLASS = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-lg",
  lg: "h-16 w-16 text-2xl",
} as const;

interface CustomerAvatarProps {
  name: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  /** Optional photo — falls back to the initial when absent (or on load
   * failure). Used for the admin's own profile avatar as well as customers. */
  imageUrl?: string | null;
}

export function CustomerAvatar({ name, size = "md", className = "", imageUrl }: CustomerAvatarProps) {
  const initial = name.trim().charAt(0) || "؟";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${SIZE_CLASS[size]} ${className}`}
      />
    );
  }

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-cream to-lavender/40 font-display text-gold-deep ${SIZE_CLASS[size]} ${className}`}
    >
      {initial}
    </span>
  );
}
