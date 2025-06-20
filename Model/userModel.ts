import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    min: 6,
    max: 20,
  },
  role: {
    type: String,
    default: "user",
  },
  otp: {
    type: String,
  },
});

export default mongoose.model("User", userSchema);
