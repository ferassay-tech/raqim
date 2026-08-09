interface WorkspaceHeaderProps {
  title: string;
}

/**
 * A quiet section label marking one of the dashboard's workspaces
 * (Attention, Business Health, Publishing & Catalog, Sales, Customer
 * Communication). Deliberately reuses the existing muted, tracked-out
 * caption style already used for metric labels elsewhere on the page —
 * an eyebrow above each panel's own title, not a second heading.
 */
export function WorkspaceHeader({ title }: WorkspaceHeaderProps) {
  return <h2 className="text-xs uppercase tracking-[0.2em] text-ink-faint">{title}</h2>;
}
