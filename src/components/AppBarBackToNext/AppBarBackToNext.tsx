import { Icon } from '../Icon';
import { Logotype } from '../Logotype';
import './AppBarBackToNext.css';

/**
 * AppBarBackToNext — the black "Back to Next" strip that can sit above the
 * global bar (Figma node 30840:38689, shown via the Header `backToNextAppBar`
 * flag). Chevron + "Back to" (Body 2) + the Next wordmark, all white.
 */
export function AppBarBackToNext() {
  return (
    <div className="fab-appbar-backtonext">
      <Icon name="chevron-left" category="ui" size={12} brand="next" />
      <span className="fab-appbar-backtonext__text">Back to</span>
      <Logotype brand="next" height={12} className="fab-appbar-backtonext__logo" />
    </div>
  );
}
