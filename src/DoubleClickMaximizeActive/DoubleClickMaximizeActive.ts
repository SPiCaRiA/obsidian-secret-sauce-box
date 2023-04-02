import type {DOMListener} from 'events.type';
import type {MarkedHTMLElement, WorkspaceLeafExt} from 'ObExt.types';
import type {Plugin} from 'plugin.types';
import type {ToolUnloader} from 'tools.types';

import jstyle from 'jstyle';
import {ToolEventDelegate} from 'toolEventDelegate';

type FlaggedHTMLElement = MarkedHTMLElement<boolean>;

const styles = jstyle({
  maximizeActiveTab: {
    width: '100% !important',
  },

  hideNonActiveTab: {
    minWidth: '0px !important',
    maxWidth: '0px !important',
  },

  // Post-shrink values are the same as that in VSCode.
  shrinkPaneOrSplitVetical: {
    maxWidth: 'calc(13.75 * 1rem)',
  },

  shrinkPaneOrSplitHorizontal: {
    maxHeight: 'calc(13.75 * 1rem)',
  },
});

function registerDoubleClickEventOnTabHeaders(
  eventDelegate: ToolEventDelegate,
  labelRegistered: symbol,
  domListener: DOMListener<'dblclick'>,
) {
  const tabHeaderEls = document.querySelectorAll(
    'div.workspace-split.mod-root div.workspace-tab-header',
  );

  // Register event listener to new tab headers.
  tabHeaderEls.forEach(el => {
    if (!(labelRegistered in el)) {
      eventDelegate.registerDOMEvent(
        el as HTMLElement,
        'dblclick',
        domListener,
      );

      (el as FlaggedHTMLElement)[labelRegistered] = true;
    }
  });
}

function toggleMaximizeActiveTab(
  paneEl: FlaggedHTMLElement,
  enabledFlag: symbol,
  forceEnable?: boolean,
) {
  if (!(enabledFlag in paneEl)) {
    paneEl[enabledFlag] = forceEnable ?? true;
  } else {
    paneEl[enabledFlag] = forceEnable ?? !paneEl[enabledFlag];
  }

  paneEl.querySelectorAll('div.workspace-leaf').forEach(tabEl => {
    // Remove previous styles if exist.
    tabEl.removeClass(styles.hideNonActiveTab, styles.maximizeActiveTab);

    if (paneEl[enabledFlag]) {
      if (tabEl.hasClass('mod-active')) {
        tabEl.addClass(styles.maximizeActiveTab);
      } else {
        tabEl.addClass(styles.hideNonActiveTab);
      }
    }
  });
}

function getSplitContainerShrinkClass(split: WorkspaceLeafExt) {
  return split.containerEl.hasClass('mod-vertical')
    ? styles.shrinkPaneOrSplitVetical
    : styles.shrinkPaneOrSplitHorizontal;
}

/**
 * Starting from the active pane, traverse all the panes and parent split
 * containers util root split container is reached. Shrink the non-active panes
 * and the split containers that are not on the route from the root split to the
 * active pane in the split tree.
 *
 * Definition of the split tree:
 * Node -> div.workspace-tabs (i.e. a pane)
 *       | div.workspace-split (a parent of panes (and other splits))
 *
 * e.g. Consider the split tree below:
 *      1. If a pane or split will be shrinked, it's labelled with S, otherwise
 *         it's N or A.
 *      2. The active pane is labelled with A.
 *      3. If a split is on the route from the root split to the active pane, it
 *         is labelled with A.
 *
 *                     Root
 *                   /      \
 *                 S         A
 *               / | \     / | \
 *              N  N N    S  A  S
 *             /         /  / \  \
 *            N         N  S  A  N
 *
 * TL;DR: only the siblings of the A nodes are shrinked.
 *
 * @param {WorkspaceLeafExt} rootSplit the root split container
 * @param {WorkspaceLeafExt} activePane the active pane container
 */
function enableMaximizeActivePane(
  rootSplit: WorkspaceLeafExt,
  activePane: WorkspaceLeafExt,
) {
  // Panes and splits to be maximized (i.e. the active pane + splits on the
  // route from the split root to the active pane in the split tree).
  const maxPaneOrSplits = new Set<WorkspaceLeafExt>([
    activePane,
    activePane.parent,
  ]);

  const recurseEnableMaximizeActivePane = (currentSplit: WorkspaceLeafExt) => {
    const shrinkClass = getSplitContainerShrinkClass(currentSplit);

    currentSplit.children.forEach(paneOrSplit => {
      if (!maxPaneOrSplits.has(paneOrSplit)) {
        // Shrink paneOrSplit.
        const paneOrSplitEl = paneOrSplit.containerEl;

        // Apply if not shrinked.
        if (!paneOrSplitEl.hasClass(shrinkClass)) {
          paneOrSplitEl.addClass(shrinkClass);
        }
      } else {
        // Maximize paneOrSplit.
        // Remove the shrink style added before.
        paneOrSplit.containerEl.removeClass(shrinkClass);
      }
    });

    if (currentSplit !== rootSplit) {
      maxPaneOrSplits.add(currentSplit.parent);
      // Haven't reached root split container, continue.
      recurseEnableMaximizeActivePane(currentSplit.parent);
    }
  };

  recurseEnableMaximizeActivePane(activePane.parent);
}

