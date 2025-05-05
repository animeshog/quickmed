import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  symptoms: [
    {
      type: String,
      default: [],
    },
  ],
  diagnosis: {
    type: String,
    default: "",
  },
  treatment: {
    type: String,
    default: "",
  },
  medications: {
    type: String,
    default: "",
  },
  homeRemedies: {
    type: String,
    default: "",
  },
  fileAnalysis: {
    type: String,
    default: "",
  },
});

export default mongoose.model("History", historySchema);
