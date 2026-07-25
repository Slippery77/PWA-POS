import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

{
  /*สร้างโครงสร้าง object*/
}
interface loginFormState {
  tenantID: string;
  username: string;
  password: string;
}

export default function LoginForm() {
  // เก็บค่าฟอร์ม login ทั้ง 3 ช่องแบบ object เพื่อจัดการข้อมูลรวมกันง่าย
  const [formState, setFormState] = useState<loginFormState>({
    tenantID: "",
    username: "",
    password: "",
  });

  // อัปเดตค่าในฟอร์มตาม field ที่ผู้ใช้พิมพ์เข้าไป
  const handleChange = (field: keyof loginFormState, value: string) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // ดึงฟังก์ชัน login และสถานะจาก custom hook เพื่อใช้ในการส่งข้อมูลเข้าสู่ระบบ
  const { login, isSubmitting, error } = useLogin();

  // เมื่อกด submit จะป้องกันการ refresh หน้า และเรียก login ด้วยข้อมูลจากฟอร์ม
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(formState);
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            placeholder="Username"
            value={formState.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={formState.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </div>
        <div>
          {error ?(<p role='alert'>{error}</p>) : null}
          <button type="submit" disabled={isSubmitting}>Login</button>
        </div>
      </form>
    </div>
  );
}
