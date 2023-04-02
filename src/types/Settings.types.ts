import {SauceName} from 'Sauces.types';

export type SettingsSauceToggles = Record<SauceName, boolean>;

// For now, all settings are used to toggle sauces. But in future,
// we might have more global settings, which can be unioned with
// the toggle settings.
export type Settings = SettingsSauceToggles & {
  // Minimum width/height of the shrinked non-active pane.
  doubleClickMaximizeActivePaneShrinkMin: string;
};

export type SettingsChangeCallback = <T extends Settings[keyof Settings]>(
  newVal: T,
  oldVal: T,
) => void;
