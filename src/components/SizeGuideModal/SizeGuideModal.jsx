import { useState } from "react";

export default function SizeGuideModal({ isOpen, onClose, onSelectSize }) {
  const [bust, setBust] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [recommendedSize, setRecommendedSize] = useState(null);

  if (!isOpen) return null;

  const calculateSize = (e) => {
    e.preventDefault();
    const b = parseFloat(bust);
    const w = parseFloat(waist);
    const h = parseFloat(hips);

    if (!b || !w || !h) return;

    // Standard sizing logic in inches
    let size = "M";
    if (b <= 33 && w <= 26 && h <= 36) size = "XS";
    else if (b <= 35 && w <= 28 && h <= 38) size = "S";
    else if (b <= 38 && w <= 31 && h <= 41) size = "M";
    else if (b <= 41 && w <= 34 && h <= 44) size = "L";
    else if (b <= 44 && w <= 37 && h <= 47) size = "XL";
    else size = "XXL";

    setRecommendedSize(size);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-display text-lg font-semibold text-ink">
            Interactive Size & Fit Guide
          </h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            ✕
          </button>
        </div>

        <form onSubmit={calculateSize} className="mt-4 space-y-4">
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