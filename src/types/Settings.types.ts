import {SauceName} from 'Sauces.types';

export type SettingsSauceToggles = Record<SauceName, boolean>;

export type Settings = SettingsSauceToggles & {
  // Minimum width/height of the shrinked non-active pane.
  doubleClickMaximizeActivePaneShrinkMin: string;

  // The global language subtag for all documents.
  globalLangSubtag: string;

  // Whether hyphen line break is allowed in document body or not.
  hyphenBreakBodyEnabled: boolean;
};

export type OnSettingChangeCallback<K extends keyof Settings> = (
  newVal: Settings[K],
  oldVal: Settings[K],
) => void;
