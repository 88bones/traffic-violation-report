import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signin } from "@/services/authService";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/slice";

const Login = () => {
  const [data, setData] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const dispatch = useAppDispatch();

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!data.email || !data.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await signin(data);
      dispatch(setCredentials({ user: response.User, token: response.token }));
      console.log(response);
      setError("");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md flex flex-col gap-4">
        <header className="text-2xl font-bold text-center">Login</header>

        <form action="" className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              name="email"
              value={data.email}
              onChange={(text) => handleChange("email", text.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="********"
              name="passowrd"
              value={data.password}
              onChange={(text) => handleChange("password", text.target.value)}
            />
          </Field>
        </form>

        <Button
          variant="secondary"
          className="bg-black text-white"
          onClick={handleSubmit}
        >
          Login
        </Button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
