import User from "../Model/userModel";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import wishListModel from "../Model/wishListModel";

dotenv.config();

export const login = async (req: Request, res: Response): Promise<any> => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(401).json(error);
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ mesaage: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user?.password as string);

    if (!isMatch) {
      return res.status(401).json({ mesaage: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRETE as string,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_JWT_SECRETE as string,
      { expiresIn: "7h" }
    );

    res.status(200).json({
      token,
      refreshToken,
      data: {
        firstname: user.firstName,
        lastName: user.lastName,
        id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const register = async (req: Request, res: Response): Promise<any> => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(401).json(error);
  }
  try {
    const { firstName, lastName, email, password } = req.body;

    const isEmailExist = await User.findOne({ email });

    if (isEmailExist) {
      return res
        .status(409)
        .json({ message: "Email is Already Exist", isEmailExist: true });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    user.save();

    res.status(200).json({ message: "Data Submitted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { limit, skip } = (req as any).pagination || { limit: 5, skip: 0 };
    let users;
    let total = await User.countDocuments({ role: "user" });

    if (req?.query?.search) {
      users = await User.find({
        firstName: { $regex: req.query.search, $options: "i" },
        role: "user",
      })
        .skip(skip)
        .limit(limit);
      total = users.length;
    } else if (limit || skip) {
      users = await User.find({ role: "user" }).skip(skip).limit(limit);
    } else {
      users = await User.find({ role: "user" });
    }

    res.status(200).json({
      data: users,
      total,
      page: skip / limit + 1,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ data: "Internal Server Error" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id;
  console.log(Boolean(id));

  if (!id) {
    return res.status(404).json({ data: "ID is Not Provided" });
  }
  try {
    await User.findByIdAndDelete(id);

    res.status(200).json({ data: "User Deleted", user: id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ data: "Internal Server Error" });
  }
};

export const searchUser = async (req: Request, res: Response): Promise<any> => {
  try {
    let Users;
    if (req.query.search) {
      Users = await User.find({
        firstName: { $regex: req.query.search, $options: "i" },
        role: "0",
      });
    } else {
      Users = await User.find({ role: "0" });
    }
    res.status(200).json(Users);
  } catch (error) {
    console.log(error);
  }
};

export const getUserData = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userid = req.params.id;
    const user = await User.findById(userid);

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error " });
  }
};

export const addToWishList = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userid, product } = req.body;

    const user = await wishListModel.findOne({ userId: userid });

    if (user) {
      const isProductExist = await wishListModel.findOne({
        userId: userid,
        wishList: { $elemMatch: { productId: product } },
      });

      if (isProductExist) {
        await wishListModel.updateOne({
          userId: userid,
          $pull: { wishList: { productId: product } },
        });
      } else {
        await wishListModel.updateOne({
          userId: userid,
          $push: { wishList: { productId: product } },
        });
      }
    } else {
      const newuser = new wishListModel({
        userId: userid,
        wishList: [{ productId: product }],
      });

      newuser.save();
    }

    res.status(200).json({ message: "Wish List Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getWishListData = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userid = req.params.id;

    const data = await wishListModel
      .findOne({ userId: userid })
      .populate("wishList.productId");

    if (!data) {
      return res.status(200).json([]);
    } else {
      return res.status(200).json(data.wishList);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
