import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";
import { useAuth } from "../context/AuthContext.jsx";

const ProfilePage = () => {
  const { authUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [fullname, setFullname] = useState(authUser?.fullname || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");
  const [preview, setPreview] = useState(authUser?.profilePic || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateProfile({
        fullname,
        bio,
        ...(profilePic && profilePic !== authUser?.profilePic
          ? { profilePic }
          : {}),
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="opacity-70 hover:opacity-100"
          >
            <img src={assets.arrow_icon} alt="Back" className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-white text-xl font-medium">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview || assets.avatar_icon}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover ring-2 ring-purple-500/30"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-purple-400 text-sm hover:text-purple-300"
            >
              Change photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <input
            type="text"
            placeholder="Full name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
            className="w-full bg-[#28334D]/80 text-white text-sm placeholder:text-gray-400 rounded-lg py-3 px-4 outline-none border border-white/5 focus:border-purple-500/40"
          />

          <textarea
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-[#28334D]/80 text-white text-sm placeholder:text-gray-400 rounded-lg py-3 px-4 outline-none border border-white/5 focus:border-purple-500/40 resize-none"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm font-medium py-3 rounded-full transition-colors"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
