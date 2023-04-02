import {SauceName} from 'Sauces.types';

export type SettingsSauceToggles = Record<SauceName, boolean>;

// For now, all settings are used to toggle sauces. But in future,
// we might have more global settings, which can be unioned with
// the toggle settings.
export type Settings = SettingsSauceToggles;

export type SettingsValue = boolean | string;

export type SettingsChangeCallback = <T extends SettingsValue>(
  newVal: T,
  oldVal: T,
) => void;
