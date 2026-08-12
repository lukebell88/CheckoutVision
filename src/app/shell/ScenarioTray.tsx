import { useEffect } from 'react';
import { useStore, selectProjectState } from '../../studio/store';
import { loadedProject } from '../../studio/registry';
import './scenario-tray.css';

/**
 * The scenario tray — a left drawer for flipping the journey and its choices
 * (payment presentation) live, without leaving the preview. Opened with ⌘J.
 *
 * Deliberately generic and dependency-light: it reads the active project's flows
 * and declared `choices` and renders them from the declaration alone, so the
 * studio never learns what a "payment presentation" is — and so it can mount in
 * the lean live bundle (no MUI) as well as the studio. It's gated to review
 * links in live (see LiveApp), keeping plain tester links locked to their URL.
 */
export function ScenarioTray() {
  const open = useStore((s) => s.trayOpen);
  const setTray = useStore((s) => s.setTray);
  const projectId = useStore((s) => s.projectId);
  const ps = useStore(selectProjectState);
  const setFlow = useStore((s) => s.setFlow);
  const setChoice = useStore((s) => s.setChoice);

  // Esc closes it, wherever it's mounted (live has no global Esc handler).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTray(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setTray]);

  const project = loadedProject(projectId);
  if (!project) return null;

  // Group the journeys by their declared `group`, preserving first-appearance
  // order. Ungrouped flows fall under a single "Journey" heading.
  const journeyOrder: string[] = [];
  const journeysByGroup = new Map<string, typeof project.flows>();
  for (const f of project.flows) {
    const key = f.group ?? '';
    if (!journeysByGroup.has(key)) {
      journeysByGroup.set(key, []);
      journeyOrder.push(key);
    }
    journeysByGroup.get(key)!.push(f);
  }

  return (
    <>
      {open && <div className="scentray__scrim" onClick={() => setTray(false)} />}
      <aside className={`scentray ${open ? 'scentray--open' : ''}`} aria-hidden={!open} aria-label="Scenario">
        <div className="scentray__head">
          <span className="scentray__title">Scenario</span>
          <button type="button" className="scentray__close" onClick={() => setTray(false)} aria-label="Close">
            ✕
          </button>
        </div>

        {journeyOrder.map((key) => (
          <section key={key || '_'} className="scentray__group">
            <h3 className="scentray__grouptitle">{key || 'Journey'}</h3>
            <div className="scentray__items">
              {journeysByGroup.get(key)!.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`scentray__item ${f.id === ps.flowId ? 'scentray__item--on' : ''}`}
                  aria-pressed={f.id === ps.flowId}
                  onClick={() => setFlow(f.id)}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </section>
        ))}

        {(project.choices ?? []).map((c) => (
          <section key={c.id} className="scentray__group">
            <h3 className="scentray__grouptitle">{c.name}</h3>
            <div className="scentray__items">
              {c.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`scentray__item ${ps.choices[c.id] === o.value ? 'scentray__item--on' : ''}`}
                  aria-pressed={ps.choices[c.id] === o.value}
                  onClick={() => setChoice(c.id, o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>
        ))}

        <p className="scentray__hint">⌘J to toggle · Esc to close</p>
      </aside>
    </>
  );
}
