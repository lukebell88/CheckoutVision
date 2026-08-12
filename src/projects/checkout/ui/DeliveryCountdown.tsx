import { useEffect, useState } from 'react';
import { Link } from '../../../components/Link';

/**
 * The order-complete "free delivery" countdown.
 *
 * Counts down from `minutes` (default 30) to zero, one second at a time, and
 * renders MM:SS as an odometer: each digit is a vertical reel of 0–9 that slides
 * to the current value, so a tick rolls smoothly rather than snapping. The
 * reel's transform transition does the animation; prefers-reduced-motion turns
 * it into an instant jump.
 */
function ReelDigit({ value }: { value: number }) {
  return (
    <span className="co-countdown__digit">
      <span className="co-countdown__reel" style={{ transform: `translateY(-${value * 10}%)` }}>
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className="co-countdown__cell">{d}</span>
        ))}
      </span>
    </span>
  );
}

export function DeliveryCountdown({ minutes = 30 }: { minutes?: number }) {
  const [remaining, setRemaining] = useState(minutes * 60);

  // One interval for the component's life: decrement each second, and clear
  // itself the moment it reaches zero so it doesn't tick past 00:00.
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
