import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userSchema";
dotenv.config();

export const isAuthanticatedUser = async(req: any, res: any, next: any) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided, please login first." });
    }

    const token = authHeader.split(" ")[1];
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is not defined in the environment variables.",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    if (!decoded.email) {
      return res
        .status(401)
        .json({ message: "Invalid token, please login again." });
    }
    // Find the user by email
    const user = await User.findOne({ email: decoded.email }).select(
      "-password"
    ); // Exclude password from response
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found, something's fishy." });
    }
    req.user = user;
    next();
  } catch (e) {
    console.error("Authentication error:", e);
    return res.status(401).json({
      message: "Invalid token, please login again.",
    });
  }
};
