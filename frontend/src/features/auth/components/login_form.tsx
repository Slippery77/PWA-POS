import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

{
  /*สร้างโครงสร้าง object*/
}
interface loginFormState {
  tenantCode: string;
  username: string;
  password: string;
}

export default function LoginForm() {
  const [formState, setFormState] = useState<loginFormState>({
    tenantCode: "",
    username: "",
    password: "",
  });

  const handleChange = (field: keyof loginFormState, value: string) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const { login, isSubmitted, error} = useLogin();

  const handleSubmit = async(e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(formState);
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="tenantCode">Tenant Code</label>
          <input
            type="text"
            placeholder="Tenant Code"
            value={formState.tenantCode}
            onChange={(e) => handleChange("tenantCode", e.target.value)}
          ></input>
        </div>
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
          {error && <p>{error}</p>}
          <button type="submit">Login</button>
          {isSubmitted
            ? "Login successful!"
            : "Login failed. Please try again."}
        </div>
      </form>
    </div>
  );
}
