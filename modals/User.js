const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: Buffer, required: true },
    role: { type: String, required: true, default: "user" },
    salt: Buffer,
    resetPasswordToken: { type: String, default: "" },
    verificationCode: { type: String, default: "" },
    verificationCodeExpires: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
