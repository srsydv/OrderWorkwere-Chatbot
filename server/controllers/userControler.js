import User from "../models/user.js";
import bcrypt from "bcrypt";
import { generateToken, verifyToken } from "../config/utils.js";


export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;
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
        const newUser = await User.create({ fullname, email, password: hashedPassword });
        const token = generateToken(newUser._id);
        res.status(201).json({ user: newUser, Token:token });
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
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = generateToken(userData._id);
        res.status(200).json({ user: userData, Token:token });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};