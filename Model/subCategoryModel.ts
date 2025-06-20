import mongoose from "mongoose";
import Category from './mainCategory'


const SubCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    categoryName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Category
    },
    thumnail: {
        type: String
    },
    createdAt: {
        type: Date,
        value: Date()
    }
})

export default mongoose.model("SubCategory", SubCategorySchema)