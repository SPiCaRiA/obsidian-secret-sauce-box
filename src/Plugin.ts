import type {
  Settings,
  SettingsChangeCallback,
  SettingsValue,
} from 'Settings.types';
import type {SauceName} from 'Sauces.types';

import {DEFAULT_SETTINGS, sauceLoadStageMap, sauceMap} from 'Defaults';
import {SecretSauceBoxSettingTab} from 'Settings';
import {buildSauceManager} from 'SauceManager';
import {sauceLoadStageEnum, SauceManager} from 'Sauces.types';

import {Plugin} from 'obsidian';

export default class SecretSauceBoxPlugin extends Plugin {
  private settings: Settings;
  private sauceManager: SauceManager;
  private settingsChangeCallbacks: {
    [settingsName in keyof Settings]?: SettingsChangeCallback[];
  } = {};

  // --- General Obsidian Plug-in Methods ---
  public async onload() {
    await this.loadSettings();
    this.addSettingTab(new SecretSauceBoxSettingTab(this.app, this));

    this.sauceManager = buildSauceManager({
      sauceMap,
      sauceLoadStageMap,
      plugin: this,
    });

    this.loadSauces();
  }

  public onunload() {
    // Unload all sauces.
    this.sauceManager.unloadAll();
  }

  public async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  public async saveSettings() {
    await this.saveData(this.settings);
  }

  // --- Custom Methods ---
  private loadSauces() {
    // Register on settings change callback for all sauces.
    (Object.keys(sauceMap) as SauceName[]).forEach(sauceName =>
      this.onSettingsChange(sauceName, newVal =>
        newVal
          ? // Sauce enabled.
            this.sauceManager.loadSauce(sauceName)
          : // Sauce disabled.
            this.sauceManager.unloadSauce(sauceName),
      ),
    );

    const checkEnabled = (sauceName: SauceName) => this.settings[sauceName];
    // Load immedate sauces.
    this.sauceManager.loadSaucesByStage(
      sauceLoadStageEnum.immediate,
      checkEnabled,
    );
    // Register sauces that are supposed to be loaded after layout ready.
    this.app.workspace.onLayoutReady(() =>
      this.sauceManager.loadSaucesByStage(
        sauceLoadStageEnum.afterLayoutReady,
        checkEnabled,
      ),
    );
  }

  public onSettingsChange(
    settingsName: keyof Settings,
    callback: SettingsChangeCallback,
  ) {
    if (!this.settingsChangeCallbacks[settingsName]) {
      this.settingsChangeCallbacks[settingsName] = [];
    }
    this.settingsChangeCallbacks[settingsName]?.push(callback);
  }

  public getSettings(settingsName: keyof Settings) {
    return this.settings[settingsName];
  }

  public setSettings(settingsName: keyof Settings, val: SettingsValue) {
    this.settingsChangeCallbacks[settingsName]?.forEach(cb =>
      cb(val, this.settings[settingsName]),
    );

    if (typeof val === typeof this.settings[settingsName]) {
      // Under runtime type check, safe.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.settings[settingsName] = val as any;
    } else {
      console.error(
        `Incompatible settings value for ${settingsName}: ${val} (${typeof val})`,
      );
    }
  }
}
