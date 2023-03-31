import type {Plugin} from 'plugin.types';
import type {ToolUnloader} from 'tools.types';

import {ToolDOMEventDelegate} from 'toolDOMEventDelegate';

export function maximizeActivePane(plugin: Plugin): ToolUnloader {
  const eventDelegate = new ToolDOMEventDelegate();

  eventDelegate.registerDOMEvent(document as any, 'click', () =>
    console.log('click'),
  );

  // TODO: complete the tool logic here.
  return () => {
    console.log('unload');
    eventDelegate.removeAllDOMEvents();
  };
}
