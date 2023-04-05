import {MAGIC_DEBOUNCE_TIMEOUT} from 'Defaults';
import {EventDelegate} from 'EventDelegate';
import {Plugin} from 'Plugin.types';

import jstyle from 'jstyle';
import {debounce} from 'obsidian';

const styles = jstyle.create({
  hyphenBreakBody: {
    '& .markdown-preview-view': {
      hyphens: 'auto !important',
    },
  },
});

/**
 * Allow setting the `lang` attribute of your document, which can be useful
 * when applying styles such as hyphen breaks.
 *
 * The `lang` attributes at a smaller granularity (i.e. content tag level) is
 * not practical unless Obsidian decides to support it in some native ways.
 */
export function setDocGlobalLangAttribute(plugin: Plugin) {
  const eventDelegate = new EventDelegate();
  const htmlEl = activeDocument.documentElement;
  const bodyEl = activeDocument.body;

  // Set doc lang attribute
  htmlEl.setAttribute('lang', plugin.getSetting('globalLangSubtag'));

  // If hyphen break enabled, apply the style.
  if (plugin.getSetting('hyphenBreakBodyEnabled')) {
    bodyEl.addClass(jstyle(styles.hyphenBreakBody));
  }

  // Update lang attributes when global language subtag has changed.
  plugin.onSettingChange(
    'globalLangSubtag',
    debounce(
      newSubTag => htmlEl.setAttribute('lang', newSubTag),
      MAGIC_DEBOUNCE_TIMEOUT,
    ),
  );

  // Toggle hyphen line break when hyphenBreakBodyEnabled has changed.
  plugin.onSettingChange('hyphenBreakBodyEnabled', enabled => {
    if (enabled) {
      bodyEl.addClass(jstyle(styles.hyphenBreakBody));
    } else {
      bodyEl.removeClass(jstyle(styles.hyphenBreakBody));
    }
  });

  return () => {
    eventDelegate.removeAll();
    htmlEl.removeAttribute('lang');
    bodyEl.removeClass(jstyle(styles.hyphenBreakBody));
  };
}
