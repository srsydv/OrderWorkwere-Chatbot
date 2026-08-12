import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    
    email: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    profilePic: {
        type: String,
        default: "https://via.placeholder.com/150",
    },
    bio: {
        type: String,
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;