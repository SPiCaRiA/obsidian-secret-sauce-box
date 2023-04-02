/**
 * An aphrodite-like wrapper of jss.
 */

import type {Styles, StyleSheetFactoryOptions} from 'jss';

import jss from 'jss';
import presets from 'jss-preset-default';

jss.setup(presets());

export default function jstyle<Name extends string | number | symbol>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles: Partial<Styles<Name, any, undefined>>,
  options?: StyleSheetFactoryOptions,
) {
  return jss.createStyleSheet(styles, options).attach().classes;
}
