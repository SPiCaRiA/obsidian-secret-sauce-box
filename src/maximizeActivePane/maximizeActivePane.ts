import type {Plugin} from 'plugin.types';
import type {ToolUnloader} from 'tools.types';

export function maximizeActivePane(plugin: Plugin): ToolUnloader {
  // TODO: complete the tool logic here.
  console.log('load maximizeActivePane');
  return () => console.log('unload maximize active pane');
}
