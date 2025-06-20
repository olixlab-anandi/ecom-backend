import express from "express";
import { addOrder, getOrder, removeOrder } from "../Controller/order";

const router = express.Router();

router.post("/order", addOrder);

router.get("/getOrder", getOrder);

router.delete("/removeOrder", removeOrder);

export default router;
