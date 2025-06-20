import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./config/db.ts";
import AuthRoutes from "./Routes/authRoutes.ts";
import categoryRoutes from "./Routes/categoryRoutes.ts";
import userRoutes from "./Routes/userRoutes.ts";
import productRoutes from "./Routes/productRoute.ts";
import cartRoutes from "./Routes/cartRoutes.ts";
import { Server } from "socket.io";
import path from "path";
import { createServer } from "http";
import { addOrder, updateStatus } from "./Controller/order.ts";
import forgotPassRoutes from "./Routes/forgotPassRoutes.ts";
import orderRoutes from "./Routes/orderRoutes.ts";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
dotenv.config();

connection();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use("/api/auth", AuthRoutes);
app.use("/api/admin", categoryRoutes);
app.use("/api/admin", userRoutes);
app.use("/api/admin", productRoutes);
app.use("/api", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api", forgotPassRoutes);
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/Women", express.static(path.join(__dirname, "/uploads/Women")));
app.use("/Men", express.static(path.join(__dirname, "/uploads/Men")));
app.use("/Children", express.static(path.join(__dirname, "/uploads/Children")));

const connectedUsers: { [key: string]: Set<any> } = {};

io.on("connection", (socket) => {
  console.log("New client connected");
  let user: Set<any>;
  socket.on("register", (userid) => {
    if (!connectedUsers[userid]) {
      connectedUsers[userid] = new Set();
    }
    connectedUsers[userid].add(socket.id);
    user = connectedUsers[userid];
  });

  socket.on("order", async (data) => {
    await addOrder(data);
    if (user) {
      user.forEach((elm) => {
        io.to(elm).emit("order", data);
      });
    }
    const admin = connectedUsers["682d9adf8d46a5a7bd6d6815"];
    if (admin) {
      admin.forEach((admin) => {
        io.to(admin).emit("order", data);
      });
    }
  });

  socket.on("status", (status) => {
    updateStatus(status.status, status.orderid);
    io.emit("status", status);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(process.env.PORT, () => {
  console.log("Server is running at port 3000");
});
