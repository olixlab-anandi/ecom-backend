import { Request, Response } from "express";
import Product from "../Model/productModel";
import path from "path";
import fs from "fs";
import XLSX from "xlsx";

export const addProduct = async (req: Request, res: Response) => {
  try {
    const {
      title,
      price,
      Category,
      subCategory,
      description,
      longDescription,
      discount,
      stock,
    } = req.body;

    const discountObj = JSON.parse(discount);
    const product = new Product({
      title,
      createdAt: Date(),
      subCategory,
      Category,
      description,
      price,
      image: req.file ? req.file.filename : "",
      longDescription,
      discount: discountObj,
      stock: stock ? Number(stock) : 0,
    });
    await product.save();
    res.status(200).json({ message: "Data Submitted" });
  } catch (error) {
    console.log("inside catch block", error);
  }
};

export const uploadExcel = async (req: Request, res: Response) => {
  try {
    const buffer = req.file?.buffer;
    if (!buffer) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Read Excel
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

    const fixToJsonString = (str: string) => str.replace(/'/g, '"');
    const products = data.map((row: any) => ({
      title: row.title,
      price: row.price,
      description: row.description,
      longDescription: row.longDescription,
      discount: JSON.parse(fixToJsonString(row.discount)),
      Category: row.Category,
      subCategory: row.subCategory,
      stock: row.stock ? Number(row.stock) : 0,
      createdAt: new Date(),
      image: row.image,
    }));

    await Product.insertMany(products);
    res.status(200).json({ message: "Upload successful" });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { limit, skip } = (req as any).pagination || { limit: 5, skip: 0 };
    const { search, filter1, filter2, min, max } = req.query;

    //    console.log("search", search, "filter1", filter1, "filter2", filter2, "min", min, "max", max);
    let minPrice = Number(min) || 0;
    let maxPrice = Number(max);
    let products;
    const allproduct = await Product.find({});

    if (!maxPrice) {
      maxPrice = allproduct?.reduce((acc: number, curr) => {
        if (curr?.price && typeof curr.price == "number") {
          acc = acc > Number(curr?.price) ? acc : curr?.price;
        }
        return acc;
      }, 0);
    }
    let total = await Product.countDocuments();

    if (
      filter1 != "undefined" &&
      filter2 != "undefined" &&
      filter1 &&
      filter2
    ) {
      products = await Product.find({
        title: { $regex: search || "", $options: "i" },
        Category: filter1,
        subCategory: filter2,
        price: { $gte: minPrice, $lte: maxPrice },
      })
        .populate("Category", "title") // Only get the 'name' field
        .populate("subCategory", "title")
        .limit(limit)
        .skip(skip);
    } else if (
      filter1 &&
      filter1 != "undefined" &&
      filter2 != "undefined" &&
      !filter2
    ) {
      products = await Product.find({
        title: { $regex: search || "", $options: "i" },
        Category: filter1,
        price: { $gte: minPrice, $lte: maxPrice },
      })
        .populate("Category", "title")
        .populate("subCategory", "title")
        .limit(limit)
        .skip(skip);
    } else {
      products = await Product.find({
        title: { $regex: search || "", $options: "i" },
        price: { $gte: minPrice, $lte: maxPrice },
      })
        .populate("Category", "title")
        .populate("subCategory", "title")
        .limit(limit)
        .skip(skip);
    }
    if (
      !search &&
      !filter1 &&
      !filter2 &&
      min == "undefined" &&
      max == "undefined"
    ) {
      products = await Product.find()
        .populate("Category", "title")
        .populate("subCategory", "title")
        .limit(limit)
        .skip(skip);
    } else {
      total = products.length;
    }

    const mappedProducts = products.map((product: any) => ({
      ...product._doc,
      Category: product.Category?.title || "",
      subCategory: product.subCategory?.title || "",
      CategoryId: product.Category?._id || "",
      subCategoryId: product.subCategory?._id || "",
    }));

    res.status(200).json({
      data: mappedProducts,
      total,
      page: skip / limit + 1,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      title,
      price,
      Category,
      subCategory,
      description,
      longDescription,
      discount,
      stock,
    } = req.body;
    const id = req.params.id;
    const discountObj = JSON.parse(discount);
    if (!id) {
      return res.status(404).json({ message: "ID NOT FOUND" });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        title,
        Category,
        subCategory,
        description,
        price,
        longDescription,
        discount: discountObj,
        image: req.file?.filename,
        stock: stock ? Number(stock) : 0,
      },
      { new: true }
    );

    res
      .status(200)
      .json({ data: product, message: "Data Updated Succesfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  const id = req.params.id;
  const product = await Product.findOne({ _id: id });
  if (product) {
    const { image } = product;
    const imagepath = path.join(__dirname, "..", "uploads", image as string);

    fs.unlink(imagepath, (err) => {
      if (err) {
        console.error("Image delete error:", err.message);
      } else {
        console.log("Image deleted:", imagepath);
      }
    });
  }

  if (!id) {
    return res.status(404).json({ data: "Id Is not provided" });
  }

  await Product.findByIdAndDelete(id);

  res.status(200).json({ data: "product deleted Succesfully", id: id });
};

export const getLatestProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { limit, skip } = (req as any).pagination || { limit: 5, skip: 0 };
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("Category", "title")
      .populate("subCategory", "title");

    const total = await Product.countDocuments();

    res.status(200).json({
      data: products,
      total,
      page: skip / limit + 1,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).json({ message: "ID NOT FOUND" });
    }
    const product = await Product.findById(id)
      .populate("Category", "title")
      .populate("subCategory", "title");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
