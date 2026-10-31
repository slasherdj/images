import { useState } from "react";
import { FiLock, FiMail, FiUser, FiArrowRight, FiImage, FiXCircle } from "react-icons/fi";
import { loginUser, registerUser } from "../api";

export default function AuthModal({ isOpen, onClose, onAuthSuccess, darkMode }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        if (!name.trim()) throw new Error("Please enter your name");
        data = await registerUser(name, email, password);
      } else {
        data = await loginUser(email, password);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all ${
          darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/25">
          <FiImage className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-center mb-1">
          {isRegister ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mb-6">
          {isRegister
            ? "Sign up to store, manage, and protect your cloud images"
            : "Sign in to access and upload your images"}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <FiXCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border outline-none font-medium transition ${
                    darkMode
                      ? "bg-neutral-950 border-neutral-800 text-white focus:border-blue-500"
                      : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-blue-500"
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border outline-none font-medium transition ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-blue-500"
                    : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-blue-500"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border outline-none font-medium transition ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-blue-500"
                    : "bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-blue-500"
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>{isRegister ? "Already have an account?" : "Don't have an account?"}</span>{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-blue-500 font-semibold hover:underline"
          >
            {isRegister ? "Sign In" : "Register now"}
          </button>
        </div>
      </div>
    </div>
  );
}

