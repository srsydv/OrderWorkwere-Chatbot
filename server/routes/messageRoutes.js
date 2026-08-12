import express from "express";
import { getUsersForSidebar, getMessages, markMessageAsSeen, sendMessage } from "../controllers/messageController";

const router = express.Router();

router.get("/users", getUsersForSidebar);
router.get("/:id", getMessages);
router.put("/mark-as-seen/:id", markMessageAsSeen);
router.post("/send/:id", sendMessage);
export default router;