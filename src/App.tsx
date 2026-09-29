import { useStore } from './store';
import { TabBar, ToastView } from './components/ui';
import Home from './screens/Home';
import Notifs from './screens/Notifs';
import Teams from './screens/Teams';
import Explore from './screens/Explore';
import Team from './screens/Team';
import Comp from './screens/Comp';
import Match from './screens/Match';
import Agenda from './screens/Agenda';
import Add from './screens/Add';

const SCREENS = { home: Home, notifs: Notifs, teams: Teams, explore: Explore, team: Team, comp: Comp, match: Match, agenda: Agenda, add: Add };

export default function App() {
  const { nav, scrollRef } = useStore();
  const Screen = SCREENS[nav.screen];
  return (
    <div className="app">
      <main ref={scrollRef} className="scroll">
        <Screen />
      </main>
      <ToastView />
      <TabBar />
    </div>
  );
}
