import './Spinner.css';

/**
 * A small indeterminate spinner.
 *
 * Fabric has no loading indicator yet, so this is a checkout-owned candidate for
 * promotion. Purely presentational: it announces itself with `role="status"` and
 * the given `label`, so an auto-firing action (the email-first check, which has
 * no button to anchor a message to) is still spoken to a screen reader.
 *
 * Theme tokens only — the track and head read the brand's text colour, so it
 * re-themes for free.
 */
export interface SpinnerProps {
  /** Diameter in px. */
  size?: number;
  /** Announced by assistive tech while the spinner is shown. */
  label?: string;
}

export function Spinner({ size = 20, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      className="co-spinner"
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
    />
  );
}
