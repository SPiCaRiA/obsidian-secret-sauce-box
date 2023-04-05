import type {WorkspaceExt, WorkspaceTabGroupExt} from 'ObExt.types';
import type {Plugin} from 'Plugin.types';

import {EventDelegate} from 'EventDelegate';

/**
 * When setting the active pane from "Stack tabs" to "Unstack tabs", the
 * active tab is preserved. However, same thing does not hold when switching
 * "Unstack tabs" to "Stack tabs": though the focus is not lost, the active
 * tab might not be the expanded one if it is not one of the leftmost few tabs.
 *
 * This secret sauce snippet preserves (expands) active tab for the latter
 * circumstance.
 */
export function preserveActiveTab(plugin: Plugin) {
  const eventDelegate = new EventDelegate();
  const getActivePane = () =>
    (plugin.app.workspace as WorkspaceExt).activeTabGroup;

  let wasActivePaneStacked: boolean;
  eventDelegate.registerObEvent(
    plugin.app.workspace,
    'active-leaf-change',
    () => {
      wasActivePaneStacked =
        getActivePane().containerEl.hasClass('mod-stacked');
    },
  );

  eventDelegate.registerObEvent(plugin.app.workspace, 'layout-change', () => {
    const activePane = getActivePane();
    const isActivePaneStacked = activePane.containerEl.hasClass('mod-stacked');
    const activeTab = plugin.app.workspace.getLeaf(false /* get active leaf */);

    if (!wasActivePaneStacked && isActivePaneStacked) {
      (activePane as WorkspaceTabGroupExt).selectTab(activeTab);
    }

    wasActivePaneStacked = isActivePaneStacked;
  });

  return () => {
    eventDelegate.removeAll();
  };
}
