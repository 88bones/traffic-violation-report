import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const jwtGenerator = (userId: string) => {
  const payload = { user: userId };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
};

export default jwtGenerator;
