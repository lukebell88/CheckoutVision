import { Fragment } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { useStore } from '../../studio/store';
import { CLIENTS } from '../../config/clients';
import type { HeaderFieldDef } from '../../config/headerConfig';

/**
 * A component's per-client configuration board: config fields down the left, one
 * column per client — the same shape as the Figma `_Config/*` variables table.
 * Edits write straight to that client's config; the first column stays pinned.
 *
 * This lives with the Components view, not Configurations, because it describes
 * a *component* across every brand — not the active prototype's settings.
 *
 * One store slice backs it today (`headerConfigByClient`). A second configurable
 * component needs its own slice; give `ConfigBoardSpec` a `read`/`write` pair at
 * that point rather than widening this one.
 */
export interface ConfigBoardSpec {
  /** Rows, filtered and ordered by `groupOrder`. */
  fields: HeaderFieldDef[];
  groupOrder: readonly string[];
  /** Rows to leave out — e.g. the free-text nav labels, which don't tabulate. */
  include?: (f: HeaderFieldDef) => boolean;
}

/** Group a board's fields for rendering, dropping empty groups. */
export function boardGroups(spec: ConfigBoardSpec, query = '') {
  const q = query.toLowerCase().trim();
  const keep = spec.include ?? (() => true);
  return spec.groupOrder
    .map((group) => ({
      group,
      items: spec.fields.filter(
        (f) => f.group === group && keep(f) && (!q || f.name.toLowerCase().includes(q)),
      ),
    }))
    .filter((g) => g.items.length);
}

export function ConfigBoard({ groups }: { groups: ReturnType<typeof boardGroups> }) {
  const cfg = useStore((s) => s.headerConfigByClient);
  const setFor = useStore((s) => s.setHeaderConfigFor);

  const stickyCol = {
    position: 'sticky' as const,
    left: 0,
    zIndex: 2,
    bgcolor: 'background.paper',
  };

  return (
    <Card>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 260px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...stickyCol, zIndex: 3, minWidth: 220 }}>Configuration</TableCell>
              {CLIENTS.map((c) => (
                <TableCell key={c.id} align="center" sx={{ whiteSpace: 'nowrap' }}>
                  {c.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((g) => (
              <Fragment key={g.group}>
                <TableRow id={`cfghdr-${g.group}`}>
                  <TableCell
                    colSpan={CLIENTS.length + 1}
                    sx={{ bgcolor: 'background.neutral', py: 0.75 }}
                  >
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                      {g.group}
                    </Typography>
                  </TableCell>
                </TableRow>
                {g.items.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell sx={{ ...stickyCol }} title={f.figmaVar}>
                      <Typography variant="body2" noWrap>
                        {f.name}
                      </Typography>
                    </TableCell>
                    {CLIENTS.map((c) => {
                      const hc = cfg[c.id] ?? {};
                      const gateOk = f.gatedBy ? !!hc[f.gatedBy] : true;
                      return (
                        <TableCell key={c.id} align="center">
                          <Cell
                            f={f}
                            value={hc[f.id]}
                            gateOk={gateOk}
                            onChange={(v) => setFor(c.id, f.id, v)}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

/** One matrix cell control, by field type. */
function Cell({
  f,
  value,
  gateOk,
  onChange,
}: {
  f: HeaderFieldDef;
  value: boolean | string | number | undefined;
  gateOk: boolean;
  onChange: (v: boolean | string | number) => void;
}) {
  if (f.type === 'bool') {
    return <Switch size="small" checked={!!value} onChange={(e) => onChange(e.target.checked)} />;
  }

  if (f.type === 'select') {
    return (
      <Select
        size="small"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        sx={{ width: 128 }}
      >
        {f.options!.map((o) => (
          <MenuItem key={o} value={o}>
            {o}
          </MenuItem>
        ))}
      </Select>
    );
  }

  return (
    <TextField
      size="small"
      type={f.type === 'number' ? 'number' : 'text'}
      value={f.type === 'number' ? Number(value ?? 0) : String(value ?? '')}
      disabled={!gateOk}
      onChange={(e) => onChange(f.type === 'number' ? Number(e.target.value) : e.target.value)}
      sx={{ width: 120 }}
    />
  );
}
