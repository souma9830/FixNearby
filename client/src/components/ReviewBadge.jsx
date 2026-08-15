

export default function ReviewBadge({ rating = 5.0, count = 0 }) {
  let label = "Rising Star";
  let style = "bg-blue-50 text-blue-700 border-blue-100";

  if (rating >= 4.8 && count >= 10) {
    label = "Top Pro";
    style = "bg-amber-50 text-amber-700 border-amber-200 font-bold";
  } else if (rating >= 4.5) {
    label = "Highly Rated";
    style = "bg-green-50 text-green-700 border-green-100";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      ★ {label}
    </span>
  );
}
