import multer from "multer";
import Category from "../Model/mainCategory";
import express from "express";
import {
  addSubCategory,
  deleteCategory,
  deleteSubCategory,
  editCategory,
  editSubCategory,
  getSubCategory,
} from "../Controller/category";
import { addCategory } from "../Controller/category";
import auth from "../Middleware/auth";
import { getCategory } from "../Controller/category";
import { pagination } from "../Middleware/pagination";

const router = express.Router();
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const categpry = await Category.findOne({ _id: req?.body?.categoryName });

    cb(null, `./uploads/${categpry?.title}`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
});

router.post("/addCategory", auth, upload.none(), addCategory);

router.get("/getMainCategory", pagination, getCategory);

router.delete("/deleteCategory/:id", auth, deleteCategory);

router.patch("/editCategory/:id", auth, upload.none(), editCategory);

router.post("/addSubCategory", auth, upload.single("thumnail"), addSubCategory);

router.get("/getSubCategory", pagination, getSubCategory);

router.delete("/deleteSubcategory/:id", auth, deleteSubCategory);

router.patch(
  "/editSubCategory/:id",
  auth,
  upload.single("thumnail"),
  editSubCategory
);

export default router;
