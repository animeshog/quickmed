import { Request, Response } from "express";

import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "../schemas/userSchema";
import z from "zod";
import User from "../models/userSchema";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { CustomRequest } from "../types";
dotenv.config();

export async function Register(req: Request, res: Response): Promise<any> {
  try {
    console.log("Received registration data:", req.body); // Debug log

    const parsedData = registerSchema.parse(req.body);

    const { name, email, password, dob, gender, height, weight, bloodGroup } =
      parsedData;

    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({
        message: "User with this email already exists",
        code: "EMAIL_EXISTS",
      });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      dob,
      gender: gender?.toLowerCase(),
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      bloodGroup,
    });

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      return res.status(500).json({
        message: "Server configuration error",
        code: "CONFIG_ERROR",
      });
    }

    const userToken = jwt.sign({ email: user.email }, JWT_SECRET);
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: userToken,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid data format",
        errors: error.errors,
        code: "VALIDATION_ERROR",
      });
    }

    return res.status(500).json({
      message: "Registration failed",
      code: "SERVER_ERROR",
    });
  }
}

export async function Login(req: Request, res: Response): Promise<any> {
  try {
    console.log("Login attempt for:", req.body.email); // Add logging

    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        message: "Email and password are required",
        status: "error",
      });
    }

    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        status: "error",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
        status: "error",
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({
        message: "Server configuration error",
        status: "error",
      });
    }

    const userToken = jwt.sign({ email: user.email }, JWT_SECRET);

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      _id: user._id,
      name: user.name,
      email: user.email,
      token: userToken,
    });
  } catch (error) {
    console.error("Login error details:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors[0].message,
        status: "error",
      });
    }

    return res.status(500).json({
      message: "An error occurred during login",
      status: "error",
    });
  }
}

export async function Info(req: CustomRequest, res: Response): Promise<any> {
  try {
    // Return user info
    return res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      dob: req.user.dob,
      gender: req.user.gender,
      height: req.user.height,
      weight: req.user.weight,
      bloodGroup: req.user.bloodGroup,
      // allergies: req.user.allergies,
      // conditions: req.user.conditions,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token, please login again." });
    }
    console.error("Profile info error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error as string);
  }
}