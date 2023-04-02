import type {Plugin} from 'Plugin.types';
import type {
  ToolLoadStage,
  ToolManager,
  ToolMap,
  ToolName,
  ToolNameByLoadStageMap,
  ToolUnloaderMap,
} from 'Tools.types';

type BuildToolManagerParams = {
  toolMap: ToolMap;
  toolLoadStageMap: ToolNameByLoadStageMap;
  plugin: Plugin;
};

export function buildToolManager({
  toolMap,
  toolLoadStageMap,
  plugin,
}: BuildToolManagerParams): ToolManager {
  const unloaderMap: ToolUnloaderMap = {};

  const loadTool = (toolName: ToolName) => {
    if (unloaderMap[toolName]) {
      throw new Error(`Unexpected loaded tool: ${toolName}`);
    }
    unloaderMap[toolName] = toolMap[toolName].load(plugin);
  };

  const unloadTool = (toolName: ToolName) => {
    if (unloaderMap[toolName] === undefined) {
      throw new Error(`Unexpected unloaded tool: ${toolName}`);
    }
    unloaderMap[toolName]?.();
    delete unloaderMap[toolName];
  };

  const unloadAll = () =>
    (Object.keys(unloaderMap) as ToolName[]).forEach(toolName =>
      unloadTool(toolName),
    );

  const loadToolsByStage = (
    loadStage: ToolLoadStage,
    checkEnabled: (toolName: ToolName) => boolean,
  ) =>
    toolLoadStageMap[loadStage].forEach(
      toolName => checkEnabled(toolName) && loadTool(toolName),
    );

  return {loadTool, unloadTool, unloadAll, loadToolsByStage};
}
