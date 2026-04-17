import { useState } from "react";
import { Upload } from "lucide-react";
import { formatDateTime } from "../lib/utils";
import { getRouteName } from "../lib/optimization";
import type { Order, RouteDefinition } from "../types/fleet";

export const OrdersPage = ({
  orders,
  routes,
  onAddOrder,
  onUploadCsv,
  onReassign
}: {
  orders: Order[];
  routes: RouteDefinition[];
  onAddOrder: (input: { route_id: string; weight: number; deadline: string; source: "manual" }) => Promise<string>;
  onUploadCsv: (file: File) => Promise<number>;
  onReassign: (orderId: string) => string;
}) => {
  const [form, setForm] = useState({
    route_id: routes[0]?.id ?? "",
    weight: 5,
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });
  const [message, setMessage] = useState("Orders are assigned automatically using route, capacity, and deadline.");

  const saveAndAddNext = async () => {
    const result = await onAddOrder({ ...form, source: "manual" });
    setMessage(result);
    setForm((current) => ({ ...current, weight: 5 }));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.35fr]">
      <section className="space-y-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Manual entry</p>
          <h3 className="text-xl font-semibold text-slate-900">Create order</h3>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Route</span>
              <select
                value={form.route_id}
                onChange={(event) => setForm((current) => ({ ...current, route_id: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent"
              >
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Weight (tons)</span>
              <input
                type="number"
                min="1"
                value={form.weight}
                onChange={(event) => setForm((current) => ({ ...current, weight: Number(event.target.value) }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Deadline</span>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent"
              />
            </label>
            <button
              type="button"
              onClick={() => void saveAndAddNext()}
              className="w-full rounded-2xl bg-ink px-4 py-3 font-medium text-white transition hover:bg-slate-800"
            >
              Save & Add Next
            </button>
          </div>
          <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">{message}</div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">CSV upload</p>
          <h3 className="text-xl font-semibold text-slate-900">Bulk import orders</h3>
          <label className="mt-5 flex cursor-pointer items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-600 transition hover:border-accent hover:text-accent">
            <Upload size={18} />
            <span>Upload CSV with `route, weight, deadline`</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }
                void onUploadCsv(file).then((count) => {
                  setMessage(`${count} orders imported and optimized.`);
                });
              }}
            />
          </label>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Orders</p>
            <h3 className="text-xl font-semibold text-slate-900">Order pool and assignments</h3>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{orders.length} orders</div>
        </div>
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">{getRouteName(order.route_id, routes)}</h4>
                  <p className="mt-1 text-sm text-slate-600">
                    {order.weight} tons - Deadline {formatDateTime(order.deadline)} - Source {order.source}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase text-slate-600">
                    {order.trip_id ?? "unassigned"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMessage(onReassign(order.id))}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Assign to trip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
