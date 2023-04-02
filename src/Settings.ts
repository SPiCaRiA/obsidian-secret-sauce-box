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

    // --- Double Click Maximize Active ---
    containerEl.createEl('h2', {text: 'Double Click Maximize Active'});

    new Setting(containerEl)
      .setName('Enable double click maximize active')
      .setDesc(
        createFragment(el => {
          el.createEl('strong').appendText('For unstacked tabs');
          el.appendText(
            ': double clicking the tab headers will maximize the active ' +
              'pane and squeeze the other panes ' +
              '(same behavior as double clicking tab headers in VSCode).',
          );
          el.createEl('br');
          el.createEl('strong').appendText('For stacked tabs');
          el.appendText(
            ': double clicking the tab headers will maximize the active sliding ' +
              'tab and hide the others.',
          );
          el.createEl('br');
          el.createEl('br');
          el.createEl('em').appendText(
            'Double click again to turn off the maximizing behavior.',
          );
        }),
      )
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.getSettings('doubleClickMaximizeActive'))
          .onChange(async value => {
            this.plugin.setSettings('doubleClickMaximizeActive', value);
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Minimum width/height of the squeezed non-active pane')
      .setDesc('Default value is the same as that of VSCode.')
      .addText(text =>
        text
          .setValue(
            this.plugin.getSettings('doubleClickMaximizeActivePaneShrinkMin'),
          )
          .setPlaceholder(
            this.plugin.getDefaultSettings(
              'doubleClickMaximizeActivePaneShrinkMin',
            ),
          )
          .onChange(async value => {
            this.plugin.setSettings(
              'doubleClickMaximizeActivePaneShrinkMin',
              value !== ''
                ? value
                : this.plugin.getDefaultSettings(
                    'doubleClickMaximizeActivePaneShrinkMin',
                  ),
            );
            await this.plugin.saveSettings();
          }),
      );

    // --- Preserve Active Tab ---
    containerEl.createEl('h2', {text: 'Preserve Active Tab'});

    new Setting(containerEl)
      .setName('Enable preserve active tab')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.getSettings('preserveActiveTab'))
          .onChange(async value => {
            this.plugin.setSettings('preserveActiveTab', value);
            await this.plugin.saveSettings();
          }),
      );
  }
}
