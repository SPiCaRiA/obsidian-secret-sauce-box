import type {
  Settings,
  SettingsChangeCallback,
  SettingsValue,
} from 'Settings.types';
import type {ToolName} from 'Tools.types';

import {DEFAULT_SETTINGS, toolLoadStageMap, toolMap} from 'Defaults';
import {SecretSauceSettingTab} from 'Settings';
import {buildToolManager} from 'ToolManager';
import {toolLoadStageEnum, ToolManager} from 'Tools.types';

import {Plugin} from 'obsidian';

export default class SecretSaucePlugin extends Plugin {
  private settings: Settings;
  private toolManager: ToolManager;
  private settingsChangeCallbacks: {
    [settingsName in keyof Settings]?: SettingsChangeCallback[];
  } = {};

  // --- General Obsidian Plug-in Methods ---
  public async onload() {
    await this.loadSettings();
    this.addSettingTab(new SecretSauceSettingTab(this.app, this));

    this.toolManager = buildToolManager({
      toolMap,
      toolLoadStageMap,
      plugin: this,
    });

    this.loadTools();
  }

  public onunload() {
    // Unload all tools.
    this.toolManager.unloadAll();
  }

  public async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  public async saveSettings() {
    await this.saveData(this.settings);
  }

  // --- Custom Methods ---
  private loadTools() {
    // Register on settings change callback for all tools.
    (Object.keys(toolMap) as ToolName[]).forEach(toolName =>
      this.onSettingsChange(toolName, newVal =>
        newVal
          ? // Tool enabled.
            this.toolManager.loadTool(toolName)
          : // Tool disabled.
            this.toolManager.unloadTool(toolName),
      ),
    );

    const checkEnabled = (toolName: ToolName) => this.settings[toolName];
    // Load immedate tools.
    this.toolManager.loadToolsByStage(
      toolLoadStageEnum.immediate,
      checkEnabled,
    );
    // Register tools that are supposed to be loaded after layout ready.
    this.app.workspace.onLayoutReady(() =>
      this.toolManager.loadToolsByStage(
        toolLoadStageEnum.afterLayoutReady,
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
