import mongoose from "mongoose";

const wishListSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  wishList: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
      },
    },
  ],
});

export default mongoose.model("wishList", wishListSchema);
