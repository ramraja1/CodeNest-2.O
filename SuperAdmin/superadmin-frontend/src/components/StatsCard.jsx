export default function StatsCard({ title, value, icon, color = "emerald" }) {
  // Tailwind color mapping:
  const colorClass = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
  }[color] || "bg-gray-100 text-gray-700";

  return (
    <div className={`rounded-2xl shadow flex items-center p-6 gap-4 ${colorClass}`}>
      {icon && <div className="text-3xl">{icon}</div>}
      <div>
        <div className="text-lg font-bold">{value}</div>
        <div className="text-gray-600 text-sm">{title}</div>
      </div>
    </div>
  );
}
