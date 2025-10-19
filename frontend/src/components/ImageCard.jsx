import { FiCopy, FiCheck, FiX, FiDownload } from "react-icons/fi";
import { useState } from "react";

export default function ImageCard({ url, name }) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Clean display name (remove timestamp prefix if exists)
  const displayName = name.includes("_") ? name.split("_").slice(1).join("_") : name;
  const truncatedName = displayName.length > 24 ? `${displayName.substring(0, 20)}...` : displayName;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = displayName; // use cleaned name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <>
      {/* Image Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">
        {/* Image preview */}
        <div
          className="aspect-square bg-gray-100 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={url}
            alt={displayName}
            className="w-full h-full object-contain max-h-64 transition-transform duration-200 hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Footer with name, copy & download */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate" title={displayName}>
            {truncatedName}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-200 ${
                copied ? "bg-green-600 text-white hover:bg-green-500" : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-700 text-white rounded-md shadow-sm hover:bg-gray-600 transition-colors duration-200"
            >
              <FiDownload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for preview */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking on image
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition"
            >
              <FiX className="w-6 h-6" />
            </button>

            <img
              src={url}
              alt={displayName}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />

            <p className="mt-2 text-center text-white text-sm truncate">{displayName}</p>
          </div>
        </div>
      )}
    </>
  );
}
