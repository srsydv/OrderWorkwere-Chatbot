import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isLogin) {
        await login({ email, password });
        navigate("/");
      } else {
        await signup({ fullname, email, password, bio });
        navigate("/profile");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <img src={assets.logo_icon} alt="QuickChat" className="w-12 h-12 mb-3" />
          <h1 className="text-white text-2xl font-medium">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin ? "Sign in to continue chatting" : "Join QuickChat today"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                className="w-full bg-[#28334D]/80 text-white text-sm placeholder:text-gray-400 rounded-lg py-3 px-4 outline-none border border-white/5 focus:border-purple-500/40"
              />
              <textarea
                placeholder="Bio (optional)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-[#28334D]/80 text-white text-sm placeholder:text-gray-400 rounded-lg py-3 px-4 outline-none border border-white/5 focus:border-purple-500/40 resize-none"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#28334D]/80 text-white text-sm placeholder:text-gray-400 rounded-lg py-3 px-4 outline-none border border-white/5 focus:border-purple-500/40"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-[#28334D]/80 text-white text-sm placeholder:text-gray-400 rounded-lg py-3 px-4 outline-none border border-white/5 focus:border-purple-500/40"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm font-medium py-3 rounded-full transition-colors"
          >
            {submitting ? "Please wait..." : isLogin ? "Login" : "Sign up"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
