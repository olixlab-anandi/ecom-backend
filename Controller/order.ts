import { Request, Response } from "express";
import Order from "../Model/orderModel";

export const addOrder = async (obj: any): Promise<any> => {
  try {
    const { userId, products, totalPrice } = obj;
    if (!userId || !products || !totalPrice) {
      return {
        status: 400,
        message: "User ID, products, and total price are required",
      };
    }

    const order = new Order({
      userId,
      products,
      totalPrice,
      status: "pending",
      createdAt: new Date(),
    });

    await order.save();
  } catch (error) {
    console.error("Error adding order:", error);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
};

export const getOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const userid = req?.query?.userid;

    let orders;
    if (userid) {
      orders = await Order.find({ userId: userid }).sort({ createdAt: -1 });
    } else {
      orders = await Order.find({});
    }

    res.status(200).json({ data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStatus = async (status: string, orderId: string) => {
  await Order.findOneAndUpdate({ _id: orderId }, { status: status });
};

export const removeOrder = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { orderId, productId } = req.query;

    const order = await Order.findOne({
      _id: orderId,
      products: { $elemMatch: { productId: productId } },
    });

    if (order?.products.length == 1) {
      await Order.findOneAndDelete({
        _id: orderId,
        products: { $elemMatch: { productId: productId } },
      });
    } else {
      await Order.findOneAndUpdate(
        {
          _id: orderId,
        },
        {
          $pull: { products: { productId: productId } },
        }
      );
    }

    console.log(order);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
