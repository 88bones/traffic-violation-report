import { useAppSelector } from "@/redux/hooks";
import React from "react";

const DashBoard = () => {
  const { user } = useAppSelector((state) => state.auth);
  console.log(user);

  return (
    <div>
      <h1>DashBoARD</h1>
    </div>
  );
};

export default DashBoard;
