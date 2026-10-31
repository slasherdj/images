import { FiCopy, FiCheck, FiX, FiDownload, FiExternalLink } from "react-icons/fi";
import { useState } from "react";

export default function ImageCard({ url, name, darkMode }) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Clean display name (remove extension and timestamp prefix if exists)
  const cleanName = name ? name.replace(/\.[^/.]+$/, "") : "image";
  const displayName = cleanName.includes("_") ? cleanName.split("_").slice(1).join("_") : cleanName;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${displayName || "download"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`group rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between ${
          darkMode
            ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:-translate-y-1"
            : "bg-white border-neutral-200 hover:border-neutral-300 hover:-translate-y-1"
        }`}
      >
        {/* Preview image */}
        <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-3">
          <img
            src={url}
            alt={displayName}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition">
            View
          </span>
        </div>

        {/* Card info & quick actions */}
        <div className={`p-3 border-t flex items-center justify-between gap-2 ${darkMode ? "border-neutral-800" : "border-neutral-100"}`}>
          <p className="text-xs font-semibold truncate flex-1" title={displayName}>
            {displayName}
          </p>

          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleCopy}
              title={copied ? "Copied URL!" : "Copy image URL"}
              className={`p-2 rounded-lg text-xs transition shadow-sm ${
                copied
                  ? "bg-emerald-600 text-white"
                  : darkMode
                  ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleDownload}
              title="Download image"
              className={`p-2 rounded-lg text-xs transition shadow-sm ${
                darkMode
                  ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              <FiDownload className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={`relative max-w-4xl w-full rounded-2xl border p-4 shadow-2xl flex flex-col ${
              darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-sm font-semibold truncate max-w-md">{displayName}</span>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs inline-flex items-center gap-1"
                >
                  <FiExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full</span>
                </a>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image */}
            <div className="max-h-[72vh] flex items-center justify-center overflow-hidden rounded-xl bg-neutral-950/20 p-2">
              <img src={url} alt={displayName} className="max-h-[68vh] w-auto object-contain rounded-lg shadow-sm" />
            </div>

            {/* Modal Actions */}
            <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-400 truncate max-w-sm font-mono text-[11px]">{url}</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition flex items-center gap-1.5"
                >
                  {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Link"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition flex items-center gap-1.5"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
