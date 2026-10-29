import { useGame } from './state/game';
import { useGameAudio } from './audio/useGameAudio';
import { AudioControls } from './audio/AudioControls';
import { TitleScreen } from './screens/TitleScreen';
import { MapScreen } from './screens/MapScreen';
import { DialogScreen } from './screens/DialogScreen';
import { LessonScreen } from './screens/LessonScreen';
import { BattleScreen } from './screens/BattleScreen';
import { VictoryScreen } from './screens/VictoryScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export function App() {
  const { screen, stage } = useGame();
  useGameAudio(screen.name, stage.id);
  return (
    <>
      <CurrentScreen />
      <AudioControls />
    </>
  );
}

function CurrentScreen() {
  const { screen } = useGame();
  switch (screen.name) {
    case 'title':
      return <TitleScreen />;
    case 'map':
      return <MapScreen />;
    case 'dialog':
      return <DialogScreen levelId={screen.levelId} />;
    case 'lesson':
      return <LessonScreen levelId={screen.levelId} />;
    case 'battle':
      return <BattleScreen levelId={screen.levelId} />;
    case 'victory':
      return <VictoryScreen levelId={screen.levelId} info={screen.info} />;
    case 'profile':
      return <ProfileScreen />;
  }
}
