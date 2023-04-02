import {ToolName} from 'Tools.types';

export type SettingsToolToggles = Record<ToolName, boolean>;

// For now, all settings are used to toggle tools. But in future,
// we might have more global settings, which can be unioned with
// the toggle settings.
export type Settings = SettingsToolToggles;

export type SettingsValue = boolean | string;

export type SettingsChangeCallback = <T extends SettingsValue>(
  newVal: T,
  oldVal: T,
) => void;
