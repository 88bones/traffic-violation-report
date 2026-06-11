import { useAppSelector } from "@/redux/hooks";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DashBoard = () => {
  const { token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  const {data:users,isLoading,error}=useQuery({
    queryKey:["users"],
    queryFn:()=>getUsers(token!);
    enabled:!!token,
  })

  return (
    <div>
      <h1>DashBoARD</h1>
    </div>
  );
};

export default DashBoard;
