import {SauceName} from 'Sauces.types';

export type SettingsSauceToggles = Record<SauceName, boolean>;

// For now, all settings are used to toggle sauces. But in future,
// we might have more global settings, which can be unioned with
// the toggle settings.
export type Settings = SettingsSauceToggles & {
  // Minimum width/height of the shrinked non-active pane.
  doubleClickMaximizeActivePaneShrinkMin: string;

  // The global language subtag for all documents.
  globalLangSubtag: string;

  // Whether hyphen line break is allowed in document body or not.
  hyphenBreakBodyEnabled: boolean;
};

export type SettingsChangeCallback<K extends keyof Settings> = (
  newVal: Settings[K],
  oldVal: Settings[K],
) => void;
