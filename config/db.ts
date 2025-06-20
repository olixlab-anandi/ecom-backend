import mongoose from "mongoose";
const connection = () => {
  try {
    mongoose
      .connect(process.env.MONGO_URL as string)
      .then(() => {
        console.log("Database Connected");
      })
      .catch((error) => {
        console.log("Error in Database Connection", error);
      });
  } catch (error) {
    console.log("Error in Connection", error);
  }
};

export default connection;
