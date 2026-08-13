import { useEffect, useRef, useState } from 'react';
import { Link } from '../../../components/Link';

/**
 * The order-complete "free delivery" countdown.
 *
 * Counts down from `minutes` (starting one second in, at MM:59) to zero, and
 * renders MM:SS as an odometer. Each digit is a vertical reel that only ever
 * rolls ONE way: the strip is the digits in descending order (9→0) repeated
 * twice, so counting down always slides the reel downward — including the 0→9
 * wrap, which used to whip the reel backwards through every digit. After each
 * slide the reel snaps (no transition) from the second copy back onto the
 * identical digit in the first, so it can keep rolling forever without a jump.
 */
const CYCLE = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
const REEL = [...CYCLE, ...CYCLE]; // two copies → seamless forward loop
const CELL_PCT = 100 / REEL.length; // one digit = this % of the reel's height
const SLIDE_MS = 600; // must match .co-countdown__reel transition duration

/** The reel index that rests on `value` in the first copy (descending: 9 at 0). */
const restingPos = (value: number) => 9 - value;

function ReelDigit({ value }: { value: number }) {
  const [pos, setPos] = useState(() => restingPos(value));
  const [animate, setAnimate] = useState(true);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    // Forward distance in the descending cycle: 9→8 is 1, and the 0→9 wrap is
    // also 1, so every tick rolls the same direction by its true gap.
    const forward = (((prev.current - value) % 10) + 10) % 10;
    prev.current = value;
    setAnimate(true);
    setPos((p) => p + forward); // may land in the second copy

    // Once the slide finishes, drop back onto the identical digit in the first
    // copy with no transition — invisible, and keeps `pos` in a bounded range.
    const id = setTimeout(() => {
      setAnimate(false);
      setPos(restingPos(value));
    }, SLIDE_MS + 20);
    return () => clearTimeout(id);
  }, [value]);

  // Re-enable the transition the frame after a no-transition snap.
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  return (
    <span className="co-countdown__digit">
      <span
        className="co-countdown__reel"
        style={{ transform: `translateY(-${pos * CELL_PCT}%)`, transition: animate ? undefined : 'none' }}
      >
        {REEL.map((d, i) => (
          <span key={i} className="co-countdown__cell">{d}</span>
        ))}
      </span>
    </span>
  );
}

export function DeliveryCountdown({ minutes = 30 }: { minutes?: number }) {
  // Begin one second in, so the clock opens on MM:59 already ticking.
  const [remaining, setRemaining] = useState(minutes * 60 - 1);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const digits = [Math.floor(mins / 10), mins % 10, Math.floor(secs / 10), secs % 10];

  return (
    <div className="co-countdown">
      <div>
        <p className="co-countdown__title">Free delivery if you order within</p>
        <Link href="#">Terms &amp; conditions apply</Link>
      </div>
      <div
        className="co-countdown__clock"
        role="timer"
        aria-live="off"
        aria-label={`${mins} minutes ${secs} seconds remaining for free delivery`}
      >
        <ReelDigit value={digits[0]} />
        <ReelDigit value={digits[1]} />
        <span className="co-countdown__sep" aria-hidden>:</span>
        <ReelDigit value={digits[2]} />
        <ReelDigit value={digits[3]} />
      </div>
    </div>
  );
}
