import cors from "cors";
import express from "express";
import { gptRouter } from "./routes/gpt";
import { medicationsRouter } from "./routes/medications";
import bodyParser from "body-parser";
import userRouter from "../routes/userRoutes";

const app = express();

// app.use(bodyParser.urlencoded({extended:true,limit:'35mb',parameterLimit:50000}));
app.use(express.json());
app.use(cors());

// Register routes
app.use("/gpt", gptRouter);
app.use("/medications", medicationsRouter);
app.use("/user", userRouter);

export default router;
