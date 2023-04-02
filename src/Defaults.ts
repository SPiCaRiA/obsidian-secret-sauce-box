import type {Settings, SettingsSauceToggles} from 'Settings.types';
import type {SauceMap, SauceName, SauceNameByLoadStageMap} from 'Sauces.types';

import {doubleClickMaximizeActive} from 'DoubleClickMaximizeActive';
import {preserveActiveTab} from 'PreserveActiveTab';
import {sauceLoadStageEnum} from 'Sauces.types';

// --- Sauces ---
export const sauceMap: SauceMap = {
  doubleClickMaximizeActive: {
    load: doubleClickMaximizeActive,
    loadStage: sauceLoadStageEnum.afterLayoutReady,
  },
  preserveActiveTab: {
    load: preserveActiveTab,
    loadStage: sauceLoadStageEnum.afterLayoutReady,
  },
};

export const sauceLoadStageMap: SauceNameByLoadStageMap = (function () {
  const res: Partial<SauceNameByLoadStageMap> = {};
  Object.values(sauceLoadStageEnum).forEach(
    stage =>
      (res[stage] = (Object.keys(sauceMap) as SauceName[]).filter(
        key => sauceMap[key].loadStage === stage,
      )),
  );
  return res as SauceNameByLoadStageMap;
})();

// --- Settings ---
const DEFAULT_TOOL_TOGGLES: SettingsSauceToggles = {
  doubleClickMaximizeActive: true,
  preserveActiveTab: true,
};

export const DEFAULT_SETTINGS: Settings = {
  ...DEFAULT_TOOL_TOGGLES,
  doubleClickMaximizeActivePaneShrinkMin: 'calc(13.75 * 1 rem)',
};
