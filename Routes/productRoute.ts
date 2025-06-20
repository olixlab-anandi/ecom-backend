import express from "express";
import auth from "../Middleware/auth";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getLatestProducts,
  getProduct,
  uploadExcel,
} from "../Controller/product";
import multer from "multer";
import { pagination } from "../Middleware/pagination";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./uploads`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadForExcel = multer({
  storage: multer.memoryStorage(),
});
const upload = multer({
  storage,
});

const router = express.Router();

router.post("/addProduct", auth, upload.single("image"), addProduct);

router.post("/upload_excel", uploadForExcel.single("excel"), uploadExcel);

router.get("/getAllProducts", pagination, getAllProducts);

router.post("/editProduct/:id", auth, upload.single("image"), editProduct);

router.delete("/deleteProduct/:id", auth, deleteProduct);

router.get("/latestProducts", pagination, getLatestProducts);

router.get("/getProduct/:id", getProduct);

export default router;
