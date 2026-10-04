import { useState, useEffect } from "react";

export default function SizeGuideModal({ isOpen, onClose, onSelectSize, category, isFootwear }) {
  const [bust, setBust] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  
  // Footwear specific state
  const [footLength, setFootLength] = useState("");
  const [footUnit, setFootUnit] = useState("cm");

  const [recommendedSize, setRecommendedSize] = useState(null);

  const isShoe = isFootwear || ["sneakers", "footwear", "shoes"].includes(category?.toLowerCase());

  // Reset inputs when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setBust("");
      setWaist("");
      setHips("");
      setFootLength("");
      setRecommendedSize(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const calculateSize = (e) => {
    e.preventDefault();

    if (isShoe) {
      const val = parseFloat(footLength);
      if (!val) return;

      let size = "42"; // Default fallback

      if (footUnit === "cm") {
        if (val <= 23.5) size = "EU 37 (US 6.5)";
        else if (val <= 24.2) size = "EU 38 (US 7.5)";
        else if (val <= 25.0) size = "EU 39 (US 8.5)";
        else if (val <= 25.7) size = "EU 40 (US 9)";
        else if (val <= 26.5) size = "EU 41 (US 9.5)";
        else if (val <= 27.3) size = "EU 42 (US 10)";
        else if (val <= 28.0) size = "EU 43 (US 10.5)";
        else if (val <= 28.8) size = "EU 44 (US 11.5)";
        else size = "EU 45 (US 12)";
      } else {
        // Inches calculation
        if (val <= 9.2) size = "EU 37 (US 6.5)";
        else if (val <= 9.5) size = "EU 38 (US 7.5)";
        else if (val <= 9.8) size = "EU 39 (US 8.5)";
        else if (val <= 10.1) size = "EU 40 (US 9)";
        else if (val <= 10.4) size = "EU 41 (US 9.5)";
        else if (val <= 10.7) size = "EU 42 (US 10)";
        else if (val <= 11.0) size = "EU 43 (US 10.5)";
        else if (val <= 11.3) size = "EU 44 (US 11.5)";
        else size = "EU 45 (US 12)";
      }

      setRecommendedSize(size);
    } else {
      const b = parseFloat(bust);
      const w = parseFloat(waist);
      const h = parseFloat(hips);

      if (!b || !w || !h) return;

      let size = "M";
      if (b <= 33 && w <= 26 && h <= 36) size = "XS";
      else if (b <= 35 && w <= 28 && h <= 38) size = "S";
      else if (b <= 38 && w <= 31 && h <= 41) size = "M";
      else if (b <= 41 && w <= 34 && h <= 44) size = "L";
      else if (b <= 44 && w <= 37 && h <= 47) size = "XL";
      else size = "XXL";

      setRecommendedSize(size);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-display text-lg font-semibold text-ink">
            {isShoe ? "Footwear Size & Fit Guide" : "Apparel Size & Fit Guide"}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            ✕
          </button>
        </div>

        <form onSubmit={calculateSize} className="mt-4 space-y-4">
          {isShoe ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium uppercase text-muted">
                    Foot Length ({footUnit.toUpperCase()})
                  </label>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setFootUnit("cm")}
                      className={`px-2 py-0.5 rounded ${footUnit === "cm" ? "bg-plum text-white font-bold" : "bg-gray-100 text-gray-600"}`}
                    >
                      CM
                    </button>
                    <button
                      type="button"
                      onClick={() => setFootUnit("in")}
                      className={`px-2 py-0.5 rounded ${footUnit === "in" ? "bg-plum text-white font-bold" : "bg-gray-100 text-gray-600"}`}
                    >
                      INCH
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={footLength}
                  onChange={(e) => setFootLength(e.target.value)}
                  placeholder={footUnit === "cm" ? "e.g. 26.5" : "e.g. 10.4"}
                  className="w-full rounded border border-line p-2 text-sm focus:outline-plum"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Measure from the tip of your longest toe to the back of your heel.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium uppercase text-muted">
                  Bust (inches)
                </label>
                <input
                  type="number"
                  value={bust}
                  onChange={(e) => setBust(e.target.value)}
                  placeholder="e.g. 36"
                  className="mt-1 w-full rounded border border-line p-2 text-sm focus:outline-plum"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase text-muted">
                  Waist (inches)
                </label>
                <input
                  type="number"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="e.g. 29"
                  className="mt-1 w-full rounded border border-line p-2 text-sm focus:outline-plum"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase text-muted">
                  Hips (inches)
                </label>
                <input
                  type="number"
                  value={hips}
                  onChange={(e) => setHips(e.target.value)}
                  placeholder="e.g. 40"
                  className="mt-1 w-full rounded border border-line p-2 text-sm focus:outline-plum"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full rounded bg-plum py-2 text-sm font-semibold text-white hover:bg-purple-900"
          >
            Calculate My Size
          </button>
        </form>

        {recommendedSize && (
          <div className="mt-5 rounded bg-canvas p-4 text-center">
            <p className="text-sm text-muted">Your Recommended Size:</p>
            <p className="text-2xl font-bold text-plum">{recommendedSize}</p>
            <button
              onClick={() => {
                onSelectSize(recommendedSize);
                onClose();
              }}
              className="mt-2 text-xs font-semibold text-plum underline"
            >
              Select {recommendedSize} for product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}