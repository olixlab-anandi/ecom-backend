import { Request, Response } from "express";
import userModel from "../Model/userModel";
import { sendEmail } from "../utils/emailService";
import bcrypt from "bcrypt";

export const sendMail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    const isUserExist = await userModel.findOne({ email });

    if (!isUserExist) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await sendEmail({
      from: "olixlab.50@gmail.com",
      to: "olixlab.3@gmail.com",
      subject: "Email verification",
      text: `Hello ${email}`,
      html: `<p>Your One Time Password is: <h1>${otp}</h1></p>`,
    });

    await userModel.findOneAndUpdate({ email }, { otp: otp });

    setTimeout(async () => {
      await userModel.findOneAndUpdate({ email }, { otp: "" });
    }, 120000);

    res.status(200).json({ message: "Email Sent Succesfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, otp } = req.body;

    const valid = await userModel.findOne({
      email,
      otp,
    });

    if (!valid) {
      return res.status(401).json({ message: "Enter Valid Otp" });
    }

    res.status(200).json({ message: "OTP verified Sucessfully" });
  } catch (error) {}
};

export const resetPass = async (req: Request, res: Response): Promise<any> => {
  try {
    const { password, confirmPassword, email } = req.body;

    if (password === confirmPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);

      await userModel.findOneAndUpdate(
        { email },
        {
          password: hashedPass,
        }
      );
    }

    res.status(200).json({ message: "RESET Password succesfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
