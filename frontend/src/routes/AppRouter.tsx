import {Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/login_pages';
import Register_page from '../features/registerOwner/pages/register_pages';

export function AppRouter() {
    return (
        <Routes>
            <Route path='/:tenantSlug/login' element={<LoginPage/>}/>
            <Route path='/register' element={<Register_page/>}/>
            <Route path='/:tenantSlug/homepage' element={<div>Dashboard (TODO)</div>}/>
        </Routes>
    )
}

