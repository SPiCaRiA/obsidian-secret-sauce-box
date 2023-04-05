import type {SauceName} from 'Sauces.types';
import type {OnSettingChangeCallback, Settings} from 'Settings.types';

import {DEFAULT_SETTINGS, sauceLoadStageMap, sauceMap} from 'Defaults';
import {buildSauceManager} from 'SauceManager';
import {sauceLoadStageEnum, SauceManager} from 'Sauces.types';
import {SecretSauceBoxSettingTab} from 'Settings';

import {Plugin} from 'obsidian';

export default class SecretSauceBoxPlugin extends Plugin {
  private settings: Settings;
  private sauceManager: SauceManager;
  private onSettingChangeCallbacks: {
    [settingName in keyof Settings]?: OnSettingChangeCallback<keyof Settings>[];
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
    // Register onSettingChange callbacks for all sauces.
    (Object.keys(sauceMap) as SauceName[]).forEach(sauceName =>
      this.onSettingChange(sauceName, sauceEnabled =>
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

  public onSettingChange<K extends keyof Settings>(
    settingName: K,
    callback: OnSettingChangeCallback<K>,
  ) {
    if (!this.onSettingChangeCallbacks[settingName]) {
      this.onSettingChangeCallbacks[settingName] = [];
    }
    this.onSettingChangeCallbacks[settingName]?.push(callback);
  }

  public getSetting<K extends keyof Settings>(settingName: K) {
    return this.settings[settingName];
  }

  public setSetting<K extends keyof Settings>(
    settingName: K,
    val: Settings[K],
  ) {
    this.onSettingChangeCallbacks[settingName]?.forEach(cb =>
      cb(val, this.settings[settingName]),
    );
    this.settings[settingName] = val;
  }

  public getDefaultSetting<K extends keyof Settings>(settingName: K) {
    return DEFAULT_SETTINGS[settingName];
  }
}
