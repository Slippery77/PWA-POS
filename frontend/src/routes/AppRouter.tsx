import {Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/login_pages';
import { Register_RestaurantForm } from '../features/registerOwner/components/register_RestaurantForm';

export function AppRouter() {
    return (
        <Routes>
            <Route path='/:tenantSlug/login' element={<LoginPage/>}/>
            <Route path='/register' element={<Register_RestaurantForm/>}/>
            <Route path='/:tenantSlug/homepage' element={<div>Dashboard (TODO)</div>}/>
        </Routes>
    )
}

