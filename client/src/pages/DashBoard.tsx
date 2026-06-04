import { useAppSelector } from "@/redux/hooks";
import React from "react";

const DashBoard = () => {
  const { user, token } = useAppSelector((state) => state.auth);

  return (
    <div>
      <h1>DashBoARD</h1>
    </div>
  );
};

export default DashBoard;
