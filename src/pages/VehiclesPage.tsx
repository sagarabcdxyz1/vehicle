import { useMemo, useState } from "react";
import { Plus, Trash2, Edit2, X, Check, Phone } from "lucide-react";
import { formatDateTime } from "../lib/utils";
import type { Vehicle, VehicleType } from "../types/fleet";

export const VehiclesPage = ({
  vehicles,
  onAdd,
  onUpdate,
  onDelete
}: {
  vehicles: Vehicle[];
  onAdd: (vehicle: Omit<Vehicle, "id" | "available_at" | "status">) => Promise<void>;
  onUpdate: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [filter, setFilter] = useState<"all" | VehicleType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<Vehicle>>({
    label: "",
    type: "own",
    capacity: 18,
    registration_number: "",
    driver_name: "",
    driver_phone: ""
  });

  const visibleVehicles = useMemo(
    () => vehicles.filter((vehicle) => filter === "all" || vehicle.type === filter),
    [filter, vehicles]
  );

  const resetForm = () => {
    setForm({ label: "", type: "own", capacity: 18, registration_number: "", driver_name: "", driver_phone: "" });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (editingId) {
      await onUpdate(editingId, form);
    } else {
      await onAdd(form as Omit<Vehicle, "id" | "available_at" | "status">);
    }
    resetForm();
  };

  const startEdit = (vehicle: Vehicle) => {
    setForm(vehicle);
    setEditingId(vehicle.id);
    setIsAdding(false);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Fleet Management</p>
          <h3 className="text-xl font-semibold text-slate-900">Vehicles & Drivers</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          {!isAdding && !editingId && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 rounded-2xl bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus size={16} />
              Add Vehicle
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3 min-w-[200px]">Vehicle / Reg #</th>
              <th className="pb-3">Driver Info</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Capacity</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(isAdding || editingId) && (
              <tr className="bg-slate-50/50">
                <td className="py-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Label (e.g. TRK-01)"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    placeholder="Plate # (Registration)"
                    value={form.registration_number}
                    onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
                  />
                </td>
                <td className="py-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Driver Name"
                    value={form.driver_name}
                    onChange={(e) => setForm({ ...form, driver_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    placeholder="Driver Phone"
                    value={form.driver_phone}
                    onChange={(e) => setForm({ ...form, driver_phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
                  />
                </td>
                <td className="py-4">
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as VehicleType })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
                  >
                    <option value="own">Own</option>
                    <option value="agency">Agency</option>
                    <option value="oncall">Oncall</option>
                  </select>
                </td>
                <td className="py-4">
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-20 rounded-xl border border-slate-200 px-2 py-2 text-xs outline-none focus:border-accent"
                  />
                </td>
                <td className="py-4" colSpan={1}></td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={handleSave} className="rounded-xl bg-accent p-2 text-white hover:opacity-90">
                      <Check size={14} />
                    </button>
                    <button onClick={resetForm} className="rounded-xl bg-slate-200 p-2 text-slate-600 hover:bg-slate-300">
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {visibleVehicles.map((vehicle) => (
              <tr key={vehicle.id} className={editingId === vehicle.id ? "opacity-30" : ""}>
                <td className="py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{vehicle.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {vehicle.registration_number || "NO PLATE #"}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700">{vehicle.driver_name || "Unassigned"}</span>
                    {vehicle.driver_phone && (
                      <a 
                        href={`tel:${vehicle.driver_phone}`} 
                        className="flex items-center gap-1 text-[10px] text-accent hover:underline"
                      >
                        <Phone size={10} />
                        {vehicle.driver_phone}
                      </a>
                    )}
                  </div>
                </td>
                <td className="py-4 capitalize text-slate-700">{vehicle.type}</td>
                <td className="py-4 text-slate-700">{vehicle.capacity} t</td>
                <td className="py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-500">
                    {vehicle.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => startEdit(vehicle)}
                      className="p-2 text-slate-400 transition hover:text-accent"
                      title="Edit Vehicle"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => window.confirm("Delete this vehicle?") && onDelete(vehicle.id)}
                      className="p-2 text-slate-400 transition hover:text-red-500"
                      title="Delete Vehicle"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
