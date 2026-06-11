import express from "express";
import auth from "../controllers/authController.js";
import {
  validateSignUp,
  validateLogin,
} from "../middleware/validationMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", validateSignUp, auth.signUp);
router.post("/signin", validateLogin, auth.signIn);
router.get("/profile/:userId", auth.fetchUserProfile);
router.post("/push-token", authMiddleware, auth.savePushToken);

router.get("/users", authMiddleware, auth.getUsers);

export default router;
