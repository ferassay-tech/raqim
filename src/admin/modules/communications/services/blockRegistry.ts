/**
 * Registers a renderer for a (blockType, surfaceType) pair — e.g. a
 * "richText" block rendered for the "email" surface vs. a future "web"
 * surface. Deliberately empty: no renderer is registered yet (rendering is
 * out of scope for this milestone), but the registration API itself is
 * real and typed, so building the first renderer later is one
 * `registerBlockRenderer` call, not a new subsystem.
 */
export type BlockRenderer<TSettings = Record<string, unknown>> = (settings: TSettings) => unknown;

const BLOCK_REGISTRY = new Map<string, BlockRenderer>();

function registryKey(blockType: string, surfaceType: string): string {
  return `${surfaceType}:${blockType}`;
}

export function registerBlockRenderer(
  blockType: string,
  surfaceType: string,
  renderer: BlockRenderer
): void {
  BLOCK_REGISTRY.set(registryKey(blockType, surfaceType), renderer);
}

export function getBlockRenderer(blockType: string, surfaceType: string): BlockRenderer | undefined {
  return BLOCK_REGISTRY.get(registryKey(blockType, surfaceType));
}

export function listRegisteredBlockTypes(): string[] {
  return Array.from(BLOCK_REGISTRY.keys());
}
