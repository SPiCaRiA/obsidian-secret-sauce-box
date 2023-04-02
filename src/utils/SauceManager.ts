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

/**
 * Type guard function.
 */
function hasUnloader<K extends SauceName>(
  unloaderMap: SauceUnloaderMap,
  sauceName: K,
): unloaderMap is SauceUnloaderMap & {
  [sauceName in K]: Required<SauceUnloaderMap>[K];
} {
  return unloaderMap[sauceName] !== undefined;
}

export function buildSauceManager({
  sauceMap,
  sauceLoadStageMap,
  plugin,
}: BuildSauceManagerParams): SauceManager {
  const unloaderMap: SauceUnloaderMap = {};

  const loadSauce = (sauceName: SauceName) => {
    if (!hasUnloader(unloaderMap, sauceName)) {
      unloaderMap[sauceName] = sauceMap[sauceName].load(plugin);
    }
  };

  const unloadSauce = (sauceName: SauceName) => {
    if (hasUnloader(unloaderMap, sauceName)) {
      unloaderMap[sauceName]();
      delete (unloaderMap as SauceUnloaderMap)[sauceName];
    }
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
