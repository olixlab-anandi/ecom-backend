import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import connection from "./config/db.ts";
import AuthRoutes from "./Routes/authRoutes.ts";
import categoryRoutes from "./Routes/categoryRoutes.ts";
import userRoutes from "./Routes/userRoutes.ts";
import productRoutes from "./Routes/productRoute.ts";
import cartRoutes from "./Routes/cartRoutes.ts";
import forgotPassRoutes from "./Routes/forgotPassRoutes.ts";
import orderRoutes from "./Routes/orderRoutes.ts";
import { addOrder, updateStatus } from "./Controller/order.ts";

dotenv.config();
connection();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN || "http://localhost:5173",
  },
});

// ──────────────────────────────────────────────────────────
// ••• MIDDLEWARE •••
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// ••• API Request Logger (Manual Logging) •••
app.use((req, res, next) => {
  console.log(`\n[API REQUEST] ${req.method} ${req.originalUrl}`);
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    console.log("[API BODY]", req.body);
  }
  next();
});

// ──────────────────────────────────────────────────────────
// ••• ROUTES •••
app.use("/api/auth", AuthRoutes);
app.use("/api/admin", categoryRoutes);
app.use("/api/admin", userRoutes);
app.use("/api/admin", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", forgotPassRoutes);
app.use("/api/order", orderRoutes);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/Women", express.static(path.join(__dirname, "/uploads/Women")));
app.use("/Men", express.static(path.join(__dirname, "/uploads/Men")));
app.use("/Children", express.static(path.join(__dirname, "/uploads/Children")));

// ──────────────────────────────────────────────────────────
// ••• SOCKET.IO •••
type UserMap = Record<string, Set<string>>;
const connectedUsers: UserMap = {};

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  let userSockets: Set<string>;

  socket.on("register", (userId: string) => {
    console.log(`[Socket] Registered user ${userId} with socket ${socket.id}`);
    if (!connectedUsers[userId]) {
      connectedUsers[userId] = new Set();
    }
    connectedUsers[userId].add(socket.id);
    userSockets = connectedUsers[userId];
  });

  socket.on("order", async (data) => {
    console.log("[Socket] Order placed:", data);
    await addOrder(data);

    userSockets?.forEach((id) => io.to(id).emit("order", data));

    const adminSockets = connectedUsers["682d9adf8d46a5a7bd6d6815"];
    adminSockets?.forEach((adminId) => io.to(adminId).emit("order", data));
  });

  socket.on("status", (status) => {
    console.log("[Socket] Status update received:", status);
    updateStatus(status.status, status.orderid);
    io.emit("status", status);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ──────────────────────────────────────────────────────────
// ••• START SERVER •••
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`\n🚀 Server is running at port ${PORT}`);
});
