import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const utilizationData = [
  { hour: "06:00", utilization: 42 },
  { hour: "09:00", utilization: 68 },
  { hour: "12:00", utilization: 78 },
  { hour: "15:00", utilization: 83 },
  { hour: "18:00", utilization: 74 },
  { hour: "21:00", utilization: 61 }
];

const costMix = [
  { name: "Own", value: 58, fill: "#0f766e" },
  { name: "Agency", value: 28, fill: "#f59e0b" },
  { name: "On-call", value: 14, fill: "#f97316" }
];

export const DashboardCharts = () => (
  <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <p className="text-sm text-slate-500">Utilization trend</p>
        <h3 className="text-lg font-semibold text-slate-900">Vehicle utilization by time slot</h3>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={utilizationData}>
            <defs>
              <linearGradient id="utilizationFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0f766e" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#0f766e" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Area type="monotone" dataKey="utilization" stroke="#0f766e" fill="url(#utilizationFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <p className="text-sm text-slate-500">Cost mix</p>
        <h3 className="text-lg font-semibold text-slate-900">Vehicle source allocation</h3>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={costMix} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3} />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        {costMix.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
              {item.name}
            </span>
            <span>{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
