/**
 * All prices are stored as integer pesewas (GHS x 100) to avoid floating-point
 * rounding errors. These helpers convert at the display boundary only.
 */

export function formatGHS(pesewas) {
  if (pesewas == null) return "GH₵0.00";
  const cedis = pesewas / 100;
  return `GH₵${cedis.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function cedisToPesewas(cedisString) {
  const value = parseFloat(cedisString);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

export function pesewasToCedisInput(pesewas) {
  if (pesewas == null) return "";
  return (pesewas / 100).toFixed(2);
}
