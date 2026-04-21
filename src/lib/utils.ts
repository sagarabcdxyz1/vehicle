export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

export const formatPct = (value: number) => `${Math.round(value)}%`;

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

export const addMinutes = (value: string | Date, minutes: number) => {
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  return new Date(date.getTime() + minutes * 60 * 1000);
};

export const toIso = (value: Date) => value.toISOString();

export const randomId = (prefix: string) =>
  globalThis.crypto?.randomUUID?.() ?? `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export const friendlyId = (id: string | null | undefined, prefix: "TRP" | "ORD") => {
  if (!id) {
    return "unassigned";
  }

  // Handle Supabase UUIDs (8-4-4-4-12)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return `#${prefix}-${id.slice(0, 4).toUpperCase()}`;
  }

  // Handle mock IDs (e.g. trip-1001, order_abc123)
  if (id.includes("-") || id.includes("_")) {
    const parts = id.split(/[-_]/);
    const suffix = parts[parts.length - 1];
    return `#${prefix}-${suffix.toUpperCase()}`;
  }

  return `#${prefix}-${id.slice(0, 4).toUpperCase()}`;
};
