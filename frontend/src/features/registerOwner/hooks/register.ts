import { useState } from 'react';
import type { RegisterOwner,RegisterRestuarant, registerRequest} from '../types/register.types';

export default function useRegister(){
    const [isSubmitting , setIsSubmitting ] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const register = async (ownerInfo : RegisterOwner, restuarantInfo : RegisterRestuarant)=>{
        setError(null);
        setIsSubmitting(true);
        try{
            
        }catch(err){
            const message = err instanceof Error ? err.message : 'an unknown error occurred';
            setError(message);
            return null;
        }finally{
            setIsSubmitting(false);
        }
    }
    return {
        register,
        isSubmitting,
        error
    }
}