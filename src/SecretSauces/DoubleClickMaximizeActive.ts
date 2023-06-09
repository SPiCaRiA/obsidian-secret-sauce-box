import type {DOMListener} from 'Events.types';
import type {
  MarkedHTMLElement,
  WorkspaceExt,
  WorkspaceLeafExt,
} from 'ObExt.types';
import type {Plugin} from 'Plugin.types';

import {MAGIC_DEBOUNCE_TIMEOUT} from 'Defaults';
import {EventDelegate} from 'EventDelegate';

import jstyle from 'jstyle';
import {debounce} from 'obsidian';

type FlaggedHTMLElement = MarkedHTMLElement<boolean>;

const styles = jstyle.create(
  {
    maximizeActiveTab: {
      width: '100% !important',
    },

    hideNonActiveTab: {
      minWidth: '0px !important',
      maxWidth: '0px !important',
    },

    shrinkPaneOrSplit: ({minSize}) => ({
      '.mod-vertical > &': {
        maxWidth: minSize,
      },

      '.mod-horizontal > &': {
        maxHeight: minSize,
      },
    }),
  },
  {link: true},
);

const shrinkClass = jstyle(styles.shrinkPaneOrSplit);

function registerDoubleClickEventOnTabHeaders(
  eventDelegate: EventDelegate,
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
    tabEl.removeClass(
      jstyle(styles.hideNonActiveTab),
      jstyle(styles.maximizeActiveTab),
    );

    if (paneEl[enabledFlag]) {
      if (tabEl.hasClass('mod-active')) {
        tabEl.addClass(jstyle(styles.maximizeActiveTab));
      } else {
        tabEl.addClass(jstyle(styles.hideNonActiveTab));
      }
    }
  });
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
    currentSplit.children.forEach(paneOrSplit => {
      const paneOrSplitEl = paneOrSplit.containerEl;

      if (!maxPaneOrSplits.has(paneOrSplit)) {
        // Shrink paneOrSplit by applying the shrink style.
        paneOrSplitEl.addClass(shrinkClass);
      } else {
        // Maximize paneOrSplit by removing the shrink style applied before.
        paneOrSplitEl.removeClass(shrinkClass);
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
  split.children.forEach(paneOrSplit => {
    const paneOrSplitEl = paneOrSplit.containerEl;

    paneOrSplitEl.removeClass(shrinkClass);

    if (paneOrSplitEl.hasClass('workspace-split')) {
      disableMaximizeActivePane(paneOrSplit);
    }
  });
}

export function doubleClickMaximizeActive(plugin: Plugin) {
  // By default, maximizing behaviors are off.
  // Pane maximizing flag is gobal, but tab maximizing flag is local to each
  // pane.
  let maxActivePaneEnabled = false;
  const maxActiveTabEnabledFlag = Symbol('pane-max-tab-enabled-flag');

  const getActivePane = () =>
    (plugin.app.workspace as WorkspaceExt).activeTabGroup;
  const rootSplit = getActivePane().getRoot() as WorkspaceLeafExt;

  // Apply initial styles from setting values.
  jstyle(styles.shrinkPaneOrSplit, {
    minSize: plugin.getSetting('doubleClickMaximizeActivePaneShrinkMin'),
  });

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

  const eventDelegate = new EventDelegate();
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

    // Disable pane maximizing behavior when all non-root splits are closed.
    if (
      maxActivePaneEnabled &&
      rootSplit.children.length === 1 &&
      /*
       * When splitting down the root container, a new horizontal split is
       * created to contain the panes because the root container is a vertical
       * split.
       */
      !rootSplit.children[0].containerEl.hasClass('workspace-split')
    ) {
      maxActivePaneEnabled = false;
      disableMaximizeActivePane(rootSplit);
    }
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

  // Update min width/height for squeezed panes when
  // doubleClickMaximizeActivePaneShrinkMin is changed.
  plugin.onSettingChange(
    'doubleClickMaximizeActivePaneShrinkMin',
    debounce(newVal => {
      // Update new shrink size to the style.
      jstyle(styles.shrinkPaneOrSplit, {
        minSize: newVal,
      });
    }, MAGIC_DEBOUNCE_TIMEOUT),
  );

  return () => {
    eventDelegate.removeAll();

    // Clean-up tab maximizing styles.
    toggleMaximizeActiveTab(
      getActivePane().containerEl as FlaggedHTMLElement,
      maxActiveTabEnabledFlag,
      false,
    );

    // Clean-up pane maximizing styles.
    disableMaximizeActivePane(rootSplit);
  };
}
