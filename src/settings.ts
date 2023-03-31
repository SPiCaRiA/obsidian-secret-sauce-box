import type {Plugin} from 'plugin.types';

import {App, PluginSettingTab, Setting} from 'obsidian';

export class SecretSauceSettingTab extends PluginSettingTab {
  plugin: Plugin;

  constructor(app: App, plugin: Plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    containerEl.createEl('h2', {text: 'My Secret Sauce'});
    containerEl.createEl('h3', {text: 'Toogle Tools'});

    new Setting(containerEl)
      .setName('Enable maximize active pane')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.getSettings('maximizeActivePane'))
          .onChange(async value => {
            this.plugin.setSettings('maximizeActivePane', value);
            await this.plugin.saveSettings();
          }),
      );
  }
}
