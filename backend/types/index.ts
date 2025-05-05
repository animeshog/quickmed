import { Request } from "express";

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  dob?: string;
  gender?: string;
  height?: number;
  weight?: number;
  bloodGroup?: string;
  createdAt: string;
}

export interface CustomRequest extends Request {
  user: UserDocument;
}
