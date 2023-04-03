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
      .setName('Enable')
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
      .setDesc(
        createFragment(el => {
          el.appendText(
            'Default value is the same as that of VSCode. The value must be ' +
              'a valid ',
          );
          el.appendChild(
            createEl('a', undefined, a => {
              a.href =
                'https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units';
              a.appendText('CSS value');
            }),
          );
          el.appendText('.');
        }),
      )
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
      .setName('Enable')
      .setDesc(
        'When setting a pane from "Unstack tabs" to "Stack tabs", the active ' +
          'tab is not selected (expanded) as expected. This secret sauce fixes ' +
          'that behavior.',
      )
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.getSettings('preserveActiveTab'))
          .onChange(async value => {
            this.plugin.setSettings('preserveActiveTab', value);
            await this.plugin.saveSettings();
          }),
      );

    // --- Set Doc Global Lang Attribute ---
    containerEl.createEl('h2', {text: 'Set Doc Global Lang Attribute'});

    new Setting(containerEl)
      .setName('Enable')
      .setDesc(
        'Allow setting the `lang` attribute of your document, which can be ' +
          'useful when applying styles such as hyphen breaks.',
      )
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.getSettings('setDocGlobalLangAttribute'))
          .onChange(async value => {
            this.plugin.setSettings('setDocGlobalLangAttribute', value);
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Enable hyphen line break in preview mode')
      .setDesc(
        'Allow breaking words with hyphens at end of line under preview mode. ' +
          'Need enabling doc global lang attribute to work properly.',
      )
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.getSettings('hyphenBreakBodyEnabled'))
          .onChange(async value => {
            this.plugin.setSettings('hyphenBreakBodyEnabled', value);
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Global language subtag')
      .setDesc(
        createFragment(el => {
          el.appendText(
            'Set the langauge subtag that will be applied to your documents. For ' +
              'available subtags, check ',
          );
          el.appendChild(
            createEl('a', undefined, a => {
              a.href = 'https://r12a.github.io/app-subtags/';
              a.appendText('Language Subtag Lookup');
            }),
          );
          el.appendText('.');

          el.createEl('br');
          el.createEl('br');
          el.createEl('em').appendText(
            'To work with hyphen line breaks, make sure that the language ' +
              'can be applied with hyphens. (e.g. "en")',
          );
        }),
      )
      .addText(text =>
        text
          .setValue(this.plugin.getSettings('globalLangSubtag'))
          .setPlaceholder(this.plugin.getDefaultSettings('globalLangSubtag'))
          .onChange(async value => {
            this.plugin.setSettings(
              'globalLangSubtag',
              value !== ''
                ? value
                : this.plugin.getDefaultSettings('globalLangSubtag'),
            );
            await this.plugin.saveSettings();
          }),
      );
  }
}
