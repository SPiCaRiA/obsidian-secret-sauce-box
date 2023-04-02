import type {Plugin} from 'Plugin.types';

import {App, PluginSettingTab, Setting} from 'obsidian';

export class SecretSauceBoxSettingTab extends PluginSettingTab {
  plugin: Plugin;

  constructor(app: App, plugin: Plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    containerEl.createEl('h2', {text: 'Secret Sauce Box'});

    new Setting(containerEl)
      .setName('Enable double click maximize active')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.getSettings('doubleClickMaximizeActive'))
          .onChange(async value => {
            this.plugin.setSettings('doubleClickMaximizeActive', value);
            await this.plugin.saveSettings();
          }),
      );
  }
}
