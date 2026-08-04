import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { CustomPopover } from '../../studio-ui/custom-popover';
import { useStore, selectProjectState } from '../../studio/store';
import { useProjectOptional } from '../../studio/runtime';
import { buildLiveUrl } from '../../live/liveUrl';
import { IcShare, IcCopy, IcCheck, IcExternal } from './icons';

/**
 * Share control: builds a live test link for the current scenario (client +
 * flow + flags) and lets the presenter copy or open it. This link is what gets
 * sent to testers to open on their own devices.
 *
 * On Minimal's `CustomPopover`, which handles the anchor, scrim and click-out —
 * so the hand-rolled mousedown listener is gone.
 */
export function ShareButton() {
  const clientId = useStore((s) => s.clientId);
  // Null in the gallery and while a project is still loading — the header
  // renders in both, and there's no scenario to share until one is open.
  const project = useProjectOptional();
  const ps = useStore(selectProjectState);

  const { open, anchorEl, onClose, onOpen } = usePopover();
  const [copied, setCopied] = useState(false);

  const url = project
    ? buildLiveUrl({ project: project.id, client: clientId, flow: ps.flowId, flags: ps.flags })
    : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the URL is still selectable in the field */
    }
  };

  if (!project) return null;

  return (
    <>
      <Button
        size="small"
        variant="contained"
        onClick={onOpen}
        startIcon={<IcShare size={16} />}
        title="Share live test link"
      >
        Share
      </Button>

      <CustomPopover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        slotProps={{ arrow: { placement: 'top-right' }, paper: { sx: { width: 300, p: 2 } } }}
      >
        <Typography variant="subtitle2">Live test link</Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
          Opens the full {project.name.toLowerCase()} prototype on the recipient&apos;s own device.
          Reflects the current client, flow and feature flags.
        </Typography>

        <Stack sx={{ alignItems: 'center', gap: 0.75, my: 2 }}>
          <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'common.white', lineHeight: 0 }}>
            <QRCodeSVG value={url} size={128} bgColor="#ffffff" fgColor="#111111" level="M" />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Scan to open on a phone
          </Typography>
        </Stack>

        <TextField
          fullWidth
          size="small"
          value={url}
          slotProps={{ input: { readOnly: true, sx: { fontSize: 12 } } }}
          onFocus={(e) => e.currentTarget.select()}
        />

        <Stack direction="row" sx={{ gap: 1, mt: 1.5 }}>
          <Button
            fullWidth
            size="small"
            variant="contained"
            onClick={copy}
            startIcon={copied ? <IcCheck size={16} /> : <IcCopy size={16} />}
          >
            {copied ? 'Copied' : 'Copy link'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            href={url}
            target="_blank"
            rel="noreferrer"
            startIcon={<IcExternal size={16} />}
          >
            Open
          </Button>
        </Stack>

        <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', mt: 1.5 }}>
          Recipients need this prototype deployed to a public URL — links to <code>localhost</code>{' '}
          only open on this machine.
        </Typography>
      </CustomPopover>
    </>
  );
}
