import { useState, useEffect } from "react";
import { getUploadedImages } from "./api";
import ImageCard from "./components/ImageCard";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  // Fetch uploaded images
  useEffect(() => {
    fetchImages();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const fetchImages = async () => {
    try {
      const fetchedImages = await getUploadedImages();
      const fullUrls = fetchedImages.map((img) =>
        img.startsWith("http") ? img : `${BACKEND_URL}/${img}`
      );
      setImages(fullUrls);
    } catch (err) {
      console.error("Fetch images error:", err);
      setError("Failed to fetch images");
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const newFiles = selectedFiles.map((file) => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for editing
      preview: URL.createObjectURL(file),
      extension: file.name.split('.').pop()
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = ""; // Reset input to allow selecting same files again
  };

  // Remove selected file
  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(files[index].preview);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Update file name
  const handleNameChange = (index, newName) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        name: newName
      };
      return updated;
    });
  };

  // Upload all files
  const handleUpload = async () => {
    if (files.length === 0) return setError("Please select files to upload");

    setLoading(true);
    setError("");
    try {
      const uploadedUrls = [];

      for (let fileObj of files) {
        const formData = new FormData();
        formData.append("file", fileObj.file);
        
        // Include the edited name with extension if backend supports it
        const fileName = `${fileObj.name}.${fileObj.extension}`;
        formData.append("name", fileName);

        const res = await fetch(`${BACKEND_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Upload failed");
        }

        const data = await res.json();
        if (!data.url) throw new Error("Upload failed, no URL returned");

        uploadedUrls.push(data.url.startsWith("http") ? data.url : `${BACKEND_URL}/${data.url}`);
      }

      setImages((prev) => [...uploadedUrls, ...prev]);
      // Cleanup object URLs
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setEditMode(false);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Clear all selected files
  const handleClearAll = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Image Manager</h1>
          <p className="text-gray-600">Upload, manage, and share your images</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left Side - Controls */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Upload Images</h2>
                
                {/* File Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Edit Mode Toggle */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="edit-mode"
                    checked={editMode}
                    onChange={(e) => setEditMode(e.target.checked)}
                    className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <label htmlFor="edit-mode" className="ml-2 text-sm text-gray-700 font-medium">
                    Edit file names before upload
                  </label>
                </div>

                {/* File Count and Actions */}
                {files.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {files.length} file{files.length !== 1 ? 's' : ''} selected
                        </span>
                        {!editMode && (
                          <p className="text-xs text-gray-600 mt-1">
                            Enable edit mode to preview and rename files
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Clear all
                      </button>
                    </div>

                    {!editMode && (
                      <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </span>
                        ) : (
                          `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Preview (Only in edit mode) */}
            {editMode && files.length > 0 && (
              <div className="lg:w-2/3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-900">Preview & Edit Names</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {files.length} file{files.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* File Previews Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-1">
                  {files.map((file, index) => (
                    <div key={index} className="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                      {/* Image Preview */}
                      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                        <img 
                          src={file.preview} 
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-md"
                      >
                        ×
                      </button>

                      {/* File Name Input */}
                      <div className="p-3">
                        <input
                          value={file.name}
                          onChange={(e) => handleNameChange(index, e.target.value)}
                          className="w-full text-sm text-gray-900 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="File name"
                        />
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 truncate">
                            .{file.extension}
                          </span>
                          <span className="text-xs text-gray-400">
                            {Math.round(file.file.size / 1024)}KB
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Button for Edit Mode */}
                {editMode && files.length > 0 && (
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleUpload}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </span>
                      ) : (
                        `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`
                      )}
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 text-red-600 text-sm font-medium bg-red-50 px-4 py-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Image Gallery */}
        <div>
          {images.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Uploaded Images ({images.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((url) => {
                  const name = url.split("/").pop();
                  return <ImageCard key={url} url={url} name={name} />;
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl border border-gray-200 p-12 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No images yet</h3>
                <p className="text-gray-600 mb-6">Upload your first images to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}