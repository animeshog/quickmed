import { Router, Request, Response } from "express";
import { Register, Login } from "../controllers/userControllers";
import { isAuthanticatedUser } from "../middlewares";
import History from "../models/historySchema";
import User from "../models/userSchema";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    await Register(req, res);
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    await Login(req, res);
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get(
  "/info",
  isAuthanticatedUser,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user._id).select(
        "name email dob gender height weight bloodGroup createdAt"
      );

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
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
  }
);

router.get(
  "/chat-history",
  isAuthanticatedUser,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const history = await History.find({ userId: req.user._id })
        .sort({ date: -1 })
        .limit(10);

      res.status(200).json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  }
);

export default router;
