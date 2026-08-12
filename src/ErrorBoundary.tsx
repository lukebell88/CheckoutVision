import { Component, type ReactNode } from 'react';

/**
 * Top-level crash guard.
 *
 * A render crash on load is almost always stale persisted state that a newer
 * build can't read — a `byProject` slice with a screen id or flow that no longer
 * exists. Left uncaught it white-screens (React unmounts the tree), which is the
 * "blank in my normal browser, fine in incognito" report: incognito has no
 * persisted state to choke on.
 *
 * So the boundary self-heals: on the first crash it clears the persisted store
 * and reloads, which rehydrates clean. A sessionStorage guard means it only does
 * this once per tab — if the crash isn't stale state, the reload won't loop; it
 * falls through to a manual reset instead.
 *
 * Kept dependency-free (no MUI, no studio imports) so it can wrap the lean live
 * bundle a tester downloads as readily as the studio.
 */
const STORE_KEY = 'studio-state';
const RECOVERY_FLAG = 'studio-recovered';

const safe = (fn: () => void) => {
  try {
    fn();
  } catch {
    /* storage can throw in locked-down privacy modes — ignore. */
  }
};

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('App crashed:', error);
    let recovered = false;
    safe(() => {
      recovered = sessionStorage.getItem(RECOVERY_FLAG) != null;
    });
    if (!recovered) {
      safe(() => sessionStorage.setItem(RECOVERY_FLAG, '1'));
      safe(() => localStorage.removeItem(STORE_KEY));
      window.location.reload();
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    // The automatic reset already ran (the crash survived a clean reload), so
    // offer a manual escape hatch rather than looping.
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
          textAlign: 'center',
          font: '400 14px/1.5 Inter, system-ui, sans-serif',
          color: '#333',
        }}
      >
        <p style={{ margin: 0 }}>Something went wrong loading this page.</p>
        <button
          type="button"
          onClick={() => {
            safe(() => localStorage.clear());
            safe(() => sessionStorage.clear());
            window.location.reload();
          }}
          style={{
            padding: '10px 20px',
            border: '1px solid #111',
            borderRadius: 4,
            background: '#111',
            color: '#fff',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          Reset &amp; reload
        </button>
      </div>
    );
  }
}
