import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { useStore } from '../../studio/store';
import { IcClose } from './icons';

/**
 * Keyboard-shortcuts reference (opened from the header or `?`).
 *
 * MUI `Dialog` handles the scrim, focus trap and Escape, so the hand-rolled
 * keydown listener and click-out are gone.
 */
const GROUPS: { title: string; items: { keys: string[]; label: string }[] }[] = [
  {
    title: 'Navigation',
    items: [
      { keys: ['⌘', 'K'], label: 'Command palette' },
      { keys: ['⌘', '\\'], label: 'Toggle side panel' },
      { keys: ['['], label: 'Previous client' },
      { keys: [']'], label: 'Next client' },
      { keys: ['{'], label: 'Previous flow' },
      { keys: ['}'], label: 'Next flow' },
    ],
  },
  {
    title: 'Device',
    items: [
      { keys: ['1'], label: 'Desktop' },
      { keys: ['2'], label: 'Tablet' },
      { keys: ['3'], label: 'Mobile' },
    ],
  },
  {
    title: 'Preview & present',
    items: [
      { keys: ['←', '→'], label: 'Prev / next screen (in preview)' },
      { keys: ['Esc'], label: 'Close preview / exit present mode' },
      { keys: ['?'], label: 'This shortcuts panel' },
    ],
  },
];

export function ShortcutsHelp() {
  const open = useStore((s) => s.shortcutsOpen);
  const setShortcuts = useStore((s) => s.setShortcuts);

  return (
    <Dialog open={open} onClose={() => setShortcuts(false)} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}
      >
        Keyboard shortcuts
        <IconButton size="small" onClick={() => setShortcuts(false)} aria-label="Close">
          <IcClose />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        {GROUPS.map((g, i) => (
          <Box key={g.title} sx={{ mb: i === GROUPS.length - 1 ? 0 : 2.5 }}>
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>
              {g.title}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {g.items.map((it) => (
              <Stack
                key={it.label}
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', py: 0.6 }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {it.label}
                </Typography>
                <Stack direction="row" sx={{ gap: 0.5 }}>
                  {it.keys.map((k, n) => (
                    <Kbd key={n}>{k}</Kbd>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="kbd"
      sx={{
        minWidth: 24,
        px: 0.75,
        py: 0.25,
        fontSize: 12,
        lineHeight: 1.5,
        fontFamily: 'inherit',
        textAlign: 'center',
        borderRadius: 0.75,
        color: 'text.primary',
        bgcolor: 'background.neutral',
        border: (t) => `1px solid ${t.vars.palette.divider}`,
      }}
    >
      {children}
    </Box>
  );
}
