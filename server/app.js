import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

const io = new Server(server,{
    cors: {
        origin:"*",
        methods: ["GET", "POST"],
        credentials: true,
    }
});


io.on("connection", (socket) => {
    console.log("A user connected");
    console.log(socket.id);
    socket.emit("welcome", `Welcome to the chat ${socket.id}`);
    socket.on("message", (message) => {
        console.log("Message from client", message);
        io.emit("message", message);
    });
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

app.use(
    cors({
    origin:"*",
    methods: ["GET", "POST"],
    credentials: true,
})
);

app.get("/", (req, res) => {
    res.send("Hello World");
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});