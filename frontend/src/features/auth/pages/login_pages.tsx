import  LoginForm  from "../components/login_form";

export function LoginPage(){
    return(
        
        <div className="flex h-screen flex-col items-center justify-center">
            <h1 className ="text-2xl font-bold text-[#4B3B2A]">Restuarant Name</h1>
            <div >
                <LoginForm />
            </div>
        </div>
    )
}