/**
 * Remove shrink class from all panes and splits in the split tree with DFS.
 *
 * @param {WorkspaceLeafExt} split the root split container
 */
function disableMaximizeActivePane(split: WorkspaceLeafExt) {
  const shrinkClass = getSplitContainerShrinkClass(split);

  split.children.forEach(paneOrSplit => {
    const paneOrSplitEl = paneOrSplit.containerEl;

    if (paneOrSplitEl.hasClass(shrinkClass)) {
      paneOrSplitEl.removeClass(shrinkClass);
    }

    if (paneOrSplitEl.hasClass('workspace-split')) {
      disableMaximizeActivePane(paneOrSplit);
    }
  });
}

export function doubleClickMaximizeActive(plugin: Plugin): ToolUnloader {
  // By default, maximizing behaviors are off.
  // Pane maximizing flag is gobal, but tab maximizing flag is local to each
  // pane.
  let maxActivePaneEnabled = false;
  const maxActiveTabEnabledFlag = Symbol('pane-max-tab-enabled-flag');

  const getActivePane = () =>
    (
      plugin.app.workspace.getLeaf(
        false /* get active leaf */,
      ) as WorkspaceLeafExt
    ).parent;
  const rootSplit = getActivePane().getRoot() as WorkspaceLeafExt;

  // --- Tab Header Double Click Event ---
  const tabHeaderDoubleClickListener = (e: MouseEvent) => {
    // paneContainer > paneContentContainer/paneHeaderContainer > tabHeader
    const paneEl = (e.currentTarget as HTMLElement).parentElement
      ?.parentElement;

    if (!paneEl || paneEl == null) {
      throw new Error(
        'Cannot find pane container for double clicked tab header.',
      );
    }

    if (paneEl.hasClass('mod-stacked')) {
      // Stack tabs on.
      toggleMaximizeActiveTab(
        // Active pane container el.
        getActivePane().containerEl as FlaggedHTMLElement,
        maxActiveTabEnabledFlag,
      );
    } else {
      // Stack tabs off.
      maxActivePaneEnabled = !maxActivePaneEnabled;
      if (maxActivePaneEnabled) {
        enableMaximizeActivePane(rootSplit, getActivePane());
      } else {
        disableMaximizeActivePane(rootSplit);
      }
    }

    // Prevent propagation to parent elements.
    // i.e. Disable default window maximizing/minimizing behavior when clicking
    //      the tab headers.
    e.stopPropagation();
  };

  const eventDelegate = new ToolEventDelegate();
  const labelRegistered = Symbol('dblclick-registered');
  // Register event on initially-opened tab headers.
  registerDoubleClickEventOnTabHeaders(
    eventDelegate,
    labelRegistered,
    tabHeaderDoubleClickListener,
  );
  eventDelegate.registerObEvent(plugin.app.workspace, 'layout-change', () => {
    // Register event on later-opened tab headers whenever the layout changes.
    registerDoubleClickEventOnTabHeaders(
      eventDelegate,
      labelRegistered,
      tabHeaderDoubleClickListener,
    );

    // Remove tab maximizing styles when the pane is toggled to "Unstack Tabs".
    document
      .querySelectorAll('div.workspace-split div.workspace-tabs')
      .forEach(pane => {
        const paneEl = pane as FlaggedHTMLElement;
        if (
          maxActiveTabEnabledFlag in paneEl &&
          !paneEl.hasClass('mod-stacked')
        ) {
          toggleMaximizeActiveTab(paneEl, maxActiveTabEnabledFlag, false);
          delete paneEl[maxActiveTabEnabledFlag];
        }
      });
  });

  // --- Switch Max Pane When Active Leaf Changes ---
  let initActiveLeafChange = true;
  eventDelegate.registerObEvent(
    plugin.app.workspace,
    'active-leaf-change',
    () => {
      if (initActiveLeafChange) {
        // If this is the initial load of Obsidian, do nothing.
        initActiveLeafChange = false;
        return;
      }

      const activePane = getActivePane();

      // Update maximized pane.
      // This update will not affect previously maximized panes that does not
      // need to be shrinked and make space for the current splits and pane to
      // be maximized.
      if (maxActivePaneEnabled) {
        enableMaximizeActivePane(rootSplit, activePane);
      }

      const activePaneEl = activePane.containerEl as FlaggedHTMLElement;
      if (
        maxActiveTabEnabledFlag in activePaneEl &&
        activePaneEl[maxActiveTabEnabledFlag]
      ) {
        toggleMaximizeActiveTab(activePaneEl, maxActiveTabEnabledFlag, true);
      }
    },
  );

  return () => {
    eventDelegate.removeAll();

    // Clean-up tab maximizing styles.
    // TODO after using the new implementation.
    toggleMaximizeActiveTab(
      getActivePane().containerEl as FlaggedHTMLElement,
      maxActiveTabEnabledFlag,
      false,
    );

    // Clean-up pane maximizing styles.
    disableMaximizeActivePane(rootSplit);
  };
}
