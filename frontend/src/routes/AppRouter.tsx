import {Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/login_pages';
import Register_page from '../features/registerOwner/pages/register_pages';
import MainPOS from '../features/auth/pages/MainPOS';
import KDSPage from '../features/auth/pages/KDSPage';

export function AppRouter() {
    return (
        <Routes>
            <Route path='/:tenantSlug/login' element={<LoginPage/>}/>
            <Route path='/register' element={<Register_page/>}/>
            <Route path='/:tenantSlug/homepage' element={<div>Dashboard (TODO)</div>}/>
            <Route path='/mainpos' element={<MainPOS/>}/>
            <Route path='/kds' element={<KDSPage/>}/>
        </Routes>
    )
}
