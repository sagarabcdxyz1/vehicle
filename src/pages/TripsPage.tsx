import { formatDateTime, formatPct } from "../lib/utils";
import { getRouteName } from "../lib/optimization";
import type { RouteDefinition, Trip } from "../types/fleet";

export const TripsPage = ({ trips, routes }: { trips: Trip[]; routes: RouteDefinition[] }) => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-5">
    <div className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">Trips</p>
        <h3 className="text-xl font-semibold text-slate-900">Scheduled trip slots</h3>
      </div>
      <p className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{trips.length} active/planned</p>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr>
            <th className="pb-3">Trip ID</th>
            <th className="pb-3">Route</th>
            <th className="pb-3">Start</th>
            <th className="pb-3">End</th>
            <th className="pb-3">Capacity</th>
            <th className="pb-3">Used</th>
            <th className="pb-3">Load</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {trips.map((trip) => (
            <tr key={trip.id}>
              <td className="py-4 font-medium text-slate-900">{trip.id}</td>
              <td className="py-4 text-slate-700">{getRouteName(trip.route_id, routes)}</td>
              <td className="py-4 text-slate-700">{formatDateTime(trip.start_time)}</td>
              <td className="py-4 text-slate-700">{formatDateTime(trip.end_time)}</td>
              <td className="py-4 text-slate-700">{trip.capacity} t</td>
              <td className="py-4 text-slate-700">{trip.used_capacity} t</td>
              <td className="py-4">
                <div className="w-40">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{formatPct(trip.utilization)}</span>
                    <span>{trip.vehicle_type ?? "unassigned"}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${
                        trip.utilization < 70 ? "bg-amberline" : "bg-accent"
                      }`}
                      style={{ width: `${Math.min(100, trip.utilization)}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${
                    trip.status === "running"
                      ? "bg-emerald-100 text-emerald-700"
                      : trip.status === "delayed"
                        ? "bg-red-100 text-red-700"
                        : trip.status === "completed"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {trip.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
