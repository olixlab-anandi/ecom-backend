import { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../Model/cartSchema";

export const addToCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const { productId, quantity, userId, price } = req.body;
    if (!productId) {
      return res
        .status(400)
        .json({ message: "Product ID and User ID are required" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ productId: productId, quantity, price }],
        totalPrice: 0,
      });
    } else {
      const productIndex = cart.products.findIndex(
        (p) => p.productId.toString() === productId
      );
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ productId: productId, quantity, price });
      }
    }
    cart.totalPrice = cart.products.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    await cart.save();
    res
      .status(200)
      .json({ message: "Product added to cart successfully", cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Sercer Error" });
  }
};

export const updateQnt = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, productId, quantity } = req.body;

    const isProductExist = await Cart.findOne({
      userId,
      products: { $elemMatch: { productId } },
    });

    if (isProductExist) {
      await Cart.findOneAndUpdate(
        {
          userId,
          products: { $elemMatch: { productId } },
        },
        { $set: { "products.$.quantity": quantity } }
      );
    }

    res.status(200).json({ message: "Quantity Updated " });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Sercer Error" });
  }
};

export const deleteCartItem = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, productId } = req.query;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "User ID and Product ID are required" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products.pull({ productId: productId });
    cart.totalPrice = cart.products.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    await cart.save();
    res
      .status(200)
      .json({ message: "Product removed from cart successfully", productId });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.query;
    const cart = await Cart.findOne({ userId }).populate(
      "products.productId",
      "title image price"
    );
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const clearCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.query;

    await Cart.findOneAndDelete({ userId });

    res.status(200).json({ message: "Cart Is Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
