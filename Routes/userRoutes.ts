import express from "express";
import auth from "../Middleware/auth";
import {
  deleteUser,
  getUsers,
  searchUser,
  getUserData,
  addToWishList,
  getWishListData,
} from "../Controller/user";
const router = express.Router();

router.get("/getUsers", auth, getUsers);

router.delete("/deleteUser/:id", auth, deleteUser);

router.get("/searchUser", auth, searchUser);

router.get("/getUserData/:id", getUserData);

router.post("/addToWishList", auth, addToWishList);

router.get("/getWishListData/:id", auth, getWishListData);

export default router;
