import type {Plugin} from 'plugin.types';

export type ToolName = 'maximizeActivePane';

export const toolLoadStageEnum = {
  immediate: 'immediate',
  afterLayoutReady: 'afterLayoutReady',
} as const;
export type ToolLoadStage =
  (typeof toolLoadStageEnum)[keyof typeof toolLoadStageEnum];

type ToolLoader = (plugin: Plugin) => ToolUnloader;
export type ToolUnloader = () => void;

export type Tool = {
  loadStage: ToolLoadStage;
  load: ToolLoader;
};

export type ToolManager = {
  loadTool: (toolName: ToolName) => void;
  unloadTool: (toolName: ToolName) => void;
  unloadAll: () => void;
  loadToolsByStage: (
    loadStage: ToolLoadStage,
    checkEnabled: (toolName: ToolName) => boolean,
  ) => void;
};

// --- Maps of Tools ---
export type ToolMap = Record<ToolName, Readonly<Tool>>;

export type ToolUnloaderMap = Partial<Record<ToolName, ToolUnloader>>;

export type ToolNameByLoadStageMap = Record<
  ToolLoadStage,
  ReadonlyArray<ToolName>
>;
