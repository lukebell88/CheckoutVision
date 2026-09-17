import { useEffect, useRef, useState } from 'react';

/** Pay now holds a spinner for this long before the order completes. */
const PAY_MS = 1500;

/**
 * Mimics the order being placed: tapping Pay now spins the button, then calls
 * `onPay` (the jump to Order Complete). Repeat taps while it spins are ignored.
 * Returns an undefined handler when there's nothing to call, so non-interactive
 * previews stay inert.
 */
export function usePayNow(onPay?: () => void) {
  const [paying, setPaying] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const payNow = onPay
    ? () => {
        if (paying) return;
        setPaying(true);
        timer.current = window.setTimeout(onPay, PAY_MS);
      }
    : undefined;

  return { paying, payNow };
}
