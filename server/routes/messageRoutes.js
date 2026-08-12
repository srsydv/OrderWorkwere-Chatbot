import express from "express";
import {
  getUsersForSidebar,
  getMessages,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.put("/mark-as-seen/:id", protectRoute, markMessageAsSeen);
router.post("/send/:id", protectRoute, sendMessage);

export default router;
