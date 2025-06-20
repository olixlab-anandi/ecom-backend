import express from "express";
import { sendMail, resetPass, verifyOtp } from "../Controller/forgotPass";

const router = express.Router();

router.post("/forgot-password/send-email", sendMail);

router.post("/forgot-password/otp-verify", verifyOtp);

router.post("/forgot-password/password-reset", resetPass);

export default router;
