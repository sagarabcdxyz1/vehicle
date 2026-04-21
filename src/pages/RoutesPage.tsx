import { useState } from "react";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";
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
    base_capacity: 18
  });

  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      travel_time: 120,
      load_time: 30,
      unload_time: 30,
      distance_km: 100,
      base_capacity: 18
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
    setForm(route);
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
              <th className="pb-3">ID / Code</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Distance</th>
              <th className="pb-3">Time (Mins)</th>
              <th className="pb-3">Load/Unload</th>
              <th className="pb-3">Base Capacity</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(isAdding || editingId) && (
              <tr className="bg-slate-50/50">
                <td className="py-2">
                  <input
                    type="text"
                    disabled={!!editingId}
                    placeholder="Route ID (e.g. mum-pune)"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-accent"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={form.distance_km}
                    onChange={(e) => setForm({ ...form, distance_km: Number(e.target.value) })}
                    className="w-20 rounded-xl border border-slate-200 px-2 py-2 text-xs outline-none focus:border-accent"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={form.travel_time}
                    onChange={(e) => setForm({ ...form, travel_time: Number(e.target.value) })}
                    className="w-20 rounded-xl border border-slate-200 px-2 py-2 text-xs outline-none focus:border-accent"
                  />
                </td>
                <td className="py-2">
                  <div className="flex gap-1">
                    <input
                      type="number"
                      placeholder="Load"
                      value={form.load_time}
                      onChange={(e) => setForm({ ...form, load_time: Number(e.target.value) })}
                      className="w-14 rounded-xl border border-slate-200 px-2 py-2 text-xs outline-none focus:border-accent"
                    />
                    <input
                      type="number"
                      placeholder="Unload"
                      value={form.unload_time}
                      onChange={(e) => setForm({ ...form, unload_time: Number(e.target.value) })}
                      className="w-14 rounded-xl border border-slate-200 px-2 py-2 text-xs outline-none focus:border-accent"
                    />
                  </div>
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    value={form.base_capacity}
                    onChange={(e) => setForm({ ...form, base_capacity: Number(e.target.value) })}
                    className="w-20 rounded-xl border border-slate-200 px-2 py-2 text-xs outline-none focus:border-accent"
                  />
                </td>
                <td className="py-2 text-right">
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
                <td className="py-4 font-mono text-xs font-medium text-slate-500">{route.id}</td>
                <td className="py-4 font-medium text-slate-900">{route.name}</td>
                <td className="py-4 text-slate-700">{route.distance_km} km</td>
                <td className="py-4 text-slate-700">{route.travel_time}m</td>
                <td className="py-4 text-slate-700">
                  {route.load_time}m / {route.unload_time}m
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
