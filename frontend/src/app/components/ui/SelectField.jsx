import { ChevronDown } from "lucide-react";

export function SelectField({
  label, value, onChange, opts, accent = false,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-xs font-semibold ${accent ? "text-amber-700" : "text-slate-500"}`}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-white border rounded-md pl-3 pr-7 py-2 text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:border-[#1a56db] transition-colors ${
            accent
              ? "border-amber-200 focus:ring-amber-300/40"
              : "border-[#e2e8f0] focus:ring-[#1a56db]/30"
          }`}
        >
          <option value="">— Pilih —</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown style={{ width: 12, height: 12, position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
      </div>
    </div>
  );
}
