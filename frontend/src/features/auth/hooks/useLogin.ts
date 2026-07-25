import { useState } from 'react';
import type { LoginCredentials, LoginResponse } from '../types/auth.types';

export function useLogin(){
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (credentials: LoginCredentials)=>{
        setError(null);
        setIsSubmitting(true);
        try{
            const response = await fetch('http://localhost:3000/api/auth/login',{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                    },
                body: JSON.stringify(credentials),
            });
            if (!response.ok){
                console.log(response.status);
                throw new Error(`Invalid username , password or restuarant code`);
            }
            const data: LoginResponse = await response.json();
            // To do : store the access token and user data
            return data;
        }catch(err){
            const message = err instanceof Error ? err.message : 'an unknown error occurred';
            setError(message);
            return null;
        }finally{
            setIsSubmitting(false);
        }
    }

    return {
        login,
        isSubmitting,
        error,
    };
}