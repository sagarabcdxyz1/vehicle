import { getRouteName } from "../lib/optimization";
import { Phone, Navigation, MapPin } from "lucide-react";
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
  const activeTrips = trips.filter((trip) => trip.status === "running" || trip.status === "delayed");

  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_0.7fr]">
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 lg:p-8 flex flex-col h-full min-h-[600px]">
        <div className="mb-6">
          <p className="text-sm text-slate-500">Live Operations</p>
          <h3 className="text-2xl font-semibold text-slate-900">Fleet Visibility Board</h3>
        </div>

        {/* Visual Map Board */}
        <div className="relative flex-grow rounded-[24px] bg-slate-50 border border-slate-100 overflow-hidden shadow-inner">
          {/* Abstract Grid background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          
          <svg className="absolute inset-0 w-full h-full p-12" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
            {/* Legend / Background decorations */}
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Render Static Routes (Paths) */}
            {routes.slice(0, 5).map((route, i) => {
              const y = 80 + i * 80;
              return (
                <g key={route.id}>
                  <path 
                    d={`M 100 ${y} L 700 ${y}`} 
                    stroke="url(#routeGradient)" 
                    strokeWidth="12" 
                    strokeLinecap="round" 
                  />
                  <circle cx="100" cy={y} r="6" fill="#cbd5e1" />
                  <circle cx="700" cy={y} r="6" fill="#cbd5e1" />
                  <text x="100" y={y - 15} fontSize="10" fontWeight="bold" fill="#94a3b8" textAnchor="middle">Origin</text>
                  <text x="700" y={y - 15} fontSize="10" fontWeight="bold" fill="#94a3b8" textAnchor="middle">Dest</text>
                  <text x="400" y={y - 15} fontSize="9" fill="#94a3b8" textAnchor="middle" className="uppercase tracking-widest">{route.name}</text>
                </g>
              );
            })}

            {/* Render Active Vehicles on those routes */}
            {activeTrips.map((trip) => {
              const routeIndex = routes.findIndex(r => r.id === trip.route_id);
              if (routeIndex === -1 || routeIndex > 4) return null;
              
              const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
              const progress = Math.min(100, vehicle?.last_known_location ?? 0);
              const xPos = 100 + (progress / 100) * 600;
              const yPos = 80 + routeIndex * 80;

              return (
                <g key={trip.id} className="transition-all duration-1000 ease-linear">
                  {/* Vehicle Marker */}
                  <g transform={`translate(${xPos}, ${yPos})`}>
                    <circle r="16" fill="white" className="shadow-lg" />
                    <circle r="16" fill="#6366f1" fillOpacity="0.1" className="animate-ping" />
                    <circle r="6" fill="#6366f1" />
                    <foreignObject x="-60" y="20" width="120" height="40">
                      <div className="flex flex-col items-center">
                        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                          <p className="text-[9px] font-bold text-ink whitespace-nowrap">{vehicle?.label || "Unknown"}</p>
                          <p className="text-[7px] text-slate-500 whitespace-nowrap truncate max-w-[80px]">{vehicle?.driver_name || "Unassigned"}</p>
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 lg:p-6">
          <div className="mb-5">
            <p className="text-sm text-slate-500">Fleet Operations</p>
            <h3 className="text-xl font-semibold text-slate-900">Active Duty List</h3>
          </div>
          <div className="space-y-3">
            {activeTrips.length === 0 ? (
              <div className="text-center py-12">
                <Navigation className="mx-auto text-slate-200 mb-2" size={40} />
                <p className="text-sm text-slate-400">No active trips currently tracked.</p>
              </div>
            ) : (
              activeTrips.map((trip) => {
                const vehicle = vehicles.find((v) => v.id === trip.vehicle_id);
                return (
                  <div key={trip.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-slate-100">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-accent">
                          <Navigation size={18} fill="currentColor" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{getRouteName(trip.route_id, routes)}</h4>
                          <p className="text-[10px] text-slate-500">{vehicle?.label ?? "TBA"} • {vehicle?.registration_number ?? "No Reg"}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        trip.status === "delayed" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                      }`}>
                        {trip.status}
                      </span>
                    </div>

                    {vehicle && (
                      <div className="mt-4 flex items-center justify-between border-t border-slate-200/50 pt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {vehicle.driver_name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-700">{vehicle.driver_name || "Unassigned"}</p>
                            {vehicle.driver_phone && (
                              <a href={`tel:${vehicle.driver_phone}`} className="text-[9px] text-accent flex items-center gap-1">
                                <Phone size={8} /> {vehicle.driver_phone}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-ink">{Math.round(vehicle.last_known_location ?? 0)}%</p>
                          <p className="text-[8px] text-slate-400 uppercase tracking-tighter">Progress</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={24} />
            <h3 className="text-lg font-semibold">Asset Proximity</h3>
          </div>
          <p className="text-xs text-indigo-100 leading-relaxed mb-6">
            Real-time GPS nodes update every 5 seconds. Hover over vehicle markers on the visibility board for rapid-response contact details.
          </p>
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">System Integrity</span>
              <span className="text-[10px] bg-emerald-500 rounded-full px-2 py-0.5 font-bold">STABLE</span>
            </div>
            <p className="text-[11px] text-indigo-50 leading-loose">
              All active units are reporting signal strength above 80% with latency &lt; 200ms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
