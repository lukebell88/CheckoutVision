import type { Theme, SxProps } from '@mui/material/styles';
import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import { useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import { Label } from '../../studio-ui/label';
import { CustomPopover } from '../../studio-ui/custom-popover';
import { useStore } from '../../studio/store';
import { CLIENTS, clientById } from '../../config/clients';
import { logo } from '../../theme/icons';
import { IcSort } from './icons';

/**
 * Brand ("client theme") switcher — Minimal's `WorkspacesPopover`, adapted.
 *
 * Structurally identical to the starter's: logo, name, a `Label` chip and the
 * sort chevron, opening a popover list. The workspace maps onto a brand — the
 * brand's logo where the workspace avatar goes, its name where "Team 1" goes,
 * and its domain in place of the plan.
 *
 * Sits in the header's `leftArea`, the same slot Minimal uses.
 */
export function BrandSwitcher({ sx, ...other }: ButtonBaseProps) {
  const clientId = useStore((s) => s.clientId);
  const setClient = useStore((s) => s.setClient);
  const { open, anchorEl, onClose, onOpen } = usePopover();

  const active = clientById(clientId);

  const handleChange = useCallback(
    (id: string) => {
      setClient(id);
      onClose();
    },
    [setClient, onClose],
  );

  // Minimal's hover/open backdrop, which sits behind the button rather than on it.
  const buttonBg: SxProps<Theme> = {
    height: 1,
    zIndex: -1,
    opacity: 0,
    content: "''",
    borderRadius: 1,
    position: 'absolute',
    visibility: 'hidden',
    bgcolor: 'action.hover',
    width: 'calc(100% + 8px)',
    transition: (theme) =>
      theme.transitions.create(['opacity', 'visibility'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shorter,
      }),
    ...(open && { opacity: 1, visibility: 'visible' }),
  };

  return (
    <>
      <ButtonBase
        disableRipple
        onClick={onOpen}
        aria-label="Switch client theme"
        sx={[{ py: 0.5, gap: 1, '&::before': buttonBg }, ...(Array.isArray(sx) ? sx : [sx])]}
        {...other}
      >
        {/* Our brand marks are wordmarks, not square avatars like Minimal's
            workspace logos — so the mark carries the name and repeating it as
            text would just say "NEXT" twice. Falls back to the name if a brand
            has no logotype. */}
        <BrandMark client={active} height={20} maxWidth={104} />

        <Label color="default" sx={{ height: 22, cursor: 'inherit' }}>
          {active.domain}
        </Label>

        <IcSort size={16} />
      </ButtonBase>

      <CustomPopover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        slotProps={{
          arrow: { placement: 'top-left' },
          paper: { sx: { mt: 0.5, ml: -1.55, width: 260 } },
        }}
      >
        <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
          <MenuList>
            {CLIENTS.map((c) => (
              <MenuItem
                key={c.id}
                selected={c.id === clientId}
                onClick={() => handleChange(c.id)}
                sx={{ height: 48, gap: 1.5 }}
              >
                <BrandMark client={c} height={18} maxWidth={96} />
                <Typography
                  noWrap
                  component="span"
                  variant="body2"
                  sx={{ flexGrow: 1, textAlign: 'right', color: 'text.secondary' }}
                >
                  {c.name}
                </Typography>
              </MenuItem>
            ))}
          </MenuList>
        </Box>
      </CustomPopover>
    </>
  );
}

/**
 * The brand's logotype. Wordmarks vary wildly in aspect ratio, so it's boxed to
 * a fixed height with a max width and left-aligned, which keeps the marks on a
 * common baseline in the menu instead of each one setting its own size.
 */
function BrandMark({
  client,
  height,
  maxWidth,
}: {
  client: (typeof CLIENTS)[number];
  height: number;
  maxWidth: number;
}) {
  const url = logo(client.logo);

  if (!url) {
    return (
      <Typography variant="subtitle2" noWrap sx={{ maxWidth }}>
        {client.name}
      </Typography>
    );
  }

  return (
    <Box
      sx={[
        { height, maxWidth, flex: 'none', display: 'flex', alignItems: 'center' },
        // Brand wordmarks are a mix of dark and light artwork. On the dark theme
        // the dark ones (Gap, FatFace, JoJo) vanish, so they get a light tile —
        // the same trick a real brand picker uses for mixed-polarity marks.
        (theme) =>
          theme.applyStyles('dark', {
            px: 0.75,
            py: 0.25,
            height: 'auto',
            minHeight: height + 8,
            borderRadius: 0.75,
            bgcolor: 'common.white',
          }),
      ]}
    >
      <Box
        component="img"
        alt={client.name}
        src={url}
        sx={{ maxWidth: 1, maxHeight: 1, objectFit: 'contain', objectPosition: 'left center' }}
      />
    </Box>
  );
}
