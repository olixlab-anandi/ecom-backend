import mongoose from "mongoose";
import Categories from "./mainCategory";
import SubCategory from "./subCategoryModel";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  Category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Categories,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: SubCategory,
  },
  image: {
    type: String,
    default: "",
  },
  description: {
    type: String,
  },
  longDescription: {
    type: String,
  },
  discount: {
    type: {
      type: String,
      enum: ["percentage", "fixedAmount", ""],
      default: null,
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  stock: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
  },
});

export default mongoose.model("Products", productSchema);
