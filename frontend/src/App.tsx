import LoginPage from './features/auth/pages/login_pages'
//import './App.css'
import { BrowserRouter, Route } from 'react-router-dom'
import MainPOS from './features/auth/pages/MainPOS'
import { Routes } from 'react-router-dom'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginPage />} />
          <Route path='/mainpos' element={<MainPOS />} />
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
