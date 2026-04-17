import { AlertTriangle, CircleDollarSign, Truck, Waves } from "lucide-react";
import { DashboardCharts } from "../components/charts/DashboardCharts";
import { formatPct } from "../lib/utils";
import type { AlertItem, KPI, Trip, Vehicle } from "../types/fleet";

const buildKpis = (trips: Trip[], vehicles: Vehicle[]): KPI[] => {
  const activeVehicles = vehicles.filter((vehicle) => vehicle.status === "running" || vehicle.status === "assigned");
  const totalCapacity = trips.reduce((sum, trip) => sum + trip.capacity, 0);
  const totalUsed = trips.reduce((sum, trip) => sum + trip.used_capacity, 0);
  const utilization = totalCapacity ? (totalUsed / totalCapacity) * 100 : 0;
  const savings = Math.round(activeVehicles.filter((vehicle) => vehicle.type === "own").length * 1250);

  return [
    { label: "Total Trips Today", value: `${trips.length}`, delta: "+12%" },
    { label: "Vehicle Utilization", value: formatPct(utilization), delta: "+7%" },
    { label: "Active Vehicles", value: `${activeVehicles.length}`, delta: "+4%" },
    { label: "Cost Savings", value: `INR ${savings.toLocaleString("en-IN")}`, delta: "+18%" }
  ];
};

export const DashboardPage = ({
  trips,
  vehicles,
  alerts
}: {
  trips: Trip[];
  vehicles: Vehicle[];
  alerts: AlertItem[];
}) => {
  const kpis = buildKpis(trips, vehicles);
  const icons = [Truck, Waves, CircleDollarSign, AlertTriangle];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-4">
        {kpis.map((item, index) => {
          const Icon = icons[index];
          return (
            <div key={item.label} className="rounded-[28px] border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-accent">
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-accent">{item.delta} vs last shift</p>
            </div>
          );
        })}
      </div>

      <DashboardCharts />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Optimization goals</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Live operating posture</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              ["Own fleet first", "Priority allocation lowers trip cost before agency or on-call vehicles are used."],
              ["70% utilization target", "Trips below threshold are surfaced so planners can consolidate orders."],
              ["Deadline-aware scheduling", "Orders are assigned only when end-time satisfies the delivery deadline."],
              ["Idle reduction", "Idle or available vehicles are surfaced as action alerts for dispatch."]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-3xl bg-slate-50 p-4">
                <h4 className="font-medium text-slate-900">{title}</h4>
                <p className="mt-2 text-sm text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Alerts</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Dispatch attention queue</h3>
          <div className="mt-5 space-y-3">
            {alerts.length ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-3xl border p-4 ${
                    alert.level === "critical"
                      ? "border-red-200 bg-red-50"
                      : alert.level === "warning"
                        ? "border-amber-200 bg-amber-50"
                        : "border-sky-200 bg-sky-50"
                  }`}
                >
                  <h4 className="font-medium text-slate-900">{alert.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{alert.description}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No active alerts right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
