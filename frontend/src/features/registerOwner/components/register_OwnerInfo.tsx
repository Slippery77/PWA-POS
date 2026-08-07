import { useState } from "react";
import useRegister from "../hooks/register";

interface registerOwnerInfo{
    username : string;
    email : string;
    password: string;
    confirm_password : string;
}

export function registerOwner(){
    const [fromState , setFromState] = useState<registerOwnerInfo>({
        username : "",
        email : "",
        password : "",
        confirm_password : "",
    });

    const handdleSubmit = async ( e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        await registerOwner()
    }

    return(
        <div>

        </div>
    ) 
}