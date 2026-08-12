import User from "../models/user.js";
import bcrypt from "bcrypt";
import { generateToken } from "../config/utils.js";

export const signup = async (req, res) => {
    const { fullname, email, password, bio } = req.body;
    try {
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            fullname,
            email,
            password: hashedPassword,
            bio: bio || "Hi Everyone, I am Using QuickChat",
        });
        const token = generateToken(newUser._id);
        const userResponse = newUser.toObject();
        delete userResponse.password;
        res.status(201).json({ success: true, user: userResponse, Token: token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const userData = await User.findOne({ email });
        if (!userData) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = generateToken(userData._id);
        const userResponse = userData.toObject();
        delete userResponse.password;
        res.status(200).json({ success: true, user: userResponse, Token: token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, profilePic, bio } = req.body;
        const updateData = { fullname, bio };
        if (profilePic) {
            updateData.profilePic = profilePic;
        }
        const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
            new: true,
        }).select("-password");
        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
