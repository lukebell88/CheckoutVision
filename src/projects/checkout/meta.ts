import type { ProjectMeta } from '../../studio/project';

/**
 * Card metadata for the project gallery.
 *
 * Deliberately separate from `project.tsx` and kept tiny: the registry loads
 * every project's meta eagerly so the gallery can list them, while the
 * definitions themselves stay lazy. Anything expensive belongs in project.tsx.
 */
const meta: ProjectMeta = {
  id: 'checkout',
  name: 'Checkout',
  description: 'Multi-brand checkout journeys — guest, registered, cash and credit.',
};

export default meta;
