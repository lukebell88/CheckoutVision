import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IcSearch } from './icons';

/**
 * The in-view navigation panel — a searchable jump list.
 *
 * Shared by Configurations and Components, which both had their own copy of the
 * `.ds-nav` markup. On the Minimal theme it's one component so the two can't
 * drift, styled from theme values rather than the `--w-*` tokens.
 */

export interface ViewNavGroup {
  /** Section label, e.g. "Feature flags". */
  label: string;
  items: { id: string; label: string; onClick: () => void; active?: boolean }[];
}

export function ViewNav({
  title,
  placeholder,
  query,
  onQueryChange,
  groups,
  footer,
}: {
  title: string;
  placeholder: string;
  query: string;
  onQueryChange: (v: string) => void;
  groups: ViewNavGroup[];
  footer?: ReactNode;
}) {
  const empty = groups.every((g) => g.items.length === 0);

  return (
    <Stack
      component="aside"
      sx={{
        width: 248,
        flex: 'none',
        minHeight: 0,
        bgcolor: 'background.paper',
        borderRight: (t) => `1px solid ${t.vars.palette.divider}`,
      }}
    >
      <Box sx={{ px: 2, pt: 2.5, pb: 1.5 }}>
        <Typography variant="overline" sx={{ color: 'text.disabled' }}>
          {title}
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={query}
          placeholder={placeholder}
          onChange={(e) => onQueryChange(e.target.value)}
          sx={{ mt: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IcSearch size={16} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, pb: 2 }}>
        {empty && (
          <Typography variant="body2" sx={{ color: 'text.disabled', px: 1, py: 2 }}>
            No matches
          </Typography>
        )}

        {groups.map(
          (g) =>
            g.items.length > 0 && (
              <Box key={g.label} sx={{ mb: 2 }}>
                <Typography
                  variant="overline"
                  sx={{ display: 'block', px: 1, pb: 0.5, color: 'text.disabled' }}
                >
                  {g.label}
                </Typography>
                {g.items.map((item) => (
                  <ButtonBase
                    key={item.id}
                    onClick={item.onClick}
                    sx={{
                      width: 1,
                      px: 1,
                      py: 0.75,
                      borderRadius: 1,
                      justifyContent: 'flex-start',
                      typography: 'body2',
                      color: item.active ? 'primary.main' : 'text.secondary',
                      bgcolor: item.active ? 'action.selected' : 'transparent',
                      transition: (t) => t.transitions.create(['background-color', 'color']),
                      '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                    }}
                  >
                    {item.label}
                  </ButtonBase>
                ))}
              </Box>
            ),
        )}

        {footer}
      </Box>
    </Stack>
  );
}
