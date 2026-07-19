import { useState } from 'react';
import type { LoginCredentials, LoginResponse } from '../types/auth.types';

export function useLogin(){
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (credentials: LoginCredentials)=>{
        setError(null);
        setIsSubmitted(true);
        try{
            const response = await fetch('/api/auth/login',{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                    },
                body: JSON.stringify(credentials),
            });
            if (!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: LoginResponse = await response.json();
            // To do : store the access token and user data
            return data;
        }catch(err){
            const message = err instanceof Error ? err.message : 'an unknown error occurred';
            setError(message);
            return null;
        }finally{
            setIsSubmitted(false);
        }
    }

    return {
        login,
        isSubmitted,
        error,
    };
}