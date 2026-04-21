import { useState } from "react";
import { Plus, Trash2, Edit2, X, Check, Calendar } from "lucide-react";
import { formatDateTime } from "../lib/utils";
import type { RouteDefinition } from "../types/fleet";

export const RoutesPage = ({
  routes,
  onAdd,
  onUpdate,
  onDelete
}: {
  routes: RouteDefinition[];
  onAdd: (route: RouteDefinition) => Promise<void>;
  onUpdate: (id: string, route: Partial<RouteDefinition>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<RouteDefinition>({
    id: "",
    name: "",
    travel_time: 120,
    load_time: 30,
    unload_time: 30,
    distance_km: 100,
    base_capacity: 18,
    start_date: "",
    end_date: ""
  });

  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      travel_time: 120,
      load_time: 30,
      unload_time: 30,
      distance_km: 100,
      base_capacity: 18,
      start_date: "",
      end_date: ""
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    let finalId = form.id.trim();
    if (!finalId && !editingId) {
      finalId = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (!finalId) finalId = `route-${Math.random().toString(36).slice(2, 7)}`;
    }

    if (editingId) {
      await onUpdate(editingId, form);
    } else {
      await onAdd({ ...form, id: finalId });
    }
    resetForm();
  };

  const startEdit = (route: RouteDefinition) => {
    setForm({
      ...route,
      start_date: route.start_date || "",
      end_date: route.end_date || ""
    });
    setEditingId(route.id);
    setIsAdding(false);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Master Data</p>
          <h3 className="text-xl font-semibold text-slate-900">Route Catalog</h3>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-2xl bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus size={16} />
            Add Route
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Route Details</th>
              <th className="pb-3">Validity Period</th>
              <th className="pb-3">Metrics</th>
              <th className="pb-3">Capacity</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(isAdding || editingId) && (
              <tr className="bg-slate-50/50">
                <td className="py-4 space-y-2">
                  <input
                    type="text"
                    disabled={!!editingId}
                    placeholder="Route ID (e.g. mum-pune)"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
                  />
                </td>
                <td className="py-4 space-y-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Start Date</span>
                    <input
                      type="date"
                      value={form.start_date ? form.start_date.split("T")[0] : ""}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">End Date</span>
                    <input
                      type="date"
                      value={form.end_date ? form.end_date.split("T")[0] : ""}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
                    />
                  </div>
                </td>
                <td className="py-4 space-y-2 text-xs">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="KM"
                      value={form.distance_km}
                      onChange={(e) => setForm({ ...form, distance_km: Number(e.target.value) })}
                      className="w-16 rounded-xl border border-slate-200 px-2 py-2 outline-none focus:border-accent"
                    />
                    <input
                      type="number"
                      placeholder="Mins"
                      value={form.travel_time}
                      onChange={(e) => setForm({ ...form, travel_time: Number(e.target.value) })}
                      className="w-16 rounded-xl border border-slate-200 px-2 py-2 outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <input
                      type="number"
                      placeholder="Load"
                      value={form.load_time}
                      onChange={(e) => setForm({ ...form, load_time: Number(e.target.value) })}
                      className="w-16 rounded-xl border border-slate-200 px-2 py-2 outline-none focus:border-accent"
                    />
                    <input
                      type="number"
                      placeholder="Unload"
                      value={form.unload_time}
                      onChange={(e) => setForm({ ...form, unload_time: Number(e.target.value) })}
                      className="w-16 rounded-xl border border-slate-200 px-2 py-2 outline-none focus:border-accent"
                    />
                  </div>
                </td>
                <td className="py-4">
                  <input
                    type="number"
                    value={form.base_capacity}
                    onChange={(e) => setForm({ ...form, base_capacity: Number(e.target.value) })}
                    className="w-20 rounded-xl border border-slate-200 px-2 py-2 text-xs outline-none focus:border-accent"
                  />
                </td>
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
            {routes.map((route) => (
              <tr key={route.id} className={editingId === route.id ? "opacity-30" : ""}>
                <td className="py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{route.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{route.id}</span>
                  </div>
                </td>
                <td className="py-4 text-slate-600">
                  <div className="flex items-center gap-2 text-[10px] font-medium">
                    <Calendar size={12} className="text-slate-400" />
                    <span>{route.start_date ? formatDateTime(route.start_date).split(",")[0] : "Always Active"}</span>
                    <span className="text-slate-300">→</span>
                    <span>{route.end_date ? formatDateTime(route.end_date).split(",")[0] : "Permanent"}</span>
                  </div>
                </td>
                <td className="py-4 text-slate-700">
                  <div className="flex flex-col">
                    <span className="font-medium">{route.distance_km} km</span>
                    <span className="text-[10px] text-slate-400">{route.travel_time}m (trip) + {route.load_time + route.unload_time}m (L/U)</span>
                  </div>
                </td>
                <td className="py-4 text-slate-700">{route.base_capacity} t</td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => startEdit(route)}
                      className="p-2 text-slate-400 transition hover:text-accent"
                      title="Edit Route"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => window.confirm("Delete this route?") && onDelete(route.id)}
                      className="p-2 text-slate-400 transition hover:text-red-500"
                      title="Delete Route"
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
