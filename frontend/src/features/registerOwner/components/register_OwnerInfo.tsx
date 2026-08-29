import { useState } from "react";

interface registerOwnerInfo{
    username : string;
    email : string;
    password: string;
    confirm_password : string;
}

type Props = {
    initialValues? : Partial<registerOwnerInfo>;
    onNext: (data: registerOwnerInfo) => void;
};

export function Register_OwnerForm(){
    const [fromState , setFromState] = useState<registerOwnerInfo>({
        username : "",
        email : "",
        password : "",
        confirm_password : "",
    });

    const handleSubmit = async ( e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newErrors = {
            // username:
        }
    }
    return(
        <div>
            <form>
                <div>
                    <label>ชื่อผู้ใช้</label>
                    <input 
                    type="text"
                    value={fromState.username}
                    className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label>อีเมลล์</label>
                </div>
                <div>
                    <label>รหัสผ่าน</label>
                </div>
                <div>
                    <label>ยีนยันรหัสผ่าน</label>
                </div>
            </form>
        </div>
    )
}