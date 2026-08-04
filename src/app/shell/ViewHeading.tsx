import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * In-content view heading.
 *
 * The starter keeps page titles in the content (`Typography variant="h4"` at the
 * top of the view) rather than in the header, which carries global chrome only.
 *
 * Lives in its own module rather than beside the header: every view needs it, and
 * importing it from `StudioHeader` would have each view pulling in the header —
 * and the header pulls in the canvas toolbar, which is a cycle waiting to happen.
 */
export function ViewHeading({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4">{title}</Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
