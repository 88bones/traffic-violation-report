import { useAppSelector } from "@/redux/hooks";

const headers = ["#", "Name", "Email", "Phone"];

const DashBoard = () => {
  const { token } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">DashBoARD</h1>
    </div>
  );
};

export default DashBoard;
