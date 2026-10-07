import { useState } from "react";

interface registerOwnerInfo{
    username : string;
    email : string;
    password: string;
    confirm_password : string;
}

type Props = {
    initialValues? : Partial<registerOwnerInfo>;
    onNext?: (data: registerOwnerInfo) => void;
};

export function Register_OwnerForm({ initialValues, onNext }: Props = {}){
    const [fromState , setFromState] = useState<registerOwnerInfo>({
        username : "",
        email : "",
        password : "",
        confirm_password : "",
        ...initialValues,
    });

    const handleChange = (field: keyof registerOwnerInfo, value: string) => {
        setFromState((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async ( e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: validate ข้อมูลก่อนไปขั้นตอนถัดไป
        onNext?.(fromState);
    }
    return(
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ชื่อผู้ใช้</label>
                    <input 
                    type="text"
                    value={fromState.username}
                    onChange={(e) => handleChange("username", e.target.value)}
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