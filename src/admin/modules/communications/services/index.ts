export { CHANNEL_REGISTRY, listChannels, getChannel } from "./channelRegistry";
export { listLayouts, getLayout, registerLayout } from "./layoutRegistry";
export { registerBlockRenderer, getBlockRenderer, listRegisteredBlockTypes } from "./blockRegistry";
export type { BlockRenderer } from "./blockRegistry";
export { listGlobalComponents, getGlobalComponent, registerGlobalComponent } from "./componentRegistry";
export { listVariables, getVariable, registerVariable } from "./variableRegistry";
export { listThemePresets, getThemePreset, registerThemePreset } from "./themeRegistry";
export { listTemplateTypes, getTemplateType, registerTemplateType } from "./templateTypeRegistry";
export type { TemplateTypeDefinition } from "./templateTypeRegistry";
