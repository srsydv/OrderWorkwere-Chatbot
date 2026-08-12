import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB();




const app = express();
const server = createServer(app);

app.use(express.json());
app.use("/api/status",(req, res)=> res.send("server is running"));
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);



const io = new Server(server,{
    cors: {
        origin:"*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }
});

export const userSocketMap = {};


io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect", () => {
        console.log("A user disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

});

app.use(
    cors({
    origin:"*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
})
);

app.get("/", (req, res) => {
    res.send("Hello World");
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});