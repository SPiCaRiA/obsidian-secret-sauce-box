import type {Plugin} from 'plugin.types';
import type {ToolUnloader} from 'tools.types';

import {ToolEventDelegate} from 'src/utils/toolEventDelegate';

export function maximizeActivePane(plugin: Plugin): ToolUnloader {
  const eventDelegate = new ToolEventDelegate();

  eventDelegate.registerDOMEvent(document as any, 'click', () =>
    console.log('click'),
  );

  eventDelegate.registerObEvent(
    plugin.app.workspace,
    'active-leaf-change',
    () => console.log('active leaf changed'),
  );

  // TODO: complete the tool logic here.
  return () => {
    console.log('unload');
    eventDelegate.removeAll();
  };
}
