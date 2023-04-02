import type {Plugin} from 'Plugin.types';
import type {
  SauceLoadStage,
  SauceManager,
  SauceMap,
  SauceName,
  SauceNameByLoadStageMap,
  SauceUnloaderMap,
} from 'Sauces.types';

type BuildSauceManagerParams = {
  sauceMap: SauceMap;
  sauceLoadStageMap: SauceNameByLoadStageMap;
  plugin: Plugin;
};

export function buildSauceManager({
  sauceMap,
  sauceLoadStageMap,
  plugin,
}: BuildSauceManagerParams): SauceManager {
  const unloaderMap: SauceUnloaderMap = {};

  const loadSauce = (sauceName: SauceName) => {
    if (unloaderMap[sauceName]) {
      throw new Error(`Unexpected loaded sauce: ${sauceName}`);
    }
    unloaderMap[sauceName] = sauceMap[sauceName].load(plugin);
  };

  const unloadSauce = (sauceName: SauceName) => {
    if (unloaderMap[sauceName] === undefined) {
      throw new Error(`Unexpected unloaded sauce: ${sauceName}`);
    }
    unloaderMap[sauceName]?.();
    delete unloaderMap[sauceName];
  };

  const unloadAll = () =>
    (Object.keys(unloaderMap) as SauceName[]).forEach(sauceName =>
      unloadSauce(sauceName),
    );

  const loadSaucesByStage = (
    loadStage: SauceLoadStage,
    checkEnabled: (sauceName: SauceName) => boolean,
  ) =>
    sauceLoadStageMap[loadStage].forEach(
      sauceName => checkEnabled(sauceName) && loadSauce(sauceName),
    );

  return {loadSauce, unloadSauce, unloadAll, loadSaucesByStage};
}
