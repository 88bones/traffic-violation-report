import TableLayout from "@/components/layouts/TableLayout";
import { TableCell, TableRow } from "@/components/ui/table";
import { useAppSelector } from "@/redux/hooks";
import { getUsers } from "@/services/authService";
import type { User } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const headers = ["#", "Name", "Email", "Phone"];

const Users = () => {
  const { token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-gray-500">Manage your users here</p>
      <TableLayout
        headers={headers}
        data={users}
        renderRow={(user: User, index: number) => (
          <TableRow key={user._id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.phone}</TableCell>
          </TableRow>
        )}
      />
    </div>
  );
};

export default Users;
