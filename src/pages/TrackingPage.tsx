import { getRouteName } from "../lib/optimization";
import type { RouteDefinition, Trip, Vehicle } from "../types/fleet";

export const TrackingPage = ({
  vehicles,
  trips,
  routes
}: {
  vehicles: Vehicle[];
  trips: Trip[];
  routes: RouteDefinition[];
}) => {
  const activeTrips = trips.filter((trip) => trip.status === "running" || trip.status === "planned").slice(0, 6);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Tracking</p>
        <h3 className="text-xl font-semibold text-slate-900">Simulated vehicle movement</h3>

        <div className="mt-6 space-y-4">
          {activeTrips.map((trip) => {
            const vehicle = vehicles.find((item) => item.id === trip.vehicle_id);
            const progress = Math.min(100, vehicle?.last_known_location ?? trip.utilization);

            return (
              <div key={trip.id} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">{getRouteName(trip.route_id, routes)}</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      {vehicle?.label ?? "Awaiting vehicle"} • {trip.status}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase text-slate-600">
                    GPS every 5s
                  </span>
                </div>
                <div className="mt-4 h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-accent to-coral transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Depot</span>
                  <span>{Math.round(progress)}% of route completed</span>
                  <span>Customer</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Visibility</p>
        <h3 className="text-xl font-semibold text-slate-900">Live trip status</h3>
        <div className="mt-6 space-y-3">
          {activeTrips.map((trip) => (
            <div key={trip.id} className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900">{trip.id}</h4>
                <span className="rounded-full bg-white px-3 py-1 text-xs uppercase text-slate-600">
                  {trip.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{getRouteName(trip.route_id, routes)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
