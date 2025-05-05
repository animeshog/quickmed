import express, { Router } from "express";
import { Register, Login } from "../controllers/userControllers";
import { isAuthanticatedUser } from "../middlewares";
import History from "../models/historySchema";
import User from "../models/userSchema";

const userRouter = Router();

userRouter.post("/register", Register);
userRouter.post("/login", Login); // Add this line to ensure login route exists

userRouter.get("/info", isAuthanticatedUser, async (req: any, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email dob gender height weight bloodGroup createdAt"
    ); // Update selected fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      dob: user.dob,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      bloodGroup: user.bloodGroup,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Failed to fetch user information" });
  }
});

// Add history endpoints
userRouter.get("/chat-history", isAuthanticatedUser, async (req: any, res) => {
  try {
    const history = await History.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(10);

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

export default userRouter;
