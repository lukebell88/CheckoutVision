import { useEffect, useRef } from 'react';
import { useStore, selectProjectState } from '../studio/store';
import { ProjectProvider, RenderedProject } from '../studio/runtime';
import { useActiveProject } from '../studio/useActiveProject';
import { useStoreRuntime } from '../studio/useRuntime';
import { isProjectId } from '../studio/registry';
import { readLiveParams, flagsFromLink } from './liveUrl';
import './live.css';

/**
 * Live mode — what a tester receives.
 *
 * Renders ONLY the prototype, full-viewport, with no studio chrome and no device
 * emulation. The real device's viewport drives the responsive layout, so a phone
 * shows the mobile experience and a laptop the desktop one — exactly like the
 * real website. The scenario is taken from the URL, overriding any local state so
 * the link reproduces identically on any device.
 *
 * Only the project named in the URL is downloaded — the rest of the studio's
 * prototypes never reach the tester's phone.
 */
export function LiveApp() {
  // A link naming a project that doesn't exist (a typo, or one since renamed)
  // must say so. Falling back to whatever was last open would quietly show the
  // tester a different prototype than the one they were sent.
  const requested = readLiveParams().project;
  const unknownProject = !!requested && !isProjectId(requested);

  // Pick the project from the URL before the gate runs, so it loads the right one.
  const applied = useRef(false);
  if (!applied.current) {
    applied.current = true;
    if (requested && !unknownProject) useStore.getState().setProject(requested);
  }

  useEffect(() => {
    document.documentElement.classList.add('live-mode');
    return () => document.documentElement.classList.remove('live-mode');
  }, []);

  const { project, failed } = useActiveProject();

  // Apply the rest of the scenario once the project (and its state) exist —
  // flow first, since it seeds flag defaults and the start screen.
  const scenarioApplied = useRef(false);
  useEffect(() => {
    if (!project || scenarioApplied.current) return;
    scenarioApplied.current = true;
    const { client, flow, screen, enabledFlags } = readLiveParams();
    const s = useStore.getState();
    if (client) s.setClient(client);
    if (flow) s.setFlow(flow);
    if (enabledFlags) s.setFlags(flagsFromLink(project, enabledFlags));
    if (screen) s.goToScreen(screen);
  }, [project]);

  if (unknownProject) {
    return <div className="live live--gate">No prototype called “{requested}”.</div>;
  }

  if (!project) {
    return <div className="live live--gate">{failed ? 'Prototype not found.' : 'Loading…'}</div>;
  }

  return (
    <ProjectProvider project={project}>
      <LiveStage />
    </ProjectProvider>
  );
}

function LiveStage() {
  const clientId = useStore((s) => s.clientId);
  const screen = useStore(selectProjectState).screen;
  const runtime = useStoreRuntime(screen, true);

  return (
    <div className="live" data-client={clientId}>
      <div className="live__web">
        <RenderedProject runtime={runtime} />
      </div>
    </div>
  );
}
