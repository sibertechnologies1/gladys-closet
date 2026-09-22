import { useState, useRef } from "react";
import Webcam from "react-webcam";
import { FiCamera, FiUploadCloud, FiX, FiShoppingBag, FiRefreshCw } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../context/CartContext";

export default function VisualSearchModal({ isOpen, onClose }) {
  const [useCamera, setUseCamera] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // "environment" = back, "user" = front
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const webcamRef = useRef(null);
  const { addToCart } = useCart();

  if (!isOpen) return null;

  // Exact facingMode configuration with fallback
  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: facingMode === "environment" ? { exact: "environment" } : "user",
  };

  const toggleCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  // Capture frame directly from webcam feed
  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setImagePreview(imageSrc);
    setUseCamera(false);

    // Convert base64 data to File object
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "scan-capture.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
      });
  };

  const handleSearch = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const { data, error } = await supabase.functions.invoke("visual-search", {
        body: formData,
      });

      if (error) throw error;
      setResults(data?.results || []);
    } catch (err) {
      console.error("Visual Search Error:", err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setResults(null);
    setUseCamera(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
              <FiCamera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Visual Product Search</h3>
              <p className="text-xs text-gray-400">Scan or upload a photo to find matching inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6">
          {/* Live Webcam Scanner View */}
          {useCamera ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-black mb-4">
                <Webcam
                  key={facingMode} // Forces component unmount/remount when camera state changes
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMediaError={(err) => {
                    console.warn("Exact constraints failed, falling back to basic mode", err);
                    // Fallback if device doesn't support { exact: "environment" }
                    if (typeof videoConstraints.facingMode === "object") {
                      setFacingMode("environment");
                    }
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-purple-500/50 rounded-2xl pointer-events-none" />

                {/* Switch Camera Button */}
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="absolute top-3 right-3 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition z-10 shadow-md active:scale-95"
                  title="Switch Camera"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Snap Photo
                </button>
                <button
                  onClick={() => setUseCamera(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : !imagePreview ? (
            <div className="flex flex-col gap-3">
              <label className="border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition">
                <FiUploadCloud className="w-10 h-10 text-purple-600 mb-2" />
                <span className="text-xs font-bold text-gray-700">Click or drag image to upload</span>
                <span className="text-[10px] text-gray-400 mt-1">PNG, JPG or WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSelectedFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setUseCamera(true)}
                className="w-full py-2.5 bg-gray-100 hover:bg-purple-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <FiCamera className="w-4 h-4" /> Scan Product with Camera
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-gray-200 mb-4">
                <img src={imagePreview} alt="Captured product" className="w-full h-full object-cover" />
                <button
                  onClick={handleReset}
                  className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Scanning Inventory..." : "Find Similar Items"}
              </button>
            </div>
          )}

          {/* Results Grid */}
          {results !== null && (
            <div className="mt-6">
              {results.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {results.map((product) => (
                    <div key={product.id} className="bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
                      <img
                        src={product.image_urls?.[0] || "https://via.placeholder.com/150"}
                        alt={product.name}
                        className="w-full aspect-square object-cover rounded-xl mb-2"
                      />
                      <h5 className="text-xs font-bold text-gray-800 line-clamp-1">{product.name}</h5>
                      <p className="text-xs font-black text-purple-600 mt-0.5">
                        GH₵ {(Number(product.price_pesewas) / 100).toFixed(2)}
                      </p>
                      <button
                        onClick={() => addToCart(product)}
                        className="mt-2 w-full py-1 bg-purple-600 text-white text-[11px] font-bold rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500">No matching items found in inventory.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}