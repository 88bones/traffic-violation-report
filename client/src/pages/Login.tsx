import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md flex flex-col gap-4">
        <header className="text-2xl font-bold text-center">Login</header>

        <form action="" className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" placeholder="example@example.com" />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" type="password" placeholder="********" />
          </Field>
        </form>

        <Button variant="secondary" className="bg-black text-white">
          Login
        </Button>
      </div>
    </div>
  );
};

export default Login;
