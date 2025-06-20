import { Request, Response } from "express"
import dotenv from 'dotenv'
import SubCategory from '../Model/subCategoryModel'
import Category from "../Model/mainCategory"
import fs from 'fs'
import path from 'path'
dotenv.config()

export const addCategory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { title } = req.body

        const isExist = await Category.findOne({ title })

        if (isExist) {
            return res.status(409).json({ data: "Categpory already axist" })
        }

        const category = new Category({
            title: title,
            createdAt: Date()
        })

        await category.save()

        res.status(200).json({ data: "Category Added" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ data: "Internal Server Error" })
    }
}


export const addSubCategory = async (req: Request, res: Response) => {
    try {

        const { title, categoryName } = req.body
        const category = await Category.findOne({ _id: categoryName })
        const imagepath = req.file ? `${category?.title}/${req?.file?.filename}` : null

        const subCategory = new SubCategory({
            title: title,
            categoryName: categoryName,
            thumnail: imagepath
        })

        subCategory.save()

        res.status(200).json({ data: "Sub Category Added" })

    } catch (error) {
        console.log(error)
    }
}


export const getCategory = async (req: Request, res: Response): Promise<any> => {
    try {
        const { limit, skip } = (req as any).pagination || { limit: 5, skip: 0 };
        let category;
        let total = await Category.countDocuments()
        if (req?.query?.search && req.query.search !== "undefined") {
            category = await Category.find({ title: { $regex: req.query.search, $options: 'i' } }).skip(skip).limit(limit)
            total = category.length
        } else {
            category = await Category.find({}).skip(skip).limit(limit)

        }
        res.status(200).json({
            data: category,
            total,
            page: skip / limit + 1,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}


export const getSubCategory = async (req: Request, res: Response): Promise<any> => {

    try {
        const { limit, skip } = (req as any).pagination
        
        let subCategory;
        let total = await SubCategory.countDocuments()
        if (req?.query?.search && req.query.search !== "undefined") {
            subCategory = await SubCategory.find({ title: { $regex: req.query.search, $options: 'i' } }).skip(skip).limit(limit)
            total = subCategory.length
        } else if(limit || skip ) {
            subCategory = await SubCategory.find({}).skip(skip).limit(limit)
        } else {
            subCategory = await SubCategory.find({})    
        }
        res.status(200).json({
            data: subCategory,
            total,
            page: skip / limit + 1,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const deleteCategory = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id
    if (!id) {
        return res.status(404).json({ data: "id not found" })
    }

    await Category.findByIdAndDelete(id)

    res.status(200).json({ data: "Category deleted Succesfully", id: id })
}

export const deleteSubCategory = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id
    const subCategory = await SubCategory.findOne({ _id: id })
    if (subCategory) {
        const { categoryName, thumnail } = subCategory
        const category = await Category.findOne({ _id: categoryName })

        if (thumnail && category) {
            const imagepath = path.join(__dirname, '..', 'uploads', category.title, thumnail as string)
            fs.unlink(imagepath, (err) => {
                if (err) {
                    console.error("Image delete error:", err.message);
                } else {
                    console.log("Image deleted:", imagepath);
                }
            })
        }

    }

    if (!id) {
        return res.status(404).json({ data: "Id Is not provided" })
    }

    await SubCategory.findByIdAndDelete(id)

    res.status(200).json({ data: "Category deleted Succesfully", id: id })
}

export const editCategory = async (req: Request, res: Response): Promise<any> => {
    console.log(req.body, req.params.id)
    const { title } = req.body
    const id = req.params.id

    if (!id) {
        return res.status(404).json({ data: "id is not provided" })
    }
    const category = await Category.findByIdAndUpdate(id, { title: title }, { new: true })

    res.status(200).json({ data: category, message: "Data Updated Succesfully" })
}


export const editSubCategory = async (req: Request, res: Response): Promise<any> => {

    const { title, categoryName } = req.body
    const id = req.params.id

    if (!id) {
        return res.status(404).json({ data: "id is not provided" })
    }
    const subcategory = await SubCategory.findByIdAndUpdate(id, { title: title, categoryName: categoryName, thumnail: req?.file?.filename }, { new: true })

    res.status(200).json({ data: subcategory, message: "Data Updated Succesfully" })
}



