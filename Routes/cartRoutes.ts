import express from "express";
import auth from "../Middleware/auth";
import {
  addToCart,
  clearCart,
  deleteCartItem,
  getCart,
  updateQnt,
} from "../Controller/cart";

const router = express.Router();

router.post("/cart", auth, addToCart);

router.patch("/updateQnt", auth, updateQnt);

router.delete("/deleteCartItem", auth, deleteCartItem);

router.get("/getAllCartItems", auth, getCart);

router.delete("/clearCart", auth, clearCart);

export default router;
