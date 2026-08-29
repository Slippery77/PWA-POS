import { useState } from 'react';
import { Register_RestaurantForm } from '../components/register_RestaurantForm'
import { Register_OwnerForm } from '../components/register_OwnerInfo'
import type { registerRequest } from '../types/register.types';

// ข้อมูลที่กรอกในทุกขั้นตอนของการสมัคร รวมถึงช่องยืนยันรหัสผ่าน
// ใช้ Partial เพราะในแต่ละขั้นตอนอาจมีข้อมูลเพียงบางส่วนเท่านั้น
type FormData = Partial<registerRequest & { confirmPassword: string }>;

export default function Register_page(){
    // เก็บข้อมูลที่กรอกไว้ระหว่างเปลี่ยนจากฟอร์มร้านไปฟอร์มเจ้าของ
    const [formData, setFormData]= useState<FormData>({});

    // ระบุขั้นตอนปัจจุบัน: 1 = ข้อมูลร้าน, 2 = ข้อมูลเจ้าของร้าน
    const [step, setStep] = useState(1);

    // รับข้อมูลจากฟอร์มร้าน เก็บรวมกับข้อมูลเดิม แล้วไปยังขั้นตอนถัดไป
    const handleRestaurantNext = async (data: Partial<registerRequest>) => {
        setFormData((prevState)=>({...prevState, ...data}));
        setStep(2);
    };

    return (
        <div>
            {/* แสดงฟอร์มตามขั้นตอนปัจจุบันของการสมัคร */}
            {step === 1 ? 
                // ขั้นตอนแรก: กรอกข้อมูลร้านและส่งข้อมูลกลับมาผ่าน onNext
                (<Register_RestaurantForm 
                    initialValues={formData}
                    onNext={handleRestaurantNext}/>) :
                // ขั้นตอนที่สอง: กรอกข้อมูลเจ้าของร้าน
                (<Register_OwnerForm/>)
            }
        </div>
    )
}