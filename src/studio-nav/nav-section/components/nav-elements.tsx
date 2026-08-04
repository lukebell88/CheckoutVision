import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';

import { navSectionClasses } from '../styles';

// ----------------------------------------------------------------------

export const Nav = styled('nav')``;

// ----------------------------------------------------------------------

type NavLiProps = React.ComponentProps<'li'> & {
  disabled?: boolean;
};

export const NavLi = styled(
  (props: NavLiProps) => (
    <li {...props} className={mergeClasses([navSectionClasses.li, props.className])} />
  ),
  { shouldForwardProp: (prop: string) => !['disabled', 'sx'].includes(prop) }
)(() => ({
  display: 'inline-block',
  variants: [{ props: { disabled: true }, style: { cursor: 'not-allowed' } }],
}));

// ----------------------------------------------------------------------

type NavUlProps = React.ComponentProps<'ul'>;

export const NavUl = styled((props: NavUlProps) => (
  <ul {...props} className={mergeClasses([navSectionClasses.ul, props.className])} />
))(() => ({
  display: 'flex',
  flexDirection: 'column',
  /**
   * Diverges from upstream: Minimal relies on `<CssBaseline />` to strip the UA's
   * `padding-inline-start: 40px` from lists. The studio deliberately doesn't ship
   * CssBaseline — it writes to `body` and would cascade into the checkout
   * previews — so each nested <ul> would otherwise indent the nav by 40px.
   */
  margin: 0,
  padding: 0,
  listStyle: 'none',
}));
