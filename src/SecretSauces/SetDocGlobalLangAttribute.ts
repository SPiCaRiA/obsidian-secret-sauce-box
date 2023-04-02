import {Plugin} from 'Plugin.types';

import {EventDelegate} from 'EventDelegate';

import jstyle from 'jstyle';

const styles = jstyle({
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
  const htmlEl = activeDocument.children[0 /* the html element */];

  const getBodyFromHTML = (htmlEl: Element) => htmlEl.children[1];

  // Set doc lang attribute
  htmlEl.setAttribute('lang', plugin.getSettings('globalLangSubtag'));

  // If hyphen break enabled, apply the style.
  if (plugin.getSettings('hyphenBreakBodyEnabled')) {
    getBodyFromHTML(htmlEl).addClass(styles.hyphenBreakBody);
  }

  // Update lang attributes when global language subtag has changed.
  plugin.onSettingsChange('globalLangSubtag', newSubTag =>
    htmlEl.setAttribute('lang', newSubTag),
  );

  // Toggle hyphen line break when hyphenBreakBodyEnabled has changed.
  plugin.onSettingsChange('hyphenBreakBodyEnabled', enabled => {
    const bodyEl = getBodyFromHTML(htmlEl);

    if (enabled) {
      bodyEl.addClass(styles.hyphenBreakBody);
    } else {
      bodyEl.removeClass(styles.hyphenBreakBody);
    }
  });

  return () => {
    eventDelegate.removeAll();
    htmlEl.removeAttribute('lang');
    getBodyFromHTML(htmlEl).removeClass(styles.hyphenBreakBody);
  };
}
