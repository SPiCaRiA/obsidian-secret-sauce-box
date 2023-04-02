import type {Settings, SettingsToolToggles} from 'settings.types';
import type {ToolMap, ToolName, ToolNameByLoadStageMap} from 'tools.types';

import {doubleClickMaximizeActive} from 'DoubleClickMaximizeActive';

import {toolLoadStageEnum} from 'tools.types';

// --- Tools ---
export const toolMap: ToolMap = {
  doubleClickMaximizeActive: {
    load: doubleClickMaximizeActive,
    loadStage: toolLoadStageEnum.afterLayoutReady,
  },
};

export const toolLoadStageMap: ToolNameByLoadStageMap = (function () {
  const res: Partial<ToolNameByLoadStageMap> = {};
  Object.values(toolLoadStageEnum).forEach(
    stage =>
      (res[stage] = (Object.keys(toolMap) as ToolName[]).filter(
        key => toolMap[key].loadStage === stage,
      )),
  );
  return res as ToolNameByLoadStageMap;
})();

// --- Settings ---
const DEFAULT_TOOL_TOGGLES: SettingsToolToggles = {
  doubleClickMaximizeActive: true,
};

export const DEFAULT_SETTINGS: Settings = {
  ...DEFAULT_TOOL_TOGGLES,
};
