import { useState } from "react";

export default function LocationInput({ value, onChange, error }) {
  const [touched, setTouched] = useState(false);

  const isValidLocation = (val) => {
    const trimmed = val.trim();
    if (trimmed.length < 2) return false;
    return /^[a-zA-Z\s,.-]+$/.test(trimmed);
  };

  const isInvalid = touched && value.trim().length > 0 && !isValidLocation(value);

  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-gray-600">Location</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="e.g. Accra, Ghana"
        className={`w-full border rounded-xl px-3 py-2 text-sm outline-none transition focus:ring-2 ${
          isInvalid || error
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-200 focus:ring-purple-500"
        }`}
      />
      {isInvalid && (
        <p className="text-xs text-red-500 font-medium">
          Please enter a valid city or region name (at least 2 characters).
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}