import type { ProjectDef } from '../../studio/project';
import meta from './meta';
import { CHECKOUT_SCREENS } from './screens';
import { FLOWS } from './flows';
import { FLAGS } from './flags';
import { CHOICES } from './choices';
import { VARIANT_GROUPS } from './variants';
import { CheckoutRoot } from './CheckoutRoot';

/**
 * The checkout prototype, as the studio sees it.
 *
 * This file is the entire seam: everything above it (the studio shell) works
 * from `ProjectDef` alone and never imports anything else in this folder. The
 * registry finds it by folder name and loads it lazily, so the default export
 * is the contract.
 *
 * `render` takes the runtime but ignores it — CheckoutRoot and its children read
 * the same runtime from context, since they're nested several levels deep.
 */
const checkoutProject: ProjectDef = {
  // Name and description come from meta.ts, which the gallery reads without
  // loading this file.
  ...meta,
  views: ['flows', 'pages'],
  screens: CHECKOUT_SCREENS,
  flows: FLOWS,
  flags: FLAGS,
  choices: CHOICES,
  variants: VARIANT_GROUPS,
  render: () => <CheckoutRoot />,
};

export default checkoutProject;
