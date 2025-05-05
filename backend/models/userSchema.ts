import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name's the game, innit? Please enter it."],
    maxLength: [30, "Bit too long, that name. Keep it under 30 chars."],
    minLength: [4, "Needs to be at least 4 characters, yeah?"],
  },
  email: {
    type: String,
    required: [true, "Email, please. How else will we spam you?"],
    unique: true,
    validate: [validator.isEmail, "That doesn't look like an email, mate."],
  },
  password: {
    type: String,
    required: [true, "Password's a must. Keep it secret, keep it safe."],
    minLength: [8, "8 characters minimum. Don't want any weak sauce passwords."],
    
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  dob: {
    type: Date,
    required: false, // Optional for now, but you might want to make it required later. Your call, Sir.
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"], // Using lowercase as per your React code. Good show!
    required: false, // Again, your decision.
  },
  height: {
    type: Number,
    min: [0, "Height can't be negative, unless you're a worm."],
    required: false,
  },
  weight: {
    type: Number,
    min: [0, "Weight can't be negative either, unless you're defying physics."],
    required: false,
  },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // Keeping it consistent.
    required: false,
  },
  allergies: {
    type: String,
    required: false, // Optional, as per your React component.
  },
  conditions: {
    type: String,
    required: false, // Also optional.
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

const User = mongoose.model("User", userSchema);
export default User;