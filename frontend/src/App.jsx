import { useState, useEffect, useMemo } from "react";
import { getUploadedImages, uploadImage, getProfile } from "./api";
import ImageCard from "./components/ImageCard";
import AuthModal from "./components/AuthModal";
import {
  FiUploadCloud,
  FiImage,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiRefreshCw,
  FiEdit3,
  FiTrash2,
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiLock
} from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Toggle Theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Check auth & fetch user profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getProfile()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, []);

  // Fetch images whenever user state changes
  useEffect(() => {
    if (user) {
      fetchImages();
    } else {
      setImages([]);
    }
  }, [user]);

  // Cleanup object URLs on unmount or file change
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setImages([]);
    setFiles([]);
  };

  const fetchImages = async () => {
    if (!localStorage.getItem("token")) return;
    setFetchLoading(true);
    setError("");
    try {
      const fetchedImages = await getUploadedImages();
      const fullUrls = (fetchedImages || []).map((img) =>
        img.startsWith("http") ? img : `${BACKEND_URL}/${img}`
      );
      setImages(fullUrls);
    } catch (err) {
      console.error("Fetch images error:", err);
      if (err.message && err.message.includes("authorized")) {
        handleLogout();
        setIsAuthModalOpen(true);
      } else {
        setError("Unable to load images. Please check if the server is connected.");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle file selection (input or drop)
  const processFiles = (selectedFiles) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles = Array.from(selectedFiles).map((file) => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      preview: URL.createObjectURL(file),
      extension: file.name.split(".").pop(),
      size: (file.size / 1024).toFixed(1), // in KB
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Remove single selected file
  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(files[index].preview);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Update file name
  const handleNameChange = (index, newName) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name: newName };
      return updated;
    });
  };

  // Upload all staged files
  const handleUpload = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (files.length === 0) return setError("Please select at least one file to upload");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const uploadedUrls = [];

      for (let fileObj of files) {
        const fileName = `${fileObj.name}.${fileObj.extension}`;
        const data = await uploadImage(fileObj.file, fileName);

        if (!data.url) throw new Error("Upload failed, no URL returned");
        uploadedUrls.push(data.url.startsWith("http") ? data.url : `${BACKEND_URL}/${data.url}`);
      }

      setImages((prev) => [...uploadedUrls, ...prev]);
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setEditMode(false);
      setSuccess(`Successfully uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""} to your account!`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setEditMode(false);
  };

  // Search filter
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    return images.filter((url) => {
      const fileName = url.split("/").pop().toLowerCase();
      return fileName.includes(searchQuery.toLowerCase());
    });
  }, [images, searchQuery]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}`}>
      {/* Top Navbar */}
      <header className={`border-b sticky top-0 z-30 backdrop-blur-md ${darkMode ? "bg-neutral-900/80 border-neutral-800" : "bg-white/80 border-neutral-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FiImage className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">slasherdj-images</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Secure Cloud Image Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${darkMode ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-neutral-100"}`}>
                  <FiUser className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className={`p-2 rounded-lg border text-red-500 transition ${darkMode ? "border-neutral-800 hover:bg-neutral-800" : "border-neutral-200 hover:bg-neutral-100"}`}
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition shadow-sm flex items-center gap-1.5"
              >
                <FiLock className="w-3.5 h-3.5" /> Sign In
              </button>
            )}

            <button
              onClick={() => fetchImages()}
              disabled={fetchLoading || !user}
              title="Refresh Gallery"
              className={`p-2 rounded-lg border transition ${darkMode ? "border-neutral-800 hover:bg-neutral-800 text-neutral-300" : "border-neutral-200 hover:bg-neutral-100 text-neutral-700"}`}
            >
              <FiRefreshCw className={`w-4 h-4 ${fetchLoading ? "animate-spin text-blue-500" : ""}`} />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Theme"
              className={`p-2 rounded-lg border transition ${darkMode ? "border-neutral-800 hover:bg-neutral-800 text-yellow-400" : "border-neutral-200 hover:bg-neutral-100 text-neutral-700"}`}
            >
              {darkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upload Hub */}
        <section className={`rounded-2xl border p-6 shadow-sm transition-all ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                darkMode
                  ? "border-neutral-700 hover:border-blue-500 bg-neutral-950/40 hover:bg-neutral-950/80"
                  : "border-neutral-300 hover:border-blue-500 bg-neutral-50 hover:bg-blue-50/30"
              }`}
              onClick={() => {
                if (!user) setIsAuthModalOpen(true);
                else document.getElementById("file-input").click();
              }}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-neutral-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-inner">
                <FiUploadCloud className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-base mb-1">
                {user ? "Drag & Drop images here" : "Sign in to upload images"}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                {user ? "Supports PNG, JPG, GIF, WebP up to 10MB each" : "Authentication protects uploads and isolates your gallery"}
              </p>
              <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition shadow-sm">
                {user ? "Browse Files" : "Sign In to Upload"}
              </span>
            </div>

            {/* Controls & Batch Actions */}
            <div className="lg:w-80 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FiLayers className="w-4 h-4 text-blue-500" /> Upload Options
                </h4>

                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition ${
                  darkMode ? "border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/50" : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"
                }`}>
                  <input
                    type="checkbox"
                    checked={editMode}
                    onChange={(e) => setEditMode(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-neutral-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-semibold block">Edit names before upload</span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Rename files before sending to Cloudinary</span>
                  </div>
                  <FiEdit3 className="w-4 h-4 text-neutral-400" />
                </label>
              </div>

              {files.length > 0 && (
                <div className={`p-4 rounded-xl border space-y-3 ${darkMode ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-neutral-50"}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {files.length} file{files.length !== 1 ? "s" : ""} staged
                    </span>
                    <button
                      onClick={handleClearAll}
                      className="text-red-500 hover:text-red-600 font-medium inline-flex items-center gap-1"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 animate-spin" /> Uploading to Cloudinary...
                      </>
                    ) : (
                      `Upload ${files.length} File${files.length > 1 ? "s" : ""}`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Staged File Previews & Name Editor */}
          {files.length > 0 && (
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Staged Previews {editMode && "(Click on name to rename)"}
                </span>
                <span className="text-xs text-neutral-400">{files.length} ready</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className={`group relative rounded-xl border overflow-hidden p-2 flex flex-col justify-between ${
                      darkMode ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 mb-2">
                      <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow hover:bg-red-500 transition opacity-80 group-hover:opacity-100"
                        title="Remove file"
                      >
                        <FiXCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {editMode ? (
                      <input
                        type="text"
                        value={file.name}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        className={`w-full text-[11px] px-2 py-1 rounded border outline-none font-medium ${
                          darkMode
                            ? "bg-neutral-900 border-neutral-700 text-white focus:border-blue-500"
                            : "bg-white border-neutral-300 text-neutral-900 focus:border-blue-500"
                        }`}
                        placeholder="File name"
                      />
                    ) : (
                      <p className="text-[11px] font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                      <span>.{file.extension}</span>
                      <span>{file.size} KB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback alerts */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <FiXCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </section>

        {/* Gallery Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Your Gallery</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {user ? `${images.length} image${images.length !== 1 ? "s" : ""} in your collection` : "Sign in to view your gallery"}
              </p>
            </div>

            {/* Search Input */}
            {user && (
              <div className="relative w-full sm:w-72">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search images by name..."
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition ${
                    darkMode
                      ? "bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-blue-500"
                      : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 shadow-sm"
                  }`}
                />
              </div>
            )}
          </div>

          {!user ? (
            <div className={`text-center py-16 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200"}`}>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-blue-400">
                <FiLock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base mb-1">Authentication Required</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 max-w-sm mx-auto">
                Please sign in to upload new images, view your private gallery, or manage your media.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition shadow-sm"
              >
                Sign In or Register
              </button>
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredImages.map((url) => {
                const name = url.split("/").pop();
                return <ImageCard key={url} url={url} name={name} darkMode={darkMode} />;
              })}
            </div>
          ) : (
            <div className={`text-center py-16 rounded-2xl border ${darkMode ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-neutral-200"}`}>
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                <FiImage className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm mb-1">
                {searchQuery ? "No matching images found" : "No images uploaded yet"}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {searchQuery ? "Try a different search keyword." : "Upload your first file above to populate the gallery."}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
        darkMode={darkMode}
      />
    </div>
  );
}
