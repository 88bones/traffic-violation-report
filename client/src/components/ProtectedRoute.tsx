import { useAppSelector } from "@/redux/hooks";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user } = useAppSelector((state) => state.auth);

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/login" replace />;

  return <>{children}</>;
}
