import mongoose from "mongoose";

const passwordHistorySchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  passwordHash: { type: String, required: true },
  createdAt:    { type: Date, default: Date.now },
});

const PasswordHistory = mongoose.model("PasswordHistory", passwordHistorySchema);

export default PasswordHistory;