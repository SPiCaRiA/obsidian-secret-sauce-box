import type {Plugin} from 'Plugin.types';

export type SauceName =
  | 'doubleClickMaximizeActive'
  | 'preserveActiveTab'
  | 'setDocGlobalLangAttribute';

export const sauceLoadStageEnum = {
  immediate: 'immediate',
  afterLayoutReady: 'afterLayoutReady',
} as const;
export type SauceLoadStage =
  (typeof sauceLoadStageEnum)[keyof typeof sauceLoadStageEnum];

type SauceLoader = (plugin: Plugin) => SauceUnloader;
export type SauceUnloader = () => void;

export type Sauce = {
  loadStage: SauceLoadStage;
  load: SauceLoader;
};

export type SauceManager = {
  loadSauce: (sauceName: SauceName) => void;
  unloadSauce: (sauceName: SauceName) => void;
  unloadAll: () => void;
  loadSaucesByStage: (
    loadStage: SauceLoadStage,
    checkEnabled: (sauceName: SauceName) => boolean,
  ) => void;
};

// --- Maps of Sauces ---
export type SauceMap = Record<SauceName, Readonly<Sauce>>;

export type SauceUnloaderMap = Partial<Record<SauceName, SauceUnloader>>;

export type SauceNameByLoadStageMap = Record<
  SauceLoadStage,
  ReadonlyArray<SauceName>
>;
