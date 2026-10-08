import { AppRouter }from './routes/AppRouter.tsx';
import './App.css'
import { KDSProvider } from './features/auth/context/KDSContext'


function App() {
  return (
    <>
      <KDSProvider>
        <AppRouter />
      </KDSProvider>
    </>
  )
}

export default App
