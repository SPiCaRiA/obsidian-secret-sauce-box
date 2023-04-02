import type {Settings, SettingsSauceToggles} from 'Settings.types';
import type {SauceMap, SauceName, SauceNameByLoadStageMap} from 'Sauces.types';

import {doubleClickMaximizeActive} from 'DoubleClickMaximizeActive';
import {sauceLoadStageEnum} from 'Sauces.types';

// --- Sauces ---
export const sauceMap: SauceMap = {
  doubleClickMaximizeActive: {
    load: doubleClickMaximizeActive,
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
};

export const DEFAULT_SETTINGS: Settings = {
  ...DEFAULT_TOOL_TOGGLES,
};
