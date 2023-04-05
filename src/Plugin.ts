import type {SauceName} from 'Sauces.types';
import type {Settings, SettingsChangeCallback} from 'Settings.types';

import {DEFAULT_SETTINGS, sauceLoadStageMap, sauceMap} from 'Defaults';
import {buildSauceManager} from 'SauceManager';
import {sauceLoadStageEnum, SauceManager} from 'Sauces.types';
import {SecretSauceBoxSettingTab} from 'Settings';

import {Plugin} from 'obsidian';

export default class SecretSauceBoxPlugin extends Plugin {
  private settings: Settings;
  private sauceManager: SauceManager;
  private settingsChangeCallbacks: {
    [settingsName in keyof Settings]?: SettingsChangeCallback<keyof Settings>[];
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
      this.onSettingsChange(sauceName, sauceEnabled =>
        sauceEnabled
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

  public onSettingsChange<K extends keyof Settings>(
    settingsName: K,
    callback: SettingsChangeCallback<K>,
  ) {
    if (!this.settingsChangeCallbacks[settingsName]) {
      this.settingsChangeCallbacks[settingsName] = [];
    }
    this.settingsChangeCallbacks[settingsName]?.push(callback);
  }

  public getSettings<K extends keyof Settings>(settingsName: K) {
    return this.settings[settingsName];
  }

  public setSettings<K extends keyof Settings>(
    settingsName: K,
    val: Settings[K],
  ) {
    this.settingsChangeCallbacks[settingsName]?.forEach(cb =>
      cb(val, this.settings[settingsName]),
    );
    this.settings[settingsName] = val;
  }

  public getDefaultSettings<K extends keyof Settings>(settingsName: K) {
    return DEFAULT_SETTINGS[settingsName];
  }
}
