export function FormField({
  label, placeholder, value, onChange, className = "", accent = false,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className={`text-xs font-semibold ${accent ? "text-amber-700" : "text-slate-500"}`}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`border rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:border-[#1a56db] transition-colors bg-white placeholder-slate-300 ${
          accent
            ? "border-amber-200 focus:ring-amber-300/40"
            : "border-[#e2e8f0] focus:ring-[#1a56db]/30"
        }`}
      />
    </div>
  );
}
