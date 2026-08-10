import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Reveal — grows its content in (and collapses it out) so a newly-shown stage
 * pushes in below rather than popping.
 *
 * The height animates with the `grid-template-rows: 0fr → 1fr` technique (no JS
 * measuring), and the contents fade + drift up. It's driven by `visible`:
 *
 *   - mounted already visible → shown at rest, no entrance (e.g. the express
 *     block on first paint, or the sections on a normal checkout load);
 *   - hidden → visible → grows + fades in;
 *   - visible → hidden → collapses, then unmounts.
 *
 * Once fully open the clip is released (`--done`), so nested popovers — the
 * address finder, the store drawer — aren't cropped by the reveal's overflow.
 * Honours `prefers-reduced-motion` (the transitions are disabled in CSS).
 *
 * Render it UNCONDITIONALLY with a `visible` prop (not behind `&&`) so it can
 * animate the entrance; behind `&&` it would mount already-open and just appear.
 */
export function Reveal({
  visible = true,
  duration = 350,
  children,
}: {
  visible?: boolean;
  duration?: number;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(visible);
  const [open, setOpen] = useState(visible);
  const [done, setDone] = useState(visible);
  const unmountTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (unmountTimer.current) window.clearTimeout(unmountTimer.current);
    if (visible) {
      setMounted(true);
      // Two frames: the first paints the collapsed (0fr) state, the second
      // flips to open so the browser has a start value to transition FROM —
      // a single rAF applies both in one frame and the reveal just pops.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setOpen(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }
    setOpen(false);
    unmountTimer.current = window.setTimeout(() => setMounted(false), duration);
    return () => {
      if (unmountTimer.current) window.clearTimeout(unmountTimer.current);
    };
  }, [visible, duration]);

  // Release the clip once the entrance has finished so popovers can overflow.
  useEffect(() => {
    if (!open) {
      setDone(false);
      return;
    }
    const t = window.setTimeout(() => setDone(true), duration);
    return () => window.clearTimeout(t);
  }, [open, duration]);

  if (!mounted) return null;

  const cls = ['co-reveal', open && 'co-reveal--open', done && 'co-reveal--done']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} style={{ '--co-reveal-ms': `${duration}ms` } as CSSProperties}>
      <div className="co-reveal__clip">
        <div className="co-reveal__inner">{children}</div>
      </div>
    </div>
  );
}
