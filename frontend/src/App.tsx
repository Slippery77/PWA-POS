import LoginPage from './features/auth/pages/login_pages'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainPOS from './features/auth/pages/MainPOS'
import KDSPage from './features/auth/pages/KDSPage'
import { KDSProvider } from './features/auth/context/KDSContext'

function App() {
  return (
    <KDSProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginPage />} />
          <Route path='/mainpos' element={<MainPOS />} />
          <Route path='/kds' element={<KDSPage />} />
        </Routes>
      </BrowserRouter>
    </KDSProvider>
  )
}

export default App
