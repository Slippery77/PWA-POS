import { AppRouter } from './routes/AppRouter';
import { KDSProvider } from './features/auth/context/KDSContext';
import './App.css';

function App() {
  return (
    <KDSProvider>
      <AppRouter />
    </KDSProvider>
  );
}

export default App;
