const STYLES = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-teal/10 text-teal-dark",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-teal/10 text-teal-dark",
  cancelled: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-line text-muted";
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}
