import { useMemo, useState } from "react";
import { formatDateTime } from "../lib/utils";
import type { Vehicle } from "../types/fleet";

export const VehiclesPage = ({ vehicles }: { vehicles: Vehicle[] }) => {
  const [filter, setFilter] = useState<"all" | Vehicle["type"]>("all");
  const visibleVehicles = useMemo(
    () => vehicles.filter((vehicle) => filter === "all" || vehicle.type === filter),
    [filter, vehicles]
  );

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Vehicles</p>
          <h3 className="text-xl font-semibold text-slate-900">Fleet mix and availability</h3>
        </div>
        <div className="flex gap-2">
          {(["all", "own", "agency", "oncall"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                filter === option ? "bg-ink text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Vehicle ID</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Capacity</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Available At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="py-4 font-medium text-slate-900">{vehicle.label}</td>
                <td className="py-4 capitalize text-slate-700">{vehicle.type}</td>
                <td className="py-4 text-slate-700">{vehicle.capacity} t</td>
                <td className="py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase text-slate-600">
                    {vehicle.status}
                  </span>
                </td>
                <td className="py-4 text-slate-700">{formatDateTime(vehicle.available_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
