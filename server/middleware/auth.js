import { verifyToken } from "../config/utils.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};

export const checkAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { fullname, profilePic, bio } = req.body;
        if(!profilePic) {
            updatedUser = await User.findByIdAndUpdate(req.user._id, { fullname, bio }, { new: true });
        } else {
            updatedUser = await User.findByIdAndUpdate(req.user._id, { fullname, profilePic, bio }, { new: true });
        }
        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};